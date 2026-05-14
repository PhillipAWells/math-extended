import { CubeRoot } from './core.js';

describe('CubeRoot', () => {
	it('should compute cube root of positive numbers', () => {
		expect(CubeRoot(8)).toBeCloseTo(2);
		expect(CubeRoot(27)).toBeCloseTo(3);
		expect(CubeRoot(64)).toBeCloseTo(4);
		expect(CubeRoot(1)).toBeCloseTo(1);
		expect(CubeRoot(0)).toBe(0);
	});

	it('should compute cube root of negative numbers (preserve sign)', () => {
		expect(CubeRoot(-8)).toBeCloseTo(-2);
		expect(CubeRoot(-27)).toBeCloseTo(-3);
		expect(CubeRoot(-64)).toBeCloseTo(-4);
		expect(CubeRoot(-1)).toBeCloseTo(-1);
		expect(CubeRoot(-0.125)).toBeCloseTo(-0.5, 5);
	});

	it('should handle edge cases', () => {
		expect(CubeRoot(Infinity)).toBe(Infinity);
		expect(CubeRoot(-Infinity)).toBe(-Infinity);
		expect(Number.isNaN(CubeRoot(NaN))).toBe(true);
	});

	it('should handle irrational cube roots with precision', () => {
		// cbrt(2) ≈ 1.2599
		expect(CubeRoot(2)).toBeCloseTo(1.2599210498948732, 5);
		expect(CubeRoot(10)).toBeCloseTo(2.1544346900318834, 5);
		expect(CubeRoot(5)).toBeCloseTo(1.709975946676697, 5);
	});

	it('should handle very small positive values', () => {
		expect(CubeRoot(1e-15)).toBeCloseTo(1e-5, 10);
		expect(CubeRoot(0.001)).toBeCloseTo(0.1, 5);
		expect(CubeRoot(1e-9)).toBeCloseTo(1e-3, 10);
	});

	it('should handle very large positive values', () => {
		expect(CubeRoot(1e15)).toBeCloseTo(1e5, 5);
		expect(CubeRoot(1e9)).toBeCloseTo(1000, 5);
		expect(CubeRoot(1e18)).toBeCloseTo(1e6, 5);
	});

	it('should handle very small negative values', () => {
		expect(CubeRoot(-1e-15)).toBeCloseTo(-1e-5, 10);
		expect(CubeRoot(-0.001)).toBeCloseTo(-0.1, 5);
		expect(CubeRoot(-1e-9)).toBeCloseTo(-1e-3, 10);
	});

	it('should handle very large negative values', () => {
		expect(CubeRoot(-1e15)).toBeCloseTo(-1e5, 5);
		expect(CubeRoot(-1e9)).toBeCloseTo(-1000, 5);
		expect(CubeRoot(-1e18)).toBeCloseTo(-1e6, 5);
	});

	it('should handle fractional values', () => {
		expect(CubeRoot(0.125)).toBeCloseTo(0.5, 5);
		expect(CubeRoot(0.216)).toBeCloseTo(0.6, 5);
		expect(CubeRoot(0.343)).toBeCloseTo(0.7, 5);
	});

	it('should handle negative fractional values', () => {
		expect(CubeRoot(-0.125)).toBeCloseTo(-0.5, 5);
		expect(CubeRoot(-0.216)).toBeCloseTo(-0.6, 5);
		expect(CubeRoot(-0.343)).toBeCloseTo(-0.7, 5);
	});

	it('should match Math.cbrt behavior for positive numbers', () => {
		const testValues = [1, 2, 8, 27, 100, 1000];
		testValues.forEach(value => {
			expect(CubeRoot(value)).toBeCloseTo(Math.cbrt(value), 10);
		});
	});

	it('should handle zero correctly', () => {
		expect(CubeRoot(0)).toBe(0);
		expect(Object.is(CubeRoot(0), 0)).toBe(true);
		expect(Object.is(CubeRoot(-0), -0)).toBe(true);
	});

	it('should preserve sign for small values near zero', () => {
		const epsilon = 1e-10;
		expect(CubeRoot(epsilon) > 0).toBe(true);
		expect(CubeRoot(-epsilon) < 0).toBe(true);
	});

	it('should handle perfect cubes accurately', () => {
		// Test perfect cubes from 1 to 10
		for (let i = 1; i <= 10; i++) {
			const cube = i * i * i;
			expect(CubeRoot(cube)).toBeCloseTo(i, 10);
		}
	});

	it('should handle negative perfect cubes accurately', () => {
		// Test negative perfect cubes
		for (let i = 1; i <= 10; i++) {
			const cube = -(i * i * i);
			expect(CubeRoot(cube)).toBeCloseTo(-i, 10);
		}
	});
});
