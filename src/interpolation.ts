import { Clamp } from './clamp.js';

// ---- Polynomial interpolation constants ----
const CUBIC = 3;                 // t³ power used in cubic ease, smooth step, etc.
const QUARTIC = 4;               // t⁴ power used in smoother step / catmull-rom
const QUINTIC = 5;               // t⁵ power used in smoother step
// Perlin's smootherstep formula coefficients: 6t⁵ − 15t⁴ + 10t³
// These create a smooth curve with zero first and second derivatives at endpoints
const SMOOTHER_COEFF_A = 6;     // 6t⁵ coefficient in SmootherStep
const SMOOTHER_COEFF_B = 15;    // 15t⁴ coefficient in SmootherStep
const SMOOTHER_COEFF_C = 10;    // 10t³ coefficient in SmootherStep
// ---- Exponential / elastic ease constants ----
const EXP_SCALE = 10;           // scale factor for exponential easing: 2^(±10*t)
const ELASTIC_OFFSET = 0.75;    // phase offset in elastic formula
// ---- Catmull-Rom spline constants ----
const CATMULL_HALF = 0.5;       // ½ scale factor in Catmull-Rom formula
const CATMULL_5 = 5;            // −5p₁ coefficient in Catmull-Rom
// ---- Hermite basis coefficients ----
const HERMITE_NEG_2 = -2;       // −2 coefficient in h01 basis function
// ---- BounceEaseOut piecewise thresholds and offsets ----
const BOUNCE_OFFSET_2 = 1.5;    // step-2 offset: 1.5 / d1
const BOUNCE_CORR_2 = 0.75;     // step-2 correction addend
const BOUNCE_THRESH_3 = 2.5;    // step-3 upper threshold factor
const BOUNCE_OFFSET_3 = 2.25;   // step-3 offset: 2.25 / d1
const BOUNCE_CORR_3 = 0.9375;   // step-3 correction addend
const BOUNCE_OFFSET_4 = 2.625;  // step-4 offset: 2.625 / d1
const BOUNCE_CORR_4 = 0.984375; // step-4 correction addend
// ---- ease-in-out shared constants ----
const EASE_INOUT_HALF = 0.5;        // t threshold separating ease-in phase from ease-out phase
const ELASTIC_INOUT_PHASE = 11.125;  // phase offset in ElasticEaseInOut: 2*EXP_SCALE*t − 11.125
const ELASTIC_INOUT_PERIOD = 4.5;   // period divisor for ElasticEaseInOut: 2π / 4.5
const BACK_INOUT_SCALE = 1.525;     // scale factor for back ease-in-out overshoot (c2 = c1 * 1.525)

/**
 * Linear interpolation (LERP) between two scalar values.
 * Maps parameter `t` proportionally between `a` (at t=0) and `b` (at t=1).
 * Values of `t` outside [0,1] produce extrapolation beyond the endpoints.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns `a + (b - a) * t`
 *
 * @example
	 * ```typescript
	 * LinearInterpolation(0, 100, 0.5)  // 50
	 * LinearInterpolation(0, 100, 0)    // 0
	 * LinearInterpolation(0, 100, 1)    // 100
	 * LinearInterpolation(0, 100, 1.5)  // 150 (extrapolation)
	 * ```
 */
export function LinearInterpolation(a: number, b: number, t: number): number {
	// Do not clamp t, allow extrapolation for LERP
	return a + ((b - a) * t);
}

/**
 * Smooth step interpolation (3t² − 2t³).
 * Provides smooth acceleration and deceleration with zero first derivatives at both endpoints.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value using cubic smooth-step curve
 *
 * @example
	 * ```typescript
	 * SmoothStep(0, 10, 0)    // 0
	 * SmoothStep(0, 10, 1)    // 10
	 * SmoothStep(0, 10, 0.25) // 1.5625 (slower start than LinearInterpolation's 2.5)
	 * ```
 */
export function SmoothStep(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const smoothT = t * t * (CUBIC - (2 * t));

	return a + ((b - a) * smoothT);
}

