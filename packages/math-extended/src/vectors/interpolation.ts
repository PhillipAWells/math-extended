/**
 * Vector interpolation functions for smooth animation and transitions.
 * Provides component-wise interpolation using various easing and interpolation algorithms.
 */

import { GetErrorMessage } from '@pawells/typescript-common';
import { AssertNumber } from '../internal/guards.js';
import { Clamp } from '../clamp.js';
import { LinearInterpolation, SmoothStep, SmootherStep, QuadraticEaseIn, QuadraticEaseOut, QuadraticEaseInOut, CubicEaseIn, CubicEaseOut, CubicEaseInOut, CosineInterpolation, SineEaseIn, SineEaseOut, SineEaseInOut, ExponentialEaseIn, ExponentialEaseOut, ExponentialEaseInOut, ElasticEaseIn, ElasticEaseOut, ElasticEaseInOut, BackEaseIn, BackEaseOut, BackEaseInOut, BounceEaseIn, BounceEaseOut, BounceEaseInOut, CatmullRomInterpolation, HermiteInterpolation, CircularEaseIn, CircularEaseOut, CircularEaseInOut, StepInterpolation } from '../interpolation.js';
import { VectorNormalize, VectorDot } from './core.js';
import type { TVector, TVectorResult } from './types.js';
import { VECTOR_NONEMPTY_SCHEMA } from './types.js';
import { AssertVector, AssertVectorSameSize, VectorError } from './asserts.js';

/**
 * Helper function to apply interpolation function to vectors component-wise.
 * Internal utility for consistent vector interpolation across different algorithms.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter (0 = a, 1 = b)
 * @param interpolationFn - The interpolation function to apply to each component
 * @returns Interpolated vector with same type as input
 */
function vectorInterpolate<T extends TVector>(a: T, b: T, t: number, interpolationFn: (a: number, b: number, t: number) => number): TVectorResult<T> {
	try {
		VECTOR_NONEMPTY_SCHEMA.parse(a);
		VECTOR_NONEMPTY_SCHEMA.parse(b);
	}
	catch (error) {
		const message = GetErrorMessage(error);
		throw new VectorError(`Invalid vectors for interpolation: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
	}
	AssertNumber(t, { finite: true });

	if (a.length !== b.length) {
		throw new VectorError(`Vectors must have the same length: ${a.length} !== ${b.length}`);
	}

	const result: number[] = [];

	for (let i = 0; i < a.length; i++) {
		const av = a[i];
		const bv = b[i];
		result.push(interpolationFn(av, bv, t));
	}

	return result as TVectorResult<T>;
}

/**
 * Performs linear interpolation (LERP) between two vectors.
 * The most basic and commonly used interpolation method, providing
 * constant velocity transition between vectors.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector (when t = 0)
 * @param b - End vector (when t = 1)
 * @param t - Interpolation parameter (0 = a, 1 = b, values outside [0,1] extrapolate)
 * @returns Linearly interpolated vector
 *
 * @example
 * ```typescript
 * const start = [0, 0, 0];
 * const end = [10, 20, 30];
 * const halfway = VectorLERP(start, end, 0.5); // [5, 10, 15]
 * const quarter = VectorLERP(start, end, 0.25); // [2.5, 5, 7.5]
 * ```
 */
export function VectorLERP<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, LinearInterpolation);
}

/**
 * Performs smooth step interpolation between two vectors.
 * Uses Hermite interpolation (3t² - 2t³) for smooth acceleration and deceleration.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter (clamped to [0,1])
 * @returns Smoothly interpolated vector with smooth start and end
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [100, 200];
 * const smooth = VectorSmoothStep(start, end, 0.5); // Smooth transition
 * ```
 */
export function VectorSmoothStep<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, SmoothStep);
}

/**
 * Performs smoother step interpolation between two vectors.
 * Uses Ken Perlin's improved smoothstep (6t⁵ - 15t⁴ + 10t³) for even smoother transitions.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter (clamped to [0,1])
 * @returns Very smoothly interpolated vector with smooth acceleration/deceleration
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0, 0];
 * const end = [10, 20, 30];
 * const result = VectorSmootherStep(start, end, 0.5); // [5, 10, 15]
 * ```
 */
export function VectorSmootherStep<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, SmootherStep);
}

