/**
 * Core quaternion mathematics operations for rotation and orientation calculations.
 * Provides comprehensive quaternion operations with conversion utilities and interpolation.
 */

import { VectorClone, VectorDot, VectorMagnitude, VectorNormalize, VectorEquals, Vector3Cross } from '../vectors/core.js';
import { TVector3 } from '../vectors/types.js';
import { AssertQuaternion, AssertNormalizedQuaternion, AssertEulerAngles, AssertAxisAngle } from './asserts.js';
import { TQuaternion, TEulerAngles, TAxisAngle } from './types.js';

const QUATERNION_MAGNITUDE_TOLERANCE = 1e-10;
const QUATERNION_ANGLE_TOLERANCE = 1e-6;
const SLERP_DOT_THRESHOLD = 0.9995;

/**
 * Creates an identity quaternion representing no rotation.
 * The identity quaternion is [0, 0, 0, 1] (x, y, z, w).
 *
 * @returns Identity quaternion [0, 0, 0, 1]
 *
 * @example
 * const identity = QuaternionIdentity();
 * console.log(identity); // [0, 0, 0, 1]
 */
export function QuaternionIdentity(): TQuaternion {
	return [0, 0, 0, 1];
}

/**
 * Creates a deep copy of a quaternion.
 * Essential for avoiding mutations during operations.
 *
 * @param quaternion - The quaternion to clone
 * @returns A new quaternion with identical components
 *
 * @example
 * const original = [0, 0, 0.707, 0.707];
 * const copy = QuaternionClone(original);
 * copy[0] = 1; // original remains unchanged
 */
export function QuaternionClone(quaternion: TQuaternion): TQuaternion {
	AssertQuaternion(quaternion);
	return VectorClone(quaternion) as TQuaternion;
}

/**
 * Compares two quaternions for equality with optional tolerance.
 * Note: Quaternions q and -q represent the same rotation, but this function
 * checks for exact component equality unless checkEquivalence is true.
 *
 * @param a - First quaternion to compare
 * @param b - Second quaternion to compare
 * @param tolerance - Maximum allowed difference between components (default: 1e-6)
 * @param checkEquivalence - If true, also check if quaternions represent the same rotation (default: false)
 * @returns True if quaternions are equal within tolerance
 *
 * @example
 * const q1 = [0, 0, 0, 1];
 * const q2 = [0, 0, 0, -1];
 * console.log(QuaternionEquals(q1, q2)); // false (different components)
 * console.log(QuaternionEquals(q1, q2, 1e-6, true)); // true (same rotation)
 */
export function QuaternionEquals(a: TQuaternion, b: TQuaternion, tolerance: number = 1e-6, checkEquivalence: boolean = false): boolean {
	AssertQuaternion(a);
	AssertQuaternion(b);

	// Check direct equality using vector comparison
	const directEqual = VectorEquals(a, b, tolerance);

	if (directEqual || !checkEquivalence) {
		return directEqual;
	}

	// Check if they represent the same rotation (q and -q are equivalent)
	const negated: TQuaternion = [-a[0], -a[1], -a[2], -a[3]];
	return VectorEquals(negated, b, tolerance);
}

/**
 * Calculates the magnitude (length) of a quaternion.
 * For unit quaternions (valid rotations), this should be 1.
 *
 * @param quaternion - The quaternion to measure
 * @returns The magnitude of the quaternion
 *
 * @example
 * const q = [0, 0, 0, 1];
 * console.log(QuaternionMagnitude(q)); // 1
 */
export function QuaternionMagnitude(quaternion: TQuaternion): number {
	AssertQuaternion(quaternion);
	return VectorMagnitude(quaternion);
}

/**
 * Normalizes a quaternion to unit length.
 * Essential for ensuring quaternions represent valid rotations.
 *
 * @param quaternion - The quaternion to normalize
 * @returns A normalized quaternion with magnitude 1
 *
 * @example
 * const q = [1, 1, 1, 1];
 * const normalized = QuaternionNormalize(q);
 * console.log(QuaternionMagnitude(normalized)); // 1
 */
