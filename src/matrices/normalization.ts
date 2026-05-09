import { AssertMatrix, MatrixError } from './asserts.js';
import { MatrixSize } from './core.js';
import { MatrixSVD } from './decompositions.js';
import type { TMatrix } from './types.js';

/**
 * Computes the Frobenius norm (Euclidean norm) of a matrix.
 * @param matrix - The input matrix (any dimensions)
 * @returns {number} The Frobenius norm (always non-negative)
 * @throws {Error} If the matrix contains invalid values
 * @example
 * ```typescript
 * MatrixFrobeniusNorm([[3, 4], [0, 0]]) // 5 (sqrt(3² + 4²))
 * ```
 */
export function MatrixFrobeniusNorm(matrix: TMatrix): number {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	let sum = 0;

	for (let row = 0; row < rows; row++) {
		const matrixRow = matrix[row];

		for (let col = 0; col < cols; col++) {
			const val = matrixRow[col];
			// Add square of each element to the sum
			sum += val * val;
		}
	}

	return Math.sqrt(sum);
}

/**
 * Computes the spectral norm (2-norm) of a matrix.
 * This is the largest singular value of the matrix.
 * @param matrix - The input matrix
 * @returns {number} The spectral norm (always non-negative)
 * @throws {Error} If the matrix contains invalid values
 * @example
 * ```typescript
 * MatrixSpectralNorm([[3, 0], [0, 4]]) // 4 (largest singular value)
 * ```
 */
export function MatrixSpectralNorm(matrix: TMatrix): number {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	if (rows === 0 || cols === 0) {
		return 0;
	}

	const svd = MatrixSVD(matrix);
	// The spectral norm is the largest singular value
	return Math.max(...svd.S);
}

/**
 * Computes the 1-norm (maximum column sum) of a matrix.
 * @param matrix - The input matrix
 * @returns {number} The 1-norm (always non-negative)
 * @throws {Error} If the matrix contains invalid values
 * @example
 * ```typescript
 * Matrix1Norm([[1, 2], [3, 4]]) // 6 (max of column sums: 4, 6)
 * ```
 */
export function Matrix1Norm(matrix: TMatrix): number {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	let maxColumnSum = 0;

	// Iterate through each column
	for (let col = 0; col < cols; col++) {
		let columnSum = 0;

		// Sum absolute values in this column
		for (let row = 0; row < rows; row++) {
			const matrixRow = matrix[row];

			const val = matrixRow[col];
			columnSum += Math.abs(val);
		}

		maxColumnSum = Math.max(maxColumnSum, columnSum);
	}

	return maxColumnSum;
}

/**
 * Computes the infinity norm (maximum row sum) of a matrix.
 * @param matrix - The input matrix
 * @returns {number} The infinity norm (always non-negative)
 * @throws {Error} If the matrix contains invalid values
 * @example
 * ```typescript
 * MatrixInfinityNorm([[1, 2], [3, 4]]) // 7 (max of row sums: 3, 7)
 * ```
 */
export function MatrixInfinityNorm(matrix: TMatrix): number {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	let maxRowSum = 0;

	// Iterate through each row
	for (let row = 0; row < rows; row++) {
		const matrixRow = matrix[row];

		let rowSum = 0;

		// Sum absolute values in this row
		for (let col = 0; col < cols; col++) {
			const val = matrixRow[col];
			rowSum += Math.abs(val);
		}

		maxRowSum = Math.max(maxRowSum, rowSum);
	}

	return maxRowSum;
}

/**
 * Computes the nuclear norm (trace norm) of a matrix.
 * This is the sum of all singular values.
 * @param matrix - The input matrix
 * @returns {number} The nuclear norm (always non-negative)
 * @throws {Error} If the matrix contains invalid values
 * @example
 * ```typescript
 * MatrixNuclearNorm([[3, 0], [0, 4]]) // 7 (sum of singular values: 3 + 4)
 * ```
 */
export function MatrixNuclearNorm(matrix: TMatrix): number {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	if (rows === 0 || cols === 0) {
		return 0;
	}

	const svd = MatrixSVD(matrix);
	// The nuclear norm is the sum of all singular values
	return svd.S.reduce((sum: number, sv: number) => sum + sv, 0);
}

/**
 * Computes the max norm (entry-wise maximum) of a matrix.
 * This is the maximum absolute value of any matrix element.
 * @param matrix - The input matrix
 * @returns {number} The max norm (always non-negative)
 * @throws {Error} If the matrix contains invalid values
 * @example
 * ```typescript
 * MatrixMaxNorm([[1, -5], [3, 2]]) // 5 (max absolute value)
 * ```
 */
export function MatrixMaxNorm(matrix: TMatrix): number {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	let maxValue = 0;

	for (let row = 0; row < rows; row++) {
		const matrixRow = matrix[row];

		for (let col = 0; col < cols; col++) {
			const val = matrixRow[col];
			maxValue = Math.max(maxValue, Math.abs(val));
		}
	}

	return maxValue;
}

/**
 * Computes a general p-norm of a matrix (treating it as a flattened vector).
 * @param matrix - The input matrix
 * @param p - The norm parameter (must be >= 1)
 * @returns {number} The p-norm (always non-negative)
 * @throws {Error} If the matrix contains invalid values or p < 1
 * @example
 * ```typescript
 * MatrixPNorm([[1, 2], [3, 4]], 1) // 10 (sum of absolute values)
 * ```
 */
export function MatrixPNorm(matrix: TMatrix, p: number): number {
	AssertMatrix(matrix);

	if (p < 1) 		throw new MatrixError('p-norm parameter must be >= 1');

	if (p === Infinity) 	return MatrixMaxNorm(matrix);

	const [rows, cols] = MatrixSize(matrix);
	let sum = 0;

	for (let row = 0; row < rows; row++) {
		const matrixRow = matrix[row];

		for (let col = 0; col < cols; col++) {
			const val = matrixRow[col];
			sum += Math.pow(Math.abs(val), p);
		}
	}

	return Math.pow(sum, 1 / p);
}
