import { BaseError, type TErrorMetadata } from '@pawells/typescript-common';
import { makeValidate } from '../internal/make-validate.js';
import { MatrixSize } from './core.js';
import { type TMatrix, type TMatrix1, type TMatrix2, type TMatrix3, type TMatrix4, type TMatrixSquare } from './types.js';

/**
 * Matrix error class for validation failures and matrix operations.
 * Extends Error to provide detailed error information with optional cause chain.
 *
 * @example
 * ```typescript
 * throw new MatrixError('Invalid matrix dimensions', { cause: originalError });
 * ```
 */
export class MatrixError extends BaseError<TMatrixErrorMetadata> {
	/**
	 * Enumeration of matrix operation error codes for classification and debugging.
	 *
	 * - `MATRIX_ERROR` — General matrix validation or operation failure
	 */
	public static readonly Code = Object.freeze({
		MATRIX_ERROR: 'MATRIX_ERROR'
	} as const);

	/**
	 * Creates a new MatrixError instance with a code, message, and optional cause chain.
	 *
	 * The error extends BaseError to provide structured error classification and cause chain propagation.
	 * The code property is accessible via the `Code` getter (inherited from BaseError).
	 * The cause chain is accessible via the `Cause` getter (inherited from BaseError).
	 * Error metadata (code, cause) is accessible via the `Metadata` getter (inherited from BaseError).
	 *
	 * @param message - Human-readable error message describing the matrix operation failure
	 * @param options - Optional configuration object
	 * @param options.cause - Original error to chain for root cause analysis
	 *
	 * @example
	 * ```typescript
	 * // Invalid matrix dimensions
	 * throw new MatrixError('Invalid matrix dimensions');
	 *
	 * // With cause chain
	 * try {
	 *   // attempt operation
	 * } catch (originalError) {
	 *   throw new MatrixError('Invalid matrix', { cause: originalError });
	 * }
	 * ```
	 */
	constructor(message: string, options?: { cause?: Error }) {
		super(message, {
			code: MatrixError.Code.MATRIX_ERROR,
			cause: options?.cause
		});
	}
}

/**
 * Metadata structure for `MatrixError` instances.
 *
 * Extends base error metadata from BaseError with matrix-specific context.
 * Contains the error code for classification and an optional cause chain for root cause analysis.
 * The code field is used for error classification (e.g., `MATRIX_ERROR`), and the optional cause field
 * enables root cause analysis by preserving the original error in the cause chain.
 */
export type TMatrixErrorMetadata = TErrorMetadata;

/**
 * Asserts that an unknown value is a valid matrix conforming to TMatrix.
 *
 * Throws a {@link MatrixError} if the value is not a valid matrix. Use this
 * function at runtime boundaries to narrow `unknown` input to `TMatrix` before
 * performing any matrix operations.
 *
 * @param matrix - The value to assert as a valid matrix
 * @throws {MatrixError} If the value is not a valid TMatrix (not a 2-D array of finite numbers)
 *
 * @example
 * ```typescript
 * import { AssertMatrix } from '@pawells/math-extended';
 *
 * const input: unknown = [[1, 2], [3, 4]];
 * AssertMatrix(input); // no-op if valid
 * // input is now narrowed to TMatrix
 * ```
 */