/**
 * Performs quadratic ease-in interpolation between two vectors.
 * Starts slowly and accelerates toward the end (t²).
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with quadratic acceleration from start
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorQuadraticEaseIn(start, end, 0.5); // [2.5, 5]
 * ```
 */
export function VectorQuadraticEaseIn<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, QuadraticEaseIn);
}

/**
 * Performs quadratic ease-out interpolation between two vectors.
 * Starts quickly and decelerates toward the end (1 - (1-t)²).
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with quadratic deceleration toward end
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorQuadraticEaseOut(start, end, 0.5); // [7.5, 15]
 * ```
 */
export function VectorQuadraticEaseOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, QuadraticEaseOut);
}

/**
 * Performs cubic ease-in interpolation between two vectors.
 * Starts very slowly and accelerates toward the end (t³).
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with cubic acceleration from start
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorCubicEaseIn(start, end, 0.5); // [1.25, 2.5]
 * ```
 */
export function VectorCubicEaseIn<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, CubicEaseIn);
}

/**
 * Performs cubic ease-out interpolation between two vectors.
 * Starts quickly and decelerates toward the end (1 - (1-t)³).
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with cubic deceleration toward end
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorCubicEaseOut(start, end, 0.5); // [8.75, 17.5]
 * ```
 */
export function VectorCubicEaseOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, CubicEaseOut);
}

/**
 * Performs cosine-based interpolation between two vectors.
 * Uses cosine function for smooth, natural-feeling transitions.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector interpolated using cosine curve
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorCosineInterpolation(start, end, 0.5); // [5, 10]
 * ```
 */
export function VectorCosineInterpolation<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, CosineInterpolation);
}

/**
 * Performs sine ease-in interpolation between two vectors.
 * Starts slowly and accelerates using sine curve.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with sine-based acceleration from start
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorSineEaseIn(start, end, 0.5); // approx [2.93, 5.86]
 * ```
 */
export function VectorSineEaseIn<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, SineEaseIn);
}

/**
 * Performs sine ease-out interpolation between two vectors.
 * Starts quickly and decelerates using sine curve.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with sine-based deceleration toward end
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorSineEaseOut(start, end, 0.5); // approx [7.07, 14.14]
 * ```
 */
export function VectorSineEaseOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, SineEaseOut);
}

/**
 * Performs exponential ease-in interpolation between two vectors.
 * Starts very slowly and accelerates exponentially.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with exponential acceleration from start
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorExponentialEaseIn(start, end, 0.5); // approx [0.31, 0.63]
 * ```
 */
export function VectorExponentialEaseIn<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, ExponentialEaseIn);
}

/**
 * Performs exponential ease-out interpolation between two vectors.
 * Starts quickly and decelerates exponentially.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with exponential deceleration toward end
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorExponentialEaseOut(start, end, 0.5); // approx [9.69, 19.37]
 * ```
 */
export function VectorExponentialEaseOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, ExponentialEaseOut);
}

/**
 * Performs elastic ease-out interpolation between two vectors.
 * Creates a springy, elastic effect that overshoots and bounces back.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with elastic bounce effect toward end
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorElasticEaseOut(start, end, 0.5); // overshoots then returns near [10, 20]
 * ```
 */
export function VectorElasticEaseOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, ElasticEaseOut);
}

/**
 * Performs back ease-out interpolation between two vectors.
 * Overshoots the target and then backs into place, like a spring.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with back overshoot effect toward end
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorBackEaseOut(start, end, 0.5); // overshoots then settles near [10, 20]
 * ```
 */
export function VectorBackEaseOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, BackEaseOut);
}

/**
 * Performs bounce ease-out interpolation between two vectors.
 * Creates a bouncing ball effect with decreasing amplitude.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with bouncing effect toward end
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorBounceEaseOut(start, end, 0.5); // bounces near the end position
 * ```
 */
