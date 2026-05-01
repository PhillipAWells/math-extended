
import { TVector } from '../vectors/types.js';
import {
	MatrixAdd,
	MatrixSubtract,
	MatrixMultiply,
	MatrixSubmatrix,
	MatrixPad,
	MatrixCombine,
} from './arithmetic.js';
import { AssertMatrixRow } from './asserts.js';
import { MatrixCreate } from './core.js';
import { TMatrix, TMatrix1, TMatrix2, TMatrix3, TMatrix4 } from './types.js';

describe('Matrix Arithmetic', () => {
	describe('MatrixAdd', () => {
		it('should add two 1x1 matrices', () => {
			const a: TMatrix1 = [[5]];
			const b: TMatrix1 = [[3]];
			const result = MatrixAdd(a, b);
			expect(result).toEqual([[8]]);
		});

		it('should add two 2x2 matrices', () => {
			const a: TMatrix2 = [[1, 2], [3, 4]];
			const b: TMatrix2 = [[5, 6], [7, 8]];
			const result = MatrixAdd(a, b);
			expect(result).toEqual([[6, 8], [10, 12]]);
		});

		it('should add two 3x3 matrices', () => {
			const a: TMatrix3 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
			const b: TMatrix3 = [[9, 8, 7], [6, 5, 4], [3, 2, 1]];
			const result = MatrixAdd(a, b);
			expect(result).toEqual([[10, 10, 10], [10, 10, 10], [10, 10, 10]]);
		});

		it('should add matrices with negative numbers', () => {
			const a: TMatrix = [[1, -2], [-3, 4]];
			const b: TMatrix = [[-1, 2], [3, -4]];
			const result = MatrixAdd(a, b);
			expect(result).toEqual([[0, 0], [0, 0]]);
		});

		it('should add matrices with zeros', () => {
			const a: TMatrix = [[1, 2], [3, 4]];
			const b: TMatrix = [[0, 0], [0, 0]];
			const result = MatrixAdd(a, b);
			expect(result).toEqual([[1, 2], [3, 4]]);
		});

		it('should add matrices with decimal numbers', () => {
			const a: TMatrix = [[1.5, 2.5], [3.5, 4.5]];
			const b: TMatrix = [[0.5, 0.5], [0.5, 0.5]];
			const result = MatrixAdd(a, b);
			expect(result).toEqual([[2, 3], [4, 5]]);
		});

		it('should throw error for matrices with different dimensions', () => {
			const a: TMatrix = [[1, 2], [3, 4]];
			const b: TMatrix = [[1, 2, 3], [4, 5, 6]];
			expect(() => MatrixAdd(a, b)).toThrow();
		});
	});

	describe('MatrixSubtract', () => {
		it('should subtract two 1x1 matrices', () => {
			const a: TMatrix1 = [[8]];
			const b: TMatrix1 = [[3]];
			const result = MatrixSubtract(a, b);
			expect(result).toEqual([[5]]);
		});

		it('should subtract two 2x2 matrices', () => {
			const a: TMatrix2 = [[5, 6], [7, 8]];
			const b: TMatrix2 = [[1, 2], [3, 4]];
			const result = MatrixSubtract(a, b);
			expect(result).toEqual([[4, 4], [4, 4]]);
		});

		it('should subtract two 3x3 matrices', () => {
			const a: TMatrix3 = [[10, 10, 10], [10, 10, 10], [10, 10, 10]];
			const b: TMatrix3 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
			const result = MatrixSubtract(a, b);
			expect(result).toEqual([[9, 8, 7], [6, 5, 4], [3, 2, 1]]);
		});

		it('should handle negative results', () => {
			const a: TMatrix = [[1, 2], [3, 4]];
			const b: TMatrix = [[5, 6], [7, 8]];
			const result = MatrixSubtract(a, b);
			expect(result).toEqual([[-4, -4], [-4, -4]]);
		});

		it('should subtract zero matrix', () => {
			const a: TMatrix = [[1, 2], [3, 4]];
			const b: TMatrix = [[0, 0], [0, 0]];
			const result = MatrixSubtract(a, b);
			expect(result).toEqual([[1, 2], [3, 4]]);
		});

		it('should handle decimal numbers', () => {
			const a: TMatrix = [[3.5, 4.5], [5.5, 6.5]];
			const b: TMatrix = [[1.5, 2.5], [3.5, 4.5]];
			const result = MatrixSubtract(a, b);
			expect(result).toEqual([[2, 2], [2, 2]]);
		});

		it('should throw error for matrices with different dimensions', () => {
			const a: TMatrix = [[1, 2], [3, 4]];
			const b: TMatrix = [[1], [2], [3]];
			expect(() => MatrixSubtract(a, b)).toThrow();
		});
	});

	describe('MatrixMultiply', () => {
		describe('overload: scalar multiplication (matrix, scalar) -> matrix', () => {
			it('should multiply 1x1 matrix by scalar', () => {
				const matrix: TMatrix1 = [[5]];
				const result: TMatrix1 = MatrixMultiply(matrix, 3);
				expect(result).toEqual([[15]]);
			});

			it('should multiply 2x2 matrix by scalar', () => {
				const matrix: TMatrix2 = [[1, 2], [3, 4]];
				const result: TMatrix2 = MatrixMultiply(matrix, 2);
				expect(result).toEqual([[2, 4], [6, 8]]);
			});

			it('should multiply 3x3 matrix by scalar', () => {
				const matrix: TMatrix3 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
				const result: TMatrix3 = MatrixMultiply(matrix, 2);
				expect(result).toEqual([[2, 4, 6], [8, 10, 12], [14, 16, 18]]);
			});

			it('should multiply 4x4 matrix by scalar', () => {
				const matrix: TMatrix4 = [
					[1, 2, 3, 4],
					[5, 6, 7, 8],
					[9, 10, 11, 12],
					[13, 14, 15, 16],
				];
				const result: TMatrix4 = MatrixMultiply(matrix, 0.5);
				expect(result).toEqual([
					[0.5, 1, 1.5, 2],
					[2.5, 3, 3.5, 4],
					[4.5, 5, 5.5, 6],
					[6.5, 7, 7.5, 8],
				]);
			});

			it('should multiply matrix by zero', () => {
				const matrix: TMatrix2 = [[1, 2], [3, 4]];
				const result: TMatrix2 = MatrixMultiply(matrix, 0);
				expect(result).toEqual([[0, 0], [0, 0]]);
			});

			it('should multiply matrix by negative scalar', () => {
				const matrix: TMatrix2 = [[1, 2], [3, 4]];
				const result: TMatrix2 = MatrixMultiply(matrix, -1);
				expect(result).toEqual([[-1, -2], [-3, -4]]);
			});

			it('should multiply matrix by decimal scalar', () => {
				const matrix: TMatrix2 = [[2, 4], [6, 8]];
				const result: TMatrix2 = MatrixMultiply(matrix, 0.5);
				expect(result).toEqual([[1, 2], [3, 4]]);
			});

			it('should multiply rectangular matrix by scalar', () => {
				const matrix: TMatrix = [[1, 2, 3], [4, 5, 6]];
				const result: TMatrix = MatrixMultiply(matrix, 3);
				expect(result).toEqual([[3, 6, 9], [12, 15, 18]]);
			});

			it('should preserve matrix type with scalar multiplication', () => {
				const matrix: TMatrix2 = [[1, 2], [3, 4]];
				const scalar = 5;
				const result: TMatrix2 = MatrixMultiply(matrix, scalar);
				expect(typeof result).toBe('object');
				expect(Array.isArray(result)).toBe(true);
				expect(Array.isArray(result[0])).toBe(true);
			});
		});

		describe('overload: vector multiplication (matrix, vector) -> vector', () => {
			it('should multiply 2x2 matrix by 2D vector', () => {
				const matrix: TMatrix2 = [[1, 2], [3, 4]];
				const vector: TVector = [5, 6];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result).toEqual([17, 39]);
			});

			it('should multiply 3x3 matrix by 3D vector', () => {
				const matrix: TMatrix3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
				const vector: TVector = [5, 6, 7];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result).toEqual([5, 6, 7]);
			});

			it('should multiply 4x4 matrix by 4D vector', () => {
				const matrix: TMatrix4 = [
					[1, 0, 0, 0],
					[0, 2, 0, 0],
					[0, 0, 3, 0],
					[0, 0, 0, 4],
				];
				const vector: TVector = [1, 2, 3, 4];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result).toEqual([1, 4, 9, 16]);
			});

			it('should multiply rectangular matrix by vector', () => {
				const matrix: TMatrix = [[1, 2, 3], [4, 5, 6]];
				const vector: TVector = [1, 2, 3];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result).toEqual([14, 32]);
			});

			it('should handle zero vector', () => {
				const matrix: TMatrix = [[1, 2], [3, 4]];
				const vector: TVector = [0, 0];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result).toEqual([0, 0]);
			});

			it('should handle vector with negative values', () => {
				const matrix: TMatrix = [[1, 2], [3, 4]];
				const vector: TVector = [-1, 2];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result).toEqual([3, 5]);
			});

			it('should handle vector with decimal values', () => {
				const matrix: TMatrix = [[2, 0], [0, 2]];
				const vector: TVector = [1.5, 2.5];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result).toEqual([3, 5]);
			});

			it('should perform identity transformation', () => {
				const identity: TMatrix3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
				const vector: TVector = [7, 8, 9];
				const result: TVector = MatrixMultiply(identity, vector);
				expect(result).toEqual([7, 8, 9]);
			});

			it('should perform linear transformation', () => {
				// Rotation by 90 degrees counterclockwise in 2D
				const rotationMatrix: TMatrix2 = [[0, -1], [1, 0]];
				const vector: TVector = [1, 0];
				const result: TVector = MatrixMultiply(rotationMatrix, vector);
				expect(result).toEqual([0, 1]);
			});

			it('should return vector result type', () => {
				const matrix: TMatrix = [[1, 2], [3, 4]];
				const vector: TVector = [1, 1];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(Array.isArray(result)).toBe(true);
				expect(result.length).toBe(2);
				expect(typeof result[0]).toBe('number');
				expect(typeof result[1]).toBe('number');
			});

			it('should throw error for incompatible dimensions', () => {
				const matrix: TMatrix = [[1, 2], [3, 4]];
				const vector: TVector = [1, 2, 3]; // Wrong size
				expect(() => MatrixMultiply(matrix, vector)).toThrow(/Matrix-vector multiplication requires matrix columns/);
			});

			it('should throw error for empty vector', () => {
				const matrix: TMatrix = [[1, 2], [3, 4]];
				const vector: TVector = [];
				expect(() => MatrixMultiply(matrix, vector)).toThrow(/Matrix-vector multiplication requires matrix columns/);
			});

			it('should handle matrix-vector multiplication examples from documentation', () => {
				// Example from the documentation
				const matrix: TMatrix = [[1, 2, 3], [4, 5, 6]];
				const vector: TVector = [7, 8, 9];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result).toEqual([50, 122]);
			});

			it('should handle single row matrix multiplication', () => {
				const matrix: TMatrix = [[1, 2, 3]];
				const vector: TVector = [4, 5, 6];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result).toEqual([32]);
			});

			it('should handle single column matrix multiplication', () => {
				const matrix: TMatrix = [[1], [2], [3]];
				const vector: TVector = [5];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result).toEqual([5, 10, 15]);
			});

			it('should handle very large vectors', () => {
				const matrix: TMatrix = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]];
				const vector: TVector = [1, 1, 1, 1, 1];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result).toEqual([15, 40]);
			});

			it('should preserve precision with decimal arithmetic', () => {
				const matrix: TMatrix = [[0.1, 0.2], [0.3, 0.4]];
				const vector: TVector = [0.5, 0.6];
				const result: TVector = MatrixMultiply(matrix, vector);
				expect(result[0]).toBeCloseTo(0.17, 10);
				expect(result[1]).toBeCloseTo(0.39, 10);
			});

			it('should handle scaling transformations', () => {
				const scalingMatrix: TMatrix = [[2, 0], [0, 3]];
				const vector: TVector = [4, 5];
				const result: TVector = MatrixMultiply(scalingMatrix, vector);
				expect(result).toEqual([8, 15]);
			});

			it('should handle reflection transformations', () => {
				// Reflection across x-axis
				const reflectionMatrix: TMatrix = [[1, 0], [0, -1]];
				const vector: TVector = [3, 4];
				const result: TVector = MatrixMultiply(reflectionMatrix, vector);
				expect(result).toEqual([3, -4]);
			});

			it('should handle shear transformations', () => {
				// Horizontal shear
				const shearMatrix: TMatrix = [[1, 2], [0, 1]];
				const vector: TVector = [1, 3];
				const result: TVector = MatrixMultiply(shearMatrix, vector);
				expect(result).toEqual([7, 3]);
			});
		});

		describe('overload: matrix multiplication (matrix, matrix) -> matrix', () => {
			it('should multiply two 1x1 matrices', () => {
				const a: TMatrix1 = [[5]];
				const b: TMatrix1 = [[3]];
				const result: TMatrix = MatrixMultiply(a, b);
				expect(result).toEqual([[15]]);
			});

			it('should multiply two 2x2 matrices', () => {
				const a: TMatrix2 = [[1, 2], [3, 4]];
				const b: TMatrix2 = [[5, 6], [7, 8]];
				const result: TMatrix = MatrixMultiply(a, b);
				expect(result).toEqual([[19, 22], [43, 50]]);
			});

			it('should multiply two 3x3 matrices', () => {
				const a: TMatrix3 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
				const b: TMatrix3 = [[9, 8, 7], [6, 5, 4], [3, 2, 1]];
				const result: TMatrix = MatrixMultiply(a, b);
				expect(result).toEqual([[30, 24, 18], [84, 69, 54], [138, 114, 90]]);
			});

			it('should multiply two 4x4 matrices', () => {
				const a: TMatrix4 = [
					[1, 2, 3, 4],
					[5, 6, 7, 8],
					[9, 10, 11, 12],
					[13, 14, 15, 16],
				];
				const b: TMatrix4 = [
					[16, 15, 14, 13],
					[12, 11, 10, 9],
					[8, 7, 6, 5],
					[4, 3, 2, 1],
				];
				const result: TMatrix = MatrixMultiply(a, b);
				expect(result).toEqual([
					[80, 70, 60, 50],
					[240, 214, 188, 162],
					[400, 358, 316, 274],
					[560, 502, 444, 386],
				]);
			});

			it('should multiply rectangular matrices (2x3 × 3x2)', () => {
				const a: TMatrix = [[1, 2, 3], [4, 5, 6]];
				const b: TMatrix = [[7, 8], [9, 10], [11, 12]];
				const result: TMatrix = MatrixMultiply(a, b);
				expect(result).toEqual([[58, 64], [139, 154]]);
			});

			it('should multiply rectangular matrices (3x2 × 2x4)', () => {
				const a: TMatrix = [[1, 2], [3, 4], [5, 6]];
				const b: TMatrix = [[7, 8, 9, 10], [11, 12, 13, 14]];
				const result: TMatrix = MatrixMultiply(a, b);
				expect(result).toEqual([
					[29, 32, 35, 38],
					[65, 72, 79, 86],
					[101, 112, 123, 134],
				]);
			});

			it('should multiply by identity matrix', () => {
				const a: TMatrix2 = [[1, 2], [3, 4]];
				const identity: TMatrix2 = [[1, 0], [0, 1]];
				const result: TMatrix = MatrixMultiply(a, identity);
				expect(result).toEqual([[1, 2], [3, 4]]);
			});

			it('should multiply identity by matrix', () => {
				const identity: TMatrix3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
				const a: TMatrix3 = [[2, 3, 4], [5, 6, 7], [8, 9, 10]];
				const result: TMatrix = MatrixMultiply(identity, a);
				expect(result).toEqual([[2, 3, 4], [5, 6, 7], [8, 9, 10]]);
			});

			it('should handle matrices with zeros', () => {
				const a: TMatrix = [[1, 2], [3, 4]];
				const b: TMatrix = [[0, 0], [0, 0]];
				const result: TMatrix = MatrixMultiply(a, b);
				expect(result).toEqual([[0, 0], [0, 0]]);
			});

			it('should handle matrices with negative values', () => {
				const a: TMatrix = [[1, -2], [-3, 4]];
				const b: TMatrix = [[-1, 2], [3, -4]];
				const result: TMatrix = MatrixMultiply(a, b);
				expect(result).toEqual([[-7, 10], [15, -22]]);
			});

			it('should handle matrices with decimal values', () => {
				const a: TMatrix = [[1.5, 2.5], [3.5, 4.5]];
				const b: TMatrix = [[0.5, 1.5], [2.5, 3.5]];
				const result: TMatrix = MatrixMultiply(a, b);
				expect(result).toEqual([[7, 11], [13, 21]]);
			});

			it('should verify non-commutativity (A×B ≠ B×A)', () => {
				const a: TMatrix = [[1, 2], [3, 4]];
				const b: TMatrix = [[5, 6], [7, 8]];
				const ab: TMatrix = MatrixMultiply(a, b);
				const ba: TMatrix = MatrixMultiply(b, a);
				expect(ab).toEqual([[19, 22], [43, 50]]);
				expect(ba).toEqual([[23, 34], [31, 46]]);
				expect(ab).not.toEqual(ba);
			});

			it('should verify associativity ((A×B)×C = A×(B×C))', () => {
				const a: TMatrix = [[1, 2]];
				const b: TMatrix = [[3], [4]];
				const c: TMatrix = [[5, 6]];
				const abC: TMatrix = MatrixMultiply(MatrixMultiply(a, b), c);
				const aBc: TMatrix = MatrixMultiply(a, MatrixMultiply(b, c));
				expect(abC).toEqual(aBc);
			});

			it('should return proper matrix type', () => {
				const a: TMatrix = [[1, 2], [3, 4]];
				const b: TMatrix = [[5, 6], [7, 8]];
				const result: TMatrix = MatrixMultiply(a, b);
				expect(Array.isArray(result)).toBe(true);
				expect(Array.isArray(result[0])).toBe(true);
				expect(result.length).toBe(2);

				const [firstRow] = result;
				if (firstRow) {
					expect(firstRow.length).toBe(2);
				}
			});

			it('should throw error for incompatible dimensions', () => {
				const a: TMatrix = [[1, 2], [3, 4]]; // 2x2
				const b: TMatrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]; // 3x3
				expect(() => MatrixMultiply(a, b)).toThrow();
			});

			it('should throw error for dimension mismatch in rectangular matrices', () => {
				const a: TMatrix = [[1, 2, 3], [4, 5, 6]]; // 2x3
				const b: TMatrix = [[1, 2], [3, 4]]; // 2x2 (need 3x2)
				expect(() => MatrixMultiply(a, b)).toThrow();
			});
		});

		describe('overload type safety and dispatch', () => {
			it('should correctly dispatch to scalar multiplication', () => {
				const matrix: TMatrix = [[1, 2], [3, 4]];
				const scalar = 5;

				// Type should be inferred as TMatrix
				const result = MatrixMultiply(matrix, scalar);
				expect(result).toEqual([[5, 10], [15, 20]]);
				expect(Array.isArray(result)).toBe(true);
				expect(Array.isArray(result[0])).toBe(true);
			});

			it('should correctly dispatch to vector multiplication', () => {
				const matrix: TMatrix = [[1, 2], [3, 4]];
				const vector: TVector = [2, 3];

				// Type should be inferred as TVector (1D array)
				const result = MatrixMultiply(matrix, vector);
				expect(result).toEqual([8, 18]);
				expect(Array.isArray(result)).toBe(true);
				expect(typeof result[0]).toBe('number');
			});

			it('should correctly dispatch to matrix multiplication', () => {
				const matrixA: TMatrix2 = [[1, 2], [3, 4]];
				const matrixB: TMatrix2 = [[2, 0], [1, 2]];

				// Type should be inferred as TMatrix
				const result = MatrixMultiply(matrixA, matrixB);
				expect(result).toEqual([[4, 4], [10, 8]]);
				expect(Array.isArray(result)).toBe(true);
				expect(Array.isArray(result[0])).toBe(true);
				expect(result[0].length).toBe(2); // Square matrix
			});

			it('should handle mixed operand types correctly', () => {
				const matrix: TMatrix2 = [[2, 1], [1, 2]];

				// Scalar multiplication
				const scalarResult: TMatrix = MatrixMultiply(matrix, 3);
				expect(scalarResult).toEqual([[6, 3], [3, 6]]);

				// Vector multiplication
				const vectorResult: TVector = MatrixMultiply(matrix, [1, 2]);
				expect(vectorResult).toEqual([4, 5]);

				// Matrix multiplication
				const matrixResult: TMatrix = MatrixMultiply(matrix, [[1, 0], [0, 1]]);
				expect(matrixResult).toEqual([[2, 1], [1, 2]]);
			});

			it('should preserve specific matrix types in results', () => {
				const matrix1: TMatrix1 = [[5]];
				const matrix2: TMatrix2 = [[1, 2], [3, 4]];
				const matrix3: TMatrix3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];

				// All should return TMatrix type (base type)
				const result1: TMatrix = MatrixMultiply(matrix1, 2);
				const result2: TMatrix = MatrixMultiply(matrix2, 0.5);
				const result3: TMatrix = MatrixMultiply(matrix3, 3);
				expect(result1).toEqual([[10]]);
				expect(result2).toEqual([[0.5, 1], [1.5, 2]]);
				expect(result3).toEqual([[3, 0, 0], [0, 3, 0], [0, 0, 3]]);
			});

			it('should handle edge cases for each overload', () => {
				const matrix: TMatrix = [[1, 0], [0, 1]];

				// Scalar: multiply by 0
				const zeroScalar: TMatrix = MatrixMultiply(matrix, 0);
				expect(zeroScalar).toEqual([[0, 0], [0, 0]]);

				// Vector: zero vector
				const zeroVector: TVector = MatrixMultiply(matrix, [0, 0]);
				expect(zeroVector).toEqual([0, 0]);

				// Matrix: zero matrix
				const zeroMatrix: TMatrix = MatrixMultiply(matrix, [[0, 0], [0, 0]]);
				expect(zeroMatrix).toEqual([[0, 0], [0, 0]]);
			});

			it('should validate input types correctly', () => {
				const matrix: TMatrix = [[1, 2], [3, 4]];
				// Test type detection with edge values
				expect(MatrixMultiply(matrix, 1)).toEqual([[1, 2], [3, 4]]);
				expect(MatrixMultiply(matrix, -1)).toEqual([[-1, -2], [-3, -4]]);
				expect(MatrixMultiply(matrix, 0.5)).toEqual([[0.5, 1], [1.5, 2]]);
			});

			it('should handle type coercion edge cases', () => {
				const matrix: TMatrix = [[2, 3]];

				// Ensure vector is detected correctly vs matrix
				const vectorResult = MatrixMultiply(matrix, [4, 5]);
				expect(vectorResult).toEqual([23]);

				// Ensure 2D matrix is detected correctly
				const matrixResult = MatrixMultiply(matrix, [[4], [5]]);
				expect(matrixResult).toEqual([[23]]);
			});

			it('should maintain precision in type-specific operations', () => {
				const matrix2: TMatrix2 = [[1.1, 2.2], [3.3, 4.4]];
				const vector2: TVector = [0.5, 0.25];

				const result = MatrixMultiply(matrix2, vector2);
				expect(result[0]).toBeCloseTo((1.1 * 0.5) + (2.2 * 0.25), 10);
				expect(result[1]).toBeCloseTo((3.3 * 0.5) + (4.4 * 0.25), 10);
			});
		});

		describe('large matrix multiplication (Strassen)', () => {
			it('should handle large square matrices using Strassen algorithm', () => {
				// Create 32x32 matrices to trigger Strassen algorithm
				const size = 32;
				const a = MatrixCreate(size, size);
				const b = MatrixCreate(size, size);

				// Fill with simple pattern for testing
				for (let i = 0; i < size; i++) {
					const arow = a[i];
					AssertMatrixRow(arow, { rowIndex: i });

					const brow = b[i];
					AssertMatrixRow(brow, { rowIndex: i });

					for (let j = 0; j < size; j++) {
						arow[j] = i + j;
						brow[j] = i - j;
					}
				}

				// This should use Strassen algorithm internally
				const result = MatrixMultiply(a, b);
				const [resultRow] = result;
				AssertMatrixRow(resultRow, { rowIndex: 0 });
				expect(result).toBeDefined();
				expect(result.length).toBe(size);
				expect(resultRow.length).toBe(size);
			});

			it('should use standard algorithm for matrices smaller than 32x32', () => {
				// Create 31x31 matrices - should use standard algorithm, not Strassen
				const size = 31;
				const a = MatrixCreate(size, size);
				const b = MatrixCreate(size, size);

				// Fill with simple pattern for testing
				for (let i = 0; i < size; i++) {
					const arow = a[i];
					AssertMatrixRow(arow, { rowIndex: i });

					const brow = b[i];
					AssertMatrixRow(brow, { rowIndex: i });

					for (let j = 0; j < size; j++) {
						arow[j] = i + j;
						brow[j] = i - j;
					}
				}

				// This should use standard algorithm internally
				const result = MatrixMultiply(a, b);
				const [resultRow] = result;
				AssertMatrixRow(resultRow, { rowIndex: 0 });
				expect(result).toBeDefined();
				expect(result.length).toBe(size);
				expect(resultRow.length).toBe(size);
			});

			it('should handle boundary case at 32x32 threshold', () => {
				// Test exactly at the Strassen threshold
				const size = 32;
				const identity = MatrixCreate(size, size);
				const testMatrix = MatrixCreate(size, size);

				// Create identity matrix
				for (let i = 0; i < size; i++) {
					const identityRow = identity[i];
					AssertMatrixRow(identityRow, { rowIndex: i });

					const testRow = testMatrix[i];
					AssertMatrixRow(testRow, { rowIndex: i });

					for (let j = 0; j < size; j++) {
						identityRow[j] = i === j ? 1 : 0;
						testRow[j] = (i * size) + j; // Sequential values for testing
					}
				}

				// Identity multiplication should preserve the matrix
				const result = MatrixMultiply(identity, testMatrix);
				expect(result).toEqual(testMatrix);
			});

			it('should handle very large matrices (64x64) with Strassen', () => {
				const size = 64;
				const a = MatrixCreate(64);
				const b = MatrixCreate(64);

				// Fill with identity pattern for predictable results
				for (let i = 0; i < size; i++) {
					const arow = a[i];
					AssertMatrixRow(arow, { rowIndex: i });

					const brow = b[i];
					AssertMatrixRow(brow, { rowIndex: i });

					for (let j = 0; j < size; j++) {
						arow[j] = i === j ? 1 : 0; // Identity matrix
						brow[j] = j; // Simple pattern
					}
				}

				const result = MatrixMultiply(a, b);
				const [firstRow, secondRow] = result;
				AssertMatrixRow(firstRow, { rowIndex: 0 });
				AssertMatrixRow(secondRow, { rowIndex: 1 });

				// Verify identity multiplication worked
				expect(firstRow[0]).toBe(0);
				expect(secondRow[1]).toBe(1);
				expect(result[size - 1]?.[size - 1]).toBe(size - 1);
			});
		});

		describe('edge cases and error handling', () => {
			it('should throw descriptive errors for dimension mismatches', () => {
				const matrix2x3: TMatrix = [[1, 2, 3], [4, 5, 6]];
				const matrix2x2: TMatrix = [[1, 2], [3, 4]];
				const vector3: TVector = [1, 2, 3];
				// Matrix-matrix dimension mismatch
				expect(() => MatrixMultiply(matrix2x3, matrix2x2))
					.toThrow(/Matrix row must be an array|incompatible.+multiplication/i);

				// Matrix-vector dimension mismatch
				expect(() => MatrixMultiply(matrix2x2, vector3))
					.toThrow(/Matrix-vector multiplication requires matrix columns/);

				// Empty vector
				expect(() => MatrixMultiply(matrix2x2, []))
					.toThrow(/Matrix-vector multiplication requires matrix columns/);
			});

			it('should handle matrices with extreme values', () => {
				const matrix: TMatrix = [[Number.MAX_SAFE_INTEGER, 0], [0, Number.MIN_SAFE_INTEGER]];
				const scalar = 0.5;
				const result = MatrixMultiply(matrix, scalar);
				expect(result[0]).toBeDefined();
				expect(result[1]).toBeDefined();
				expect(result[0]?.[0]).toBe(Number.MAX_SAFE_INTEGER * 0.5);
				expect(result[1]?.[1]).toBe(Number.MIN_SAFE_INTEGER * 0.5);
			});

			it('should handle very small decimal numbers', () => {
				const matrix: TMatrix = [[1e-10, 2e-10], [3e-10, 4e-10]];
				const scalar = 1e10;
				const result = MatrixMultiply(matrix, scalar);
				expect(result[0]?.[0]).toBeCloseTo(1, 10);
				expect(result[0]?.[1]).toBeCloseTo(2, 10);
				expect(result[1]?.[0]).toBeCloseTo(3, 10);
				expect(result[1]?.[1]).toBeCloseTo(4, 10);
			});

			it('should preserve exact zero values', () => {
				const matrix: TMatrix = [[0, 1], [1, 0]];
				const vector: TVector = [5, 0];
				const result = MatrixMultiply(matrix, vector);
				expect(result[0]).toBe(0);
				expect(result[1]).toBe(5);
			});

			it('should handle NaN and Infinity gracefully', () => {
				const matrix: TMatrix = [[1, 2], [3, 4]];
				// NaN scalar should throw validation error
				expect(() => MatrixMultiply(matrix, NaN))
					.toThrow(/Scalar multiplier must be a valid number/);

				// Infinity scalar should throw validation error
				expect(() => MatrixMultiply(matrix, Infinity))
					.toThrow(/Scalar multiplier must be a valid number/);
			});

			it('should handle matrices with mixed positive/negative values', () => {
				const matrix: TMatrix = [[-1, 2, -3], [4, -5, 6]];
				const vector: TVector = [-1, -1, -1];
				const result = MatrixMultiply(matrix, vector);
				expect(result[0]).toBe((-1 * -1) + (2 * -1) + (-3 * -1)); // 1 - 2 + 3 = 2
				expect(result[1]).toBe((4 * -1) + (-5 * -1) + (6 * -1)); // -4 + 5 - 6 = -5
			});

			it('should handle single-element matrices and vectors', () => {
				const matrix1x1: TMatrix1 = [[5]];
				const vector1: TVector = [3];
				const result = MatrixMultiply(matrix1x1, vector1);
				expect(result).toEqual([15]);
			});

			it('should handle wide and tall rectangular matrices', () => {
				// Wide matrix (1x5)
				const wideMatrix: TMatrix = [[1, 2, 3, 4, 5]];
				const vector5: TVector = [1, 1, 1, 1, 1];
				const wideResult = MatrixMultiply(wideMatrix, vector5);
				expect(wideResult).toEqual([15]);

				// Tall matrix (5x1)
				const tallMatrix: TMatrix = [[1], [2], [3], [4], [5]];
				const vector1: TVector = [2];
				const tallResult = MatrixMultiply(tallMatrix, vector1);
				expect(tallResult).toEqual([2, 4, 6, 8, 10]);
			});
		});

		describe('performance and optimization tests', () => {
			it('should handle optimized small matrix sizes efficiently', () => {
				// Test all optimized sizes: 1x1, 2x2, 3x3, 4x4
				const matrix1: TMatrix1 = [[2]];
				const matrix2: TMatrix2 = [[1, 2], [3, 4]];
				const matrix3: TMatrix3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
				const matrix4: TMatrix4 = [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				];

				// Test matrix-matrix multiplication for optimized sizes
				const result1 = MatrixMultiply(matrix1, matrix1);
				const result2 = MatrixMultiply(matrix2, matrix2);
				const result3 = MatrixMultiply(matrix3, matrix3);
				const result4 = MatrixMultiply(matrix4, matrix4);
				expect(result1).toEqual([[4]]);
				expect(result2).toEqual([[7, 10], [15, 22]]);
				expect(result3).toEqual(matrix3); // Identity matrix
				expect(result4).toEqual(matrix4); // Identity matrix
			});

			it('should maintain consistency between algorithms', () => {
				// Create a small matrix that would use standard algorithm
				const size = 8;
				const matrix = MatrixCreate(size, size);

				// Fill with known pattern
				for (let i = 0; i < size; i++) {
					const row = matrix[i];
					AssertMatrixRow(row, { rowIndex: i });

					for (let j = 0; j < size; j++) {
						row[j] = (i + 1) * (j + 1);
					}
				}

				// Multiply by identity - should preserve matrix
				const identity = MatrixCreate(size, size);

				for (let i = 0; i < size; i++) {
					const row = identity[i];
					AssertMatrixRow(row, { rowIndex: i });

					for (let j = 0; j < size; j++) {
						row[j] = i === j ? 1 : 0;
					}
				}

				const result = MatrixMultiply(matrix, identity);
				expect(result).toEqual(matrix);
			});

			it('should handle repeated operations consistently', () => {
				const matrix: TMatrix2 = [[1, 2], [3, 4]];
				const vector: TVector = [1, 1];

				// Perform same operation multiple times
				const results = Array.from({ length: 5 }, () => MatrixMultiply(matrix, vector));
				// All results should be identical
				results.forEach((result) => {
					expect(result).toEqual([3, 7]);
				});
			});

			it('should handle chained multiplications correctly', () => {
				const a: TMatrix = [[1, 2]];
				const b: TMatrix = [[3], [4]];
				const c: TMatrix = [[5, 6]];

				// Test associativity: (A*B)*C = A*(B*C)
				const leftAssoc = MatrixMultiply(MatrixMultiply(a, b), c);
				const rightAssoc = MatrixMultiply(a, MatrixMultiply(b, c));
				expect(leftAssoc).toEqual(rightAssoc);
			});
		});
	});

	describe('MatrixSubmatrix', () => {
		it('should extract 2x2 submatrix from top-left', () => {
			const matrix: TMatrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];
			const result = MatrixSubmatrix(matrix, 0, 0, 2, 2);
			expect(result).toEqual([[1, 2], [5, 6]]);
		});

		it('should extract 2x2 submatrix from center', () => {
			const matrix: TMatrix = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]];
			const result = MatrixSubmatrix(matrix, 1, 1, 2, 2);
			expect(result).toEqual([[6, 7], [10, 11]]);
		});

		it('should extract single element', () => {
			const matrix: TMatrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
			const result = MatrixSubmatrix(matrix, 1, 1, 1, 1);
			expect(result).toEqual([[5]]);
		});

		it('should extract full row', () => {
			const matrix: TMatrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
			const result = MatrixSubmatrix(matrix, 0, 1, 3, 1);
			expect(result).toEqual([[4, 5, 6]]);
		});

		it('should extract full column', () => {
			const matrix: TMatrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
			const result = MatrixSubmatrix(matrix, 1, 0, 1, 3);
			expect(result).toEqual([[2], [5], [8]]);
		});

		it('should handle edge case at matrix boundaries', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			const result = MatrixSubmatrix(matrix, 1, 1, 1, 1);
			expect(result).toEqual([[4]]);
		});
	});

	describe('MatrixPad', () => {
		it('should pad 2x2 matrix to 4x4', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			const result = MatrixPad(matrix, 4, 4);
			expect(result).toEqual([
				[1, 2, 0, 0],
				[3, 4, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			]);
		});

		it('should pad matrix asymmetrically', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			const result = MatrixPad(matrix, 3, 4);
			expect(result).toEqual([
				[1, 2, 0, 0],
				[3, 4, 0, 0],
				[0, 0, 0, 0],
			]);
		});

		it('should pad single element matrix', () => {
			const matrix: TMatrix1 = [[5]];
			const result = MatrixPad(matrix, 3, 3);
			expect(result).toEqual([
				[5, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			]);
		});

		it('should handle padding with same dimensions', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			const result = MatrixPad(matrix, 2, 2);
			expect(result).toEqual([[1, 2], [3, 4]]);
		});

		it('should pad only rows', () => {
			const matrix: TMatrix = [[1, 2, 3], [4, 5, 6]];
			const result = MatrixPad(matrix, 4, 3);
			expect(result).toEqual([
				[1, 2, 3],
				[4, 5, 6],
				[0, 0, 0],
				[0, 0, 0],
			]);
		});

		it('should pad only columns', () => {
			const matrix: TMatrix = [[1, 2], [3, 4], [5, 6]];
			const result = MatrixPad(matrix, 3, 4);
			expect(result).toEqual([
				[1, 2, 0, 0],
				[3, 4, 0, 0],
				[5, 6, 0, 0],
			]);
		});
	});

	describe('MatrixCombine', () => {
		it('should combine four 2x2 matrices into 4x4', () => {
			const c11: TMatrix = [[1, 2], [3, 4]];
			const c12: TMatrix = [[5, 6], [7, 8]];
			const c21: TMatrix = [[9, 10], [11, 12]];
			const c22: TMatrix = [[13, 14], [15, 16]];

			const result = MatrixCombine(c11, c12, c21, c22);
			expect(result).toEqual([
				[1, 2, 5, 6],
				[3, 4, 7, 8],
				[9, 10, 13, 14],
				[11, 12, 15, 16],
			]);
		});

		it('should combine four 1x1 matrices into 2x2', () => {
			const c11: TMatrix1 = [[1]];
			const c12: TMatrix1 = [[2]];
			const c21: TMatrix1 = [[3]];
			const c22: TMatrix1 = [[4]];

			const result = MatrixCombine(c11, c12, c21, c22);
			expect(result).toEqual([
				[1, 2],
				[3, 4],
			]);
		});

		it('should handle matrices with negative numbers', () => {
			const c11: TMatrix = [[1, -2], [-3, 4]];
			const c12: TMatrix = [[-5, 6], [7, -8]];
			const c21: TMatrix = [[9, -10], [-11, 12]];
			const c22: TMatrix = [[-13, 14], [15, -16]];

			const result = MatrixCombine(c11, c12, c21, c22);
			expect(result).toEqual([
				[1, -2, -5, 6],
				[-3, 4, 7, -8],
				[9, -10, -13, 14],
				[-11, 12, 15, -16],
			]);
		});

		it('should handle matrices with zeros', () => {
			const c11: TMatrix = [[0, 0], [0, 0]];
			const c12: TMatrix = [[1, 2], [3, 4]];
			const c21: TMatrix = [[5, 6], [7, 8]];
			const c22: TMatrix = [[0, 0], [0, 0]];

			const result = MatrixCombine(c11, c12, c21, c22);
			expect(result).toEqual([
				[0, 0, 1, 2],
				[0, 0, 3, 4],
				[5, 6, 0, 0],
				[7, 8, 0, 0],
			]);
		});
	});

	describe('integration tests', () => {
		it('should perform complex operations sequence', () => {
			// Create two 2x2 matrices
			const a: TMatrix2 = [[1, 2], [3, 4]];
			const b: TMatrix2 = [[5, 6], [7, 8]];

			// Add them
			const sum = MatrixAdd(a, b);
			expect(sum).toEqual([[6, 8], [10, 12]]);

			// Multiply result by scalar
			const scaled = MatrixMultiply(sum, 0.5);
			expect(scaled).toEqual([[3, 4], [5, 6]]);

			// Subtract original matrix from result
			const diff = MatrixSubtract(scaled, a);
			expect(diff).toEqual([[2, 2], [2, 2]]);
		});

		it('should work with submatrix operations in Strassen context', () => {
			const matrix: TMatrix = [
				[1, 2, 3, 4],
				[5, 6, 7, 8],
				[9, 10, 11, 12],
				[13, 14, 15, 16],
			];

			// Extract quadrants
			const c11 = MatrixSubmatrix(matrix, 0, 0, 2, 2);
			const c12 = MatrixSubmatrix(matrix, 2, 0, 2, 2);
			const c21 = MatrixSubmatrix(matrix, 0, 2, 2, 2);
			const c22 = MatrixSubmatrix(matrix, 2, 2, 2, 2);

			// Recombine
			const reconstructed = MatrixCombine(c11, c12, c21, c22);
			expect(reconstructed).toEqual(matrix);
		});

		it('should handle padding and submatrix extraction round trip', () => {
			const original: TMatrix = [[1, 2], [3, 4]];

			// Pad to larger size
			const padded = MatrixPad(original, 4, 4);

			// Extract original size back
			const extracted = MatrixSubmatrix(padded, 0, 0, 2, 2);
			expect(extracted).toEqual(original);
		});
	});
});
