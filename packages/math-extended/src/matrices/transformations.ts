/**
 * @fileoverview Matrix transformation functions for 2D and 3D operations.
 *
 * This module provides comprehensive transformation matrix creation and application functions
 * for computer graphics, game development, and mathematical applications. It includes:
 *
 * - Rotation matrices (2D and 3D with Euler angles)
 * - Scale transformation matrices (uniform and non-uniform)
 * - Translation matrices for positional transformations
 * - Vector transformation utilities with homogeneous coordinate support
 * - View and projection matrices for 3D rendering pipelines
 *
 * All matrices use homogeneous coordinates for consistent transformation composition.
 * 2D transformations use 3x3 matrices, 3D transformations use 4x4 matrices.
 */

import { AssertNumber, AssertNotEquals } from '../internal/guards.js';
import { MatrixCreate } from './core.js';
import { MatrixMultiply } from './arithmetic.js';
import { AssertMatrix3, AssertMatrix4, MatrixError } from './asserts.js';
import type { TMatrix3, TMatrix4 } from './types.js';
import type { TVector2, TVector3, TVector4 } from '../vectors/types.js';
import { AssertVector2, AssertVector3, AssertVector4 } from '../vectors/asserts.js';
import { VectorSubtract, VectorNormalize, Vector3Cross } from '../vectors/core.js';

const DEGREES_PER_HALF_REVOLUTION = 180;

// ============================================================================
// 2D ROTATION TRANSFORMATIONS
// ============================================================================

/**
 * Creates a 2D rotation matrix for rotating points around the origin.
 *
 * The matrix rotates points counterclockwise for positive angles in a standard
 * right-handed coordinate system. Uses homogeneous coordinates for composition
 * with other 2D transformations.
 *
 * Matrix structure:
 * ```
 * [cos(θ)  -sin(θ)   0]
 * [sin(θ)   cos(θ)   0]
 * [  0        0      1]
 * ```
 *
 * @param radians - Rotation angle in radians (positive = counterclockwise)
 * @returns {TMatrix3} A 3x3 rotation matrix for 2D transformations
 *
 * @throws {Error} If radians is not a finite number
 *
 * @example
 * ```typescript
 * // 90-degree counterclockwise rotation
 * const matrix = MatrixRotation2D(Math.PI / 2);
 * // 45-degree clockwise rotation
 * const clockwise = MatrixRotation2D(-Math.PI / 4);
 * ```
 */
export function MatrixRotation2D(radians: number): TMatrix3 {
	AssertNumber(radians, { finite: true }, { message: 'Rotation angle must be a number' });

	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return [
		[cos, -sin, 0], // [cos(θ), -sin(θ), 0]
		[sin, cos, 0], // [sin(θ),  cos(θ), 0]
		[0, 0, 1] // [   0,      0,     1]
	];
}

// ============================================================================
// 3D ROTATION TRANSFORMATIONS
// ============================================================================

/**
 * Creates a 3D roll rotation matrix (rotation around the X-axis).
 *
 * Roll represents banking motion in aviation terminology. Positive angles
 * follow the right-hand rule: curl fingers from Y toward Z, thumb points
 * in positive X direction.
 *
 * Matrix structure:
 * ```
 * [1    0       0    0]
 * [0  cos(θ) -sin(θ) 0]
 * [0  sin(θ)  cos(θ) 0]
 * [0    0       0    1]
 * ```
 *
 * @param radians - Roll angle in radians (positive = right-hand rule around X-axis)
 * @returns {TMatrix4} A 4x4 roll rotation matrix
 *
 * @throws {Error} If radians is not a finite number
 *
 * @example
 * ```typescript
 * // 45-degree roll (banking left in aviation)
 * const rollMatrix = MatrixRotation3DRoll(Math.PI / 4);
 * ```
 */
export function MatrixRotation3DRoll(radians: number): TMatrix4 {
	AssertNumber(radians, { finite: true }, { message: 'Rotation angle must be a number' });

	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return [
		[1, 0, 0, 0], // [1,    0,       0,    0]
		[0, cos, -sin, 0], // [0, cos(θ), -sin(θ), 0]
		[0, sin, cos, 0], // [0, sin(θ),  cos(θ), 0]
		[0, 0, 0, 1] // [0,    0,       0,    1]
	];
}

/**
 * Creates a 3D pitch rotation matrix (rotation around the Y-axis).
 *
 * Pitch represents elevation motion in aviation terminology. Positive angles
 * follow the right-hand rule: curl fingers from Z toward X, thumb points
 * in positive Y direction.
 *
 * Matrix structure:
 * ```
 * [ cos(θ)  0  sin(θ)  0]
 * [   0     1    0     0]
 * [-sin(θ)  0  cos(θ)  0]
 * [   0     0    0     1]
 * ```
 *
 * @param radians - Pitch angle in radians (positive = nose up in aviation)
 * @returns {TMatrix4} A 4x4 pitch rotation matrix
 *
 * @throws {Error} If radians is not a finite number
 *
 * @example
 * ```typescript
 * // 30-degree pitch up
 * const pitchMatrix = MatrixRotation3DPitch(Math.PI / 6);
 * ```
 */
export function MatrixRotation3DPitch(radians: number): TMatrix4 {
	AssertNumber(radians, { finite: true }, { message: 'Rotation angle must be a number' });

	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return [
		[cos, 0, sin, 0], // [ cos(θ), 0,  sin(θ), 0]
		[0, 1, 0, 0], // [   0,    1,    0,    0]
		[-sin, 0, cos, 0], // [-sin(θ), 0,  cos(θ), 0]
		[0, 0, 0, 1] // [   0,    0,    0,    1]
	];
}

