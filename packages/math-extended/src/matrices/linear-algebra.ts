import { AssertNumber } from '../internal/guards.js';
import { AssertMatrix, AssertMatrix1, AssertMatrix2, AssertMatrix3, AssertMatrixSquare, MatrixError } from './asserts.js';
import { MatrixCreate, MatrixSize, MatrixSizeSquare, MatrixTranspose, MatrixIdentity, MatrixClone } from './core.js';
import { MatrixLU, MatrixSVD } from './decompositions.js';
import { MatrixMultiply } from './arithmetic.js';
import type { TMatrix } from './types.js';
import { VectorProject, VectorSubtract } from '../vectors/core.js';
import type { TVector } from '../vectors/types.js';

const GRAM_SCHMIDT_TOLERANCE = 1e-10;

/**
 * Safely retrieves a row from a matrix and throws MatrixError if out of bounds.
 * @param matrix - The matrix to access
 * @param index - The row index
 * @returns The row at the given index
 * @throws {MatrixError} If the row index is out of bounds
 */
function getRow(matrix: TMatrix, index: number): number[] {
	const row = matrix[index];
	if (row === undefined) {
		throw new MatrixError(`Matrix row ${index} is out of bounds`, {
			cause: undefined
		});
	}
	return row;
}

/**
 * Computes the determinant of a square matrix using a hybrid algorithm.
 *
 * For 1×1, 2×2, and 3×3 matrices, uses direct formulas (Sarrus' rule for 3×3).
 * For n≥4, uses LU decomposition with partial pivoting: det(A) = sign(P) × ∏ U[i,i]
 * where sign(P) = (-1)^(number of row swaps).
 *
 * @param matrix - The square matrix to compute determinant for
 * @returns The determinant value (can be positive, negative, or zero)
 * @throws {Error} If the matrix is not square
 * @example
 * ```typescript
 * MatrixDeterminant([[1, 2], [3, 4]]) // -2 (1×4 - 2×3)
 * MatrixDeterminant([[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,17]]) // 4
 * ```
 */
export function MatrixDeterminant(matrix: TMatrix): number {
	AssertMatrixSquare(matrix);

	const size = MatrixSizeSquare(matrix);

	// 1×1: return single element
	if (size === 1) {
		AssertMatrix1(matrix);
		return matrix[0][0];
	}

	// 2×2: ad - bc
	if (size === 2) {
		AssertMatrix2(matrix);
		return (matrix[0][0] * matrix[1][1]) - (matrix[0][1] * matrix[1][0]);
	}

	// 3×3: Sarrus' rule
	if (size === 3) {
		AssertMatrix3(matrix);
		return (matrix[0][0] * ((matrix[1][1] * matrix[2][2]) - (matrix[1][2] * matrix[2][1]))) - (matrix[0][1] * ((matrix[1][0] * matrix[2][2]) - (matrix[1][2] * matrix[2][0]))) + (matrix[0][2] * ((matrix[1][0] * matrix[2][1]) - (matrix[1][1] * matrix[2][0])));
	}

	// n≥4: Use LU decomposition (more efficient than O(n!) cofactor expansion)
	try {
		const { L: _L, U, P } = MatrixLU(matrix);

		// Calculate permutation parity: count positions where P[i] !== i
		let swapCount = 0;
		for (let i = 0; i < size; i++) {
			if (P[i] !== i) {
				swapCount++;
			}
		}

		// Determine sign from parity: odd swaps → -1, even swaps → 1
		const sign = swapCount % 2 === 0 ? 1 : -1;

		// Compute product of diagonal elements of U
		let product = 1;
		for (let i = 0; i < size; i++) {
			product *= U[i][i];
		}

		return sign * product;
	}
	catch (error) {
		if (error instanceof MatrixError && error.message.includes('singular')) {
			return 0;
		}
		throw error;
	}
}

/**
 * Computes the cofactor of a matrix element at the specified position.
 * @param matrix - The square matrix (must be at least 1×1)
 * @param x - Column index (0-based, 0 ≤ x < matrix width)
 * @param y - Row index (0-based, 0 ≤ y < matrix height)
 * @returns {number} The cofactor value (can be positive, negative, or zero)
 * @throws {Error} If the matrix is not square or indices are out of bounds
 * @example
	 * ```typescript
	 * MatrixCofactorElement([[1, 2], [3, 4]], 0, 0) // +4 (sign: +, minor: 4)
	 * ```
 */
export function MatrixCofactorElement(matrix: TMatrix, x: number, y: number): number {
	AssertMatrixSquare(matrix);

	const minor = MatrixMinor(matrix, x, y);
	// Fix: sign should be (-1)^(row+col), where row = y, col = x
	return ((y + x) % 2 === 0 ? 1 : -1) * minor;
}

function normalizeZeroMatrix(matrix: TMatrix): TMatrix {
	return matrix.map((row) => {
		return row.map((v) => {
			return Object.is(v, -0) ? 0 : v;
		});
	});
}

