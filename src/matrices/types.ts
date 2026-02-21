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
 
export type IMatrix = number[][];

/**
 * 1×1 matrix type for scalar operations in matrix form.
 * Useful for maintaining type consistency in matrix operations.
 *
 * @example
 * const scalar: IMatrix1 = [[5]]; // Single value in matrix format
 */
 
export type IMatrix1 = [[number]];

/**
 * 2×2 matrix type commonly used for 2D transformations.
 * Frequently used in computer graphics and 2D geometry operations.
 *
 * @example
 * const rotation2D: IMatrix2 = [[0, -1], [1, 0]]; // 90° rotation matrix
 * const scale2D: IMatrix2 = [[2, 0], [0, 3]]; // Scale transformation
 */
 
export type IMatrix2 = [
	[number, number],
	[number, number],
];

/**
 * 3×3 matrix type commonly used for 2D transformations with translation
 * or 3D rotations. Standard size for homogeneous 2D coordinates.
 *
 * @example
 * const transform2D: IMatrix3 = [[1, 0, 5], [0, 1, 10], [0, 0, 1]]; // Translation
 * const rotation3D: IMatrix3 = [[1, 0, 0], [0, 0, -1], [0, 1, 0]]; // X-axis rotation
 */
 
export type IMatrix3 = [
	[number, number, number],
	[number, number, number],
	[number, number, number],
];

/**
 * 4×4 matrix type commonly used for 3D transformations.
 * Standard size for homogeneous 3D coordinates and transformation pipelines.
 *
 * @example
 * const transform3D: IMatrix4 = [
 *   [1, 0, 0, 5],  // Translation in X
 *   [0, 1, 0, 10], // Translation in Y
 *   [0, 0, 1, 15], // Translation in Z
 *   [0, 0, 0, 1]   // Homogeneous coordinate
 * ];
 */
 
export type IMatrix4 = [
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
export type TMatrix = IMatrix | IMatrix1 | IMatrix2 | IMatrix3 | IMatrix4;

/**
 * Conditional type that preserves the specific matrix type through operations.
 * Ensures type safety by returning the same specific matrix type as the input.
 *
 * @template T - The input matrix type extending IMatrix
 * @example
 * function operation<T extends IMatrix>(matrix: T): TMatrixResult<T> {
 *   // Returns same specific type as input
 * }
 */
export type TMatrixResult<T extends IMatrix> = T extends IMatrix1 ? IMatrix1 : T extends IMatrix2 ? IMatrix2 : T extends IMatrix3 ? IMatrix3 : T extends IMatrix4 ? IMatrix4 : IMatrix;