export function VectorBounceEaseOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, BounceEaseOut);
}

/**
 * Performs Catmull-Rom spline interpolation between vectors for smooth curves.
 * Uses four control points to create smooth curves through p1 and p2.
 *
 * @template T - The vector type extending TVector
 * @param p0 - Previous control point
 * @param p1 - Start point (returned when t = 0)
 * @param p2 - End point (returned when t = 1)
 * @param p3 - Next control point
 * @param t - Interpolation parameter [0,1]
 * @returns Smoothly interpolated vector using Catmull-Rom spline
 *
 * @example
 * ```typescript
 * const path = [
 *   [0, 0],   // p0 - previous point
 *   [10, 0],  // p1 - start
 *   [20, 10], // p2 - end
 *   [30, 10]  // p3 - next point
 * ];
 * const smooth = VectorCatmullRomInterpolation(...path, 0.5);
 * ```
 * @throws {VectorError} If any control point is not a valid vector, if the control
 *   points differ in component count, or if `t` is non-finite
 */
export function VectorCatmullRomInterpolation<T extends TVector>(p0: T, p1: T, p2: T, p3: T, t: number): TVectorResult<T> {
	AssertVector(p0);
	AssertVector(p1);
	AssertVector(p2);
	AssertVector(p3);
	AssertVectorSameSize([p0, p1, p2, p3]);
	AssertNumber(t, { finite: true });

	const result: number[] = [];

	for (let i = 0; i < p0.length; i++) {
		const p0v = p0[i];
		const p1v = p1[i];
		const p2v = p2[i];
		const p3v = p3[i];
		result.push(CatmullRomInterpolation(p0v, p1v, p2v, p3v, t));
	}

	return result as TVectorResult<T>;
}

/**
 * Performs Hermite interpolation between vectors with tangent control.
 * Provides precise control over the curve's tangent vectors at start and end points.
 *
 * @template T - The vector type extending TVector
 * @param p0 - Start point (returned when t = 0)
 * @param p1 - End point (returned when t = 1)
 * @param t0 - Tangent vector at start point
 * @param t1 - Tangent vector at end point
 * @param t - Interpolation parameter [0,1]
 * @returns Vector interpolated using Hermite spline with tangent control
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 10];
 * const startTangent = [5, 0]; // Horizontal tangent at start
 * const endTangent = [0, 5];   // Vertical tangent at end
 * const curved = VectorHermiteInterpolation(start, end, startTangent, endTangent, 0.5);
 * ```
 * @throws {VectorError} If any vector argument is invalid, if the vectors differ in
 *   component count, or if `t` is non-finite
 */
export function VectorHermiteInterpolation<T extends TVector>(p0: T, p1: T, t0: T, t1: T, t: number): TVectorResult<T> {
	AssertVector(p0);
	AssertVector(p1);
	AssertVector(t0);
	AssertVector(t1);
	AssertVectorSameSize([p0, p1, t0, t1]);
	AssertNumber(t, { finite: true });

	const result: number[] = [];

	for (let i = 0; i < p0.length; i++) {
		const p0v = p0[i];
		const p1v = p1[i];
		const t0v = t0[i];
		const t1v = t1[i];
		result.push(HermiteInterpolation(p0v, p1v, t0v, t1v, t));
	}

	return result as TVectorResult<T>;
}

/**
 * Performs circular ease-in interpolation between two vectors.
 * Starts very slowly and accelerates using a circular arc.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with circular acceleration from start
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorCircularEaseIn(start, end, 0.5); // approx [1.34, 2.68]
 * ```
 */
export function VectorCircularEaseIn<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, CircularEaseIn);
}

/**
 * Performs circular ease-out interpolation between two vectors.
 * Starts quickly and decelerates using a circular arc.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Vector with circular deceleration toward end
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorCircularEaseOut(start, end, 0.5); // approx [8.66, 17.32]
 * ```
 */
export function VectorCircularEaseOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, CircularEaseOut);
}