export function AssertMatrix(matrix: unknown): asserts matrix is TMatrix {
	if (!Array.isArray(matrix)) {
		throw new MatrixError('Invalid matrix: Expected array, got ' + typeof matrix);
	}

	if (matrix.length === 0) {
		throw new MatrixError('Invalid matrix: Matrix must have at least one row and one column');
	}

	const firstRow = matrix[0];
	if (!Array.isArray(firstRow)) {
		throw new MatrixError('Invalid matrix: Expected array, got ' + typeof firstRow);
	}

	if (firstRow.length === 0) {
		throw new MatrixError('Invalid matrix: Matrix must have at least one row and one column');
	}

	const firstRowLength = firstRow.length;

	for (let i = 0; i < matrix.length; i++) {
		const row = matrix[i];
		if (!Array.isArray(row)) {
			throw new MatrixError('Invalid matrix: Expected array, got ' + typeof row);
		}

		if (row.length !== firstRowLength) {
			throw new MatrixError('Invalid matrix: All matrix rows must have the same length');
		}

		for (let j = 0; j < row.length; j++) {
			const element = row[j];
			if (typeof element !== 'number') {
				throw new MatrixError('Invalid matrix: Expected number, got ' + typeof element);
			}
			if (!Number.isFinite(element)) {
				throw new MatrixError('Invalid matrix: Expected finite number, got ' + element);
			}
		}
	}
}
/**
 * Type guard to validate if a value is a valid matrix conforming to TMatrix.
 *
 * Returns `true` if the value is valid, `false` otherwise (does not throw).
 *
 * @param value - The value to validate
 * @returns `true` if value is a valid matrix, `false` otherwise
 * @example
 * ```typescript
 * if (ValidateMatrix(someValue)) {
 * 	console.log('Valid matrix');
 * }
 * ```
 */
export const ValidateMatrix: (value: unknown) => value is TMatrix = makeValidate(AssertMatrix);

/**
 * Asserts that an unknown value is a valid 1×1 matrix conforming to TMatrix1.
 *
 * Throws a {@link MatrixError} if the value is not a valid 1×1 matrix. Use this
 * function at runtime boundaries to narrow `unknown` input to `TMatrix1` before
 * performing any matrix operations.
 *
 * @param matrix - The value to assert as a valid 1×1 matrix
 * @throws {MatrixError} If the value is not a valid TMatrix1 (not a 1×1 2-D array of finite numbers)
 *
 * @example
 * ```typescript
 * import { AssertMatrix1 } from '@pawells/math-extended';
 *
 * const input: unknown = [[5]];
 * AssertMatrix1(input); // no-op if valid
 * // input is now narrowed to TMatrix1
 * ```
 */
export function AssertMatrix1(matrix: unknown): asserts matrix is TMatrix1 {
	if (!Array.isArray(matrix)) {
		throw new MatrixError('Invalid 1x1 matrix: Expected array, got ' + typeof matrix);
	}

	if (matrix.length !== 1) {
		throw new MatrixError('Invalid 1x1 matrix: Matrix must be exactly 1×1');
	}

	const row0 = matrix[0];
	if (!Array.isArray(row0)) {
		throw new MatrixError('Invalid 1x1 matrix: Expected array, got ' + typeof row0);
	}

	if (row0.length !== 1) {
		throw new MatrixError('Invalid 1x1 matrix: Matrix must be exactly 1×1');
	}

	const element = row0[0];
	if (typeof element !== 'number') {
		throw new MatrixError('Invalid 1x1 matrix: Expected number, got ' + typeof element);
	}
	if (!Number.isFinite(element)) {
		throw new MatrixError('Invalid 1x1 matrix: Expected finite number, got ' + element);
	}
}
/**
 * Type guard to validate if a value is a valid 1×1 matrix conforming to TMatrix1.
 *
 * Returns `true` if the value is valid, `false` otherwise (does not throw).
 *
 * @param value - The value to validate
 * @returns `true` if value is a valid 1×1 matrix, `false` otherwise
 * @example
 * ```typescript
 * if (ValidateMatrix1(someValue)) {
 * 	console.log('Valid 1x1 matrix');
 * }
 * ```
 */
export const ValidateMatrix1: (value: unknown) => value is TMatrix1 = makeValidate(AssertMatrix1);

/**
 * Asserts that an unknown value is a valid 2×2 matrix conforming to TMatrix2.
 *
 * Throws a {@link MatrixError} if the value is not a valid 2×2 matrix. Use this
 * function at runtime boundaries to narrow `unknown` input to `TMatrix2` before
 * performing any matrix operations.
 *
 * @param matrix - The value to assert as a valid 2×2 matrix
 * @throws {MatrixError} If the value is not a valid TMatrix2 (not a 2×2 2-D array of finite numbers)
 *
 * @example
 * ```typescript
 * import { AssertMatrix2 } from '@pawells/math-extended';
 *
 * const input: unknown = [[1, 2], [3, 4]];
 * AssertMatrix2(input); // no-op if valid
 * // input is now narrowed to TMatrix2
 * ```
 */
