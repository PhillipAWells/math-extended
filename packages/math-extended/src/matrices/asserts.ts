import { BaseError, GetErrorMessage, type TErrorMetadata } from '@pawells/typescript-common';
import { makeValidate } from '../internal/make-validate.js';
import { MatrixSize } from './core.js';
import { MATRIX1_SCHEMA, MATRIX2_SCHEMA, MATRIX3_SCHEMA, MATRIX4_SCHEMA, MATRIX_SCHEMA, MATRIX_SQUARE_SCHEMA, type TMatrix, type TMatrix1, type TMatrix2, type TMatrix3, type TMatrix4, type TMatrixSquare } from './types.js';

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
 *
 * @typedef {object} TMatrixErrorMetadata
 * @property {string} [code] - Error code for classification (e.g., `MATRIX_ERROR`)
 * @property {Error} [cause] - Optional original error for cause chain propagation
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
	try {
		MATRIX_SCHEMA.parse(matrix);
	}
	catch (error) {
		const message = GetErrorMessage(error);
		throw new MatrixError(`Invalid matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
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
export function AssertMatrix1(matrix: unknown): asserts matrix is TMatrix1 {
	try {
		MATRIX1_SCHEMA.parse(matrix);
	}
	catch (error) {
		const message = GetErrorMessage(error);
		throw new MatrixError(`Invalid 1x1 matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
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
export function AssertMatrix2(matrix: unknown): asserts matrix is TMatrix2 {
	try {
		MATRIX2_SCHEMA.parse(matrix);
	}
	catch (error) {
		const message = GetErrorMessage(error);
		throw new MatrixError(`Invalid 2x2 matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
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
export function AssertMatrix3(matrix: unknown): asserts matrix is TMatrix3 {
	try {
		MATRIX3_SCHEMA.parse(matrix);
	}
	catch (error) {
		const message = GetErrorMessage(error);
		throw new MatrixError(`Invalid 3x3 matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
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
export function AssertMatrix4(matrix: unknown): asserts matrix is TMatrix4 {
	try {
		MATRIX4_SCHEMA.parse(matrix);
	}
	catch (error) {
		const message = GetErrorMessage(error);
		throw new MatrixError(`Invalid 4x4 matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
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
export function AssertMatrixSquare(matrix: unknown): asserts matrix is TMatrixSquare {
	try {
		MATRIX_SQUARE_SCHEMA.parse(matrix);
	}
	catch (error) {
		const message = GetErrorMessage(error);
		throw new MatrixError(`Invalid square matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
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
