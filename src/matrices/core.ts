import { AssertNumber } from '@pawells/typescript-common';
import { AssertMatrix, AssertMatrixRow, AssertMatrixValue } from './asserts.js';
import { IMatrix, IMatrix1, IMatrix2, IMatrix3, IMatrix4, TMatrixResult } from './types.js';

// Function overloads for specific matrix types

export function MatrixCreate(): IMatrix1;

export function MatrixCreate(size: 1): IMatrix1;

export function MatrixCreate(size: 2): IMatrix2;

export function MatrixCreate(size: 3): IMatrix3;

export function MatrixCreate(size: 4): IMatrix4;

export function MatrixCreate(size: number): IMatrix;

export function MatrixCreate(rows: number, cols: number): IMatrix;

/**
 * Creates a matrix with specified dimensions, initialized with zeros.
 * @param rows - Number of rows (non-negative integer). If only this parameter is provided, creates a square matrix.
 * @param cols - Number of columns (non-negative integer). Optional for square matrices.
 * @returns {IMatrix | IMatrix1 | IMatrix2 | IMatrix3 | IMatrix4} Zero-filled matrix with specified dimensions
 * @throws {Error} If rows or cols are negative or not integers
 * @example MatrixCreate() // [[0]] (1x1 matrix)
 * @example MatrixCreate(2) // [[0, 0], [0, 0]] (2x2 matrix)
 * @example MatrixCreate(2, 3) // [[0, 0, 0], [0, 0, 0]] (2x3 matrix)
 */
export function MatrixCreate(rows?: number, cols?: number): IMatrix | IMatrix1 | IMatrix2 | IMatrix3 | IMatrix4 {
	// Handle no parameters - default to 1x1
	if (rows === undefined) {
		return [[0]] as IMatrix1;
	}

	// Handle single parameter - create square matrix
	if (cols === undefined) {
		// Return specific types for common square matrices
		switch (rows) {
			case 1:
				return [[0]] as IMatrix1;
			case 2:
				return [
					[0, 0],
					[0, 0],
				] as IMatrix2;
			case 3:
				return [
					[0, 0, 0],
					[0, 0, 0],
					[0, 0, 0],
				] as IMatrix3;
			case 4:
				return [
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[0, 0, 0, 0],
					[0, 0, 0, 0],
				] as IMatrix4;
		}
	}

	// Validate parameters
	const effectiveCols = cols ?? rows;
	AssertNumber(rows, { integer: true, gte: 0 }, { message: 'Rows must be a non-negative integer' });
	AssertNumber(effectiveCols, { integer: true, gte: 0 }, { message: 'Columns must be a non-negative integer' });

	const result: number[][] = [];

	// Create each row filled with zeros
	for (let i = 0; i < rows; i++) {
		result.push(new Array(effectiveCols).fill(0));
	}

	return result;
}

/**
 * Returns the dimensions of a matrix as [rows, columns].
 * @param matrix - The matrix to measure
 * @returns {[number, number]} Tuple [rows, columns]. Returns [0, 0] for empty matrices.
 * @throws {Error} If the input is not a valid matrix
 * @example MatrixSize([[1, 2, 3], [4, 5, 6]]) // [2, 3]
 */
export function MatrixSize(matrix: IMatrix): [number, number] {
	// Basic validation without calling AssertMatrix to avoid circular dependency
	if (!Array.isArray(matrix)) {
		throw new Error('Input must be an array');
	}

	// Handle empty matrix or matrix with no columns
	if (matrix.length === 0 || !Array.isArray(matrix[0])) return [0, 0];
	return [matrix.length, matrix[0]?.length ?? 0];
}

/**
 * Returns the size of a square matrix (number of rows/columns).
 * @param matrix - The square matrix to measure
 * @returns {number} The size (n for an n×n matrix)
 * @throws {Error} If the matrix is not square
 * @example MatrixSizeSquare([[1, 2], [3, 4]]) // 2
 */
export function MatrixSizeSquare(matrix: IMatrix): number {
	AssertMatrix(matrix, { square: true });

	const [rows] = MatrixSize(matrix);
	return rows;
}

/**
 * Validates that the input is a well-formed matrix.
 * @param matrix - The value to validate as a matrix
 * @returns {boolean} True if the input is a valid matrix, false otherwise
 * @example MatrixIsValid([[1, 2], [3, 4]]) // true
 * @example MatrixIsValid([[1, 'invalid'], [3, 4]]) // false
 */
