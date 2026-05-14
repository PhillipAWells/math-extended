import { AssertNumber } from '@pawells/typescript-common';
import { AssertMatrix1, AssertMatrix2, AssertMatrix3, AssertMatrixSquare } from './asserts.js';
import { MatrixCreate, MatrixSize, MatrixSizeSquare, MatrixTranspose } from './core.js';
import { MatrixLU } from './decompositions.js';
import type { TMatrix } from './types.js';
import { VectorProject, VectorSubtract } from '../vectors/core.js';
import type { TVector } from '../vectors/types.js';

const GRAM_SCHMIDT_TOLERANCE = 1e-10;

/**
 * Computes the determinant of a square matrix.
 * @param matrix - The square matrix to compute determinant for
 * @returns {number} The determinant value (can be positive, negative, or zero)
 * @throws {Error} If the matrix is not square
 * @example
	 * ```typescript
	 * MatrixDeterminant([[1, 2], [3, 4]]) // -2 (1×4 - 2×3)
	 * ```
 */
/**
 * Computes the determinant of a square matrix using a hybrid algorithm.
 *
 * For 1×1, 2×2, and 3×3 matrices, uses direct formulas (Sarrus' rule for 3×3).
 * For n≥4, uses LU decomposition with partial pivoting: det(A) = sign(P) × ∏ U[i,i]
 * where sign(P) = (-1)^(number of row swaps).
 *
 * @param matrix - The square matrix to compute determinant for
 * @returns {number} The determinant value (can be positive, negative, or zero)
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
	} catch {
		// Singular matrix (zero pivot): determinant is 0
		return 0;
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
		if (det === 0) throw new Error('Matrix is not invertible (determinant is zero)');

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
		const eCol = P.map((pi) => (pi === col ? 1 : 0));

		// Forward substitution: Ly = eCol
		const y: number[] = new Array(size).fill(0);

		for (let i = 0; i < size; i++) {
			let sum = 0;

			for (let k = 0; k < i; k++) {
				sum += ((L[i] as number[])[k] as number) * (y[k] as number);
			}
			y[i] = (eCol[i] as number) - sum;
		}

		// Back substitution: Ux = y
		for (let i = size - 1; i >= 0; i--) {
			let sum = 0;

			for (let k = i + 1; k < size; k++) {
				sum += ((U[i] as number[])[k] as number) * ((result[k] as number[])[col] as number);
			}
			const uDiag = (U[i] as number[])[i] as number;
			(result[i] as number[])[col] = ((y[i] as number) - sum) / uDiag;
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
				return candidate.map((v) => v / norm);
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
				if (typeof projection[k] !== 'number' || typeof orthogonalVector[k] !== 'number') throw new Error(`Projection or orthogonal vector component at index ${k} is undefined`);
				// Defensive: if undefined, skip
				if (projection[k] === undefined || orthogonalVector[k] === undefined) continue;
				orthogonalVector[k] = (orthogonalVector[k] as number) - (projection[k] as number);
			}
		}

		const norm = Math.sqrt(orthogonalVector.reduce((sum, val) => sum + (val * val), 0));

		if (norm > GRAM_SCHMIDT_TOLERANCE) {
			orthogonalVector = orthogonalVector.map((val) => val / norm);
			orthonormalBasis.push(orthogonalVector);
		} else {
			const nullVec = findOrthonormalVector(orthonormalBasis);
			orthonormalBasis.push(nullVec);
		}

		// Store as matrix column
		for (let k = 0; k < rows; k++) {
			const resultRow = result[k];
			if (!resultRow) throw new Error(`Result matrix row at index ${k} is undefined`);
			const basisVec = orthonormalBasis[i];
			if (!basisVec || typeof basisVec[k] !== 'number') continue;
			resultRow[i] = basisVec[k] as number;
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