/**
 * Smoother step interpolation (6t⁵ − 15t⁴ + 10t³).
 * Even smoother than SmoothStep with zero first and second derivatives at both endpoints
 * (Ken Perlin's improvement).
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value using quintic smoother-step curve
 *
 * @example
	 * ```typescript
	 * SmootherStep(0, 10, 0)    // 0
	 * SmootherStep(0, 10, 1)    // 10
	 * SmootherStep(0, 10, 0.25) // ~1.04 (smoother start than SmoothStep)
	 * ```
 */
export function SmootherStep(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const smoothT = (SMOOTHER_COEFF_A * Math.pow(t, QUINTIC)) - (SMOOTHER_COEFF_B * Math.pow(t, QUARTIC)) + (SMOOTHER_COEFF_C * Math.pow(t, CUBIC));

	return a + ((b - a) * smoothT);
}

/**
 * Quadratic ease-in interpolation (t²).
 * Accelerates from rest — starts slowly and gains speed toward the end.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with quadratic acceleration from start
 *
 * @example
	 * ```typescript
	 * QuadraticEaseIn(0, 10, 0)    // 0
	 * QuadraticEaseIn(0, 10, 1)    // 10
	 * QuadraticEaseIn(0, 10, 0.5)  // 2.5 (only 25% progress at the midpoint)
	 * ```
 */
export function QuadraticEaseIn(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * t * t);
}

/**
 * Quadratic ease-out interpolation (1 − (1−t)²).
 * Decelerates to rest — starts quickly and slows toward the end.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with quadratic deceleration toward end
 *
 * @example
	 * ```typescript
	 * QuadraticEaseOut(0, 10, 0)   // 0
	 * QuadraticEaseOut(0, 10, 1)   // 10
	 * QuadraticEaseOut(0, 10, 0.5) // 7.5 (already 75% progress at the midpoint)
	 * ```
 */
export function QuadraticEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * (1 - Math.pow(1 - t, 2)));
}

/**
 * Cubic ease-in interpolation (t³).
 * More pronounced acceleration than quadratic — starts very slowly.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with cubic acceleration from start
 *
 * @example
	 * ```typescript
	 * CubicEaseIn(0, 10, 0)    // 0
	 * CubicEaseIn(0, 10, 1)    // 10
	 * CubicEaseIn(0, 10, 0.5)  // 1.25 (only 12.5% progress at the midpoint)
	 * ```
 */
export function CubicEaseIn(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * t * t * t);
}

/**
 * Cubic ease-out interpolation (1 − (1−t)³).
 * More pronounced deceleration than quadratic — slows very gradually at the end.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with cubic deceleration toward end
 *
 * @example
	 * ```typescript
	 * CubicEaseOut(0, 10, 0)   // 0
	 * CubicEaseOut(0, 10, 1)   // 10
	 * CubicEaseOut(0, 10, 0.5) // 8.75 (already 87.5% progress at the midpoint)
	 * ```
 */
export function CubicEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * (1 - Math.pow(1 - t, CUBIC)));
}

/**
 * Cosine interpolation — smooth curve using the cosine function.
 * Provides natural easing similar to SmoothStep but using trigonometry.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value using cosine-based easing curve
 *
 * @example
	 * ```typescript
	 * CosineInterpolation(0, 10, 0)   // 0
	 * CosineInterpolation(0, 10, 1)   // 10
	 * CosineInterpolation(0, 10, 0.5) // 5 (same as LERP at midpoint; smooth near endpoints)
	 * ```
 */
export function CosineInterpolation(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const cosT = (1 - Math.cos(t * Math.PI)) / 2;

	return a + ((b - a) * cosT);
}

/**
 * Sine ease-in interpolation.
 * Slow start with smooth sinusoidal acceleration.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with sine-based acceleration from start
 *
 * @example
	 * ```typescript
	 * SineEaseIn(0, 10, 0)   // 0
	 * SineEaseIn(0, 10, 1)   // 10
	 * SineEaseIn(0, 10, 0.5) // ~2.93 (slower than LinearInterpolation's 5 at midpoint)
	 * ```
 */
export function SineEaseIn(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * (1 - Math.cos((t * Math.PI) / 2)));
}

