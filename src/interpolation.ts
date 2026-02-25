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
 * LinearInterpolation(0, 100, 0.5)  // 50
 * LinearInterpolation(0, 100, 0)    // 0
 * LinearInterpolation(0, 100, 1)    // 100
 * LinearInterpolation(0, 100, 1.5)  // 150 (extrapolation)
 */
export function LinearInterpolation(a: number, b: number, t: number): number {
	// Do not clamp t, allow extrapolation for LERP
	return a + ((b - a) * t);
}

/**
 * Smooth step interpolation (3t² - 2t³)
 * Provides smooth acceleration and deceleration with zero derivatives at endpoints
 */
export function SmoothStep(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const smoothT = t * t * (CUBIC - (2 * t));

	return a + ((b - a) * smoothT);
}

/**
 * Smoother step interpolation (6t⁵ - 15t⁴ + 10t³)
 * Even smoother than SmoothStep with zero first and second derivatives at endpoints
 */
export function SmootherStep(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const smoothT = (SMOOTHER_COEFF_A * Math.pow(t, QUINTIC)) - (SMOOTHER_COEFF_B * Math.pow(t, QUARTIC)) + (SMOOTHER_COEFF_C * Math.pow(t, CUBIC));

	return a + ((b - a) * smoothT);
}

/**
 * Quadratic ease-in interpolation (t²)
 * Accelerates slowly at the beginning
 */
export function QuadraticEaseIn(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * t * t);
}

/**
 * Quadratic ease-out interpolation (1 - (1-t)²)
 * Decelerates slowly at the end
 */
export function QuadraticEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * (1 - Math.pow(1 - t, 2)));
}

/**
 * Cubic ease-in interpolation (t³)
 * More pronounced acceleration than quadratic
 */
export function CubicEaseIn(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * t * t * t);
}

/**
 * Cubic ease-out interpolation (1 - (1-t)³)
 * More pronounced deceleration than quadratic
 */
export function CubicEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * (1 - Math.pow(1 - t, CUBIC)));
}

/**
 * Cosine interpolation - smooth curve using cosine function
 * Provides natural easing similar to SmoothStep but using trigonometry
 */
export function CosineInterpolation(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const cosT = (1 - Math.cos(t * Math.PI)) / 2;

	return a + ((b - a) * cosT);
}

/**
 * Sine ease-in interpolation
 * Slow start with smooth acceleration
 */
export function SineEaseIn(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * (1 - Math.cos((t * Math.PI) / 2)));
}

/**
 * Sine ease-out interpolation
 * Smooth deceleration to the end
 */
export function SineEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * Math.sin((t * Math.PI) / 2));
}

/**
 * Exponential ease-in interpolation
 * Very slow start, then rapid acceleration
 */
export function ExponentialEaseIn(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const expT = t === 0 ? 0 : Math.pow(2, EXP_SCALE * (t - 1));

	return a + ((b - a) * expT);
}

/**
 * Exponential ease-out interpolation
 * Rapid start, then very slow deceleration
 */
export function ExponentialEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const expT = t === 1 ? 1 : 1 - Math.pow(2, -EXP_SCALE * t);

	return a + ((b - a) * expT);
}

/**
 * Elastic ease-out - bouncy spring-like motion
 * Creates an overshoot effect that bounces back
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
 * Back ease-out - overshoots then settles
 * Creates a slight overshoot before settling at the target
 */
export function BackEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	const c1 = 1.70158;
	const c3 = c1 + 1;
	const backT = 1 + (c3 * Math.pow(t - 1, CUBIC)) + (c1 * Math.pow(t - 1, 2));

	return a + ((b - a) * backT);
}

/**
 * Bounce ease-out - bouncing ball effect
 * Simulates a ball bouncing to rest
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
 * Catmull-Rom spline interpolation between 4 points
 * Useful for smooth curves through multiple points
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
 * Hermite interpolation with tangent control
 * Provides precise control over curve tangents at endpoints
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
 * Circular ease-in interpolation
 * Creates an accelerating curve based on quarter circle
 */
export function CircularEaseIn(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * (1 - Math.sqrt(1 - (t * t))));
}

/**
 * Circular ease-out interpolation
 * Creates a decelerating curve based on quarter circle
 */
export function CircularEaseOut(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	return a + ((b - a) * Math.sqrt(1 - Math.pow(t - 1, 2)));
}

/**
 * Quadratic ease-in-out interpolation (2t² for t<0.5, 1−(−2t+2)²/2 for t≥0.5)
 * Symmetrically accelerates at the start and decelerates at the end
 */