export function AssertMatrix2(matrix: unknown): asserts matrix is TMatrix2 {
	if (!Array.isArray(matrix)) {
		throw new MatrixError('Invalid 2x2 matrix: Expected array, got ' + typeof matrix);
	}

	if (matrix.length !== 2) {
		throw new MatrixError('Invalid 2x2 matrix: Matrix must be exactly 2×2');
	}

	const row0 = matrix[0];
	const row1 = matrix[1];

	if (!Array.isArray(row0)) {
		throw new MatrixError('Invalid 2x2 matrix: Expected array, got ' + typeof row0);
	}
	if (!Array.isArray(row1)) {
		throw new MatrixError('Invalid 2x2 matrix: Expected array, got ' + typeof row1);
	}

	if (row0.length !== 2 || row1.length !== 2) {
		throw new MatrixError('Invalid 2x2 matrix: Matrix must be exactly 2×2');
	}

	for (let i = 0; i < 2; i++) {
		const row = matrix[i];
		for (let j = 0; j < 2; j++) {
			const element = row[j];
			if (typeof element !== 'number') {
				throw new MatrixError('Invalid 2x2 matrix: Expected number, got ' + typeof element);
			}
			if (!Number.isFinite(element)) {
				throw new MatrixError('Invalid 2x2 matrix: Expected finite number, got ' + element);
			}
		}
	}
}
/**
 * Type guard to validate if a value is a valid 2×2 matrix conforming to TMatrix2.
 *
 * Returns `true` if the value is valid, `false` otherwise (does not throw).
 *
 * @param value - The value to validate
 * @returns `true` if value is a valid 2×2 matrix, `false` otherwise
 * @example
 * ```typescript
 * if (ValidateMatrix2(someValue)) {
 * 	console.log('Valid 2x2 matrix');
 * }
 * ```
 */
export const ValidateMatrix2: (value: unknown) => value is TMatrix2 = makeValidate(AssertMatrix2);

/**
 * Asserts that an unknown value is a valid 3×3 matrix conforming to TMatrix3.
 *
 * Throws a {@link MatrixError} if the value is not a valid 3×3 matrix. Use this
 * function at runtime boundaries to narrow `unknown` input to `TMatrix3` before
 * performing any matrix operations.
 *
 * @param matrix - The value to assert as a valid 3×3 matrix
 * @throws {MatrixError} If the value is not a valid TMatrix3 (not a 3×3 2-D array of finite numbers)
 *
 * @example
 * ```typescript
 * import { AssertMatrix3 } from '@pawells/math-extended';
 *
 * const input: unknown = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
 * AssertMatrix3(input); // no-op if valid
 * // input is now narrowed to TMatrix3
 * ```
 */
export function AssertMatrix3(matrix: unknown): asserts matrix is TMatrix3 {
	if (!Array.isArray(matrix)) {
		throw new MatrixError('Invalid 3x3 matrix: Expected array, got ' + typeof matrix);
	}

	if (matrix.length !== 3) {
		throw new MatrixError('Invalid 3x3 matrix: Matrix must be exactly 3×3');
	}

	const row0 = matrix[0];
	const row1 = matrix[1];
	const row2 = matrix[2];

	if (!Array.isArray(row0) || !Array.isArray(row1) || !Array.isArray(row2)) {
		throw new MatrixError('Invalid 3x3 matrix: Expected array, got non-array row');
	}

	if (row0.length !== 3 || row1.length !== 3 || row2.length !== 3) {
		throw new MatrixError('Invalid 3x3 matrix: Matrix must be exactly 3×3');
	}

	for (let i = 0; i < 3; i++) {
		const row = matrix[i];
		for (let j = 0; j < 3; j++) {
			const element = row[j];
			if (typeof element !== 'number') {
				throw new MatrixError('Invalid 3x3 matrix: Expected number, got ' + typeof element);
			}
			if (!Number.isFinite(element)) {
				throw new MatrixError('Invalid 3x3 matrix: Expected finite number, got ' + element);
			}
		}
	}
}
/**
 * Type guard to validate if a value is a valid 3×3 matrix conforming to TMatrix3.
 *
 * Returns `true` if the value is valid, `false` otherwise (does not throw).
 *
 * @param value - The value to validate
 * @returns `true` if value is a valid 3×3 matrix, `false` otherwise
 * @example
 * ```typescript
 * if (ValidateMatrix3(someValue)) {
 * 	console.log('Valid 3x3 matrix');
 * }
 * ```
 */
