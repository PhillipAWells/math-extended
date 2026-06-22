import { expect, test, describe } from 'vitest';
import {
	Lerp, LerpUnclamped, InverseLerp, Remap, MoveTowards, Mod, Repeat, PingPong,
	Approximately, Clamp01, Sign, RoundToNearest, ScalarError
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

	describe('Lerp', () => {
		test('Lerp with t in [0,1] returns interpolated value', () => {
			expect(Lerp(0, 10, 0.5)).toBe(5);
			expect(Lerp(0, 10, 0)).toBe(0);
			expect(Lerp(0, 10, 1)).toBe(10);
		});

		test('Lerp clamps t outside [0,1]', () => {
			expect(Lerp(0, 10, 1.5)).toBe(10);
			expect(Lerp(0, 10, -0.5)).toBe(0);
		});

		test('Lerp with negative values', () => {
			expect(Lerp(-10, 10, 0.5)).toBe(0);
			expect(Lerp(-5, 5, 0.25)).toBe(-2.5);
		});

		test('Lerp throws on non-finite inputs', () => {
			expect(() => Lerp(Number.NaN, 10, 0.5)).toThrow(RangeError);
			expect(() => Lerp(0, Number.POSITIVE_INFINITY, 0.5)).toThrow(RangeError);
			expect(() => Lerp(0, 10, Number.NaN)).toThrow(RangeError);
		});
	});

	describe('LerpUnclamped', () => {
		test('LerpUnclamped allows extrapolation', () => {
			expect(LerpUnclamped(0, 10, 0.5)).toBe(5);
			expect(LerpUnclamped(0, 10, 1.5)).toBe(15);
			expect(LerpUnclamped(0, 10, -0.5)).toBe(-5);
		});

		test('LerpUnclamped throws on non-finite inputs', () => {
			expect(() => LerpUnclamped(Number.NaN, 10, 0.5)).toThrow(RangeError);
			expect(() => LerpUnclamped(0, 10, Number.POSITIVE_INFINITY)).toThrow(RangeError);
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
});
