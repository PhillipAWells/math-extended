/**
 * Clamps a number between a minimum and maximum value.
 * If `x` is less than `min`, returns `min`. If `x` is greater than `max`, returns `max`.
 * Otherwise returns `x` unchanged.
 *
 * @param x - The value to clamp
 * @param min - Lower bound (inclusive)
 * @param max - Upper bound (inclusive)
 * @returns The clamped value in the range [min, max]
 *
 * @example
 * Clamp(5, 0, 10)   // 5 (within range)
 * Clamp(-3, 0, 10)  // 0 (below min)
 * Clamp(15, 0, 10)  // 10 (above max)
 */
export function Clamp(x: number, min: number, max: number): number {
	return Math.max(min, Math.min(x, max));
}
