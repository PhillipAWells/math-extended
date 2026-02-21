import { AssertNumber } from '@pawells/typescript-common';
import { AssertMatrices, AssertMatrix, AssertMatrix1, AssertMatrix2, AssertMatrix3, AssertMatrix4, AssertMatrixRow, AssertMatrixValue } from './asserts.js';
import { MatrixCreate, MatrixIsSquare, MatrixSize } from './core.js';
import { IMatrix, IMatrix1, IMatrix2, IMatrix3, IMatrix4, TMatrixResult } from './types.js';
import { VectorIsValid } from '../vectors/core.js';
import { TVector, TVector2, TVector3, TVector4 } from '../vectors/types.js';
import { AssertVector } from '../vectors/asserts.js';

/**
 * Performs element-wise addition of two matrices.
 *
 * This function implements matrix addition using the standard mathematical definition:
 * `C[i,j] = A[i,j] + B[i,j]` for all valid indices i,j
 *
 * The operation requires both matrices to have identical dimensions and produces
 * a new matrix without modifying the input matrices. Matrix addition is both
 * commutative (A + B = B + A) and associative ((A + B) + C = A + (B + C)).
 *
 * **Properties:**
 * - Commutative: A + B = B + A
 * - Associative: (A + B) + C = A + (B + C)
 * - Identity element: A + 0 = A (where 0 is the zero matrix)
 * - Inverse element: A + (-A) = 0
 *
 * **Time Complexity:** O(m×n) where m and n are the matrix dimensions
 * **Space Complexity:** O(m×n) for the result matrix
 *
 * @template T - The matrix type extending IMatrix interface
 * @param a - First matrix (addend) - must have same dimensions as b
 * @param b - Second matrix (addend) - must have same dimensions as a
 * @returns {TMatrixResult<T>} A new matrix where each element is the sum of corresponding elements
 * @throws {Error} If matrices have different dimensions or contain invalid values
 *
 * @example
 * ```typescript
 * // Adding 2×2 matrices
 * MatrixAdd([[1, 2], [3, 4]], [[5, 6], [7, 8]]) // Returns [[6, 8], [10, 12]]
 *
 * // Adding 1×3 row vectors
 * MatrixAdd([[1, 2, 3]], [[4, 5, 6]]) // Returns [[5, 7, 9]]
 *
 * // Type-safe matrix addition with specific matrix types
 * const matrixA: IMatrix2 = [[1, 2], [3, 4]];
 * const matrixB: IMatrix2 = [[5, 6], [7, 8]];
 * const result: IMatrix2 = MatrixAdd(matrixA, matrixB);
 * ```
 */
export function MatrixAdd<T extends IMatrix>(a: T, b: T): TMatrixResult<T> {
	// Validate matrices have compatible dimensions for addition
	AssertMatrices(a, b);

	// Initialize result matrix with same dimensions as inputs
	const [arows, acols] = MatrixSize(a as IMatrix);
	const result = MatrixCreate(arows, acols);

	// Perform element-wise addition: C[i,j] = A[i,j] + B[i,j]
	for (let row = 0; row < arows; row++) {
		// Get row references for both input matrices
		const aRow = (a as IMatrix)[row];
		AssertMatrixRow(aRow);

		const bRow = (b as IMatrix)[row];
		AssertMatrixRow(bRow);

		// Get reference to result row for efficient access
		const resultRow = result[row];
		AssertMatrixRow(resultRow);

		// Add corresponding elements column by column
		for (let col = 0; col < acols; col++) {
			// Validate and extract values from both matrices
			const aVal = aRow[col];
			AssertMatrixValue(aVal, { rowIndex: row, columnIndex: col });

			const bVal = bRow[col];
			AssertMatrixValue(bVal, { rowIndex: row, columnIndex: col });

			// Store sum in result matrix
			resultRow[col] = aVal + bVal;
		}
	}

	return result as TMatrixResult<T>;
}

/**
 * Performs element-wise subtraction of two matrices (a - b).
 *
 * This function implements matrix subtraction using the standard mathematical definition:
 * `C[i,j] = A[i,j] - B[i,j]` for all valid indices i,j
 *
 * The operation requires both matrices to have identical dimensions and produces
 * a new matrix without modifying the input matrices. Note that matrix subtraction
 * is **not commutative**: A - B ≠ B - A in general.
 *
 * **Properties:**
 * - Non-commutative: A - B ≠ B - A (in general)
 * - Non-associative: (A - B) - C ≠ A - (B - C) (in general)
 * - Relationship to addition: A - B = A + (-B)
 * - Self-subtraction: A - A = 0 (zero matrix)
 *
 * **Time Complexity:** O(m×n) where m and n are the matrix dimensions
 * **Space Complexity:** O(m×n) for the result matrix
 *
 * @template T - The matrix type extending IMatrix interface
 * @param a - First matrix (minuend) - the matrix being subtracted from
 * @param b - Second matrix (subtrahend) - the matrix being subtracted
 * @returns {TMatrixResult<T>} A new matrix where each element is the difference of corresponding elements
 * @throws {Error} If matrices have different dimensions or contain invalid values
 *
 * @example
 * ```typescript
 * // Subtracting 2×2 matrices
 * MatrixSubtract([[10, 8], [6, 4]], [[3, 2], [1, 1]]) // Returns [[7, 6], [5, 3]]
 *
 * // Order matters: A - B ≠ B - A
 * MatrixSubtract([[1, 2]], [[3, 4]]) // Returns [[-2, -2]]
 * MatrixSubtract([[3, 4]], [[1, 2]]) // Returns [[2, 2]]
 *
 * // Self-subtraction produces zero matrix
 * MatrixSubtract([[5, 6]], [[5, 6]]) // Returns [[0, 0]]
 * ```
 */
export function MatrixSubtract<T extends IMatrix>(a: T, b: T): TMatrixResult<T> {
	// Validate matrices have compatible dimensions for subtraction
	AssertMatrices(a, b);

	// Initialize result matrix with same dimensions as inputs
	const [arows, acols] = MatrixSize(a);
	const result = MatrixCreate(arows, acols);

	// Perform element-wise subtraction: C[i,j] = A[i,j] - B[i,j]
	for (let row = 0; row < arows; row++) {
		// Get row references for both input matrices
		const aRow = a[row];
		AssertMatrixRow(aRow);

		const bRow = b[row];
		AssertMatrixRow(bRow);

		// Get reference to result row for efficient access
		const resultRow = result[row];
		AssertMatrixRow(resultRow);

		// Subtract corresponding elements column by column
		for (let col = 0; col < acols; col++) {
			const aVal = aRow[col];
			AssertMatrixValue(aVal, { rowIndex: row, columnIndex: col });

			const bVal = bRow[col];
			AssertMatrixValue(bVal, { rowIndex: row, columnIndex: col });

			// Store difference in result matrix
			resultRow[col] = aVal - bVal;
		}
	}

	return result as TMatrixResult<T>;
}