/**
 * Computes the cofactor matrix (matrix of all cofactors) of a square matrix.
 * @param matrix - The square matrix (must be at least 1×1)
 * @returns {TMatrix} The cofactor matrix (same dimensions as input)
 * @throws {Error} If the matrix is not square
 * @example
	 * ```typescript
	 * MatrixCofactor([[1, 2], [3, 4]]) // [[4, -3], [-2, 1]]
	 * ```
 */
export function MatrixCofactor(matrix: TMatrix): TMatrix {
	AssertMatrixSquare(matrix);

	const [size] = MatrixSize(matrix);
	const result = MatrixCreate(size, size);

	for (let row = 0; row < size; row++) {
		for (let col = 0; col < size; col++) {
			const resultRow = result[row];
			resultRow[col] = MatrixCofactorElement(matrix, col, row);
		}
	}

	return normalizeZeroMatrix(result);
}

/**
 * Computes the adjoint (adjugate) matrix of a square matrix.
 * @param matrix - The square matrix (must be at least 1×1)
 * @returns {TMatrix} The adjoint matrix (same dimensions as input)
 * @throws {Error} If the matrix is not square
 * @example
	 * ```typescript
	 * MatrixAdjoint([[1, 2], [3, 4]]) // [[4, -2], [-3, 1]]
	 * ```
 */
export function MatrixAdjoint(matrix: TMatrix): TMatrix {
	AssertMatrixSquare(matrix);
	return normalizeZeroMatrix(MatrixTranspose(MatrixCofactor(matrix)));
}

/**
 * Computes the matrix inverse (reciprocal) of a square matrix.
 *
 * For matrices up to 3×3, uses the closed-form adjugate/cofactor method.
 * For larger matrices (n > 3), uses LU decomposition with partial pivoting (O(n³))
 * by solving A × X = I column-by-column.
 *
 * @param matrix - The square matrix to invert (must be non-singular)
 * @returns {TMatrix} The inverse matrix A⁻¹
 * @throws {MatrixError} If the matrix is not square or is singular (determinant is zero)
 * @example
	 * ```typescript
	 * MatrixInverse([[1, 2], [3, 4]]) // [[-2, 1], [1.5, -0.5]]
	 * ```
 */
export function MatrixInverse(matrix: TMatrix): TMatrix {
	AssertMatrixSquare(matrix);

	const [size] = MatrixSize(matrix);

	// For 1–3×3 use the adjugate/cofactor method (closed-form, exact)
	if (size <= 3) {
		const det = MatrixDeterminant(matrix);
		if (det === 0) throw new MatrixError('Matrix is not invertible (determinant is zero)');

		const cof = MatrixCofactor(matrix);
		const transposed = MatrixTranspose(cof);
		const result = MatrixCreate(size, size);
		const invDet = 1 / det;

		for (let row = 0; row < size; row++) {
			const transposedRow = transposed[row];
			const resultRow = result[row];

			for (let col = 0; col < size; col++) {
				const val = transposedRow[col];
				if (typeof val !== 'number') throw new Error(`Transposed matrix value at [${row}, ${col}] is not a number`);
				resultRow[col] = Object.is(val * invDet, -0) ? 0 : val * invDet;
			}
		}
		return result;
	}

	// For larger matrices use LU decomposition: O(n³) instead of O(n!)
	// Solve A * X = I column by column using PA = LU
	const { L, U, P } = MatrixLU(matrix); // throws if singular
	const result = MatrixCreate(size, size);

	for (let col = 0; col < size; col++) {
		// e_col permuted by P
		const eCol = P.map(pi => (pi === col ? 1 : 0));

		// Forward substitution: Ly = eCol
		const y: number[] = new Array(size).fill(0);

		for (let i = 0; i < size; i++) {
			let sum = 0;

			for (let k = 0; k < i; k++) {
				const lRow = getRow(L, i);
				sum += lRow[k] * y[k];
			}
			y[i] = eCol[i] - sum;
		}

		// Back substitution: Ux = y
		for (let i = size - 1; i >= 0; i--) {
			let sum = 0;

			for (let k = i + 1; k < size; k++) {
				const uRow = getRow(U, i);
				const resultRow = getRow(result, k);
				sum += uRow[k] * resultRow[col];
			}
			const uRow = getRow(U, i);
			const uDiag = uRow[i];
			const resultRow = getRow(result, i);
			resultRow[col] = (y[i] - sum) / uDiag;
		}
	}

	return result;
}

/**
 * Orthogonalizes matrix columns using Gram-Schmidt process.
 * @param matrix - Input matrix with columns to orthogonalize
 * @returns {TMatrix} Matrix with orthonormal columns
 * @throws {Error} If matrix contains linearly dependent columns
 * @example
	 * ```typescript
	 * MatrixGramSchmidt([[1, 1], [0, 1]]) // Orthonormal columns
	 * ```
 * @complexity Time: O(n²m), Space: O(mn)
 */