/**
 * Sine ease-out interpolation.
 * Fast start with smooth sinusoidal deceleration to the end.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with sine-based deceleration toward end
 *
 * @example
	 * ```typescript
	 * SineEaseOut(0, 10, 0)   // 0
	 * SineEaseOut(0, 10, 1)   // 10
	 * SineEaseOut(0, 10, 0.5) // ~7.07 (faster than LinearInterpolation's 5 at midpoint)
	 * ```
 */
export function SineEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * Math.sin((t * Math.PI) / 2));
}

/**
 * Exponential ease-in interpolation (2^(10t−10)).
 * Very slow start, then rapid exponential acceleration.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with exponential acceleration from start
 *
 * @example
	 * ```typescript
	 * ExponentialEaseIn(0, 10, 0)    // 0
	 * ExponentialEaseIn(0, 10, 1)    // 10
	 * ExponentialEaseIn(0, 10, 0.5)  // ~0.31 (barely moved at midpoint)
	 * ```
 */
export function ExponentialEaseIn(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const expT = t === 0 ? 0 : Math.pow(2, EXP_SCALE * (t - 1));

	return a + ((b - a) * expT);
}

/**
 * Exponential ease-out interpolation (1 − 2^(−10t)).
 * Rapid start, then very slow exponential deceleration.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with exponential deceleration toward end
 *
 * @example
	 * ```typescript
	 * ExponentialEaseOut(0, 10, 0)   // 0
	 * ExponentialEaseOut(0, 10, 1)   // 10
	 * ExponentialEaseOut(0, 10, 0.5) // ~9.69 (nearly done at midpoint)
	 * ```
 */
export function ExponentialEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const expT = t === 1 ? 1 : 1 - Math.pow(2, -EXP_SCALE * t);

	return a + ((b - a) * expT);
}

/**
 * Elastic ease-out — bouncy spring-like motion.
 * Creates an overshoot effect that oscillates before settling at the endpoint.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — clamped to [0, 1] at t=0 and t=1 boundaries
 * @returns Interpolated value with elastic overshoot effect toward end
 *
 * @example
	 * ```typescript
	 * ElasticEaseOut(0, 10, 0)   // 0
	 * ElasticEaseOut(0, 10, 1)   // 10
	 * ElasticEaseOut(0, 10, 0.8) // ~10.86 (overshoots target before settling)
	 * ```
 */
export function ElasticEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	if (t === 0 || t === 1) {
		return t === 0 ? a : b;
	}

	const c4 = (2 * Math.PI) / CUBIC;
	const elasticT = (Math.pow(2, -EXP_SCALE * t) * Math.sin(((t * EXP_SCALE) - ELASTIC_OFFSET) * c4)) + 1;

	return a + ((b - a) * elasticT);
}

/**
 * Back ease-out — overshoots then settles.
 * Creates a slight overshoot beyond the target before settling into place.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with back overshoot effect toward end
 *
 * @example
	 * ```typescript
	 * BackEaseOut(0, 10, 0)    // 0
	 * BackEaseOut(0, 10, 1)    // 10
	 * BackEaseOut(0, 10, 0.75) // ~10.88 (overshoots before settling)
	 * ```
 */
export function BackEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const c1 = 1.70158;
	const c3 = c1 + 1;
	const backT = 1 + (c3 * Math.pow(t - 1, CUBIC)) + (c1 * Math.pow(t - 1, 2));

	return a + ((b - a) * backT);
}

/**
 * Bounce ease-out — simulates a ball bouncing to rest.
 * Produces a series of bounces with decreasing amplitude before settling at the endpoint.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with bouncing effect toward end
 *
 * @example
	 * ```typescript
	 * BounceEaseOut(0, 10, 0)   // 0
	 * BounceEaseOut(0, 10, 1)   // 10
	 * BounceEaseOut(0, 10, 0.5) // ~7.65 (mid-bounce)
	 * ```
 */