/**
 * Performs matrix multiplication with comprehensive type-safe overloads for matrices, vectors, and scalars.
 *
 * This function serves as a smart dispatcher that automatically routes to the most
 * appropriate multiplication algorithm based on the type and characteristics of the
 * second operand. The function provides extensive overloaded signatures for complete
 * type safety and optimal performance across different operation types and matrix sizes.
 *
 * **Type-Safe Overloads:**
 * - **Scalar Multiplication:**
 *   - `IMatrix1 × number → IMatrix1` (1×1 matrix scalar multiplication)
 *   - `IMatrix2 × number → IMatrix2` (2×2 matrix scalar multiplication)
 *   - `IMatrix3 × number → IMatrix3` (3×3 matrix scalar multiplication)
 *   - `IMatrix4 × number → IMatrix4` (4×4 matrix scalar multiplication)
 *   - `IMatrix × number → IMatrix` (general matrix scalar multiplication)
 *
 * - **Vector Multiplication:**
 *   - `IMatrix2 × TVector2 → TVector2` (2×2 matrix × 2D vector)
 *   - `IMatrix3 × TVector3 → TVector3` (3×3 matrix × 3D vector)
 *   - `IMatrix4 × TVector4 → TVector4` (4×4 matrix × 4D vector)
 *   - `IMatrix × TVector → TVector` (general matrix × vector)
 *
 * - **Matrix Multiplication:**
 *   - `IMatrix1 × IMatrix1 → IMatrix1` (1×1 matrix multiplication)
 *   - `IMatrix2 × IMatrix2 → IMatrix2` (2×2 matrix multiplication)
 *   - `IMatrix3 × IMatrix3 → IMatrix3` (3×3 matrix multiplication)
 *   - `IMatrix4 × IMatrix4 → IMatrix4` (4×4 matrix multiplication)
 *   - `IMatrix × IMatrix → IMatrix` (general matrix multiplication)
 *
 * **Operation Types:**
 * - **Matrix × Scalar:** Element-wise multiplication by scalar value
 * - **Matrix × Vector:** Matrix-vector multiplication producing a column vector
 * - **Matrix × Matrix:** Full matrix multiplication with algorithm optimization
 *
 * **Algorithm Selection (for matrix-matrix multiplication):**
 * - 1×1 to 4×4 square matrices: Hardcoded optimized formulas
 * - Large square matrices (≥32×32): Strassen's algorithm O(n^2.807)
 * - All other cases: Standard algorithm O(n³)
 *
 * **Mathematical Properties:**
 * - Matrix multiplication is associative: (AB)C = A(BC)
 * - Matrix multiplication is generally not commutative: AB ≠ BA
 * - Scalar multiplication is commutative: kA = Ak
 * - Distributive over addition: A(B + C) = AB + AC
 *
 * @param a - First matrix (left operand) with dimensions m×n
 * @param b - Second operand: matrix (n×p), vector (n elements), or scalar number
 * @returns {IMatrix | TVector} The product result:
 *   - For scalar: m×n matrix with each element multiplied by scalar
 *   - For vector: m×1 column vector matrix
 *   - For matrix: m×p product matrix
 * @throws {Error} If matrix dimensions are incompatible for multiplication
 *
 * @example
 * ```typescript
 * // Type-safe scalar multiplication with specific matrix types
 * const matrix2: IMatrix2 = [[1, 2], [3, 4]];
 * const scalar2Result: IMatrix2 = MatrixMultiply(matrix2, 2); // [[2, 4], [6, 8]]
 *
 * const matrix3: IMatrix3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
 * const scalar3Result: IMatrix3 = MatrixMultiply(matrix3, 5); // Identity × 5
 *
 * // Type-safe vector multiplication with specific matrix/vector types
 * const matrix2x2: IMatrix2 = [[1, 2], [3, 4]];
 * const vector2: TVector2 = [5, 6];
 * const vectorResult: TVector2 = MatrixMultiply(matrix2x2, vector2); // [17, 39]
 *
 * const matrix4x4: IMatrix4 = [[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]];
 * const vector4: TVector4 = [1, 2, 3, 4];
 * const vector4Result: TVector4 = MatrixMultiply(matrix4x4, vector4); // [1, 2, 3, 4]
 *
 * // Type-safe matrix multiplication with specific matrix types
 * const matrixA: IMatrix2 = [[1, 2], [3, 4]];
 * const matrixB: IMatrix2 = [[5, 6], [7, 8]];
 * const matrixResult: IMatrix2 = MatrixMultiply(matrixA, matrixB); // [[19, 22], [43, 50]]
 *
 * // General matrix operations (fallback to generic types)
 * MatrixMultiply([[1, 2]], [[3], [4]]) // Returns [[11]]
 * MatrixMultiply([[1], [2]], [[3, 4]]) // Returns [[3, 4], [6, 8]]
 *
 * // Type detection is automatic - no need to specify operation type
 * const scalarResult = MatrixMultiply(matrixA, 5);        // Scalar multiplication
 * const vectorResult2 = MatrixMultiply(matrixA, vector2);  // Vector multiplication
 * const matrixResult2 = MatrixMultiply(matrixA, matrixB); // Matrix multiplication
 * ```
 */

export function MatrixMultiply(a: IMatrix1, b: number): IMatrix1;

export function MatrixMultiply(a: IMatrix2, b: number): IMatrix2;

export function MatrixMultiply(a: IMatrix3, b: number): IMatrix3;

export function MatrixMultiply(a: IMatrix4, b: number): IMatrix4;

export function MatrixMultiply(a: IMatrix2, b: TVector2): TVector2;

export function MatrixMultiply(a: IMatrix3, b: TVector3): TVector3;

export function MatrixMultiply(a: IMatrix4, b: TVector4): TVector4;

export function MatrixMultiply(a: IMatrix1, b: IMatrix1): IMatrix1;

export function MatrixMultiply(a: IMatrix2, b: IMatrix2): IMatrix2;

export function MatrixMultiply(a: IMatrix3, b: IMatrix3): IMatrix3;

export function MatrixMultiply(a: IMatrix4, b: IMatrix4): IMatrix4;

export function MatrixMultiply(a: IMatrix, b: TVector): TVector;

export function MatrixMultiply(a: IMatrix, b: IMatrix): IMatrix;

export function MatrixMultiply(a: IMatrix, b: number): IMatrix;

export function MatrixMultiply(a: IMatrix, b: IMatrix | TVector | number): IMatrix | TVector {
	AssertMatrix(a);

	// Route to appropriate multiplication algorithm based on operand type
	if (typeof b === 'number') return matrixMultiplyScalar(a, b);
	if (VectorIsValid(b)) return matrixMultiplyVector(a, b as TVector);
	return matrixMultiplyMatrix(a, b as IMatrix);
}

/**
 * Performs scalar multiplication on a matrix with comprehensive type-safe overloads.
 *
 * This function implements scalar-matrix multiplication where every element of the
 * matrix is multiplied by the same scalar value. This operation is equivalent to
 * scaling the entire matrix uniformly and is fundamental in linear algebra.
 *
 * **Type-Safe Overloads:**
 * - `IMatrix1 × number → IMatrix1` (1×1 matrix scalar multiplication)
 * - `IMatrix2 × number → IMatrix2` (2×2 matrix scalar multiplication)
 * - `IMatrix3 × number → IMatrix3` (3×3 matrix scalar multiplication)
 * - `IMatrix4 × number → IMatrix4` (4×4 matrix scalar multiplication)
 * - `IMatrix × number → IMatrix` (general matrix scalar multiplication)
 *
 * **Mathematical notation:** `C[i,j] = k × A[i,j]` where k is the scalar
 *
 * **Properties:**
 * - Commutative: k × A = A × k
 * - Distributive over matrix addition: k × (A + B) = k × A + k × B
 * - Distributive over scalar addition: (k + l) × A = k × A + l × A
 * - Associative with scalar multiplication: (kl) × A = k × (l × A)
 * - Identity element: 1 × A = A
 * - Zero element: 0 × A = 0 (zero matrix)
 *
 * **Time Complexity:** O(m×n) where m and n are the matrix dimensions
 * **Space Complexity:** O(m×n) for the result matrix
 *
 * @param matrix - The matrix to multiply with dimensions m×n
 * @param scalar - The scalar value to multiply each element by
 * @returns {IMatrix} A new m×n matrix with each element multiplied by the scalar
 * @throws {Error} If matrix is invalid or scalar is not a valid number
 *
 * @example
 * ```typescript
 * // Type-safe scalar multiplication with specific matrix types
 * const matrix2: IMatrix2 = [[1, 2], [3, 4]];
 * const result2: IMatrix2 = matrixMultiplyScalar(matrix2, 3); // [[3, 6], [9, 12]]
 *
 * const matrix3: IMatrix3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
 * const result3: IMatrix3 = matrixMultiplyScalar(matrix3, 2); // Identity × 2
 *
 * // Scale with decimal values
 * matrixMultiplyScalar([[2, -4]], 0.5) // Returns [[1, -2]]
 *
 * // Zero scaling produces zero matrix
 * matrixMultiplyScalar([[1, 2], [3, 4]], 0) // Returns [[0, 0], [0, 0]]
 *
 * // Negative scaling reverses signs
 * matrixMultiplyScalar([[1, -2]], -1) // Returns [[-1, 2]]
 *
 * // Identity scaling preserves matrix
 * matrixMultiplyScalar([[5, 7], [2, 9]], 1) // Returns [[5, 7], [2, 9]]
 * ```
 */