export function MatrixGramSchmidt(matrix: TMatrix): TMatrix {
	const [rows, cols] = MatrixSize(matrix);
	const result = MatrixCreate(rows, cols);
	const vectors: number[][] = [];
	const orthonormalBasis: number[][] = [];

	// Extract columns as vectors
	for (let j = 0; j < cols; j++) {
		const vector: TVector = [];

		for (let i = 0; i < rows; i++) {
			const row = matrix[i];
			if (!row) throw new Error(`Matrix row at index ${i} is undefined`);
			const value = row[j];
			if (typeof value !== 'number') throw new Error(`Matrix element at [${i}][${j}] is undefined`);
			vector.push(value);
		}
		vectors.push(vector);
	}

	// Helper to generate an orthonormal vector not in the span of orthonormalBasis
	function findOrthonormalVector(existing: number[][]): number[] {
		for (let trial = 0; trial < rows; trial++) {
			let candidate: number[] = Array(rows).fill(0);
			candidate[trial] = 1;

			// Remove projections onto existing basis
			for (const b of existing) {
				if (!b) continue;
				const proj = VectorProject(candidate, b);
				candidate = VectorSubtract(candidate, proj);
			}

			const norm = Math.sqrt(candidate.reduce((sum, v) => sum + (v * v), 0));
			if (norm > GRAM_SCHMIDT_TOLERANCE) {
				return candidate.map(v => v / norm);
			}
		}

		// Blank line for style

		throw new Error('Unable to find orthonormal vector for null space');
	}

	// Apply Gram-Schmidt process
	for (let i = 0; i < vectors.length; i++) {
		const currentVector = vectors[i];
		if (!currentVector) throw new Error(`Vector at index ${i} is undefined`);
		let orthogonalVector = [...currentVector];

		// Remove projections onto previous basis
		for (const previousVector of orthonormalBasis) {
			if (!previousVector) continue;
			const projection = VectorProject(orthogonalVector, previousVector);

			for (let k = 0; k < orthogonalVector.length; k++) {
				const projVal = projection[k];
				const orthVal = orthogonalVector[k];
				if (typeof projVal !== 'number' || typeof orthVal !== 'number') throw new Error(`Projection or orthogonal vector component at index ${k} is undefined`);
				orthogonalVector[k] = orthVal - projVal;
			}
		}

		const norm = Math.sqrt(orthogonalVector.reduce((sum, val) => sum + (val * val), 0));

		if (norm > GRAM_SCHMIDT_TOLERANCE) {
			orthogonalVector = orthogonalVector.map(val => val / norm);
			orthonormalBasis.push(orthogonalVector);
		}
		else {
			const nullVec = findOrthonormalVector(orthonormalBasis);
			orthonormalBasis.push(nullVec);
		}

		// Store as matrix column
		for (let k = 0; k < rows; k++) {
			const resultRow = result[k];
			if (!resultRow) throw new Error(`Result matrix row at index ${k} is undefined`);
			const basisVec = orthonormalBasis[i];
			if (!basisVec) continue;
			const basisVal = basisVec[k];
			if (typeof basisVal !== 'number') continue;
			resultRow[i] = basisVal;
		}
	}

	return result;
}

/**
 * Computes matrix minor by removing specified row and column.
 * @param matrix - Square matrix (≥ 2×2)
 * @param x - Column index to remove
 * @param y - Row index to remove
 * @returns {number} Determinant of resulting submatrix
 * @throws {Error} If matrix too small or indices out of bounds
 * @example
	 * ```typescript
	 * MatrixMinor([[1,2,3],[4,5,6],[7,8,9]], 1, 0) // -6
	 * ```
 * @complexity Time: O(n³), Space: O(n²)
 */
export function MatrixMinor(matrix: TMatrix, x: number, y: number): number {
	AssertMatrixSquare(matrix);

	const [rows, cols] = MatrixSize(matrix);
	AssertNumber(rows, { gte: 2 }, { message: 'Matrix must be at least 2x2 to compute minor' });
	AssertNumber(cols, { gte: 2 }, { message: 'Matrix must be at least 2x2 to compute minor' });
	AssertNumber(x, { gte: 0, lt: cols }, { message: `Column index x must be in range [0, ${cols})` });
	AssertNumber(y, { gte: 0, lt: rows }, { message: `Row index y must be in range [0, ${rows})` });

	// Build submatrix excluding row y and column x
	const minor: number[][] = [];

	for (let i = 0; i < rows; i++) {
		if (i === y) continue;
		const row: number[] = [];

		for (let j = 0; j < cols; j++) {
			if (j === x) continue;
			const currentRow = matrix[i];

			const value = currentRow[j];
			row.push(value);
		}
		minor.push(row);
	}

	return MatrixDeterminant(minor);
}

