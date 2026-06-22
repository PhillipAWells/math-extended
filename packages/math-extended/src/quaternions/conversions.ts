/**
 * Conversion utilities for quaternions and various rotation representations.
 * Provides comprehensive conversion between different rotation formats.
 */

import type { TMatrix4 } from '../matrices/types.js';
import { AssertMatrix4 } from '../matrices/asserts.js';
import { AssertNormalizedQuaternion, AssertRotationMatrix, QuaternionError } from './asserts.js';
import type { TQuaternion, TRotationMatrix } from './types.js';
import type { TVector3 } from '../vectors/types.js';
import { VectorNormalize, Vector3Cross, VectorDot } from '../vectors/core.js';
import { VectorError } from '../vectors/asserts.js';

const SHEPPERD_QUARTER = 0.25;

/**
 * Converts a quaternion to a 3x3 rotation matrix.
 * The matrix is returned as a proper TMatrix3 type.
 *
 * @param quaternion - The normalized quaternion to convert
 * @returns 3x3 rotation matrix as TMatrix3
 *
 * @example
 * ```typescript
 * const q = [0, 0, 0.707, 0.707]; // 90° rotation around Z-axis
 * const matrix = QuaternionToRotationMatrix(q);
 * // matrix represents rotation that transforms +X to +Y
 * ```
 */
export function QuaternionToRotationMatrix(quaternion: TQuaternion): TRotationMatrix {
	AssertNormalizedQuaternion(quaternion);

	const [x, y, z, w] = quaternion;
	const xx = x * x;
	const yy = y * y;
	const zz = z * z;
	const xy = x * y;
	const xz = x * z;
	const yz = y * z;
	const wx = w * x;
	const wy = w * y;
	const wz = w * z;

	return [
		[1 - (2 * (yy + zz)), 2 * (xy - wz), 2 * (xz + wy)],
		[2 * (xy + wz), 1 - (2 * (xx + zz)), 2 * (yz - wx)],
		[2 * (xz - wy), 2 * (yz + wx), 1 - (2 * (xx + yy))]
	];
}

/**
 * Converts a 3x3 rotation matrix to a quaternion.
 * The matrix should be a proper TMatrix3 type.
 *
 * @param matrix - 3x3 rotation matrix as TMatrix3
 * @returns Normalized quaternion representing the same rotation
 *
 * @example
 * ```typescript
 * const identityMatrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
 * const q = QuaternionFromRotationMatrix(identityMatrix);
 * console.log(q); // [0, 0, 0, 1] (identity quaternion)
 * ```
 */
export function QuaternionFromRotationMatrix(matrix: TRotationMatrix): TQuaternion {
	AssertRotationMatrix(matrix);

	const [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]] = matrix;

	// Trace of the matrix
	const trace = m00 + m11 + m22;

	if (trace > 0) {
		// Standard case
		const s = Math.sqrt(trace + 1) * 2; // s = 4 * qw
		const w = SHEPPERD_QUARTER * s;
		const x = (m21 - m12) / s;
		const y = (m02 - m20) / s;
		const z = (m10 - m01) / s;
		return [x, y, z, w];
	}
	else if ((m00 > m11) && (m00 > m22)) {
		// m00 is largest
		const s = Math.sqrt(1 + m00 - m11 - m22) * 2; // s = 4 * qx
		const w = (m21 - m12) / s;
		const x = SHEPPERD_QUARTER * s;
		const y = (m01 + m10) / s;
		const z = (m02 + m20) / s;
		return [x, y, z, w];
	}
	else if (m11 > m22) {
		// m11 is largest
		const s = Math.sqrt(1 + m11 - m00 - m22) * 2; // s = 4 * qy
		const w = (m02 - m20) / s;
		const x = (m01 + m10) / s;
		const y = SHEPPERD_QUARTER * s;
		const z = (m12 + m21) / s;
		return [x, y, z, w];
	}
	else {
		// m22 is largest
		const s = Math.sqrt(1 + m22 - m00 - m11) * 2; // s = 4 * qz
		const w = (m10 - m01) / s;
		const x = (m02 + m20) / s;
		const y = (m12 + m21) / s;
		const z = SHEPPERD_QUARTER * s;
		return [x, y, z, w];
	}
}

/**
 * Converts a quaternion to a 4x4 transformation matrix.
 * The resulting matrix can be used for 3D transformations in homogeneous coordinates.
 * Translation component is zero (pure rotation matrix).
 *
 * @param quaternion - The normalized quaternion to convert
 * @returns 4x4 transformation matrix as a flat array of 16 elements (row-major)
 *
 * @example
 * ```typescript
 * const q = [0, 0, 0, 1]; // Identity quaternion
 * const matrix4x4 = QuaternionToTransformationMatrix(q);
 * // Returns identity 4x4 matrix
 * ```
 */
export function QuaternionToTransformationMatrix(quaternion: TQuaternion): TMatrix4 {
	const rotationMatrix = QuaternionToRotationMatrix(quaternion);

	// Fill 4x4 matrix in row-major order
	return [
		[rotationMatrix[0][0], rotationMatrix[0][1], rotationMatrix[0][2], 0],
		[rotationMatrix[1][0], rotationMatrix[1][1], rotationMatrix[1][2], 0],
		[rotationMatrix[2][0], rotationMatrix[2][1], rotationMatrix[2][2], 0],
		[0, 0, 0, 1]
	];
}
/**
 * Extracts the rotation quaternion from a 4x4 transformation matrix.
 * Ignores translation and scaling components, extracting only the rotation.
 *
 * @param matrix4x4 - 4x4 transformation matrix as a flat array of 16 elements
 * @returns Normalized quaternion representing the rotation component
 *
 * @example
 * ```typescript
 * const transformMatrix = [1, 0, 0, 5, 0, 1, 0, 10, 0, 0, 1, 15, 0, 0, 0, 1];
 * const q = QuaternionFromTransformationMatrix(transformMatrix);
 * // Extracts rotation (identity in this case), ignores translation [5, 10, 15]
 * ```
 */