function matrixMultiplyScalar(matrix: IMatrix1, scalar: number): IMatrix1;
function matrixMultiplyScalar(matrix: IMatrix2, scalar: number): IMatrix2;
function matrixMultiplyScalar(matrix: IMatrix3, scalar: number): IMatrix3;
function matrixMultiplyScalar(matrix: IMatrix4, scalar: number): IMatrix4;
function matrixMultiplyScalar(matrix: IMatrix, scalar: number): IMatrix;

function matrixMultiplyScalar(matrix: IMatrix, scalar: number): IMatrix {
	AssertMatrix(matrix);
	AssertNumber(scalar, { finite: true }, { message: 'Scalar multiplier must be a valid number' });

	const [rows, cols] = MatrixSize(matrix);
	const result = MatrixCreate(rows, cols);

	// Apply scalar multiplication to each matrix element
	for (let row = 0; row < rows; row++) {
		const matrixRow = matrix[row];
		AssertMatrixRow(matrixRow);

		const resultRow = result[row];
		AssertMatrixRow(resultRow);

		// Multiply each element in the row by the scalar
		for (let col = 0; col < cols; col++) {
			const val = matrixRow[col];
			AssertMatrixValue(val, { rowIndex: row, columnIndex: col });
			resultRow[col] = val * scalar;
		}
	}

	return result;
}

/**
 * Performs matrix-vector multiplication with comprehensive type-safe overloads.
 *
 * This function implements the standard matrix-vector multiplication where each element
 * of the resulting vector is computed as the dot product of the corresponding matrix row
 * with the input vector. The operation requires the number of matrix columns to equal
 * the vector length.
 *
 * **Type-Safe Overloads:**
 * - `IMatrix2 × TVector2 → TVector2` (2×2 matrix × 2D vector)
 * - `IMatrix3 × TVector3 → TVector3` (3×3 matrix × 3D vector)
 * - `IMatrix4 × TVector4 → TVector4` (4×4 matrix × 4D vector)
 * - `IMatrix × TVector → TVector` (general matrix × vector)
 *
 * **Mathematical notation:** `result[i] = Σ(matrix[i,j] × vector[j])` for j=0 to n-1
 *
 * The operation transforms a vector through the linear transformation represented by
 * the matrix, which is fundamental in computer graphics, physics simulations, and
 * many other mathematical applications.
 *
 * **Dimensional Requirements:**
 * - Matrix dimensions: m×n (m rows, n columns)
 * - Vector length: n
 * - Result vector length: m
 *
 * **Time Complexity:** O(m×n) where m is matrix rows and n is matrix columns
 * **Space Complexity:** O(m) for the result vector
 *
 * @param matrix - The matrix to multiply (m×n dimensions)
 * @param vector - The vector to multiply (length n, must match matrix column count)
 * @returns {TVector} The resulting vector (length m, matching matrix row count)
 * @throws {Error} If matrix columns don't match vector length or contain invalid values
 *
 * @example
 * ```typescript
 * // Type-safe matrix-vector multiplication with specific types
 * const matrix2: IMatrix2 = [[1, 2], [3, 4]];
 * const vector2: TVector2 = [5, 6];
 * const result2: TVector2 = matrixMultiplyVector(matrix2, vector2); // [17, 39]
 *
 * const matrix3: IMatrix3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
 * const vector3: TVector3 = [2, 3, 4];
 * const result3: TVector3 = matrixMultiplyVector(matrix3, vector3); // [2, 3, 4]
 *
 * // 2×3 matrix multiplied by 3D vector
 * matrixMultiplyVector(
 *   [[1, 2, 3], [4, 5, 6]],
 *   [7, 8, 9]
 * ) // Returns [50, 122]
 * // Calculation:
 * // [1*7+2*8+3*9, 4*7+5*8+6*9] = [7+16+27, 28+40+54] = [50, 122]
 *
 * // Identity matrix preserves the vector
 * matrixMultiplyVector([[1, 0], [0, 1]], [5, 3]) // Returns [5, 3]
 *
 * // 3×2 matrix with 2D vector
 * matrixMultiplyVector([[1, 2], [3, 4], [5, 6]], [10, 20])
 * // Returns [50, 110, 170]
 * ```
 */
function matrixMultiplyVector(matrix: IMatrix2, vector: TVector2): TVector2;
function matrixMultiplyVector(matrix: IMatrix3, vector: TVector3): TVector3;
function matrixMultiplyVector(matrix: IMatrix4, vector: TVector4): TVector4;
function matrixMultiplyVector(matrix: IMatrix, vector: TVector): TVector;

function matrixMultiplyVector(matrix: IMatrix, vector: TVector): TVector {
	// Validate inputs
	AssertMatrix(matrix);
	AssertVector(vector);

	// Get matrix dimensions
	const [matrixRows, matrixCols] = MatrixSize(matrix);

	// Verify dimensional compatibility: matrix columns must equal vector length
	if (matrixCols !== vector.length) {
		throw new Error(`Matrix-vector multiplication requires matrix columns (${matrixCols}) to equal vector length (${vector.length})`);
	}

	// Initialize result vector with same length as matrix rows
	const result: number[] = new Array(matrixRows);

	// Compute each element of the result vector
	for (let row = 0; row < matrixRows; row++) {
		// Get matrix row reference
		const matrixRow = matrix[row];
		AssertMatrixRow(matrixRow);

		// Compute dot product of matrix row with vector
		let dotProduct = 0;

		for (let col = 0; col < matrixCols; col++) {
			// Validate matrix element
			const matrixElement = matrixRow[col];
			AssertMatrixValue(matrixElement, { rowIndex: row, columnIndex: col });

			// Validate vector element
			const vectorElement = vector[col];
			AssertNumber(vectorElement);

			// Add to dot product
			dotProduct += matrixElement * vectorElement;
		}

		// Store result
		result[row] = dotProduct;
	}

	return result;
}