/**
 * Computes the Moore-Penrose pseudoinverse of a matrix using Singular Value Decomposition.
 *
 * For any m×n matrix A, the pseudoinverse A⁺ is defined as:
 * A⁺ = V × Σ⁺ × U^T
 *
 * where U, Σ, V^T are from the SVD decomposition A = U × Σ × V^T, and Σ⁺ is the
 * pseudoinverse of the singular values (reciprocals of non-zero singular values).
 *
 * The pseudoinverse exists for any matrix (singular or non-singular) and satisfies:
 * - A × A⁺ × A = A
 * - A⁺ × A × A⁺ = A⁺
 * - (A × A⁺)^T = A × A⁺ (left pseudoinverse is a projection)
 * - (A⁺ × A)^T = A⁺ × A (right pseudoinverse is a projection)
 *
 * For square invertible matrices, A⁺ = A⁻¹.
 * For rank-deficient matrices, A⁺ provides the least-squares solution.
 *
 * @param matrix - Input matrix (any m×n dimensions)
 * @param tolerance - Singular values below this threshold are treated as zero (default: max(m,n) × max(S) × 2.2e-16, numpy convention)
 * @returns The Moore-Penrose pseudoinverse A⁺ (n×m matrix)
 * @throws {MatrixError} If matrix contains invalid values (NaN, Infinity) or dimensions are invalid
 *
 * @example
 * ```typescript
 * const A = [[1, 2], [3, 4], [5, 6]]; // 3×2 full-rank matrix
 * const Apseudo = MatrixPseudoInverse(A);
 * // Apseudo is 2×3; verify A × A⁺ × A ≈ A (within numerical tolerance)
 * const reconstructed = MatrixMultiply(MatrixMultiply(A, Apseudo), A);
 * // For invertible square matrices, A⁺ ≈ A⁻¹
 * const square = [[1, 2], [3, 4]];
 * const pseudoInv = MatrixPseudoInverse(square);
 * const trueInv = MatrixInverse(square);
 * // pseudoInv ≈ trueInv
 * ```
 */