export function BounceEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const n1 = 7.5625;
	const d1 = 2.75;

	let bounceT: number;

	if (t < (1 / d1)) {
		bounceT = n1 * t * t;
	} else if (t < (2 / d1)) {
		const adjustedT = t - (BOUNCE_OFFSET_2 / d1);
		bounceT = (n1 * adjustedT * adjustedT) + BOUNCE_CORR_2;
	} else if (t < (BOUNCE_THRESH_3 / d1)) {
		const adjustedT = t - (BOUNCE_OFFSET_3 / d1);
		bounceT = (n1 * adjustedT * adjustedT) + BOUNCE_CORR_3;
	} else {
		const adjustedT = t - (BOUNCE_OFFSET_4 / d1);
		bounceT = (n1 * adjustedT * adjustedT) + BOUNCE_CORR_4;
	}

	return a + ((b - a) * bounceT);
}

/**
 * Catmull-Rom spline interpolation between four control points.
 * Produces a smooth curve that passes through p1 and p2 with tangents influenced by p0 and p3.
 *
 * @param p0 - Previous control point (influences the tangent at p1)
 * @param p1 - Start point (result when t = 0)
 * @param p2 - End point (result when t = 1)
 * @param p3 - Next control point (influences the tangent at p2)
 * @param t - Interpolation parameter (typically [0, 1], supports extrapolation)
 * @returns Smoothly interpolated value along the Catmull-Rom spline
 *
 * @example
	 * ```typescript
	 * CatmullRomInterpolation(0, 5, 10, 15, 0)   // 5  (at p1)
	 * CatmullRomInterpolation(0, 5, 10, 15, 1)   // 10 (at p2)
	 * CatmullRomInterpolation(0, 5, 10, 15, 0.5) // 7.5
	 * ```
 */
export function CatmullRomInterpolation(p0: number,	p1: number,	p2: number,	p3: number,	t: number): number {
	// Allow extrapolation by not clamping t
	const t2 = t * t;
	const t3 = t2 * t;

	return CATMULL_HALF * (
		(2 * p1) + ((-p0 + p2) * t) + (((2 * p0) - (CATMULL_5 * p1) + (QUARTIC * p2) - p3) * t2) + ((-p0 + (CUBIC * p1) - (CUBIC * p2) + p3) * t3)
	);
}

/**
 * Hermite spline interpolation with explicit tangent control.
 * Provides precise control over the curve's tangent at both the start and end points.
 *
 * @param p0 - Start point (result when t = 0)
 * @param p1 - End point (result when t = 1)
 * @param t0 - Tangent (velocity) at the start point
 * @param t1 - Tangent (velocity) at the end point
 * @param t - Interpolation parameter (typically [0, 1], supports extrapolation)
 * @returns Interpolated value along the Hermite spline
 *
 * @example
	 * ```typescript
	 * HermiteInterpolation(0, 10, 0, 0, 0)   // 0  (at start)
	 * HermiteInterpolation(0, 10, 0, 0, 1)   // 10 (at end)
	 * HermiteInterpolation(0, 10, 0, 0, 0.5) // 5  (flat tangents → same as LERP at midpoint)
	 * ```
 */
export function HermiteInterpolation(p0: number,	p1: number,	t0: number,	t1: number,	t: number): number {
	// Allow extrapolation by not clamping t
	const t2 = t * t;
	const t3 = t2 * t;

	const h00 = (2 * t3) - (CUBIC * t2) + 1;
	const h10 = t3 - (2 * t2) + t;
	const h01 = (HERMITE_NEG_2 * t3) + (CUBIC * t2);
	const h11 = t3 - t2;

	return (h00 * p0) + (h10 * t0) + (h01 * p1) + (h11 * t1);
}

/**
 * Circular ease-in interpolation (1 − √(1−t²)).
 * Creates an accelerating curve based on the first quarter of a circle.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — clamped to [0, 1] for a valid circular arc
 * @returns Interpolated value with circular acceleration from start
 *
 * @example
	 * ```typescript
	 * CircularEaseIn(0, 10, 0)   // 0
	 * CircularEaseIn(0, 10, 1)   // 10
	 * CircularEaseIn(0, 10, 0.5) // ~1.34 (very slow start along circular arc)
	 * ```
 */
export function CircularEaseIn(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * (1 - Math.sqrt(1 - (t * t))));
}