/**
 * Performs step interpolation between two vectors.
 * Abruptly switches from start to end vector at the specified threshold.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector (returned when t < threshold)
 * @param b - End vector (returned when t >= threshold)
 * @param t - Interpolation parameter [0,1]
 * @param threshold - Threshold value for the step (default: 0.5)
 * @returns Either the start or end vector based on threshold comparison
 *
 * @example
 * ```typescript
 * const off = [0, 0];
 * const on = [1, 1];
 * const result1 = VectorStepInterpolation(off, on, 0.3); // [0, 0] (< 0.5)
 * const result2 = VectorStepInterpolation(off, on, 0.7); // [1, 1] (>= 0.5)
 * ```
 * @throws {VectorError} If either vector is invalid, if the vectors differ in component
 *   count, or if `t` or `threshold` is non-finite
 */
export function VectorStepInterpolation<T extends TVector>(a: T, b: T, t: number, threshold = 0.5): TVectorResult<T> {
	AssertVector(a);
	AssertVector(b);
	AssertVectorSameSize([a, b]);
	AssertNumber(t, { finite: true });
	AssertNumber(threshold, { finite: true });

	const result: number[] = [];

	for (let i = 0; i < a.length; i++) {
		const av = a[i];
		const bv = b[i];
		result.push(StepInterpolation(av, bv, t, threshold));
	}

	return result as TVectorResult<T>;
}

/**
 * Performs quadratic ease-in-out interpolation between two vectors.
 * Symmetrically accelerates at the start and decelerates at the end (2t² / 1−(−2t+2)²/2).
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Component-wise interpolated vector with quadratic symmetric easing
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorQuadraticEaseInOut(start, end, 0.5); // [5, 10]
 * ```
 */
export function VectorQuadraticEaseInOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, QuadraticEaseInOut);
}

/**
 * Performs cubic ease-in-out interpolation between two vectors.
 * More pronounced symmetrical acceleration/deceleration than quadratic (4t³ / 1−(−2t+2)³/2).
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Component-wise interpolated vector with cubic symmetric easing
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorCubicEaseInOut(start, end, 0.5); // [5, 10]
 * ```
 */
export function VectorCubicEaseInOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, CubicEaseInOut);
}

/**
 * Performs sine ease-in-out interpolation between two vectors.
 * Smooth symmetric easing based on a cosine curve — gentle and natural feeling.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Component-wise interpolated vector with sine symmetric easing
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorSineEaseInOut(start, end, 0.5); // [5, 10]
 * ```
 */
export function VectorSineEaseInOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, SineEaseInOut);
}

/**
 * Performs exponential ease-in-out interpolation between two vectors.
 * Very slow at both ends with an extremely rapid transition in the middle.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Component-wise interpolated vector with exponential symmetric easing
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorExponentialEaseInOut(start, end, 0.5); // [5, 10]
 * ```
 */
export function VectorExponentialEaseInOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, ExponentialEaseInOut);
}

/**
 * Performs circular ease-in-out interpolation between two vectors.
 * Smooth symmetric arc-based easing using a circular curve.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Component-wise interpolated vector with circular symmetric easing
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorCircularEaseInOut(start, end, 0.5); // [5, 10]
 * ```
 */
export function VectorCircularEaseInOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, CircularEaseInOut);
}

/**
 * Performs elastic ease-in interpolation between two vectors.
 * Spring-like acceleration from rest — starts with a backward bounce then launches forward.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Component-wise interpolated vector with elastic acceleration from start
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorElasticEaseIn(start, end, 0.5); // oscillates near start before launching
 * ```
 */
export function VectorElasticEaseIn<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, ElasticEaseIn);
}

/**
 * Performs elastic ease-in-out interpolation between two vectors.
 * Spring-like oscillation at both the start and end of the motion.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Component-wise interpolated vector with elastic oscillation at both ends
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorElasticEaseInOut(start, end, 0.5); // [5, 10] at midpoint
 * ```
 */
export function VectorElasticEaseInOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, ElasticEaseInOut);
}

