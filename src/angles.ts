const DEGREES_PER_HALF_REVOLUTION = 180;
const DEGREES_PER_FULL_REVOLUTION = 360;
const ANGLE_FRACTION_DENOMINATOR_3 = 3;
const ANGLE_FRACTION_DENOMINATOR_6 = 6;
const ANGLE_FRACTION_QUARTER = 0.25;
const ANGLE_FRACTION_THREE_QUARTERS = 0.75;
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

	// Handle common fractions of π
	const fractions = [
		{ value: 1 / 2, str: 'π/2' },
		{ value: ANGLE_FRACTION_QUARTER, str: 'π/4' },
		{ value: ANGLE_FRACTION_THREE_QUARTERS, str: '3π/4' },
		{ value: 1 / ANGLE_FRACTION_DENOMINATOR_6, str: 'π/6' },
		{ value: 1 / ANGLE_FRACTION_DENOMINATOR_3, str: 'π/3' },
		{ value: 2 / ANGLE_FRACTION_DENOMINATOR_3, str: '2π/3' },
	];

	for (const fraction of fractions) {
		if (Math.abs(r - fraction.value) < ANGLE_FRACTION_TOLERANCE) return fraction.str;
		if (Math.abs(r + fraction.value) < ANGLE_FRACTION_TOLERANCE) return '-' + fraction.str;
	}

	// Try to find a simple fraction representation
	const tolerance = ANGLE_FRACTION_TOLERANCE;

	for (let denominator = 2; denominator <= ANGLE_MAX_DENOMINATOR; denominator++) {
		for (let numerator = 1; numerator < denominator; numerator++) {
			const frac = numerator / denominator;
			if (Math.abs(r - frac) < tolerance) {
				return `${numerator === 1 ? '' : numerator}π/${denominator}`;
			}
			if (Math.abs(r + frac) < tolerance) {
				return `-${numerator === 1 ? '' : numerator}π/${denominator}`;
			}
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
 * Normalizes an angle in degrees to be between 0 and 360
 * @param degrees - Angle in degrees
 * @returns Normalized angle in degrees in the range [0°, 360°)
 *
 * @example
 * NormalizeDegrees(450)   // 90  (wraps around 360°)
 * NormalizeDegrees(-90)   // 270 (negative angles normalized)
 * NormalizeDegrees(0)     // 0
 */
export function NormalizeDegrees(degrees: number): number {
	return ((degrees % DEGREES_PER_FULL_REVOLUTION) + DEGREES_PER_FULL_REVOLUTION) % DEGREES_PER_FULL_REVOLUTION;
}