export const ValidateMatrix3: (value: unknown) => value is TMatrix3 = makeValidate(AssertMatrix3);

/**
 * Asserts that an unknown value is a valid 4×4 matrix conforming to TMatrix4.
 *
 * Throws a {@link MatrixError} if the value is not a valid 4×4 matrix. Use this
 * function at runtime boundaries to narrow `unknown` input to `TMatrix4` before
 * performing any matrix operations.
 *
 * @param matrix - The value to assert as a valid 4×4 matrix
 * @throws {MatrixError} If the value is not a valid TMatrix4 (not a 4×4 2-D array of finite numbers)
 *
 * @example
 * ```typescript
 * import { AssertMatrix4 } from '@pawells/math-extended';
 *
 * const input: unknown = [[1, 0, 0, 5], [0, 1, 0, 10], [0, 0, 1, 15], [0, 0, 0, 1]];
 * AssertMatrix4(input); // no-op if valid
 * // input is now narrowed to TMatrix4
 * ```
 */
export function AssertMatrix4(matrix: unknown): asserts matrix is TMatrix4 {
	if (!Array.isArray(matrix)) {
		throw new MatrixError('Invalid 4x4 matrix: Expected array, got ' + typeof matrix);
	}

	if (matrix.length !== 4) {
		throw new MatrixError('Invalid 4x4 matrix: Matrix must be exactly 4×4');
	}

	const row0 = matrix[0];
	const row1 = matrix[1];
	const row2 = matrix[2];
	const row3 = matrix[3];

	if (!Array.isArray(row0) || !Array.isArray(row1) || !Array.isArray(row2) || !Array.isArray(row3)) {
		throw new MatrixError('Invalid 4x4 matrix: Expected array, got non-array row');
	}

	if (row0.length !== 4 || row1.length !== 4 || row2.length !== 4 || row3.length !== 4) {
		throw new MatrixError('Invalid 4x4 matrix: Matrix must be exactly 4×4');
	}

	for (let i = 0; i < 4; i++) {
		const row = matrix[i];
		for (let j = 0; j < 4; j++) {
			const element = row[j];
			if (typeof element !== 'number') {
				throw new MatrixError('Invalid 4x4 matrix: Expected number, got ' + typeof element);
			}
			if (!Number.isFinite(element)) {
				throw new MatrixError('Invalid 4x4 matrix: Expected finite number, got ' + element);
			}
		}
	}
}
/**
 * Type guard to validate if a value is a valid 4×4 matrix conforming to TMatrix4.
 *
 * Returns `true` if the value is valid, `false` otherwise (does not throw).
 *
 * @param value - The value to validate
 * @returns `true` if value is a valid 4×4 matrix, `false` otherwise
 * @example
 * ```typescript
 * if (ValidateMatrix4(someValue)) {
 * 	console.log('Valid 4x4 matrix');
 * }
 * ```
 */
export const ValidateMatrix4: (value: unknown) => value is TMatrix4 = makeValidate(AssertMatrix4);

