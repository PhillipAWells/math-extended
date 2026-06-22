import { EPSILON } from './constants.js';

const DEGREES_PER_HALF_REVOLUTION = 180;
const DEGREES_PER_FULL_REVOLUTION = 360;
const ANGLE_FRACTION_TOLERANCE = 0.0001;
const ANGLE_MAX_DENOMINATOR = 12;
const NORMALIZE_EPSILON = EPSILON; // Epsilon for floating-point boundary cleanup

/**
 * Converts degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 *
 * @example
 * ```typescript
 * DegreesToRadians(180)  // Math.PI
 * DegreesToRadians(90)   // Math.PI / 2
 * DegreesToRadians(0)    // 0
 * ```
 */
import { AssertNumber } from './internal/guards.js';

export function DegreesToRadians(degrees: number): number {
	return (degrees * Math.PI) / DEGREES_PER_HALF_REVOLUTION;
}

/**
 * Converts radians to degrees
 * @param radians - Angle in radians
 * @returns Angle in degrees
 *
 * @example
 * ```typescript
 * RadiansToDegrees(Math.PI)     // 180
 * RadiansToDegrees(Math.PI / 2) // 90
 * RadiansToDegrees(0)           // 0
 * ```
 */
export function RadiansToDegrees(radians: number): number {
	return (radians * DEGREES_PER_HALF_REVOLUTION) / Math.PI;
}

/**
 * Formats an angle in radians to a string representation in terms of π
 * @param radians - Angle in radians
 * @returns String representation of the angle
 *
 * @throws {Error} If radians is not finite (NaN or Infinity)
 * @example
 * ```typescript
 * FormatRadians(0)             // '0'
 * FormatRadians(Math.PI)       // 'π'
 * FormatRadians(Math.PI / 2)   // 'π/2'
 * FormatRadians(Math.PI / 4)   // 'π/4'
 * FormatRadians(-Math.PI)      // '-π'
 * ```
 */
export function FormatRadians(radians: number): string {
	AssertNumber(radians, { finite: true });
	const r = radians / Math.PI;

	if (r === 0) return '0';
	if (r === 1) return 'π';
	if (r === -1) return '-π';

	const absR = Math.abs(r);
	const sign = r < 0 ? '-' : '';

	// Try to express |r| as n/d for d in [2, ANGLE_MAX_DENOMINATOR].
	// Iterating from the smallest denominator first ensures reduced fractions
	// are returned (e.g., π/2 is found at d=2 before 2π/4 would be at d=4).
	for (let d = 2; d <= ANGLE_MAX_DENOMINATOR; d++) {
		const n = Math.round(absR * d);
		if (n === 0) continue; // zero already handled
		if (n % d === 0) continue; // integer multiple of π — fall through to fallback
		if (Math.abs(absR - n / d) < ANGLE_FRACTION_TOLERANCE) {
			return n === 1 ? `${sign}π/${d}` : `${sign}${n}π/${d}`;
		}
	}

	return `${r}π`;
}

/**
 * Normalizes an angle in radians to be between 0 and 2π
 * @param radians - Angle in radians
 * @returns Normalized angle in radians in the range [0, 2π)
 *
 * @throws {Error} If radians is not finite (NaN or Infinity)
 * @example
 * ```typescript
 * NormalizeRadians(3 * Math.PI)  // Math.PI  (wraps around)
 * NormalizeRadians(-Math.PI)     // Math.PI  (negative angles normalized)
 * NormalizeRadians(0)            // 0
 * ```
 */
export function NormalizeRadians(radians: number): number {
	AssertNumber(radians, { finite: true });
	const twoPi = 2 * Math.PI;
	const result = ((radians % twoPi) + twoPi) % twoPi;
	// Epsilon cleanup for floating-point precision at boundaries
	if (result < NORMALIZE_EPSILON || result > twoPi - NORMALIZE_EPSILON) return 0;
	return result;
}

/**
 * Normalizes an angle in degrees to be between 0 and 360.
 * Applies a floating-point epsilon cleanup so values within `1e-10` of 0 or 360
 * are snapped to exactly 0, matching the behaviour of `NormalizeRadians`.
 * @param degrees - Angle in degrees
 * @returns Normalized angle in degrees in the range [0°, 360°)
 *
 * @throws {Error} If degrees is not finite (NaN or Infinity)
 * @example
 * ```typescript
 * NormalizeDegrees(450)   // 90  (wraps around 360°)
 * NormalizeDegrees(-90)   // 270 (negative angles normalized)
 * NormalizeDegrees(0)     // 0
 * NormalizeDegrees(360 - 1e-11) // 0  (boundary epsilon snap)
 * ```
 */
export function NormalizeDegrees(degrees: number): number {
	AssertNumber(degrees, { finite: true });
	const result = ((degrees % DEGREES_PER_FULL_REVOLUTION) + DEGREES_PER_FULL_REVOLUTION) % DEGREES_PER_FULL_REVOLUTION;
	// Epsilon cleanup for floating-point precision at boundaries (mirrors NormalizeRadians)
	if (result < NORMALIZE_EPSILON || result > DEGREES_PER_FULL_REVOLUTION - NORMALIZE_EPSILON) return 0;
	return result;
}

/**
 * Wraps an angle in radians to the half-open range (-π, π]
 * @param radians - Angle in radians
 * @returns Wrapped angle in radians in the range (-π, π]
 *
 * @throws {Error} If radians is not finite (NaN or Infinity)
 * @example
 * ```typescript
 * WrapAngle(0)                    // 0
 * WrapAngle(Math.PI)              // Math.PI
 * WrapAngle(-Math.PI)             // Math.PI (wraps to positive side)
 * WrapAngle(2 * Math.PI)          // 0 (wraps around)
 * WrapAngle(3 * Math.PI)          // Math.PI
 * WrapAngle(3.5)                  // ~-2.783 (wrapped to range)
 * ```
 */
export function WrapAngle(radians: number): number {
	AssertNumber(radians, { finite: true });
	const twoPi = 2 * Math.PI;
	let result = radians;
	// Reduce to approximately [-π, π] range using modulo
	result = result % twoPi;
	// Adjust to be in the range (-π, π]
	if (result > Math.PI)
		result -= twoPi;
	else if (result <= -Math.PI)
		result += twoPi;
	return result;
}

/**
 * Calculates the shortest signed angular difference from one angle to another in radians
 * @param from - Starting angle in radians
 * @param to - Target angle in radians
 * @returns The shortest signed angular difference in the range (-π, π]
 *
 * @throws {Error} If either angle is not finite (NaN or Infinity)
 * @example
 * ```typescript
 * DeltaAngle(0, 0)                       // 0
 * DeltaAngle(0, Math.PI / 2)             // Math.PI / 2
 * DeltaAngle(Math.PI, -Math.PI)          // 0 (shortest path, same angle)
 * DeltaAngle(3.0, -3.0)                  // ~0.283 (shortest path wraps around)
 * DeltaAngle(0, 2 * Math.PI)             // 0 (wraps around to same angle)
 * ```
 */
export function DeltaAngle(from: number, to: number): number {
	AssertNumber(from, { finite: true });
	AssertNumber(to, { finite: true });
	return WrapAngle(to - from);
}