/**
 * Performs matrix-matrix multiplication using optimized algorithms with comprehensive type-safe overloads.
 *
 * This function implements the standard matrix multiplication algorithm with automatic
 * optimization based on matrix characteristics. It serves as the core multiplication
 * engine with intelligent algorithm selection for optimal performance across different
 * matrix sizes and types.
 *
 * **Type-Safe Overloads:**
 * - `IMatrix1 × IMatrix1 → IMatrix1` (1×1 matrix multiplication)
 * - `IMatrix2 × IMatrix2 → IMatrix2` (2×2 matrix multiplication)
 * - `IMatrix3 × IMatrix3 → IMatrix3` (3×3 matrix multiplication)
 * - `IMatrix4 × IMatrix4 → IMatrix4` (4×4 matrix multiplication)
 * - `IMatrix × IMatrix → IMatrix` (general matrix multiplication)
 *
 * **Algorithm Selection Strategy:**
 * - **1×1, 2×2, 3×3, 4×4 square matrices:** Hardcoded optimized formulas (fastest)
 * - **Large square matrices (≥32×32):** Strassen's algorithm O(n^2.807) (asymptotically faster)
 * - **All other cases:** Standard algorithm O(n³) (general purpose, most stable)
 *
 * **Mathematical notation:** `C[i,j] = Σ(A[i,k] × B[k,j])` for k=0 to n-1
 *
 * The operation computes each element of the result matrix as the dot product
 * of the corresponding row from the first matrix and column from the second matrix.
 * This is the fundamental operation underlying many linear algebra computations.
 *
 * **Performance Optimizations:**
 * - Zero-multiplication skipping in standard algorithm
 * - Type-specific optimized implementations for small matrices
 * - Strassen's divide-and-conquer for large matrices
 * - Efficient memory access patterns to maximize cache performance
 * - Compile-time optimizations for fixed-size matrices
 *
 * **Time Complexity:**
 * - Small matrices (1×1 to 4×4): O(1) hardcoded operations
 * - Large matrices (≥32×32): O(n^2.807) using Strassen's algorithm
 * - General case: O(n³) using standard algorithm
 *
 * **Space Complexity:** O(m×p) for result matrix where A is m×n and B is n×p
 *
 * @param a - First matrix with dimensions m×n
 * @param b - Second matrix with dimensions n×p (must match first matrix's column count)
 * @returns {IMatrix} The product matrix with dimensions m×p
 * @throws {Error} If matrices have incompatible dimensions for multiplication
 *
 * @example
 * ```typescript
 * // Type-safe matrix multiplication with specific matrix types
 * const matrixA: IMatrix2 = [[1, 2], [3, 4]];
 * const matrixB: IMatrix2 = [[5, 6], [7, 8]];
 * const result2: IMatrix2 = matrixMultiplyMatrix(matrixA, matrixB); // [[19, 22], [43, 50]]
 *
 * const matrix3A: IMatrix3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
 * const matrix3B: IMatrix3 = [[2, 3, 4], [5, 6, 7], [8, 9, 10]];
 * const result3: IMatrix3 = matrixMultiplyMatrix(matrix3A, matrix3B); // Identity × matrix3B
 *
 * // 2×3 × 3×2 multiplication
 * matrixMultiplyMatrix(
 *   [[1, 2, 3], [4, 5, 6]],
 *   [[7, 8], [9, 10], [11, 12]]
 * ) // Returns [[58, 64], [139, 154]]
 * // Calculation:
 * // [1*7+2*9+3*11, 1*8+2*10+3*12] = [58, 64]
 * // [4*7+5*9+6*11, 4*8+5*10+6*12] = [139, 154]
 *
 * // Square matrix multiplication (uses optimized algorithm for 2×2)
 * matrixMultiplyMatrix([[1, 2], [3, 4]], [[5, 6], [7, 8]])
 * // Returns [[19, 22], [43, 50]]
 *
 * // Identity matrix multiplication (preserves input)
 * matrixMultiplyMatrix([[1, 2], [3, 4]], [[1, 0], [0, 1]])
 * // Returns [[1, 2], [3, 4]] (unchanged)
 *
 * // Large matrix automatically uses Strassen algorithm
 * const large = MatrixCreate(64, 64); // 64×64 matrices
 * const result = matrixMultiplyMatrix(large, large); // Uses Strassen internally
 * ```
 */
function matrixMultiplyMatrix(a: IMatrix1, b: IMatrix1): IMatrix1;
function matrixMultiplyMatrix(a: IMatrix2, b: IMatrix2): IMatrix2;
function matrixMultiplyMatrix(a: IMatrix3, b: IMatrix3): IMatrix3;
function matrixMultiplyMatrix(a: IMatrix4, b: IMatrix4): IMatrix4;
function matrixMultiplyMatrix(a: IMatrix, b: IMatrix): IMatrix;

function matrixMultiplyMatrix(a: IMatrix, b: IMatrix): IMatrix {
	// Validate matrices are compatible for multiplication (a.columns === b.rows)
	AssertMatrices(a, b, { transposition: true });

	const [arows, acols] = MatrixSize(a);
	const aSquare = MatrixIsSquare(a);
	const [brows, bcols] = MatrixSize(b);
	const bSquare = MatrixIsSquare(b);

	// Use optimized algorithms for specific square matrix sizes
	if (aSquare && bSquare && arows === brows && acols === bcols) {
		const aSizeSquare = arows;
		if (aSizeSquare === 1) {
			AssertMatrix1(a);
			AssertMatrix1(b);
			return matrixMultiplyMatrix1(a, b);
		} else if (aSizeSquare === 2) {
			AssertMatrix2(a);
			AssertMatrix2(b);
			return matrixMultiplyMatrix2(a, b);
		} else if (aSizeSquare === 3) {
			AssertMatrix3(a);
			AssertMatrix3(b);
			return matrixMultiplyMatrix3(a, b);
		} else if (aSizeSquare === 4) {
			AssertMatrix4(a);
			AssertMatrix4(b);
			return matrixMultiplyMatrix4(a, b);
		} else if (aSizeSquare >= 32) {
			// Use Strassen algorithm for large square matrices (≥32×32)
			// Provides better asymptotic performance O(n^2.807) vs O(n³)
			return matrixMultiplyStrassen(a, b);
		}
	}

	// Standard O(n³) algorithm for general case: C[i,j] = Σ(A[i,k] × B[k,j])
	const result = MatrixCreate(arows, bcols);

	// Iterate through each position in the result matrix
	for (let row = 0; row < arows; row++) {
		const aRow = a[row];
		AssertMatrixRow(aRow);

		const resultRow = result[row];
		AssertMatrixRow(resultRow);

		for (let col = 0; col < bcols; col++) {
			let sum = 0;

			// Compute dot product of matrix A row with matrix B column
			for (let k = 0; k < acols; k++) {
				const aVal = aRow[k];
				AssertMatrixValue(aVal, { rowIndex: row, columnIndex: k });

				const bRow = b[k];
				AssertMatrixRow(bRow);

				const bVal = bRow[col];
				AssertMatrixValue(bVal, { rowIndex: k, columnIndex: col });

				// Skip multiplication if either operand is zero (performance optimization)
				if (aVal === 0 || bVal === 0) continue;
				sum += aVal * bVal;
			}
			resultRow[col] = sum;
		}
	}

	return result;
}

/**
 * Optimized multiplication for 1×1 matrices.
 *
 * For 1×1 matrices, multiplication reduces to simple scalar multiplication of the
 * two single elements. This optimization completely avoids the overhead of nested
 * loops and provides the fastest possible execution for this trivial case.
 *
 * **Mathematical formula:** `[[a]] × [[b]] = [[a×b]]`
 *
 * This function is primarily used as a base case in recursive algorithms and for
 * completeness in the optimization hierarchy. While seemingly trivial, it provides
 * measurable performance benefits in recursive divide-and-conquer algorithms like
 * Strassen multiplication.
 *
 * **Time Complexity:** O(1) - constant time operation
 * **Space Complexity:** O(1) - single element allocation
 *
 * @param a - First 1×1 matrix [[a]]
 * @param b - Second 1×1 matrix [[b]]
 * @returns {IMatrix1} The product as a 1×1 matrix [[a×b]]
 *
 * @example
 * ```typescript
 * // Simple scalar values in matrix form
 * matrixMultiplyMatrix1([[5]], [[3]]) // Returns [[15]]
 *
 * // Decimal multiplication
 * matrixMultiplyMatrix1([[2.5]], [[4]]) // Returns [[10]]
 *
 * // Negative values
 * matrixMultiplyMatrix1([[-3]], [[7]]) // Returns [[-21]]
 *
 * // Zero multiplication
 * matrixMultiplyMatrix1([[0]], [[999]]) // Returns [[0]]
 * ```
 */
function matrixMultiplyMatrix1(a: IMatrix1, b: IMatrix1): IMatrix1 {
	return [[a[0][0] * b[0][0]]];
}

/**
 * Optimized multiplication for 2×2 matrices.
 *
 * This function implements hardcoded 2×2 matrix multiplication using direct
 * element calculations, completely avoiding loop overhead. This optimization
 * is particularly valuable since 2×2 matrices are commonly used in 2D graphics,
 * rotation transformations, and as building blocks in recursive algorithms.
 *
 * Mathematical expansion of C = A × B:
 * C[0,0] = A[0,0]×B[0,0] + A[0,1]×B[1,0]
 * C[0,1] = A[0,0]×B[0,1] + A[0,1]×B[1,1]
 * C[1,0] = A[1,0]×B[0,0] + A[1,1]×B[1,0]
 * C[1,1] = A[1,0]×B[0,1] + A[1,1]×B[1,1]
 *
 * Applications:
 * - 2D rotation and scaling transformations
 * - Linear system solutions (2x2 case)
 * - Recursive matrix algorithms (Strassen base case)
 * - Computer graphics operations
 *
 * Time Complexity: O(1) - exactly 8 multiplications and 4 additions
 * Space Complexity: O(1) - fixed 2×2 result allocation
 *
 * @param a - First 2×2 matrix
 * @param b - Second 2×2 matrix
 * @returns {IMatrix2} The product as a 2×2 matrix
 * @example
 * ```typescript
 * // Standard 2x2 multiplication
 * matrixMultiplyMatrix2([[1, 2], [3, 4]], [[5, 6], [7, 8]])
 * // Returns [[19, 22], [43, 50]]
 * // Calculation:
 * // [1*5+2*7, 1*6+2*8] = [19, 22]
 * // [3*5+4*7, 3*6+4*8] = [43, 50]
 *
 * // 2D rotation by 90 degrees (rotation matrix)
 * matrixMultiplyMatrix2([[0, -1], [1, 0]], [[1, 0], [0, 1]])
 * // Returns [[0, -1], [1, 0]]
 *
 * // Scaling transformation
 * matrixMultiplyMatrix2([[2, 0], [0, 3]], [[1, 2], [3, 4]])
 * // Returns [[2, 4], [9, 12]]
 * ```
 */