export function QuaternionFromTransformationMatrix(matrix: TMatrix4): TQuaternion {
	AssertMatrix4(matrix);

	// Extract 3x3 rotation matrix from 4x4 transformation matrix
	const rotationMatrix: TRotationMatrix = [
		[matrix[0][0], matrix[0][1], matrix[0][2]],
		[matrix[1][0], matrix[1][1], matrix[1][2]],
		[matrix[2][0], matrix[2][1], matrix[2][2]]
	];

	return QuaternionFromRotationMatrix(rotationMatrix);
}

/**
 * Checks if a matrix is a valid rotation matrix.
 * A valid rotation matrix should be orthogonal and have determinant +1.
 *
 * @param matrix - The matrix to validate
 * @param tolerance - Tolerance for floating-point comparisons (default: 1e-6)
 * @returns True if the matrix is a valid rotation matrix
 *
 * @example
 * ```typescript
 * const matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // Identity matrix
 * console.log(IsValidRotationMatrix(matrix)); // true
 * ```
 */
export function IsValidRotationMatrix(matrix: TRotationMatrix, tolerance = 1e-6): boolean {
	AssertRotationMatrix(matrix);

	const [[m00, m01, m02], [m10, m11, m12], [m20, m21, m22]] = matrix;

	// Check if matrix is orthogonal (columns are unit vectors and orthogonal)

	// Column 1: [m00, m10, m20]
	const col1LengthSq = (m00 * m00) + (m10 * m10) + (m20 * m20);
	if (Math.abs(col1LengthSq - 1) > tolerance) return false;

	// Column 2: [m01, m11, m21]
	const col2LengthSq = (m01 * m01) + (m11 * m11) + (m21 * m21);
	if (Math.abs(col2LengthSq - 1) > tolerance) return false;

	// Column 3: [m02, m12, m22]
	const col3LengthSq = (m02 * m02) + (m12 * m12) + (m22 * m22);
	if (Math.abs(col3LengthSq - 1) > tolerance) return false;

	// Check orthogonality between columns
	const dot12 = (m00 * m01) + (m10 * m11) + (m20 * m21);
	if (Math.abs(dot12) > tolerance) return false;

	const dot13 = (m00 * m02) + (m10 * m12) + (m20 * m22);
	if (Math.abs(dot13) > tolerance) return false;

	const dot23 = (m01 * m02) + (m11 * m12) + (m21 * m22);
	if (Math.abs(dot23) > tolerance) return false;

	// Check determinant is +1 (not -1, which would be a reflection)
	const det = (m00 * ((m11 * m22) - (m12 * m21))) - (m01 * ((m10 * m22) - (m12 * m20))) + (m02 * ((m10 * m21) - (m11 * m20)));
	if (Math.abs(det - 1) > tolerance) return false;

	return true;
}

/**
 * Creates a quaternion representing an orientation with a given forward direction and optional up vector.
 * The quaternion positions an object so its forward axis points along the `forward` direction,
 * with roll determined by the `up` vector.
 * Convention: forward maps to +Z, right to +X, up to +Y in the rotated frame.
 *
 * @param forward - The forward direction (will be normalized)
 * @param up - The up reference direction (default: [0, 1, 0]); will be orthogonalized
 * @returns A normalized quaternion representing the look rotation
 * @throws {QuaternionError} If forward has zero magnitude, or if forward and up are parallel/anti-parallel
 *
 * @example
 * ```typescript
 * const forward = [0, 0, 1]; // Looking along +Z
 * const up = [0, 1, 0]; // Standard up
 * const rotation = QuaternionLookRotation(forward, up);
 * // Rotating [0, 0, 1] by this quaternion gives the rotated forward vector
 * ```
 */
export function QuaternionLookRotation(forward: TVector3, up?: TVector3): TQuaternion {
	try {
		const forwardNormalized = VectorNormalize(forward);
		const upVector: TVector3 = up ?? [0, 1, 0];
		const upNormalized = VectorNormalize(upVector);

		// Check if forward and up are too parallel
		const dot = Math.abs(VectorDot(forwardNormalized, upNormalized));
		if (dot > 0.9999) {
			throw new QuaternionError('Forward and up vectors are parallel or anti-parallel, cannot determine roll');
		}

		// Build orthonormal basis (right-hand coordinate system)
		// Right = cross(up, forward)
		const right = VectorNormalize(Vector3Cross(upNormalized, forwardNormalized));

		// Recomputed up = cross(forward, right)
		const recomputedUp = Vector3Cross(forwardNormalized, right);

		// Assemble 3x3 rotation matrix as column vectors
		// Column 0 (right): where X-axis goes
		// Column 1 (up): where Y-axis goes
		// Column 2 (forward): where Z-axis goes
		const rotationMatrix: TRotationMatrix = [
			[right[0], recomputedUp[0], forwardNormalized[0]],
			[right[1], recomputedUp[1], forwardNormalized[1]],
			[right[2], recomputedUp[2], forwardNormalized[2]]
		];

		return QuaternionFromRotationMatrix(rotationMatrix);
	}
	catch (err) {
		if (err instanceof VectorError) {
			throw new QuaternionError(`Cannot create look rotation: ${err.message}`, { cause: err });
		}
		if (err instanceof QuaternionError) {
			throw err;
		}
		throw new QuaternionError('Cannot create look rotation: unknown error', { cause: err instanceof Error ? err : undefined });
	}
}