export function QuaternionNormalize(quaternion: TQuaternion): TQuaternion {
	AssertQuaternion(quaternion);
	return VectorNormalize(quaternion) as TQuaternion;
}

/**
 * Calculates the conjugate of a quaternion.
 * The conjugate of [x, y, z, w] is [-x, -y, -z, w].
 * For unit quaternions, the conjugate represents the inverse rotation.
 *
 * @param quaternion - The quaternion to conjugate
 * @returns The conjugate quaternion
 *
 * @example
 * const q = [0.5, 0.5, 0.5, 0.5];
 * const conjugate = QuaternionConjugate(q);
 * console.log(conjugate); // [-0.5, -0.5, -0.5, 0.5]
 */
export function QuaternionConjugate(quaternion: TQuaternion): TQuaternion {
	AssertQuaternion(quaternion);

	const [x, y, z, w] = quaternion;
	return [-x, -y, -z, w];
}

/**
 * Calculates the inverse of a quaternion.
 * For unit quaternions, the inverse equals the conjugate.
 * For non-unit quaternions, the inverse is conjugate divided by magnitude squared.
 *
 * @param quaternion - The quaternion to invert
 * @returns The inverse quaternion
 *
 * @example
 * const q = [0, 0, 0.707, 0.707]; // 90° rotation around Z
 * const inverse = QuaternionInverse(q); // -90° rotation around Z
 */
export function QuaternionInverse(quaternion: TQuaternion): TQuaternion {
	AssertQuaternion(quaternion);

	const conjugate = QuaternionConjugate(quaternion);
	const magnitudeSquared = VectorDot(quaternion, quaternion);

	if (Math.abs(magnitudeSquared) < QUATERNION_MAGNITUDE_TOLERANCE) {
		throw new Error('Cannot invert quaternion with zero magnitude');
	}

	// For unit quaternions, magnitude squared is 1, so this is just the conjugate
	return [
		conjugate[0] / magnitudeSquared,
		conjugate[1] / magnitudeSquared,
		conjugate[2] / magnitudeSquared,
		conjugate[3] / magnitudeSquared,
	];
}

/**
 * Multiplies two quaternions.
 * Quaternion multiplication represents composition of rotations.
 * Note: Quaternion multiplication is not commutative (order matters).
 *
 * @param a - First quaternion (applied second in rotation order)
 * @param b - Second quaternion (applied first in rotation order)
 * @returns The product quaternion representing the combined rotation
 *
 * @example
 * const rotX = QuaternionFromAxisAngle([1, 0, 0], Math.PI/2); // 90° around X
 * const rotY = QuaternionFromAxisAngle([0, 1, 0], Math.PI/2); // 90° around Y
 * const combined = QuaternionMultiply(rotX, rotY); // Y rotation then X rotation
 */
export function QuaternionMultiply(a: TQuaternion, b: TQuaternion): TQuaternion {
	AssertQuaternion(a);
	AssertQuaternion(b);

	const [ax, ay, az, aw] = a;
	const [bx, by, bz, bw] = b;

	return [
		(aw * bx) + (ax * bw) + (ay * bz) - (az * by),
		(aw * by) - (ax * bz) + (ay * bw) + (az * bx),
		(aw * bz) + (ax * by) - (ay * bx) + (az * bw),
		(aw * bw) - (ax * bx) - (ay * by) - (az * bz),
	];
}

/**
 * Creates a quaternion from an axis-angle representation.
 * The axis should be normalized, and the angle is in radians.
 *
 * @param axis - The rotation axis as a normalized 3D vector
 * @param angle - The rotation angle in radians
 * @returns A quaternion representing the rotation
 *
 * @example
 * const axis = [0, 1, 0]; // Y-axis
 * const angle = Math.PI / 2; // 90 degrees
 * const q = QuaternionFromAxisAngle(axis, angle);
 */
export function QuaternionFromAxisAngle(axis: TVector3, angle: number): TQuaternion {
	const normalizedAxis = VectorNormalize(axis);
	const halfAngle = angle * 0.5;
	const sinHalf = Math.sin(halfAngle);
	const cosHalf = Math.cos(halfAngle);

	return [
		normalizedAxis[0] * sinHalf,
		normalizedAxis[1] * sinHalf,
		normalizedAxis[2] * sinHalf,
		cosHalf,
	];
}

