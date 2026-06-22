import { BaseError, type TErrorMetadata } from '@pawells/typescript-common';
import { Clamp } from './clamp.js';
import { EPSILON } from './constants.js';

/**
 * Scalar error metadata type for error context.
 */
type TScalarErrorMetadata = TErrorMetadata & {
	readonly code: string;
};

/**
 * Scalar error class for domain-specific validation failures and scalar operations.
 * Extends Error to provide detailed error information with optional cause chain.
 *
 * @example
 * ```typescript
 * throw new ScalarError('Invalid interval: a cannot equal b', { cause: originalError });
 * ```
 */
export class ScalarError extends BaseError<TScalarErrorMetadata> {
	/**
	 * Enumeration of scalar operation error codes for classification and debugging.
	 *
	 * - `SCALAR_ERROR` — General scalar validation or operation failure
	 */
	public static readonly Code = Object.freeze({
		SCALAR_ERROR: 'SCALAR_ERROR'
	} as const);

	/**
	 * Creates a new ScalarError instance with a code, message, and optional cause chain.
	 *
	 * The error extends BaseError to provide structured error classification and cause chain propagation.
	 * The code property is accessible via the `Code` getter (inherited from BaseError).
	 * The cause chain is accessible via the `Cause` getter (inherited from BaseError).
	 * Error metadata (code, cause) is accessible via the `Metadata` getter (inherited from BaseError).
	 *
	 * @param message - Human-readable error message describing the scalar operation failure
	 * @param options - Optional configuration object
	 * @param options.cause - Original error to chain for root cause analysis
	 *
	 * @example
	 * ```typescript
	 * // Degenerate interval
	 * throw new ScalarError('InverseLerp: a cannot equal b (degenerate interval)');
	 *
	 * // With cause chain
	 * try {
	 *   // attempt operation
	 * } catch (originalError) {
	 *   throw new ScalarError('Scalar operation failed', { cause: originalError });
	 * }
	 * ```
	 */
	constructor(message: string, options?: { cause?: Error }) {
		super(message, {
			code: ScalarError.Code.SCALAR_ERROR,
			cause: options?.cause
		});
	}
}

/**
 * Inverse linear interpolation: finds t such that Lerp(a, b, t) = value.
 * Solves for t in the equation: value = a + (b - a) * t.
 *
 * @param a - Start value
 * @param b - End value
 * @param value - Target value
 * @returns Interpolation parameter t
 * @throws {ScalarError} If a === b (degenerate interval with no unique inverse)
 * @throws {RangeError} If a, b, or value are not finite numbers
 *
 * @example
 * ```typescript
 * InverseLerp(0, 10, 5)  // 0.5
 * InverseLerp(0, 10, 0)  // 0
 * InverseLerp(0, 10, 10) // 1
 * InverseLerp(5, 5, 5)   // throws ScalarError (degenerate interval)
 * ```
 */
export function InverseLerp(a: number, b: number, value: number): number {
	if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(value)) {
		throw new RangeError('InverseLerp: a, b, and value must be finite numbers');
	}
	if (a === b) {
		throw new ScalarError('InverseLerp: a cannot equal b (degenerate interval)');
	}
	return (value - a) / (b - a);
}

/**
 * Remaps a value from one range to another.
 * Maps value from [inMin, inMax] to [outMin, outMax] using linear interpolation.
 *
 * @param value - Value to remap
 * @param inMin - Input range minimum
 * @param inMax - Input range maximum
 * @param outMin - Output range minimum
 * @param outMax - Output range maximum
 * @returns Remapped value
 * @throws {ScalarError} If inMin === inMax (degenerate input interval)
 * @throws {RangeError} If any argument is not a finite number
 *
 * @example
 * ```typescript
 * Remap(0.5, 0, 1, 0, 10)     // 5 (map [0,1] to [0,10])
 * Remap(50, 0, 100, 0, 360)   // 180 (map percentages to degrees)
 * Remap(-1, -1, 1, 0, 1)      // 0 (map [-1,1] to [0,1])
 * ```
 */
export function Remap(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
	if (!Number.isFinite(value) || !Number.isFinite(inMin) || !Number.isFinite(inMax) || !Number.isFinite(outMin) || !Number.isFinite(outMax)) {
		throw new RangeError('Remap: all arguments must be finite numbers');
	}
	if (inMin === inMax) {
		throw new ScalarError('Remap: inMin cannot equal inMax (degenerate input interval)');
	}
	const t = (value - inMin) / (inMax - inMin);
	return outMin + (outMax - outMin) * t;
}