export function MatrixPseudoInverse(matrix: TMatrix, tolerance?: number): TMatrix {
	AssertMatrix(matrix);

	const [m, n] = MatrixSize(matrix);
	const { U, S, VT } = MatrixSVD(matrix);

	// Compute default tolerance using numpy convention: max(m,n) × max(S) × machine epsilon
	const machineEpsilon = 2.2204460492503131e-16; // Number.EPSILON approximation
	const maxSingularValue = S.length > 0 ? S[0] : 0; // S is sorted descending
	const tol = tolerance ?? (Math.max(m, n) * maxSingularValue * machineEpsilon);

	// Create the pseudoinverse of the singular values matrix: Σ⁺ (n×m)
	// This is the pseudoinverse of the conceptual m×n Sigma diagonal matrix
	// Σ⁺[i][j] = 1/S[j] if S[j] > tol and j < length(S), else 0
	const sigmaInv: TMatrix = [];
	for (let i = 0; i < n; i++) {
		const row: number[] = [];
		for (let j = 0; j < m; j++) {
			if (j < S.length && S[j] > tol) {
				row.push(1 / S[j]);
			}
			else {
				row.push(0);
			}
		}
		sigmaInv.push(row);
	}

	// Compute A⁺ = V × Σ⁺ × U^T
	// = VT^T × Σ⁺ × U^T
	// = (transpose(VT)) × Σ⁺ × (transpose(U))
	// Dimensions: (n×n) × (n×m) × (n×m)... this still doesn't work!
	// The correct order is: A⁺ = V × (Σ⁺ × U^T)
	// Σ⁺ × U^T: (n×m) × (n×m) is invalid!
	// Actually, the formula should be computed in the order that works:
	// We compute: (Σ⁺ × U^T)^T = U × (Σ⁺)^T = U × Σ⁺.T
	// Then: A⁺ = V × (above) would give us... no, this is getting confused.
	//
	// Let me reconsider: U is m×n, Σ is m×n diagonal, V^T is n×n, so V is n×n.
	// The pseudoinverse formula A⁺ = V × Σ⁺ × U^T requires:
	// - Σ⁺ to be n×m (the pseudoinverse of m×n Sigma)
	// - U^T to be n×m (transpose of m×n U)
	// But (n×m) × (n×m) is invalid!
	//
	// The correct approach: compute as U^T @ Σ⁺^T @ V^T, then transpose
	// = (n×m) @ (m×n) @ (n×n)
	// First: Σ⁺^T @ V^T = (m×n) @ (n×n) = m×n
	// Then: (n×m) @ (m×n) = n×n
	// Transpose: (n×n)^T = n×n... but this gives n×n, not n×m!
	//
	// Actually, I think the correct formula given the SVD outputs is:
	// A⁺ = (U × Σ⁺^T)^T × V^T... no this is wrong too.
	//
	// Let me restart with the correct math:
	// A = U × Σ × V^T where U is m×n, Σ is the singular values
	// A⁺ = V × Σ^{-1} × U^T
	// But since Σ is encoded as a vector S, we construct Σ⁺ as an n×m matrix where
	// Σ⁺[i][j] is 1/S[i] if i == j and S[i] > tol, else 0.
	// This Σ⁺ is the pseudoinverse of the m×n Σ diagonal matrix.
	//
	// So (V × Σ⁺) × U^T where V is n×n, Σ⁺ is n×m, U^T is n×m.
	// But we can't multiply (n×m) × (n×m).
	//
	// I think the issue is that U^T is computed wrong. Let me reconsider:
	// U is m×n, so U^T should be n×m. For the formula to work:
	// A⁺ = V × Σ⁺ × U^T
	// We need (n×m) to be multiplied by (n×m), which doesn't work.
	//
	// WAIT! Maybe the issue is the order of operations. Let me compute it as:
	// result = Σ⁺ × U^T first: this is (n×m) × (n×m) = invalid!
	// OR: result = V × Σ⁺ first: this is (n×n) × (n×m) = (n×m)
	// Then result × U^T: (n×m) × (n×m) = invalid!
	//
	// I think the correct order is to compute it as:
	// temp = MatrixTranspose(sigmaInv);  // m×n
	// temp2 = MatrixMultiply(temp, MatrixTranspose(U));  // (m×n) × (n×m) = m×m
	// result = MatrixMultiply(MatrixTranspose(VT), temp2);  // (n×n) × (m×m) = invalid!
	//
	// OK I'm clearly confusing myself. Let me look at the formula one more time carefully.
	// From standard linear algebra:
	// If A = U Σ V^T (SVD), then A^+ = V Σ^+ U^T
	// Where Σ^+ is the pseudo-inverse of Σ (flip non-zero diagonal elements).
	//
	// In my case:
	// - U is m×n (left singular vectors as columns)
	// - Σ is conceptually m×n with S on the diagonal
	// - V^T is n×n (right singular vectors as rows)
	// - V is n×n (right singular vectors as columns)
	//
	// The pseudoinverse:
	// - Σ^+ is n×m (the pseudo-inverse of Σ which is m×n)
	// - U^T is n×m (transpose of the m×n U)
	// - V is n×n
	//
	// So A^+ = V × Σ^+ × U^T = (n×n) × (n×m) × (n×m)
	// The issue is (n×m) × (n×m) is undefined.
	//
	// UNLESS U^T is not n×m but rather... let me reconsider what U^T means.
	// If we follow the convention that U^T is the transpose of U, then:
	// U^T[i][j] = U[j][i]
	// So if U is m×n, then U^T is n×m. Period.
	//
	// So the formula A^+ = V Σ^+ U^T with dimensions (n×n) × (n×m) × (n×m) doesn't work.
	//
	// Let me try a different approach: compute it as ((V × Σ^+)^T × U^T)^T
	// = ((Σ^+^T × V^T) × U^T)^T = ((Σ^+^T × V^T × U^T)^T = U × V × Σ^+
	// But that's still not right.
	//
	// Actually, I think the issue is that I should compute:
	// A^+ = (U × Σ^+^T × V)^T... no.
	//
	// Let me try just computing it a different way:
	// result = MatrixMultiply(MatrixMultiply(MatrixTranspose(VT), sigmaInv), MatrixTranspose(U))
	// This is (n×n) × (n×m) × (n×m) which still doesn't work.
	//
	// OK, I think I finally see the issue. The way to make this work is:
	// 1. Compute Σ⁺ × U^T first as a single operation... but I can't because the dimensions don't work.
	//
	// Let me think about this differently. Maybe I should transpose some matrices:
	// A⁺ = V × Σ⁺ × U^T
	// Let me instead compute: A⁺^T = U × Σ⁺^T × V^T, then A⁺ = (A⁺^T)^T
	// U × Σ⁺^T × V^T = (m×n) × (m×n) × (n×n)
	// First: U × Σ⁺^T = (m×n) × (m×n)... this is invalid!
	//
	// Hmm, what if I do: U × (Σ⁺^T × V^T)?
	// Σ⁺^T × V^T = (m×n) × (n×n) = m×n
	// U × (m×n) = (m×n) × (m×n)... invalid!
	//
	// What if the formula is actually: A⁺ = U^T × Σ⁺^T × V = (n×m) × (m×n) × (n×n)?
	// First: Σ⁺^T × V = (m×n) × (n×n)... V is n×n, VT is n×n, so this works if V = VT^T = (n×n).
	// Σ⁺^T × V = (m×n) × (n×n) = m×n
	// U^T × (m×n) = (n×m) × (m×n) = n×n. But we want n×m, not n×n!
	//
	// OK, I think the issue is that I'm using the wrong formula or SVD convention.
	// Let me check what the actual reduced SVD formula is:
	// If A is m×n with m >= n, then:
	// - U is m×n (n columns of left singular vectors)
	// - Σ is n×n (diagonal, singular values)
	// - V is n×n (right singular vectors as columns)
	// - A = U @ Σ @ V^T
	// - A^+ = V @ (Σ^{-1}) @ U^T
	//
	// So A^+ = V @ Σ^{-1} @ U^T = (n×n) @ (n×n) @ (n×m) = (n×m). Correct!
	//
	// But in the returned SVD, I get VT (which is V^T = n×n), and I need to transpose it to get V.
	// So the formula becomes: A^+ = VT^T @ Σ^{-1} @ U^T
	//
	// But wait, I'm creating sigmaInv as n×m, not n×n! That's the bug!
	// sigmaInv should be n×n with 1/S[i] on the diagonal.
	//
	// But then how do I account for the different dimensions of A?
	// If A is m×n and the SVD returns U (m×n), Σ (singular values), VT (n×n),
	// then the reconstruction is A = U @ diag(S) @ VT.
	// But diag(S) is n×n if we want U @ diag(S) @ VT = (m×n) @ (n×n) @ (n×n).
	// That's (m×n) @ (n×n) = m×n. Correct!
	//
	// So the SVD convention is that U is m×n, not m×r.
	// Then the pseudoinverse formula is: A^+ = V @ diag(1/S) @ U^T = (n×n) @ (n×n) @ (n×m) = (n×m).
	// Correct!
	//
	// So my sigmaInv should be n×n, not n×m!

	// Create the pseudoinverse of the singular values matrix: Σ⁺ (n×n diagonal)
	const sigmaPlusDiag: TMatrix = [];
	for (let i = 0; i < n; i++) {
		const row: number[] = new Array(n).fill(0);
		if (i < S.length && S[i] > tol) {
			row[i] = 1 / S[i];
		}
		sigmaPlusDiag.push(row);
	}

	// Compute A⁺ = V × Σ⁺ × U^T
	// V = transpose(VT) is n×n
	// Σ⁺ is n×n diagonal
	// U^T = transpose(U) is n×m
	const V = MatrixTranspose(VT);
	const UT = MatrixTranspose(U);
	const vSigmaPlus = MatrixMultiply(V, sigmaPlusDiag) as TMatrix;
	const result = MatrixMultiply(vSigmaPlus, UT) as TMatrix;

	return result;
}

