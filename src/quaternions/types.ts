/**
 * Quaternion type definitions for rotation and orientation calculations.
 * Quaternions provide a mathematically robust way to represent rotations in 3D space,
 * avoiding gimbal lock and providing smooth interpolation capabilities.
 */
import z from 'zod';

/**
 * Quaternion type representing a rotation in 3D space as [x, y, z, w].
 * The first three components (x, y, z) represent the vector part (rotation axis scaled by sin(θ/2)),
 * and the fourth component (w) represents the scalar part (cos(θ/2)).
 *
 * Quaternions extend IVector4 to leverage vector operations while maintaining semantic meaning.
 *
 * @example
 * ```typescript
 * const identity: TQuaternion = [0, 0, 0, 1];     // No rotation
 * const rotationX: TQuaternion = [1, 0, 0, 0];    // 180° rotation around X-axis
 * const rotation90Y: TQuaternion = [0, 0.707, 0, 0.707]; // 90° rotation around Y-axis
 * ```
 */
export const QUATERNION_SCHEMA = z.array(
	z.unknown().refine(
		val => typeof val === 'number' && !Number.isNaN(val),
		{ message: 'Component must be a number' },
	),
).refine(
	arr => arr.length === 4,
	{ message: 'Quaternion must have exactly 4 components' },
);
export type TQuaternion = [number, number, number, number];

/**
 * Euler angles representation as [x, y, z] rotations in radians.
 * Order of rotation is typically Z-Y-X (yaw-pitch-roll) unless specified otherwise.
 *
 * @example
 * ```typescript
 * const euler: TEulerAngles = [0, Math.PI/4, 0]; // 45° pitch rotation
 * ```
 */
export const EULER_ANGLES_SCHEMA = z.array(
	z.unknown().refine(
		val => typeof val === 'number' && !Number.isNaN(val),
		{ message: 'Component must be a number' },
	),
).refine(
	arr => arr.length === 3,
	{ message: 'Euler angles must have exactly 3 components' },
);
export type TEulerAngles = [number, number, number];

/**
 * Axis-angle representation as [axis_x, axis_y, axis_z, angle].
 * The first three components define a normalized rotation axis,
 * and the fourth component is the rotation angle in radians.
 *
 * @example
 * ```typescript
 * const axisAngle: TAxisAngle = [0, 1, 0, Math.PI/2]; // 90° rotation around Y-axis
 * ```
 */
export const AXIS_ANGLE_SCHEMA = z.array(
	z.unknown().refine(
		val => typeof val === 'number' && !Number.isNaN(val),
		{ message: 'Component must be a number' },
	),
).refine(
	arr => arr.length === 4,
	{ message: 'Axis-angle must have exactly 4 components' },
);
export type TAxisAngle = [number, number, number, number];

/**
 * Rotation matrix representation as a 3x3 matrix.
 * Uses the standard TMatrix3 type for better integration with matrix operations.
 *
 * @example
 * ```typescript
 * const identity: TRotationMatrix = [
 *   [1, 0, 0],  // First row
 *   [0, 1, 0],  // Second row
 *   [0, 0, 1]   // Third row
 * ];
 * ```
 */
export const ROTATION_MATRIX_SCHEMA = z.array(
	z.array(
		z.unknown().refine(
			val => typeof val === 'number' && !Number.isNaN(val),
			{ message: 'Component must be a number' },
		),
	),
).refine(
	arr => arr.length === 3 && arr.every(row => row.length === 3),
	{ message: 'Rotation matrix must be 3x3' },
);
export type TRotationMatrix = [[number, number, number], [number, number, number], [number, number, number]];

/**
 * Union type representing any supported rotation representation.
 * Useful for functions that can accept multiple rotation formats.
 */
export type TRotation = TQuaternion | TEulerAngles | TAxisAngle | TRotationMatrix;