/**
 * Creates a 3D yaw rotation matrix (rotation around the Z-axis).
 *
 * Yaw represents heading motion in aviation terminology. Positive angles
 * follow the right-hand rule: curl fingers from X toward Y, thumb points
 * in positive Z direction.
 *
 * Matrix structure:
 * ```
 * [cos(θ) -sin(θ)  0  0]
 * [sin(θ)  cos(θ)  0  0]
 * [  0       0     1  0]
 * [  0       0     0  1]
 * ```
 *
 * @param radians - Yaw angle in radians (positive = turn left in aviation)
 * @returns {TMatrix4} A 4x4 yaw rotation matrix
 *
 * @throws {Error} If radians is not a finite number
 *
 * @example
 * ```typescript
 * // 60-degree yaw left
 * const yawMatrix = MatrixRotation3DYaw(Math.PI / 3);
 * ```
 */
export function MatrixRotation3DYaw(radians: number): TMatrix4 {
	AssertNumber(radians, { finite: true }, { message: 'Rotation angle must be a number' });

	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return [
		[cos, -sin, 0, 0], // [cos(θ), -sin(θ), 0, 0]
		[sin, cos, 0, 0], // [sin(θ),  cos(θ), 0, 0]
		[0, 0, 1, 0], // [  0,       0,     1, 0]
		[0, 0, 0, 1] // [  0,       0,     0, 1]
	];
}

/**
 * Creates a composite 3D rotation matrix from yaw, pitch, and roll components.
 *
 * Uses intrinsic rotation sequence: Roll (X) → Pitch (Y) → Yaw (Z), which is
 * the standard aviation rotation order. The rotations are applied in sequence,
 * with each rotation being relative to the rotated coordinate system.
 *
 * This function supports two call patterns:
 * 1. Individual angles: MatrixRotation3D(roll, pitch, yaw)
 * 2. Vector input: MatrixRotation3D([roll, pitch, yaw])
 *
 * @param roll - Roll angle in radians (X-axis rotation) or vector [roll, pitch, yaw]
 * @param pitch - Pitch angle in radians (Y-axis rotation, required if roll is number)
 * @param yaw - Yaw angle in radians (Z-axis rotation, required if roll is number)
 * @returns {TMatrix4} A 4x4 composite rotation matrix
 *
 * @throws {Error} If any angle is not a finite number
 *
 * @example
 * ```typescript
 * // Using individual angles (banking, elevation, heading)
 * const rotationMatrix = MatrixRotation3D(0.1, 0.2, 0.3);
 * // Using vector input
 * const eulerAngles: TVector3 = [0.1, 0.2, 0.3];
 * const rotationMatrix2 = MatrixRotation3D(eulerAngles);
 * ```
 */

export function MatrixRotation3D(roll: number, pitch: number, yaw: number): TMatrix4;

export function MatrixRotation3D(v: TVector3): TMatrix4;
export function MatrixRotation3D(rollOrVector: number | TVector3, pitch?: number, yaw?: number): TMatrix4 {
	if (typeof rollOrVector === 'number') {
		// Called with individual parameters
		AssertNumber(rollOrVector, { finite: true }, { message: 'Roll angle must be a number' });
		AssertNumber(pitch, { finite: true }, { message: 'Pitch angle must be a number' });
		AssertNumber(yaw, { finite: true }, { message: 'Yaw angle must be a number' });

		const rollMatrix = MatrixRotation3DRoll(rollOrVector);
		const pitchMatrix = MatrixRotation3DPitch(pitch);
		const yawMatrix = MatrixRotation3DYaw(yaw);

		// Apply rotations in order: Roll → Pitch → Yaw
		// Note: Matrix multiplication is applied right to left
		const pitchRoll = MatrixMultiply(pitchMatrix, rollMatrix);
		const result = MatrixMultiply(yawMatrix, pitchRoll);
		AssertMatrix4(result);
		return result;
	}
	// Called with vector parameter
	AssertVector3(rollOrVector);
	return MatrixRotation3D(rollOrVector[0], rollOrVector[1], rollOrVector[2]);
}

/**
 * Creates a composite 3D rotation matrix from Euler angles specified in degrees.
 *
 * This is a convenience function that converts degree measurements to radians
 * before calling MatrixRotation3D. Useful when working with user input or
 * data sources that use degrees instead of radians.
 *
 * Uses the same intrinsic rotation sequence: Roll (X) → Pitch (Y) → Yaw (Z).
 *
 * @param roll - Roll angle in degrees (X-axis rotation) or vector [roll, pitch, yaw]
 * @param pitch - Pitch angle in degrees (Y-axis rotation, required if roll is number)
 * @param yaw - Yaw angle in degrees (Z-axis rotation, required if roll is number)
 * @returns {TMatrix4} A 4x4 composite rotation matrix
 *
 * @throws {Error} If any angle is not a finite number
 *
 * @example
 * ```typescript
 * // Using individual angles in degrees
 * const rotation = MatrixRotation3DEulerAngles(45, 30, 60);
 * // Using vector input in degrees
 * const angles: TVector3 = [45, 30, 60];
 * const rotation2 = MatrixRotation3DEulerAngles(angles);
 * ```
 */

export function MatrixRotation3DEulerAngles(roll: number, pitch: number, yaw: number): TMatrix4;