/**
 * Moves a value towards a target by at most maxDelta.
 * Returns current if within maxDelta of target, otherwise moves by maxDelta in the direction of target.
 *
 * @param current - Current value
 * @param target - Target value
 * @param maxDelta - Maximum step size
 * @returns New value moved towards target
 * @throws {RangeError} If any argument is not a finite number
 *
 * @example
 * ```typescript
 * MoveTowards(0, 10, 3)  // 3 (moved by 3 towards 10)
 * MoveTowards(0, 10, 20) // 10 (target reached)
 * MoveTowards(10, 0, 2)  // 8 (moved by 2 towards 0)
 * ```
 */
export function MoveTowards(current: number, target: number, maxDelta: number): number {
	if (!Number.isFinite(current) || !Number.isFinite(target) || !Number.isFinite(maxDelta)) {
		throw new RangeError('MoveTowards: current, target, and maxDelta must be finite numbers');
	}
	const delta = target - current;
	if (Math.abs(delta) <= maxDelta) return target;
	return current + (delta > 0 ? maxDelta : -maxDelta);
}

/**
 * True Euclidean modulo operation where the result sign follows the divisor.
 * Unlike JavaScript's built-in %, this always returns a non-negative result when n > 0.
 *
 * @param a - Dividend
 * @param n - Divisor (modulus)
 * @returns Remainder in the range [0, n) if n > 0, or (n, 0] if n < 0
 * @throws {RangeError} If n === 0 (division by zero) or if a or n are not finite numbers
 *
 * @remarks
 * JavaScript's % operator can return negative results (e.g., -5 % 3 = -2).
 * This function returns true Euclidean modulo: -5 mod 3 = 1.
 *
 * @example
 * ```typescript
 * Mod(5, 3)   // 2
 * Mod(-5, 3)  // 1 (positive remainder when divisor is positive)
 * Mod(5, -3)  // -1 (negative remainder when divisor is negative)
 * Mod(-5, -3) // -2
 * ```
 */
export function Mod(a: number, n: number): number {
	if (!Number.isFinite(a) || !Number.isFinite(n)) {
		throw new RangeError('Mod: a and n must be finite numbers');
	}
	if (n === 0) {
		throw new RangeError('Mod: n cannot be zero (division by zero)');
	}
	const result = a % n;
	const normalized = (result * n < 0) ? result + n : result;
	// Normalize -0 to +0
	return normalized === 0 ? 0 : normalized;
}

/**
 * Wraps a value into the range [0, length).
 * Useful for cyclic/periodic values like angles or animation time.
 *
 * @param t - Value to wrap
 * @param length - Period length
 * @returns Value wrapped into [0, length)
 * @throws {RangeError} If length <= 0 or if t or length are not finite numbers
 *
 * @example
 * ```typescript
 * Repeat(7, 5)   // 2 (7 mod 5)
 * Repeat(-3, 5)  // 2 (wraps negative values)
 * Repeat(0.5, 1) // 0.5 (already in range)
 * ```
 */
export function Repeat(t: number, length: number): number {
	if (!Number.isFinite(t) || !Number.isFinite(length)) {
		throw new RangeError('Repeat: t and length must be finite numbers');
	}
	if (length <= 0) {
		throw new RangeError('Repeat: length must be positive');
	}
	const mod = Mod(t, length);
	return mod < 0 ? mod + length : mod;
}

/**
 * Oscillates a value between 0 and length using a ping-pong (triangular wave) pattern.
 * The value bounces back and forth: 0 → length → 0 → length → ...
 *
 * @param t - Input value (typically time)
 * @param length - Maximum value (half-period of oscillation)
 * @returns Oscillating value in [0, length]
 * @throws {RangeError} If length <= 0 or if t or length are not finite numbers
 *
 * @remarks
 * For t in [0, length]: returns t.
 * For t in [length, 2*length]: returns 2*length - t.
 * For t >= 2*length: pattern repeats with period 2*length.
 *
 * @example
 * ```typescript
 * PingPong(0.5, 1)  // 0.5 (first half, ascending)
 * PingPong(1.5, 1)  // 0.5 (second half, descending: 2 - 1.5)
 * PingPong(2.5, 1)  // 0.5 (repeats: same as 0.5)
 * ```
 */
