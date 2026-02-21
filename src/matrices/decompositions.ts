import { AssertNumber, AssertInstanceOf } from '@pawells/typescript-common';
import { MatrixMultiply } from './arithmetic.js';
import { AssertMatrix, AssertMatrixRow, AssertMatrixValue, AssertMatrix1, AssertMatrix2, MatrixError } from './asserts.js';
import { MatrixSize, MatrixCreate, MatrixClone, MatrixIdentity, MatrixTranspose } from './core.js';
import { MatrixGramSchmidt } from './linear-algebra.js';
import { IMatrix } from './types.js';

const MATRIX_NUMERICAL_TOLERANCE = 1e-12;
const EIGEN_CONVERGENCE_TOLERANCE = 1e-10;

/**
 * Result of eigenvalue decomposition containing eigenvalues and their corresponding eigenvectors.
 *
 * For a square matrix A, eigenvalue decomposition finds values λ and vectors v such that A × v = λ × v.
 * The eigenvalues represent the scaling factors, while eigenvectors represent the directions
 * that remain unchanged (up to scaling) under the linear transformation.
 */
type TEigenDecompositionResult = {
	/** Array of eigenvalues λ in descending order */
	eigenvalues: number[];
	/** Matrix where each column is an eigenvector corresponding to the eigenvalue at the same index */
	eigenvectors: IMatrix;
};
/**
 * Result of LU decomposition where A = L × U.
 *
 * LU decomposition factors a square matrix into the product of a lower triangular matrix L
 * and an upper triangular matrix U. This is useful for solving systems of linear equations,
 * computing determinants, and matrix inversion.
 */
type TLUDecompositionResult = {
	/** Lower triangular matrix with 1's on the diagonal */

	readonly L: IMatrix;
	/** Upper triangular matrix containing the pivots */

	readonly U: IMatrix;
};
/**
 * Result of QR decomposition where A = Q × R.
 *
 * QR decomposition factors a matrix into the product of an orthogonal matrix Q
 * and an upper triangular matrix R. This decomposition is fundamental for least squares
 * problems, eigenvalue algorithms, and solving overdetermined linear systems.
 */
type TQRDecompositionResult = {
	/** Orthogonal matrix where Q^T × Q = I */

	readonly Q: IMatrix;
	/** Upper triangular matrix */

	readonly R: IMatrix;
};
/**
 * Result of Singular Value Decomposition (SVD) where A = U × Σ × V^T.
 *
 * SVD is a generalization of eigendecomposition to non-square matrices. It decomposes
 * any matrix into three matrices: U (left singular vectors), Σ (singular values),
 * and V^T (right singular vectors transposed). This is essential for principal component
 * analysis, matrix approximation, and solving least squares problems.
 */
type TSVDDecompositionResult = {
	/** Matrix of left singular vectors (orthogonal columns) */

	readonly U: IMatrix;
	/** Array of singular values σ in descending order (diagonal elements of Σ matrix) */

	readonly S: number[];
	/** Transpose of the matrix of right singular vectors (V^T where V has orthogonal columns) */

	readonly VT: IMatrix;
};

/**
 * Performs Cholesky decomposition for symmetric positive definite matrices A = L × L^T.
 *
 * Cholesky decomposition is a specialized form of LU decomposition that takes advantage
 * of the symmetry and positive definiteness of the input matrix. It's approximately twice
 * as efficient as general LU decomposition for matrices that meet these conditions.
 *
 * **Mathematical Background:**
 * For a symmetric positive definite matrix A, there exists a unique lower triangular matrix L
 * with positive diagonal entries such that A = L × L^T. This decomposition is useful for:
 * - Solving linear systems Ax = b efficiently
 * - Computing matrix determinants (det(A) = (det(L))²)
 * - Matrix inversion and computing quadratic forms
 * - Numerical stability in optimization algorithms
 *
 * @param matrix - The symmetric positive definite square matrix to decompose
 * @returns Lower triangular matrix L such that A = L × L^T
 * @throws {Error} If matrix is not square, not symmetric, or not positive definite
 *
 * @example
 * ```ts
 * // Symmetric positive definite matrix
 * const A = [[4, 2], [2, 3]];
 * const L = MatrixCholesky(A);
 * // L = [[2, 0], [1, √2]] ≈ [[2, 0], [1, 1.414]]
 *
 * // Verify: L × L^T should equal A
 * const LT = MatrixTranspose(L);
 * const reconstructed = MatrixMultiply(L, LT);
 * // reconstructed ≈ [[4, 2], [2, 3]]
 * ```
 *
 * @complexity Time: O(n³/3), Space: O(n²) - About 2x faster than general LU decomposition
 * @see {@link MatrixLU} For general square matrices that may not be positive definite
 */
