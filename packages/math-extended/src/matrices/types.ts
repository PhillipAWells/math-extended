import z from 'zod';

/**
 * Matrix type definitions for linear algebra operations.
 * Provides comprehensive type definitions for matrices of various sizes and related operations.
 */

/**
 * General matrix type representing a 2D array of numbers.
 * Used for matrices of arbitrary dimensions (m×n).
 *
 * @example
 * ```typescript
 * const matrix: TMatrix = [[1, 2, 3], [4, 5, 6]]; // 2×3 matrix
 * const square: TMatrix = [[1, 2], [3, 4]]; // 2×2 square matrix
 * ```
 */

export const MATRIX_SCHEMA = z.array(z.array(z.number())).refine(arr => arr.length > 0 && arr.every(row => row.length > 0), { message: 'Matrix must have at least one row and one column' }).refine(arr => {
	const firstRowLength = arr[0]?.length ?? 0;
	return arr.every(row => row.length === firstRowLength);
}, { message: 'All matrix rows must have the same length' });
export type TMatrix = z.infer<typeof MATRIX_SCHEMA>;

/**
 * 1×1 matrix type for scalar operations in matrix form.
 * Useful for maintaining type consistency in matrix operations.
 *
 * @example
 * ```typescript
 * const scalar: TMatrix1 = [[5]]; // Single value in matrix format
 * ```
 */
export const MATRIX1_SCHEMA = z.array(z.array(z.number())).refine(arr => arr.length === 1 && arr[0].length === 1, { message: 'Matrix must be exactly 1×1' }).refine(arr => arr[0].length > 0, { message: 'Matrix rows cannot be empty' });
export type TMatrix1 = z.infer<typeof MATRIX1_SCHEMA>;

/**
 * 2×2 matrix type commonly used for 2D transformations.
 * Frequently used in computer graphics and 2D geometry operations.
 *
 * @example
 * ```typescript
 * const rotation2D: TMatrix2 = [[0, -1], [1, 0]]; // 90° rotation matrix
 * const scale2D: TMatrix2 = [[2, 0], [0, 3]]; // Scale transformation
 * ```
 */
export const MATRIX2_SCHEMA = z.array(z.array(z.number())).refine(arr => arr.length === 2 && arr[0].length === 2 && arr[1].length === 2, { message: 'Matrix must be exactly 2×2' }).refine(arr => arr.every(row => row.length > 0), { message: 'Matrix rows cannot be empty' });
export type TMatrix2 = z.infer<typeof MATRIX2_SCHEMA>;

/**
 * 3×3 matrix type commonly used for 2D transformations with translation
 * or 3D rotations. Standard size for homogeneous 2D coordinates.
 *
 * @example
 * ```typescript
 * const transform2D: TMatrix3|TMatrix4 = [[1, 0, 5], [0, 1, 10], [0, 0, 1]]; // Translation
 * const rotation3D: TMatrix3|TMatrix4 = [[1, 0, 0], [0, 0, -1], [0, 1, 0]]; // X-axis rotation
 * ```
 */
export const MATRIX3_SCHEMA = z.array(z.array(z.number())).refine(arr => arr.length === 3 && arr[0].length === 3 && arr[1].length === 3 && arr[2].length === 3, { message: 'Matrix must be exactly 3×3' }).refine(arr => arr.every(row => row.length > 0), { message: 'Matrix rows cannot be empty' });
export type TMatrix3 = z.infer<typeof MATRIX3_SCHEMA>;

/**
 * 4×4 matrix type commonly used for 3D transformations.
 * Standard size for homogeneous 3D coordinates and transformation pipelines.
 *
 * @example
 * ```typescript
 * const transform3D: TMatrix3|TMatrix4 = [
 *   [1, 0, 0, 5],  // Translation in X
 *   [0, 1, 0, 10], // Translation in Y
 *   [0, 0, 1, 15], // Translation in Z
 *   [0, 0, 0, 1]   // Homogeneous coordinate
 * ];
 * ```
 */
export const MATRIX4_SCHEMA = z.array(z.array(z.number())).refine(arr => arr.length === 4 && arr[0].length === 4 && arr[1].length === 4 && arr[2].length === 4 && arr[3].length === 4, { message: 'Matrix must be exactly 4×4' }).refine(arr => arr.every(row => row.length > 0), { message: 'Matrix rows cannot be empty' });
export type TMatrix4 = z.infer<typeof MATRIX4_SCHEMA>;

/**
 * Configuration options for matrix operations.
 * Provides control over how matrix operations are performed.
 *
 * @interface IMatrixOperationOptions
 */
export interface IMatrixOperationOptions {
	/** Whether to perform the operation in-place (modifying the original matrix) */
	inplace?: boolean;
}

/**
 * Union type representing any matrix type.
 * Useful for functions that can accept matrices of any size.
 *
 * @example
 * ```typescript
 * function processMatrix(matrix: TMatrix): void {
 *   // Can handle any matrix size
 * }
 * ```
 */
export type TMatrixAll = TMatrix1 | TMatrix2 | TMatrix3 | TMatrix4 | TMatrix;

/**
 * Conditional type that preserves the specific matrix type through operations.
 * Ensures type safety by returning the same specific matrix type as the input.
 *
 * @template T - The input matrix type extending TMatrix
 * @example
 * ```typescript
 * function operation<T extends TMatrix>(matrix: T): TMatrixResult<T> {
 *   // Returns same specific type as input
 * }
 * ```
 */
export type TMatrixResult<T extends TMatrix> = T extends TMatrix1 ? TMatrix1 : T extends TMatrix2 ? TMatrix2 : T extends TMatrix3 ? TMatrix3 : T extends TMatrix4 ? TMatrix4 : TMatrix;

export const MATRIX_SQUARE_SCHEMA = z.array(z.array(z.number())).refine(arr => arr.length > 0 && arr.every(row => row.length === arr.length), { message: 'Matrix must be square (m×m)' });
export type TMatrixSquare = z.infer<typeof MATRIX_SQUARE_SCHEMA>;
