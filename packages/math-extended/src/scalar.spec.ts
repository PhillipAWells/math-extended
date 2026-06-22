import { expect, test, describe } from 'vitest';
import {
	InverseLerp, Remap, MoveTowards, Mod, Repeat, PingPong,
	Approximately, Clamp01, Sign, RoundToNearest, ScalarError,
	Gcd, Lcm, Factorial, Linspace, Range
} from './scalar.js';

describe('Math Extended > Scalar', () => {
	describe('ScalarError', () => {
		test('ScalarError extends Error with proper code', () => {
			const err = new ScalarError('Test error');
			expect(err).toBeInstanceOf(Error);
			expect(err.message).toBe('Test error');
			expect(err.Code).toBe('SCALAR_ERROR');
		});

		test('ScalarError supports cause chain', () => {
			const originalErr = new Error('Original');
			const err = new ScalarError('Wrapped', { cause: originalErr });
			expect(err.Cause).toBe(originalErr);
		});

		test('ScalarError.Code is frozen', () => {
			expect(() => {
				(ScalarError.Code as unknown as { SCALAR_ERROR: string }).SCALAR_ERROR = 'DIFFERENT';
			}).toThrow();
		});
	});

	describe('InverseLerp', () => {
		test('InverseLerp inverts Lerp', () => {
			expect(InverseLerp(0, 10, 5)).toBe(0.5);
			expect(InverseLerp(0, 10, 0)).toBe(0);
			expect(InverseLerp(0, 10, 10)).toBe(1);
		});

		test('InverseLerp with negative intervals', () => {
			expect(InverseLerp(-10, 10, 0)).toBe(0.5);
			expect(InverseLerp(5, 15, 10)).toBe(0.5);
		});

		test('InverseLerp throws when a === b', () => {
			expect(() => InverseLerp(5, 5, 5)).toThrow(ScalarError);
		});

		test('InverseLerp throws on non-finite inputs', () => {
			expect(() => InverseLerp(Number.NaN, 10, 5)).toThrow(RangeError);
			expect(() => InverseLerp(0, 10, Number.POSITIVE_INFINITY)).toThrow(RangeError);
		});
	});

	describe('Remap', () => {
		test('Remap maps value from one range to another', () => {
			expect(Remap(0.5, 0, 1, 0, 10)).toBe(5);
			expect(Remap(50, 0, 100, 0, 360)).toBe(180);
		});

		test('Remap with boundary values', () => {
			expect(Remap(0, 0, 100, 0, 10)).toBe(0);
			expect(Remap(100, 0, 100, 0, 10)).toBe(10);
		});

		test('Remap throws when inMin === inMax', () => {
			expect(() => Remap(50, 10, 10, 0, 100)).toThrow(ScalarError);
		});

		test('Remap throws on non-finite inputs', () => {
			expect(() => Remap(Number.NaN, 0, 100, 0, 10)).toThrow(RangeError);
			expect(() => Remap(50, 0, 100, 0, Number.POSITIVE_INFINITY)).toThrow(RangeError);
		});
	});

	describe('MoveTowards', () => {
		test('MoveTowards moves towards target by maxDelta', () => {
			expect(MoveTowards(0, 10, 3)).toBe(3);
			expect(MoveTowards(10, 0, 2)).toBe(8);
		});

		test('MoveTowards stops at target when within maxDelta', () => {
			expect(MoveTowards(0, 10, 20)).toBe(10);
			expect(MoveTowards(10, 0, 20)).toBe(0);
		});

		test('MoveTowards returns target when current equals target', () => {
			expect(MoveTowards(5, 5, 1)).toBe(5);
		});

		test('MoveTowards throws on non-finite inputs', () => {
			expect(() => MoveTowards(Number.NaN, 10, 3)).toThrow(RangeError);
			expect(() => MoveTowards(0, Number.POSITIVE_INFINITY, 3)).toThrow(RangeError);
		});
	});

	describe('Mod', () => {
		test('Mod returns Euclidean remainder for positive divisor', () => {
			expect(Mod(5, 3)).toBe(2);
			expect(Mod(-5, 3)).toBe(1);
			expect(Mod(7, 4)).toBe(3);
		});

		test('Mod with negative divisor', () => {
			expect(Mod(5, -3)).toBe(-1);
			expect(Mod(-5, -3)).toBe(-2);
		});

		test('Mod returns 0 for exact multiples', () => {
			expect(Mod(6, 3)).toBe(0);
			expect(Mod(-6, 3)).toBe(0);
		});

		test('Mod throws when n === 0', () => {
			expect(() => Mod(5, 0)).toThrow(RangeError);
		});

		test('Mod throws on non-finite inputs', () => {
			expect(() => Mod(Number.NaN, 3)).toThrow(RangeError);
			expect(() => Mod(5, Number.POSITIVE_INFINITY)).toThrow(RangeError);
		});
	});

	describe('Repeat', () => {
		test('Repeat wraps value into [0, length)', () => {
			expect(Repeat(7, 5)).toBe(2);
			expect(Repeat(0.5, 1)).toBe(0.5);
			expect(Repeat(5, 5)).toBe(0);
		});

		test('Repeat wraps negative values', () => {
			expect(Repeat(-3, 5)).toBe(2);
			expect(Repeat(-0.5, 1)).toBe(0.5);
		});

		test('Repeat throws when length <= 0', () => {
			expect(() => Repeat(5, 0)).toThrow(RangeError);
			expect(() => Repeat(5, -1)).toThrow(RangeError);
		});

		test('Repeat throws on non-finite inputs', () => {
			expect(() => Repeat(Number.NaN, 5)).toThrow(RangeError);
			expect(() => Repeat(5, Number.POSITIVE_INFINITY)).toThrow(RangeError);
		});
	});

	describe('PingPong', () => {
		test('PingPong oscillates between 0 and length', () => {
			expect(PingPong(0.5, 1)).toBe(0.5);
			expect(PingPong(1.5, 1)).toBe(0.5);
			expect(PingPong(2.5, 1)).toBe(0.5);
		});

		test('PingPong at boundaries', () => {
			expect(PingPong(0, 1)).toBe(0);
			expect(PingPong(1, 1)).toBe(1);
			expect(PingPong(2, 1)).toBe(0);
		});

		test('PingPong repeats with period 2*length', () => {
			expect(PingPong(3, 1)).toBe(1);
			expect(PingPong(4, 1)).toBe(0);
		});

		test('PingPong throws when length <= 0', () => {
			expect(() => PingPong(0.5, 0)).toThrow(RangeError);
			expect(() => PingPong(0.5, -1)).toThrow(RangeError);
		});

		test('PingPong throws on non-finite inputs', () => {
			expect(() => PingPong(Number.NaN, 1)).toThrow(RangeError);
			expect(() => PingPong(0.5, Number.POSITIVE_INFINITY)).toThrow(RangeError);
		});
	});

	describe('Approximately', () => {
		test('Approximately returns true for equal values', () => {
			expect(Approximately(1.0, 1.0)).toBe(true);
			expect(Approximately(5, 5, 0.1)).toBe(true);
		});

		test('Approximately uses default EPSILON', () => {
			expect(Approximately(0.1 + 0.2, 0.3)).toBe(true);
		});

		test('Approximately respects custom epsilon', () => {
			expect(Approximately(1.0001, 1.0, 0.001)).toBe(true);
			expect(Approximately(1.1, 1.0, 0.01)).toBe(false);
		});

		test('Approximately returns false for NaN or Infinity', () => {
			expect(Approximately(Number.NaN, 0)).toBe(false);
			expect(Approximately(Infinity, 1e10)).toBe(false);
			expect(Approximately(0, Number.NaN)).toBe(false);
		});

		test('Approximately returns false if epsilon is not finite', () => {
			expect(Approximately(1.0, 1.0, Number.NaN)).toBe(false);
		});
	});

	describe('Clamp01', () => {
		test('Clamp01 clamps to [0, 1]', () => {
			expect(Clamp01(0.5)).toBe(0.5);
			expect(Clamp01(-0.5)).toBe(0);
			expect(Clamp01(1.5)).toBe(1);
		});

		test('Clamp01 with boundary values', () => {
			expect(Clamp01(0)).toBe(0);
			expect(Clamp01(1)).toBe(1);
		});
	});

	describe('Sign', () => {
		test('Sign returns correct values for positive, negative, and zero', () => {
			expect(Sign(5)).toBe(1);
			expect(Sign(-5)).toBe(-1);
			expect(Sign(0)).toBe(0);
		});

		test('Sign treats -0 as 0', () => {
			expect(Sign(-0)).toBe(0);
		});

		test('Sign returns 0 for small values near zero', () => {
			const tiny = Number.EPSILON / 2;
			expect(Sign(tiny)).toBe(1);
			expect(Sign(-tiny)).toBe(-1);
		});
	});

	describe('RoundToNearest', () => {
		test('RoundToNearest rounds to nearest step multiple', () => {
			expect(RoundToNearest(3.7, 1)).toBe(4);
			expect(RoundToNearest(3.2, 1)).toBe(3);
			expect(RoundToNearest(3.14, 0.1)).toBeCloseTo(3.1);
		});

		test('RoundToNearest with different step sizes', () => {
			expect(RoundToNearest(3.75, 0.5)).toBe(4);
			expect(RoundToNearest(3.25, 0.5)).toBe(3.5);
		});

		test('RoundToNearest throws when step <= 0', () => {
			expect(() => RoundToNearest(5, 0)).toThrow(RangeError);
			expect(() => RoundToNearest(5, -1)).toThrow(RangeError);
		});

		test('RoundToNearest throws on non-finite inputs', () => {
			expect(() => RoundToNearest(Number.NaN, 1)).toThrow(RangeError);
			expect(() => RoundToNearest(5, Infinity)).toThrow(RangeError);
		});
	});

	describe('Gcd', () => {
		test('Gcd returns correct GCD for positive integers', () => {
			expect(Gcd(12, 18)).toBe(6);
			expect(Gcd(48, 18)).toBe(6);
			expect(Gcd(7, 5)).toBe(1);
		});

		test('Gcd handles zero values', () => {
			expect(Gcd(0, 5)).toBe(5);
			expect(Gcd(5, 0)).toBe(5);
			expect(Gcd(0, 0)).toBe(0);
		});

		test('Gcd works with negative integers', () => {
			expect(Gcd(-12, 18)).toBe(6);
			expect(Gcd(12, -18)).toBe(6);
			expect(Gcd(-12, -18)).toBe(6);
		});

		test('Gcd of identical values returns the value', () => {
			expect(Gcd(7, 7)).toBe(7);
			expect(Gcd(100, 100)).toBe(100);
		});

		test('Gcd throws RangeError for non-integer a', () => {
			expect(() => Gcd(12.5, 18)).toThrow(RangeError);
			expect(() => Gcd(Number.NaN, 18)).toThrow(RangeError);
		});

		test('Gcd throws RangeError for non-integer b', () => {
			expect(() => Gcd(12, 18.5)).toThrow(RangeError);
			expect(() => Gcd(12, Number.POSITIVE_INFINITY)).toThrow(RangeError);
		});
	});

	describe('Lcm', () => {
		test('Lcm returns correct LCM for positive integers', () => {
			expect(Lcm(4, 6)).toBe(12);
			expect(Lcm(12, 18)).toBe(36);
			expect(Lcm(7, 5)).toBe(35);
		});

		test('Lcm returns 0 when either argument is 0', () => {
			expect(Lcm(0, 5)).toBe(0);
			expect(Lcm(5, 0)).toBe(0);
			expect(Lcm(0, 0)).toBe(0);
		});

		test('Lcm works with negative integers', () => {
			expect(Lcm(-4, 6)).toBe(12);
			expect(Lcm(4, -6)).toBe(12);
			expect(Lcm(-4, -6)).toBe(12);
		});

		test('Lcm of identical values returns the value', () => {
			expect(Lcm(7, 7)).toBe(7);
			expect(Lcm(10, 10)).toBe(10);
		});

		test('Lcm throws RangeError for non-integer a', () => {
			expect(() => Lcm(4.5, 6)).toThrow(RangeError);
			expect(() => Lcm(Number.NaN, 6)).toThrow(RangeError);
		});

		test('Lcm throws RangeError for non-integer b', () => {
			expect(() => Lcm(4, 6.5)).toThrow(RangeError);
			expect(() => Lcm(4, Number.POSITIVE_INFINITY)).toThrow(RangeError);
		});
	});

	describe('Factorial', () => {
		test('Factorial returns correct factorial for small values', () => {
			expect(Factorial(0)).toBe(1);
			expect(Factorial(1)).toBe(1);
			expect(Factorial(5)).toBe(120);
			expect(Factorial(10)).toBe(3628800);
		});

		test('Factorial of 2 is 2', () => {
			expect(Factorial(2)).toBe(2);
		});

		test('Factorial of 3 is 6', () => {
			expect(Factorial(3)).toBe(6);
		});

		test('Factorial of 4 is 24', () => {
			expect(Factorial(4)).toBe(24);
		});

		test('Factorial throws RangeError for negative n', () => {
			expect(() => Factorial(-1)).toThrow(RangeError);
			expect(() => Factorial(-5)).toThrow(RangeError);
		});

		test('Factorial throws RangeError for non-integer n', () => {
			expect(() => Factorial(5.5)).toThrow(RangeError);
			expect(() => Factorial(Number.NaN)).toThrow(RangeError);
			expect(() => Factorial(Number.POSITIVE_INFINITY)).toThrow(RangeError);
		});
	});

	describe('Linspace', () => {
		test('Linspace generates evenly spaced values from start to stop', () => {
			const result = Linspace(0, 1, 5);
			expect(result.length).toBe(5);
			expect(result[0]).toBe(0);
			expect(result[4]).toBe(1);
			expect(result[1]).toBeCloseTo(0.25, 1e-9);
			expect(result[2]).toBeCloseTo(0.5, 1e-9);
			expect(result[3]).toBeCloseTo(0.75, 1e-9);
		});

		test('Linspace with count 0 returns empty array', () => {
			expect(Linspace(0, 1, 0)).toEqual([]);
			expect(Linspace(5, 10, 0)).toEqual([]);
		});

		test('Linspace with count 1 returns array containing start value', () => {
			expect(Linspace(0, 1, 1)).toEqual([0]);
			expect(Linspace(5, 10, 1)).toEqual([5]);
		});

		test('Linspace with count 2 returns [start, stop]', () => {
			expect(Linspace(0, 1, 2)).toEqual([0, 1]);
			expect(Linspace(5, 15, 2)).toEqual([5, 15]);
		});

		test('Linspace last element is exactly stop', () => {
			const result = Linspace(0, 10, 11);
			expect(result[result.length - 1]).toBe(10);
		});

		test('Linspace works with negative ranges', () => {
			const result = Linspace(-5, 5, 11);
			expect(result[0]).toBe(-5);
			expect(result[10]).toBe(5);
			expect(result.length).toBe(11);
		});

		test('Linspace throws RangeError for non-integer count', () => {
			expect(() => Linspace(0, 1, 5.5)).toThrow(RangeError);
			expect(() => Linspace(0, 1, Number.NaN)).toThrow(RangeError);
		});

		test('Linspace throws RangeError for negative count', () => {
			expect(() => Linspace(0, 1, -1)).toThrow(RangeError);
			expect(() => Linspace(0, 1, -5)).toThrow(RangeError);
		});
	});

	describe('Range', () => {
		test('Range generates values from start to stop with default step 1', () => {
			expect(Range(0, 5)).toEqual([0, 1, 2, 3, 4]);
			expect(Range(2, 7)).toEqual([2, 3, 4, 5, 6]);
		});

		test('Range with custom positive step', () => {
			const result = Range(0, 1, 0.25);
			expect(result.length).toBe(4);
			expect(result[0]).toBe(0);
			expect(result[1]).toBeCloseTo(0.25, 1e-9);
			expect(result[2]).toBeCloseTo(0.5, 1e-9);
			expect(result[3]).toBeCloseTo(0.75, 1e-9);
		});

		test('Range with negative step goes backwards', () => {
			expect(Range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);
			expect(Range(10, 5, -2)).toEqual([10, 8, 6]);
		});

		test('Range returns empty array when step points away from stop', () => {
			expect(Range(0, 5, -1)).toEqual([]);
			expect(Range(10, 5, 2)).toEqual([]);
			expect(Range(0, -5, 1)).toEqual([]);
		});

		test('Range with step 2', () => {
			expect(Range(0, 10, 2)).toEqual([0, 2, 4, 6, 8]);
		});

		test('Range does not include stop value', () => {
			const result = Range(0, 5, 1);
			expect(result).not.toContain(5);
		});

		test('Range throws RangeError when step is 0', () => {
			expect(() => Range(0, 5, 0)).toThrow(RangeError);
		});

		test('Range works with negative start and positive stop', () => {
			expect(Range(-5, 0, 1)).toEqual([-5, -4, -3, -2, -1]);
		});

		test('Range with floating-point step', () => {
			const result = Range(0, 1, 0.5);
			expect(result.length).toBe(2);
			expect(result[0]).toBe(0);
			expect(result[1]).toBeCloseTo(0.5, 1e-9);
		});
	});
});