export function MatrixIsValid(matrix: unknown): boolean {
	try {
		AssertMatrix(matrix);
		return true;
	} catch {
		return false;
	}
}

/**
 * Checks if a matrix is square (equal number of rows and columns).
 * @param matrix - The matrix to check
 * @returns {boolean} True if the matrix is square, false otherwise
 * @example MatrixIsSquare([[1, 2], [3, 4]]) // true (2×2)
 * @example MatrixIsSquare([[1, 2, 3], [4, 5, 6]]) // false (3×2)
 */
export function MatrixIsSquare(matrix: IMatrix): boolean {
	try {
		MatrixSizeSquare(matrix);
		return true;
	} catch {
		return false;
	}
}

/**
 * Checks if a matrix is a zero matrix (all elements are zero within tolerance).
 * @param matrix - The matrix to check
 * @param threshold - Tolerance for considering values as zero (default: 1e-14)
 * @returns {boolean} True if all matrix elements are within threshold of zero
 * @throws {Error} If the input is not a valid matrix
 * @example MatrixIsZero([[0, 0], [0, 0]]) // true
 * @example MatrixIsZero([[1e-15, 0], [0, 0]]) // true (within default threshold)
 * @example MatrixIsZero([[0.1, 0], [0, 0]]) // false
 */
export function MatrixIsZero(matrix: IMatrix, threshold: number = 1e-14): boolean {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	if (rows === 0 || cols === 0) return true; // Empty matrix is considered zero
	for (let row = 0; row < rows; row++) {
		const matrixRow = matrix[row];
		AssertMatrixRow(matrixRow, { rowIndex: row });

		for (let col = 0; col < cols; col++) {
			const value = matrixRow[col];
			AssertMatrixValue(value, { rowIndex: row, columnIndex: col });

			if (Math.abs(value) > threshold) {
				return false; // Found a non-zero value
			}
		}
	}

	return true; // All values are within the threshold
}

/**
 * Checks if a matrix is an identity matrix (1s on the main diagonal, 0s elsewhere).
 * @param matrix - The matrix to check
 * @param threshold - Tolerance for floating-point comparisons (default: 1e-14)
 * @returns {boolean} True if the matrix is an identity matrix within tolerance
 * @throws {Error} If the input is not a valid matrix
 * @example MatrixIsIdentity([[1, 0], [0, 1]]) // true
 * @example MatrixIsIdentity([[1, 0, 0], [0, 1, 0], [0, 0, 1]]) // true
 * @example MatrixIsIdentity([[1, 1], [0, 1]]) // false
 */
export function MatrixIsIdentity(matrix: IMatrix, threshold: number = 1e-14): boolean {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	if (rows !== cols) return false; // Identity must be square

	for (let row = 0; row < rows; row++) {
		const matrixRow = matrix[row];
		AssertMatrixRow(matrixRow, { rowIndex: row });

		for (let col = 0; col < cols; col++) {
			const value = matrixRow[col];
			AssertMatrixValue(value, { rowIndex: row, columnIndex: col });

			const expected = row === col ? 1 : 0;
			if (Math.abs(value - expected) > threshold) return false;
		}
	}

	return true;
}

/**
 * Checks if a matrix is symmetric (A = Aᵀ, i.e. A[i][j] === A[j][i] for all i, j).
 * @param matrix - The matrix to check (must be square)
 * @param threshold - Tolerance for floating-point comparisons (default: 1e-14)
 * @returns {boolean} True if the matrix is symmetric within tolerance
 * @throws {Error} If the input is not a valid matrix
 * @example MatrixIsSymmetric([[1, 2], [2, 1]]) // true
 * @example MatrixIsSymmetric([[1, 2], [3, 4]]) // false
 * @example MatrixIsSymmetric([[1, 2, 3], [2, 5, 4], [3, 4, 6]]) // true
 */
export function MatrixIsSymmetric(matrix: IMatrix, threshold: number = 1e-14): boolean {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	if (rows !== cols) return false; // Symmetry requires a square matrix

	for (let row = 0; row < rows; row++) {
		const matrixRow = matrix[row];
		AssertMatrixRow(matrixRow, { rowIndex: row });

		for (let col = row + 1; col < cols; col++) {
			const upper = matrixRow[col];
			AssertMatrixValue(upper, { rowIndex: row, columnIndex: col });

			const lowerRow = matrix[col];
			AssertMatrixRow(lowerRow, { rowIndex: col });
			const lower = lowerRow[row];
			AssertMatrixValue(lower, { rowIndex: col, columnIndex: row });

			if (Math.abs(upper - lower) > threshold) return false;
		}
	}

	return true;
}