export function MatrixRotation3DEulerAngles(v: TVector3): TMatrix4;
export function MatrixRotation3DEulerAngles(rollOrVector: number | TVector3, pitch?: number, yaw?: number): TMatrix4 {
	if (typeof rollOrVector === 'number') {
		AssertNumber(rollOrVector, { finite: true }, { message: 'Roll angle must be a number' });
		AssertNumber(pitch, { finite: true }, { message: 'Pitch angle must be a number' });
		AssertNumber(yaw, { finite: true }, { message: 'Yaw angle must be a number' });

		// Convert degrees to radians
		const rollRad = (rollOrVector * Math.PI) / DEGREES_PER_HALF_REVOLUTION;
		const pitchRad = (pitch * Math.PI) / DEGREES_PER_HALF_REVOLUTION;
		const yawRad = (yaw * Math.PI) / DEGREES_PER_HALF_REVOLUTION;

		return MatrixRotation3D(rollRad, pitchRad, yawRad);
	}
	AssertVector3(rollOrVector);
	return MatrixRotation3D(
		(rollOrVector[0] * Math.PI) / DEGREES_PER_HALF_REVOLUTION,
		(rollOrVector[1] * Math.PI) / DEGREES_PER_HALF_REVOLUTION,
		(rollOrVector[2] * Math.PI) / DEGREES_PER_HALF_REVOLUTION
	);
}

// ============================================================================
// SCALE TRANSFORMATIONS
// ============================================================================

/**
 * Creates a 2D scale transformation matrix with flexible input options.
 *
 * Scale factors greater than 1 enlarge objects, factors between 0 and 1 shrink
 * objects, and negative values flip objects across the corresponding axis.
 * Uses homogeneous coordinates for composition with other 2D transformations.
 *
 * Matrix structure:
 * ```
 * [sx  0  0]
 * [ 0 sy  0]
 * [ 0  0  1]
 * ```
 *
 * Supports three call patterns:
 * 1. Uniform scaling: MatrixScale2D(scale)
 * 2. Independent scaling: MatrixScale2D(x, y)
 * 3. Vector scaling: MatrixScale2D([x, y])
 *
 * @param scale - Uniform scale factor for both axes, OR X-axis scale factor
 * @param y - Y-axis scale factor (only for independent scaling)
 * @returns {TMatrix3} A 3x3 scale transformation matrix
 *
 * @throws {Error} If any scale factor is not a finite number
 *
 * @example
 * ```typescript
 * // Uniform scaling (double size)
 * const uniform = MatrixScale2D(2.0);
 * // Independent scaling (stretch horizontally, compress vertically)
 * const stretch = MatrixScale2D(2.0, 0.5);
 * // Vector input
 * const scaleVector: TVector2 = [1.5, 0.8];
 * const vectorScale = MatrixScale2D(scaleVector);
 * // Flip horizontally
 * const flip = MatrixScale2D(-1, 1);
 * ```
 */

export function MatrixScale2D(scale: number): TMatrix3;

export function MatrixScale2D(x: number, y: number): TMatrix3;

export function MatrixScale2D(v: TVector2): TMatrix3;
export function MatrixScale2D(scaleOrX: number | TVector2, y?: number): TMatrix3 {
	if (typeof scaleOrX === 'number') {
		if (y === undefined) {
			// Uniform scaling - single scale factor for both axes
			AssertNumber(scaleOrX, { finite: true }, { message: 'Scale factor must be a finite number' });
			return [
				[scaleOrX, 0, 0],
				[0, scaleOrX, 0],
				[0, 0, 1]
			];
		}
		// Independent scaling - separate scale factors for X and Y axes
		AssertNumber(scaleOrX, { finite: true }, { message: 'X scale factor must be a finite number' });
		AssertNumber(y, { finite: true }, { message: 'Y scale factor must be a finite number' });
		return [
			[scaleOrX, 0, 0],
			[0, y, 0],
			[0, 0, 1]
		];
	}
	// Vector scaling - scale factors provided as a 2D vector
	AssertVector2(scaleOrX);
	return [
		[scaleOrX[0], 0, 0],
		[0, scaleOrX[1], 0],
		[0, 0, 1]
	];
}

/**
 * Creates a 3D scale transformation matrix with flexible input options.
 *
 * Scale factors greater than 1 enlarge objects, factors between 0 and 1 shrink
 * objects, and negative values flip objects across the corresponding axis.
 * Uses homogeneous coordinates for composition with other 3D transformations.
 *
 * Matrix structure:
 * ```
 * [sx  0  0  0]
 * [ 0 sy  0  0]
 * [ 0  0 sz  0]
 * [ 0  0  0  1]
 * ```
 *
 * Supports three call patterns:
 * 1. Uniform scaling: MatrixScale3D(scale)
 * 2. Independent scaling: MatrixScale3D(x, y, z)
 * 3. Vector scaling: MatrixScale3D([x, y, z])
 *
 * @param scale - Uniform scale factor for all axes, OR X-axis scale factor
 * @param y - Y-axis scale factor (only for independent scaling)
 * @param z - Z-axis scale factor (only for independent scaling)
 * @returns {TMatrix4} A 4x4 scale transformation matrix
 *
 * @throws {Error} If any scale factor is not a finite number
 *
 * @example
 * ```typescript
 * // Uniform scaling (triple size)
 * const uniform = MatrixScale3D(3.0);
 * // Independent scaling (stretch, compress, normal)
 * const stretch = MatrixScale3D(2.0, 0.5, 1.0);
 * // Vector input
 * const scaleVector: TVector3 = [1.5, 0.8, 2.0];
 * const vectorScale = MatrixScale3D(scaleVector);
 * // Mirror across XY plane
 * const mirror = MatrixScale3D(1, 1, -1);
 * ```
 */

export function MatrixScale3D(scale: number): TMatrix4;

export function MatrixScale3D(x: number, y: number, z: number): TMatrix4;