function matrixMultiplyMatrix2(a: IMatrix2, b: IMatrix2): IMatrix2 {
	return [
		[
			(a[0][0] * b[0][0]) + (a[0][1] * b[1][0]),  // C[0,0]
			(a[0][0] * b[0][1]) + (a[0][1] * b[1][1]),   // C[0,1]
		],
		[
			(a[1][0] * b[0][0]) + (a[1][1] * b[1][0]),  // C[1,0]
			(a[1][0] * b[0][1]) + (a[1][1] * b[1][1]),   // C[1,1]
		],
	];
}

/**
 * Optimized multiplication for 3×3 matrices.
 *
 * This function implements hardcoded 3×3 matrix multiplication using direct
 * element calculations. 3×3 matrices are extensively used in 3D computer graphics
 * for representing rotations, scaling, shearing, and other linear transformations
 * in homogeneous coordinate systems.
 *
 * Mathematical expansion: Each element C[i,j] = Σ(A[i,k] × B[k,j]) for k=0,1,2
 *
 * Applications:
 * - 3D rotation matrices (Euler angles, axis-angle representations)
 * - 3D scaling and shearing transformations
 * - Camera transformations in computer graphics
 * - Crystallography and materials science calculations
 * - Robotic arm kinematics (rotation components)
 *
 * Performance Benefits:
 * - Eliminates loop overhead with direct calculations
 * - 27 hardcoded multiplications and 18 additions
 * - Optimal cache usage with predictable memory access
 * - Compiler can optimize register allocation
 *
 * Time Complexity: O(1) - exactly 27 multiplications and 18 additions
 * Space Complexity: O(1) - fixed 3×3 result allocation
 *
 * @param a - First 3×3 matrix
 * @param b - Second 3×3 matrix
 * @returns {IMatrix3} The product as a 3×3 matrix
 * @example
 * ```typescript
 * // 3D rotation matrix multiplication (combining rotations)
 * const rotX = [[1, 0, 0], [0, 0.707, -0.707], [0, 0.707, 0.707]]; // X rotation
 * const rotY = [[0.707, 0, 0.707], [0, 1, 0], [-0.707, 0, 0.707]]; // Y rotation
 * matrixMultiplyMatrix3(rotX, rotY) // Combined X-Y rotation
 *
 * // Identity matrix test
 * matrixMultiplyMatrix3([[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 0, 0], [0, 1, 0], [0, 0, 1]])
 * // Returns [[1, 2, 3], [4, 5, 6], [7, 8, 9]] (unchanged)
 *
 * // Scaling transformation
 * matrixMultiplyMatrix3([[2, 0, 0], [0, 3, 0], [0, 0, 4]], [[1, 1, 1], [1, 1, 1], [1, 1, 1]])
 * // Returns [[2, 2, 2], [3, 3, 3], [4, 4, 4]]
 * ```
 */
function matrixMultiplyMatrix3(a: IMatrix3, b: IMatrix3): IMatrix3 {
	return [
		[
			// Row 0: [a00*b00 + a01*b10 + a02*b20, a00*b01 + a01*b11 + a02*b21, a00*b02 + a01*b12 + a02*b22]
			(a[0][0] * b[0][0]) + (a[0][1] * b[1][0]) + (a[0][2] * b[2][0]),
			(a[0][0] * b[0][1]) + (a[0][1] * b[1][1]) + (a[0][2] * b[2][1]),
			(a[0][0] * b[0][2]) + (a[0][1] * b[1][2]) + (a[0][2] * b[2][2]),
		],
		[
			// Row 1: [a10*b00 + a11*b10 + a12*b20, a10*b01 + a11*b11 + a12*b21, a10*b02 + a11*b12 + a12*b22]
			(a[1][0] * b[0][0]) + (a[1][1] * b[1][0]) + (a[1][2] * b[2][0]),
			(a[1][0] * b[0][1]) + (a[1][1] * b[1][1]) + (a[1][2] * b[2][1]),
			(a[1][0] * b[0][2]) + (a[1][1] * b[1][2]) + (a[1][2] * b[2][2]),
		],
		[
			// Row 2: [a20*b00 + a21*b10 + a22*b20, a20*b01 + a21*b11 + a22*b21, a20*b02 + a21*b12 + a22*b22]
			(a[2][0] * b[0][0]) + (a[2][1] * b[1][0]) + (a[2][2] * b[2][0]),
			(a[2][0] * b[0][1]) + (a[2][1] * b[1][1]) + (a[2][2] * b[2][1]),
			(a[2][0] * b[0][2]) + (a[2][1] * b[1][2]) + (a[2][2] * b[2][2]),
		],
	];
}

/**
 * Optimized multiplication for 4×4 matrices.
 *
 * This function implements hardcoded 4×4 matrix multiplication using direct
 * element calculations. 4×4 matrices are the cornerstone of 3D computer graphics,
 * enabling homogeneous coordinate transformations that can represent translation,
 * rotation, scaling, and perspective projection in a unified mathematical framework.
 *
 * Mathematical expansion: Each element C[i,j] = Σ(A[i,k] × B[k,j]) for k=0,1,2,3
 *
 * Applications:
 * - 3D graphics transformation pipelines (model-view-projection matrices)
 * - Homogeneous coordinate transformations (translation + rotation + scaling)
 * - Perspective and orthographic projection matrices
 * - Camera transformations and view matrices
 * - Skeletal animation bone transformations
 * - Virtual reality and augmented reality systems
 *
 * Homogeneous Coordinates Structure:
 * [Rotation/Scale | Translation]
 * [      0       |      1     ]
 *
 * Performance Benefits:
 * - Eliminates loop overhead with 64 direct calculations
 * - Optimal for graphics transformation chains
 * - Predictable memory access patterns
 * - Compiler-optimizable register allocation
 *
 * Time Complexity: O(1) - exactly 64 multiplications and 48 additions
 * Space Complexity: O(1) - fixed 4×4 result allocation
 *
 * @param a - First 4×4 matrix (typically a transformation matrix)
 * @param b - Second 4×4 matrix (typically another transformation matrix)
 * @returns {IMatrix4} The product as a 4×4 matrix (combined transformation)
 * @example
 * ```typescript
 * // Combine translation and rotation matrices (common in 3D graphics)
 * const translation = [[1,0,0,5], [0,1,0,3], [0,0,1,0], [0,0,0,1]]; // Translate by (5,3,0)
 * const rotation = [[0,-1,0,0], [1,0,0,0], [0,0,1,0], [0,0,0,1]];    // 90° Z rotation
 * matrixMultiplyMatrix4(translation, rotation); // Combined transform
 *
 * // Identity matrix test (should return unchanged matrix)
 * const testMatrix = [[1,2,3,4], [5,6,7,8], [9,10,11,12], [13,14,15,16]];
 * const identity = [[1,0,0,0], [0,1,0,0], [0,0,1,0], [0,0,0,1]];
 * matrixMultiplyMatrix4(testMatrix, identity) // Returns testMatrix unchanged
 *
 * // Perspective projection matrix combination
 * const projection = [[2,0,0,0], [0,2,0,0], [0,0,-1,-1], [0,0,-2,0]];
 * const view = [[1,0,0,0], [0,1,0,0], [0,0,1,-10], [0,0,0,1]];
 * matrixMultiplyMatrix4(projection, view); // Combined projection-view matrix
 * ```
 */