/**
 * Checks if a matrix is diagonal (all off-diagonal elements are zero within tolerance).
 * A diagonal matrix has non-zero values only on its main diagonal.
 * @param matrix - The matrix to check (must be square)
 * @param threshold - Tolerance for considering values as zero (default: 1e-14)
 * @returns {boolean} True if the matrix is diagonal within tolerance
 * @throws {Error} If the input is not a valid matrix
 * @example MatrixIsDiagonal([[3, 0], [0, 7]]) // true
 * @example MatrixIsDiagonal([[1, 0, 0], [0, 5, 0], [0, 0, 2]]) // true
 * @example MatrixIsDiagonal([[1, 2], [0, 1]]) // false
 */
export function MatrixIsDiagonal(matrix: IMatrix, threshold: number = 1e-14): boolean {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	if (rows !== cols) return false; // Diagonality requires a square matrix

	for (let row = 0; row < rows; row++) {
		const matrixRow = matrix[row];
		AssertMatrixRow(matrixRow, { rowIndex: row });

		for (let col = 0; col < cols; col++) {
			if (row === col) continue; // Skip diagonal elements

			const value = matrixRow[col];
			AssertMatrixValue(value, { rowIndex: row, columnIndex: col });

			if (Math.abs(value) > threshold) return false;
		}
	}

	return true;
}

/**
 * Creates an identity matrix of the specified size.
 * @param size - The dimensions of the square identity matrix (must be non-negative integer)
 * @returns {IMatrix} A square identity matrix of size n×n
 * @throws {Error} If size is negative or not an integer
 * @example MatrixIdentity(2) // [[1, 0], [0, 1]]
 * @example MatrixIdentity(3) // [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
 */

export function MatrixIdentity(size: 0): IMatrix;

export function MatrixIdentity(size: 1): IMatrix1;

export function MatrixIdentity(size: 2): IMatrix2;

export function MatrixIdentity(size: 3): IMatrix3;

export function MatrixIdentity(size: 4): IMatrix4;

export function MatrixIdentity(size: number): IMatrix;
export function MatrixIdentity(size: number): IMatrix {
	AssertNumber(size, { integer: true, gte: 0 }, { message: 'Size must be a non-negative integer' });

	const result = MatrixCreate(size, size);

	// Set diagonal elements to 1
	for (let i = 0; i < size; i++) {
		const row = result[i];
		AssertMatrixRow(row, { rowIndex: i });
		row[i] = 1;
	}

	return result;
}

/**
 * Creates a deep copy of the given matrix.
 * @param matrix - The matrix to clone (supports both IMatrix and IMatrixFlat formats)
 * @returns {IMatrix | IMatrixFlat} A new matrix with identical values but independent memory allocation
 * @throws {Error} If the input is not a valid matrix
 * @example MatrixClone([[1, 2], [3, 4]]) // [[1, 2], [3, 4]] (independent copy)
 * @example MatrixClone({data: Float64Array[1,2,3,4], rows: 2, columns: 2}) // New IMatrixFlat with copied data
 */
export function MatrixClone<T extends IMatrix>(matrix: T): TMatrixResult<T> {
	AssertMatrix(matrix);
	// Create a deep copy by mapping each row to a new array
	return matrix.map((row) => [...row]) as TMatrixResult<T>;
}

/**
 * Checks if two matrices are equal within a specified tolerance.
 * @param a - First matrix to compare (supports both IMatrix and IMatrixFlat formats)
 * @param b - Second matrix to compare (supports both IMatrix and IMatrixFlat formats)
 * @param tolerance - Maximum allowed difference between corresponding elements (default: 1e-8)
 * @returns {boolean} True if matrices are equal within tolerance, false otherwise
 * @throws {Error} If either input is not a valid matrix or if matrix data is corrupted
 * @example MatrixEquals([[1, 2]], [[1.0001, 2]], 0.001) // true
 * @example MatrixEquals([[1, 2]], [[1, 3]]) // false
 */