export function MatrixCholesky(matrix: IMatrix): IMatrix {
	AssertMatrix(matrix, { square: true });

	const [n] = MatrixSize(matrix);
	const L = MatrixCreate(n, n);

	// Perform Cholesky decomposition using the Cholesky-Banachiewicz algorithm
	for (let i = 0; i < n; i++) {
		const lRowI = L[i];
		const matrixRowI = matrix[i];
		AssertMatrixRow(lRowI);
		AssertMatrixRow(matrixRowI);

		for (let j = 0; j <= i; j++) {
			const lRowJ = L[j];
			AssertMatrixRow(lRowJ);

			if (i === j) {
				// Compute diagonal elements: L[i,i] = √(A[i,i] - Σ(k=0 to i-1) L[i,k]²)
				let sum = 0;

				// Sum of squares of elements in row i before column j
				for (let k = 0; k < j; k++) {
					const lVal = lRowI[k];
					AssertMatrixValue(lVal, { rowIndex: i, columnIndex: k });
					sum += lVal * lVal;
				}

				const matrixVal = matrixRowI[j];
				AssertMatrixValue(matrixVal, { rowIndex: i, columnIndex: j });

				const diagonal = matrixVal - sum;

				// Check positive definiteness - diagonal must be positive
				if (diagonal <= 0) {
					throw new Error(`Matrix is not positive definite at element [${i},${j}]`);
				}

				lRowI[j] = Math.sqrt(diagonal);
			} else {
				// Compute off-diagonal elements: L[i,j] = (A[i,j] - Σ(k=0 to j-1) L[i,k]*L[j,k]) / L[j,j]
				let sum = 0;

				// Sum of products of corresponding elements in rows i and j
				for (let k = 0; k < j; k++) {
					const lIVal = lRowI[k];
					const lJVal = lRowJ[k];
					AssertMatrixValue(lIVal, { rowIndex: i, columnIndex: k });
					AssertMatrixValue(lJVal, { rowIndex: j, columnIndex: k });
					sum += lIVal * lJVal;
				}

				const matrixVal = matrixRowI[j];
				const lJDiag = lRowJ[j];
				AssertMatrixValue(matrixVal, { rowIndex: i, columnIndex: j });
				AssertMatrixValue(lJDiag, { rowIndex: j, columnIndex: j });

				// Check for numerical stability - diagonal element should not be too small
				if (Math.abs(lJDiag) < MATRIX_NUMERICAL_TOLERANCE) {
					throw new Error(`Zero diagonal element at [${j},${j}] - matrix not positive definite`);
				}

				lRowI[j] = (matrixVal - sum) / lJDiag;
			}
		}
	}

	return L;
}
/**
 * Performs eigenvalue decomposition for square matrices to find A × v = λ × v.
 *
 * Eigenvalue decomposition (also called spectral decomposition) finds the eigenvalues λ
 * and corresponding eigenvectors v of a square matrix A. This fundamental decomposition
 * reveals the principal directions and scaling factors of the linear transformation
 * represented by the matrix.
 *
 * **Mathematical Background:**
 * - Eigenvalues λ are scalars such that A × v = λ × v for some non-zero vector v
 * - Eigenvectors v are the directions that remain unchanged (up to scaling) under A
 * - The characteristic polynomial det(A - λI) = 0 gives the eigenvalues
 * - Applications include stability analysis, principal component analysis, and vibration modes
 *
 * **Implementation Notes:**
 * - Uses direct analytical computation for 1×1 and 2×2 matrices
 * - Uses QR iteration for larger matrices (simplified implementation)
 * - Currently supports only real eigenvalues (complex eigenvalues throw an error)
 *
 * @param matrix - The square matrix to decompose
 * @returns Object containing eigenvalues and eigenvectors
 * @throws {Error} If matrix is not square, contains invalid values, or has complex eigenvalues
 *
 * @example
 * ```ts
 * // Simple 2x2 matrix
 * const A = [[3, 1], [0, 2]];
 * const { eigenvalues, eigenvectors } = MatrixEigen(A);
 * // eigenvalues: [3, 2]
 * // eigenvectors: matrix where each column corresponds to an eigenvalue
 *
 * // Verify eigenvalue equation: A × v = λ × v
 * const v = Matrix_GetColumn(eigenvectors, 0); // First eigenvector
 * const Av = MatrixMultiplyVector(A, v);
 * const lambdaV = Matrix_ScaleVector(v, eigenvalues[0]);
 * // Av should approximately equal lambdaV
 * ```
 *
 * @complexity O(n³) time for an n×n matrix
 * @see {@link MatrixEigenQRIteration} For the iterative algorithm used for larger matrices
 */