export function MatrixScale3D(v: TVector3): TMatrix4;
export function MatrixScale3D(scaleOrX: number | TVector3, y?: number, z?: number): TMatrix4 {
	if (typeof scaleOrX === 'number') {
		if (y === undefined && z === undefined) {
			// Uniform scaling - single scale factor for all axes
			AssertNumber(scaleOrX, { finite: true }, { message: 'Scale factor must be a finite number' });
			return [
				[scaleOrX, 0, 0, 0],
				[0, scaleOrX, 0, 0],
				[0, 0, scaleOrX, 0],
				[0, 0, 0, 1]
			];
		}
		// Independent scaling - separate scale factors for X, Y, and Z axes
		AssertNumber(scaleOrX, { finite: true }, { message: 'X scale factor must be a finite number' });
		AssertNumber(y, { finite: true }, { message: 'Y scale factor must be a finite number' });
		AssertNumber(z, { finite: true }, { message: 'Z scale factor must be a finite number' });
		return [
			[scaleOrX, 0, 0, 0],
			[0, y, 0, 0],
			[0, 0, z, 0],
			[0, 0, 0, 1]
		];
	}
	// Vector scaling - scale factors provided as a 3D vector
	AssertVector3(scaleOrX);
	return [
		[scaleOrX[0], 0, 0, 0],
		[0, scaleOrX[1], 0, 0],
		[0, 0, scaleOrX[2], 0],
		[0, 0, 0, 1]
	];
}

// ============================================================================
// TRANSLATION TRANSFORMATIONS
// ============================================================================

/**
 * Creates a 2D translation transformation matrix with flexible input options.
 *
 * Moves 2D points by the specified offset distances. Uses homogeneous
 * coordinates to enable composition with other 2D transformations.
 *
 * Matrix structure:
 * ```
 * [1  0  tx]
 * [0  1  ty]
 * [0  0   1]
 * ```
 *
 * Supports two call patterns:
 * 1. Individual translation: MatrixTranslation2D(x, y)
 * 2. Vector translation: MatrixTranslation2D([x, y])
 *
 * @param translationOrX - X-axis translation distance or translation vector [x, y]
 * @param y - Y-axis translation distance (only for individual translation)
 * @returns {TMatrix3} A 3x3 translation transformation matrix
 *
 * @throws {Error} If any translation distance is not a finite number
 *
 * @example
 * ```typescript
 * // Individual translation (10 units right, 5 units up)
 * const translation = MatrixTranslation2D(10, 5);
 * // Vector input
 * const offset: TVector2 = [10, 5];
 * const translation2 = MatrixTranslation2D(offset);
 * ```
 */

export function MatrixTranslation2D(x: number, y: number): TMatrix3;

export function MatrixTranslation2D(v: TVector2): TMatrix3;
export function MatrixTranslation2D(translationOrX: number | TVector2, y?: number): TMatrix3 {
	if (typeof translationOrX === 'number') {
		// Called with individual parameters
		AssertNumber(translationOrX, { finite: true }, { message: 'X translation distance must be a finite number' });
		AssertNumber(y, { finite: true }, { message: 'Y translation distance must be a finite number' });
		return [
			[1, 0, translationOrX], // [1, 0, tx]
			[0, 1, y], // [0, 1, ty]
			[0, 0, 1] // [0, 0,  1]
		];
	}
	// Called with vector parameter
	AssertVector2(translationOrX);
	return [
		[1, 0, translationOrX[0]], // [1, 0, tx]
		[0, 1, translationOrX[1]], // [0, 1, ty]
		[0, 0, 1] // [0, 0,  1]
	];
}

/**
 * Creates a 3D translation transformation matrix with flexible input options.
 *
 * Moves 3D points by the specified offset distances along each axis.
 * Uses homogeneous coordinates to enable composition with other 3D transformations.
 *
 * Matrix structure:
 * ```
 * [1  0  0  tx]
 * [0  1  0  ty]
 * [0  0  1  tz]
 * [0  0  0   1]
 * ```
 *
 * Supports three call patterns:
 * 1. Uniform translation: MatrixTranslation3D(distance)
 * 2. Independent translation: MatrixTranslation3D(x, y, z)
 * 3. Vector translation: MatrixTranslation3D([x, y, z])
 *
 * @param translationOrX - Uniform translation distance for all axes, OR X-axis distance
 * @param y - Y-axis translation distance (only for independent translation)
 * @param z - Z-axis translation distance (only for independent translation)
 * @returns {TMatrix4} A 4x4 translation transformation matrix
 *
 * @throws {Error} If any translation distance is not a finite number
 *
 * @example
 * ```typescript
 * // Uniform translation (move 5 units in all directions)
 * const uniform = MatrixTranslation3D(5.0);
 * // Independent translation
 * const independent = MatrixTranslation3D(10, -5, 3);
 * // Vector input
 * const offset: TVector3 = [10, -5, 3];
 * const vectorTranslation = MatrixTranslation3D(...offset);
 * ```
 */

export function MatrixTranslation3D(translation: number): TMatrix4;

export function MatrixTranslation3D(x: number, y: number, z: number): TMatrix4;