function matrixMultiplyMatrix4(a: IMatrix4, b: IMatrix4): IMatrix4 {
	return [
		[
			// Row 0: Transform of basis vector [1,0,0,0]
			(a[0][0] * b[0][0]) + (a[0][1] * b[1][0]) + (a[0][2] * b[2][0]) + (a[0][3] * b[3][0]),
			(a[0][0] * b[0][1]) + (a[0][1] * b[1][1]) + (a[0][2] * b[2][1]) + (a[0][3] * b[3][1]),
			(a[0][0] * b[0][2]) + (a[0][1] * b[1][2]) + (a[0][2] * b[2][2]) + (a[0][3] * b[3][2]),
			(a[0][0] * b[0][3]) + (a[0][1] * b[1][3]) + (a[0][2] * b[2][3]) + (a[0][3] * b[3][3]),
		],
		[
			// Row 1: Transform of basis vector [0,1,0,0]
			(a[1][0] * b[0][0]) + (a[1][1] * b[1][0]) + (a[1][2] * b[2][0]) + (a[1][3] * b[3][0]),
			(a[1][0] * b[0][1]) + (a[1][1] * b[1][1]) + (a[1][2] * b[2][1]) + (a[1][3] * b[3][1]),
			(a[1][0] * b[0][2]) + (a[1][1] * b[1][2]) + (a[1][2] * b[2][2]) + (a[1][3] * b[3][2]),
			(a[1][0] * b[0][3]) + (a[1][1] * b[1][3]) + (a[1][2] * b[2][3]) + (a[1][3] * b[3][3]),
		],
		[
			// Row 2: Transform of basis vector [0,0,1,0]
			(a[2][0] * b[0][0]) + (a[2][1] * b[1][0]) + (a[2][2] * b[2][0]) + (a[2][3] * b[3][0]),
			(a[2][0] * b[0][1]) + (a[2][1] * b[1][1]) + (a[2][2] * b[2][1]) + (a[2][3] * b[3][1]),
			(a[2][0] * b[0][2]) + (a[2][1] * b[1][2]) + (a[2][2] * b[2][2]) + (a[2][3] * b[3][2]),
			(a[2][0] * b[0][3]) + (a[2][1] * b[1][3]) + (a[2][2] * b[2][3]) + (a[2][3] * b[3][3]),
		],
		[
			// Row 3: Transform of basis vector [0,0,0,1] (usually homogeneous coordinates)
			(a[3][0] * b[0][0]) + (a[3][1] * b[1][0]) + (a[3][2] * b[2][0]) + (a[3][3] * b[3][0]),
			(a[3][0] * b[0][1]) + (a[3][1] * b[1][1]) + (a[3][2] * b[2][1]) + (a[3][3] * b[3][1]),
			(a[3][0] * b[0][2]) + (a[3][1] * b[1][2]) + (a[3][2] * b[2][2]) + (a[3][3] * b[3][2]),
			(a[3][0] * b[0][3]) + (a[3][1] * b[1][3]) + (a[3][2] * b[2][3]) + (a[3][3] * b[3][3]),
		],
	];
}

/**
 * Performs matrix multiplication using Strassen's algorithm for improved performance on large matrices.
 *
 * Strassen's algorithm is a divide-and-conquer approach that reduces the computational
 * complexity of matrix multiplication from O(n³) to approximately O(n^2.807) by using
 * clever algebraic manipulations. Instead of computing 8 submatrix products as in the
 * naive block approach, Strassen's method computes only 7 products through strategic
 * addition and subtraction operations.
 *
 * **Algorithm Overview:**
 * 1. Recursively partition each n×n matrix into four (n/2)×(n/2) submatrices
 * 2. Compute 7 specific intermediate products (M1-M7) using Strassen's formulas
 * 3. Combine these products using addition/subtraction to form result quadrants
 * 4. Recursively apply until reaching base case (n ≤ 32) where standard multiplication is used
 *
 * **Strassen's Seven Products:**
 * - M1 = (A11 + A22)(B11 + B22)
 * - M2 = (A21 + A22)B11
 * - M3 = A11(B12 - B22)
 * - M4 = A22(B21 - B11)
 * - M5 = (A11 + A12)B22
 * - M6 = (A21 - A11)(B11 + B12)
 * - M7 = (A12 - A22)(B21 + B22)
 *
 * **Result Reconstruction:**
 * - C11 = M1 + M4 - M5 + M7
 * - C12 = M3 + M5
 * - C21 = M2 + M4
 * - C22 = M1 + M3 - M2 + M6
 *
 * **Performance Characteristics:**
 * - Asymptotic complexity: O(n^2.807) vs O(n³) for standard algorithm
 * - Crossover point: typically beneficial for matrices ≥ 32×32
 * - Memory overhead: recursive calls and temporary matrices
 * - Numerical stability: slightly less stable due to more floating-point operations
 *
 * **Automatic Optimizations:**
 * - Base case optimization: switches to standard algorithm for small matrices
 * - Padding handling: automatically pads odd-sized matrices with zeros
 * - Memory management: efficient temporary matrix allocation and cleanup
 *
 * **Time Complexity:** O(n^2.807) average case, O(n³) worst case (small matrices)
 * **Space Complexity:** O(n²) for recursive call stack and temporary matrices
 *
 * @param a - First square matrix (must be same size as b)
 * @param b - Second square matrix (must be same size as a)
 * @returns {IMatrix} The product matrix with same dimensions as inputs
 * @throws {Error} If matrices are not square or have incompatible dimensions
 *
 * @example
 * ```typescript
 * // Large matrix multiplication (automatically used for 32×32 and larger)
 * const size = 256;
 * const largeA = MatrixCreate(size, size); // Create 256×256 matrix
 * const largeB = MatrixCreate(size, size); // Create 256×256 matrix
 * // ... fill matrices with data ...
 * const result = matrixMultiplyStrassen(largeA, largeB); // Uses Strassen algorithm
 *
 * // Performance comparison for large matrices:
 * // Standard O(n³): ~16.8M operations for 256×256
 * // Strassen O(n^2.807): ~11.2M operations for 256×256 (33% reduction)
 *
 * // Odd-sized matrices are automatically handled with padding
 * const oddMatrix = MatrixCreate(127, 127); // Will be padded to 128×128 internally
 * const result2 = matrixMultiplyStrassen(oddMatrix, oddMatrix);
 *
 * // Base case automatically falls back to standard algorithm
 * const small = MatrixCreate(16, 16); // Uses standard algorithm (< 32×32)
 * const result3 = matrixMultiplyStrassen(small, small);
 * ```
 */