export function MatrixEigen(matrix: IMatrix): TEigenDecompositionResult {
	AssertMatrix(matrix, { square: true });

	const [n] = MatrixSize(matrix);

	// For small matrices, use direct analytical computation for efficiency and accuracy
	if (n === 1) {
		AssertMatrix1(matrix);

		// For 1×1 matrix, the single element is the eigenvalue, eigenvector is [1]
		const [[value]] = matrix;
		AssertNumber(value, {}, { message: 'Matrix[0,0] Not a Number' });
		return {
			eigenvalues: [value],
			eigenvectors: [[1]],
		};
	}

	if (n === 2) {
		AssertMatrix2(matrix);

		// Direct computation for 2×2 matrices using the characteristic polynomial
		const [[a, b], [c, d]] = matrix;

		// Characteristic polynomial: λ² - (a+d)λ + (ad-bc) = 0
		// Using quadratic formula: λ = (trace ± √(trace² - 4×det)) / 2
		const trace = a + d;
		const det = (a * d) - (b * c);
		const discriminant = (trace * trace) - (4 * det);

		// Check for complex eigenvalues
		if (discriminant < 0) {
			throw new Error('Complex eigenvalues not supported in this implementation');
		}

		const sqrtDisc = Math.sqrt(discriminant);
		const lambda1 = (trace + sqrtDisc) / 2;
		const lambda2 = (trace - sqrtDisc) / 2;

		// Compute eigenvectors by solving (A - λI)v = 0
		const eigenvectors = MatrixCreate(2, 2);

		// For each eigenvalue, find the corresponding eigenvector
		if (Math.abs(b) > MATRIX_NUMERICAL_TOLERANCE && Math.abs(c) < MATRIX_NUMERICAL_TOLERANCE) {
			// Upper-triangular or b ≠ 0, c ≈ 0
			// First eigenvector: [1, 0] (for lambda1 = a)
			// Second eigenvector: [1, (lambda2 - a)/b]
			const [eigenvectorsRow0, eigenvectorsRow1] = eigenvectors;
			AssertMatrixRow(eigenvectorsRow0);
			AssertMatrixRow(eigenvectorsRow1);

			eigenvectorsRow0[0] = 1;
			eigenvectorsRow1[0] = 0;

			eigenvectorsRow0[1] = 1;
			eigenvectorsRow1[1] = (lambda2 - a) / b;
		} else if (Math.abs(c) > MATRIX_NUMERICAL_TOLERANCE) {
			// Use the first row to find eigenvectors when c ≠ 0
			const [eigenvectorsRow0, eigenvectorsRow1] = eigenvectors;
			AssertMatrixRow(eigenvectorsRow0);
			AssertMatrixRow(eigenvectorsRow1);

			eigenvectorsRow0[0] = lambda1 - d;
			eigenvectorsRow1[0] = c;

			eigenvectorsRow0[1] = lambda2 - d;
			eigenvectorsRow1[1] = c;
		} else {
			// Diagonal matrix case - eigenvectors are standard basis vectors
			const [eigenvectorsRow0, eigenvectorsRow1] = eigenvectors;
			AssertMatrixRow(eigenvectorsRow0);
			AssertMatrixRow(eigenvectorsRow1);

			eigenvectorsRow0[0] = 1;
			eigenvectorsRow1[0] = 0;

			eigenvectorsRow0[1] = 0;
			eigenvectorsRow1[1] = 1;
		}

		// Normalize eigenvectors to unit length for numerical stability
		for (let j = 0; j < 2; j++) {
			let norm = 0;

			// Calculate the norm (length) of the eigenvector
			for (let i = 0; i < 2; i++) {
				const eigenvectorsRowI = eigenvectors[i];
				AssertMatrixRow(eigenvectorsRowI);

				const val = eigenvectorsRowI[j];
				AssertNumber(val, {}, { message: `Eigenvector[${i},${j}] Not a Number` });
				norm += val * val;
			}
			norm = Math.sqrt(norm);

			// Normalize if the norm is significant
			if (norm > MATRIX_NUMERICAL_TOLERANCE) {
				for (let i = 0; i < 2; i++) {
					const eigenvectorsRowI = eigenvectors[i];
					AssertMatrixRow(eigenvectorsRowI);

					const val = eigenvectorsRowI[j];
					AssertMatrixValue(val, { rowIndex: i, columnIndex: j });
					eigenvectorsRowI[j] = val / norm;
				}
			}
		}

		return {
			eigenvalues: [lambda1, lambda2],
			eigenvectors,
		};
	}

	// For larger matrices, use the QR iteration algorithm
	return MatrixEigenQRIteration(matrix);
}
/**
 * Simplified QR iteration algorithm for eigenvalue computation of larger matrices.
 *
 * The QR algorithm is an iterative method for computing eigenvalues. It repeatedly
 * performs QR decomposition and matrix multiplication until convergence. This is
 * a simplified educational implementation without optimizations like Hessenberg
 * reduction or deflation techniques used in production libraries.
 *
 * **Algorithm Overview:**
 * 1. Start with A₀ = A
 * 2. For each iteration k: decompose Aₖ = QₖRₖ
 * 3. Set Aₖ₊₁ = RₖQₖ
 * 4. Repeat until convergence (off-diagonal elements become small)
 * 5. Eigenvalues are the diagonal elements of the final matrix
 *
 * @private
 * @param matrix - Square matrix to compute eigenvalues for
 * @param iterations - Maximum number of QR iterations (default: 50)
 * @returns Object containing eigenvalues and approximated eigenvectors
 *
 * @complexity O(n³) per iteration, typically converges in O(n) iterations
 * @see {@link MatrixQR} For the QR decomposition used in each iteration
 */
