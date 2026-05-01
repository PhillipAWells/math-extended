import { AssertArray2D, IAssertException, AssertNumber, SetExceptionClass, SetExceptionMessage, ThrowException } from '@pawells/typescript-common';
import { TMatrix, TMatrix1, TMatrix2, TMatrix3, TMatrix4 } from './types.js';
import { MatrixSize } from './core.js';

/**
 * Configuration options for matrix validation constraints.
 *
 * This interface allows flexible validation of matrix dimensions and properties,
 * supporting various combinations of size constraints to accommodate different
 * matrix validation requirements.
 *
 * @interface IAssertMatrixArgs
 * @example
	 * ```typescript
	 * ```typescript
	 * // Validate a square matrix of any size
	 * const squareArgs: IAssertMatrixArgs = { square: true };
	 * // Validate minimum dimensions
	 * const minSizeArgs: IAssertMatrixArgs = { minRows: 2, minColumns: 3 };
	 * // Validate exact size using tuple
	 * const exactSizeArgs: IAssertMatrixArgs = { size: [4, 5] };
	 * // Validate square matrix with exact size
	 * const squareExactArgs: IAssertMatrixArgs = { square: true, size: 3 };
	 * ```
	 * ```
 */
interface IAssertMatrixArgs {
	/** Minimum number of rows required in the matrix */
	minRows?: number;
	/** Minimum number of columns required in the matrix */
	minColumns?: number;
	/** Exact number of rows required in the matrix */
	rows?: number;
	/** Exact number of columns required in the matrix */
	columns?: number;
	/** Maximum number of rows allowed in the matrix */
	maxRows?: number;
	/** Maximum number of columns allowed in the matrix */
	maxColumns?: number;
	/** Whether the matrix must be square (rows === columns) */
	square?: boolean;
	/**
	 * Exact size of the matrix.
	 * Can be specified as:
	 * - [rows, columns] tuple for rectangular matrices
	 * - Single number for square matrices (equivalent to [n, n])
	 */
	size?: [number, number] | number;
}
/**
 * Configuration options for validating multiple matrices together.
 *
 * Used when checking compatibility between two or more matrices for
 * mathematical operations such as multiplication, addition, or other
 * matrix operations that require specific dimensional relationships.
 *
 * @interface IAssertMatricesArgs
 * @example
	 * ```typescript
	 * ```typescript
	 * // Standard compatibility (same dimensions for addition/subtraction)
	 * const standardArgs: IAssertMatricesArgs = {};
	 * // Allow transposed compatibility for multiplication
	 * const transposedArgs: IAssertMatricesArgs = { transposition: true };
	 * ```
	 * ```
 */
export interface IAssertMatricesArgs {
	/**
	 * Whether to allow transposed dimensions between matrices.
	 * When true, matrices A (m×n) and B (n×m) are considered compatible.
	 * Useful for operations that work with both regular and transposed forms.
	 * When false, matrices must have identical dimensions for compatibility.
	 */
	transposition?: boolean;
}
/**
 * Extended exception interface for matrix assertion errors.
 *
 * Provides additional context for matrix validation failures by including
 * optional row and column indices. This allows for more precise error
 * reporting when validation fails at specific matrix positions.
 *
 * @interface IAssertMatrixException
 * @extends IAssertException
 */
interface IAssertMatrixException extends IAssertException {
	/** Optional row index for more descriptive error messages when validation fails at a specific row */
	rowIndex?: number;
	/** Optional column index for more descriptive error messages when validation fails at a specific column */
	columnIndex?: number;
}

/**
 * Custom error class for matrix-related validation failures.
 *
 * This error class provides a specific error type for matrix validation
 * failures, making it easier to catch and handle matrix-specific errors
 * separately from other types of errors in your application.
 *
 * @class MatrixError
 * @extends Error
 * @example
	 * ```typescript
	 * ```typescript
	 * try {
	 *   AssertMatrix(invalidMatrix);
	 * } catch (error) {
	 *   if (error instanceof MatrixError) {
	 *     console.log('Matrix validation failed:', error.message);
	 *   }
	 * }
	 * ```
	 * ```
 */