export function MatrixEquals(a: IMatrix, b: IMatrix, tolerance: number = 1e-8): boolean {
	AssertMatrix(a);
	AssertMatrix(b);
	AssertNumber(tolerance, { gte: 0 }, { message: 'Tolerance must be a non-negative number' });

	const [rowsA, colsA] = MatrixSize(a);
	const [rowsB, colsB] = MatrixSize(b);

	if (rowsA !== rowsB || colsA !== colsB) {
		return false;
	}

	for (let row = 0; row < rowsA; row++) {
		const rowA = a[row];
		const rowB = b[row];
		AssertMatrixRow(rowA, { rowIndex: row });
		AssertMatrixRow(rowB, { rowIndex: row });

		for (let col = 0; col < colsA; col++) {
			const valA = rowA[col];
			const valB = rowB[col];
			AssertMatrixValue(valA, { rowIndex: row, columnIndex: col });
			AssertMatrixValue(valB, { rowIndex: row, columnIndex: col });

			if (Math.abs(valA - valB) > tolerance) {
				return false;
			}
		}
	}

	return true;
}

/**
 * Converts a matrix to a formatted string representation.
 * @param matrix - The matrix to convert to string (supports both IMatrix and IMatrixFlat formats)
 * @param precision - Number of decimal places for formatting (default: 2)
 * @returns {string} A formatted string representation of the matrix
 * @throws {Error} If the input is not a valid matrix
 * @example MatrixToString([[1.23, 2.7]]) // "[ 1.23, 2.70 ]"
 * @example MatrixToString([[1, 2], [3, 4]], 0) // "[ 1, 2 ]\n[ 3, 4 ]"
 */
export function MatrixToString(matrix: IMatrix, precision: number = 2): string {
	AssertMatrix(matrix);
	AssertNumber(precision, { integer: true, gte: 0 }, { message: 'Precision must be a non-negative integer' });

	return matrix
		.map((row) => '[ ' + row
			.map((val) => {
				return typeof val === 'number' ? val.toFixed(precision) : String(val);
			})
			.join(', ') + ' ]')
		.join('\n');
}

/**
 * Computes the rank of a matrix using Gaussian elimination.
 * @param matrix - The input matrix (any dimensions, supports both IMatrix and IMatrixFlat formats)
 * @param tolerance - Numerical tolerance for zero detection (default: 1e-10)
 * @returns {number} The rank of the matrix (0 ≤ rank ≤ min(rows, columns))
 * @throws {Error} If the matrix contains invalid values
 * @example MatrixRank([[1, 2], [2, 4]]) // 1 (second row = 2 × first row)
 * @example MatrixRank([[1, 0], [0, 1]]) // 2 (full rank)
 */
export function MatrixRank(matrix: IMatrix, tolerance: number = 1e-10): number {
	AssertMatrix(matrix);
	AssertNumber(tolerance, { gte: 0 }, { message: 'Tolerance must be a non-negative number' });

	const [rows, cols] = MatrixSize(matrix);
	if (rows === 0 || cols === 0) return 0;

	// Make a deep copy to avoid mutating the input
	const mat = matrix.map((row) => [...row]);
	let rank = 0;
	const rowUsed = new Array(rows).fill(false);

	for (let col = 0; col < cols; col++) {
		let pivotRow = -1;

		for (let row = 0; row < rows; row++) {
			const matrixRow = mat[row];
			AssertMatrixRow(matrixRow, { rowIndex: row });

			const value = matrixRow[col];
			AssertMatrixValue(value, { rowIndex: row, columnIndex: col });
			if (!rowUsed[row] && Math.abs(value) > tolerance) {
				pivotRow = row;
				break;
			}
		}
		if (pivotRow === -1) continue;

		rowUsed[pivotRow] = true;
		rank++;

		// Eliminate this column in all other rows
		for (let row = 0; row < rows; row++) {
			if (row !== pivotRow) {
				const currentRow = mat[row];
				const pivotRowData = mat[pivotRow];
				AssertMatrixRow(currentRow, { rowIndex: row });
				AssertMatrixRow(pivotRowData, { rowIndex: pivotRow });

				const pivotValue = pivotRowData[col];
				const currentValue = currentRow[col];
				AssertMatrixValue(pivotValue, { rowIndex: pivotRow, columnIndex: col });
				AssertMatrixValue(currentValue, { rowIndex: row, columnIndex: col });

				const factor = currentValue / pivotValue;

				for (let k = col; k < cols; k++) {
					const pivotK = pivotRowData[k];
					const currentK = currentRow[k];
					AssertMatrixValue(pivotK, { rowIndex: pivotRow, columnIndex: k });
					AssertMatrixValue(currentK, { rowIndex: row, columnIndex: k });

					currentRow[k] = currentK - (factor * pivotK);

					const updatedValue = currentRow[k];
					AssertMatrixValue(updatedValue, { rowIndex: row, columnIndex: k });
					if (Math.abs(updatedValue) < tolerance) {
						currentRow[k] = 0;
					}
				}
			}
		}
	}

	return rank;
}