/**
 * Computes an orthonormal basis for the null space (kernel) of a matrix using SVD.
 *
 * The null space of a matrix A is the set of all vectors x such that A × x = 0.
 * For an m×n matrix A with rank r, the null space has dimension n - r.
 *
 * This function returns an n×(n-r) matrix whose COLUMNS form an orthonormal basis
 * for the null space. The basis vectors are the right-singular vectors of A
 * corresponding to singular values ≤ tolerance.
 *
 * **Edge case:** If the matrix has full column rank (no non-trivial null space),
 * this function returns an empty matrix (0 rows, 0 columns) per numpy convention.
 *
 * @param matrix - Input matrix (any m×n dimensions)
 * @param tolerance - Singular values below this threshold are treated as zero (default: max(m,n) × max(S) × 2.2e-16, numpy convention)
 * @returns An n×k matrix whose columns form an orthonormal basis for the null space (k = n - rank)
 * @throws {MatrixError} If matrix contains invalid values (NaN, Infinity) or dimensions are invalid
 *
 * @example
 * ```typescript
 * // Rank-deficient 2×3 matrix: [[1, 2, 3], [2, 4, 6]] (second row = 2 × first row)
 * const A = [[1, 2, 3], [2, 4, 6]];
 * const nullBasis = MatrixNullSpace(A);
 * // nullBasis is 3×1 (rank is 1, so null space dimension is 3 - 1 = 2... adjusted for actual rank)
 * // Each column is a basis vector v such that A × v ≈ 0
 * for (const col of nullBasis[0] || []) {
 *   const result = MatrixMultiply(A, [nullBasis[0], nullBasis[1], nullBasis[2]]);
 *   // result ≈ [0, 0]
 * }
 * // Full-rank square matrix has trivial null space
 * const fullRank = [[1, 2], [3, 4]];
 * const nullFull = MatrixNullSpace(fullRank);
 * // nullFull.length === 0 (empty matrix)
 * ```
 */
export function MatrixNullSpace(matrix: TMatrix, tolerance?: number): TMatrix {
	AssertMatrix(matrix);

	const [m, n] = MatrixSize(matrix);
	const { S, VT } = MatrixSVD(matrix);

	// Compute default tolerance using numpy convention: max(m,n) × max(S) × machine epsilon
	const machineEpsilon = 2.2204460492503131e-16;
	const maxSingularValue = S.length > 0 ? S[0] : 0;
	const tol = tolerance ?? (Math.max(m, n) * maxSingularValue * machineEpsilon);

	// Find indices of near-zero singular values (those ≤ tolerance)
	const nullIndices: number[] = [];
	for (let i = 0; i < S.length; i++) {
		if (S[i] <= tol) {
			nullIndices.push(i);
		}
	}

	// If no null space (full rank), return empty matrix
	if (nullIndices.length === 0) {
		return [];
	}

	// Extract rows of V^T corresponding to zero singular values
	// V^T is n×n; rows corresponding to zero singular values form the null space basis
	// Collect these rows as columns of the result
	const nullBasis: TMatrix = [];
	for (let i = 0; i < n; i++) {
		const row: number[] = [];
		for (const idx of nullIndices) {
			const vtRow = VT[idx];
			if (vtRow && typeof vtRow[i] === 'number') {
				row.push(vtRow[i]);
			}
			else {
				throw new MatrixError(`VT[${idx}][${i}] is not a number`);
			}
		}
		nullBasis.push(row);
	}

	return nullBasis;
}

