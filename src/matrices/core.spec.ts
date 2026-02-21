import { AssertMatrixRow, AssertMatrixValue } from './asserts.js';
import { MatrixCreate, MatrixSize, MatrixSizeSquare, MatrixIsValid, MatrixIsSquare, MatrixIsIdentity, MatrixIsSymmetric, MatrixIsDiagonal, MatrixIdentity, MatrixClone, MatrixEquals, MatrixToString, MatrixRank, MatrixTrace, MatrixTranspose, MatrixMap, MatrixIsZero } from './core.js';
import { IMatrix } from './types.js';

describe('Matrices Core', () => {
	describe('MatrixCreate', () => {
		test('should create a 1x1 matrix with default parameters', () => {
			const matrix = MatrixCreate();
			expect(matrix).toEqual([[0]]);
		});

		test('should create a 1x1 matrix when size is 1', () => {
			const matrix = MatrixCreate(1);
			expect(matrix).toEqual([[0]]);
		});

		test('should create a 2x2 matrix when size is 2', () => {
			const matrix = MatrixCreate(2);
			expect(matrix).toEqual([[0, 0], [0, 0]]);
		});

		test('should create a 3x3 matrix when size is 3', () => {
			const matrix = MatrixCreate(3);
			expect(matrix).toEqual([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
		});

		test('should create a 4x4 matrix when size is 4', () => {
			const matrix = MatrixCreate(4);
			expect(matrix).toEqual([
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			]);
		});

		test('should create a rectangular matrix with specified rows and columns', () => {
			const matrix = MatrixCreate(2, 3);
			expect(matrix).toEqual([[0, 0, 0], [0, 0, 0]]);
		});

		test('should create a large square matrix', () => {
			const matrix = MatrixCreate(5, 5);
			expect(matrix).toHaveLength(5);
			expect(matrix[0]).toHaveLength(5);
			expect(matrix.every((row: number[]) => row.every((val: number) => val === 0))).toBe(true);
		});

		test('should throw error for negative rows', () => {
			expect(() => MatrixCreate(-1 as any)).toThrow('Rows must be a non-negative integer');
		});

		test('should throw error for negative columns', () => {
			expect(() => MatrixCreate(2, -1)).toThrow('Columns must be a non-negative integer');
		});

		test('should throw error for non-integer rows', () => {
			expect(() => MatrixCreate(2.5 as any)).toThrow('Rows must be a non-negative integer');
		});

		test('should throw error for non-integer columns', () => {
			expect(() => MatrixCreate(2, 3.5)).toThrow('Columns must be a non-negative integer');
		});

		test('should create empty matrix when size is 0', () => {
			const matrix = MatrixCreate(0, 0);
			expect(matrix).toEqual([]);
		});
	});

	describe('MatrixSize', () => {
		test('should return correct size for square matrix', () => {
			const matrix = [[1, 2], [3, 4]];
			expect(MatrixSize(matrix)).toEqual([2, 2]);
		});

		test('should return correct size for rectangular matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			expect(MatrixSize(matrix)).toEqual([2, 3]);
		});

		test('should return [0, 0] for empty matrix', () => {
			const matrix: number[][] = [];
			expect(MatrixSize(matrix)).toEqual([0, 0]);
		});

		test('should return correct size for single row matrix', () => {
			const matrix = [[1, 2, 3, 4]];
			expect(MatrixSize(matrix)).toEqual([1, 4]);
		});

		test('should return correct size for single column matrix', () => {
			const matrix = [[1], [2], [3]];
			expect(MatrixSize(matrix)).toEqual([3, 1]);
		});

		test('should throw error for invalid matrix', () => {
			expect(() => MatrixSize('invalid' as any)).toThrow();
		});
	});

	describe('MatrixSizeSquare', () => {
		test('should return size for square matrix', () => {
			const matrix = [[1, 2], [3, 4]];
			expect(MatrixSizeSquare(matrix)).toBe(2);
		});

		test('should return size for 3x3 matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
			expect(MatrixSizeSquare(matrix)).toBe(3);
		});

		test('should throw error for non-square matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			expect(() => MatrixSizeSquare(matrix)).toThrow();
		});

		test('should return 1 for 1x1 matrix', () => {
			const matrix = [[5]];
			expect(MatrixSizeSquare(matrix)).toBe(1);
		});

		test('should throw for empty matrix', () => {
			const matrix: number[][] = [];
			expect(() => MatrixSizeSquare(matrix)).toThrow('Matrix must have at least one row and one column');
		});
	});

	describe('MatrixIsValid', () => {
		test('should return true for valid matrix', () => {
			expect(MatrixIsValid([[1, 2], [3, 4]])).toBe(true);
		});

		test('should return false for empty matrix', () => {
			expect(MatrixIsValid([])).toBe(false);
		});

		test('should return false for non-array input', () => {
			expect(MatrixIsValid('invalid')).toBe(false);
			expect(MatrixIsValid(123)).toBe(false);
			expect(MatrixIsValid(null)).toBe(false);
			expect(MatrixIsValid(undefined)).toBe(false);
		});

		test('should return false for matrix with non-number values', () => {
			expect(MatrixIsValid([[1, 'invalid'], [3, 4]])).toBe(false);
		});

		test('should return false for matrix with inconsistent row lengths', () => {
			expect(MatrixIsValid([[1, 2], [3]])).toBe(false);
		});

		test('should return true for single element matrix', () => {
			expect(MatrixIsValid([[42]])).toBe(true);
		});
	});

	describe('MatrixIsSquare', () => {
		test('should return true for square matrix', () => {
			expect(MatrixIsSquare([[1, 2], [3, 4]])).toBe(true);
		});

		test('should return false for rectangular matrix', () => {
			expect(MatrixIsSquare([[1, 2, 3], [4, 5, 6]])).toBe(false);
		});

		test('should return true for 1x1 matrix', () => {
			expect(MatrixIsSquare([[1]])).toBe(true);
		});

		test('should return false for empty matrix', () => {
			expect(MatrixIsSquare([])).toBe(false);
		});

		test('should return true for 3x3 matrix', () => {
			expect(MatrixIsSquare([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toBe(true);
		});
	});

	describe('MatrixIsZero', () => {
		test('should return true for all-zero matrix', () => {
			const matrix = [[0, 0], [0, 0]];
			expect(MatrixIsZero(matrix)).toBe(true);
		});

		test('should return false for matrix with non-zero values', () => {
			const matrix = [[1, 0], [0, 0]];
			expect(MatrixIsZero(matrix)).toBe(false);
		});

		test('should return true for single element zero matrix', () => {
			const matrix = [[0]];
			expect(MatrixIsZero(matrix)).toBe(true);
		});

		test('should return false for single element non-zero matrix', () => {
			const matrix = [[1]];
			expect(MatrixIsZero(matrix)).toBe(false);
		});

		test('should throw for empty matrix', () => {
			const matrix: number[][] = [];
			expect(() => MatrixIsZero(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should handle matrices with very small values within default threshold', () => {
			const matrix = [[1e-15, 0], [0, -1e-15]];
			expect(MatrixIsZero(matrix)).toBe(true);
		});

		test('should handle matrices with values above default threshold', () => {
			const matrix = [[1e-13, 0], [0, 0]];
			expect(MatrixIsZero(matrix)).toBe(false);
		});

		test('should respect custom threshold', () => {
			const matrix = [[0.001, 0], [0, 0]];
			expect(MatrixIsZero(matrix, 0.01)).toBe(true);
			expect(MatrixIsZero(matrix, 0.0001)).toBe(false);
		});

		test('should handle negative values within threshold', () => {
			const matrix = [[-1e-15, 1e-15], [0, 0]];
			expect(MatrixIsZero(matrix)).toBe(true);
		});

		test('should handle negative values above threshold', () => {
			const matrix = [[-0.1, 0], [0, 0]];
			expect(MatrixIsZero(matrix)).toBe(false);
		});

		test('should handle rectangular matrices', () => {
			const zeroMatrix = [[0, 0, 0], [0, 0, 0]];
			const nonZeroMatrix = [[0, 0, 1], [0, 0, 0]];
			expect(MatrixIsZero(zeroMatrix)).toBe(true);
			expect(MatrixIsZero(nonZeroMatrix)).toBe(false);
		});

		test('should handle large matrices', () => {
			const largeZeroMatrix = Array(100).fill(null).map(() => Array(100).fill(0));
			expect(MatrixIsZero(largeZeroMatrix)).toBe(true);

			// Add one non-zero element
			// eslint-disable-next-line prefer-destructuring
			const row = largeZeroMatrix[50];
			if (row) row[50] = 1e-13;

			expect(MatrixIsZero(largeZeroMatrix)).toBe(false);
		});

		test('should handle floating point precision edge cases', () => {
			const matrix = [[0.1 + 0.2 - 0.3, 0], [0, 0]]; // Should be close to 0 due to floating point precision
			expect(MatrixIsZero(matrix)).toBe(true); // Should be within default threshold
		});

		test('should throw error for invalid matrix', () => {
			expect(() => MatrixIsZero('invalid' as any)).toThrow();
		});

		test('should handle zero threshold', () => {
			const matrix = [[0, 0], [0, 0]];
			expect(MatrixIsZero(matrix, 0)).toBe(true);

			const matrixWithTinyValue = [[1e-100, 0], [0, 0]];
			expect(MatrixIsZero(matrixWithTinyValue, 0)).toBe(false);
		});

		test('should handle single row zero matrix', () => {
			const matrix = [[0, 0, 0, 0]];
			expect(MatrixIsZero(matrix)).toBe(true);
		});

		test('should handle single column zero matrix', () => {
			const matrix = [[0], [0], [0]];
			expect(MatrixIsZero(matrix)).toBe(true);
		});

		test('should handle mixed positive and negative small values', () => {
			const matrix = [[1e-15, -1e-15], [-1e-15, 1e-15]];
			expect(MatrixIsZero(matrix)).toBe(true);
		});
	});

	describe('MatrixIdentity', () => {
		test('should create 2x2 identity matrix', () => {
			const identity = MatrixIdentity(2);
			expect(identity).toEqual([[1, 0], [0, 1]]);
		});

		test('should create 3x3 identity matrix', () => {
			const identity = MatrixIdentity(3);
			expect(identity).toEqual([
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			]);
		});

		test('should create 1x1 identity matrix', () => {
			const identity = MatrixIdentity(1);
			expect(identity).toEqual([[1]]);
		});

		test('should create empty identity matrix for size 0', () => {
			const identity = MatrixIdentity(0);
			expect(identity).toEqual([]);
		});

		test('should throw error for negative size', () => {
			expect(() => MatrixIdentity(-1)).toThrow('Size must be a non-negative integer');
		});

		test('should throw error for non-integer size', () => {
			expect(() => MatrixIdentity(2.5)).toThrow('Size must be a non-negative integer');
		});

		// Test overloaded versions for specific matrix types
		test('should create 1x1 identity matrix with IMatrix1 overload', () => {
			const identity = MatrixIdentity(1);
			expect(identity).toEqual([[1]]);
			// TypeScript compilation ensures correct typing
			expect(Array.isArray(identity)).toBe(true);
			expect(identity.length).toBe(1);
			expect(identity[0].length).toBe(1);
		});

		test('should create 2x2 identity matrix with IMatrix2 overload', () => {
			const identity = MatrixIdentity(2);
			expect(identity).toEqual([[1, 0], [0, 1]]);
			// TypeScript compilation ensures correct typing
			expect(Array.isArray(identity)).toBe(true);
			expect(identity.length).toBe(2);
			expect(identity[0].length).toBe(2);
			expect(identity[1].length).toBe(2);
		});

		test('should create 3x3 identity matrix with IMatrix3 overload', () => {
			const identity = MatrixIdentity(3);
			expect(identity).toEqual([
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			]);
			// TypeScript compilation ensures correct typing
			expect(Array.isArray(identity)).toBe(true);
			expect(identity.length).toBe(3);
			expect(identity[0].length).toBe(3);
			expect(identity[1].length).toBe(3);
			expect(identity[2].length).toBe(3);
		});

		test('should create 4x4 identity matrix with IMatrix4 overload', () => {
			const identity = MatrixIdentity(4);
			expect(identity).toEqual([
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1],
			]);
			// TypeScript compilation ensures correct typing
			expect(Array.isArray(identity)).toBe(true);
			expect(identity.length).toBe(4);
			expect(identity[0].length).toBe(4);
			expect(identity[1].length).toBe(4);
			expect(identity[2].length).toBe(4);
			expect(identity[3].length).toBe(4);
		});

		test('should create identity matrices with proper diagonal elements for overloaded types', () => {
			// Test IMatrix1
			const id1 = MatrixIdentity(1);
			expect(id1[0][0]).toBe(1);

			// Test IMatrix2
			const id2 = MatrixIdentity(2);
			expect(id2[0][0]).toBe(1);
			expect(id2[1][1]).toBe(1);
			expect(id2[0][1]).toBe(0);
			expect(id2[1][0]).toBe(0);

			// Test IMatrix3
			const id3 = MatrixIdentity(3);
			expect(id3[0][0]).toBe(1);
			expect(id3[1][1]).toBe(1);
			expect(id3[2][2]).toBe(1);

			// Check all off-diagonal elements are 0
			for (let i = 0; i < 3; i++) {
				const id3Row = id3[i];
				AssertMatrixRow(id3Row);

				for (let j = 0; j < 3; j++) {
					const id3Value = id3Row[j];
					AssertMatrixValue(id3Value, { rowIndex: i, columnIndex: j });
					if (i !== j) expect(id3Value).toBe(0);
				}
			}

			// Test IMatrix4
			const id4 = MatrixIdentity(4);
			expect(id4[0][0]).toBe(1);
			expect(id4[1][1]).toBe(1);
			expect(id4[2][2]).toBe(1);
			expect(id4[3][3]).toBe(1);

			// Check all off-diagonal elements are 0
			for (let i = 0; i < 4; i++) {
				const id4Row = id4[i];
				AssertMatrixRow(id4Row);

				for (let j = 0; j < 4; j++) {
					const id4Value = id4Row[j];
					AssertMatrixValue(id4Value, { rowIndex: i, columnIndex: j });
					if (i !== j) expect(id4Value).toBe(0);
				}
			}
		});
		test('should handle edge cases for overloaded matrix types', () => {
			// Test that all diagonal elements are exactly 1
			// Test each size individually to ensure proper overload resolution
			[1, 2, 3, 4].forEach((size) => {
				let identity: IMatrix;

				switch (size) {
					case 1:
						identity = MatrixIdentity(1);
						break;
					case 2:
						identity = MatrixIdentity(2);
						break;
					case 3:
						identity = MatrixIdentity(3);
						break;
					case 4:
						identity = MatrixIdentity(4);
						break;
					default:
						throw new Error(`Unexpected size: ${size}`);
				}

				// Verify all diagonal elements are 1
				for (let i = 0; i < size; i++) {
					const row = identity[i];
					AssertMatrixRow(row, { rowIndex: i });

					const value = row[i];
					AssertMatrixValue(value, { rowIndex: i, columnIndex: i });
					expect(value).toBe(1);
				}

				// Verify all off-diagonal elements are 0
				for (let i = 0; i < size; i++) {
					const row = identity[i];
					AssertMatrixRow(row, { rowIndex: i });

					for (let j = 0; j < size; j++) {
						const value = row[j];
						AssertMatrixValue(value, { rowIndex: i, columnIndex: j });
						if (i !== j) expect(value).toBe(0);
					}
				}
			});
		});
	});

	describe('MatrixClone', () => {
		test('should create independent copy of matrix', () => {
			const original = [[1, 2], [3, 4]];
			const cloned = MatrixClone(original);
			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned[0]).not.toBe(original[0]);

			// Modify original and ensure clone is unchanged
			const [row] = original;
			AssertMatrixRow(row);

			const [value] = row;
			AssertMatrixValue(value, { rowIndex: 0, columnIndex: 0 });
			if (original[0]) {
				original[0][0] = 999;
			}
			expect(cloned[0]).toBeDefined();
			if (cloned[0]) expect(cloned[0][0]).toBe(1);
		});

		test('should throw for empty matrix', () => {
			const original: number[][] = [];
			expect(() => MatrixClone(original)).toThrow('Matrix must have at least one row and one column');
		});

		test('should clone single element matrix', () => {
			const original = [[42]];
			const cloned = MatrixClone(original);
			expect(cloned).toEqual([[42]]);
			expect(cloned).not.toBe(original);
		});

		test('should throw error for invalid matrix', () => {
			expect(() => MatrixClone('invalid' as any)).toThrow();
		});
	});

	describe('MatrixEquals', () => {
		test('should return true for identical matrices', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[1, 2], [3, 4]];
			expect(MatrixEquals(a, b)).toBe(true);
		});

		test('should return false for different matrices', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[1, 2], [3, 5]];
			expect(MatrixEquals(a, b)).toBe(false);
		});

		test('should return false for matrices with different dimensions', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[1, 2, 3], [4, 5, 6]];
			expect(MatrixEquals(a, b)).toBe(false);
		});

		test('should return true for matrices within tolerance', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[1.0001, 2], [3, 4]];
			expect(MatrixEquals(a, b, 0.001)).toBe(true);
		});

		test('should return false for matrices outside tolerance', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[1.1, 2], [3, 4]];
			expect(MatrixEquals(a, b, 0.001)).toBe(false);
		});

		test('should throw for empty matrices', () => {
			expect(() => MatrixEquals([], [])).toThrow('Matrix must have at least one row and one column');
		});

		test('should use default tolerance', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[1.0000000001, 2], [3, 4]];
			expect(MatrixEquals(a, b)).toBe(true);
		});

		test('should throw error for negative tolerance', () => {
			const a = [[1, 2]];
			const b = [[1, 2]];
			expect(() => MatrixEquals(a, b, -1)).toThrow('Tolerance must be a non-negative number');
		});
	});

	describe('MatrixToString', () => {
		test('should format matrix with default precision', () => {
			const matrix = [[1.234, 2.567], [3.891, 4.123]];
			const result = MatrixToString(matrix);
			expect(result).toBe('[ 1.23, 2.57 ]\n[ 3.89, 4.12 ]');
		});

		test('should format matrix with custom precision', () => {
			const matrix = [[1.234, 2.567]];
			const result = MatrixToString(matrix, 1);
			expect(result).toBe('[ 1.2, 2.6 ]');
		});

		test('should format matrix with zero precision', () => {
			const matrix = [[1.234, 2.567]];
			const result = MatrixToString(matrix, 0);
			expect(result).toBe('[ 1, 3 ]');
		});

		test('should format single element matrix', () => {
			const matrix = [[42.123]];
			const result = MatrixToString(matrix);
			expect(result).toBe('[ 42.12 ]');
		});

		test('should throw for empty matrix', () => {
			const matrix: number[][] = [];
			expect(() => MatrixToString(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should throw error for negative precision', () => {
			const matrix = [[1, 2]];
			expect(() => MatrixToString(matrix, -1)).toThrow('Precision must be a non-negative integer');
		});

		test('should throw error for non-integer precision', () => {
			const matrix = [[1, 2]];
			expect(() => MatrixToString(matrix, 2.5)).toThrow('Precision must be a non-negative integer');
		});
	});

	describe('MatrixRank', () => {
		test('should return rank 2 for identity matrix', () => {
			const matrix = [[1, 0], [0, 1]];
			expect(MatrixRank(matrix)).toBe(2);
		});

		test('should return rank 1 for linearly dependent rows', () => {
			const matrix = [[1, 2], [2, 4]];
			expect(MatrixRank(matrix)).toBe(1);
		});

		test('should return rank 0 for zero matrix', () => {
			const matrix = [[0, 0], [0, 0]];
			expect(MatrixRank(matrix)).toBe(0);
		});

		test('should return rank 3 for full rank 3x3 matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 10]];
			expect(MatrixRank(matrix)).toBe(3);
		});

		test('should return rank 2 for rectangular matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			expect(MatrixRank(matrix)).toBe(2);
		});

		test('should throw for empty matrix', () => {
			const matrix: number[][] = [];
			expect(() => MatrixRank(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should use custom tolerance', () => {
			const matrix = [[1, 2], [1.0000001, 2.0000001]];
			expect(MatrixRank(matrix, 1e-5)).toBe(1);
			expect(MatrixRank(matrix, 1e-8)).toBe(2);
		});

		test('should throw error for negative tolerance', () => {
			const matrix = [[1, 2]];
			expect(() => MatrixRank(matrix, -1)).toThrow('Tolerance must be a non-negative number');
		});
	});

	describe('MatrixTrace', () => {
		test('should return trace of 2x2 matrix', () => {
			const matrix = [[1, 2], [3, 4]];
			expect(MatrixTrace(matrix)).toBe(5); // 1 + 4
		});

		test('should return trace of 3x3 matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
			expect(MatrixTrace(matrix)).toBe(15); // 1 + 5 + 9
		});

		test('should return trace of rectangular matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			expect(MatrixTrace(matrix)).toBe(6); // 1 + 5
		});

		test('should return trace of single element matrix', () => {
			const matrix = [[42]];
			expect(MatrixTrace(matrix)).toBe(42);
		});

		test('should throw for empty matrix', () => {
			const matrix: number[][] = [];
			expect(() => MatrixTrace(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should handle negative values', () => {
			const matrix = [[-1, 2], [3, -4]];
			expect(MatrixTrace(matrix)).toBe(-5); // -1 + (-4)
		});
	});

	describe('MatrixTranspose', () => {
		test('should transpose 2x2 matrix', () => {
			const matrix = [[1, 2], [3, 4]];
			const transposed = MatrixTranspose(matrix);
			expect(transposed).toEqual([[1, 3], [2, 4]]);
		});

		test('should transpose rectangular matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			const transposed = MatrixTranspose(matrix);
			expect(transposed).toEqual([[1, 4], [2, 5], [3, 6]]);
		});

		test('should transpose single row matrix', () => {
			const matrix = [[1, 2, 3]];
			const transposed = MatrixTranspose(matrix);
			expect(transposed).toEqual([[1], [2], [3]]);
		});

		test('should transpose single column matrix', () => {
			const matrix = [[1], [2], [3]];
			const transposed = MatrixTranspose(matrix);
			expect(transposed).toEqual([[1, 2, 3]]);
		});

		test('should transpose single element matrix', () => {
			const matrix = [[42]];
			const transposed = MatrixTranspose(matrix);
			expect(transposed).toEqual([[42]]);
		});

		test('should throw for empty matrix', () => {
			const matrix: number[][] = [];
			expect(() => MatrixTranspose(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should not modify original matrix', () => {
			const original = [[1, 2], [3, 4]];
			const transposed = MatrixTranspose(original);
			expect(original).toEqual([[1, 2], [3, 4]]);
			expect(transposed).not.toBe(original);
		});
	});

	describe('MatrixMap', () => {
		test('should apply function to each element', () => {
			const matrix = [[1, 2], [3, 4]];
			const squared = MatrixMap(matrix, (value) => value * value);
			expect(squared).toEqual([[1, 4], [9, 16]]);
		});

		test('should provide row and column indices to function', () => {
			const matrix = [[1, 2], [3, 4]];
			const result = MatrixMap(matrix, (value, row, col) => value + row + col);
			expect(result).toEqual([[1, 3], [4, 6]]);
		});

		test('should throw for empty matrix', () => {
			const matrix: number[][] = [];
			expect(() => MatrixMap(matrix, (value) => value * 2)).toThrow('Matrix must have at least one row and one column');
		});

		test('should handle single element matrix', () => {
			const matrix = [[5]];
			const result = MatrixMap(matrix, (value) => value * 10);
			expect(result).toEqual([[50]]);
		});

		test('should not modify original matrix', () => {
			const original = [[1, 2], [3, 4]];
			const mapped = MatrixMap(original, (value) => value * 2);
			expect(original).toEqual([[1, 2], [3, 4]]);
			expect(mapped).toEqual([[2, 4], [6, 8]]);
			expect(mapped).not.toBe(original);
		});

		test('should handle negative values', () => {
			const matrix = [[-1, 2], [-3, 4]];
			const result = MatrixMap(matrix, (value) => Math.abs(value));
			expect(result).toEqual([[1, 2], [3, 4]]);
		});

		test('should work with complex transformations', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			const result = MatrixMap(matrix, (value, row, col) => (row + 1) * (col + 1) * value);
			expect(result).toEqual([[1, 4, 9], [8, 20, 36]]);
		});
	});

	describe('MatrixIsIdentity', () => {
		test('returns true for 2×2 identity matrix', () => {
			expect(MatrixIsIdentity([[1, 0], [0, 1]])).toBe(true);
		});
		test('returns true for 3×3 identity matrix', () => {
			expect(MatrixIsIdentity([[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(true);
		});
		test('MatrixIdentity(n) always satisfies MatrixIsIdentity', () => {
			for (const n of [1, 2, 3, 4]) {
				expect(MatrixIsIdentity(MatrixIdentity(n))).toBe(true);
			}
		});
		test('returns false for non-identity square matrix', () => {
			expect(MatrixIsIdentity([[1, 1], [0, 1]])).toBe(false);
			expect(MatrixIsIdentity([[2, 0], [0, 1]])).toBe(false);
		});
		test('returns false for non-square matrix', () => {
			expect(MatrixIsIdentity([[1, 0, 0], [0, 1, 0]])).toBe(false);
		});
		test('respects floating-point tolerance', () => {
			// 1 + 1e-15 is representable without precision loss and falls within the default 1e-14 threshold
			expect(MatrixIsIdentity([[1 + 1e-15, 0], [0, 1]])).toBe(true);
			expect(MatrixIsIdentity([[1.01, 0], [0, 1]], 0.001)).toBe(false);
		});
	});

	describe('MatrixIsSymmetric', () => {
		test('returns true for symmetric 2×2 matrix', () => {
			expect(MatrixIsSymmetric([[1, 2], [2, 1]])).toBe(true);
		});
		test('returns true for symmetric 3×3 matrix', () => {
			expect(MatrixIsSymmetric([[1, 2, 3], [2, 5, 4], [3, 4, 6]])).toBe(true);
		});
		test('identity matrix is symmetric', () => {
			expect(MatrixIsSymmetric(MatrixIdentity(4))).toBe(true);
		});
		test('returns false for non-symmetric matrix', () => {
			expect(MatrixIsSymmetric([[1, 2], [3, 4]])).toBe(false);
		});
		test('returns false for non-square matrix', () => {
			expect(MatrixIsSymmetric([[1, 2, 3], [2, 4, 5]])).toBe(false);
		});
	});

	describe('MatrixIsDiagonal', () => {
		test('returns true for diagonal 2×2 matrix', () => {
			expect(MatrixIsDiagonal([[3, 0], [0, 7]])).toBe(true);
		});
		test('returns true for diagonal 3×3 matrix', () => {
			expect(MatrixIsDiagonal([[1, 0, 0], [0, 5, 0], [0, 0, 2]])).toBe(true);
		});
		test('identity matrix is diagonal', () => {
			expect(MatrixIsDiagonal(MatrixIdentity(3))).toBe(true);
		});
		test('returns false for non-diagonal square matrix', () => {
			expect(MatrixIsDiagonal([[1, 2], [0, 1]])).toBe(false);
		});
		test('returns false for non-square matrix', () => {
			expect(MatrixIsDiagonal([[1, 0, 0], [0, 1, 0]])).toBe(false);
		});
	});
});