/**
 * Creates a quaternion from an axis-angle representation (4-component version).
 *
 * @param axisAngle - The axis-angle as [x, y, z, angle] where xyz is the axis and angle is in radians
 * @returns A quaternion representing the rotation
 */
export function QuaternionFromAxisAngleVector(axisAngle: TAxisAngle): TQuaternion {
	AssertAxisAngle(axisAngle);

	const [x, y, z, angle] = axisAngle;
	return QuaternionFromAxisAngle([x, y, z], angle);
}

/**
 * Converts a quaternion to axis-angle representation.
 *
 * @param quaternion - The quaternion to convert
 * @returns The axis-angle representation as [x, y, z, angle]
 *
 * @example
 * const q = [0, 0.707, 0, 0.707]; // 90° around Y-axis
 * const axisAngle = QuaternionToAxisAngle(q);
 * console.log(axisAngle); // [0, 1, 0, π/2]
 */
export function QuaternionToAxisAngle(quaternion: TQuaternion): TAxisAngle {
	AssertNormalizedQuaternion(quaternion);

	const [x, y, z, w] = quaternion;

	// Handle identity quaternion
	if (Math.abs(w) >= 1) {
		return [1, 0, 0, 0]; // Arbitrary axis, zero angle
	}

	const angle = 2 * Math.acos(Math.min(1, Math.abs(w)));
	const sinHalfAngle = Math.sqrt(1 - (w * w));

	if (sinHalfAngle < QUATERNION_ANGLE_TOLERANCE) {
		// Avoid division by zero for small angles
		return [1, 0, 0, 0];
	}

	return [
		x / sinHalfAngle,
		y / sinHalfAngle,
		z / sinHalfAngle,
		angle,
	];
}

/**
 * Creates a quaternion from Euler angles (in radians).
 * Uses the ZYX rotation order (yaw-pitch-roll).
 *
 * @param euler - Euler angles as [x, y, z] in radians
 * @returns A quaternion representing the rotation
 *
 * @example
 * const euler = [0, Math.PI/4, 0]; // 45° pitch
 * const q = QuaternionFromEuler(euler);
 */
export function QuaternionFromEuler(euler: TEulerAngles): TQuaternion {
	AssertEulerAngles(euler);

	const [x, y, z] = euler;
	const cx = Math.cos(x * 0.5);
	const sx = Math.sin(x * 0.5);
	const cy = Math.cos(y * 0.5);
	const sy = Math.sin(y * 0.5);
	const cz = Math.cos(z * 0.5);
	const sz = Math.sin(z * 0.5);

	return [
		(sx * cy * cz) - (cx * sy * sz),
		(cx * sy * cz) + (sx * cy * sz),
		(cx * cy * sz) - (sx * sy * cz),
		(cx * cy * cz) + (sx * sy * sz),
	];
}

/**
 * Converts a quaternion to Euler angles (in radians).
 * Uses the ZYX rotation order (yaw-pitch-roll).
 *
 * @param quaternion - The quaternion to convert
 * @returns Euler angles as [x, y, z] in radians
 *
 * @example
 * const q = [0, 0.383, 0, 0.924]; // ~45° around Y-axis
 * const euler = QuaternionToEuler(q);
 * console.log(euler); // [0, π/4, 0]
 */
export function QuaternionToEuler(quaternion: TQuaternion): TEulerAngles {
	AssertNormalizedQuaternion(quaternion);

	const [x, y, z, w] = quaternion;

	// Roll (x-axis rotation)
	const sinRoll = 2 * ((w * x) + (y * z));
	const cosRoll = 1 - (2 * ((x * x) + (y * y)));
	const roll = Math.atan2(sinRoll, cosRoll);

	// Pitch (y-axis rotation)
	const sinPitch = 2 * ((w * y) - (z * x));
	const pitch = Math.abs(sinPitch) >= 1 ? Math.sign(sinPitch) * (Math.PI / 2) : Math.asin(sinPitch);

	// Yaw (z-axis rotation)
	const sinYaw = 2 * ((w * z) + (x * y));
	const cosYaw = 1 - (2 * ((y * y) + (z * z)));
	const yaw = Math.atan2(sinYaw, cosYaw);

	return [roll, pitch, yaw];
}

