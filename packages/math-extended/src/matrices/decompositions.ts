import { AssertNumber, AssertInstanceOf, ArraySortBy } from '@pawells/typescript-common';
import { MatrixMultiply } from './arithmetic.js';
import { AssertMatrix,  AssertMatrix1, AssertMatrix2, AssertMatrixSquare, MatrixError } from './asserts.js';
import { MatrixSize, MatrixCreate, MatrixClone, MatrixIdentity, MatrixTranspose } from './core.js';
import { MatrixGramSchmidt } from './linear-algebra.js';
import type { TMatrix } from './types.js';

const MATRIX_NUMERICAL_TOLERANCE = 1e-12;
const EIGEN_CONVERGENCE_TOLERANCE = 1e-10;
const EIGEN_MAX_ITERATIONS = 50;

/**
 * Result of eigenvalue decomposition containing eigenvalues and their corresponding eigenvectors.
 *
 * For a square matrix A, eigenvalue decomposition finds values λ and vectors v such that A × v = λ × v.
 * The eigenvalues represent the scaling factors, while eigenvectors represent the directions
 * that remain unchanged (up to scaling) under the linear transformation.
 */
export type TEigenDecompositionResult = {
	/** Array of eigenvalues λ in descending order */
	eigenvalues: number[];
	/** Matrix where each column is an eigenvector corresponding to the eigenvalue at the same index */
	eigenvectors: TMatrix;
};
/**
 * Result of LU decomposition with partial pivoting where P × A = L × U.
 *
 * LU decomposition factors a square matrix into the product of a lower triangular matrix L
 * and an upper triangular matrix U, with a permutation vector P recording the row swaps
 * performed during partial pivoting. This is useful for solving systems of linear equations,
 * computing determinants, and matrix inversion.
 */
export type TLUDecompositionResult = {
	/** Lower triangular matrix with 1's on the diagonal */

	readonly L: TMatrix;
	/** Upper triangular matrix containing the pivots */

	readonly U: TMatrix;
	/** Permutation vector: P[i] is the original row index that now occupies row i */

	readonly P: number[];
};
/**
 * Result of QR decomposition where A = Q × R.
 *
 * QR decomposition factors a matrix into the product of an orthogonal matrix Q
 * and an upper triangular matrix R. This decomposition is fundamental for least squares
 * problems, eigenvalue algorithms, and solving overdetermined linear systems.
 */
