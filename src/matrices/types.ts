/**
 * Matrix type definitions for linear algebra operations.
 * Provides comprehensive type definitions for matrices of various sizes and related operations.
 */

/**
 * General matrix type representing a 2D array of numbers.
 * Used for matrices of arbitrary dimensions (m×n).
 *
 * @example
 * const matrix: IMatrix = [[1, 2, 3], [4, 5, 6]]; // 2×3 matrix
 * const square: IMatrix = [[1, 2], [3, 4]]; // 2×2 square matrix
 */
 
export type TMatrix = number[][];

/**
 * 1×1 matrix type for scalar operations in matrix form.
 * Useful for maintaining type consistency in matrix operations.
 *
 * @example
 * const scalar: IMatrix1 = [[5]]; // Single value in matrix format
 */
 
export type TMatrix1 = [[number]];

/**
 * 2×2 matrix type commonly used for 2D transformations.
 * Frequently used in computer graphics and 2D geometry operations.
 *
 * @example
 * const rotation2D: IMatrix2 = [[0, -1], [1, 0]]; // 90° rotation matrix
 * const scale2D: IMatrix2 = [[2, 0], [0, 3]]; // Scale transformation
 */
 
export type TMatrix2 = [
	[number, number],
	[number, number],
];

/**
 * 3×3 matrix type commonly used for 2D transformations with translation
 * or 3D rotations. Standard size for homogeneous 2D coordinates.
 *
 * @example
 * const transform2D: TMatrix3|TMatrix4 = [[1, 0, 5], [0, 1, 10], [0, 0, 1]]; // Translation
 * const rotation3D: TMatrix3|TMatrix4 = [[1, 0, 0], [0, 0, -1], [0, 1, 0]]; // X-axis rotation
 */
 
export type TMatrix3 = [
	[number, number, number],
	[number, number, number],
	[number, number, number],
];

/**
 * 4×4 matrix type commonly used for 3D transformations.
 * Standard size for homogeneous 3D coordinates and transformation pipelines.
 *
 * @example
 * const transform3D: TMatrix3|TMatrix4 = [
 *   [1, 0, 0, 5],  // Translation in X
 *   [0, 1, 0, 10], // Translation in Y
 *   [0, 0, 1, 15], // Translation in Z
 *   [0, 0, 0, 1]   // Homogeneous coordinate
 * ];
 */
 
export type TMatrix4 = [
	[number, number, number, number],
	[number, number, number, number],
	[number, number, number, number],
	[number, number, number, number],
];

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
 * function processMatrix(matrix: TMatrix): void {
 *   // Can handle any matrix size
 * }
 */
export type TMatrixAll = TMatrix1 | TMatrix2 | TMatrix3 | TMatrix4 | TMatrix;

/**
 * Conditional type that preserves the specific matrix type through operations.
 * Ensures type safety by returning the same specific matrix type as the input.
 *
 * @template T - The input matrix type extending TMatrix
 * @example
 * function operation<T extends TMatrix>(matrix: T): TMatrixResult<T> {
 *   // Returns same specific type as input
 * }
 */
export type TMatrixResult<T extends TMatrix> = T extends TMatrix1 ? TMatrix1 : T extends TMatrix2 ? TMatrix2 : T extends TMatrix3 ? TMatrix3 : T extends TMatrix4 ? TMatrix4 : TMatrix;