/**
 * Asserts that an unknown value is a valid square matrix conforming to TMatrixSquare.
 *
 * Throws a {@link MatrixError} if the value is not a valid square matrix (m×m). Use this
 * function at runtime boundaries to narrow `unknown` input to `TMatrixSquare` before
 * performing square-matrix-only operations like determinant or eigenvalue decomposition.
 *
 * @param matrix - The value to assert as a valid square matrix
 * @throws {MatrixError} If the value is not a valid TMatrixSquare (not a square 2-D array of finite numbers)
 *
 * @example
 * ```typescript
 * import { AssertMatrixSquare } from '@pawells/math-extended';
 *
 * const input: unknown = [[1, 2], [3, 4]];
 * AssertMatrixSquare(input); // no-op if valid
 * // input is now narrowed to TMatrixSquare
 * ```
 */
export function AssertMatrixSquare(matrix: unknown): asserts matrix is TMatrixSquare {
	if (!Array.isArray(matrix)) {
		throw new MatrixError('Invalid square matrix: Expected array, got ' + typeof matrix);
	}

	if (matrix.length === 0) {
		throw new MatrixError('Invalid square matrix: Matrix must be square (m×m)');
	}

	const rows = matrix.length;

	for (let i = 0; i < rows; i++) {
		const row = matrix[i];
		if (!Array.isArray(row)) {
			throw new MatrixError('Invalid square matrix: Expected array, got ' + typeof row);
		}

		if (row.length !== rows) {
			throw new MatrixError('Invalid square matrix: Matrix must be square (m×m)');
		}

		for (let j = 0; j < row.length; j++) {
			const element = row[j];
			if (typeof element !== 'number') {
				throw new MatrixError('Invalid square matrix: Expected number, got ' + typeof element);
			}
			if (!Number.isFinite(element)) {
				throw new MatrixError('Invalid square matrix: Expected finite number, got ' + element);
			}
		}
	}
}
/**
 * Type guard to validate if a value is a valid square matrix conforming to TMatrix.
 *
 * Returns `true` if the value is valid, `false` otherwise (does not throw).
 *
 * @param value - The value to validate
 * @returns `true` if value is a valid square matrix, `false` otherwise
 * @example
 * ```typescript
 * if (ValidateMatrixSquare(someValue)) {
 * 	console.log('Valid square matrix');
 * }
 * ```
 */
export const ValidateMatrixSquare: (value: unknown) => value is TMatrixSquare = makeValidate(AssertMatrixSquare);

/**
 * Asserts that all provided values are valid matrices with identical dimensions.
 *
 * Validates each argument is a `TMatrix` and that every matrix shares the same
 * number of rows and columns as the first. Use before element-wise operations
 * (add, subtract, etc.) that require conforming dimensions.
 *
 * @param matrices - One or more values to validate as dimension-compatible matrices
 * @throws {MatrixError} If any value is not a valid TMatrix, or if matrices do not all share the same dimensions
 *
 * @example
 * ```typescript
 * import { AssertMatricesCompatible } from '@pawells/math-extended';
 *
 * const a = [[1, 2], [3, 4]];
 * const b = [[5, 6], [7, 8]];
 * AssertMatricesCompatible(a, b); // passes — both are 2×2
 *
 * // Throws MatrixError:
 * // AssertMatricesCompatible([[1, 2]], [[1, 2, 3]]);
 * ```
 */
export function AssertMatricesCompatible(...matrices: unknown[]): void {
	for (const matrix of matrices) {
		AssertMatrix(matrix);
	}

	// Validate that all matrices have the same dimensions
	const first = matrices[0];
	if (first === undefined) {
		throw new MatrixError('At least one matrix must be provided');
	}
	AssertMatrix(first);
	const [firstRows, firstCols] = MatrixSize(first);
	for (let i = 1; i < matrices.length; i++) {
		const matrix = matrices[i];
		if (matrix === undefined) {
			throw new MatrixError(`Matrix at index ${i} is undefined`);
		}
		AssertMatrix(matrix);
		const [rows, cols] = MatrixSize(matrix);
		if (rows !== firstRows || cols !== firstCols) {
			throw new MatrixError(
				`All matrices must have the same dimensions. Expected [${firstRows}, ${firstCols}], but got [${rows}, ${cols}] at index ${i}`
			);
		}
	}
}