/**
 * Computes the trace of a matrix (sum of main diagonal elements).
 * @param matrix - The input matrix (can be square or rectangular, supports both IMatrix and IMatrixFlat formats)
 * @returns {number} The trace value (sum of diagonal elements)
 * @throws {Error} If the matrix contains invalid values
 * @example MatrixTrace([[1, 2, 3], [4, 5, 6], [7, 8, 9]]) // 15 (1 + 5 + 9)
 * @example MatrixTrace([[1, 2], [3, 4], [5, 6]]) // 5 (1 + 4, rectangular matrix)
 */
export function MatrixTrace(matrix: IMatrix): number {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	let trace = 0;

	// The trace is the sum of the diagonal elements (i.e., elements where row === col)
	const n = Math.min(rows, cols);

	for (let i = 0; i < n; i++) {
		const row = matrix[i];
		AssertMatrixRow(row, { rowIndex: i });

		const val = row[i];
		AssertMatrixValue(val, { rowIndex: i, columnIndex: i });
		trace += val;
	}

	return trace;
}

/**
 * Returns the transpose of a matrix (rows become columns and vice versa).
 * @param matrix - The matrix to transpose (can be any m×n matrix, supports both IMatrix and IMatrixFlat formats)
 * @returns {IMatrix | IMatrixFlat} The transposed matrix with dimensions n×m (same format as input)
 * @throws {Error} If the input is not a valid matrix
 * @example MatrixTranspose([[1, 2, 3], [4, 5, 6]]) // [[1, 4], [2, 5], [3, 6]]
 * @example MatrixTranspose([[1, 2], [3, 4]]) // [[1, 3], [2, 4]]
 */
export function MatrixTranspose<T extends IMatrix>(matrix: T): TMatrixResult<T> {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	// Note: result dimensions are swapped (columns become rows)
	const result: number[][] = [];

	// Initialize result matrix with swapped dimensions
	for (let i = 0; i < cols; i++) {
		result.push(new Array(rows).fill(0));
	}

	for (let row = 0; row < rows; row++) {
		const matrixRow = (matrix as IMatrix)[row];
		AssertMatrixRow(matrixRow, { rowIndex: row });

		for (let col = 0; col < cols; col++) {
			const val = matrixRow[col];
			AssertMatrixValue(val, { rowIndex: row, columnIndex: col });

			// Swap row and column indices in the result
			const resultCol = result[col];
			AssertMatrixRow(resultCol, { rowIndex: col });
			resultCol[row] = val;
		}
	}

	return result as TMatrixResult<T>;
}

/**
 * Applies a transformation function to each element of the matrix.
 * @param matrix - The input matrix to transform (supports both IMatrix and IMatrixFlat formats)
 * @param fn - Transformation function: (value, row, col) => transformedValue
 * @returns {IMatrix | IMatrixFlat} A new matrix with transformed values (same dimensions and format as input)
 * @throws {Error} If the input matrix is invalid or transformation function throws
 * @example MatrixMap([[1, 2], [3, 4]], (value) => value * value) // [[1, 4], [9, 16]]
 * @example MatrixMap([[1, 2], [3, 4]], (value, row, col) => value + row + col) // [[1, 3], [4, 6]]
 */
export function MatrixMap<T extends IMatrix>(matrix: T, fn: (value: number, row: number, col: number) => number): TMatrixResult<T> {
	AssertMatrix(matrix);

	const [rows, cols] = MatrixSize(matrix);
	const result: number[][] = [];

	for (let row = 0; row < rows; row++) {
		const matrixRow = matrix[row];
		AssertMatrixRow(matrixRow, { rowIndex: row });

		const newRow: number[] = [];

		for (let col = 0; col < cols; col++) {
			const val = matrixRow[col];
			AssertMatrixValue(val, { rowIndex: row, columnIndex: col });
			newRow.push(fn(val, row, col));
		}
		result.push(newRow);
	}

	return result as TMatrixResult<T>;
}