/**
 * Performs back ease-in interpolation between two vectors.
 * Applies a slight backward pull before launching forward from the start.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Component-wise interpolated vector with back overshoot at start
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorBackEaseIn(start, end, 0.5); // dips back before accelerating
 * ```
 */
export function VectorBackEaseIn<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, BackEaseIn);
}

/**
 * Performs back ease-in-out interpolation between two vectors.
 * Slight backward pull at both ends before and after the main forward motion.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Component-wise interpolated vector with back overshoot at both ends
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorBackEaseInOut(start, end, 0.5); // [5, 10] at midpoint
 * ```
 */
export function VectorBackEaseInOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, BackEaseInOut);
}

/**
 * Performs bounce ease-in interpolation between two vectors.
 * Bouncing ball effect at the start — multiple bounces before settling at the target.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Component-wise interpolated vector with bounce effect at start
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorBounceEaseIn(start, end, 0.5); // bounces near start position
 * ```
 */
export function VectorBounceEaseIn<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, BounceEaseIn);
}

/**
 * Performs bounce ease-in-out interpolation between two vectors.
 * Bouncing ball effect at both the start and end of the motion.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector
 * @param b - End vector
 * @param t - Interpolation parameter [0,1]
 * @returns Component-wise interpolated vector with bounce effect at both ends
 * @throws {VectorError} If either vector is invalid or if `t` is non-finite
 *
 * @example
 * ```typescript
 * const start = [0, 0];
 * const end = [10, 20];
 * const result = VectorBounceEaseInOut(start, end, 0.5); // [5, 10] at midpoint
 * ```
 */
export function VectorBounceEaseInOut<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	return vectorInterpolate(a, b, t, BounceEaseInOut);
}

/** Threshold below which SLERP falls back to linear interpolation (nearly parallel vectors). */
const SLERP_LINEARITY_THRESHOLD = 0.001;

/**
 * Performs spherical linear interpolation (SLERP) between two vectors.
 * Interpolates along the shortest path on the unit sphere, maintaining constant angular velocity.
 * Particularly useful for smooth rotation interpolation and direction vectors.
 *
 * @template T - The vector type extending TVector
 * @param a - Start vector (will be normalized internally)
 * @param b - End vector (will be normalized internally)
 * @param t - Interpolation parameter (0 = a, 1 = b, allows extrapolation)
 * @returns Spherically interpolated vector maintaining unit length
 *
 * @example
 * ```typescript
 * const dir1 = [1, 0, 0];
 * const dir2 = [0, 1, 0];
 * const slerp = VectorSphericalLinearInterpolation(dir1, dir2, 0.5);
 * // Result maintains unit length and follows shortest spherical path
 * ```
 * @throws {VectorError} If either vector is invalid, if the vectors differ in component
 *   count, if either vector has fewer than 2 dimensions, or if `t` is non-finite
 */
export function VectorSphericalLinearInterpolation<T extends TVector>(a: T, b: T, t: number): TVectorResult<T> {
	AssertVector(a);
	AssertVector(b);
	AssertVectorSameSize([a, b]);
	AssertNumber(t, { finite: true });

	if (a.length < 2) {
		throw new VectorError('Spherical linear interpolation requires vectors of at least 2 dimensions');
	}

	// Do not clamp t, allow extrapolation
	const normalizedA = VectorNormalize(a);
	const normalizedB = VectorNormalize(b);

	const dot = Clamp(VectorDot(normalizedA, normalizedB), -1, 1);
	const theta = Math.acos(dot);
	// If vectors are nearly parallel, use linear interpolation
	if (Math.abs(theta) < SLERP_LINEARITY_THRESHOLD) {
		return VectorLERP(a, b, t);
	}

	const sinTheta = Math.sin(theta);
	const weightA = Math.sin((1 - t) * theta) / sinTheta;
	const weightB = Math.sin(t * theta) / sinTheta;

	// Manually create the result to maintain proper typing
	const result: number[] = [];

	for (let i = 0; i < a.length; i++) {
		const ai = a[i];
		const bi = b[i];
		result.push((ai * weightA) + (bi * weightB));
	}

	return result as TVectorResult<T>;
}