export function MatrixEigenQRIteration(matrix: IMatrix, iterations: number = 50): TEigenDecompositionResult {
	const [n] = MatrixSize(matrix);

	// Copy matrix for iteration to avoid modifying the original
	let A = MatrixClone(matrix);
	let qTotal = MatrixIdentity(n); // Accumulate transformations for eigenvectors

	for (let iter = 0; iter < iterations; iter++) {
		// Try/catch to allow fallback for rank-deficient matrices
		let Q: IMatrix; let R: IMatrix;

		try {
			({ Q, R } = MatrixQR(A));
		} catch (err: unknown) {
			// If QR fails due to linear dependence, fill Q with orthonormal basis and R with zeros
			AssertInstanceOf(err, Error, { message: 'Unexpected error in QR iteration' });
			if (err instanceof Error && typeof err.message === 'string' && err.message.includes('linearly dependent')) {
				Q = MatrixGramSchmidt(A);
				R = MatrixCreate(n, n); // All zeros
			} else {
				throw err;
			}
		}

		A = MatrixMultiply(R, Q);
		qTotal = MatrixMultiply(qTotal, Q);

		// Check for convergence - examine off-diagonal elements
		let converged = true;

		for (let i = 0; i < n - 1; i++) {
			const aRowI = A[i];
			AssertMatrixRow(aRowI);

			for (let j = i + 1; j < n; j++) {
				const aVal = aRowI[j];
				AssertMatrixValue(aVal, { rowIndex: i, columnIndex: j });
				if (Math.abs(aVal) > EIGEN_CONVERGENCE_TOLERANCE) {
					converged = false;
					break;
				}
			}
			if (!converged) break;
		}
		if (converged) break;
	}

	// Extract eigenvalues from the diagonal of the final matrix
	const eigenvalues: number[] = [];

	for (let i = 0; i < n; i++) {
		const aRowI = A[i];
		AssertMatrixRow(aRowI);

		const eigenvalue = aRowI[i];
		AssertMatrixValue(eigenvalue, { rowIndex: i, columnIndex: i });
		eigenvalues.push(eigenvalue);
	}

	return {
		eigenvalues,
		eigenvectors: qTotal, // Accumulated orthogonal transformations give eigenvectors
	};
}
/**
 * Performs LU decomposition of a square matrix A = L × U using Doolittle's method.
 *
 * LU decomposition factors a square matrix into the product of a lower triangular matrix L
 * and an upper triangular matrix U. This decomposition is fundamental for solving linear
 * systems, computing determinants, and matrix inversion.
 *
 * **Mathematical Background:**
 * - L is lower triangular with 1's on the diagonal (unit lower triangular)
 * - U is upper triangular containing the pivot elements
 * - The decomposition exists if all leading principal minors are non-zero
 * - Gaussian elimination with partial pivoting would be more stable, but this
 *   implementation uses Doolittle's method without pivoting for simplicity
 *
 * **Applications:**
 * - Solving linear systems: Ax = b becomes LUx = b, solve Ly = b then Ux = y
 * - Computing determinant: det(A) = det(L) × det(U) = det(U) = ∏ᵢ U[i,i]
 * - Matrix inversion: A⁻¹ = U⁻¹L⁻¹
 *
 * @param matrix - Square matrix to decompose (must be non-singular and not require pivoting)
 * @returns Object containing L (lower triangular) and U (upper triangular) matrices
 * @throws {Error} If matrix is not square, singular, or contains invalid values
 *
 * @note This implementation does not use partial pivoting (row swapping). It will fail for matrices with zero-valued or near-zero leading minors even if the matrix is otherwise invertible (e.g., [[0,1],[1,0]]). For general matrices, use MatrixInverse instead.
 *
 * @example
 * ```ts
 * const A = [[2, 1], [1, 1]];
 * const { L, U } = MatrixLU(A);
 * // L = [[1, 0], [0.5, 1]], U = [[2, 1], [0, 0.5]]
 *
 * // Verify: L × U should equal A
 * const product = MatrixMultiply(L, U);
 * // product ≈ [[2, 1], [1, 1]]
 *
 * // Solve Ax = b using LU decomposition
 * const b = [3, 2];
 * // First solve Ly = b, then Ux = y
 * ```
 *
 * @complexity Time: O(n³/3), Space: O(n²)
 * @see {@link MatrixCholesky} For symmetric positive definite matrices (more efficient)
 */