function matrixMultiplyStrassen(a: IMatrix, b: IMatrix): IMatrix {
	AssertMatrix(a, { square: true });
	AssertMatrix(b, { square: true });

	const [arows, _acols] = MatrixSize(a);
	const [brows, _bcols] = MatrixSize(b);

	if (arows !== brows) {
		throw new Error(`Matrix dimensions incompatible for multiplication: ${arows}×${arows} and ${brows}×${brows}`);
	}

	const n = arows;

	// Base case: use standard multiplication for small matrices to avoid overhead
	if (n < 32) {
		return matrixMultiplyMatrix(a, b);
	}

	// Ensure matrix size is even for clean partitioning into quadrants
	if (n % 2 !== 0) {
		// Pad matrices to next even size with zeros
		const paddedSize = n + 1;
		const aPadded = MatrixPad(a, paddedSize, paddedSize);
		const bPadded = MatrixPad(b, paddedSize, paddedSize);
		const resultPadded = matrixMultiplyStrassen(aPadded, bPadded);
		// Extract original size result (remove padding)
		return MatrixSubmatrix(resultPadded, 0, 0, n, n);
	}

	const halfSize = n / 2;

	// Partition matrices into 2×2 blocks: A=[A11 A12; A21 A22], B=[B11 B12; B21 B22]
	const a11 = MatrixSubmatrix(a, 0, 0, halfSize, halfSize);
	const a12 = MatrixSubmatrix(a, halfSize, 0, halfSize, halfSize);
	const a21 = MatrixSubmatrix(a, 0, halfSize, halfSize, halfSize);
	const a22 = MatrixSubmatrix(a, halfSize, halfSize, halfSize, halfSize);

	const b11 = MatrixSubmatrix(b, 0, 0, halfSize, halfSize);
	const b12 = MatrixSubmatrix(b, halfSize, 0, halfSize, halfSize);
	const b21 = MatrixSubmatrix(b, 0, halfSize, halfSize, halfSize);
	const b22 = MatrixSubmatrix(b, halfSize, halfSize, halfSize, halfSize);

	// Calculate the 7 Strassen products (reduces 8 multiplications to 7)
	// These specific combinations enable efficient result reconstruction
	const m1 = matrixMultiplyStrassen(MatrixAdd(a11, a22), MatrixAdd(b11, b22)); // (A11+A22)(B11+B22)
	const m2 = matrixMultiplyStrassen(MatrixAdd(a21, a22), b11);                  // (A21+A22)B11
	const m3 = matrixMultiplyStrassen(a11, MatrixSubtract(b12, b22));             // A11(B12-B22)
	const m4 = matrixMultiplyStrassen(a22, MatrixSubtract(b21, b11));             // A22(B21-B11)
	const m5 = matrixMultiplyStrassen(MatrixAdd(a11, a12), b22);                  // (A11+A12)B22
	const m6 = matrixMultiplyStrassen(MatrixSubtract(a21, a11), MatrixAdd(b11, b12)); // (A21-A11)(B11+B12)
	const m7 = matrixMultiplyStrassen(MatrixSubtract(a12, a22), MatrixAdd(b21, b22)); // (A12-A22)(B21+B22)

	// Reconstruct result quadrants using Strassen's combination formulas
	const c11 = MatrixAdd(MatrixSubtract(MatrixAdd(m1, m4), m5), m7); // M1 + M4 - M5 + M7
	const c12 = MatrixAdd(m3, m5);                                       // M3 + M5
	const c21 = MatrixAdd(m2, m4);                                       // M2 + M4
	const c22 = MatrixAdd(MatrixSubtract(MatrixAdd(m1, m3), m2), m6);  // M1 + M3 - M2 + M6

	// Combine quadrants into final result matrix
	return MatrixCombine(c11, c12, c21, c22);
}

/**
 * Extracts a rectangular submatrix from a larger matrix.
 *
 * This function creates a new matrix containing a specified rectangular region from
 * the source matrix. It performs a deep copy of the selected elements, ensuring the
 * original matrix remains unmodified. This operation is fundamental for matrix
 * partitioning algorithms, block operations, and data analysis workflows.
 *
 * Coordinate System:
 * - startRow, startCol: Top-left corner of the extraction region (0-based, inclusive)
 * - width, height: Dimensions of the region to extract
 * - Extraction bounds: [startRow, startRow+height) × [startCol, startCol+width)
 *
 * NOTE: parameter order is (startCol, startRow) — reversed from typical convention
 *
 * Applications:
 * - Block matrix algorithms (Strassen, block LU decomposition)
 * - Image processing (extracting regions of interest)
 * - Data analysis (extracting subsets of datasets)
 * - Sparse matrix operations (extracting dense blocks)
 * - Machine learning (feature selection, data windowing)
 *
 * Bounds Checking:
 * - Validates that extraction region fits within source matrix
 * - Ensures all parameters are non-negative integers
 * - Checks for valid matrix structure and element values
 *
 * Memory Efficiency:
 * - Creates new matrix with minimal required size
 * - Performs element-by-element copying with validation
 * - No unnecessary memory allocation or copying
 *
 * Time Complexity: O(width × height) - linear in extracted region size
 * Space Complexity: O(width × height) - size of extracted submatrix
 *
 * @param matrix - Source matrix to extract from
 * @param startCol - Starting column index (0-based, inclusive) — note reversed order
 * @param startRow - Starting row index (0-based, inclusive) — note reversed order
 * @param width - Number of columns to extract (must be positive)
 * @param height - Number of rows to extract (must be positive)
 * @returns {IMatrix} The extracted submatrix with dimensions height×width
 * @throws {Error} If extraction bounds exceed matrix dimensions or contain invalid values
 * @example
 * ```typescript
 * const matrix = [
 *   [1,  2,  3,  4],
 *   [5,  6,  7,  8],
 *   [9, 10, 11, 12]
 * ]; // 3×4 matrix
 *
 * // Extract 2×2 submatrix from top-left corner
 * MatrixSubmatrix(matrix, 0, 0, 2, 2) // Returns [[1, 2], [5, 6]]
 *
 * // Extract 2×2 submatrix from center-right region
 * MatrixSubmatrix(matrix, 2, 1, 2, 2) // Returns [[7, 8], [11, 12]]
 *
 * // Extract single column (column vector)
 * MatrixSubmatrix(matrix, 1, 0, 1, 3) // Returns [[2], [6], [10]]
 *
 * // Extract single row (row vector)
 * MatrixSubmatrix(matrix, 0, 1, 4, 1) // Returns [[5, 6, 7, 8]]
 *
 * // Block matrix partitioning for algorithms
 * const large = MatrixCreate(8, 8); // 8×8 matrix
 * const topLeft = MatrixSubmatrix(large, 0, 0, 4, 4);     // Top-left 4×4 block
 * const topRight = MatrixSubmatrix(large, 4, 0, 4, 4);    // Top-right 4×4 block
 * const bottomLeft = MatrixSubmatrix(large, 0, 4, 4, 4);  // Bottom-left 4×4 block
 * const bottomRight = MatrixSubmatrix(large, 4, 4, 4, 4); // Bottom-right 4×4 block
 * ```
 */
export function MatrixSubmatrix(matrix: IMatrix, startCol: number, startRow: number, width: number, height: number): IMatrix {
	AssertMatrix(matrix);

	const result = MatrixCreate(height, width);

	// Copy elements from specified source region to result matrix
	for (let row = 0; row < height; row++) {
		const sourceRow = matrix[startRow + row];
		AssertMatrixRow(sourceRow);

		const resultRow = result[row];
		AssertMatrixRow(resultRow);

		for (let col = 0; col < width; col++) {
			const val = sourceRow[startCol + col];
			AssertMatrixValue(val, { rowIndex: startRow + row, columnIndex: startCol + col });
			resultRow[col] = val;
		}
	}

	return result;
}

/**
 * Pads a matrix with zeros to reach the specified dimensions.
 *
 * This function extends a matrix by adding rows and/or columns filled with zeros,
 * preserving the original matrix content in the top-left corner. This operation
 * is essential for algorithms that require matrices of specific sizes or when
 * preparing matrices for operations that need dimension alignment.
 *
 * Padding Strategy:
 * - Original content remains in top-left corner at [0,0]
 * - Additional rows/columns are filled with zeros
 * - New dimensions must be greater than or equal to current dimensions
 * - Supports both symmetric and asymmetric padding
 *
 * Common Use Cases:
 * - Algorithm requirements (power-of-2 sizes for FFT-based algorithms)
 * - Block matrix operations (ensuring uniform block sizes)
 * - Strassen algorithm (handling odd-sized matrices)
 * - Image processing (border padding for convolution operations)
 * - Signal processing (zero-padding for frequency domain analysis)
 * - Machine learning (batch size alignment, tensor operations)
 *
 * Padding Preservation Property:
 * If A is the original matrix and A' is the padded matrix, then:
 * A'[i,j] = A[i,j] for all valid i,j in A
 * A'[i,j] = 0 for all other positions
 *
 * Memory Efficiency:
 * - Creates new matrix only of the target size
 * - Copies only existing elements (no redundant operations)
 * - Zero-fills remaining positions efficiently
 *
 * Time Complexity: O(newRows × newCols) - must initialize entire new matrix
 * Space Complexity: O(newRows × newCols) - size of padded result
 *
 * @param matrix - Source matrix to pad
 * @param newRows - Target number of rows (must be ≥ current rows)
 * @param newCols - Target number of columns (must be ≥ current columns)
 * @returns {IMatrix} The padded matrix with dimensions newRows×newCols
 * @throws {Error} If new dimensions are smaller than current dimensions
 * @example
 * ```typescript
 * const matrix = [[1, 2], [3, 4]]; // 2×2 matrix
 *
 * // Pad to 4×4 matrix (symmetric padding)
 * MatrixPad(matrix, 4, 4)
 * // Returns:
 * // [[1, 2, 0, 0],
 * //  [3, 4, 0, 0],
 * //  [0, 0, 0, 0],
 * //  [0, 0, 0, 0]]
 *
 * // Pad to 3×4 matrix (asymmetric padding)
 * MatrixPad(matrix, 3, 4)
 * // Returns:
 * // [[1, 2, 0, 0],
 * //  [3, 4, 0, 0],
 * //  [0, 0, 0, 0]]
 *
 * // Prepare for power-of-2 algorithm (e.g., FFT-based convolution)
 * const data = [[1, 2, 3], [4, 5, 6]]; // 2×3 matrix
 * const powerOf2 = MatrixPad(data, 4, 4); // Pad to 4×4 for FFT
 *
 * // Batch size alignment in machine learning
 * const features = MatrixCreate(7, 10); // 7 samples, 10 features
 * const aligned = MatrixPad(features, 8, 10); // Align to batch size 8
 *
 * // Image border padding for convolution
 * const image = MatrixCreate(28, 28); // 28×28 image
 * const padded = MatrixPad(image, 32, 32); // Add border for valid convolution
 * ```
 */