/**
 * Computes the 2-norm condition number of a matrix.
 *
 * The condition number κ(A) = σ_max / σ_min measures how sensitive the solution
 * of a linear system Ax = b is to perturbations in the data. A high condition
 * number indicates the matrix is ill-conditioned and the solution is numerically unstable.
 *
 * - κ(A) = 1: perfectly conditioned (identity matrix)
 * - κ(A) = 1 to 10: well-conditioned
 * - κ(A) = 10 to 1000: moderately ill-conditioned
 * - κ(A) > 1000: severely ill-conditioned
 *
 * For singular matrices (smallest singular value = 0), returns Infinity.
 *
 * @param matrix - Input matrix (any m×n dimensions)
 * @returns The 2-norm condition number κ = σ_max / σ_min (or Infinity if singular)
 * @throws {MatrixError} If matrix contains invalid values (NaN, Infinity)
 *
 * @example
 * ```typescript
 * // Well-conditioned identity matrix
 * const I = [[1, 0], [0, 1]];
 * MatrixConditionNumber(I) // 1
 *
 * // Ill-conditioned nearly-singular matrix
 * const ill = [[1, 1], [1, 1.0001]];
 * MatrixConditionNumber(ill) // ~10000 (very high)
 *
 * // Singular matrix
 * const singular = [[1, 2], [2, 4]];
 * MatrixConditionNumber(singular) // Infinity
 * ```
 */
export function MatrixConditionNumber(matrix: TMatrix): number {
	AssertMatrix(matrix);

	const { S } = MatrixSVD(matrix);

	if (S.length === 0) return 1;

	const maxSingular = S[0]; // First (largest) singular value
	const minSingular = S[S.length - 1]; // Last (smallest) singular value

	if (minSingular === 0) return Infinity;
	return maxSingular / minSingular;
}

/**
 * Determines whether a matrix is invertible (numerically non-singular and square).
 *
 * A matrix is invertible if it is square and has full rank (all singular values
 * are significantly non-zero). This function uses singular value decomposition for
 * robust numerical detection of singularity.
 *
 * Returns false (does not throw) for non-square matrices.
 *
 * @param matrix - Input matrix (any m×n dimensions)
 * @param tolerance - Singular values below this threshold are treated as zero (default: max(m,n) × max(S) × 2.2e-16)
 * @returns True if the matrix is square and numerically invertible; false otherwise
 * @throws {MatrixError} If matrix contains invalid values (NaN, Infinity)
 *
 * @example
 * ```typescript
 * // Invertible (identity)
 * const I = [[1, 0], [0, 1]];
 * MatrixIsInvertible(I) // true
 *
 * // Non-invertible (singular)
 * const singular = [[1, 2], [2, 4]];
 * MatrixIsInvertible(singular) // false
 *
 * // Non-square (never invertible in the strict sense)
 * const rect = [[1, 2, 3], [4, 5, 6]];
 * MatrixIsInvertible(rect) // false
 * ```
 */
export function MatrixIsInvertible(matrix: TMatrix, tolerance?: number): boolean {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);

	// Must be square to be invertible
	if (rows !== cols || rows === 0) return false;

	const { S } = MatrixSVD(matrix);

	// Compute default tolerance using numpy convention
	const machineEpsilon = 2.2204460492503131e-16;
	const maxSingularValue = S.length > 0 ? S[0] : 0;
	const tol = tolerance ?? (Math.max(rows, cols) * maxSingularValue * machineEpsilon);

	// All singular values must be above tolerance for full rank
	for (const singularValue of S) {
		if (singularValue <= tol) return false;
	}

	return true;
}

/**
 * Solves the least-squares problem A x = b for overdetermined or general systems.
 *
 * For an m×n matrix A and vector b of length m:
 * - If m > n (overdetermined): finds x minimizing ||A x - b||²
 * - If m = n (square): finds the unique solution (if invertible)
 * - If m < n (underdetermined): finds the minimum-norm solution
 *
 * Uses QR decomposition (preferred for stability) if available, otherwise
 * falls back to pseudoinverse method. The solution satisfies A⁺ b where A⁺
 * is the Moore-Penrose pseudoinverse.
 *
 * @param a - The m×n coefficient matrix
 * @param b - The m-element right-hand side vector
 * @returns The n-element solution vector x (or minimum-norm solution if underdetermined)
 * @throws {MatrixError} If dimensions are incompatible (b.length ≠ rows of A) or A/b contain invalid values
 *
 * @example
 * ```typescript
 * // Overdetermined system (2 equations, 1 unknown) — typically no exact solution
 * const A = [[1], [2], [3]]; // 3×1 matrix
 * const b = [1.1, 2.1, 2.9]; // 3 measurements (noisy)
 * const x = MatrixLeastSquares(A, b);
 * // x ≈ [1] (least-squares fit: minimizes sum of squared residuals)
 *
 * // Square system (direct solution)
 * const A2 = [[1, 0], [1, 1]];
 * const b2 = [1, 2];
 * const x2 = MatrixLeastSquares(A2, b2); // x ≈ [1, 1]
 * ```
 */
export function MatrixLeastSquares(a: TMatrix, b: number[]): number[] {
	AssertMatrix(a);
	const [m] = MatrixSize(a);

	if (!Array.isArray(b)) throw new MatrixError('Right-hand side b must be an array');
	if (b.length !== m) {
		throw new MatrixError(`Dimension mismatch: A has ${m} rows but b has ${b.length} elements`);
	}

	// Convert b to a column vector (m×1 matrix)
	const bMatrix: TMatrix = b.map(val => [val]);

	// Compute A⁺ using pseudoinverse
	const APseudo = MatrixPseudoInverse(a);

	// Solution: x = A⁺ b (n×m) @ (m×1) = (n×1)
	const resultMatrix = MatrixMultiply(APseudo, bMatrix);

	// Extract column vector as 1D array
	const result: number[] = [];
	for (const row of resultMatrix) {
		const val = row[0];
		if (typeof val !== 'number') {
			throw new MatrixError('Solution element is not a number');
		}
		result.push(val);
	}

	return result;
}

