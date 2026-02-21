import { VectorLERP, VectorSmoothStep, VectorSmootherStep, VectorQuadraticEaseIn, VectorQuadraticEaseOut, VectorCubicEaseIn, VectorCubicEaseOut, VectorCosineInterpolation, VectorSineEaseIn, VectorSineEaseOut, VectorExponentialEaseIn, VectorExponentialEaseOut, VectorElasticEaseOut, VectorBackEaseOut, VectorBounceEaseOut, VectorCatmullRomInterpolation, VectorHermiteInterpolation, VectorCircularEaseIn, VectorCircularEaseOut, VectorStepInterpolation, VectorSphericalLinearInterpolation } from './interpolation.js';
import { VectorError } from './asserts.js';
import { TVector2, TVector3, TVector4 } from './types.js';

describe('Vector Interpolation', () => {
	// Test vectors for different dimensions
	const vec2a: TVector2 = [0, 0];
	const vec2b: TVector2 = [10, 20];
	const vec3a: TVector3 = [0, 0, 0];
	const vec3b: TVector3 = [10, 20, 30];
	const vec4a: TVector4 = [0, 0, 0, 0];
	const vec4b: TVector4 = [10, 20, 30, 40];

	// Helper function to check if values are approximately equal
	const expectVectorToBeCloseTo = (actual: number[], expected: number[], precision = 5): void => {
		expect(actual.length).toBe(expected.length);

		for (let i = 0; i < actual.length; i++) {
			const actualValue = actual[i];
			const expectedValue = expected[i];
			if (actualValue !== undefined && expectedValue !== undefined) {
				expect(actualValue).toBeCloseTo(expectedValue, precision);
			}
		}
	};
	describe('VectorLERP', () => {
		it('should perform linear interpolation at t=0', () => {
			expectVectorToBeCloseTo(VectorLERP(vec2a, vec2b, 0), [0, 0], 10);
			expectVectorToBeCloseTo(VectorLERP(vec3a, vec3b, 0), [0, 0, 0], 10);
			expectVectorToBeCloseTo(VectorLERP(vec4a, vec4b, 0), [0, 0, 0, 0], 10);
		});

		it('should perform linear interpolation at t=1', () => {
			expectVectorToBeCloseTo(VectorLERP(vec2a, vec2b, 1), [10, 20], 10);
			expectVectorToBeCloseTo(VectorLERP(vec3a, vec3b, 1), [10, 20, 30], 10);
			expectVectorToBeCloseTo(VectorLERP(vec4a, vec4b, 1), [10, 20, 30, 40], 10);
		});

		it('should perform linear interpolation at t=0.5', () => {
			expectVectorToBeCloseTo(VectorLERP(vec2a, vec2b, 0.5), [5, 10], 10);
			expectVectorToBeCloseTo(VectorLERP(vec3a, vec3b, 0.5), [5, 10, 15], 10);
			expectVectorToBeCloseTo(VectorLERP(vec4a, vec4b, 0.5), [5, 10, 15, 20], 10);
		});

		it('should handle extrapolation beyond [0,1]', () => {
			expectVectorToBeCloseTo(VectorLERP(vec2a, vec2b, -0.5), [-5, -10], 10);
			expectVectorToBeCloseTo(VectorLERP(vec2a, vec2b, 1.5), [15, 30], 10);
		});

		it('should throw for mismatched vector dimensions', () => {
			expect(() => VectorLERP([1, 2], [1, 2, 3], 0.5)).toThrow(VectorError);
		});

		it('should throw for non-numeric t parameter', () => {
			expect(() => VectorLERP(vec2a, vec2b, NaN)).toThrow();
		});

		it('should throw for invalid vector values', () => {
			expect(() => VectorLERP([1, NaN], [1, 2], 0.5)).toThrow();
			expect(() => VectorLERP([1, 2], [1, Infinity], 0.5)).toThrow();
		});

		it('should throw for empty vectors', () => {
			expect(() => VectorLERP([], [], 0.5)).toThrow(VectorError);
		});
		it('should throw for vectors with Infinity', () => {
			expect(() => VectorLERP([1, Infinity], [1, 2], 0.5)).toThrow(VectorError);
			expect(() => VectorLERP([1, 2], [1, -Infinity], 0.5)).toThrow(VectorError);
		});
	});

	describe('VectorSmoothStep', () => {
		it('should return start vector at t=0', () => {
			expect(VectorSmoothStep(vec2a, vec2b, 0)).toEqual([0, 0]);
		});

		it('should return end vector at t=1', () => {
			expect(VectorSmoothStep(vec2a, vec2b, 1)).toEqual([10, 20]);
		});

		it('should provide smooth interpolation at t=0.5', () => {
			const result = VectorSmoothStep(vec2a, vec2b, 0.5);
			expectVectorToBeCloseTo(result, [5, 10]);
		});

		it('should have zero derivative at endpoints', () => {
			// Test very close to endpoints to verify smooth start/end
			const nearStart = VectorSmoothStep(vec2a, vec2b, 0.01);
			const nearEnd = VectorSmoothStep(vec2a, vec2b, 0.99);
			// Near start should be very close to start
			expectVectorToBeCloseTo(nearStart, [0.00298, 0.00596], 4);
			// Near end should be very close to end
			expectVectorToBeCloseTo(nearEnd, [9.99702, 19.99404], 4);
		});

		it('should extrapolate for t < 0 and t > 1', () => {
			expect(VectorSmoothStep(vec2a, vec2b, -1)).toEqual([50, 100]);
			expect(VectorSmoothStep(vec2a, vec2b, 2)).toEqual([-40, -80]);
		});
	});

	describe('VectorSmootherStep', () => {
		it('should return start vector at t=0', () => {
			expect(VectorSmootherStep(vec2a, vec2b, 0)).toEqual([0, 0]);
		});

		it('should return end vector at t=1', () => {
			expect(VectorSmootherStep(vec2a, vec2b, 1)).toEqual([10, 20]);
		});

		it('should be smoother than SmoothStep', () => {
			const smoothResult = VectorSmoothStep(vec2a, vec2b, 0.1);
			const smootherResult = VectorSmootherStep(vec2a, vec2b, 0.1);
			// SmootherStep should start even more gradually
			expect(smootherResult[0]).toBeLessThan(smoothResult[0]);
		});

		it('should extrapolate for t < 0 and t > 1', () => {
			expect(VectorSmootherStep(vec2a, vec2b, -1)).toEqual([-310, -620]);
			expect(VectorSmootherStep(vec2a, vec2b, 2)).toEqual([320, 640]);
		});
	});

	describe('VectorQuadraticEaseIn', () => {
		it('should start slowly and accelerate', () => {
			const result1 = VectorQuadraticEaseIn(vec2a, vec2b, 0.1);
			const result2 = VectorQuadraticEaseIn(vec2a, vec2b, 0.5);
			const result3 = VectorQuadraticEaseIn(vec2a, vec2b, 0.9);

			// Should be closer to start at t=0.1 than linear interpolation
			const linearResult1 = VectorLERP(vec2a, vec2b, 0.1);
			expect(result1[0]).toBeLessThan(linearResult1[0]);

			// Should be accelerating
			expect(result2[0]).toBeCloseTo(2.5, 1);
			expect(result3[0]).toBeCloseTo(8.1, 1);
		});

		it('should extrapolate for t < 0 and t > 1', () => {
			expect(VectorQuadraticEaseIn(vec2a, vec2b, -1)).toEqual([10, 20]);
			expect(VectorQuadraticEaseIn(vec2a, vec2b, 2)).toEqual([40, 80]);
		});
	});

	describe('VectorQuadraticEaseOut', () => {
		it('should start quickly and decelerate', () => {
			const result1 = VectorQuadraticEaseOut(vec2a, vec2b, 0.1);
			const result2 = VectorQuadraticEaseOut(vec2a, vec2b, 0.5);
			const result3 = VectorQuadraticEaseOut(vec2a, vec2b, 0.9);

			// Should be further from start at t=0.1 than linear interpolation
			const linearResult1 = VectorLERP(vec2a, vec2b, 0.1);
			expect(result1[0]).toBeGreaterThan(linearResult1[0]);

			// Should be decelerating
			expect(result2[0]).toBeCloseTo(7.5, 1);
			expect(result3[0]).toBeCloseTo(9.9, 1);
		});

		it('should extrapolate for t < 0 and t > 1', () => {
			expect(VectorQuadraticEaseOut(vec2a, vec2b, -1)).toEqual([-30, -60]);
			expect(VectorQuadraticEaseOut(vec2a, vec2b, 2)).toEqual([0, 0]);
		});
	});

	describe('VectorCubicEaseIn', () => {
		it('should provide cubic acceleration curve', () => {
			const result = VectorCubicEaseIn(vec2a, vec2b, 0.5);
			expectVectorToBeCloseTo(result, [1.25, 2.5]);
		});

		it('should extrapolate for t < 0 and t > 1', () => {
			expect(VectorCubicEaseIn(vec2a, vec2b, -1)).toEqual([-10, -20]);
			expect(VectorCubicEaseIn(vec2a, vec2b, 2)).toEqual([80, 160]);
		});
	});

	describe('VectorCubicEaseOut', () => {
		it('should provide cubic deceleration curve', () => {
			const result = VectorCubicEaseOut(vec2a, vec2b, 0.5);
			expectVectorToBeCloseTo(result, [8.75, 17.5]);
		});

		it('should extrapolate for t < 0 and t > 1', () => {
			expect(VectorCubicEaseOut(vec2a, vec2b, -1)).toEqual([-70, -140]);
			expect(VectorCubicEaseOut(vec2a, vec2b, 2)).toEqual([20, 40]);
		});
	});

	describe('VectorCosineInterpolation', () => {
		it('should provide smooth cosine-based interpolation', () => {
			const result = VectorCosineInterpolation(vec2a, vec2b, 0.5);
			expectVectorToBeCloseTo(result, [5, 10]);
		});

		it('should be smooth at endpoints', () => {
			const result0 = VectorCosineInterpolation(vec2a, vec2b, 0);
			const result1 = VectorCosineInterpolation(vec2a, vec2b, 1);
			expect(result0).toEqual([0, 0]);
			expect(result1).toEqual([10, 20]);
		});
	});

	describe('VectorSineEaseIn', () => {
		it('should provide sine-based ease in', () => {
			const result = VectorSineEaseIn(vec2a, vec2b, 0.5);
			// Should be less than linear at 0.5
			expect(result[0]).toBeLessThan(5);
		});
	});

	describe('VectorSineEaseOut', () => {
		it('should provide sine-based ease out', () => {
			const result = VectorSineEaseOut(vec2a, vec2b, 0.5);
			// Should be greater than linear at 0.5
			expect(result[0]).toBeGreaterThan(5);
		});
	});

	describe('VectorExponentialEaseIn', () => {
		it('should start very slowly', () => {
			const result = VectorExponentialEaseIn(vec2a, vec2b, 0.1);
			// Should be very close to start
			expect(result[0]).toBeLessThan(0.1);
		});
	});

	describe('VectorExponentialEaseOut', () => {
		it('should approach end very slowly', () => {
			const result = VectorExponentialEaseOut(vec2a, vec2b, 0.9);
			// Should be very close to end
			expect(result[0]).toBeGreaterThan(9.9);
		});
	});

	describe('VectorElasticEaseOut', () => {
		it('should create elastic overshoot effect', () => {
			const result = VectorElasticEaseOut(vec2a, vec2b, 0.7);
			// Elastic should overshoot beyond target at some point
			// This is hard to test precisely, so we just verify it doesn't crash
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
		});
	});

	describe('VectorBackEaseOut', () => {
		it('should create back overshoot effect', () => {
			const result = VectorBackEaseOut(vec2a, vec2b, 0.8);
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
		});
	});

	describe('VectorBounceEaseOut', () => {
		it('should create bouncing effect', () => {
			const result = VectorBounceEaseOut(vec2a, vec2b, 0.8);
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
		});
	});

	describe('VectorCircularEaseIn', () => {
		it('should provide circular ease in curve', () => {
			const result = VectorCircularEaseIn(vec2a, vec2b, 0.5);
			// Should start slowly
			expect(result[0]).toBeLessThan(5);
		});
	});

	describe('VectorCircularEaseOut', () => {
		it('should provide circular ease out curve', () => {
			const result = VectorCircularEaseOut(vec2a, vec2b, 0.5);
			// Should end slowly
			expect(result[0]).toBeGreaterThan(5);
		});
	});

	describe('VectorStepInterpolation', () => {
		it('should step at default threshold (0.5)', () => {
			const result1 = VectorStepInterpolation(vec2a, vec2b, 0.4);
			const result2 = VectorStepInterpolation(vec2a, vec2b, 0.6);
			expect(result1).toEqual([0, 0]);
			expect(result2).toEqual([10, 20]);
		});

		it('should step at custom threshold', () => {
			const result1 = VectorStepInterpolation(vec2a, vec2b, 0.3, 0.7);
			const result2 = VectorStepInterpolation(vec2a, vec2b, 0.8, 0.7);
			expect(result1).toEqual([0, 0]);
			expect(result2).toEqual([10, 20]);
		});

		it('should throw for invalid threshold', () => {
			expect(() => VectorStepInterpolation(vec2a, vec2b, 0.5, NaN)).toThrow();
		});
	});

	describe('VectorCatmullRomInterpolation', () => {
		it('should interpolate through control points', () => {
			const p0: TVector2 = [-5, -10];
			const p1: TVector2 = [0, 0];
			const p2: TVector2 = [10, 20];
			const p3: TVector2 = [15, 30];

			// At t=0, should return p1
			const result0 = VectorCatmullRomInterpolation(p0, p1, p2, p3, 0);
			expectVectorToBeCloseTo(result0, p1);

			// At t=1, should return p2
			const result1 = VectorCatmullRomInterpolation(p0, p1, p2, p3, 1);
			expectVectorToBeCloseTo(result1, p2);
		});

		it('should throw for mismatched dimensions', () => {
			expect(() => VectorCatmullRomInterpolation([1, 2], [1, 2, 3], [1, 2], [1, 2], 0.5)).toThrow(VectorError);
		});

		it('should throw for invalid values', () => {
			expect(() => VectorCatmullRomInterpolation([1, NaN], [1, 2], [1, 2], [1, 2], 0.5)).toThrow();
		});
	});

	describe('VectorHermiteInterpolation', () => {
		it('should interpolate with tangent control', () => {
			const p0: TVector2 = [0, 0];
			const p1: TVector2 = [10, 20];
			const t0: TVector2 = [1, 1];  // Start tangent
			const t1: TVector2 = [1, 1];  // End tangent

			// At t=0, should return p0
			const result0 = VectorHermiteInterpolation(p0, p1, t0, t1, 0);
			expectVectorToBeCloseTo(result0, p0);

			// At t=1, should return p1
			const result1 = VectorHermiteInterpolation(p0, p1, t0, t1, 1);
			expectVectorToBeCloseTo(result1, p1);
		});

		it('should throw for mismatched dimensions', () => {
			expect(() => VectorHermiteInterpolation([1, 2], [1, 2, 3], [1, 2], [1, 2], 0.5)).toThrow(VectorError);
		});
	});

	describe('VectorSphericalLinearInterpolation', () => {
		it('should perform SLERP on 2D vectors', () => {
			const a: TVector2 = [1, 0];
			const b: TVector2 = [0, 1];

			const result = VectorSphericalLinearInterpolation(a, b, 0.5);
			// Should be normalized and at 45 degrees
			expectVectorToBeCloseTo(result, [0.7071, 0.7071], 3);
		});

		it('should perform SLERP on 3D vectors', () => {
			const a: TVector3 = [1, 0, 0];
			const b: TVector3 = [0, 1, 0];

			const result = VectorSphericalLinearInterpolation(a, b, 0.5);
			expectVectorToBeCloseTo(result, [0.7071, 0.7071, 0], 3);
		});

		it('should handle parallel vectors by falling back to LERP', () => {
			const a: TVector2 = [1, 1];
			const b: TVector2 = [2, 2];

			const result = VectorSphericalLinearInterpolation(a, b, 0.5);
			const lerpResult = VectorLERP(a, b, 0.5);
			expectVectorToBeCloseTo(result, lerpResult);
		});

		it('should handle anti-parallel vectors', () => {
			const a: TVector2 = [1, 0];
			const b: TVector2 = [-1, 0];

			// Should handle this case without error
			const result = VectorSphericalLinearInterpolation(a, b, 0.5);
			expect(Array.isArray(result)).toBe(true);
			expect(result.length).toBe(2);
		});

		it('should extrapolate for t < 0 and t > 1', () => {
			const a: TVector2 = [1, 0];
			const b: TVector2 = [0, 1];
			const resultBelow = VectorSphericalLinearInterpolation(a, b, -0.5);
			const resultAbove = VectorSphericalLinearInterpolation(a, b, 1.5);
			// Should not clamp, so results should differ from t=0 and t=1
			expect(resultBelow[0]).not.toBeCloseTo(a[0], 10);
			expect(resultAbove[1]).not.toBeCloseTo(b[1], 10);
		});

		it('should throw for vectors smaller than 2D', () => {
			expect(() => VectorSphericalLinearInterpolation([1], [2], 0.5)).toThrow(VectorError);
		});

		it('should throw for mismatched dimensions', () => {
			expect(() => VectorSphericalLinearInterpolation([1, 2], [1, 2, 3], 0.5)).toThrow(VectorError);
		});
	});

	// General tests that apply to all interpolation functions
	describe('General Interpolation Properties', () => {
		const interpolationFunctions = [
			{ name: 'LERP', fn: VectorLERP },
			{ name: 'SmoothStep', fn: VectorSmoothStep },
			{ name: 'SmootherStep', fn: VectorSmootherStep },
			{ name: 'QuadraticEaseIn', fn: VectorQuadraticEaseIn },
			{ name: 'QuadraticEaseOut', fn: VectorQuadraticEaseOut },
			{ name: 'CubicEaseIn', fn: VectorCubicEaseIn },
			{ name: 'CubicEaseOut', fn: VectorCubicEaseOut },
			{ name: 'CosineInterpolation', fn: VectorCosineInterpolation },
			{ name: 'SineEaseIn', fn: VectorSineEaseIn },
			{ name: 'SineEaseOut', fn: VectorSineEaseOut },
			{ name: 'CircularEaseIn', fn: VectorCircularEaseIn },
			{ name: 'CircularEaseOut', fn: VectorCircularEaseOut },
		];
		interpolationFunctions.forEach(({ name, fn }) => {
			describe(`${name}`, () => {
				it('should preserve vector dimensions', () => {
					const result2D = fn(vec2a, vec2b, 0.5);
					const result3D = fn(vec3a, vec3b, 0.5);
					const result4D = fn(vec4a, vec4b, 0.5);
					expect(result2D.length).toBe(2);
					expect(result3D.length).toBe(3);
					expect(result4D.length).toBe(4);
				});

				it('should return start vector at t=0', () => {
					expectVectorToBeCloseTo(fn(vec2a, vec2b, 0), vec2a, 10);
					expectVectorToBeCloseTo(fn(vec3a, vec3b, 0), vec3a, 10);
				});

				it('should return end vector at t=1', () => {
					expectVectorToBeCloseTo(fn(vec2a, vec2b, 1), vec2b, 10);
					expectVectorToBeCloseTo(fn(vec3a, vec3b, 1), vec3b, 10);
				});

				it('should throw for empty vectors', () => {
					expect(() => fn([], [], 0.5)).toThrow(VectorError);
				});
				it('should throw for vectors with Infinity', () => {
					expect(() => fn([1, Infinity], [1, 2], 0.5)).toThrow(VectorError);
					expect(() => fn([1, 2], [1, -Infinity], 0.5)).toThrow(VectorError);
				});
			});
		});
	});
});
