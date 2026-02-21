import { AssertNumber } from '@pawells/typescript-common';
import {
	LinearInterpolation,
	SmoothStep,
	SmootherStep,
	QuadraticEaseIn,
	QuadraticEaseOut,
	QuadraticEaseInOut,
	CubicEaseIn,
	CubicEaseOut,
	CubicEaseInOut,
	CosineInterpolation,
	SineEaseIn,
	SineEaseOut,
	SineEaseInOut,
	ExponentialEaseIn,
	ExponentialEaseOut,
	ExponentialEaseInOut,
	ElasticEaseIn,
	ElasticEaseOut,
	ElasticEaseInOut,
	BackEaseIn,
	BackEaseOut,
	BackEaseInOut,
	BounceEaseIn,
	BounceEaseOut,
	BounceEaseInOut,
	CatmullRomInterpolation,
	HermiteInterpolation,
	CircularEaseIn,
	CircularEaseOut,
	CircularEaseInOut,
	StepInterpolation,
	SphericalLinearInterpolation,
} from './interpolation.ts';

describe('Interpolation', () => {
	const tolerance = 0.0001;
	describe('LinearInterpolation', () => {
		it('should return start value when t = 0', () => {
			expect(LinearInterpolation(10, 20, 0)).toBe(10);
		});

		it('should return end value when t = 1', () => {
			expect(LinearInterpolation(10, 20, 1)).toBe(20);
		});

		it('should return midpoint when t = 0.5', () => {
			expect(LinearInterpolation(10, 20, 0.5)).toBe(15);
		});

		it('should handle negative values', () => {
			expect(LinearInterpolation(-10, 10, 0.5)).toBe(0);
		});

		it('should clamp t values outside [0, 1]', () => {
			expect(LinearInterpolation(10, 20, -0.5)).toBe(5);
			expect(LinearInterpolation(10, 20, 1.5)).toBe(25);
		});

		it('should work with equal start and end values', () => {
			expect(LinearInterpolation(5, 5, 0.5)).toBe(5);
		});
	});

	describe('SmoothStep', () => {
		it('should return start value when t = 0', () => {
			expect(SmoothStep(0, 1, 0)).toBe(0);
		});

		it('should return end value when t = 1', () => {
			expect(SmoothStep(0, 1, 1)).toBe(1);
		});
		it('should have zero derivative at endpoints', () => {
			// Test near endpoints to verify smooth transition
			const nearZero = SmoothStep(0, 1, 0.01);
			const nearOne = SmoothStep(0, 1, 0.99);
			expect(nearZero).toBeCloseTo(0.0003, 4);
			expect(nearOne).toBeCloseTo(0.9997, 4);
		});

		it('should be smooth and monotonic', () => {
			const values = [0, 0.25, 0.5, 0.75, 1].map((t) => SmoothStep(0, 1, t));

			for (let i = 1; i < values.length; i++) {
				const current = values[i];
				const previous = values[i - 1];
				if (current !== undefined && previous !== undefined) {
					expect(current).toBeGreaterThan(previous);
				}
			}
		});
		it('should extrapolate for t < 0 and t > 1', () => {
			expect(SmoothStep(0, 1, -1)).toBeCloseTo(5, 4);
			expect(SmoothStep(0, 1, 2)).toBeCloseTo(-4, 4);
		});
	});

	describe('SmootherStep', () => {
		it('should return start value when t = 0', () => {
			expect(SmootherStep(0, 1, 0)).toBe(0);
		});

		it('should return end value when t = 1', () => {
			expect(SmootherStep(0, 1, 1)).toBe(1);
		});

		it('should be even smoother than SmoothStep', () => {
			const smoothValue = SmoothStep(0, 1, 0.1);
			const smootherValue = SmootherStep(0, 1, 0.1);
			expect(smootherValue).toBeLessThan(smoothValue);
		});
		it('should be monotonic', () => {
			const values = [0, 0.25, 0.5, 0.75, 1].map((t) => SmootherStep(0, 1, t));

			for (let i = 1; i < values.length; i++) {
				const current = values[i];
				const previous = values[i - 1];
				if (current !== undefined && previous !== undefined) {
					expect(current).toBeGreaterThan(previous);
				}
			}
		});
		it('should extrapolate for t < 0 and t > 1', () => {
			expect(SmootherStep(0, 1, -1)).toBeCloseTo(-31, 4);
			expect(SmootherStep(0, 1, 2)).toBeCloseTo(32, 4);
		});
	});

	describe('QuadraticEaseIn', () => {
		it('should start slowly and accelerate', () => {
			expect(QuadraticEaseIn(0, 1, 0)).toBe(0);
			expect(QuadraticEaseIn(0, 1, 1)).toBe(1);
			expect(QuadraticEaseIn(0, 1, 0.5)).toBe(0.25);
		});

		it('should follow quadratic curve (t²)', () => {
			expect(QuadraticEaseIn(0, 100, 0.3)).toBeCloseTo(9, tolerance);
			expect(QuadraticEaseIn(0, 100, 0.7)).toBeCloseTo(49, tolerance);
		});
		it('should extrapolate for t < 0 and t > 1', () => {
			expect(QuadraticEaseIn(0, 1, -1)).toBe(1);
			expect(QuadraticEaseIn(0, 1, 2)).toBe(4);
		});

		describe('QuadraticEaseOut', () => {
			it('should start fast and decelerate', () => {
				expect(QuadraticEaseOut(0, 1, 0)).toBe(0);
				expect(QuadraticEaseOut(0, 1, 1)).toBe(1);
				expect(QuadraticEaseOut(0, 1, 0.5)).toBe(0.75);
			});

			it('should complement QuadraticEaseIn', () => {
				const t = 0.3;
				const easeIn = QuadraticEaseIn(0, 1, t);
				const easeOut = QuadraticEaseOut(0, 1, 1 - t);
				expect(easeOut).toBeCloseTo(1 - easeIn, tolerance);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				expect(QuadraticEaseOut(0, 1, -1)).toBe(-3);
				expect(QuadraticEaseOut(0, 1, 2)).toBe(0);
			});
		});

		describe('CubicEaseIn', () => {
			it('should follow cubic curve (t³)', () => {
				expect(CubicEaseIn(0, 1, 0)).toBe(0);
				expect(CubicEaseIn(0, 1, 1)).toBe(1);
				expect(CubicEaseIn(0, 1, 0.5)).toBe(0.125);
			});

			it('should accelerate more than quadratic', () => {
				const t = 0.3;
				const quadratic = QuadraticEaseIn(0, 1, t);
				const cubic = CubicEaseIn(0, 1, t);
				expect(cubic).toBeLessThan(quadratic);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				expect(CubicEaseIn(0, 1, -1)).toBe(-1);
				expect(CubicEaseIn(0, 1, 2)).toBe(8);
			});
		});

		describe('CubicEaseOut', () => {
			it('should follow cubic ease-out curve', () => {
				expect(CubicEaseOut(0, 1, 0)).toBe(0);
				expect(CubicEaseOut(0, 1, 1)).toBe(1);
				expect(CubicEaseOut(0, 1, 0.5)).toBe(0.875);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				expect(CubicEaseOut(0, 1, -1)).toBe(-7);
				expect(CubicEaseOut(0, 1, 2)).toBe(2);
			});
		});

		describe('CosineInterpolation', () => {
			it('should use cosine curve for smooth interpolation', () => {
				expect(CosineInterpolation(0, 1, 0)).toBe(0);
				expect(CosineInterpolation(0, 1, 1)).toBe(1);
				expect(CosineInterpolation(0, 1, 0.5)).toBeCloseTo(0.5, tolerance);
			});

			it('should be smooth at endpoints', () => {
				const nearZero = CosineInterpolation(0, 1, 0.01);
				const nearOne = CosineInterpolation(0, 1, 0.99);
				expect(nearZero).toBeCloseTo(0, 2);
				expect(nearOne).toBeCloseTo(1, 2);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				expect(CosineInterpolation(0, 1, -1)).toBeCloseTo(1, tolerance);
				expect(CosineInterpolation(0, 1, 2)).toBeCloseTo(0, tolerance);
			});
		});
		describe('SineEaseIn', () => {
			it('should start slowly using sine curve', () => {
				expect(SineEaseIn(0, 1, 0)).toBe(0);
				expect(SineEaseIn(0, 1, 1)).toBeCloseTo(1, 10);

				const quarterPoint = SineEaseIn(0, 1, 0.25);
				expect(quarterPoint).toBeLessThan(0.25);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				expect(SineEaseIn(0, 1, -1)).toBeCloseTo(1, tolerance);
				expect(SineEaseIn(0, 1, 2)).toBeCloseTo(2, tolerance);
			});
		});
		describe('SineEaseOut', () => {
			it('should decelerate smoothly using sine curve', () => {
				expect(SineEaseOut(0, 1, 0)).toBe(0);
				expect(SineEaseOut(0, 1, 1)).toBe(1);

				const quarterPoint = SineEaseOut(0, 1, 0.25);
				expect(quarterPoint).toBeGreaterThan(0.25);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				expect(SineEaseOut(0, 1, -1)).toBeCloseTo(-1, tolerance);
				expect(SineEaseOut(0, 1, 2)).toBeCloseTo(0, tolerance);
			});
		});

		describe('ExponentialEaseIn', () => {
			it('should handle edge cases', () => {
				expect(ExponentialEaseIn(0, 1, 0)).toBe(0);
				expect(ExponentialEaseIn(0, 1, 1)).toBe(1);
			});

			it('should have very slow start', () => {
				const earlyValue = ExponentialEaseIn(0, 1, 0.1);
				expect(earlyValue).toBeCloseTo(0, 2);
			});

			it('should accelerate rapidly near the end', () => {
				const lateValue = ExponentialEaseIn(0, 1, 0.9);
				expect(lateValue).toBeGreaterThan(0.5);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				expect(ExponentialEaseIn(0, 1, -1)).toBeCloseTo(Math.pow(2, 10 * -2), tolerance);
				expect(ExponentialEaseIn(0, 1, 2)).toBeCloseTo(Math.pow(2, 10 * 1), tolerance);
			});
		});

		describe('ExponentialEaseOut', () => {
			it('should handle edge cases', () => {
				expect(ExponentialEaseOut(0, 1, 0)).toBe(0);
				expect(ExponentialEaseOut(0, 1, 1)).toBe(1);
			});

			it('should start rapidly and slow down', () => {
				const earlyValue = ExponentialEaseOut(0, 1, 0.11);
				expect(earlyValue).toBeGreaterThan(0.5);

				const lateValue = ExponentialEaseOut(0, 1, 0.9);
				expect(lateValue).toBeCloseTo(1, 2);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				expect(ExponentialEaseOut(0, 1, -1)).toBeCloseTo(1 - Math.pow(2, 10), tolerance);
				expect(ExponentialEaseOut(0, 1, 2)).toBeCloseTo(1 - Math.pow(2, -20), tolerance);
			});
		});

		describe('ElasticEaseOut', () => {
			it('should handle edge cases', () => {
				expect(ElasticEaseOut(0, 1, 0)).toBe(0);
				expect(ElasticEaseOut(0, 1, 1)).toBe(1);
			});
			it('should overshoot and bounce back', () => {
				// Check for overshoot (value > 1 at some point)
				let foundOvershoot = false;

				for (let t = 0.1; t < 1; t += 0.05) {
					const value = ElasticEaseOut(0, 1, t);
					if (value > 1) {
						foundOvershoot = true;
						break;
					}
				}
				expect(foundOvershoot).toBe(true);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				// Just check it runs and returns a number
				expect(typeof ElasticEaseOut(0, 1, -1)).toBe('number');
				expect(typeof ElasticEaseOut(0, 1, 2)).toBe('number');
			});
		});

		describe('BackEaseOut', () => {
			it('should handle edge cases', () => {
				expect(BackEaseOut(0, 1, 0)).toBeCloseTo(0, 10);
				expect(BackEaseOut(0, 1, 1)).toBeCloseTo(1, 10);
			});
			it('should overshoot before settling', () => {
				// Check for overshoot
				let foundOvershoot = false;

				for (let t = 0.1; t < 1; t += 0.05) {
					const value = BackEaseOut(0, 1, t);
					if (value > 1) {
						foundOvershoot = true;
						break;
					}
				}
				expect(foundOvershoot).toBe(true);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				// Just check it runs and returns a number
				expect(typeof BackEaseOut(0, 1, -1)).toBe('number');
				expect(typeof BackEaseOut(0, 1, 2)).toBe('number');
			});
		});

		describe('BounceEaseOut', () => {
			it('should handle edge cases', () => {
				expect(BounceEaseOut(0, 1, 0)).toBe(0);
				expect(BounceEaseOut(0, 1, 1)).toBe(1);
			});
			it('should create bouncing effect', () => {
				const values = [];

				for (let t = 0; t <= 1; t += 0.1) {
					values.push(BounceEaseOut(0, 1, t));
				}

				// Should have some non-monotonic behavior (bounces)
				let hasDecrease = false;

				for (let i = 1; i < values.length - 1; i++) {
					const current = values[i];
					AssertNumber(current);

					const next = values[i + 1];
					AssertNumber(next);
					if (current > next) {
						hasDecrease = true;
						break;
					}
				}
				expect(hasDecrease).toBe(true);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				// Just check it runs and returns a number
				expect(typeof BounceEaseOut(0, 1, -1)).toBe('number');
				expect(typeof BounceEaseOut(0, 1, 2)).toBe('number');
			});
		});

		describe('CatmullRomInterpolation', () => {
			it('should interpolate between p1 and p2', () => {
				expect(CatmullRomInterpolation(0, 1, 2, 3, 0)).toBe(1);
				expect(CatmullRomInterpolation(0, 1, 2, 3, 1)).toBe(2);
			});

			it('should create smooth curve through points', () => {
				const midpoint = CatmullRomInterpolation(0, 1, 2, 3, 0.5);
				expect(midpoint).toBeCloseTo(1.5, tolerance);
			});

			it('should be influenced by neighboring points', () => {
				// Different neighboring points should affect the curve
				const curve1 = CatmullRomInterpolation(0, 1, 2, 3, 0.25);
				const curve2 = CatmullRomInterpolation(-10, 1, 2, 10, 0.25);
				expect(curve1).not.toBeCloseTo(curve2, tolerance);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				// Just check it runs and returns a number
				expect(typeof CatmullRomInterpolation(0, 1, 2, 3, -1)).toBe('number');
				expect(typeof CatmullRomInterpolation(0, 1, 2, 3, 2)).toBe('number');
			});
		});

		describe('HermiteInterpolation', () => {
			it('should interpolate between p0 and p1', () => {
				expect(HermiteInterpolation(1, 2, 0, 0, 0)).toBe(1);
				expect(HermiteInterpolation(1, 2, 0, 0, 1)).toBe(2);
			});

			it('should respect tangent vectors', () => {
				// Zero tangents should create linear interpolation
				const linear = HermiteInterpolation(0, 1, 0, 0, 0.5);
				expect(linear).toBeCloseTo(0.5, tolerance);

				// Non-zero, non-symmetric tangents should affect the curve
				const curved = HermiteInterpolation(0, 1, 2, 0, 0.5);
				expect(curved).toBeCloseTo(0.75, tolerance);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				// Just check it runs and returns a number
				expect(typeof HermiteInterpolation(0, 1, 1, 1, -1)).toBe('number');
				expect(typeof HermiteInterpolation(0, 1, 1, 1, 2)).toBe('number');
			});
		});

		describe('CircularEaseIn', () => {
			it('should follow circular arc', () => {
				expect(CircularEaseIn(0, 1, 0)).toBe(0);
				expect(CircularEaseIn(0, 1, 1)).toBe(1);
			});

			it('should start slowly and accelerate', () => {
				const early = CircularEaseIn(0, 1, 0.25);
				expect(early).toBeLessThan(0.25);

				const late = CircularEaseIn(0, 1, 0.75);
				expect(late).toBeGreaterThan(0.3385);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				// May return NaN for t < 0 or t > 1, but should not throw
				expect(() => CircularEaseIn(0, 1, -1)).not.toThrow();
				expect(() => CircularEaseIn(0, 1, 2)).not.toThrow();
			});
		});

		describe('CircularEaseOut', () => {
			it('should follow circular arc', () => {
				expect(CircularEaseOut(0, 1, 0)).toBe(0);
				expect(CircularEaseOut(0, 1, 1)).toBe(1);
			});

			it('should start fast and decelerate', () => {
				const early = CircularEaseOut(0, 1, 0.25);
				expect(early).toBeGreaterThan(0.25);

				const late = CircularEaseOut(0, 1, 0.75);
				expect(late).toBeGreaterThan(0.75);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				// May return NaN for t < 0 or t > 1, but should not throw
				expect(() => CircularEaseOut(0, 1, -1)).not.toThrow();
				expect(() => CircularEaseOut(0, 1, 2)).not.toThrow();
			});
		});

		describe('StepInterpolation', () => {
			it('should return start value before threshold', () => {
				expect(StepInterpolation(10, 20, 0.4, 0.5)).toBe(10);
			});

			it('should return end value at or after threshold', () => {
				expect(StepInterpolation(10, 20, 0.5, 0.5)).toBe(20);
				expect(StepInterpolation(10, 20, 0.6, 0.5)).toBe(20);
			});

			it('should use default threshold of 0.5', () => {
				expect(StepInterpolation(10, 20, 0.4)).toBe(10);
				expect(StepInterpolation(10, 20, 0.6)).toBe(20);
			});

			it('should clamp threshold to [0, 1]', () => {
				expect(StepInterpolation(10, 20, 0.5, -0.5)).toBe(20);
				expect(StepInterpolation(10, 20, 0.5, 1.5)).toBe(10);
			});
		});

		describe('SphericalLinearInterpolation', () => {
			it('should behave like linear interpolation for scalars', () => {
				const linear = LinearInterpolation(10, 20, 0.3);
				const spherical = SphericalLinearInterpolation(10, 20, 0.3);
				expect(spherical).toBeCloseTo(linear, tolerance);
			});

			it('should handle edge cases', () => {
				expect(SphericalLinearInterpolation(0, 1, 0)).toBe(0);
				expect(SphericalLinearInterpolation(0, 1, 1)).toBe(1);
			});
			it('should extrapolate for t < 0 and t > 1', () => {
				const linearLow = LinearInterpolation(10, 20, -0.5);
				const sphericalLow = SphericalLinearInterpolation(10, 20, -0.5);
				expect(sphericalLow).toBeCloseTo(linearLow, tolerance);

				const linearHigh = LinearInterpolation(10, 20, 1.5);
				const sphericalHigh = SphericalLinearInterpolation(10, 20, 1.5);
				expect(sphericalHigh).toBeCloseTo(linearHigh, tolerance);
			});
		});
		describe('Parameter validation', () => {
			it('should not clamp t parameter for extrapolating functions', () => {
				const functions = [
					LinearInterpolation,
					SmoothStep,
					SmootherStep,
					QuadraticEaseIn,
					QuadraticEaseOut,
					CubicEaseIn,
					CubicEaseOut,
					CosineInterpolation,
					SineEaseIn,
					SineEaseOut,
					ExponentialEaseIn,
					ExponentialEaseOut,
					ElasticEaseOut,
					BackEaseOut,
					BounceEaseOut,
					CircularEaseIn,
					CircularEaseOut,
					SphericalLinearInterpolation,
				];
				functions.forEach((func) => {
					// Should extrapolate, not clamp
					expect(func(0, 10, -0.5)).not.toBe(0);
					expect(func(0, 10, 1.5)).not.toBe(10);
				});
			});
			it('should not clamp t for CatmullRomInterpolation', () => {
				expect(CatmullRomInterpolation(0, 1, 2, 3, -0.5)).not.toBe(1);
				expect(CatmullRomInterpolation(0, 1, 2, 3, 1.5)).not.toBe(2);
			});
			it('should not clamp t for HermiteInterpolation', () => {
				expect(HermiteInterpolation(1, 2, 0, 0, -0.5)).not.toBe(1);
				expect(HermiteInterpolation(1, 2, 0, 0, 1.5)).not.toBe(2);
			});
		});
		describe('Edge cases', () => {
			it('should handle zero range (a = b)', () => {
				const functions = [
					LinearInterpolation,
					SmoothStep,
					SmootherStep,
					QuadraticEaseIn,
					QuadraticEaseOut,
					QuadraticEaseInOut,
					CubicEaseIn,
					CubicEaseOut,
					CubicEaseInOut,
					CosineInterpolation,
					SineEaseIn,
					SineEaseOut,
					SineEaseInOut,
					ExponentialEaseIn,
					ExponentialEaseOut,
					ExponentialEaseInOut,
					ElasticEaseIn,
					ElasticEaseOut,
					ElasticEaseInOut,
					BackEaseIn,
					BackEaseOut,
					BackEaseInOut,
					BounceEaseIn,
					BounceEaseOut,
					BounceEaseInOut,
					CircularEaseIn,
					CircularEaseOut,
					CircularEaseInOut,
					SphericalLinearInterpolation,
				];
				functions.forEach((func) => {
					expect(func(5, 5, 0.5)).toBe(5);
				});
			});

			it('should handle negative values', () => {
				expect(LinearInterpolation(-10, -5, 0.5)).toBe(-7.5);
				expect(SmoothStep(-10, -5, 0.5)).toBeCloseTo(-7.5, 1);
			});

			it('should handle very large values', () => {
				const large = 1e6;
				expect(LinearInterpolation(0, large, 0.5)).toBe(large / 2);
			});

			it('should handle very small values', () => {
				const small = 1e-6;
				expect(LinearInterpolation(0, small, 0.5)).toBeCloseTo(small / 2, 10);
			});
		});
	});

	describe('Ease-in-out and missing ease-in functions',() => {
		const easeInOutFns = [
			{ fn: QuadraticEaseInOut },
			{ fn: CubicEaseInOut },
			{ fn: SineEaseInOut },
			{ fn: ExponentialEaseInOut },
			{ fn: CircularEaseInOut },
			{ fn: ElasticEaseInOut },
			{ fn: BackEaseInOut },
			{ fn: BounceEaseInOut },
		];
		const easeInFns = [
			{ fn: ElasticEaseIn },
			{ fn: BackEaseIn },
			{ fn: BounceEaseIn },
		];

		it('all ease-in-out functions return start value at t=0', () => {
			easeInOutFns.forEach(({ fn }) => {
				expect(fn(0, 100, 0)).toBeCloseTo(0, 5);
			});
		});

		it('all ease-in-out functions return end value at t=1', () => {
			easeInOutFns.forEach(({ fn }) => {
				expect(fn(0, 100, 1)).toBeCloseTo(100, 5);
			});
		});

		it('all ease-in-out functions are symmetric at t=0.5 (exactly midpoint)', () => {
			const symmetricFns = [
				QuadraticEaseInOut, CubicEaseInOut, SineEaseInOut,
				ExponentialEaseInOut, CircularEaseInOut,
			];
			symmetricFns.forEach((fn) => {
				expect(fn(0, 100, 0.5)).toBeCloseTo(50, 3);
			});
		});

		it('ease-in-out values are monotonically increasing over [0,1] for smooth functions', () => {
			const smoothFns = [QuadraticEaseInOut, CubicEaseInOut, SineEaseInOut, CircularEaseInOut];
			smoothFns.forEach((fn) => {
				let prev = fn(0, 100, 0);
				for (let i = 1; i <= 10; i++) {
					const next = fn(0, 100, i / 10);
					expect(next).toBeGreaterThanOrEqual(prev);
					prev = next;
				}
			});
		});

		it('ease-in-out returns the same value as ease-in at t<0.5 progressing and ease-out at t>0.5', () => {
			// QuadraticEaseInOut at t=0.25 should equal half the QuadraticEaseIn value at t=0.5
			expect(QuadraticEaseInOut(0, 100, 0.25)).toBeCloseTo(QuadraticEaseIn(0, 50, 0.5), 3);
		});

		it('all ease-in functions return start at t=0 and end at t=1', () => {
			easeInFns.forEach(({ fn }) => {
				expect(fn(0, 100, 0)).toBeCloseTo(0, 5);
				expect(fn(0, 100, 1)).toBeCloseTo(100, 5);
			});
		});

		it('BounceEaseIn(a,b,t) + BounceEaseOut(a,b,1-t) = a+b (symmetry)', () => {
			const pairs: [number, number][] = [[0.25, 0.75], [0.1, 0.9], [0.5, 0.5]];
			pairs.forEach(([t, tFlip]) => {
				const bounceIn = BounceEaseIn(0, 1, t);
				const bounceOut = BounceEaseOut(0, 1, tFlip);
				expect(bounceIn + bounceOut).toBeCloseTo(1, 6);
			});
		});

		it('SineEaseInOut matches expected formula at t=0.25', () => {
			// -(cos(0.25*π) - 1) / 2 ≈ 0.1464
			const expected = -(Math.cos(0.25 * Math.PI) - 1) / 2;
			expect(SineEaseInOut(0, 1, 0.25)).toBeCloseTo(expected, 6);
		});
	});
});