export function QuadraticEaseInOut(a: number, b: number, t: number): number {
	const smoothT = t < EASE_INOUT_HALF
		? 2 * t * t
		: 1 - (Math.pow(-2 * t + 2, 2) / 2);
	return a + ((b - a) * smoothT);
}

/**
 * Cubic ease-in-out interpolation (4t³ for t<0.5, 1−(−2t+2)³/2 for t≥0.5)
 * More pronounced symmetrical acceleration/deceleration than quadratic
 */
export function CubicEaseInOut(a: number, b: number, t: number): number {
	const smoothT = t < EASE_INOUT_HALF
		? 4 * t * t * t
		: 1 - (Math.pow(-2 * t + 2, CUBIC) / 2);
	return a + ((b - a) * smoothT);
}

/**
 * Sine ease-in-out interpolation (−(cos(πt)−1)/2)
 * Smooth symmetric easing using cosine — gentle and natural feeling
 */
export function SineEaseInOut(a: number, b: number, t: number): number {
	const smoothT = -(Math.cos(t * Math.PI) - 1) / 2;
	return a + ((b - a) * smoothT);
}

/**
 * Exponential ease-in-out interpolation
 * Very slow at both ends, extremely rapid in the middle
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
 * Circular ease-in-out interpolation
 * Smooth symmetric arc-based easing
 */
export function CircularEaseInOut(a: number, b: number, t: number): number {
	const smoothT = t < EASE_INOUT_HALF
		? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2
		: (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
	return a + ((b - a) * smoothT);
}

/**
 * Elastic ease-in interpolation
 * Spring-like acceleration from rest — starts with a bounce-back then launches forward
 */
export function ElasticEaseIn(a: number, b: number, t: number): number {
	if (t === 0 || t === 1) return t === 0 ? a : b;
	const c4 = (2 * Math.PI) / CUBIC;
	const elasticT = -(Math.pow(2, EXP_SCALE * (t - 1)) * Math.sin(((t * EXP_SCALE) - (EXP_SCALE + ELASTIC_OFFSET)) * c4));
	return a + ((b - a) * elasticT);
}

/**
 * Elastic ease-in-out interpolation
 * Spring-like oscillation at both the start and end
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
 * Back ease-in interpolation (c3t³ − c1t²)
 * Slight backward pull before launching forward
 */
export function BackEaseIn(a: number, b: number, t: number): number {
	const c1 = 1.70158;
	const c3 = c1 + 1;
	const backT = (c3 * t * t * t) - (c1 * t * t);
	return a + ((b - a) * backT);
}

/**
 * Back ease-in-out interpolation
 * Slight backward pull at both ends before and after the main motion
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
 * Bounce ease-in interpolation
 * Bouncing ball effect with bounces at the start before settling at the target
 */
export function BounceEaseIn(a: number, b: number, t: number): number {
	return a + ((b - a) * (1 - BounceEaseOut(0, 1, 1 - t)));
}

/**
 * Bounce ease-in-out interpolation
 * Bouncing ball effect at both the start and the end
 */
export function BounceEaseInOut(a: number, b: number, t: number): number {
	const bounceT = t < EASE_INOUT_HALF
		? (1 - BounceEaseOut(0, 1, 1 - (2 * t))) / 2
		: (1 + BounceEaseOut(0, 1, (2 * t) - 1)) / 2;
	return a + ((b - a) * bounceT);
}

/**
 * Step interpolation - instant transition at threshold
 * Useful for discrete state changes
 */
export function StepInterpolation(a: number, b: number, t: number, threshold: number = 0.5): number {
	const clampedT = Clamp(t, 0, 1);
	const clampedThreshold = Clamp(threshold, 0, 1);

	return clampedT < clampedThreshold ? a : b;
}

/**
 * Spherical linear interpolation for scalar values
 * Provides smooth interpolation along a spherical arc
 * Note: For true SLERP with vectors, use VectorSphericalLinearInterpolation
 * @deprecated This function is identical to LinearInterpolation and is not a true spherical interpolation. For quaternion spherical interpolation, use QuaternionSLERP from the quaternions module.
 */
export function SphericalLinearInterpolation(a: number, b: number, t: number): number {
	// Allow extrapolation by not clamping t
	// For scalar values, SLERP reduces to linear interpolation
	// This is a placeholder implementation for scalar compatibility
	return LinearInterpolation(a, b, t);
}