export class MatrixError extends Error {
	readonly code: string = 'MATRIX_ERROR';

	/**
	 * Creates a new MatrixError instance.
	 *
	 * @param message - Error message describing the validation failure
	 * @param options - Optional error context
	 * @param options.cause - Original error that caused this error
	 */
	constructor(message: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = 'MatrixError';
		// Maintains proper prototype chain for instanceof checks
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

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
 * @throws {IAssertException} When the matrix doesn't meet the specified criteria
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
export function AssertMatrix(matrix: unknown, args: IAssertMatrixArgs = {}, exception: IAssertMatrixException = {}): asserts matrix is TMatrix {
	// Initialize the exception with the default MatrixError class if not provided
	SetExceptionClass(exception, MatrixError);

	// First validation: ensure the input is a valid 2D array structure
	AssertArray2D<number>(matrix, {}, exception);

	// Second validation: verify all elements are numeric values
	// Note: We check both type and NaN since NaN has type 'number' but isn't a valid matrix element
	for (let i = 0; i < matrix.length; i++) {
		const row = matrix[i];
		if (row) {
			for (let j = 0; j < row.length; j++) {
				if (typeof row[j] !== 'number' || Number.isNaN(row[j] as number)) {
					SetExceptionMessage(exception, `Matrix[${i}][${j}] Not a Number`);
					ThrowException(exception);
				}
			}
		}
	}

	// Extract matrix dimensions for constraint validation
	const [rows, columns] = MatrixSize(matrix);

	// Reject empty matrices (zero rows or zero columns)
	if (rows === 0 || columns === 0) {
		SetExceptionMessage(exception, 'Matrix must have at least one row and one column');
		ThrowException(exception);
	}

	// Validate exact size constraint when specified as [rows, columns] tuple
	if (Array.isArray(args.size)) {
		const [expectedRows, expectedColumns] = args.size;
		if (rows !== expectedRows) {
			SetExceptionMessage(exception, `Matrix has ${rows} rows, expected exactly ${expectedRows}`);
			ThrowException(exception);
		}
		if (columns !== expectedColumns) {
			SetExceptionMessage(exception, `Matrix has ${columns} columns, expected exactly ${expectedColumns}`);
			ThrowException(exception);
		}
	} else if (typeof args.size === 'number') {
		// Validate exact size constraint when specified as single number (assumes square matrix)
		if (rows !== args.size) {
			SetExceptionMessage(exception, `Square matrix has ${rows} rows, expected exactly ${args.size}`);
			ThrowException(exception);
		}
		if (columns !== args.size) {
			SetExceptionMessage(exception, `Square matrix has ${columns} columns, expected exactly ${args.size}`);
			ThrowException(exception);
		}
	}

	// Validate exact row count constraint when explicitly specified
	if (args.rows !== undefined && rows !== args.rows) {
		SetExceptionMessage(exception, `Matrix has ${rows} rows, expected exactly ${args.rows}`);
		ThrowException(exception);
	}

	// Validate exact column count constraint when explicitly specified
	if (args.columns !== undefined && columns !== args.columns) {
		SetExceptionMessage(exception, `Matrix has ${columns} columns, expected exactly ${args.columns}`);
		ThrowException(exception);
	}

	// Validate minimum row count constraint (useful for operations requiring minimum dimensions)
	if (args.minRows !== undefined && rows < args.minRows) {
		SetExceptionMessage(exception, `Matrix has ${rows} rows, minimum required is ${args.minRows}`);
		ThrowException(exception);
	}

	// Validate maximum row count constraint (useful for memory or performance limits)
	if (args.maxRows !== undefined && rows > args.maxRows) {
		SetExceptionMessage(exception, `Matrix has ${rows} rows, maximum allowed is ${args.maxRows}`);
		ThrowException(exception);
	}

	// Validate minimum column count constraint (useful for operations requiring minimum dimensions)
	if (args.minColumns !== undefined && columns < args.minColumns) {
		SetExceptionMessage(exception, `Matrix has ${columns} columns, minimum required is ${args.minColumns}`);
		ThrowException(exception);
	}

	// Validate maximum column count constraint (useful for memory or performance limits)
	if (args.maxColumns !== undefined && columns > args.maxColumns) {
		SetExceptionMessage(exception, `Matrix has ${columns} columns, maximum allowed is ${args.maxColumns}`);
		ThrowException(exception);
	}

	// Validate square matrix constraint (required for operations like determinant, inverse, etc.)
	if (args.square === true && rows !== columns) {
		SetExceptionMessage(exception, `Matrix must be square but has ${rows} rows and ${columns} columns`);
		ThrowException(exception);
	}
}

/**
 * Validates that an unknown value is a valid matrix row (array of numbers).
 *
 * This function ensures that the provided value is a proper matrix row,
 * which should be an array containing only numeric values.
 *
 * @param row - The value to validate as a matrix row
 * @param exception - Custom exception details (optionally includes `rowIndex` for richer messages)
 * @throws {MatrixError} When the row is not a valid array of finite numbers
 *
 * @example
	 * ```typescript
	 * ```typescript
	 * // Validate a matrix row
	 * AssertMatrixRow([1, 2, 3, 4]);
	 * // Validate with row index in exception for better error messages
	 * AssertMatrixRow([1, 2, 3, 4], { rowIndex: 0 });
	 * // This would throw MatrixError
	 * AssertMatrixRow([1, '2', 3]); // Contains non-numeric value
	 * ```
	 * ```
 */
export function AssertMatrixRow(row: unknown, exception: IAssertMatrixException = {}): asserts row is number[] {
	// Initialize the exception with the default MatrixError class if not provided
	SetExceptionClass(exception, MatrixError);

	// First validation: ensure the input is an array
	if (!Array.isArray(row)) {
		const rowInfo = exception.rowIndex !== undefined ? ` at row ${exception.rowIndex}` : '';
		SetExceptionMessage(exception, `Matrix row${rowInfo} must be an array`);
		ThrowException(exception);
	}

	// Safe cast to array since we've verified it's an array
	const rowArray = row as unknown[];

	// Second validation: ensure all elements are finite numbers
	// This excludes NaN, Infinity, and -Infinity which are technically numbers but invalid for matrices
	for (let i = 0; i < rowArray.length; i++) {
		if (typeof rowArray[i] !== 'number' || !isFinite(rowArray[i] as number)) {
			const rowInfo = exception.rowIndex !== undefined ? ` at row ${exception.rowIndex}` : '';
			SetExceptionMessage(exception, `Matrix row${rowInfo} element at index ${i} is not a finite number`);
			ThrowException(exception);
		}
	}
}

/**
 * Validates that an unknown value is a valid matrix element (finite number).
 *
 * This function ensures that the provided value is a proper matrix element,
 * which should be a finite number (not NaN, Infinity, or -Infinity).
 *
 * @param value - The value to validate as a matrix element
 * @param exception - Custom exception details (optionally includes `rowIndex` and `columnIndex` for richer messages)
 * @throws {MatrixError} When the value is not a finite number
 *
 * @example
	 * ```typescript
	 * ```typescript
	 * // Validate a matrix element
	 * AssertMatrixValue(42);
	 * // Validate with position information for better error messages
	 * AssertMatrixValue(3.14, { rowIndex: 0, columnIndex: 1 });
	 * // These would throw MatrixError
	 * AssertMatrixValue(NaN);      // Not a number
	 * AssertMatrixValue(Infinity); // Not a finite number
	 * AssertMatrixValue('5');      // Not a number type
	 * ```
	 * ```
 */
export function AssertMatrixValue(value: unknown, exception: IAssertMatrixException = {}): asserts value is number {
	// Initialize the exception with the default MatrixError class if not provided
	SetExceptionClass(exception, MatrixError);

	// Build position information for error messages when row and column indices are available
	// This provides more context about where the validation failure occurred
	const position = exception.rowIndex !== undefined && exception.columnIndex !== undefined ? ` at row ${exception.rowIndex}, column ${exception.columnIndex}` : '';
	SetExceptionMessage(exception, `Matrix value${position} must be a finite number`);

	// Delegate to the general number assertion which handles finite number validation
	// Wrap any thrown error as MatrixError to maintain consistent error handling
	try {
		AssertNumber(value, { finite: true }, exception);
	} catch (error) {
		// Re-throw as MatrixError to maintain API contract
		throw new MatrixError(exception.message ?? 'Matrix value must be a finite number');
	}
}

/**
 * Validates compatibility between two matrices for mathematical operations.
 *
 * This function checks that two matrices are compatible for operations like
 * multiplication, addition, or other matrix operations that require specific
 * dimensional relationships.
 *
 * @param a - The first matrix to validate
 * @param b - The second matrix to validate
 * @param args - Validation configuration options
 * @param exception - Custom exception details if validation fails
 * @throws {IAssertException} When the matrices are not compatible
 *
 * @example
	 * ```typescript
	 * ```typescript
	 * // Validate matrices for multiplication (A columns must equal B rows)
	 * AssertMatrices(matrixA, matrixB);
	 * // Allow transposed compatibility
	 * AssertMatrices(matrixA, matrixB, { transposition: true });
	 * ```
	 * ```
 */
export function AssertMatrices(a: unknown, b: unknown, args: IAssertMatricesArgs = {}, exception: IAssertMatrixException = {}): void {
	// Initialize the exception with the default MatrixError class if not provided
	SetExceptionClass(exception, MatrixError);

	// First validation: ensure both inputs are valid matrices
	AssertMatrix(a, {}, exception);
	AssertMatrix(b, {}, exception);

	// Safe cast to TMatrix since we've validated both inputs
	const matrixA = a as TMatrix;
	const matrixB = b as TMatrix;

	// Extract dimensions from both matrices for compatibility checking
	const rowsA = matrixA.length;
	const columnsA = rowsA > 0 && matrixA[0] ? matrixA[0].length : 0;
	const rowsB = matrixB.length;
	const columnsB = rowsB > 0 && matrixB[0] ? matrixB[0].length : 0;

	// Check compatibility based on whether transposition is allowed
	if (args.transposition === true) {
		// With transposition allowed, check all possible multiplication combinations:
		// - A × B (standard): columns of A must equal rows of B
		// - A × B^T (B transposed): columns of A must equal columns of B
		// - A^T × B (A transposed): rows of A must equal rows of B
		// - A^T × B^T (both transposed): rows of A must equal columns of B
		const canMultiplyAB = columnsA === rowsB;
		const canMultiplyABT = columnsA === columnsB;
		const canMultiplyATB = rowsA === rowsB;
		const canMultiplyATBT = rowsA === columnsB;

		if (!canMultiplyAB && !canMultiplyABT && !canMultiplyATB && !canMultiplyATBT) {
			SetExceptionMessage(
				exception,
				`Matrices are not compatible for multiplication even with transposition. Matrix A is ${rowsA}×${columnsA}, Matrix B is ${rowsB}×${columnsB}`,
			);
			ThrowException(exception);
		}
	} else {
		// Without transposition: matrices must have identical dimensions
		// This is required for element-wise operations like addition and subtraction
		if (rowsA !== rowsB || columnsA !== columnsB) {
			SetExceptionMessage(
				exception,
				`Matrices must have identical dimensions for addition/subtraction. Matrix A is ${rowsA}×${columnsA}, Matrix B is ${rowsB}×${columnsB}`,
			);
			ThrowException(exception);
		}
	}
}

/**
 * Validates that an unknown value is a valid 1x1 matrix.
 *
 * This function ensures that the provided value is a proper 1x1 matrix,
 * which should be a 2D array with exactly 1 row and 1 column containing a number.
 *
 * @param matrix - The value to validate as a 1x1 matrix
 * @param exception - Custom exception details if validation fails
 * @throws {IAssertException} When the matrix is not a valid 1x1 matrix
 *
 * @example
	 * ```typescript
	 * ```typescript
	 * // Validate a 1x1 matrix
	 * AssertMatrix1([[5]]);
	 * // This would throw an exception
	 * AssertMatrix1([[1, 2]]); // Too many columns
	 * ```
	 * ```
 */
export function AssertMatrix1(matrix: unknown, exception: IAssertMatrixException = {}): asserts matrix is TMatrix1 {
	// Initialize the exception with the default MatrixError class if not provided
	SetExceptionClass(exception, MatrixError);

	// Delegate to the general matrix assertion with 1x1 square matrix constraints
	// This ensures the matrix is exactly 1 row by 1 column
	AssertMatrix(matrix, { square: true, size: 1 }, exception);
}

/**
 * Validates that an unknown value is a valid 2x2 matrix.
 *
 * This function ensures that the provided value is a proper 2x2 matrix,
 * which should be a 2D array with exactly 2 rows and 2 columns containing numbers.
 *
 * @param matrix - The value to validate as a 2x2 matrix
 * @param exception - Custom exception details if validation fails
 * @throws {IAssertException} When the matrix is not a valid 2x2 matrix
 *
 * @example
	 * ```typescript
	 * ```typescript
	 * // Validate a 2x2 matrix
	 * AssertMatrix2([[1, 2], [3, 4]]);
	 * // This would throw an exception
	 * AssertMatrix2([[1, 2, 3], [4, 5, 6]]); // Too many columns
	 * ```
	 * ```
 */
export function AssertMatrix2(matrix: unknown, exception: IAssertMatrixException = {}): asserts matrix is TMatrix2 {
	// Initialize the exception with the default MatrixError class if not provided
	SetExceptionClass(exception, MatrixError);

	// Delegate to the general matrix assertion with 2x2 square matrix constraints
	// This ensures the matrix is exactly 2 rows by 2 columns
	AssertMatrix(matrix, { square: true, size: 2 }, exception);
}

/**
 * Validates that an unknown value is a valid 3x3 matrix.
 *
 * This function ensures that the provided value is a proper 3x3 matrix,
 * which should be a 2D array with exactly 3 rows and 3 columns containing numbers.
 *
 * @param matrix - The value to validate as a 3x3 matrix
 * @param exception - Custom exception details if validation fails
 * @throws {IAssertException} When the matrix is not a valid 3x3 matrix
 *
 * @example
	 * ```typescript
	 * ```typescript
	 * // Validate a 3x3 matrix
	 * AssertMatrix3([[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
	 * // This would throw an exception
	 * AssertMatrix3([[1, 2], [3, 4]]); // Too few rows and columns
	 * ```
	 * ```
 */
export function AssertMatrix3(matrix: unknown, exception: IAssertMatrixException = {}): asserts matrix is TMatrix3 {
	// Initialize the exception with the default MatrixError class if not provided
	SetExceptionClass(exception, MatrixError);

	// Delegate to the general matrix assertion with 3x3 square matrix constraints
	// This ensures the matrix is exactly 3 rows by 3 columns
	AssertMatrix(matrix, { square: true, size: 3 }, exception);
}

/**
 * Validates that an unknown value is a valid 4x4 matrix.
 *
 * This function ensures that the provided value is a proper 4x4 matrix,
 * which should be a 2D array with exactly 4 rows and 4 columns containing numbers.
 *
 * @param matrix - The value to validate as a 4x4 matrix
 * @param exception - Custom exception details if validation fails
 * @throws {IAssertException} When the matrix is not a valid 4x4 matrix
 *
 * @example
	 * ```typescript
	 * ```typescript
	 * // Validate a 4x4 matrix
	 * AssertMatrix4([
	 *   [1, 2, 3, 4],
	 *   [5, 6, 7, 8],
	 *   [9, 10, 11, 12],
	 *   [13, 14, 15, 16]
	 * ]);
	 * // This would throw an exception
	 * AssertMatrix4([[1, 2], [3, 4]]); // Too few rows and columns
	 * ```
	 * ```
 */
export function AssertMatrix4(matrix: unknown, exception: IAssertMatrixException = {}): asserts matrix is TMatrix4 {
	// Initialize the exception with the default MatrixError class if not provided
	SetExceptionClass(exception, MatrixError);

	// Delegate to the general matrix assertion with 4x4 square matrix constraints
	// This ensures the matrix is exactly 4 rows by 4 columns
	AssertMatrix(matrix, { square: true, size: 4 }, exception);
}

/**
 * Validates that an unknown value is a valid matrix without throwing an error.
 *
 * This function performs the same validation as AssertMatrix but returns
 * a boolean instead of throwing an exception, making it suitable for
 * conditional logic where exceptions are not desired.
 *
 * @param matrix - The value to validate as a matrix
 * @param args - Validation configuration options
 * @returns true if the matrix is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateMatrix(someValue, { square: true })) {
 *   // Process the valid square matrix
 * }
 * ```
 */
export function ValidateMatrix(matrix: unknown, args: IAssertMatrixArgs = {}): matrix is TMatrix {
	try {
		AssertMatrix(matrix, args);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates that an unknown value is a valid 1×1 matrix without throwing an error.
 *
 * @param matrix - The value to validate as a 1×1 matrix
 * @returns true if the matrix is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateMatrix1(someValue)) {
 *   // Process the valid 1×1 matrix
 * }
 * ```
 */
export function ValidateMatrix1(matrix: unknown): matrix is TMatrix1 {
	try {
		AssertMatrix1(matrix);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates that an unknown value is a valid 2×2 matrix without throwing an error.
 *
 * @param matrix - The value to validate as a 2×2 matrix
 * @returns true if the matrix is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateMatrix2(someValue)) {
 *   // Process the valid 2×2 matrix
 * }
 * ```
 */
export function ValidateMatrix2(matrix: unknown): matrix is TMatrix2 {
	try {
		AssertMatrix2(matrix);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates that an unknown value is a valid 3×3 matrix without throwing an error.
 *
 * @param matrix - The value to validate as a 3×3 matrix
 * @returns true if the matrix is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateMatrix3(someValue)) {
 *   // Process the valid 3×3 matrix
 * }
 * ```
 */
export function ValidateMatrix3(matrix: unknown): matrix is TMatrix3 {
	try {
		AssertMatrix3(matrix);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates that an unknown value is a valid 4×4 matrix without throwing an error.
 *
 * @param matrix - The value to validate as a 4×4 matrix
 * @returns true if the matrix is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateMatrix4(someValue)) {
 *   // Process the valid 4×4 matrix
 * }
 * ```
 */
export function ValidateMatrix4(matrix: unknown): matrix is TMatrix4 {
	try {
		AssertMatrix4(matrix);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates that an unknown value is a valid matrix row without throwing an error.
 *
 * @param row - The value to validate as a matrix row
 * @returns true if the row is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateMatrixRow([1, 2, 3])) {
 *   // Process the valid row
 * }
 * ```
 */
export function ValidateMatrixRow(row: unknown): row is number[] {
	try {
		AssertMatrixRow(row);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates that an unknown value is a valid matrix value (finite number) without throwing an error.
 *
 * @param value - The value to validate as a matrix element
 * @returns true if the value is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateMatrixValue(someValue)) {
 *   // Process the valid numeric value
 * }
 * ```
 */
export function ValidateMatrixValue(value: unknown): value is number {
	try {
		AssertMatrixValue(value);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates that two unknown values are compatible matrices without throwing an error.
 *
 * @param a - The first matrix to validate
 * @param b - The second matrix to validate
 * @param args - Validation configuration options
 * @returns true if both matrices are valid and compatible, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateMatrices(matrixA, matrixB, { transposition: true })) {
 *   // Process the valid and compatible matrices
 * }
 * ```
 */
export function ValidateMatrices(a: unknown, b: unknown, args: IAssertMatricesArgs = {}): boolean {
	try {
		AssertMatrices(a, b, args);
		return true;
	} catch {
		return false;
	}
}
