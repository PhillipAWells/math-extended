/**
 * Predefined quaternions for common rotations and orientations.
 * Provides convenient constants for frequently used quaternion values.
 */

import { TQuaternion } from './types.js';
import { QuaternionFromAxisAngle } from './core.js';

/**
 * Creates a quaternion representing rotation around the X-axis.
 *
 * @param angle - Rotation angle in radians
 * @returns Quaternion representing rotation around X-axis
 *
 * @example
 * const q = QuaternionRotationX(Math.PI / 2); // 90° rotation around X-axis
 */
export function QuaternionRotationX(angle: number): TQuaternion {
	return QuaternionFromAxisAngle([1, 0, 0], angle);
}

/**
 * Creates a quaternion representing rotation around the Y-axis.
 *
 * @param angle - Rotation angle in radians
 * @returns Quaternion representing rotation around Y-axis
 *
 * @example
 * const q = QuaternionRotationY(Math.PI / 4); // 45° rotation around Y-axis
 */
export function QuaternionRotationY(angle: number): TQuaternion {
	return QuaternionFromAxisAngle([0, 1, 0], angle);
}

/**
 * Creates a quaternion representing rotation around the Z-axis.
 *
 * @param angle - Rotation angle in radians
 * @returns Quaternion representing rotation around Z-axis
 *
 * @example
 * const q = QuaternionRotationZ(Math.PI); // 180° rotation around Z-axis
 */
export function QuaternionRotationZ(angle: number): TQuaternion {
	return QuaternionFromAxisAngle([0, 0, 1], angle);
}
