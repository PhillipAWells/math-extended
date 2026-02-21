/**
 * Advanced interpolation utilities for quaternions.
 * Provides specialized interpolation methods for smooth rotation animations.
 */

import { AssertArray, AssertNumber } from '@pawells/typescript-common';
import { AssertNormalizedQuaternion } from './asserts.js';
import { TQuaternion } from './types.js';
import { QuaternionSLERP, QuaternionNormalize, QuaternionMultiply, QuaternionInverse } from './core.js';
import { Clamp } from '../clamp.js';

const QUATERNION_LOG_TOLERANCE = 1e-6;

/**
 * Performs normalized linear interpolation (NLERP) between two quaternions.
 * NLERP is faster than SLERP but doesn't maintain constant angular velocity.
 * Good for cases where performance is more important than perfect interpolation.
 *
 * @param a - Start quaternion
 * @param b - End quaternion
 * @param t - Interpolation parameter (0 = a, 1 = b)
 * @returns Interpolated and normalized quaternion
 *
 * @example
 * const q1 = [0, 0, 0, 1];
 * const q2 = [0, 0, 0.707, 0.707];
 * const interpolated = QuaternionNLERP(q1, q2, 0.5);
 */
export function QuaternionNLERP(a: TQuaternion, b: TQuaternion, t: number): TQuaternion {
	AssertNormalizedQuaternion(a);
	AssertNormalizedQuaternion(b);

	const clampedT = Clamp(t, 0, 1); // Ensure t is within [0, 1]

	// Choose the shorter path (handle double-cover property)
	let bToUse = b;
	const dot = (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]) + (a[3] * b[3]);
	if (dot < 0) bToUse = [-b[0], -b[1], -b[2], -b[3]];

	// Linear interpolation
	const result: TQuaternion = [
		a[0] + (clampedT * (bToUse[0] - a[0])),
		a[1] + (clampedT * (bToUse[1] - a[1])),
		a[2] + (clampedT * (bToUse[2] - a[2])),
		a[3] + (clampedT * (bToUse[3] - a[3])),
	];

	return QuaternionNormalize(result);
}

/**
 * Performs spherical quadrangle interpolation (SQUAD) for smooth interpolation
 * through multiple quaternions. This is useful for creating smooth animation paths.
 *
 * @param q0 - Previous quaternion (for tangent calculation)
 * @param q1 - Start quaternion
 * @param q2 - End quaternion
 * @param q3 - Next quaternion (for tangent calculation)
 * @param t - Interpolation parameter (0 = q1, 1 = q2)
 * @returns Smoothly interpolated quaternion
 *
 * @example
 * // Create a smooth path through multiple rotations
 * const path = [q0, q1, q2, q3]; // Array of quaternions
 * const smooth = QuaternionSQUAD(path[0], path[1], path[2], path[3], 0.5);
 */
export function QuaternionSQUAD(q0: TQuaternion, q1: TQuaternion, q2: TQuaternion, q3: TQuaternion, t: number): TQuaternion {
	AssertNormalizedQuaternion(q0);
	AssertNormalizedQuaternion(q1);
	AssertNormalizedQuaternion(q2);
	AssertNormalizedQuaternion(q3);
	AssertNumber(t, { gte: 0, lte: 1 });

	// Calculate intermediate control points
	const s1 = quaternionSquadControlPoint(q0, q1, q2);
	const s2 = quaternionSquadControlPoint(q1, q2, q3);

	// Interpolate using two SLERP operations
	const slerp1 = QuaternionSLERP(q1, q2, t);
	const slerp2 = QuaternionSLERP(s1, s2, t);

	// Final SLERP between the two results
	return QuaternionSLERP(slerp1, slerp2, 2 * t * (1 - t));
}

/**
 * Calculates a control point for SQUAD interpolation.
 * This is an internal helper function for smooth quaternion interpolation.
 *
 * @param q0 - Previous quaternion
 * @param q1 - Current quaternion
 * @param q2 - Next quaternion
 * @returns Control point quaternion for smooth interpolation
 */
function quaternionSquadControlPoint(q0: TQuaternion, q1: TQuaternion, q2: TQuaternion): TQuaternion {
	// Calculate logarithms for smooth interpolation
	const q1Inv = QuaternionInverse(q1);
	const log1 = quaternionLog(QuaternionMultiply(q1Inv, q0));
	const log2 = quaternionLog(QuaternionMultiply(q1Inv, q2));

	// Calculate the control point
	const logSum: TQuaternion = [
		log1[0] + log2[0],
		log1[1] + log2[1],
		log1[2] + log2[2],
		log1[3] + log2[3],
	];

	const scaledLog: TQuaternion = [
		logSum[0] * -0.25,
		logSum[1] * -0.25,
		logSum[2] * -0.25,
		logSum[3] * -0.25,
	];

	return QuaternionMultiply(q1, quaternionExp(scaledLog));
}