/**
 * Circular ease-out interpolation (√(1−(t−1)²)).
 * Creates a decelerating curve based on the first quarter of a circle.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — clamped to [0, 1] for a valid circular arc
 * @returns Interpolated value with circular deceleration toward end
 *
 * @example
	 * ```typescript
	 * CircularEaseOut(0, 10, 0)   // 0
	 * CircularEaseOut(0, 10, 1)   // 10
	 * CircularEaseOut(0, 10, 0.5) // ~8.66 (very fast start along circular arc)
	 * ```
 */
export function CircularEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * Math.sqrt(1 - Math.pow(t - 1, 2)));
}

/**
 * Quadratic ease-in-out interpolation (2t² for t < 0.5, 1 − (−2t+2)²/2 for t ≥ 0.5).
 * Symmetrically accelerates at the start and decelerates at the end.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter (typically [0, 1])
 * @returns Interpolated value with quadratic symmetric easing
 *
 * @example
	 * ```typescript
	 * QuadraticEaseInOut(0, 10, 0)    // 0
	 * QuadraticEaseInOut(0, 10, 1)    // 10
	 * QuadraticEaseInOut(0, 10, 0.25) // 1.25 (slow start)
	 * QuadraticEaseInOut(0, 10, 0.75) // 8.75 (slow end)
	 * ```
 */
export function QuadraticEaseInOut(a: number, b: number, t: number): number {
	const smoothT = t < EASE_INOUT_HALF
		? 2 * t * t
		: 1 - (Math.pow(-2 * t + 2, 2) / 2);
	return a + ((b - a) * smoothT);
}

/**
 * Cubic ease-in-out interpolation (4t³ for t < 0.5, 1 − (−2t+2)³/2 for t ≥ 0.5).
 * More pronounced symmetrical acceleration/deceleration than quadratic ease-in-out.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter (typically [0, 1])
 * @returns Interpolated value with cubic symmetric easing
 *
 * @example
	 * ```typescript
	 * CubicEaseInOut(0, 10, 0)    // 0
	 * CubicEaseInOut(0, 10, 1)    // 10
	 * CubicEaseInOut(0, 10, 0.25) // 0.625 (very slow start)
	 * CubicEaseInOut(0, 10, 0.75) // 9.375 (very slow end)
	 * ```
 */
export function CubicEaseInOut(a: number, b: number, t: number): number {
	const smoothT = t < EASE_INOUT_HALF
		? 4 * t * t * t
		: 1 - (Math.pow(-2 * t + 2, CUBIC) / 2);
	return a + ((b - a) * smoothT);
}

/**
 * Sine ease-in-out interpolation (−(cos(πt) − 1) / 2).
 * Smooth symmetric easing using cosine — gentle and natural feeling.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter (typically [0, 1])
 * @returns Interpolated value with sine-based symmetric easing
 *
 * @example
	 * ```typescript
	 * SineEaseInOut(0, 10, 0)   // 0
	 * SineEaseInOut(0, 10, 1)   // 10
	 * SineEaseInOut(0, 10, 0.5) // 5 (symmetric midpoint)
	 * ```
 */
export function SineEaseInOut(a: number, b: number, t: number): number {
	const smoothT = -(Math.cos(t * Math.PI) - 1) / 2;
	return a + ((b - a) * smoothT);
}

/**
 * Exponential ease-in-out interpolation.
 * Very slow at both ends with an extremely rapid transition in the middle.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter (typically [0, 1])
 * @returns Interpolated value with exponential symmetric easing
 *
 * @example
	 * ```typescript
	 * ExponentialEaseInOut(0, 10, 0)    // 0
	 * ExponentialEaseInOut(0, 10, 1)    // 10
	 * ExponentialEaseInOut(0, 10, 0.25) // ~0.16 (barely moving in the first quarter)
	 * ```
 */
export function ExponentialEaseInOut(a: number, b: number, t: number): number {
	if (t === 0) return a;
	if (t === 1) return b;
	const expT = t < EASE_INOUT_HALF
		? Math.pow(2, (2 * EXP_SCALE * t) - EXP_SCALE) / 2
		: (2 - Math.pow(2, -(2 * EXP_SCALE * t) + EXP_SCALE)) / 2;
	return a + ((b - a) * expT);
}