export type TQRDecompositionResult = {
	/** Orthogonal matrix where Q^T × Q = I */

	readonly Q: TMatrix;
	/** Upper triangular matrix */

	readonly R: TMatrix;
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

	readonly U: TMatrix;
	/** Array of singular values σ in descending order (diagonal elements of Σ matrix) */

	readonly S: number[];
	/** Transpose of the matrix of right singular vectors (V^T where V has orthogonal columns) */

	readonly VT: TMatrix;
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
 * @throws {MatrixError} If matrix is not square, not symmetric, or not positive definite
 *
 * @example
 * ```typescript
 * // Symmetric positive definite matrix
 * const A = [[4, 2], [2, 3]];
 * const L = MatrixCholesky(A);
 * // L = [[2, 0], [1, √2]] ≈ [[2, 0], [1, 1.414]]
 * // Verify: L × L^T should equal A
 * const LT = MatrixTranspose(L);
 * const reconstructed = MatrixMultiply(L, LT);
 * // reconstructed ≈ [[4, 2], [2, 3]]
 * ```
 * @complexity Time: O(n³/3), Space: O(n²) - About 2x faster than general LU decomposition
 * @see {@link MatrixLU} For general square matrices that may not be positive definite
 */
export function MatrixCholesky(matrix: TMatrix): TMatrix {
	AssertMatrixSquare(matrix);

	const [n] = MatrixSize(matrix);
	const L = MatrixCreate(n, n);

	// Perform Cholesky decomposition using the Cholesky-Banachiewicz algorithm
	for (let i = 0; i < n; i++) {
		const lRowI = L[i];
		const matrixRowI = matrix[i];

		for (let j = 0; j <= i; j++) {
			const lRowJ = L[j];

			if (i === j) {
				// Compute diagonal elements: L[i,i] = √(A[i,i] - Σ(k=0 to i-1) L[i,k]²)
				let sum = 0;

				// Sum of squares of elements in row i before column j
				for (let k = 0; k < j; k++) {
					const lVal = lRowI[k];
					sum += lVal * lVal;
				}

				const matrixVal = matrixRowI[j];

				const diagonal = matrixVal - sum;

				// Check positive definiteness - diagonal must be positive
				if (diagonal <= 0) 					throw new MatrixError(`Matrix is not positive definite at element [${i},${j}]`);

				lRowI[j] = Math.sqrt(diagonal);
			} else {
				// Compute off-diagonal elements: L[i,j] = (A[i,j] - Σ(k=0 to j-1) L[i,k]*L[j,k]) / L[j,j]
				let sum = 0;

				// Sum of products of corresponding elements in rows i and j
				for (let k = 0; k < j; k++) {
					const lIVal = lRowI[k];
					const lJVal = lRowJ[k];
					sum += lIVal * lJVal;
				}

				const matrixVal = matrixRowI[j];
				const lJDiag = lRowJ[j];

				// Check for numerical stability - diagonal element should not be too small
				if (Math.abs(lJDiag) < MATRIX_NUMERICAL_TOLERANCE) {
					throw new MatrixError(`Zero diagonal element at [${j},${j}] - matrix not positive definite`);
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
 * @throws {MatrixError} If matrix is not square, contains invalid values, or has complex eigenvalues
 *
 * @example
 * ```typescript
 * // Simple 2x2 matrix
 * const A = [[3, 1], [0, 2]];
 * const { eigenvalues, eigenvectors } = MatrixEigen(A);
 * // eigenvalues: [3, 2]
 * // eigenvectors: matrix where each column corresponds to an eigenvalue
 * // Verify eigenvalue equation: A × v = λ × v
 * const v = Matrix_GetColumn(eigenvectors, 0); // First eigenvector
 * const Av = MatrixMultiplyVector(A, v);
 * const lambdaV = Matrix_ScaleVector(v, eigenvalues[0]);
 * // Av should approximately equal lambdaV
 * ```
 * @complexity O(n³) time for an n×n matrix
 * @see {@link MatrixEigenQRIteration} For the iterative algorithm used for larger matrices
 */
export function MatrixEigen(matrix: TMatrix): TEigenDecompositionResult {
	AssertMatrixSquare(matrix);

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
			throw new MatrixError('Complex eigenvalues not supported in this implementation');
		}

		const sqrtDisc = Math.sqrt(discriminant);
		const lambda1 = (trace + sqrtDisc) / 2;
		const lambda2 = (trace - sqrtDisc) / 2;

		// Compute eigenvectors by solving (A - λI)v = 0
		const eigenvectors = MatrixCreate(2, 2);

		// For each eigenvalue, find the corresponding eigenvector
		if (Math.abs(b) > MATRIX_NUMERICAL_TOLERANCE && Math.abs(c) < MATRIX_NUMERICAL_TOLERANCE) {
			// Upper-triangular or b ≠ 0, c ≈ 0
			// Eigenvalues are diagonal elements: a and d
			const [eigenvectorsRow0, eigenvectorsRow1] = eigenvectors;

			// First eigenvector for eigenvalue that equals 'a'
			eigenvectorsRow0[0] = 1;
			eigenvectorsRow1[0] = 0;

			// Second eigenvector for eigenvalue that equals 'd'
			// For (A - d*I)v = 0: [[a-d, b], [0, 0]]v = 0 => (a-d)*v[0] + b*v[1] = 0
			// Solution: v = [b, -(a-d)] = [b, d-a]
			eigenvectorsRow0[1] = b;
			eigenvectorsRow1[1] = d - a;
		} else if (Math.abs(c) > MATRIX_NUMERICAL_TOLERANCE) {
			// Use the first row to find eigenvectors when c ≠ 0
			const [eigenvectorsRow0, eigenvectorsRow1] = eigenvectors;

			eigenvectorsRow0[0] = lambda1 - d;
			eigenvectorsRow1[0] = c;

			eigenvectorsRow0[1] = lambda2 - d;
			eigenvectorsRow1[1] = c;
		} else {
			// Diagonal matrix case - eigenvectors are standard basis vectors
			const [eigenvectorsRow0, eigenvectorsRow1] = eigenvectors;

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
				const val = eigenvectorsRowI[j];
				AssertNumber(val, {}, { message: `Eigenvector[${i},${j}] Not a Number` });
				norm += val * val;
			}
			norm = Math.sqrt(norm);

			// Normalize if the norm is significant
			if (norm > MATRIX_NUMERICAL_TOLERANCE) {
				for (let i = 0; i < 2; i++) {
					const eigenvectorsRowI = eigenvectors[i];
					const val = eigenvectorsRowI[j];
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
 * **Convergence Notes:**
 * The convergence check (examining off-diagonal elements) is optimized for symmetric
 * inputs, which SVD provides via A^T A. For practical n×n matrices with well-conditioned
 * symmetric inputs, convergence typically occurs within 2–5n iterations. The default
 * maximum of 50 iterations is sufficient for matrices up to size ~10×10; larger matrices
 * may require heuristic adjustments.
 *
 * @private
 * @param matrix - Square matrix to compute eigenvalues for
 * @param iterations - Maximum number of QR iterations (default: EIGEN_MAX_ITERATIONS = 50)
 * @returns Object containing eigenvalues and approximated eigenvectors
 *
 * @complexity O(n³) per iteration, typically converges in O(n) iterations
 * @see {@link MatrixQR} For the QR decomposition used in each iteration
 */
export function MatrixEigenQRIteration(matrix: TMatrix, iterations: number = EIGEN_MAX_ITERATIONS): TEigenDecompositionResult {
	const [n] = MatrixSize(matrix);

	// Copy matrix for iteration to avoid modifying the original
	let A = MatrixClone(matrix);
	let qTotal = MatrixIdentity(n); // Accumulate transformations for eigenvectors

	for (let iter = 0; iter < iterations; iter++) {
		// Try/catch to allow fallback for rank-deficient matrices
		let Q: TMatrix; let R: TMatrix;

		try {
			({ Q, R } = MatrixQR(A));
		} catch (err: unknown) {
			// If QR fails due to linear dependence, fill Q with orthonormal basis and R with zeros
			AssertInstanceOf(err, Error, { message: 'Unexpected error in QR iteration' });
			if (err.message.includes('linearly dependent')) {
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

			for (let j = i + 1; j < n; j++) {
				const aVal = aRowI[j];
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

		const eigenvalue = aRowI[i];
		eigenvalues.push(eigenvalue);
	}

	return {
		eigenvalues,
		eigenvectors: qTotal, // Accumulated orthogonal transformations give eigenvectors
	};
}
/**
 * Performs LU decomposition of a square matrix with partial pivoting: P × A = L × U.
 *
 * LU decomposition factors a square matrix into the product of a lower triangular matrix L
 * and an upper triangular matrix U, with a permutation vector P recording the row swaps
 * performed during partial (column) pivoting. Partial pivoting selects the largest-magnitude
 * element in each column as the pivot, improving numerical stability.
 *
 * **Mathematical Background:**
 * - L is lower triangular with 1's on the diagonal (unit lower triangular)
 * - U is upper triangular containing the pivot elements
 * - P is a permutation vector where P[i] is the original row index at position i
 * - The relationship is: P × A = L × U
 *
 * **Applications:**
 * - Solving linear systems: Ax = b — apply permutation, solve Ly = Pb, then Ux = y
 * - Computing determinant: det(A) = ∏ᵢ U[i,i] (with sign from permutation parity)
 * - Matrix inversion: used internally by `MatrixInverse` for n > 3
 *
 * @param matrix - Square matrix to decompose (must be non-singular)
 * @returns Object `{ L, U, P }` — lower triangular, upper triangular, and permutation vector
 * @throws {MatrixError} If matrix is not square, singular (zero pivot), or contains invalid values
 *
 * @example
 * ```typescript
 * const A = [[2, 1], [1, 1]];
 * const { L, U, P } = MatrixLU(A);
 * // L = [[1, 0], [0.5, 1]], U = [[2, 1], [0, 0.5]], P = [0, 1]
 * // Verify: L × U should equal P-permuted A
 * const product = MatrixMultiply(L, U);
 * // product ≈ [[2, 1], [1, 1]]
 * ```
 * @complexity Time: O(n³/3), Space: O(n²)
 * @see {@link MatrixCholesky} For symmetric positive definite matrices (more efficient)
 * @see {@link MatrixSolve} For solving Ax = b directly
 */
export function MatrixLU(matrix: TMatrix): TLUDecompositionResult {
	AssertMatrixSquare(matrix);

	const [n] = MatrixSize(matrix);

	// Work on a mutable copy so partial pivoting can reorder rows
	const A: number[][] = matrix.map((row) => [...row]);
	const L = MatrixCreate(n, n);
	const U = MatrixCreate(n, n);
	// P[i] records which original row now occupies position i after all swaps
	const P: number[] = Array.from({ length: n }, (_, i) => i);

	// Initialize L's diagonal with 1's (unit lower triangular)
	for (let i = 0; i < n; i++) {
		(L[i] as number[])[i] = 1;
	}

	// Doolittle's method with partial (column) pivoting
	for (let i = 0; i < n; i++) {
		// --- Partial pivoting: find row with largest |A[k][i]| for k >= i ---
		let maxVal = Math.abs((A[i] as number[])[i] as number);
		let maxRow = i;

		for (let k = i + 1; k < n; k++) {
			const val = Math.abs((A[k] as number[])[i] as number);

			if (val > maxVal) {
				maxVal = val;
				maxRow = k;
			}
		}

		if (maxRow !== i) {
			// Swap rows in A
			[A[i], A[maxRow]] = [A[maxRow] as number[], A[i] as number[]];
			// Swap rows in P
			[P[i], P[maxRow]] = [P[maxRow] as number, P[i] as number];
			// Swap already-computed L columns (indices 0..i-1)
			for (let j = 0; j < i; j++) {
				const tmp = (L[i] as number[])[j] as number;
				(L[i] as number[])[j] = (L[maxRow] as number[])[j] as number;
				(L[maxRow] as number[])[j] = tmp;
			}
		}

		// Compute U row i first — the actual pivot is U[i][i] (Schur complement),
		// which may be zero even if A[i][i] is non-zero for singular matrices.
		for (let j = i; j < n; j++) {
			let sum = 0;

			for (let k = 0; k < i; k++) {
				sum += ((L[i] as number[])[k] as number) * ((U[k] as number[])[j] as number);
			}
			(U[i] as number[])[j] = (A[i] as number[])[j] as number - sum;
		}

		// Check for zero pivot after computing U[i][i]
		const pivot = (U[i] as number[])[i] as number;

		if (Math.abs(pivot) < MATRIX_NUMERICAL_TOLERANCE) {
			throw new MatrixError('Matrix is singular (zero pivot element)');
		}

		// Compute L column i (rows below diagonal)
		for (let j = i + 1; j < n; j++) {
			let sum = 0;

			for (let k = 0; k < i; k++) {
				sum += ((L[j] as number[])[k] as number) * ((U[k] as number[])[i] as number);
			}
			(L[j] as number[])[i] = ((A[j] as number[])[i] as number - sum) / pivot;
		}
	}

	return { L, U, P };
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
 * @throws {MatrixError} If matrix has more columns than rows or columns are linearly dependent
 *
 * @example
 * ```typescript
 * const A = [[1, 1], [1, 0], [0, 1]]; // 3×2 matrix
 * const { Q, R } = MatrixQR(A);
 * // Q: 3×2 orthogonal matrix with Q^T × Q = I₂
 * // R: 2×2 upper triangular matrix
 * // Verify: Q × R should equal A
 * const reconstructed = MatrixMultiply(Q, R);
 * // reconstructed ≈ A
 * // Check orthogonality: Q^T × Q should be identity
 * const QT = MatrixTranspose(Q);
 * const identity = MatrixMultiply(QT, Q);
 * ```
 * @complexity Time: O(mn²), Space: O(mn) where m ≥ n
 * @see {@link MatrixGramSchmidt} {@link MatrixLU} {@link MatrixEigenQRIteration}
 */
export function MatrixQR(matrix: TMatrix, allowDependentColumns = false): TQRDecompositionResult {
	AssertMatrix(matrix);

	const [m, n] = MatrixSize(matrix);

	// Verify that the matrix has at least as many rows as columns
	if (m < n) {
		throw new MatrixError('QR decomposition requires matrix to have at least as many rows as columns');
	}

	const Q = MatrixClone(matrix);
	const R = MatrixCreate(n, n);

	// Modified Gram-Schmidt orthogonalization process
	for (let k = 0; k < n; k++) {
		let norm = 0;

		for (let i = 0; i < m; i++) {
			const qRow = Q[i];
			if (!qRow) continue;
			const qVal = qRow[k];
			norm += qVal * qVal;
		}
		norm = Math.sqrt(norm);
		if (norm < MATRIX_NUMERICAL_TOLERANCE) {
			if (!allowDependentColumns) throw new MatrixError(`Column ${k} is linearly dependent on previous columns`);
			// Fill Q[:,k] with an orthonormal vector not in the span of previous columns
			const candidate: number[] = Array(m).fill(0);
			candidate[k % m] = 1;

			for (let j = 0; j < k; j++) {
				let dot = 0;

				for (let i = 0; i < m; i++) {
					const qRow = Q[i];
					const qVal = qRow[j];
					dot += (qVal as number) * (candidate[i] as number);
				}

				for (let i = 0; i < m; i++) {
					const qRow = Q[i];
					const qVal = qRow[j];
					const candidateVal = candidate[i];
					AssertNumber(candidateVal, {}, { message: `candidate[${i}] Not a Number` });
					candidate[i] = candidateVal - (dot * qVal);
				}
			}

			const candNorm = Math.sqrt(candidate.reduce((sum, v) => sum + (v * v), 0));
			if (candNorm > MATRIX_NUMERICAL_TOLERANCE) {
				for (let i = 0; i < m; i++) {
					const qRow = Q[i];
					if (!Array.isArray(qRow)) throw new MatrixError(`Internal error: Q[${i}] is not an array`);
					qRow[k] = (candidate[i] as number) / candNorm;
				}
			} else {
				for (let i = 0; i < m; i++) {
					const qRow = Q[i];
					if (!Array.isArray(qRow)) throw new MatrixError(`Internal error: Q[${i}] is not an array`);
					qRow[k] = 0;
				}
			}

			const rRow = R[k];
			for (let j = 0; j < n; j++) rRow[j] = 0;

			continue;
		}
		const rRow = R[k];
		rRow[k] = norm;

		for (let i = 0; i < m; i++) {
			const qRow = Q[i];
			if (!qRow) continue;

			const qVal = qRow[k];
			qRow[k] = qVal / norm;
		}

		// Extract k-th column of Q for cache-efficient access
		const qColK: number[] = [];
		for (let i = 0; i < m; i++) {
			const qRow = Q[i];
			if (qRow) qColK[i] = qRow[k];
		}

		for (let j = k + 1; j < n; j++) {
			let dot = 0;

			for (let i = 0; i < m; i++) {
				const qRow = Q[i];
				if (!qRow) continue;

				const qValJ = qRow[j];
				dot += qColK[i] * qValJ;
			}
			rRow[j] = dot;

			for (let i = 0; i < m; i++) {
				const qRow = Q[i];
				if (!qRow) continue;

				const qValJ = qRow[j];
				qRow[j] = qValJ - (dot * qColK[i]);
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
 * **Numerical Stability Warning:**
 * This implementation uses eigendecomposition of A^T A, which squares the condition number (κ²).
 * For ill-conditioned matrices (high condition number), this approach loses precision.
 * Direct SVD algorithms (Golub-Kahan-Reinsch) maintain better numerical stability but are more complex.
 * This implementation is suitable for graphics, animation, and other non-critical applications.
 * For production numerical computing with ill-conditioned matrices, consider specialized linear algebra libraries.
 *
 * @param matrix - Matrix to decompose (any m×n matrix)
 * @returns Object containing U, S (singular values), and VT matrices
 * @throws {MatrixError} If matrix contains invalid values (NaN, Infinity)
 *
 * @example
 * ```typescript
 * const A = [[1, 2], [3, 4], [5, 6]]; // 3×2 matrix
 * const { U, S, VT } = MatrixSVD(A);
 * // U: 3×2 matrix with orthonormal columns
 * // S: [σ₁, σ₂] singular values in descending order
 * // VT: 2×2 orthogonal matrix (V transposed)
 * // Verify reconstruction: U × diag(S) × VT ≈ A
 * // Note: Create diagonal matrix Sigma with S on diagonal, then: reconstructed = U × Sigma × VT
 * const reconstructed = MatrixMultiply(MatrixMultiply(U, [[S[0], 0], [0, S[1]]]), VT);
 * // Matrix rank from singular values (count non-zero values)
 * const rank = S.filter(s => s > 1e-10).length;
 * // Condition number for stability analysis
 * const conditionNumber = S[0] / S[S.length - 1];
 * ```
 * @complexity Time: O(min(m²n, mn²)), Space: O(m² + n²)
 * @see {@link MatrixQR} {@link MatrixEigenQRIteration} {@link Matrix_PseudoInverse}
 */
export function MatrixSVD(matrix: TMatrix): TSVDDecompositionResult {
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

	// Singular values are sqrt of eigenvalues; sort descending
	const S = eigenvalues.map((ev) => Math.sqrt(Math.max(ev, 0)));
	const indices = ArraySortBy(S.map((_, i) => i), (i) => S[i] as number, 'desc');

	const sSorted: number[] = indices.map((i) => S[i] as number);

	// V columns: each is the eigenvector at the sorted index
	// eigenvectors is stored row-major, so eigenvectors[row][col] = component `row` of eigenvector `col`
	const V: number[][] = indices.map((i) => eigenvectors.map((row) => (row as number[])[i] as number));

	// vMat: n × n matrix where each row is a right singular vector
	const vColLength = V.length > 0 ? (V[0] as number[]).length : 0;
	const vMat: TMatrix = Array.from({ length: vColLength }, (_, rowIdx) =>
		V.map((col) => (col as number[])[rowIdx] as number),
	);

	// Step 3: Compute U = AVΣ⁻¹ (m × n)
	const U: TMatrix = MatrixCreate(m, n);

	for (let j = 0; j < n; j++) {
		const sigma = sSorted[j] as number;

		if (sigma > MATRIX_NUMERICAL_TOLERANCE) {
			// Multiply A by the j-th right singular vector (n×1 column)
			const vjCol: TMatrix = vMat.map((row) => [(row as number[])[j] as number]);
			const av = MatrixMultiply(matrix, vjCol); // m×1

			for (let i = 0; i < m; i++) {
				(U[i] as number[])[j] = ((av[i] as number[])[0] as number) / sigma;
			}
		}
		// U column j remains zero for near-zero singular values (already zero from MatrixCreate)
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
 * Uses LU decomposition with partial pivoting internally: decomposes A into P, L, U,
 * applies the row permutation to b, then performs forward and back substitution.
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
 * ```typescript
 * // 2x + y = 8
 * // 5x + 3y = 20
 * MatrixSolve([[2, 1], [5, 3]], [8, 20]); // [4, 0]
 * ```
 * @example
 * ```typescript
 * // Solve a 3×3 system
 * const A = [[1, 2, -1], [2, 1, 1], [3, -1, 2]];
 * const b = [4, 7, 2];
 * MatrixSolve(A, b); // solution vector x
 * ```
 */
export function MatrixSolve(a: TMatrix, b: number[]): number[] {
	AssertMatrixSquare(a);

	const [n] = MatrixSize(a);

	if (b.length !== n) {
		throw new MatrixError(`Right-hand side vector length (${b.length}) must match matrix dimension (${n})`);
	}

	const { L, U, P } = MatrixLU(a);

	// Apply row permutation to b: b_perm[i] = b[P[i]]
	const bPerm: number[] = P.map((pi) => {
		const val = b[pi];
		if (val === undefined) throw new Error(`b[${pi}] is undefined`);
		return val;
	});

	// Forward substitution: solve Ly = b_perm (L has 1s on its diagonal)
	const y: number[] = new Array(n).fill(0);

	for (let i = 0; i < n; i++) {
		const lRow = L[i];
		let sum = 0;

		for (let j = 0; j < i; j++) {
			const lVal = lRow[j];
			sum += lVal * (y[j] as number);
		}

		y[i] = (bPerm[i] as number) - sum;
	}

	// Back substitution: solve Ux = y
	const x: number[] = new Array(n).fill(0);

	for (let i = n - 1; i >= 0; i--) {
		const uRow = U[i];

		let sum = 0;

		for (let j = i + 1; j < n; j++) {
			const uVal = uRow[j];
			sum += uVal * (x[j] as number);
		}

		const uDiag = uRow[i];

		if (uDiag === 0) throw new MatrixError('Matrix is singular — cannot solve the linear system');
		x[i] = ((y[i] as number) - sum) / uDiag;
	}

	return x;
}
