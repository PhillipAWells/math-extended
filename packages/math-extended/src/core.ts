/**
 * Core mathematical utilities for pure numeric calculations.
 * Provides foundational math operations with no domain coupling.
 */

/**
 * Calculates the cube root of a number, preserving the sign of the input.
 * Handles negative numbers correctly (unlike Math.cbrt in some contexts).
 *
 * @param value - The value to calculate the cube root of
 * @returns The cube root of the value, with same sign as input
 *
 * @example
 * ```typescript
 * import { CubeRoot } from '@pawells/math-extended';
 *
 * CubeRoot(8); // 2
 * CubeRoot(-8); // -2
 * CubeRoot(27); // 3
 * CubeRoot(0); // 0
 * ```
 */
export function CubeRoot(value: number): number {
	return Math.sign(value) * Math.cbrt(Math.abs(value));
}