export function MatrixLU(matrix: IMatrix): TLUDecompositionResult {
	AssertMatrix(matrix, { square: true });

	const [n] = MatrixSize(matrix);
	const L = MatrixCreate(n, n);
	const U = MatrixCreate(n, n);

	// Initialize L's diagonal with 1's (unit lower triangular)
	for (let i = 0; i < n; i++) {
		const lRow = L[i];
		AssertMatrixRow(lRow);
		lRow[i] = 1;
	}

	// Perform Doolittle's LU decomposition
	for (let i = 0; i < n; i++) {
		// Compute upper triangular matrix U (row by row)
		for (let j = i; j < n; j++) {
			let sum = 0;

			// Subtract the sum of L[i,k] * U[k,j] for k < i
			for (let k = 0; k < i; k++) {
				const lRow = L[i];
				const uRowK = U[k];
				AssertMatrixRow(lRow);
				AssertMatrixRow(uRowK);

				const lVal = lRow[k];
				AssertMatrixValue(lVal, { rowIndex: i, columnIndex: k });

				const uVal = uRowK[j];
				AssertMatrixValue(uVal, { rowIndex: k, columnIndex: j });
				sum += lVal * uVal;
			}

			const mRow = matrix[i];
			const uRow = U[i];
			AssertMatrixRow(mRow);
			AssertMatrixRow(uRow);

			const mVal = mRow[j];
			AssertMatrixValue(mVal, { rowIndex: i, columnIndex: j });
			uRow[j] = mVal - sum; // U[i,j] = A[i,j] - sum
		}

		// Check for zero pivot after computing the diagonal element
		const uRow = U[i];
		AssertMatrixRow(uRow);

		const uVal = uRow[i]; // Pivot element U[i,i]
		AssertMatrixValue(uVal, { rowIndex: i, columnIndex: i });

		// Fix: Should throw if pivot is too close to zero (singular matrix)
		if (Math.abs(uVal) < MATRIX_NUMERICAL_TOLERANCE) {
			throw new MatrixError('Matrix is singular (zero pivot element)');
		}

		// Compute lower triangular matrix L (column by column)
		for (let j = i + 1; j < n; j++) {
			let sum = 0;

			// Subtract the sum of L[j,k] * U[k,i] for k < i
			for (let k = 0; k < i; k++) {
				const lRowJ = L[j];
				const uRowK = U[k];
				AssertMatrixRow(lRowJ);
				AssertMatrixRow(uRowK);

				const lVal = lRowJ[k];
				AssertMatrixValue(lVal, { rowIndex: j, columnIndex: k });

				const uVal = uRowK[i];
				AssertMatrixValue(uVal, { rowIndex: k, columnIndex: i });
				sum += lVal * uVal;
			}

			const uRow = U[i];
			AssertMatrixRow(uRow);

			const uVal = uRow[i]; // Pivot element U[i,i]
			AssertMatrixValue(uVal, { rowIndex: i, columnIndex: i });

			// Check for zero pivot (singular matrix)
			if (Math.abs(uVal) < MATRIX_NUMERICAL_TOLERANCE) {
				throw new MatrixError('Matrix is singular (zero pivot element)');
			}

			const mRowJ = matrix[j];
			const lRowJ = L[j];
			AssertMatrixRow(mRowJ);
			AssertMatrixRow(lRowJ);

			const mVal = mRowJ[i];
			AssertMatrixValue(mVal, { rowIndex: j, columnIndex: i });
			lRowJ[i] = (mVal - sum) / uVal; // L[j,i] = (A[j,i] - sum) / U[i,i]
		}
	}

	return { L, U };
}
/**
 * Performs QR decomposition A = Q × R using Modified Gram-Schmidt orthogonalization.
 *
 * QR decomposition factors a matrix into the product of an orthogonal matrix Q and
 * an upper triangular matrix R. This decomposition is fundamental for solving
 * overdetermined linear systems, least squares problems, and eigenvalue computations.
 *
 * **Mathematical Background:**
 * - Q is orthogonal: Q^T × Q = I (columns are orthonormal vectors)
 * - R is upper triangular with non-negative diagonal elements
 * - The decomposition always exists for matrices with linearly independent columns
 * - Uses Modified Gram-Schmidt for better numerical stability than Classical Gram-Schmidt
 *
 * **Applications:**
 * - Solving overdetermined systems Ax = b: x = R⁻¹Q^T b
 * - Least squares solutions: minimize ||Ax - b||²
 * - QR algorithm for eigenvalue computation
 * - Orthogonal basis construction from linearly independent vectors
 *
 * @param matrix - Matrix to decompose (m×n where m ≥ n, must have full column rank)
 * @returns Object containing orthogonal Q and upper triangular R matrices
 * @throws {Error} If matrix has more columns than rows or columns are linearly dependent
 *
 * @example
 * ```ts
 * const A = [[1, 1], [1, 0], [0, 1]]; // 3×2 matrix
 * const { Q, R } = MatrixQR(A);
 * // Q: 3×2 orthogonal matrix with Q^T × Q = I₂
 * // R: 2×2 upper triangular matrix
 *
 * // Verify: Q × R should equal A
 * const reconstructed = MatrixMultiply(Q, R);
 * // reconstructed ≈ A
 *
 * // Check orthogonality: Q^T × Q should be identity
 * const QT = MatrixTranspose(Q);
 * const identity = MatrixMultiply(QT, Q);
 * ```
 *
 * @complexity Time: O(mn²), Space: O(mn) where m ≥ n
 * @see {@link MatrixGramSchmidt} {@link MatrixLU} {@link MatrixEigenQRIteration}
 */