/**
 * Calculates the natural logarithm of a quaternion.
 * Used internally for advanced interpolation methods.
 *
 * @param quaternion - The quaternion to calculate logarithm for
 * @returns The logarithmic quaternion
 */
function quaternionLog(quaternion: TQuaternion): TQuaternion {
	AssertNormalizedQuaternion(quaternion);

	const [x, y, z, w] = quaternion;
	const vectorLength = Math.sqrt((x * x) + (y * y) + (z * z));

	if (vectorLength < QUATERNION_LOG_TOLERANCE) return [0, 0, 0, 0];

	const angle = Math.atan2(vectorLength, w);
	const scale = angle / vectorLength;

	return [x * scale, y * scale, z * scale, 0];
}

/**
 * Calculates the exponential of a quaternion.
 * Used internally for advanced interpolation methods.
 *
 * @param quaternion - The quaternion to exponentiate
 * @returns The exponential quaternion
 */
function quaternionExp(quaternion: TQuaternion): TQuaternion {
	const [x, y, z, w] = quaternion;
	const vectorLength = Math.sqrt((x * x) + (y * y) + (z * z));

	if (vectorLength < QUATERNION_LOG_TOLERANCE) return [0, 0, 0, 1];

	const expW = Math.exp(w);
	const cosV = Math.cos(vectorLength);
	const sinV = Math.sin(vectorLength);
	const scale = expW * sinV / vectorLength;

	return [
		x * scale,
		y * scale,
		z * scale,
		expW * cosV,
	];
}

/**
 * Creates a smooth interpolation path through multiple quaternions.
 * Returns a function that can be called with a parameter t ∈ [0, 1] to get
 * interpolated quaternions along the path.
 *
 * @param quaternions - Array of quaternions defining the path
 * @param method - Interpolation method ('slerp' | 'nlerp' | 'squad')
 * @returns Function that takes t ∈ [0, 1] and returns interpolated quaternion
 *
 * @example
 * const path = [q1, q2, q3, q4];
 * const interpolator = QuaternionCreatePath(path, 'slerp');
 * const halfway = interpolator(0.5); // Interpolated quaternion at 50% along path
 */
export function QuaternionCreatePath(
	quaternions: TQuaternion[],
	method: 'slerp' | 'nlerp' | 'squad' = 'slerp',
): (t: number) => TQuaternion {
	AssertArray(quaternions, { minSize: 2 });

	// Validate all quaternions
	for (const q of quaternions) {
		AssertNormalizedQuaternion(q);
	}

	return (t: number): TQuaternion => {
		AssertNumber(t, { gte: 0, lte: 1 });

		const [firstQuaternion] = quaternions;
		const lastQuaternion = quaternions[quaternions.length - 1];

		if (t === 0 && firstQuaternion) return firstQuaternion;
		if (t === 1 && lastQuaternion) return lastQuaternion;

		// Calculate which segment we're in
		const segments = quaternions.length - 1;
		const segmentLength = 1 / segments;
		const segmentIndex = Math.floor(t / segmentLength);
		const segmentT = (t - (segmentIndex * segmentLength)) / segmentLength;

		const currentIndex = Math.min(segmentIndex, segments - 1);
		const nextIndex = Math.min(currentIndex + 1, quaternions.length - 1);

		const q1 = quaternions[currentIndex];
		const q2 = quaternions[nextIndex];

		// Ensure we have valid quaternions
		if (!q1 || !q2) throw new Error('Invalid quaternion path calculation');

		switch (method) {
			case 'nlerp':
				return QuaternionNLERP(q1, q2, segmentT);
			case 'squad': {
				// For SQUAD, we need additional quaternions for tangent calculation
				const q0 = quaternions[Math.max(0, currentIndex - 1)];
				const q3 = quaternions[Math.min(quaternions.length - 1, nextIndex + 1)];

				// Ensure we have valid quaternions
				if (!q0 || !q3) throw new Error('Invalid quaternion path calculation for SQUAD');

				return QuaternionSQUAD(q0, q1, q2, q3, segmentT);
			}
			case 'slerp':
			default:
				return QuaternionSLERP(q1, q2, segmentT);
		}
	};
}
