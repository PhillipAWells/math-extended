import { AssertMatrix, MatrixError } from './asserts.js';
import { MatrixCreate, MatrixSize } from './core.js';
import { MatrixSVD, MatrixCholesky } from './decompositions.js';
import type { TMatrix, TMatrixResult } from './types.js';

/**
 * Computes the Frobenius norm (Euclidean norm) of a matrix.
 * @param matrix - The input matrix (any dimensions)
 * @returns {number} The Frobenius norm (always non-negative)
 * @throws {MatrixError} If the matrix contains invalid values
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
 *
 * @remarks
 * This function computes a full Singular Value Decomposition (SVD) internally
 * to find the largest singular value. SVD is an O(n³) or worse operation
 * depending on the matrix dimensions and the number of iterations required.
 * Avoid calling this repeatedly in performance-critical loops on large matrices;
 * prefer cheaper norms (e.g. {@link MatrixFrobeniusNorm}) when an exact spectral
 * norm is not required.
 *
 * @param matrix - The input matrix
 * @returns {number} The spectral norm (always non-negative)
 * @throws {MatrixError} If the matrix contains invalid values
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
 * @throws {MatrixError} If the matrix contains invalid values
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
 * @throws {MatrixError} If the matrix contains invalid values
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
 *
 * @remarks
 * This function computes a full Singular Value Decomposition (SVD) internally
 * to sum all singular values. SVD is an O(n³) or worse operation depending on
 * the matrix dimensions and the number of iterations required. Avoid calling
 * this repeatedly in performance-critical loops on large matrices; prefer
 * cheaper norms (e.g. {@link MatrixFrobeniusNorm}) when an exact nuclear norm
 * is not required.
 *
 * @param matrix - The input matrix
 * @returns {number} The nuclear norm (always non-negative)
 * @throws {MatrixError} If the matrix contains invalid values
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
 * @throws {MatrixError} If the matrix contains invalid values
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
 * @throws {MatrixError} If the matrix contains invalid values or p < 1
 * @example
 * ```typescript
 * MatrixPNorm([[1, 2], [3, 4]], 1) // 10 (sum of absolute values)
 * ```
 */