export function MatrixQR(matrix: IMatrix, allowDependentColumns = false): TQRDecompositionResult {
	AssertMatrix(matrix);

	const [m, n] = MatrixSize(matrix);

	// Verify that the matrix has at least as many rows as columns
	if (m < n) {
		throw new Error('QR decomposition requires matrix to have at least as many rows as columns');
	}

	const Q = MatrixClone(matrix);
	const R = MatrixCreate(n, n);

	// Modified Gram-Schmidt orthogonalization process
	for (let k = 0; k < n; k++) {
		let norm = 0;

		for (let i = 0; i < m; i++) {
			const qRow = Q[i];
			if (!qRow) continue;
			AssertMatrixRow(qRow);

			const qVal = qRow[k];
			AssertMatrixValue(qVal, { rowIndex: i, columnIndex: k });
			norm += qVal * qVal;
		}
		norm = Math.sqrt(norm);
		if (norm < MATRIX_NUMERICAL_TOLERANCE) {
			if (!allowDependentColumns) {
				throw new Error(`Column ${k} is linearly dependent on previous columns`);
			}
			// Fill Q[:,k] with an orthonormal vector not in the span of previous columns
			const candidate: number[] = Array(m).fill(0);
			candidate[k % m] = 1;

			for (let j = 0; j < k; j++) {
				let dot = 0;

				for (let i = 0; i < m; i++) {
					const qRow = Q[i];
					AssertMatrixRow(qRow);

					const qVal = qRow[j];
					AssertMatrixValue(qVal, { rowIndex: i, columnIndex: j });
					dot += (qVal as number) * (candidate[i] as number);
				}

				for (let i = 0; i < m; i++) {
					const qRow = Q[i];
					AssertMatrixRow(qRow);

					const qVal = qRow[j];
					AssertMatrixValue(qVal, { rowIndex: i, columnIndex: j });

					const candidateVal = candidate[i];
					AssertNumber(candidateVal, {}, { message: `candidate[${i}] Not a Number` });
					candidate[i] = candidateVal - (dot * qVal);
				}
			}

			const candNorm = Math.sqrt(candidate.reduce((sum, v) => sum + (v * v), 0));
			if (candNorm > MATRIX_NUMERICAL_TOLERANCE) {
				for (let i = 0; i < m; i++) {
					const qRow = Q[i];
					if (!Array.isArray(qRow)) throw new Error(`Internal error: Q[${i}] is not an array`);
					qRow[k] = (candidate[i] as number) / candNorm;
				}
			} else {
				for (let i = 0; i < m; i++) {
					const qRow = Q[i];
					if (!Array.isArray(qRow)) throw new Error(`Internal error: Q[${i}] is not an array`);
					qRow[k] = 0;
				}
			}

			const rRow = R[k];
			AssertMatrixRow(rRow);

			for (let j = 0; j < n; j++) {
				rRow[j] = 0;
			}

			continue;
		}
		const rRow = R[k];
		AssertMatrixRow(rRow);
		rRow[k] = norm;

		for (let i = 0; i < m; i++) {
			const qRow = Q[i];
			if (!qRow) continue;
			AssertMatrixRow(qRow);

			const qVal = qRow[k];
			AssertMatrixValue(qVal, { rowIndex: i, columnIndex: k });
			qRow[k] = qVal / norm;
		}

		for (let j = k + 1; j < n; j++) {
			let dot = 0;

			for (let i = 0; i < m; i++) {
				const qRow = Q[i];
				if (!qRow) continue;
				AssertMatrixRow(qRow);

				const qValK = qRow[k];
				const qValJ = qRow[j];
				AssertMatrixValue(qValK, { rowIndex: i, columnIndex: k });
				AssertMatrixValue(qValJ, { rowIndex: i, columnIndex: j });
				dot += qValK * qValJ;
			}
			rRow[j] = dot;

			for (let i = 0; i < m; i++) {
				const qRow = Q[i];
				if (!qRow) continue;
				AssertMatrixRow(qRow);

				const qValK = qRow[k];
				const qValJ = qRow[j];
				AssertMatrixValue(qValK, { rowIndex: i, columnIndex: k });
				AssertMatrixValue(qValJ, { rowIndex: i, columnIndex: j });
				qRow[j] = qValJ - (dot * qValK);
			}
		}
	}

	return { Q, R };
}
/**
 * Performs Singular Value Decomposition (SVD) of a matrix A = U × Σ × V^T.
 *
 * SVD is a generalization of eigendecomposition that works for any matrix (not just square).
 * It decomposes a matrix into three components that reveal fundamental properties about
 * the linear transformation, including its rank, range, and null space.
 *
 * **Mathematical Background:**
 * - U contains the left singular vectors (orthonormal columns)
 * - Σ is diagonal with singular values σᵢ ≥ 0 in descending order
 * - V^T contains the right singular vectors (orthonormal rows)
 * - Singular values are the square roots of eigenvalues of A^T A
 * - The rank of A equals the number of non-zero singular values
 *
 * **Applications:**
 * - Principal Component Analysis (PCA): V gives principal directions
 * - Matrix approximation: truncated SVD for dimensionality reduction
 * - Pseudo-inverse computation: A⁺ = V Σ⁺ U^T
 * - Least squares solutions for overdetermined systems
 * - Image compression and noise reduction
 * - Numerical rank determination
 *
 * **Implementation Notes:**
 * - Uses eigendecomposition of A^T A to find V and singular values
 * - Computes U = A V Σ⁻¹ for the left singular vectors
 * - Applies Gram-Schmidt to ensure orthogonality of U
 * - Handles edge cases for 1×1, single row, and single column matrices
 *
 * @param matrix - Matrix to decompose (any m×n matrix)
 * @returns Object containing U, S (singular values), and VT matrices
 * @throws {Error} If matrix contains invalid values (NaN, Infinity)
 *
 * @example
 * ```ts
 * const A = [[1, 2], [3, 4], [5, 6]]; // 3×2 matrix
 * const { U, S, VT } = MatrixSVD(A);
 * // U: 3×2 matrix with orthonormal columns
 * // S: [σ₁, σ₂] singular values in descending order
 * // VT: 2×2 orthogonal matrix (V transposed)
 *
 * // Verify reconstruction: U × diag(S) × VT ≈ A
 * const Sigma = Matrix_Diagonal(S);
 * const reconstructed = MatrixMultiply(MatrixMultiply(U, Sigma), VT);
 *
 * // Matrix rank from singular values (count non-zero values)
 * const rank = S.filter(s => s > 1e-10).length;
 *
 * // Condition number for stability analysis
 * const conditionNumber = S[0] / S[S.length - 1];
 * ```
 *
 * @complexity Time: O(min(m²n, mn²)), Space: O(m² + n²)
 * @see {@link MatrixQR} {@link MatrixEigenQRIteration} {@link Matrix_PseudoInverse}
 */