/**
 * Rotates a 3D vector by a quaternion.
 * This is equivalent to converting the quaternion to a rotation matrix and multiplying.
 *
 * @param quaternion - The rotation quaternion (must be normalized)
 * @param vector - The 3D vector to rotate
 * @returns The rotated vector
 *
 * @example
 * const q = QuaternionFromAxisAngle([0, 0, 1], Math.PI/2); // 90° around Z
 * const v = [1, 0, 0]; // Point along X-axis
 * const rotated = QuaternionRotateVector(q, v); // Should point along Y-axis
 */
export function QuaternionRotateVector(quaternion: TQuaternion, vector: TVector3): TVector3 {
	AssertNormalizedQuaternion(quaternion);

	const [qx, qy, qz, qw] = quaternion;
	const qVector: TVector3 = [qx, qy, qz];

	// Optimized quaternion-vector rotation using vector cross product
	// v' = v + 2 * cross(q.xyz, cross(q.xyz, v) + q.w * v)
	const qCrossV = Vector3Cross(qVector, vector);
	const qwTimesV: TVector3 = [qw * vector[0], qw * vector[1], qw * vector[2]];
	const qCrossVPlusQwV: TVector3 = [
		qCrossV[0] + qwTimesV[0],
		qCrossV[1] + qwTimesV[1],
		qCrossV[2] + qwTimesV[2],
	];
	const finalCross = Vector3Cross(qVector, qCrossVPlusQwV);

	return [
		vector[0] + (2 * finalCross[0]),
		vector[1] + (2 * finalCross[1]),
		vector[2] + (2 * finalCross[2]),
	];
}

/**
 * Performs spherical linear interpolation (SLERP) between two quaternions.
 * SLERP provides smooth rotation interpolation with constant angular velocity.
 *
 * @param a - Start quaternion
 * @param b - End quaternion
 * @param t - Interpolation parameter (0 = a, 1 = b)
 * @returns Interpolated quaternion
 *
 * @example
 * const q1 = QuaternionIdentity();
 * const q2 = QuaternionFromAxisAngle([0, 1, 0], Math.PI/2);
 * const halfway = QuaternionSLERP(q1, q2, 0.5); // 45° rotation
 */
export function QuaternionSLERP(a: TQuaternion, b: TQuaternion, t: number): TQuaternion {
	AssertNormalizedQuaternion(a);
	AssertNormalizedQuaternion(b);

	// Clamp t to [0, 1]
	const clampedT = Math.max(0, Math.min(1, t));

	// Compute dot product
	let dot = VectorDot(a, b);

	// If dot product is negative, use -b to take the shorter path
	let bToUse = b;
	if (dot < 0) {
		bToUse = [-b[0], -b[1], -b[2], -b[3]];
		dot = -dot;
	}

	// If quaternions are very close, use linear interpolation to avoid numerical issues
	if (dot > SLERP_DOT_THRESHOLD) {
		const result: TQuaternion = [
			a[0] + (clampedT * (bToUse[0] - a[0])),
			a[1] + (clampedT * (bToUse[1] - a[1])),
			a[2] + (clampedT * (bToUse[2] - a[2])),
			a[3] + (clampedT * (bToUse[3] - a[3])),
		];
		return QuaternionNormalize(result);
	}

	// Calculate interpolation factors
	const theta = Math.acos(Math.abs(dot));
	const sinTheta = Math.sin(theta);
	const factor1 = Math.sin((1 - clampedT) * theta) / sinTheta;
	const factor2 = Math.sin(clampedT * theta) / sinTheta;

	return [
		(factor1 * a[0]) + (factor2 * bToUse[0]),
		(factor1 * a[1]) + (factor2 * bToUse[1]),
		(factor1 * a[2]) + (factor2 * bToUse[2]),
		(factor1 * a[3]) + (factor2 * bToUse[3]),
	];
}