/**
 * Circular ease-in-out interpolation.
 * Smooth symmetric arc-based easing using a circular curve.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter (typically [0, 1])
 * @returns Interpolated value with circular symmetric easing
 *
 * @example
	 * ```typescript
	 * CircularEaseInOut(0, 10, 0)    // 0
	 * CircularEaseInOut(0, 10, 1)    // 10
	 * CircularEaseInOut(0, 10, 0.25) // ~0.67 (very slow circular start)
	 * ```
 */
export function CircularEaseInOut(a: number, b: number, t: number): number {
	const smoothT = t < EASE_INOUT_HALF
		? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
		: (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
	return a + ((b - a) * smoothT);
}

/**
 * Elastic ease-in interpolation.
 * Spring-like acceleration from rest — starts with a backward oscillation then launches forward.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — clamped to [0, 1] at t=0 and t=1 boundaries
 * @returns Interpolated value with elastic spring acceleration from start
 *
 * @example
	 * ```typescript
	 * ElasticEaseIn(0, 10, 0)   // 0
	 * ElasticEaseIn(0, 10, 1)   // 10
	 * ElasticEaseIn(0, 10, 0.5) // ~-0.16 (backward oscillation at midpoint before launching)
	 * ```
 */
export function ElasticEaseIn(a: number, b: number, t: number): number {
	if (t === 0 || t === 1) return t === 0 ? a : b;
	const c4 = (2 * Math.PI) / CUBIC;
	const elasticT = -(Math.pow(2, EXP_SCALE * (t - 1)) * Math.sin(((t * EXP_SCALE) - (EXP_SCALE + ELASTIC_OFFSET)) * c4));
	return a + ((b - a) * elasticT);
}

/**
 * Elastic ease-in-out interpolation.
 * Spring-like oscillation at both the start and end of the motion.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — clamped to [0, 1] at t=0 and t=1 boundaries
 * @returns Interpolated value with elastic oscillation at both ends
 *
 * @example
	 * ```typescript
	 * ElasticEaseInOut(0, 10, 0)   // 0
	 * ElasticEaseInOut(0, 10, 1)   // 10
	 * ElasticEaseInOut(0, 10, 0.4) // ~-1.17 (backward oscillation before midpoint)
	 * ```
 */
export function ElasticEaseInOut(a: number, b: number, t: number): number {
	if (t === 0 || t === 1) return t === 0 ? a : b;
	const c5 = (2 * Math.PI) / ELASTIC_INOUT_PERIOD;
	const elasticT = t < EASE_INOUT_HALF
		? -(Math.pow(2, (2 * EXP_SCALE * t) - EXP_SCALE) * Math.sin(((2 * EXP_SCALE * t) - ELASTIC_INOUT_PHASE) * c5)) / 2
		: (Math.pow(2, -(2 * EXP_SCALE * t) + EXP_SCALE) * Math.sin(((2 * EXP_SCALE * t) - ELASTIC_INOUT_PHASE) * c5)) / 2 + 1;
	return a + ((b - a) * elasticT);
}

/**
 * Back ease-in interpolation (c3t³ − c1t²).
 * Slight backward pull before launching forward — like winding up before a throw.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with back overshoot at start
 *
 * @example
	 * ```typescript
	 * BackEaseIn(0, 10, 0)    // 0
	 * BackEaseIn(0, 10, 1)    // 10
	 * BackEaseIn(0, 10, 0.25) // ~-0.64 (dips below start before accelerating forward)
	 * ```
 */
export function BackEaseIn(a: number, b: number, t: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	const backT = (c3 * t * t * t) - (c1 * t * t);
	return a + ((b - a) * backT);
}

/**
 * Back ease-in-out interpolation.
 * Slight backward pull at both ends before and after the main forward motion.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with back overshoot at both start and end
 *
 * @example
	 * ```typescript
	 * BackEaseInOut(0, 10, 0)    // 0
	 * BackEaseInOut(0, 10, 1)    // 10
	 * BackEaseInOut(0, 10, 0.25) // ~-1.00 (dips backward at start)
	 * ```
 */
export function BackEaseInOut(a: number, b: number, t: number): number {
	const c1 = 1.70158;
	const c2 = c1 * BACK_INOUT_SCALE;
	const backT = t < EASE_INOUT_HALF
		? Math.pow(2 * t, 2) * (((c2 + 1) * 2 * t) - c2) / 2
		: (Math.pow((2 * t) - 2, 2) * (((c2 + 1) * ((2 * t) - 2)) + c2) + 2) / 2;
	return a + ((b - a) * backT);
}

/**
 * Bounce ease-in interpolation.
 * Bouncing ball effect at the start — multiple bounces before launching toward the target.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with bounce effect at start
 *
 * @example
	 * ```typescript
	 * BounceEaseIn(0, 10, 0)   // 0
	 * BounceEaseIn(0, 10, 1)   // 10
	 * BounceEaseIn(0, 10, 0.5) // ~2.34 (still bouncing at midpoint)
	 * ```
 */
export function BounceEaseIn(a: number, b: number, t: number): number {
	return a + ((b - a) * (1 - BounceEaseOut(0, 1, 1 - t)));
}

/**
 * Bounce ease-in-out interpolation.
 * Bouncing ball effect at both the start and end of the motion.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Interpolated value with bounce effect at both start and end
 *
 * @example
	 * ```typescript
	 * BounceEaseInOut(0, 10, 0)    // 0
	 * BounceEaseInOut(0, 10, 1)    // 10
	 * BounceEaseInOut(0, 10, 0.25) // ~1.17 (bouncing at start quarter)
	 * ```
 */
export function BounceEaseInOut(a: number, b: number, t: number): number {
	const bounceT = t < EASE_INOUT_HALF
		? (1 - BounceEaseOut(0, 1, 1 - (2 * t))) / 2
		: (1 + BounceEaseOut(0, 1, (2 * t) - 1)) / 2;
	return a + ((b - a) * bounceT);
}

/**
 * Step interpolation — instant transition at a configurable threshold.
 * Returns `a` when `t` is below the threshold, and `b` at or above it.
 * Useful for discrete state changes and on/off animations.
 *
 * @param a - Start value (returned when t < threshold)
 * @param b - End value (returned when t ≥ threshold)
 * @param t - Interpolation parameter (clamped to [0, 1])
 * @param threshold - Normalized transition point (default: 0.5; clamped to [0, 1])
 * @returns Either `a` or `b` depending on `t` relative to `threshold`
 *
 * @example
	 * ```typescript
	 * StepInterpolation(0, 10, 0.3)        // 0  (below default threshold of 0.5)
	 * StepInterpolation(0, 10, 0.7)        // 10 (at or above default threshold of 0.5)
	 * StepInterpolation(0, 10, 0.3, 0.25)  // 10 (above custom threshold of 0.25)
	 * ```
 */
export function StepInterpolation(a: number, b: number, t: number, threshold: number = 0.5): number {
	const clampedT = Clamp(t, 0, 1);
	const clampedThreshold = Clamp(threshold, 0, 1);

	return clampedT < clampedThreshold ? a : b;
}

/**
 * Spherical linear interpolation for scalar values.
 * For scalar inputs, this is mathematically equivalent to {@link LinearInterpolation}.
 * For true spherical rotation interpolation, use `QuaternionSLERP` from the quaternions module.
 *
 * @param a - Start value (result when t = 0)
 * @param b - End value (result when t = 1)
 * @param t - Interpolation parameter — unclamped, allowing extrapolation
 * @returns Linearly interpolated value (identical to `LinearInterpolation(a, b, t)`)
 *
 * @deprecated This function is identical to LinearInterpolation and is not a true spherical interpolation. For quaternion spherical interpolation, use QuaternionSLERP from the quaternions module.
 */
export function SphericalLinearInterpolation(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	// For scalar values, SLERP reduces to linear interpolation
	// This is a placeholder implementation for scalar compatibility
	return LinearInterpolation(a, b, t);
}