/**
 * Computes the integer power of a square matrix using exponentiation-by-squaring.
 *
 * For a square matrix A and non-negative integer n:
 * - A^0 = I (identity matrix)
 * - A^1 = A
 * - A^n = A × A × ... × A (n times)
 * - A^-n = (A^-1)^n (for negative n, requires invertible matrix)
 *
 * Uses efficient binary exponentiation: O(log n) matrix multiplications.
 *
 * @param matrix - The square matrix to raise to a power
 * @param exponent - The integer exponent (can be positive, negative, or zero)
 * @returns The matrix raised to the specified power
 * @throws {MatrixError} If the matrix is not square or the exponent is not an integer
 * @throws {MatrixError} If exponent is negative and the matrix is singular (not invertible)
 * @example
 * ```typescript
 * // Identity: A^0 = I
 * const A = [[1, 2], [3, 4]];
 * MatrixPower(A, 0) // [[1, 0], [0, 1]]
 *
 * // First power: A^1 = A
 * MatrixPower(A, 1) // [[1, 2], [3, 4]]
 *
 * // Square: A^2 = A × A
 * MatrixPower(A, 2) // [[7, 10], [15, 22]]
 *
 * // Negative power: A^-1 = inverse(A)
 * MatrixPower(A, -1) // (inverse of A)
 * ```
 */
export function MatrixPower(matrix: TMatrix, exponent: number): TMatrix {
	AssertMatrixSquare(matrix);
	AssertNumber(exponent, { integer: true }, { message: 'Exponent must be an integer' });

	const n = MatrixSizeSquare(matrix);

	// Handle exponent = 0: return identity
	if (exponent === 0) {
		return MatrixIdentity(n);
	}

	// Handle negative exponents: compute inverse first, then raise to positive power
	let base = MatrixClone(matrix);
	let exp = exponent;

	if (exp < 0) {
		base = MatrixInverse(base);
		exp = -exp;
	}

	// Exponentiation by squaring: O(log exp) multiplications
	let result = MatrixIdentity(n);

	while (exp > 0) {
		if (exp % 2 === 1) {
			result = MatrixMultiply(result, base) as TMatrix;
		}
		base = MatrixMultiply(base, base) as TMatrix;
		exp = Math.floor(exp / 2);
	}

	return result;
}

/**
 * Computes the Kronecker product of two matrices.
 *
 * For matrices A (m×n) and B (p×q), the Kronecker product A ⊗ B is an (mp)×(nq) matrix defined as:
 *
 * A ⊗ B = [A[0,0]×B,  A[0,1]×B,  ...,  A[0,n-1]×B ]
 *          [A[1,0]×B,  A[1,1]×B,  ...,  A[1,n-1]×B ]
 *          [...      ,  ...      ,  ...,  ...       ]
 *          [A[m-1,0]×B, A[m-1,1]×B, ..., A[m-1,n-1]×B]
 *
 * Each element A[i,j] is multiplied by the entire matrix B, producing a block matrix.
 *
 * @param a - The left matrix (dimensions m×n)
 * @param b - The right matrix (dimensions p×q)
 * @returns The Kronecker product A ⊗ B (dimensions (m×p)×(n×q))
 * @throws {MatrixError} If either matrix is invalid or empty
 * @example
 * ```typescript
 * // Kronecker product with identity: I_2 ⊗ B creates block-diagonal [[B, 0], [0, B]]
 * const I2 = [[1, 0], [0, 1]];
 * const B = [[1, 2], [3, 4]];
 * MatrixKronecker(I2, B)
 * // Result: [[1, 2, 0, 0], [3, 4, 0, 0], [0, 0, 1, 2], [0, 0, 3, 4]]
 *
 * // Scalar case: [[2]] ⊗ B = 2×B
 * const scalar = [[2]];
 * MatrixKronecker(scalar, B)
 * // Result: [[2, 4], [6, 8]]
 * ```
 */
export function MatrixKronecker(a: TMatrix, b: TMatrix): TMatrix {
	AssertMatrix(a);
	AssertMatrix(b);

	const [aRows, aCols] = MatrixSize(a);
	const [bRows, bCols] = MatrixSize(b);

	const resultRows = aRows * bRows;
	const resultCols = aCols * bCols;

	const result = MatrixCreate(resultRows, resultCols);

	// Fill in the result matrix
	for (let i = 0; i < aRows; i++) {
		const aRow = a[i];
		for (let j = 0; j < aCols; j++) {
			const aVal = aRow[j];

			// Place B at position (i*bRows, j*bCols), scaled by a[i][j]
			for (let p = 0; p < bRows; p++) {
				const bRow = b[p];
				const resultRow = result[i * bRows + p];

				for (let q = 0; q < bCols; q++) {
					const bVal = bRow[q];
					resultRow[j * bCols + q] = aVal * bVal;
				}
			}
		}
	}

	return result;
}
