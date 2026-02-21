/**
 * Quaternion type definitions for rotation and orientation calculations.
 * Quaternions provide a mathematically robust way to represent rotations in 3D space,
 * avoiding gimbal lock and providing smooth interpolation capabilities.
 */

import { TVector3, TVector4 } from '../vectors/types.js';
import { IMatrix3 } from '../matrices/types.js';

/**
 * Quaternion type representing a rotation in 3D space as [x, y, z, w].
 * The first three components (x, y, z) represent the vector part (rotation axis scaled by sin(θ/2)),
 * and the fourth component (w) represents the scalar part (cos(θ/2)).
 *
 * Quaternions extend IVector4 to leverage vector operations while maintaining semantic meaning.
 *
 * @example
 * const identity: IQuaternion = [0, 0, 0, 1];     // No rotation
 * const rotationX: IQuaternion = [1, 0, 0, 0];    // 180° rotation around X-axis
 * const rotation90Y: IQuaternion = [0, 0.707, 0, 0.707]; // 90° rotation around Y-axis
 */
export type TQuaternion = TVector4;

/**
 * Euler angles representation as [x, y, z] rotations in radians.
 * Order of rotation is typically Z-Y-X (yaw-pitch-roll) unless specified otherwise.
 *
 * @example
 * const euler: IEulerAngles = [0, Math.PI/4, 0]; // 45° pitch rotation
 */
export type TEulerAngles = TVector3;

/**
 * Axis-angle representation as [axis_x, axis_y, axis_z, angle].
 * The first three components define a normalized rotation axis,
 * and the fourth component is the rotation angle in radians.
 *
 * @example
 * const axisAngle: IAxisAngle = [0, 1, 0, Math.PI/2]; // 90° rotation around Y-axis
 */
export type TAxisAngle = TVector4;

/**
 * Rotation matrix representation as a 3x3 matrix.
 * Uses the standard IMatrix3 type for better integration with matrix operations.
 *
 * @example
 * const identity: IRotationMatrix = [
 *   [1, 0, 0],  // First row
 *   [0, 1, 0],  // Second row
 *   [0, 0, 1]   // Third row
 * ];
 */
export type TRotationMatrix = IMatrix3;

/**
 * Union type representing any supported rotation representation.
 * Useful for functions that can accept multiple rotation formats.
 */
export type TRotation = TQuaternion | TEulerAngles | TAxisAngle | TRotationMatrix;