export function MatrixSVD(matrix: IMatrix): TSVDDecompositionResult {
	AssertMatrix(matrix);

	const [m, n] = MatrixSize(matrix);

	// Handle trivial case: 1x1 matrix
	if (m === 1 && n === 1) {
		const value = matrix[0]?.[0] ?? 0;

		return {

			U: [[1]],

			S: [Math.abs(value)],

			VT: [[value >= 0 ? 1 : -1]],
		};
	}

	// Handle single row or single column
	if (m === 1 || n === 1) {
		const vec = m === 1 ? matrix[0] ?? [0] : matrix.map((row) => row?.[0] ?? 0);
		const norm = Math.sqrt(vec.reduce((sum, v) => sum + ((v ?? 0) * (v ?? 0)), 0));
		const U = m === 1 ? [[1]] : matrix.map((row) => [(row?.[0] ?? 0) / (norm > 0 ? norm : 1)]);
		const VT = n === 1 ? [[1]] : [(matrix[0] ?? []).map((v) => (v ?? 0) / (norm > 0 ? norm : 1))];

		return {

			U,

			S: [norm],

			VT,
		};
	}

	// General case: m x n matrix
	// Step 1: Compute A^T * A (n x n)
	const AT = MatrixTranspose(matrix);
	const ATA = MatrixMultiply(AT, matrix);

	// Step 2: Eigendecomposition of A^T A
	const { eigenvalues, eigenvectors } = MatrixEigen(ATA);
	const S = Array.isArray(eigenvalues) ? eigenvalues.map((ev: number) => Math.sqrt(Math.max(ev, 0))) : [];
	const indices: number[] = [];
	if (Array.isArray(S)) {
		for (let i = 0; i < S.length; i++) {
			indices.push(i);
		}
		indices.sort((a, b) => (S[b] ?? 0) - (S[a] ?? 0));
	}
	// Defensive: filter out undefined indices and values
	const validIndices: number[] = [];

	for (const idx of indices) {
		if (typeof idx === 'number' && isFinite(idx) && idx >= 0 && idx < eigenvalues.length) {
			validIndices.push(idx);
		}
	}

	const sSorted: number[] = [];
	const V: number[][] = [];

	for (const i of validIndices) {
		sSorted.push(typeof S[i] === 'number' ? S[i] as number : 0);

		const vCol: number[] = [];

		for (const r of eigenvectors) {
			vCol.push(Array.isArray(r) && typeof r[i] === 'number' ? r[i] as number : 0);
		}
		V.push(vCol);
	}

	// vMat: n x n, columns are right singular vectors
	const vMat: IMatrix = [];
	const vColLength = V.length > 0 && Array.isArray(V[0]) ? V[0].length : 0;

	for (let colIdx = 0; colIdx < vColLength; colIdx++) {
		const col: number[] = [];

		for (const row of V) {
			const value = Array.isArray(row) && typeof row[colIdx] === 'number' ? row[colIdx] : 0;
			col.push(typeof value === 'number' ? value : 0);
		}
		vMat.push(col);
	}

	// Step 3: Compute U = AVΣ⁻¹ (m x n)
	const U: IMatrix = MatrixCreate(m, n);

	for (let j = 0; j < n; j++) {
		const sigma = sSorted[j];
		if (sigma && sigma > MATRIX_NUMERICAL_TOLERANCE) {
			// vj as a column vector (n x 1)
			const vjCol: number[][] = [];

			for (const row of vMat) {
				const value = Array.isArray(row) && typeof row[j] === 'number' ? row[j] : 0;
				vjCol.push([typeof value === 'number' ? value : 0]);
			}

			const av = MatrixMultiply(matrix, vjCol); // m x 1

			for (let i = 0; i < m; i++) {
				const uRow = U[i];
				const avRow = av[i];
				if (Array.isArray(uRow) && Array.isArray(avRow)) uRow[j] = (typeof avRow[0] === 'number' ? avRow[0] as number : 0) / sigma;
			}
		} else {
			for (let i = 0; i < m; i++) {
				const uRow = U[i];
				if (Array.isArray(uRow)) uRow[j] = 0;
			}
		}
	}

	// Step 4: Orthonormalize U columns (Gram-Schmidt)
	const uOrtho = MatrixGramSchmidt(U);
	// Step 5: VT is vMat^T (n x n)
	const VT = MatrixTranspose(vMat);

	return {

		U: uOrtho,

		S: sSorted,

		VT,
	};
}
/**
 * Solves the linear system Ax = b for the unknown vector x.
 * Uses LU decomposition internally followed by forward and back substitution.
 *
 * Given an n×n coefficient matrix A and an n-element right-hand side vector b,
 * finds x such that A × x = b.
 *
 * @param a - Square n×n coefficient matrix (must be non-singular)
 * @param b - Right-hand side vector of length n
 * @returns Solution vector x of length n satisfying Ax = b
 * @throws {MatrixError} If A is not square, singular, or b has the wrong length
 *
 * @example
 * // 2x + y = 8
 * // 5x + 3y = 20
 * MatrixSolve([[2, 1], [5, 3]], [8, 20]); // [4, 0]
 *
 * @example
 * // Solve a 3×3 system
 * const A = [[1, 2, -1], [2, 1, 1], [3, -1, 2]];
 * const b = [4, 7, 2];
 * MatrixSolve(A, b); // solution vector x
 */
