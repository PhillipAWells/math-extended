import { BaseError, GetErrorMessage, type TErrorMetadata } from '@pawells/typescript-common';
import { MatrixSize } from './core.js';
import { MATRIX1_SCHEMA, MATRIX2_SCHEMA, MATRIX3_SCHEMA, MATRIX4_SCHEMA, MATRIX_SCHEMA, MATRIX_SQUARE_SCHEMA, type TMatrix, type TMatrix1, type TMatrix2, type TMatrix3, type TMatrix4, type TMatrixSquare } from './types.js';

/**
 * Validates that an unknown value is a valid matrix conforming to the TMatrix interface.
 *
 * This function performs comprehensive validation of matrix structure including:
 * - Type checking to ensure the value is a proper matrix
 * - Dimensional constraints (min/max/exact rows and columns)
 * - Square matrix validation if required
 * - Size validation against specified dimensions
 *
 * @param matrix - The value to validate as a matrix
 * @param args - Validation configuration options
 * @param exception - Custom exception details if validation fails
 * @throws {MatrixError} When the matrix doesn't meet the specified criteria
 *
 * @example
 * ```typescript
 * ```typescript
 * // Validate a 3x3 square matrix
 * AssertMatrix(someValue, { square: true, size: 3 });
 * // Validate minimum dimensions
 * AssertMatrix(someValue, { minRows: 2, minColumns: 3 });
 * // Validate exact dimensions
 * AssertMatrix(someValue, { rows: 4, columns: 5 });
 * ```
 * ```
 */
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
 * Factory function to create a Validate* type guard from an Assert* function.
 * @param assert - The assertion function to wrap
 * @returns A type guard function that returns true if valid, false otherwise
 */
function makeValidate<T>(
	assert: (value: unknown) => asserts value is T
): (value: unknown) => value is T {
	return (value: unknown): value is T => {
		try {
			assert(value);
			return true;
		}
		catch {
			return false;
		}
	};
}

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