export function MatrixTranslation3D(v: TVector3): TMatrix4;
export function MatrixTranslation3D(translationOrX: number | TVector3, y?: number, z?: number): TMatrix4 {
	if (typeof translationOrX === 'number') {
		if (y === undefined && z === undefined) {
			// Uniform translation - same distance along all axes
			AssertNumber(translationOrX, { finite: true }, { message: 'Translation distance must be a finite number' });
			return [
				[1, 0, 0, translationOrX],
				[0, 1, 0, translationOrX],
				[0, 0, 1, translationOrX],
				[0, 0, 0, 1]
			];
		}
		// Independent translation - separate distances for X, Y, and Z axes
		AssertNumber(translationOrX, { finite: true }, { message: 'X translation distance must be a finite number' });
		AssertNumber(y, { finite: true }, { message: 'Y translation distance must be a finite number' });
		AssertNumber(z, { finite: true }, { message: 'Z translation distance must be a finite number' });
		return [
			[1, 0, 0, translationOrX], // [1, 0, 0, tx]
			[0, 1, 0, y], // [0, 1, 0, ty]
			[0, 0, 1, z], // [0, 0, 1, tz]
			[0, 0, 0, 1] // [0, 0, 0,  1]
		];
	}
	// Vector translation - translation distances provided as a 3D vector
	AssertVector3(translationOrX);
	return [
		[1, 0, 0, translationOrX[0]], // [1, 0, 0, tx]
		[0, 1, 0, translationOrX[1]], // [0, 1, 0, ty]
		[0, 0, 1, translationOrX[2]], // [0, 0, 1, tz]
		[0, 0, 0, 1] // [0, 0, 0,  1]
	];
}

// ============================================================================
// VECTOR TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transforms a 2D vector using a 3x3 transformation matrix with homogeneous coordinates.
 *
 * This function applies a transformation matrix to a 2D vector by:
 * 1. Converting the 2D vector to homogeneous coordinates (adding w=1)
 * 2. Performing matrix-vector multiplication
 * 3. Converting back to 2D by dividing by the homogeneous w component
 *
 * This approach enables composition of multiple transformations and supports
 * affine transformations including translation, rotation, scaling, and shearing.
 *
 * @param vector - The 2D vector to transform [x, y]
 * @param matrix - A 3x3 transformation matrix to apply
 * @returns {TVector2} The transformed 2D vector
 *
 * @throws {Error} If the homogeneous w component is near zero (degenerate transformation)
 * @throws {Error} If inputs are not valid vector/matrix types
 *
 * @example
 * ```typescript
 * // Rotate a point 90 degrees counterclockwise
 * const rotationMatrix = MatrixRotation2D(Math.PI / 2);
 * const point: TVector2 = [1, 0];
 * const rotatedPoint = MatrixTransform2D(point, rotationMatrix);
 * // Result: approximately [0, 1]
 * // Chain multiple transformations
 * const scale = MatrixScale2D(2, 2);
 * const translate = MatrixTranslation2D(5, 3);
 * const combined = MatrixMultiply(translate, scale);
 * const transformedPoint = MatrixTransform2D(point, combined);
 * ```
 */
export function MatrixTransform2D(vector: TVector2, matrix: TMatrix3): TVector2 {
	AssertVector2(vector);
	AssertMatrix3(matrix);

	// Convert to homogeneous coordinates (add w=1)
	const homogeneous: TVector3 = [vector[0], vector[1], 1];

	// Perform matrix-vector multiplication: result = matrix × homogeneous
	const result: TVector3 = [
		(matrix[0][0] * homogeneous[0]) + (matrix[0][1] * homogeneous[1]) + (matrix[0][2] * homogeneous[2]), // x'
		(matrix[1][0] * homogeneous[0]) + (matrix[1][1] * homogeneous[1]) + (matrix[1][2] * homogeneous[2]), // y'
		(matrix[2][0] * homogeneous[0]) + (matrix[2][1] * homogeneous[1]) + (matrix[2][2] * homogeneous[2]) // w'
	];
	// Ensure w component is not near zero (would indicate degenerate transformation)
	if (Math.abs(result[2]) < 1e-10) {
		throw new MatrixError('2D transformation w component near zero');
	}

	// Convert back from homogeneous coordinates by dividing by w
	return [result[0] / result[2], result[1] / result[2]];
}

/**
 * Transforms a 3D vector using a 4x4 transformation matrix with homogeneous coordinates.
 * Converts to homogeneous coordinates, applies transformation, then converts back to 3D.
 *
 * @param transform - A 4x4 transformation matrix.
 * @param vector - The 3D vector to transform.
 * @returns {TVector3} The transformed 3D vector.
 *
 * @throws {Error} If the w component is near zero (degenerate transformation).
 *
 * @example
 * ```typescript
 * const rotationMatrix = MatrixRotation3DYaw(Math.PI / 4);
 * const point: TVector3 = [1, 0, 0];
 * const rotatedPoint = MatrixTransform3D(point, rotationMatrix);
 * ```
 */
export function MatrixTransform3D(vector: TVector3, transform: TMatrix4): TVector3 {
	AssertMatrix4(transform);
	AssertVector3(vector);

	// Convert to homogeneous coordinates (add w=1)
	const homogeneous = [vector[0], vector[1], vector[2], 1];
	AssertVector4(homogeneous);

	// Perform matrix-vector multiplication
	const result: TVector4 = [
		(transform[0][0] * homogeneous[0]) + (transform[0][1] * homogeneous[1]) + (transform[0][2] * homogeneous[2]) + (transform[0][3] * homogeneous[3]),
		(transform[1][0] * homogeneous[0]) + (transform[1][1] * homogeneous[1]) + (transform[1][2] * homogeneous[2]) + (transform[1][3] * homogeneous[3]),
		(transform[2][0] * homogeneous[0]) + (transform[2][1] * homogeneous[1]) + (transform[2][2] * homogeneous[2]) + (transform[2][3] * homogeneous[3]),
		(transform[3][0] * homogeneous[0]) + (transform[3][1] * homogeneous[1]) + (transform[3][2] * homogeneous[2]) + (transform[3][3] * homogeneous[3])
	];
	// Ensure w component is not near zero (would indicate degenerate transformation)
	if (Math.abs(result[3]) < 1e-10) {
		throw new MatrixError('3D transformation w component near zero');
	}

	// Convert back from homogeneous coordinates by dividing by w
	return [result[0] / result[3], result[1] / result[3], result[2] / result[3]];
}