export function MatrixPad(matrix: IMatrix, newRows: number, newCols: number): IMatrix {
	AssertMatrix(matrix);

	const [currentRows, currentCols] = MatrixSize(matrix);
	const result = MatrixCreate(newRows, newCols);

	// Copy existing values to top-left corner, zero-fill remaining positions
	for (let row = 0; row < Math.min(currentRows, newRows); row++) {
		const sourceRow = matrix[row];
		AssertMatrixRow(sourceRow);

		const resultRow = result[row];
		AssertMatrixRow(resultRow);

		for (let col = 0; col < Math.min(currentCols, newCols); col++) {
			const val = sourceRow[col];
			AssertMatrixValue(val, { rowIndex: row, columnIndex: col });
			resultRow[col] = val;
		}
	}

	return result;
}

/**
 * Combines four square submatrices into a single matrix (2×2 block structure).
 *
 * This function reconstructs a larger matrix from four quadrant submatrices using
 * a 2×2 block structure. It serves as the inverse operation of matrix partitioning
 * and is essential for divide-and-conquer algorithms like Strassen multiplication,
 * block matrix operations, and hierarchical matrix constructions.
 *
 * **Block Matrix Structure:**
 * ```
 * Result = [C11  C12]  where each Cij is an n×n submatrix
 *          [C21  C22]
 * ```
 *
 * The resulting matrix has dimensions 2n×2n when each input quadrant is n×n.
 *
 * **Quadrant Placement:**
 * - c11 (top-left): positioned at [0:n, 0:n]
 * - c12 (top-right): positioned at [0:n, n:2n]
 * - c21 (bottom-left): positioned at [n:2n, 0:n]
 * - c22 (bottom-right): positioned at [n:2n, n:2n]
 *
 * **Applications:**
 * - Strassen algorithm result reconstruction
 * - Block matrix operations and algebra
 * - Hierarchical matrix assembly (multigrid methods)
 * - Sparse matrix construction from dense blocks
 * - Parallel matrix computation result merging
 * - Image processing (combining processed image quadrants)
 * - Scientific computing (domain decomposition methods)
 *
 * **Validation Requirements:**
 * - All four input matrices must be square
 * - All four input matrices must have identical dimensions
 * - All elements must be valid numbers
 * - No null or undefined matrices allowed
 *
 * **Memory Layout:**
 * The function performs efficient copying by iterating through each quadrant
 * sequentially, minimizing cache misses and ensuring optimal memory access patterns.
 *
 * **Time Complexity:** O(n²) where n is the dimension of each input quadrant
 * **Space Complexity:** O(4n²) for the combined result matrix
 *
 * @param c11 - Top-left quadrant (upper-left block)
 * @param c12 - Top-right quadrant (upper-right block)
 * @param c21 - Bottom-left quadrant (lower-left block)
 * @param c22 - Bottom-right quadrant (lower-right block)
 * @returns {IMatrix} The combined matrix with dimensions 2n×2n (where each input is n×n)
 * @throws {Error} If quadrants have mismatched dimensions or invalid values
 *
 * @example
 * ```typescript
 * // Basic 2×2 quadrant combination
 * const topLeft = [[1, 2], [3, 4]];
 * const topRight = [[5, 6], [7, 8]];
 * const bottomLeft = [[9, 10], [11, 12]];
 * const bottomRight = [[13, 14], [15, 16]];
 *
 * MatrixCombine(topLeft, topRight, bottomLeft, bottomRight)
 * // Returns:
 * // [[1,  2,  5,  6],
 * //  [3,  4,  7,  8],
 * //  [9, 10, 13, 14],
 * //  [11,12, 15, 16]]
 *
 * // Strassen algorithm result reconstruction
 * const m1 = computeStrassenProduct1(); // Computed Strassen intermediate results
 * const m2 = computeStrassenProduct2();
 * const m3 = computeStrassenProduct3();
 * const m4 = computeStrassenProduct4();
 * const finalResult = MatrixCombine(m1, m2, m3, m4); // Assemble final result
 *
 * // Image processing: combining processed quadrants
 * const processedTopLeft = processImageQuadrant(imageTopLeft);
 * const processedTopRight = processImageQuadrant(imageTopRight);
 * const processedBottomLeft = processImageQuadrant(imageBottomLeft);
 * const processedBottomRight = processImageQuadrant(imageBottomRight);
 * const reconstructedImage = MatrixCombine(
 *   processedTopLeft, processedTopRight,
 *   processedBottomLeft, processedBottomRight
 * );
 * ```
 */
export function MatrixCombine(c11: IMatrix, c12: IMatrix, c21: IMatrix, c22: IMatrix): IMatrix {
	AssertMatrix(c11);
	AssertMatrix(c12);
	AssertMatrix(c21);
	AssertMatrix(c22);

	const [qrows, _qcols] = MatrixSize(c11);
	const halfSize = qrows;
	const fullSize = halfSize * 2;

	const result = MatrixCreate(fullSize, fullSize);

	// Copy c11 to top-left quadrant [0:n, 0:n]
	for (let row = 0; row < halfSize; row++) {
		const sourceRow = c11[row];
		AssertMatrixRow(sourceRow);

		const resultRow = result[row];
		AssertMatrixRow(resultRow);

		for (let col = 0; col < halfSize; col++) {
			const val = sourceRow[col];
			AssertMatrixValue(val, { rowIndex: row, columnIndex: col });
			resultRow[col] = val;
		}
	}

	// Copy c12 to top-right quadrant [0:n, n:2n]
	for (let row = 0; row < halfSize; row++) {
		const sourceRow = c12[row];
		AssertMatrixRow(sourceRow);

		const resultRow = result[row];
		AssertMatrixRow(resultRow);

		for (let col = 0; col < halfSize; col++) {
			const val = sourceRow[col];
			AssertMatrixValue(val, { rowIndex: row, columnIndex: col });
			resultRow[col + halfSize] = val;
		}
	}

	// Copy c21 to bottom-left quadrant [n:2n, 0:n]
	for (let row = 0; row < halfSize; row++) {
		const sourceRow = c21[row];
		AssertMatrixRow(sourceRow);

		const resultRow = result[row + halfSize];
		AssertMatrixRow(resultRow);

		for (let col = 0; col < halfSize; col++) {
			const val = sourceRow[col];
			AssertMatrixValue(val, { rowIndex: row, columnIndex: col });
			resultRow[col] = val;
		}
	}

	// Copy c22 to bottom-right quadrant [n:2n, n:2n]
	for (let row = 0; row < halfSize; row++) {
		const sourceRow = c22[row];
		AssertMatrixRow(sourceRow);

		const resultRow = result[row + halfSize];
		AssertMatrixRow(resultRow);

		for (let col = 0; col < halfSize; col++) {
			const val = sourceRow[col];
			AssertMatrixValue(val, { rowIndex: row, columnIndex: col });
			resultRow[col + halfSize] = val;
		}
	}

	return result;
}
