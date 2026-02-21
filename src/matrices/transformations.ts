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
 *
 * @author JTV Development Team
 * @since 1.0.0
 */

import { AssertNumber, AssertNotEquals } from '@pawells/typescript-common';
import { MatrixCreate } from './core.js';
import { MatrixMultiply } from './arithmetic.js';
import { AssertMatrix3, AssertMatrix4 } from './asserts.js';
import { IMatrix3, IMatrix4 } from './types.js';
import { TVector2, TVector3, TVector4 } from '../vectors/types.js';
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
 * @returns {IMatrix3} A 3x3 rotation matrix for 2D transformations
 *
 * @throws {Error} If radians is not a finite number
 *
 * @example
 * ```typescript
 * // 90-degree counterclockwise rotation
 * const matrix = MatrixRotation2D(Math.PI / 2);
 *
 * // 45-degree clockwise rotation
 * const clockwise = MatrixRotation2D(-Math.PI / 4);
 * ```
 */
export function MatrixRotation2D(radians: number): IMatrix3 {
	AssertNumber(radians, { finite: true }, { message: 'Rotation angle must be a number' });

	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return [
		[cos, -sin, 0],  // [cos(θ), -sin(θ), 0]
		[sin, cos, 0],   // [sin(θ),  cos(θ), 0]
		[0, 0, 1],        // [   0,      0,     1]
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
 * @returns {IMatrix4} A 4x4 roll rotation matrix
 *
 * @throws {Error} If radians is not a finite number
 *
 * @example
 * ```typescript
 * // 45-degree roll (banking left in aviation)
 * const rollMatrix = MatrixRotation3DRoll(Math.PI / 4);
 * ```
 */
export function MatrixRotation3DRoll(radians: number): IMatrix4 {
	AssertNumber(radians, { finite: true }, { message: 'Rotation angle must be a number' });

	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return [
		[1, 0, 0, 0],        // [1,    0,       0,    0]
		[0, cos, -sin, 0],   // [0, cos(θ), -sin(θ), 0]
		[0, sin, cos, 0],    // [0, sin(θ),  cos(θ), 0]
		[0, 0, 0, 1],         // [0,    0,       0,    1]
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
 * @returns {IMatrix4} A 4x4 pitch rotation matrix
 *
 * @throws {Error} If radians is not a finite number
 *
 * @example
 * ```typescript
 * // 30-degree pitch up
 * const pitchMatrix = MatrixRotation3DPitch(Math.PI / 6);
 * ```
 */
export function MatrixRotation3DPitch(radians: number): IMatrix4 {
	AssertNumber(radians, { finite: true }, { message: 'Rotation angle must be a number' });

	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return [
		[cos, 0, sin, 0],    // [ cos(θ), 0,  sin(θ), 0]
		[0, 1, 0, 0],        // [   0,    1,    0,    0]
		[-sin, 0, cos, 0],   // [-sin(θ), 0,  cos(θ), 0]
		[0, 0, 0, 1],         // [   0,    0,    0,    1]
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
 * @returns {IMatrix4} A 4x4 yaw rotation matrix
 *
 * @throws {Error} If radians is not a finite number
 *
 * @example
 * ```typescript
 * // 60-degree yaw left
 * const yawMatrix = MatrixRotation3DYaw(Math.PI / 3);
 * ```
 */
export function MatrixRotation3DYaw(radians: number): IMatrix4 {
	AssertNumber(radians, { finite: true }, { message: 'Rotation angle must be a number' });

	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	return [
		[cos, -sin, 0, 0],   // [cos(θ), -sin(θ), 0, 0]
		[sin, cos, 0, 0],    // [sin(θ),  cos(θ), 0, 0]
		[0, 0, 1, 0],        // [  0,       0,     1, 0]
		[0, 0, 0, 1],         // [  0,       0,     0, 1]
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
 * @returns {IMatrix4} A 4x4 composite rotation matrix
 *
 * @throws {Error} If any angle is not a finite number
 *
 * @example
 * ```typescript
 * // Using individual angles (banking, elevation, heading)
 * const rotationMatrix = MatrixRotation3D(0.1, 0.2, 0.3);
 *
 * // Using vector input
 * const eulerAngles: TVector3 = [0.1, 0.2, 0.3];
 * const rotationMatrix2 = MatrixRotation3D(eulerAngles);
 * ```
 */

export function MatrixRotation3D(roll: number, pitch: number, yaw: number): IMatrix4;

export function MatrixRotation3D(v: TVector3): IMatrix4;
export function MatrixRotation3D(rollOrVector: number | TVector3, pitch?: number, yaw?: number): IMatrix4 {
	if (typeof rollOrVector === 'number') {
		// Called with individual parameters
		AssertNumber(rollOrVector, { finite: true }, { message: 'Roll angle must be a number' });
		AssertNumber(pitch as number, { finite: true }, { message: 'Pitch angle must be a number' });
		AssertNumber(yaw as number, { finite: true }, { message: 'Yaw angle must be a number' });

		const rollMatrix = MatrixRotation3DRoll(rollOrVector);
		const pitchMatrix = MatrixRotation3DPitch(pitch as number);
		const yawMatrix = MatrixRotation3DYaw(yaw as number);

		// Apply rotations in order: Roll → Pitch → Yaw
		// Note: Matrix multiplication is applied right to left
		const pitchRoll = MatrixMultiply(pitchMatrix, rollMatrix);
		const result = MatrixMultiply(yawMatrix, pitchRoll);
		AssertMatrix4(result);
		return result as IMatrix4;
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
 * @returns {IMatrix4} A 4x4 composite rotation matrix
 *
 * @throws {Error} If any angle is not a finite number
 *
 * @example
 * ```typescript
 * // Using individual angles in degrees
 * const rotation = MatrixRotation3DEulerAngles(45, 30, 60);
 *
 * // Using vector input in degrees
 * const angles: TVector3 = [45, 30, 60];
 * const rotation2 = MatrixRotation3DEulerAngles(angles);
 * ```
 */

export function MatrixRotation3DEulerAngles(roll: number, pitch: number, yaw: number): IMatrix4;

export function MatrixRotation3DEulerAngles(v: TVector3): IMatrix4;
export function MatrixRotation3DEulerAngles(rollOrVector: number | TVector3, pitch?: number, yaw?: number): IMatrix4 {
	if (typeof rollOrVector === 'number') {
		AssertNumber(rollOrVector, { finite: true }, { message: 'Roll angle must be a number' });
		AssertNumber(pitch as number, { finite: true }, { message: 'Pitch angle must be a number' });
		AssertNumber(yaw as number, { finite: true }, { message: 'Yaw angle must be a number' });

		// Convert degrees to radians
		const rollRad = (rollOrVector * Math.PI) / DEGREES_PER_HALF_REVOLUTION;
		const pitchRad = ((pitch as number) * Math.PI) / DEGREES_PER_HALF_REVOLUTION;
		const yawRad = ((yaw as number) * Math.PI) / DEGREES_PER_HALF_REVOLUTION;

		return MatrixRotation3D(rollRad, pitchRad, yawRad);
	}
	AssertVector3(rollOrVector);
	return MatrixRotation3D(
		(rollOrVector[0] * Math.PI) / DEGREES_PER_HALF_REVOLUTION,
		(rollOrVector[1] * Math.PI) / DEGREES_PER_HALF_REVOLUTION,
		(rollOrVector[2] * Math.PI) / DEGREES_PER_HALF_REVOLUTION,
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
 * @returns {IMatrix3} A 3x3 scale transformation matrix
 *
 * @throws {Error} If any scale factor is not a finite number
 *
 * @example
 * ```typescript
 * // Uniform scaling (double size)
 * const uniform = MatrixScale2D(2.0);
 *
 * // Independent scaling (stretch horizontally, compress vertically)
 * const stretch = MatrixScale2D(2.0, 0.5);
 *
 * // Vector input
 * const scaleVector: TVector2 = [1.5, 0.8];
 * const vectorScale = MatrixScale2D(scaleVector);
 *
 * // Flip horizontally
 * const flip = MatrixScale2D(-1, 1);
 * ```
 */

export function MatrixScale2D(scale: number): IMatrix3;

export function MatrixScale2D(x: number, y: number): IMatrix3;

export function MatrixScale2D(v: TVector2): IMatrix3;
export function MatrixScale2D(scaleOrX: number | TVector2, y?: number): IMatrix3 {
	if (typeof scaleOrX === 'number') {
		if (y === undefined) {
			// Uniform scaling - single scale factor for both axes
			AssertNumber(scaleOrX, { finite: true }, { message: 'Scale factor must be a finite number' });
			return [
				[scaleOrX, 0, 0],
				[0, scaleOrX, 0],
				[0, 0, 1],
			];
		}
		// Independent scaling - separate scale factors for X and Y axes
		AssertNumber(scaleOrX, { finite: true }, { message: 'X scale factor must be a finite number' });
		AssertNumber(y, { finite: true }, { message: 'Y scale factor must be a finite number' });
		return [
			[scaleOrX, 0, 0],
			[0, y, 0],
			[0, 0, 1],
		];
	}
	// Vector scaling - scale factors provided as a 2D vector
	AssertVector2(scaleOrX);
	return [
		[scaleOrX[0], 0, 0],
		[0, scaleOrX[1], 0],
		[0, 0, 1],
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
 * @returns {IMatrix4} A 4x4 scale transformation matrix
 *
 * @throws {Error} If any scale factor is not a finite number
 *
 * @example
 * ```typescript
 * // Uniform scaling (triple size)
 * const uniform = MatrixScale3D(3.0);
 *
 * // Independent scaling (stretch, compress, normal)
 * const stretch = MatrixScale3D(2.0, 0.5, 1.0);
 *
 * // Vector input
 * const scaleVector: TVector3 = [1.5, 0.8, 2.0];
 * const vectorScale = MatrixScale3D(scaleVector);
 *
 * // Mirror across XY plane
 * const mirror = MatrixScale3D(1, 1, -1);
 * ```
 */

export function MatrixScale3D(scale: number): IMatrix4;

export function MatrixScale3D(x: number, y: number, z:number): IMatrix4;

export function MatrixScale3D(v: TVector3): IMatrix4;
export function MatrixScale3D(scaleOrX: number | TVector3, y?: number, z?: number): IMatrix4 {
	if (typeof scaleOrX === 'number') {
		if (y === undefined && z === undefined) {
			// Uniform scaling - single scale factor for all axes
			AssertNumber(scaleOrX, { finite: true }, { message: 'Scale factor must be a finite number' });
			return [
				[scaleOrX, 0, 0, 0],
				[0, scaleOrX, 0, 0],
				[0, 0, scaleOrX, 0],
				[0, 0, 0, 1],
			];
		}
		// Independent scaling - separate scale factors for X, Y, and Z axes
		AssertNumber(scaleOrX, { finite: true }, { message: 'X scale factor must be a finite number' });
		AssertNumber(y as number, { finite: true }, { message: 'Y scale factor must be a finite number' });
		AssertNumber(z as number, { finite: true }, { message: 'Z scale factor must be a finite number' });
		return [
			[scaleOrX, 0, 0, 0],
			[0, y as number, 0, 0],
			[0, 0, z as number, 0],
			[0, 0, 0, 1],
		];
	}
	// Vector scaling - scale factors provided as a 3D vector
	AssertVector3(scaleOrX);
	return [
		[scaleOrX[0], 0, 0, 0],
		[0, scaleOrX[1], 0, 0],
		[0, 0, scaleOrX[2], 0],
		[0, 0, 0, 1],
	];
}

// ============================================================================
// TRANSLATION TRANSFORMATIONS
// ============================================================================

/**
 * Creates a 2D translation transformation matrix.
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
 * @param v - Translation vector [x, y] containing offset distances
 * @returns {IMatrix3} A 3x3 translation transformation matrix
 *
 * @throws {Error} If the input is not a valid 2D vector
 *
 * @example
 * ```typescript
 * // Move 10 units right, 5 units up
 * const translation = MatrixTranslation2D(10, 5);
 *
 * // Using vector input
 * const offset: TVector2 = [10, 5];
 * const translation2 = MatrixTranslation2D(...offset);
 * ```
 */
export function MatrixTranslation2D(...v: TVector2): IMatrix3 {
	// Called with vector parameter using spread syntax
	AssertVector2(v);
	return [
		[1, 0, v[0]],  // [1, 0, tx]
		[0, 1, v[1]],  // [0, 1, ty]
		[0, 0, 1],      // [0, 0,  1]
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
 * @returns {IMatrix4} A 4x4 translation transformation matrix
 *
 * @throws {Error} If any translation distance is not a finite number
 *
 * @example
 * ```typescript
 * // Uniform translation (move 5 units in all directions)
 * const uniform = MatrixTranslation3D(5.0);
 *
 * // Independent translation
 * const independent = MatrixTranslation3D(10, -5, 3);
 *
 * // Vector input
 * const offset: TVector3 = [10, -5, 3];
 * const vectorTranslation = MatrixTranslation3D(...offset);
 * ```
 */

export function MatrixTranslation3D(translation: number): IMatrix4;

export function MatrixTranslation3D(x: number, y: number, z:number): IMatrix4;

export function MatrixTranslation3D(v: TVector3): IMatrix4;
export function MatrixTranslation3D(translationOrX: number | TVector3, y?: number, z?: number): IMatrix4 {
	if (typeof translationOrX === 'number') {
		if (y === undefined && z === undefined) {
			// Uniform translation - same distance along all axes
			AssertNumber(translationOrX, { finite: true }, { message: 'Translation distance must be a finite number' });
			return [
				[1, 0, 0, translationOrX],
				[0, 1, 0, translationOrX],
				[0, 0, 1, translationOrX],
				[0, 0, 0, 1],
			];
		}
		// Independent translation - separate distances for X, Y, and Z axes
		AssertNumber(translationOrX, { finite: true }, { message: 'X translation distance must be a finite number' });
		AssertNumber(y as number, { finite: true }, { message: 'Y translation distance must be a finite number' });
		AssertNumber(z as number, { finite: true }, { message: 'Z translation distance must be a finite number' });
		return [
			[1, 0, 0, translationOrX],  // [1, 0, 0, tx]
			[0, 1, 0, y as number],     // [0, 1, 0, ty]
			[0, 0, 1, z as number],     // [0, 0, 1, tz]
			[0, 0, 0, 1],                // [0, 0, 0,  1]
		];
	}
	// Vector translation - translation distances provided as a 3D vector
	AssertVector3(translationOrX);
	return [
		[1, 0, 0, translationOrX[0]],  // [1, 0, 0, tx]
		[0, 1, 0, translationOrX[1]],  // [0, 1, 0, ty]
		[0, 0, 1, translationOrX[2]],  // [0, 0, 1, tz]
		[0, 0, 0, 1],                   // [0, 0, 0,  1]
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
 *
 * // Chain multiple transformations
 * const scale = MatrixScale2D(2, 2);
 * const translate = MatrixTranslation2D(5, 3);
 * const combined = MatrixMultiply(translate, scale);
 * const transformedPoint = MatrixTransform2D(point, combined);
 * ```
 */
export function MatrixTransform2D(vector: TVector2, matrix: IMatrix3): TVector2 {
	AssertVector2(vector);
	AssertMatrix3(matrix);

	// Convert to homogeneous coordinates (add w=1)
	const homogeneous: TVector3 = [vector[0], vector[1], 1];

	// Perform matrix-vector multiplication: result = matrix × homogeneous
	const result: TVector3 = [
		(matrix[0][0] * homogeneous[0]) + (matrix[0][1] * homogeneous[1]) + (matrix[0][2] * homogeneous[2]),  // x'
		(matrix[1][0] * homogeneous[0]) + (matrix[1][1] * homogeneous[1]) + (matrix[1][2] * homogeneous[2]),  // y'
		(matrix[2][0] * homogeneous[0]) + (matrix[2][1] * homogeneous[1]) + (matrix[2][2] * homogeneous[2]),   // w'
	];
	// Ensure w component is not near zero (would indicate degenerate transformation)
	AssertNumber(Math.abs(result[2]), { gte: 1e-10 }, { message: '2D transformation w component near zero' });

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
 * const rotationMatrix = Matrix_Transformation_Rotation3D_Yaw(Math.PI / 4);
 * const point = [1, 0, 0];
 * const rotatedPoint = Matrix_Transformation3D(rotationMatrix, point);
 * ```
 */
export function MatrixTransform3D(vector: TVector3, transform: IMatrix4): TVector3 {
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
		(transform[3][0] * homogeneous[0]) + (transform[3][1] * homogeneous[1]) + (transform[3][2] * homogeneous[2]) + (transform[3][3] * homogeneous[3]),
	];
	// Ensure w component is not near zero (would indicate degenerate transformation)
	AssertNumber(Math.abs(result[3]), { gte: 1e-10 }, { message: '3D transformation w component near zero' });

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
 * const rotationMatrix = Matrix_Transformation_Rotation3D_Yaw(Math.PI / 4);
 * const normal = [0, 0, 1];
 * const rotatedNormal = Matrix_Transformation_Direction3D(rotationMatrix, normal);
 * ```
 */
export function MatrixDirection3D(direction: TVector3, matrix: IMatrix3): TVector3 {
	AssertMatrix3(matrix);
	AssertVector3(direction);

	// Direct 3x3 matrix multiplication (no homogeneous coordinates needed)
	return [
		(matrix[0][0] * direction[0]) + (matrix[0][1] * direction[1]) + (matrix[0][2] * direction[2]),
		(matrix[1][0] * direction[0]) + (matrix[1][1] * direction[1]) + (matrix[1][2] * direction[2]),
		(matrix[2][0] * direction[0]) + (matrix[2][1] * direction[1]) + (matrix[2][2] * direction[2]),
	];
}

/**
 * Creates a view matrix for positioning and orienting a 3D camera.
 * Transforms world coordinates to camera coordinates using the "look-at" approach.
 *
 * @param eye - Camera position in world coordinates.
 * @param target - Point the camera is looking at.
 * @param up - Up direction vector (usually [0, 1, 0]).
 * @returns {IMatrix4} A 4x4 view transformation matrix.
 *
 * @example
 * ```typescript
 * const viewMatrix = Matrix_Transformation_View(
 *   [10, 5, 10],  // Camera position
 *   [0, 0, 0],    // Looking at origin
 *   [0, 1, 0]     // Y-axis is up
 * );
 * ```
 */
export function MatrixView(eye: TVector3, target: TVector3, up: TVector3): IMatrix4 {
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
		[0, 0, 0, 1],
	];

	// Create translation part (move camera to origin)
	const translation = MatrixTranslation3D(-eye[0], -eye[1], -eye[2]);

	// Combine transformations: View = Rotation * Translation
	const result = MatrixMultiply(rotation, translation);
	AssertMatrix4(result);
	return result as IMatrix4;
}

/**
 * Creates a perspective projection matrix for 3D rendering.
 * Transforms 3D view coordinates to normalized device coordinates with perspective effect.
 *
 * @param fovY - Vertical field of view angle in radians.
 * @param aspect - Aspect ratio of the viewport (width/height).
 * @param near - Distance to near clipping plane (must be positive).
 * @param far - Distance to far clipping plane (must be > near).
 * @returns {IMatrix4} A 4x4 perspective projection matrix.
 *
 * @throws {Error} If parameters are invalid.
 *
 * @example
 * ```typescript
 * const perspectiveMatrix = Matrix_Transformation_Perspective(
 *   Math.PI / 4,  // 45-degree field of view
 *   16 / 9,       // Widescreen aspect ratio
 *   0.1,          // Near plane
 *   1000          // Far plane
 * );
 * ```
 */
export function MatrixPerspective(fovY: number, aspect: number, near: number, far: number): IMatrix4 {
	AssertNumber(near, { gt: 0 }, { message: 'Near clipping plane must be greater than 0' });
	AssertNumber(far, { gt: 0 }, { message: 'Far clipping plane must be greater than 0' });
	AssertNumber(near, { lt: far }, { message: 'Near clipping plane must be less than far clipping plane' });
	AssertNumber(aspect, { gt: 0 }, { message: 'Aspect ratio must be greater than 0' });

	const tanHalfFovY = Math.tan(fovY / 2);

	const result = MatrixCreate(4, 4);
	AssertMatrix4(result);

	// Initialize perspective projection matrix
	// The matrix maps view space to clip space with perspective division
	if (result[0] && result[1] && result[2] && result[3]) {
		result[0][0] = 1 / (aspect * tanHalfFovY);  // X scaling based on aspect ratio and FOV
		result[1][1] = 1 / tanHalfFovY;             // Y scaling based on FOV
		result[2][2] = -(far + near) / (far - near); // Z mapping for depth buffer
		result[2][3] = -(2 * far * near) / (far - near); // Z translation for depth buffer
		result[3][2] = -1;                          // Perspective division trigger
		result[3][3] = 0;                           // Clear diagonal element
	}

	return result as IMatrix4;
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
 * @returns {IMatrix4} A 4x4 orthographic projection matrix.
 *
 * @throws {Error} If any opposing boundaries are equal.
 *
 * @example
 * ```typescript
 * const orthoMatrix = Matrix_Transformation_Orthographic(
 *   -10, 10,   // Left/Right: 20 units wide
 *   -7.5, 7.5, // Bottom/Top: 15 units tall
 *   -100, 100  // Near/Far: 200 units deep
 * );
 * ```
 */
export function MatrixOrthographic(left: number, right: number, bottom: number, top: number, near: number, far: number): IMatrix4 {
	AssertNotEquals(left, right, { message: 'Left and right bounds must not be equal' });
	AssertNotEquals(bottom, top, { message: 'Bottom and top bounds must not be equal' });
	AssertNotEquals(near, far, { message: 'Near and far clipping planes must not be equal' });

	const result = MatrixCreate(4, 4);
	AssertMatrix4(result);

	// Initialize orthographic projection matrix
	// The matrix performs scaling and translation to map the orthographic volume to [-1, 1]³
	if (result[0] && result[1] && result[2] && result[3]) {
		// Scale factors to normalize each axis to [-1, 1] range
		result[0][0] = 2 / (right - left);           // X scaling
		result[1][1] = 2 / (top - bottom);           // Y scaling
		result[2][2] = -2 / (far - near);            // Z scaling (negated for right-handed system)

		// Translation to center the projection volume at origin
		result[0][3] = -(right + left) / (right - left);   // X translation
		result[1][3] = -(top + bottom) / (top - bottom);   // Y translation
		result[2][3] = -(far + near) / (far - near);       // Z translation

		// Homogeneous coordinate (no perspective division needed)
		result[3][3] = 1;
	}

	return result as IMatrix4;
}