/**
 * Transforms a 3D direction vector using a 3x3 matrix, ignoring translation components.
 * Designed for direction vectors (normals, velocities) where translation should not apply.
 *
 * @param matrix - A 3x3 transformation matrix (rotation and/or scale only).
 * @param direction - The 3D direction vector to transform.
 * @returns {TVector3} The transformed direction vector.
 *
 * @example
 * ```typescript
 * const rotationMatrix = MatrixRotation3DYaw(Math.PI / 4);
 * const normal: TVector3 = [0, 0, 1];
 * const rotatedNormal = MatrixDirection3D(normal, rotationMatrix);
 * ```
 */
export function MatrixDirection3D(direction: TVector3, matrix: TMatrix3): TVector3 {
	AssertMatrix3(matrix);
	AssertVector3(direction);

	// Direct 3x3 matrix multiplication (no homogeneous coordinates needed)
	return [
		(matrix[0][0] * direction[0]) + (matrix[0][1] * direction[1]) + (matrix[0][2] * direction[2]),
		(matrix[1][0] * direction[0]) + (matrix[1][1] * direction[1]) + (matrix[1][2] * direction[2]),
		(matrix[2][0] * direction[0]) + (matrix[2][1] * direction[1]) + (matrix[2][2] * direction[2])
	];
}

/**
 * Creates a view matrix for positioning and orienting a 3D camera.
 * Transforms world coordinates to camera coordinates using the "look-at" approach.
 *
 * @param eye - Camera position in world coordinates.
 * @param target - Point the camera is looking at.
 * @param up - Up direction vector (usually [0, 1, 0]).
 * @returns {TMatrix4} A 4x4 view transformation matrix.
 *
 * @example
 * ```typescript
 * const viewMatrix = MatrixView(
 *   [10, 5, 10],  // Camera position
 *   [0, 0, 0],    // Looking at origin
 *   [0, 1, 0]     // Y-axis is up
 * );
 * ```
 */
export function MatrixView(eye: TVector3, target: TVector3, up: TVector3): TMatrix4 {
	AssertVector3(eye);
	AssertVector3(target);
	AssertVector3(up);

	// Calculate the forward vector (direction from eye to target)
	const forward = VectorSubtract(target, eye);
	const normalizedForward = VectorNormalize(forward);

	// Calculate orthogonal right and up vectors using cross products
	const normalizedUp = VectorNormalize(up);
	const right = Vector3Cross(normalizedForward, normalizedUp);
	const normalizedRight = VectorNormalize(right);

	// Recalculate up vector to ensure perfect orthogonality
	const orthogonalUp = Vector3Cross(normalizedRight, normalizedForward);

	// Create rotation part of view matrix (camera orientation)
	// Note: forward is negated because we want to look down negative Z in view space
	const rotation = [
		[normalizedRight[0], normalizedRight[1], normalizedRight[2], 0],
		[orthogonalUp[0], orthogonalUp[1], orthogonalUp[2], 0],
		[-normalizedForward[0], -normalizedForward[1], -normalizedForward[2], 0],
		[0, 0, 0, 1]
	];

	// Create translation part (move camera to origin)
	const translation = MatrixTranslation3D(-eye[0], -eye[1], -eye[2]);

	// Combine transformations: View = Rotation * Translation
	const result = MatrixMultiply(rotation, translation);
	AssertMatrix4(result);
	return result;
}

/**
 * Creates a view matrix for positioning and orienting a 3D camera (alias of MatrixView).
 *
 * This is the industry-standard "look-at" function name for constructing a camera view matrix
 * that transforms world coordinates to camera coordinates. It is functionally identical to
 * MatrixView and provided for API consistency with graphics libraries.
 *
 * @param eye - Camera position in world coordinates.
 * @param target - Point the camera is looking at.
 * @param up - Up direction vector (usually [0, 1, 0]).
 * @returns {TMatrix4} A 4x4 view transformation matrix.
 *
 * @throws {Error} If inputs are not valid 3D vectors.
 *
 * @see MatrixView
 *
 * @example
 * ```typescript
 * const viewMatrix = MatrixLookAt(
 *   [10, 5, 10],  // Camera position
 *   [0, 0, 0],    // Looking at origin
 *   [0, 1, 0]     // Y-axis is up
 * );
 * ```
 */
export function MatrixLookAt(eye: TVector3, target: TVector3, up: TVector3): TMatrix4 {
	return MatrixView(eye, target, up);
}

/**
 * Creates a composite transformation matrix by composing translation, rotation, and scale.
 *
 * Applies transformations in the standard TRS (Translation-Rotation-Scale) order:
 * result = Translation × Rotation × Scale. When applied to a column vector v,
 * this yields: T(R(S(v))), meaning scale is applied first, then rotation, then translation.
 *
 * @param translation - Translation vector [x, y, z] in world units.
 * @param rotation - Rotation as Euler angles [roll, pitch, yaw] in radians (intrinsic X→Y→Z order).
 * @param scale - Scale factors [x, y, z] (1.0 = normal size).
 * @returns {TMatrix4} A 4x4 composite transformation matrix.
 *
 * @throws {Error} If any component is not a valid 3D vector or contains non-finite numbers.
 *
 * @example
 * ```typescript
 * // Create a TRS matrix: move 5 units right, rotate 45° around Z, scale 2x
 * const transform = MatrixTRS(
 *   [5, 0, 0],           // translation
 *   [0, 0, Math.PI / 4], // rotation (45° yaw)
 *   [2, 2, 2]            // scale
 * );
 * ```
 */
