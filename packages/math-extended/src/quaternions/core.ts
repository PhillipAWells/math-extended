/**
 * Core quaternion mathematics operations for rotation and orientation calculations.
 * Provides comprehensive quaternion operations with conversion utilities and interpolation.
 */

import { VectorClone, VectorDot, VectorMagnitude, VectorNormalize, VectorEquals, Vector3Cross } from '../vectors/core.js';
import type { TVector3 } from '../vectors/types.js';
import { AssertQuaternion, AssertNormalizedQuaternion, AssertEulerAngles, AssertAxisAngle, QuaternionError } from './asserts.js';
import { VectorError } from '../vectors/asserts.js';
import type { TQuaternion, TEulerAngles, TAxisAngle } from './types.js';

const QUATERNION_MAGNITUDE_TOLERANCE = 1e-10;
export const QUATERNION_TOLERANCE = 1e-6;
const SLERP_DOT_THRESHOLD = 0.9995;

/**
 * Creates an identity quaternion representing no rotation.
 * The identity quaternion is [0, 0, 0, 1] (x, y, z, w).
 *
 * @returns Identity quaternion [0, 0, 0, 1]
 *
 * @example
 * ```typescript
 * const identity = QuaternionIdentity();
 * console.log(identity); // [0, 0, 0, 1]
 * ```
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
 * ```typescript
 * const original = [0, 0, 0.707, 0.707];
 * const copy = QuaternionClone(original);
 * copy[0] = 1; // original remains unchanged
 * ```
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
 * ```typescript
 * const q1 = [0, 0, 0, 1];
 * const q2 = [0, 0, 0, -1];
 * console.log(QuaternionEquals(q1, q2)); // false (different components)
 * console.log(QuaternionEquals(q1, q2, 1e-6, true)); // true (same rotation)
 * ```
 */
