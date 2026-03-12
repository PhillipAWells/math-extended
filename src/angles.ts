const DEGREES_PER_HALF_REVOLUTION = 180;
const DEGREES_PER_FULL_REVOLUTION = 360;
const ANGLE_FRACTION_TOLERANCE = 0.0001;
const ANGLE_MAX_DENOMINATOR = 12;
const NORMALIZE_EPSILON = 1e-10; // Epsilon for floating-point boundary cleanup

/**
 * Converts degrees to radians
 * @param degrees - Angle in degrees
 * @returns Angle in radians
 *
 * @example
 * DegreesToRadians(180)  // Math.PI
 * DegreesToRadians(90)   // Math.PI / 2
 * DegreesToRadians(0)    // 0
 */
export function DegreesToRadians(degrees: number): number {
	return (degrees * Math.PI) / DEGREES_PER_HALF_REVOLUTION;
}

/**
 * Converts radians to degrees
 * @param radians - Angle in radians
 * @returns Angle in degrees
 *
 * @example
 * RadiansToDegrees(Math.PI)     // 180
 * RadiansToDegrees(Math.PI / 2) // 90
 * RadiansToDegrees(0)           // 0
 */
export function RadiansToDegrees(radians: number): number {
	return (radians * DEGREES_PER_HALF_REVOLUTION) / Math.PI;
}

/**
 * Formats an angle in radians to a string representation in terms of π
 * @param radians - Angle in radians
 * @returns String representation of the angle
 *
 * @example
 * FormatRadians(0)             // '0'
 * FormatRadians(Math.PI)       // 'π'
 * FormatRadians(Math.PI / 2)   // 'π/2'
 * FormatRadians(Math.PI / 4)   // 'π/4'
 * FormatRadians(-Math.PI)      // '-π'
 */
export function FormatRadians(radians: number): string {
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
		if (n === 0) continue;        // zero already handled
		if (n % d === 0) continue;    // integer multiple of π — fall through to fallback
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
 * @example
 * NormalizeRadians(3 * Math.PI)  // Math.PI  (wraps around)
 * NormalizeRadians(-Math.PI)     // Math.PI  (negative angles normalized)
 * NormalizeRadians(0)            // 0
 */
export function NormalizeRadians(radians: number): number {
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
 * @example
 * NormalizeDegrees(450)   // 90  (wraps around 360°)
 * NormalizeDegrees(-90)   // 270 (negative angles normalized)
 * NormalizeDegrees(0)     // 0
 * NormalizeDegrees(360 - 1e-11) // 0  (boundary epsilon snap)
 */
export function NormalizeDegrees(degrees: number): number {
	const result = ((degrees % DEGREES_PER_FULL_REVOLUTION) + DEGREES_PER_FULL_REVOLUTION) % DEGREES_PER_FULL_REVOLUTION;
	// Epsilon cleanup for floating-point precision at boundaries (mirrors NormalizeRadians)
	if (result < NORMALIZE_EPSILON || result > DEGREES_PER_FULL_REVOLUTION - NORMALIZE_EPSILON) return 0;
	return result;
}