export function MatrixTRS(translation: TVector3, rotation: TVector3, scale: TVector3): TMatrix4 {
	AssertVector3(translation);
	AssertVector3(rotation);
	AssertVector3(scale);

	const translationMatrix = MatrixTranslation3D(translation);
	const rotationMatrix = MatrixRotation3D(rotation);
	const scaleMatrix = MatrixScale3D(scale);

	// Compose in TRS order: Translation × Rotation × Scale
	const rotationScale = MatrixMultiply(rotationMatrix, scaleMatrix);
	const result = MatrixMultiply(translationMatrix, rotationScale);
	AssertMatrix4(result);
	return result;
}

/**
 * Decomposes a 4×4 composite transformation matrix into translation, rotation, and scale components.
 *
 * This function inverts the TRS (Translation-Rotation-Scale) composition: it extracts
 * the translation vector, scale factors, and rotation angles from a composite matrix.
 *
 * **Assumptions:**
 * - The input matrix is a valid TRS matrix created or compatible with MatrixTRS
 * - No shear transformations are present (the matrix is orthogonal after removing scale)
 * - Scale factors are positive (negative scales encode reflection + rotation; use absolute values)
 *
 * **Extraction order:**
 * 1. **Translation:** Extracted from the last column (indices [0][3], [1][3], [2][3])
 * 2. **Scale:** Computed as the magnitude of each basis vector (row norms of the 3×3 upper-left block)
 * 3. **Rotation:** Extracted as Euler angles [roll, pitch, yaw] from the normalized rotation submatrix
 *
 * **Euler angle convention:** Roll (X) → Pitch (Y) → Yaw (Z) (intrinsic XYZ order), matching MatrixRotation3D.
 * After normalization by scale, the angles can be recovered using atan2/asin.
 *
 * **Round-trip guarantee:** For most well-conditioned TRS matrices:
 * `MatrixTRS(...MatrixDecomposeTRS(M)) ≈ M` within ~1e-9 tolerance (due to numerical precision).
 *
 * @param matrix - A 4×4 composite transformation matrix (ideally created by MatrixTRS)
 * @returns Object containing readonly translation, rotation (Euler angles in radians), and scale
 * @throws {MatrixError} If the matrix is not 4×4 or contains invalid values
 *
 * @example
 * ```typescript
 * // Create a TRS matrix
 * const translation: TVector3 = [5, 10, -3];
 * const rotation: TVector3 = [0.5, 0.2, 0.3]; // Radians: roll, pitch, yaw
 * const scale: TVector3 = [2, 2, 2];
 * const M = MatrixTRS(translation, rotation, scale);
 *
 * // Decompose it back
 * const { translation: t, rotation: r, scale: s } = MatrixDecomposeTRS(M);
 *
 * // Verify round-trip: reconstruct ≈ original
 * const reconstructed = MatrixTRS(t, r, s);
 * // reconstructed ≈ M (element-wise, within ~1e-9)
 *
 * // Extract just the translation
 * const trans = MatrixDecomposeTRS(M).translation;
 * // trans ≈ [5, 10, -3]
 * ```
 */
export function MatrixDecomposeTRS(matrix: TMatrix4): { readonly translation: TVector3; readonly rotation: TVector3; readonly scale: TVector3 } {
	AssertMatrix4(matrix);

	// ==================== Extract Translation ====================
	// Translation is stored in the last column (homogeneous coordinates)
	const translation: TVector3 = [
		matrix[0][3],
		matrix[1][3],
		matrix[2][3]
	];

	// ==================== Extract Scale ====================
	// Scale is the magnitude of each row of the 3×3 upper-left block
	const scaleX = Math.sqrt((matrix[0][0] * matrix[0][0]) + (matrix[0][1] * matrix[0][1]) + (matrix[0][2] * matrix[0][2]));
	const scaleY = Math.sqrt((matrix[1][0] * matrix[1][0]) + (matrix[1][1] * matrix[1][1]) + (matrix[1][2] * matrix[1][2]));
	const scaleZ = Math.sqrt((matrix[2][0] * matrix[2][0]) + (matrix[2][1] * matrix[2][1]) + (matrix[2][2] * matrix[2][2]));

	const scale: TVector3 = [
		scaleX > 0 ? scaleX : 1,
		scaleY > 0 ? scaleY : 1,
		scaleZ > 0 ? scaleZ : 1
	];

	// ==================== Extract Rotation ====================
	// Normalize the 3×3 rotation submatrix by dividing out the scale
	const invScaleX = scaleX > 0 ? 1 / scaleX : 1;
	const invScaleY = scaleY > 0 ? 1 / scaleY : 1;
	const invScaleZ = scaleZ > 0 ? 1 / scaleZ : 1;

	// Normalized rotation matrix (should be orthogonal)
	const r00 = matrix[0][0] * invScaleX;
	const r01 = matrix[0][1] * invScaleY;
	const r10 = matrix[1][0] * invScaleX;
	const r11 = matrix[1][1] * invScaleY;
	const r20 = matrix[2][0] * invScaleX;
	const r21 = matrix[2][1] * invScaleY;
	const r22 = matrix[2][2] * invScaleZ;

	// Extract Euler angles from the rotation matrix
	// For XYZ intrinsic rotation (Roll → Pitch → Yaw):
	// The combined rotation matrix R = Rz(yaw) × Ry(pitch) × Rx(roll)
	// After multiplication and normalization:
	// R[2][0] = -sin(pitch)
	// R[2][1] = sin(roll) × cos(pitch)
	// R[2][2] = cos(roll) × cos(pitch)
	// R[0][0] = cos(yaw) × cos(pitch)
	// R[1][0] = sin(yaw) × cos(pitch)
	// R[1][1] = cos(yaw) × cos(roll) + sin(yaw) × sin(roll) × sin(pitch)
	// R[0][1] = -sin(yaw)
	// ... (other elements)

	// Pitch: asin(-R[2][0]) with clamp to avoid numerical issues beyond [-1, 1]
	const sinPitch = -r20;
	const pitch = Math.asin(Math.max(-1, Math.min(1, sinPitch)));

	const cosPitch = Math.cos(pitch);

	let roll = 0;
	let yaw = 0;

	// Avoid division by zero when cos(pitch) is near zero (gimbal lock)
	if (Math.abs(cosPitch) > 1e-6) {
		// Normal case: recover roll and yaw
		// roll = atan2(R[2][1] / cos(pitch), R[2][2] / cos(pitch))
		roll = Math.atan2(r21 / cosPitch, r22 / cosPitch);
		// yaw = atan2(R[1][0] / cos(pitch), R[0][0] / cos(pitch))
		yaw = Math.atan2(r10 / cosPitch, r00 / cosPitch);
	}
	else {
		// Gimbal lock: when pitch ≈ ±π/2, roll and yaw are not independently recoverable
		// Arbitrarily set roll = 0 and solve for yaw
		roll = 0;
		// yaw = atan2(-R[0][1], R[1][1])
		yaw = Math.atan2(-r01, r11);
	}

	const rotation: TVector3 = [roll, pitch, yaw];

	return { translation, rotation, scale };
}