export function QuaternionEquals(a: TQuaternion, b: TQuaternion, tolerance = 1e-6, checkEquivalence = false): boolean {
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
 * Checks if all components of a quaternion are finite numbers.
 * Validates quaternion structure but returns false (rather than throwing) if any component is NaN or Infinity.
 * Unlike AssertQuaternion which rejects NaN, this function allows NaN/Infinity in the structure check
 * and returns a boolean indicating finiteness instead.
 * @param quaternion - The quaternion to check.
 * @returns true if all 4 components are finite (neither NaN nor Infinity), false otherwise.
 * @throws {QuaternionError} if the input is not a valid quaternion structure (not array or wrong length).
 * @example
 * ```typescript
 * QuaternionIsFinite([0, 0, 0, 1]) // true
 * QuaternionIsFinite([0, NaN, 0, 1]) // false
 * QuaternionIsFinite([0, Infinity, 0, 1]) // false
 * ```
 */
export function QuaternionIsFinite(quaternion: TQuaternion): boolean {
	// Check basic structure (array of 4 numbers), but allow NaN/Infinity
	if (!Array.isArray(quaternion)) {
		throw new QuaternionError('Quaternion must be an array');
	}
	if (quaternion.length !== 4) {
		throw new QuaternionError(`Quaternion must have exactly 4 components, got ${quaternion.length}`);
	}
	for (let i = 0; i < 4; i++) {
		if (typeof quaternion[i] !== 'number') {
			throw new QuaternionError(`Quaternion component ${i} must be a number (not ${typeof quaternion[i]})`);
		}
	}
	// Now check if all components are finite (returns false if any NaN/Infinity)
	return quaternion.every(v => Number.isFinite(v));
}

/**
 * Calculates the magnitude (length) of a quaternion.
 * For unit quaternions (valid rotations), this should be 1.
 *
 * @param quaternion - The quaternion to measure
 * @returns The magnitude of the quaternion
 *
 * @example
 * ```typescript
 * const q = [0, 0, 0, 1];
 * console.log(QuaternionMagnitude(q)); // 1
 * ```
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
 * ```typescript
 * const q = [1, 1, 1, 1];
 * const normalized = QuaternionNormalize(q);
 * console.log(QuaternionMagnitude(normalized)); // 1
 * ```
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
 * ```typescript
 * const q = [0.5, 0.5, 0.5, 0.5];
 * const conjugate = QuaternionConjugate(q);
 * console.log(conjugate); // [-0.5, -0.5, -0.5, 0.5]
 * ```
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
 * ```typescript
 * const q = [0, 0, 0.707, 0.707]; // 90° rotation around Z
 * const inverse = QuaternionInverse(q); // -90° rotation around Z
 * ```
 */
export function QuaternionInverse(quaternion: TQuaternion): TQuaternion {
	AssertQuaternion(quaternion);

	const conjugate = QuaternionConjugate(quaternion);
	const magnitudeSquared = VectorDot(quaternion, quaternion);

	if (Math.abs(magnitudeSquared) < QUATERNION_MAGNITUDE_TOLERANCE) {
		throw new QuaternionError('Cannot invert quaternion with zero magnitude');
	}

	// For unit quaternions, magnitude squared is 1, so this is just the conjugate
	return [
		conjugate[0] / magnitudeSquared,
		conjugate[1] / magnitudeSquared,
		conjugate[2] / magnitudeSquared,
		conjugate[3] / magnitudeSquared
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
 * ```typescript
 * const rotX = QuaternionFromAxisAngle([1, 0, 0], Math.PI/2); // 90° around X
 * const rotY = QuaternionFromAxisAngle([0, 1, 0], Math.PI/2); // 90° around Y
 * const combined = QuaternionMultiply(rotX, rotY); // Y rotation then X rotation
 * ```
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
		(aw * bw) - (ax * bx) - (ay * by) - (az * bz)
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
 * ```typescript
 * const axis = [0, 1, 0]; // Y-axis
 * const angle = Math.PI / 2; // 90 degrees
 * const q = QuaternionFromAxisAngle(axis, angle);
 * ```
 */
export function QuaternionFromAxisAngle(axis: TVector3, angle: number): TQuaternion {
	try {
		// AssertVector3 validates that axis is a valid 3D vector
		const normalizedAxis = VectorNormalize(axis);
		const halfAngle = angle * 0.5;
		const sinHalf = Math.sin(halfAngle);
		const cosHalf = Math.cos(halfAngle);

		return [
			normalizedAxis[0] * sinHalf,
			normalizedAxis[1] * sinHalf,
			normalizedAxis[2] * sinHalf,
			cosHalf
		];
	}
	catch (err) {
		// Convert VectorError to QuaternionError
		if (err instanceof VectorError) {
			throw new QuaternionError(`Invalid axis vector: ${err.message}`, { cause: err });
		}
		throw err;
	}
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
 * The quaternion is first normalized to canonical form (w ≥ 0) so that q and -q,
 * which represent the same rotation, always produce the same axis-angle result.
 *
 * @param quaternion - The quaternion to convert (must be normalized)
 * @returns The axis-angle representation as [x, y, z, angle] where angle ∈ [0, π]
 * @throws {Error} If the quaternion is not normalized
 *
 * @example
 * ```typescript
 * const q = [0, 0.707, 0, 0.707]; // 90° around Y-axis
 * const axisAngle = QuaternionToAxisAngle(q);
 * console.log(axisAngle); // [0, 1, 0, π/2]
 * ```
 */
export function QuaternionToAxisAngle(quaternion: TQuaternion): TAxisAngle {
	AssertNormalizedQuaternion(quaternion);

	const [x, y, z, w] = quaternion;

	// Normalize to canonical form with w >= 0 (q and -q represent the same rotation).
	// Without this, a quaternion with w < 0 would pair the wrong axis with the wrong angle.
	const [qx, qy, qz, qw] = w < 0 ? [-x, -y, -z, -w] : [x, y, z, w];

	// Handle identity quaternion
	if (qw >= 1) {
		return [1, 0, 0, 0]; // Arbitrary axis, zero angle
	}

	const angle = 2 * Math.acos(Math.min(1, qw));
	const sinHalfAngle = Math.sqrt(1 - (qw * qw));

	if (sinHalfAngle < QUATERNION_TOLERANCE) {
		// Avoid division by zero for small angles
		return [1, 0, 0, 0];
	}

	return [
		qx / sinHalfAngle,
		qy / sinHalfAngle,
		qz / sinHalfAngle,
		angle
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
 * ```typescript
 * const euler = [0, Math.PI/4, 0]; // 45° pitch
 * const q = QuaternionFromEuler(euler);
 * ```
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
		(cx * cy * cz) + (sx * sy * sz)
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
 * ```typescript
 * const q = [0, 0.383, 0, 0.924]; // ~45° around Y-axis
 * const euler = QuaternionToEuler(q);
 * console.log(euler); // [0, π/4, 0]
 * ```
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
 * ```typescript
 * const q = QuaternionFromAxisAngle([0, 0, 1], Math.PI/2); // 90° around Z
 * const v = [1, 0, 0]; // Point along X-axis
 * const rotated = QuaternionRotateVector(q, v); // Should point along Y-axis
 * ```
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
		qCrossV[2] + qwTimesV[2]
	];
	const finalCross = Vector3Cross(qVector, qCrossVPlusQwV);

	return [
		vector[0] + (2 * finalCross[0]),
		vector[1] + (2 * finalCross[1]),
		vector[2] + (2 * finalCross[2])
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
 * ```typescript
 * const q1 = QuaternionIdentity();
 * const q2 = QuaternionFromAxisAngle([0, 1, 0], Math.PI/2);
 * const halfway = QuaternionSLERP(q1, q2, 0.5); // 45° rotation
 * ```
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
			a[3] + (clampedT * (bToUse[3] - a[3]))
		];
		return QuaternionNormalize(result);
	}

	// Calculate interpolation factors (dot is guaranteed >= 0 from the sign-flip above)
	const theta = Math.acos(Math.min(1, dot));
	const sinTheta = Math.sin(theta);
	const factor1 = Math.sin((1 - clampedT) * theta) / sinTheta;
	const factor2 = Math.sin(clampedT * theta) / sinTheta;

	return [
		(factor1 * a[0]) + (factor2 * bToUse[0]),
		(factor1 * a[1]) + (factor2 * bToUse[1]),
		(factor1 * a[2]) + (factor2 * bToUse[2]),
		(factor1 * a[3]) + (factor2 * bToUse[3])
	];
}

/**
 * Computes the dot product of two quaternions.
 * The dot product is the sum of component-wise products: a.x*b.x + a.y*b.y + a.z*b.z + a.w*b.w.
 *
 * @param a - First quaternion
 * @param b - Second quaternion
 * @returns The dot product as a number
 * @throws {QuaternionError} If either input is not a valid quaternion
 *
 * @example
 * ```typescript
 * const q1 = [0, 0, 0, 1];
 * const q2 = [0, 0, 0.707, 0.707];
 * const dot = QuaternionDot(q1, q2);
 * console.log(dot); // 0.707 (cos of angle between them)
 * ```
 */
export function QuaternionDot(a: TQuaternion, b: TQuaternion): number {
	AssertQuaternion(a);
	AssertQuaternion(b);

	return VectorDot(a, b);
}

/**
 * Calculates the angle (in radians) of the relative rotation between two quaternions.
 * Returns a value in [0, π] representing the shortest rotational distance.
 * The angle is computed as 2 * acos(min(1, |dot(normalize(a), normalize(b))|)).
 *
 * @param a - First quaternion
 * @param b - Second quaternion
 * @returns The angle in radians, in the range [0, π]
 * @throws {QuaternionError} If either input is not a valid quaternion
 *
 * @example
 * ```typescript
 * const q1 = QuaternionIdentity();
 * const q2 = QuaternionFromAxisAngle([0, 1, 0], Math.PI / 2);
 * const angle = QuaternionAngleBetween(q1, q2);
 * console.log(angle); // π/2 (90 degrees)
 * ```
 */
export function QuaternionAngleBetween(a: TQuaternion, b: TQuaternion): number {
	AssertQuaternion(a);
	AssertQuaternion(b);

	const aNormalized = QuaternionNormalize(a);
	const bNormalized = QuaternionNormalize(b);
	const dot = Math.abs(QuaternionDot(aNormalized, bNormalized));

	return 2 * Math.acos(Math.min(1, dot));
}

/**
 * Creates a quaternion representing the shortest-arc rotation from one direction to another.
 * Returns a normalized quaternion that rotates the `from` vector onto the `to` vector.
 * Handles parallel and anti-parallel cases correctly.
 *
 * @param from - Source direction vector (will be normalized)
 * @param to - Target direction vector (will be normalized)
 * @returns A normalized unit quaternion representing the rotation
 * @throws {QuaternionError} If either vector has zero magnitude
 *
 * @example
 * ```typescript
 * const from = [1, 0, 0]; // +X direction
 * const to = [0, 1, 0]; // +Y direction
 * const rotation = QuaternionFromToRotation(from, to);
 * const result = QuaternionRotateVector(rotation, from);
 * // result is approximately [0, 1, 0]
 * ```
 */
export function QuaternionFromToRotation(from: TVector3, to: TVector3): TQuaternion {
	try {
		const fromNormalized = VectorNormalize(from);
		const toNormalized = VectorNormalize(to);

		const dot = VectorDot(fromNormalized, toNormalized);

		// Handle parallel case (already aligned)
		if (dot > 0.9999999) {
			return QuaternionIdentity();
		}

		// Handle anti-parallel case (180° rotation)
		if (dot < -0.9999999) {
			// Find an arbitrary perpendicular axis
			let perpendicular: TVector3;
			if (Math.abs(fromNormalized[0]) < 0.9) {
				perpendicular = [1, 0, 0];
			}
			else {
				perpendicular = [0, 1, 0];
			}

			const axis = VectorNormalize(Vector3Cross(fromNormalized, perpendicular));
			// 180° rotation: [sin(π/2) * axis, cos(π/2)] = [axis, 0]
			return [axis[0], axis[1], axis[2], 0];
		}

		// General case: shortest rotation axis is cross product
		const axis = Vector3Cross(fromNormalized, toNormalized);
		const axisNormalized = VectorNormalize(axis);

		// Angle between vectors
		const angle = Math.acos(Math.max(-1, Math.min(1, dot)));

		// Create quaternion from axis and angle
		return QuaternionFromAxisAngle(axisNormalized, angle);
	}
	catch (err) {
		if (err instanceof VectorError) {
			throw new QuaternionError(`Cannot create rotation: ${err.message}`, { cause: err });
		}
		throw err;
	}
}

/**
 * Rotates one quaternion towards another by at most a specified angle.
 * Computes the shortest rotational path from the source orientation to the target,
 * then constrains the rotation to at most maxRadians in that direction.
 * Useful for smooth rotation limits and frame-rate-independent rotation stepping.
 *
 * @param from - Source quaternion (starting orientation)
 * @param to - Target quaternion (desired orientation)
 * @param maxRadians - Maximum rotation angle in radians (must be non-negative)
 * @returns A normalized quaternion rotated at most maxRadians towards the target
 * @throws {QuaternionError} If either quaternion is invalid
 *
 * @example
 * ```typescript
 * const from = QuaternionIdentity();
 * const to = QuaternionFromAxisAngle([0, 1, 0], Math.PI / 2);
 * const stepped = QuaternionRotateTowards(from, to, Math.PI / 4);
 * // result is 25% of the way from from to to
 * ```
 */
export function QuaternionRotateTowards(from: TQuaternion, to: TQuaternion, maxRadians: number): TQuaternion {
	AssertQuaternion(from);
	AssertQuaternion(to);

	const totalAngle = QuaternionAngleBetween(from, to);

	// If maxRadians is large enough to reach target or greater, return normalized target
	if (maxRadians >= totalAngle) {
		return QuaternionNormalize(to);
	}

	// If maxRadians is zero or negative, return normalized source
	if (maxRadians <= 0) {
		return QuaternionNormalize(from);
	}

	// Guard against division by zero when angle is very small
	if (totalAngle < QUATERNION_TOLERANCE) {
		return QuaternionNormalize(to);
	}

	// SLERP by the fraction of rotation we're allowed to take
	const t = maxRadians / totalAngle;
	return QuaternionSLERP(from, to, t);
}