export function PingPong(t: number, length: number): number {
	if (!Number.isFinite(t) || !Number.isFinite(length)) {
		throw new RangeError('PingPong: t and length must be finite numbers');
	}
	if (length <= 0) {
		throw new RangeError('PingPong: length must be positive');
	}
	const cycle = Repeat(t, length * 2);
	return cycle > length ? (length * 2) - cycle : cycle;
}

/**
 * Checks if two values are approximately equal within a tolerance.
 * Returns true if |a - b| <= epsilon.
 *
 * @param a - First value
 * @param b - Second value
 * @param epsilon - Tolerance (default: EPSILON = 1e-10)
 * @returns True if values are within tolerance, false otherwise
 *
 * @remarks
 * This function does not throw; it returns false if any argument is not finite (NaN, Infinity).
 *
 * @example
 * ```typescript
 * Approximately(0.1 + 0.2, 0.3)           // true (using default EPSILON)
 * Approximately(1.0001, 1.0, 0.001)       // true (within tolerance)
 * Approximately(1.1, 1.0, 0.01)           // false (outside tolerance)
 * Approximately(Number.NaN, 0, 0.1)       // false (NaN is never approximately equal)
 * ```
 */
export function Approximately(a: number, b: number, epsilon = EPSILON): boolean {
	if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(epsilon)) {
		return false;
	}
	return Math.abs(a - b) <= epsilon;
}

/**
 * Clamps a value to [0, 1].
 * Convenience function for Clamp(value, 0, 1).
 *
 * @param value - Value to clamp
 * @returns Value clamped to [0, 1]
 *
 * @example
 * ```typescript
 * Clamp01(0.5)  // 0.5
 * Clamp01(-0.5) // 0
 * Clamp01(1.5)  // 1
 * ```
 */
export function Clamp01(value: number): number {
	return Clamp(value, 0, 1);
}

/**
 * Returns the sign of a number: -1 for negative, 0 for zero (including -0), or 1 for positive.
 * Handles edge cases: Sign(0) === 0 and Sign(-0) === 0.
 *
 * @param value - Value to get sign of
 * @returns -1 (negative), 0 (zero or -zero), or 1 (positive)
 *
 * @example
 * ```typescript
 * Sign(5)  // 1
 * Sign(-5) // -1
 * Sign(0)  // 0
 * Sign(-0) // 0
 * ```
 */
export function Sign(value: number): -1 | 0 | 1 {
	// Handle the case where value is -0 (1/(-0) = -Infinity)
	if (Object.is(value, -0)) return 0;
	if (value > 0) return 1;
	if (value < 0) return -1;
	return 0;
}

/**
 * Rounds a value to the nearest multiple of a step size.
 * Returns the nearest multiple of step that is closest to value.
 *
 * @param value - Value to round
 * @param step - Step size (quantization unit)
 * @returns Value rounded to nearest step multiple
 * @throws {RangeError} If step <= 0 or if value or step are not finite numbers
 *
 * @example
 * ```typescript
 * RoundToNearest(3.7, 1)   // 4
 * RoundToNearest(3.2, 1)   // 3
 * RoundToNearest(3.14, 0.1) // 3.1
 * RoundToNearest(3.14, 0.01) // 3.14
 * ```
 */
export function RoundToNearest(value: number, step: number): number {
	if (!Number.isFinite(value) || !Number.isFinite(step)) {
		throw new RangeError('RoundToNearest: value and step must be finite numbers');
	}
	if (step <= 0) {
		throw new RangeError('RoundToNearest: step must be positive');
	}
	return Math.round(value / step) * step;
}

/**
 * Greatest common divisor of two integers using Euclidean algorithm.
 * Works with absolute values; Gcd(0,0) = 0.
 *
 * @param a - First integer
 * @param b - Second integer
 * @returns Greatest common divisor as a non-negative integer
 * @throws {RangeError} If a or b is not an integer
 *
 * @example
 * ```typescript
 * Gcd(12, 18)  // 6
 * Gcd(0, 5)    // 5
 * Gcd(7, 7)    // 7
 * ```
 */