export function MatrixSolve(a: IMatrix, b: number[]): number[] {
	AssertMatrix(a, { square: true });

	const [n] = MatrixSize(a);

	if (b.length !== n) {
		throw new MatrixError(`Right-hand side vector length (${b.length}) must match matrix dimension (${n})`);
	}

	const { L, U } = MatrixLU(a);

	// Forward substitution: solve Ly = b (L has 1s on its diagonal)
	const y: number[] = new Array(n).fill(0);

	for (let i = 0; i < n; i++) {
		const lRow = L[i];
		AssertMatrixRow(lRow);

		let sum = 0;

		for (let j = 0; j < i; j++) {
			const lVal = lRow[j];
			AssertMatrixValue(lVal);
			sum += lVal * (y[j] as number);
		}

		const bi = b[i];
		if (bi === undefined) throw new MatrixError(`b[${i}] is undefined`);
		y[i] = bi - sum;
	}

	// Back substitution: solve Ux = y
	const x: number[] = new Array(n).fill(0);

	for (let i = n - 1; i >= 0; i--) {
		const uRow = U[i];
		AssertMatrixRow(uRow);

		let sum = 0;

		for (let j = i + 1; j < n; j++) {
			const uVal = uRow[j];
			AssertMatrixValue(uVal);
			sum += uVal * (x[j] as number);
		}

		const uDiag = uRow[i];
		AssertMatrixValue(uDiag);

		if (uDiag === 0) throw new MatrixError('Matrix is singular — cannot solve the linear system');
		x[i] = ((y[i] as number) - sum) / uDiag;
	}

	return x;
}