/**
 * Creates a perspective projection matrix for 3D rendering.
 * Transforms 3D view coordinates to normalized device coordinates with perspective effect.
 *
 * @param fovY - Vertical field of view angle in radians.
 * @param aspect - Aspect ratio of the viewport (width/height).
 * @param near - Distance to near clipping plane (must be positive).
 * @param far - Distance to far clipping plane (must be > near).
 * @returns {TMatrix4} A 4x4 perspective projection matrix.
 *
 * @throws {Error} If parameters are invalid.
 *
 * @example
 * ```typescript
 * const perspectiveMatrix = MatrixPerspective(
 *   Math.PI / 4,  // 45-degree field of view
 *   16 / 9,       // Widescreen aspect ratio
 *   0.1,          // Near plane
 *   1000          // Far plane
 * );
 * ```
 */
export function MatrixPerspective(fovY: number, aspect: number, near: number, far: number): TMatrix4 {
	AssertNumber(near, { gt: 0 }, { message: 'Near clipping plane must be greater than 0' });
	AssertNumber(far, { gt: 0 }, { message: 'Far clipping plane must be greater than 0' });
	AssertNumber(near, { lt: far }, { message: 'Near clipping plane must be less than far clipping plane' });
	AssertNumber(aspect, { gt: 0 }, { message: 'Aspect ratio must be greater than 0' });

	const tanHalfFovY = Math.tan(fovY / 2);

	const result = MatrixCreate(4, 4);
	AssertMatrix4(result);

	// Initialize perspective projection matrix
	// The matrix maps view space to clip space with perspective division
	result[0][0] = 1 / (aspect * tanHalfFovY); // X scaling based on aspect ratio and FOV
	result[1][1] = 1 / tanHalfFovY; // Y scaling based on FOV
	result[2][2] = -(far + near) / (far - near); // Z mapping for depth buffer
	result[2][3] = -(2 * far * near) / (far - near); // Z translation for depth buffer
	result[3][2] = -1; // Perspective division trigger
	result[3][3] = 0; // Clear diagonal element

	return result;
}

/**
 * Creates an orthographic projection matrix for 3D rendering.
 * Maps a rectangular box to the unit cube [-1, 1]³ without perspective distortion.
 *
 * @param left - Left boundary of the orthographic volume.
 * @param right - Right boundary of the orthographic volume.
 * @param bottom - Bottom boundary of the orthographic volume.
 * @param top - Top boundary of the orthographic volume.
 * @param near - Near clipping plane distance.
 * @param far - Far clipping plane distance.
 * @returns {TMatrix4} A 4x4 orthographic projection matrix.
 *
 * @throws {Error} If any opposing boundaries are equal.
 *
 * @example
 * ```typescript
 * const orthoMatrix = MatrixOrthographic(
 *   -10, 10,   // Left/Right: 20 units wide
 *   -7.5, 7.5, // Bottom/Top: 15 units tall
 *   -100, 100  // Near/Far: 200 units deep
 * );
 * ```
 */
export function MatrixOrthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): TMatrix4 {
	AssertNotEquals(left, right, { message: 'Left and right bounds must not be equal' });
	AssertNotEquals(bottom, top, { message: 'Bottom and top bounds must not be equal' });
	AssertNotEquals(near, far, { message: 'Near and far clipping planes must not be equal' });

	const result = MatrixCreate(4, 4);
	AssertMatrix4(result);

	// Initialize orthographic projection matrix
	// The matrix performs scaling and translation to map the orthographic volume to [-1, 1]³
	// Scale factors to normalize each axis to [-1, 1] range
	result[0][0] = 2 / (right - left); // X scaling
	result[1][1] = 2 / (top - bottom); // Y scaling
	result[2][2] = -2 / (far - near); // Z scaling (negated for right-handed system)

	// Translation to center the projection volume at origin
	result[0][3] = -(right + left) / (right - left); // X translation
	result[1][3] = -(top + bottom) / (top - bottom); // Y translation
	result[2][3] = -(far + near) / (far - near); // Z translation

	// Homogeneous coordinate (no perspective division needed)
	result[3][3] = 1;

	return result;
}
