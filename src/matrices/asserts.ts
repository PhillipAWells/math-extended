import { MatrixSize } from '../index.js';
import { MATRIX1_SCHEMA, MATRIX2_SCHEMA, MATRIX3_SCHEMA, MATRIX4_SCHEMA, MATRIX_SCHEMA, MATRIX_SQUARE_SCHEMA, TMatrix, TMatrix1, TMatrix2, TMatrix3, TMatrix4, TMatrixSquare } from './types.js';

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
export class MatrixError extends Error {
	public readonly code: string = 'MATRIX_ERROR';

	constructor(message: string, options?: { cause?: unknown }) {
		super(message);
		this.name = 'MatrixError';
		if (options?.cause) {
			this.cause = options.cause;
		}
	}
}

/**
 * Factory function to create a Validate* type guard from an Assert* function.
 * @param assert - The assertion function to wrap
 * @returns A type guard function that returns true if valid, false otherwise
 */
function makeValidate<T>(
	assert: (value: unknown) => asserts value is T,
): (value: unknown) => value is T {
	return (value: unknown): value is T => {
		try {
			assert(value);
			return true;
		} catch {
			return false;
		}
	};
}

export function AssertMatrix(matrix: unknown): asserts matrix is TMatrix {
	try {
		MATRIX_SCHEMA.parse(matrix);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new MatrixError(`Invalid matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}
export const ValidateMatrix: (value: unknown) => value is TMatrix = makeValidate(AssertMatrix);
export function AssertMatrix1(matrix: unknown): asserts matrix is TMatrix1 {
	try {
		MATRIX1_SCHEMA.parse(matrix);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new MatrixError(`Invalid 1x1 matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}
export const ValidateMatrix1: (value: unknown) => value is TMatrix1 = makeValidate(AssertMatrix1);
export function AssertMatrix2(matrix: unknown): asserts matrix is TMatrix2 {
	try {
		MATRIX2_SCHEMA.parse(matrix);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new MatrixError(`Invalid 2x2 matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}
export const ValidateMatrix2: (value: unknown) => value is TMatrix2 = makeValidate(AssertMatrix2);
export function AssertMatrix3(matrix: unknown): asserts matrix is TMatrix3 {
	try {
		MATRIX3_SCHEMA.parse(matrix);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new MatrixError(`Invalid 3x3 matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}
export const ValidateMatrix3: (value: unknown) => value is TMatrix3 = makeValidate(AssertMatrix3);
export function AssertMatrix4(matrix: unknown): asserts matrix is TMatrix4 {
	try {
		MATRIX4_SCHEMA.parse(matrix);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new MatrixError(`Invalid 4x4 matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}
export const ValidateMatrix4: (value: unknown) => value is TMatrix4 = makeValidate(AssertMatrix4);
export function AssertMatrixSquare(matrix: unknown): asserts matrix is TMatrixSquare {
	try {
		MATRIX_SQUARE_SCHEMA.parse(matrix);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new MatrixError(`Invalid square matrix: ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}
export const ValidateMatrixSquare: (value: unknown) => value is TMatrix = makeValidate(AssertMatrixSquare);

export function AssertMatricesCompatible(...matrices: unknown[]): void {
	for (const matrix of matrices) {
		AssertMatrix(matrix);
	}

	// Validate that all matrices have the same dimensions
	const [firstRows, firstCols] = MatrixSize(matrices[0] as TMatrix);
	for (let i = 1; i < matrices.length; i++) {
		const [rows, cols] = MatrixSize(matrices[i] as TMatrix);
		if (rows !== firstRows || cols !== firstCols) {
			throw new MatrixError(
				`All matrices must have the same dimensions. Expected [${firstRows}, ${firstCols}], but got [${rows}, ${cols}] at index ${i}`,
			);
		}
	}
}