export function Gcd(a: number, b: number): number {
	if (!Number.isInteger(a)) {
		throw new RangeError('Gcd: a must be an integer');
	}
	if (!Number.isInteger(b)) {
		throw new RangeError('Gcd: b must be an integer');
	}
	a = Math.abs(a);
	b = Math.abs(b);
	while (b !== 0) {
		const temp = b;
		b = a % b;
		a = temp;
	}
	return a;
}

/**
 * Least common multiple of two integers.
 * Computed as |a * b| / Gcd(a, b); returns 0 if either argument is 0.
 *
 * @param a - First integer
 * @param b - Second integer
 * @returns Least common multiple as a non-negative integer
 * @throws {RangeError} If a or b is not an integer
 *
 * @example
 * ```typescript
 * Lcm(4, 6)   // 12
 * Lcm(0, 5)   // 0
 * Lcm(7, 7)   // 7
 * ```
 */
export function Lcm(a: number, b: number): number {
	if (!Number.isInteger(a)) {
		throw new RangeError('Lcm: a must be an integer');
	}
	if (!Number.isInteger(b)) {
		throw new RangeError('Lcm: b must be an integer');
	}
	if (a === 0 || b === 0) {
		return 0;
	}
	return Math.abs(a / Gcd(a, b) * b);
}

/**
 * Factorial of a non-negative integer.
 * Returns n! = n × (n-1) × ... × 1; 0! = 1.
 *
 * @param n - Non-negative integer
 * @returns Factorial of n
 * @throws {RangeError} If n is negative or not an integer
 *
 * @example
 * ```typescript
 * Factorial(0)  // 1
 * Factorial(5)  // 120
 * Factorial(10) // 3628800
 * ```
 */
export function Factorial(n: number): number {
	if (!Number.isInteger(n)) {
		throw new RangeError('Factorial: n must be an integer');
	}
	if (n < 0) {
		throw new RangeError('Factorial: n must be non-negative');
	}
	let result = 1;
	for (let i = 2; i <= n; i++) {
		result *= i;
	}
	return result;
}

/**
 * Generates count evenly spaced values from start to stop (inclusive).
 * Both start and stop are always included; the last element is exactly stop.
 *
 * @param start - Start value (first element)
 * @param stop - Stop value (last element, exact)
 * @param count - Number of values to generate (non-negative integer)
 * @returns Array of evenly spaced values; empty if count is 0
 * @throws {RangeError} If count is negative or not an integer
 *
 * @example
 * ```typescript
 * Linspace(0, 1, 5)     // [0, 0.25, 0.5, 0.75, 1]
 * Linspace(0, 1, 0)     // []
 * Linspace(0, 1, 1)     // [0]
 * Linspace(0, 10, 3)    // [0, 5, 10]
 * ```
 */
export function Linspace(start: number, stop: number, count: number): number[] {
	if (!Number.isInteger(count)) {
		throw new RangeError('Linspace: count must be an integer');
	}
	if (count < 0) {
		throw new RangeError('Linspace: count must be non-negative');
	}
	if (count === 0) {
		return [];
	}
	if (count === 1) {
		return [start];
	}
	const result: number[] = [];
	for (let i = 0; i < count; i++) {
		result.push(start + (stop - start) * (i / (count - 1)));
	}
	result[count - 1] = stop;
	return result;
}

/**
 * Generates an array of numbers in a half-open range [start, stop) with a given step.
 * Supports positive and negative step; returns empty array if step points away from stop.
 *
 * @param start - Start value (inclusive)
 * @param stop - Stop value (exclusive)
 * @param step - Step size (default: 1; must not be 0)
 * @returns Array of values from start towards stop by step
 * @throws {RangeError} If step is 0
 *
 * @example
 * ```typescript
 * Range(0, 5)           // [0, 1, 2, 3, 4]
 * Range(0, 1, 0.25)     // [0, 0.25, 0.5, 0.75]
 * Range(5, 0, -1)       // [5, 4, 3, 2, 1]
 * Range(0, 5, -1)       // [] (step points away from stop)
 * Range(0, 5, 0)        // throws RangeError
 * ```
 */
export function Range(start: number, stop: number, step = 1): number[] {
	if (step === 0) {
		throw new RangeError('Range: step cannot be zero');
	}
	const result: number[] = [];
	if (step > 0) {
		for (let i = start; i < stop; i += step) {
			result.push(i);
		}
	}
	else {
		for (let i = start; i > stop; i += step) {
			result.push(i);
		}
	}
	return result;
}