export function MatrixPNorm(matrix: TMatrix, p: number): number {
	AssertMatrix(matrix);

	if (p < 1) throw new MatrixError('p-norm parameter must be >= 1');

	if (p === Infinity) return MatrixMaxNorm(matrix);

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

/**
 * Normalizes a matrix to have unit Frobenius norm.
 *
 * Divides every element of the matrix by its Frobenius norm, resulting in a matrix
 * with Frobenius norm equal to 1.0. This is useful for scaling matrices to a canonical
 * size while preserving direction and relative magnitudes.
 *
 * @param matrix - The input matrix (any dimensions)
 * @returns {TMatrixResult<T>} A normalized matrix with unit Frobenius norm
 *
 * @throws {MatrixError} If the matrix is all zeros (norm is 0) or contains invalid values
 *
 * @example
 * ```typescript
 * const matrix = [[3, 4], [0, 0]]; // Frobenius norm = 5
 * const normalized = MatrixNormalize(matrix); // [[0.6, 0.8], [0, 0]]
 * MatrixFrobeniusNorm(normalized); // 1.0
 * ```
 */
export function MatrixNormalize<T extends TMatrix>(matrix: T): TMatrixResult<T> {
	AssertMatrix(matrix);

	const norm = MatrixFrobeniusNorm(matrix);

	if (norm === 0) {
		throw new MatrixError('Cannot normalize a zero matrix (Frobenius norm is 0)');
	}

	const [rows, cols] = MatrixSize(matrix);
	const result = MatrixCreate(rows, cols);

	for (let row = 0; row < rows; row++) {
		const matrixRow = matrix[row];
		const resultRow = result[row];

		for (let col = 0; col < cols; col++) {
			resultRow[col] = matrixRow[col] / norm;
		}
	}

	return result as TMatrixResult<T>;
}

/**
 * Determines whether a matrix is orthogonal (orthonormal columns/rows).
 *
 * A square matrix Q is orthogonal if Qᵀ × Q = I (or equivalently Q × Qᵀ = I),
 * meaning its rows and columns form orthonormal sets. Orthogonal matrices preserve
 * vector magnitudes and angles under transformation, making them numerically stable.
 *
 * Returns false (does not throw) for non-square matrices.
 *
 * @param matrix - Input matrix (any m×n dimensions)
 * @param tolerance - Maximum allowed deviation from identity in Qᵀ × Q (default: 1e-9)
 * @returns True if the matrix is square and orthogonal within tolerance; false otherwise
 * @throws {MatrixError} If matrix contains invalid values (NaN, Infinity)
 *
 * @example
 * ```typescript
 * // Orthogonal (rotation matrix)
 * const rotated = [[0, -1, 0], [1, 0, 0], [0, 0, 1]];
 * MatrixIsOrthogonal(rotated) // true
 *
 * // Not orthogonal (scaled rotation)
 * const scaled = [[0, -2, 0], [2, 0, 0], [0, 0, 2]];
 * MatrixIsOrthogonal(scaled) // false (magnitudes changed)
 *
 * // Non-square (cannot be orthogonal)
 * const rect = [[1, 0], [0, 1], [0, 0]];
 * MatrixIsOrthogonal(rect) // false
 * ```
 */
export function MatrixIsOrthogonal(matrix: TMatrix, tolerance = 1e-9): boolean {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);

	// Must be square
	if (rows !== cols || rows === 0) return false;

	// We need MatrixTranspose, MatrixMultiply, MatrixIdentity, MatrixEquals
	// To avoid circular imports, we inline the orthogonality check
	// Q is orthogonal iff Q^T × Q = I, which means:
	// sum of row[i] · row[j] = 1 if i==j, else 0 (dot products)

	// Check orthonormality: each row has magnitude 1 and rows are perpendicular
	for (let i = 0; i < rows; i++) {
		const rowI = matrix[i];
		if (!rowI) return false;

		for (let j = 0; j < rows; j++) {
			const rowJ = matrix[j];
			if (!rowJ) return false;

			// Compute dot product row[i] · row[j]
			let dot = 0;
			for (let k = 0; k < cols; k++) {
				const valI = rowI[k];
				const valJ = rowJ[k];
				if (typeof valI !== 'number' || typeof valJ !== 'number') return false;
				dot += valI * valJ;
			}

			// Expected: 1 if i==j (magnitude squared = 1), 0 otherwise (perpendicular)
			const expected = i === j ? 1 : 0;
			if (Math.abs(dot - expected) > tolerance) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Determines whether a matrix is positive definite (all eigenvalues > 0).
 *
 * A symmetric matrix A is positive definite if x^T × A × x > 0 for all non-zero vectors x.
 * This is fundamental in optimization (Hessians), statistics (covariance matrices),
 * and numerical methods (Cholesky decomposition).
 *
 * This function attempts Cholesky decomposition: success ⇒ positive definite,
 * failure ⇒ not positive definite. This approach is efficient and numerically stable.
 *
 * Returns false (does not throw) for:
 * - Non-square matrices
 * - Non-symmetric matrices
 * - Singular or indefinite matrices
 *
 * @param matrix - Input matrix (any m×n dimensions)
 * @returns True if the matrix is symmetric and positive definite; false otherwise
 * @throws {MatrixError} If matrix contains invalid values (NaN, Infinity)
 *
 * @example
 * ```typescript
 * // Positive definite (covariance-like)
 * const pd = [[4, 2], [2, 3]];
 * MatrixIsPositiveDefinite(pd) // true
 *
 * // Not positive definite (negative eigenvalue)
 * const nd = [[1, 2], [2, 1]];
 * MatrixIsPositiveDefinite(nd) // false
 *
 * // Singular (zero eigenvalue)
 * const singular = [[1, 1], [1, 1]];
 * MatrixIsPositiveDefinite(singular) // false
 *
 * // Non-square
 * const rect = [[1, 0], [0, 1], [0, 0]];
 * MatrixIsPositiveDefinite(rect) // false
 * ```
 */
export function MatrixIsPositiveDefinite(matrix: TMatrix): boolean {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);

	// Must be square
	if (rows !== cols || rows === 0) return false;

	// Attempt Cholesky decomposition: success ⇒ positive definite; failure ⇒ not PD
	try {
		MatrixCholesky(matrix);
		return true;
	}
	catch {
		return false;
	}
}
