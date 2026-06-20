import {
	AssertMatrix,
	AssertMatrix1,
	AssertMatrix2,
	AssertMatrix3,
	AssertMatrix4,
	AssertMatrixSquare,
	AssertMatricesCompatible,
	MatrixError,
	ValidateMatrix,
	ValidateMatrix1,
	ValidateMatrix2,
	ValidateMatrix3,
	ValidateMatrix4,
	ValidateMatrixSquare
} from './asserts.js';

describe('Matrix Assertions', () => {
	describe('MatrixError', () => {
		test('should create MatrixError with default message', () => {
			const error = new MatrixError('');
			expect(error.name).toBe('MatrixError');
			expect(error.message).toBe('');
			expect(error instanceof Error).toBe(true);
			expect(error instanceof MatrixError).toBe(true);
		});

		test('should create MatrixError with custom message', () => {
			const message = 'Custom matrix error message';
			const error = new MatrixError(message);
			expect(error.name).toBe('MatrixError');
			expect(error.message).toBe(message);
			expect(error instanceof Error).toBe(true);
			expect(error instanceof MatrixError).toBe(true);
		});

		test('should maintain proper prototype chain', () => {
			const error = new MatrixError('Test');
			expect(Object.getPrototypeOf(error)).toBe(MatrixError.prototype);
		});
	});

	describe('AssertMatrix', () => {
		describe('valid matrices', () => {
			test('should accept valid 2x2 matrix', () => {
				const matrix = [[1, 2], [3, 4]];
				expect(() => AssertMatrix(matrix)).not.toThrow();
			});

			test('should accept valid 3x3 matrix', () => {
				const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
				expect(() => AssertMatrix(matrix)).not.toThrow();
			});

			test('should accept rectangular matrix', () => {
				const matrix = [[1, 2, 3], [4, 5, 6]];
				expect(() => AssertMatrix(matrix)).not.toThrow();
			});

			test('should accept single element matrix', () => {
				const matrix = [[5]];
				expect(() => AssertMatrix(matrix)).not.toThrow();
			});

			test('should accept matrix with zeros', () => {
				const matrix = [[0, 0], [0, 0]];
				expect(() => AssertMatrix(matrix)).not.toThrow();
			});

			test('should accept matrix with negative numbers', () => {
				const matrix = [[-1, -2], [-3, -4]];
				expect(() => AssertMatrix(matrix)).not.toThrow();
			});

			test('should accept matrix with floating point numbers', () => {
				const matrix = [[1.5, 2.7], [3.14, 4.2]];
				expect(() => AssertMatrix(matrix)).not.toThrow();
			});
		});

		describe('invalid matrices', () => {
			test('should throw for non-array input', () => {
				expect(() => AssertMatrix('not a matrix')).toThrow(MatrixError);
				expect(() => AssertMatrix(42)).toThrow(MatrixError);
				expect(() => AssertMatrix(null)).toThrow(MatrixError);
				expect(() => AssertMatrix(undefined)).toThrow(MatrixError);
			});

			test('should throw for matrix with non-numeric elements', () => {
				const matrix = [[1, 'invalid'], [3, 4]];
				expect(() => AssertMatrix(matrix)).toThrow(MatrixError);
			});

			test('should throw for matrix with NaN elements', () => {
				const matrix = [[1, NaN], [3, 4]];
				expect(() => AssertMatrix(matrix)).toThrow(MatrixError);
			});

			test('should throw for matrix with non-array rows', () => {
				const matrix = [1, 2, 3] as unknown;
				expect(() => AssertMatrix(matrix)).toThrow(MatrixError);
			});
		});
	});

	describe('AssertMatrix1', () => {
		test('should accept valid 1x1 matrix', () => {
			const matrix = [[5]];
			expect(() => AssertMatrix1(matrix)).not.toThrow();
		});

		test('should accept 1x1 matrix with zero', () => {
			const matrix = [[0]];
			expect(() => AssertMatrix1(matrix)).not.toThrow();
		});

		test('should accept 1x1 matrix with negative number', () => {
			const matrix = [[-3.14]];
			expect(() => AssertMatrix1(matrix)).not.toThrow();
		});

		test('should throw for 2x2 matrix', () => {
			const matrix = [[1, 2], [3, 4]];
			expect(() => AssertMatrix1(matrix)).toThrow(MatrixError);
		});

		test('should throw for 1x2 matrix', () => {
			const matrix = [[1, 2]];
			expect(() => AssertMatrix1(matrix)).toThrow(MatrixError);
		});

		test('should throw for 2x1 matrix', () => {
			const matrix = [[1], [2]];
			expect(() => AssertMatrix1(matrix)).toThrow(MatrixError);
		});

		test('should throw for empty matrix', () => {
			const matrix: number[][] = [];
			expect(() => AssertMatrix1(matrix)).toThrow(MatrixError);
		});

		test('should throw for non-matrix input', () => {
			expect(() => AssertMatrix1('invalid')).toThrow(MatrixError);
			expect(() => AssertMatrix1(42)).toThrow(MatrixError);
		});
	});

	describe('AssertMatrix2', () => {
		test('should accept valid 2x2 matrix', () => {
			const matrix = [[1, 2], [3, 4]];
			expect(() => AssertMatrix2(matrix)).not.toThrow();
		});

		test('should accept 2x2 matrix with zeros', () => {
			const matrix = [[0, 0], [0, 0]];
			expect(() => AssertMatrix2(matrix)).not.toThrow();
		});

		test('should accept 2x2 matrix with negative numbers', () => {
			const matrix = [[-1, -2], [-3, -4]];
			expect(() => AssertMatrix2(matrix)).not.toThrow();
		});

		test('should accept 2x2 matrix with floating point numbers', () => {
			const matrix = [[1.5, 2.7], [3.14, 4.2]];
			expect(() => AssertMatrix2(matrix)).not.toThrow();
		});

		test('should throw for 1x1 matrix', () => {
			const matrix = [[5]];
			expect(() => AssertMatrix2(matrix)).toThrow(MatrixError);
		});

		test('should throw for 3x3 matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
			expect(() => AssertMatrix2(matrix)).toThrow(MatrixError);
		});

		test('should throw for 2x3 matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			expect(() => AssertMatrix2(matrix)).toThrow(MatrixError);
		});

		test('should throw for 3x2 matrix', () => {
			const matrix = [[1, 2], [3, 4], [5, 6]];
			expect(() => AssertMatrix2(matrix)).toThrow(MatrixError);
		});

		test('should throw for non-matrix input', () => {
			expect(() => AssertMatrix2('invalid')).toThrow(MatrixError);
			expect(() => AssertMatrix2([])).toThrow(MatrixError);
		});
	});

	describe('AssertMatrix3', () => {
		test('should accept valid 3x3 matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
			expect(() => AssertMatrix3(matrix)).not.toThrow();
		});

		test('should accept 3x3 identity matrix', () => {
			const matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
			expect(() => AssertMatrix3(matrix)).not.toThrow();
		});

		test('should accept 3x3 matrix with mixed numbers', () => {
			const matrix = [[-1.5, 0, 2.7], [3, -4, 5.14], [0, 7, -8.9]];
			expect(() => AssertMatrix3(matrix)).not.toThrow();
		});

		test('should throw for 2x2 matrix', () => {
			const matrix = [[1, 2], [3, 4]];
			expect(() => AssertMatrix3(matrix)).toThrow(MatrixError);
		});

		test('should throw for 4x4 matrix', () => {
			const matrix = [
				[1, 2, 3, 4],
				[5, 6, 7, 8],
				[9, 10, 11, 12],
				[13, 14, 15, 16]
			];
			expect(() => AssertMatrix3(matrix)).toThrow(MatrixError);
		});

		test('should throw for 3x2 matrix', () => {
			const matrix = [[1, 2], [3, 4], [5, 6]];
			expect(() => AssertMatrix3(matrix)).toThrow(MatrixError);
		});

		test('should throw for 2x3 matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			expect(() => AssertMatrix3(matrix)).toThrow(MatrixError);
		});

		test('should throw for non-matrix input', () => {
			expect(() => AssertMatrix3('invalid')).toThrow(MatrixError);
			expect(() => AssertMatrix3(null)).toThrow(MatrixError);
		});
	});

	describe('AssertMatrix4', () => {
		test('should accept valid 4x4 matrix', () => {
			const matrix = [
				[1, 2, 3, 4],
				[5, 6, 7, 8],
				[9, 10, 11, 12],
				[13, 14, 15, 16]
			];
			expect(() => AssertMatrix4(matrix)).not.toThrow();
		});

		test('should accept 4x4 identity matrix', () => {
			const matrix = [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1]
			];
			expect(() => AssertMatrix4(matrix)).not.toThrow();
		});

		test('should accept 4x4 matrix with mixed numbers', () => {
			const matrix = [
				[-1.5, 0, 2.7, -3],
				[4, -5.14, 6, 0],
				[0, 7.2, -8, 9],
				[10, 0, -11.5, 12]
			];
			expect(() => AssertMatrix4(matrix)).not.toThrow();
		});

		test('should throw for 3x3 matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
			expect(() => AssertMatrix4(matrix)).toThrow(MatrixError);
		});

		test('should throw for 5x5 matrix', () => {
			const matrix = [
				[1, 2, 3, 4, 5],
				[6, 7, 8, 9, 10],
				[11, 12, 13, 14, 15],
				[16, 17, 18, 19, 20],
				[21, 22, 23, 24, 25]
			];
			expect(() => AssertMatrix4(matrix)).toThrow(MatrixError);
		});

		test('should throw for 4x3 matrix', () => {
			const matrix = [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
				[10, 11, 12]
			];
			expect(() => AssertMatrix4(matrix)).toThrow(MatrixError);
		});

		test('should throw for 3x4 matrix', () => {
			const matrix = [
				[1, 2, 3, 4],
				[5, 6, 7, 8],
				[9, 10, 11, 12]
			];
			expect(() => AssertMatrix4(matrix)).toThrow(MatrixError);
		});

		test('should throw for non-matrix input', () => {
			expect(() => AssertMatrix4('invalid')).toThrow(MatrixError);
			expect(() => AssertMatrix4(undefined)).toThrow(MatrixError);
		});
	});

	describe('edge cases', () => {
		test('should throw for empty matrix', () => {
			const emptyMatrix: number[][] = [];
			expect(() => AssertMatrix(emptyMatrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should throw for matrix with empty rows', () => {
			const matrix = [[], []];
			expect(() => AssertMatrix(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should throw for matrix with jagged rows (inconsistent column count)', () => {
			const matrix = [[1, 2], [3, 4, 5]];
			expect(() => AssertMatrix(matrix)).toThrow('All matrix rows must have the same length');
		});

		test('should throw for matrix with Infinity', () => {
			const matrix = [[1, Infinity], [3, 4]];
			expect(() => AssertMatrix(matrix)).toThrow('Expected finite number');
		});

		test('should throw for matrix with -Infinity', () => {
			const matrix = [[1, -Infinity], [3, 4]];
			expect(() => AssertMatrix(matrix)).toThrow('Expected finite number');
		});

		test('should handle very large numbers', () => {
			const matrix = [[Number.MAX_VALUE, Number.MIN_VALUE]];
			expect(() => AssertMatrix(matrix)).not.toThrow();
		});

		test('should handle very small numbers', () => {
			const matrix = [[Number.EPSILON, -Number.EPSILON]];
			expect(() => AssertMatrix(matrix)).not.toThrow();
		});

		test('should throw for non-numeric elements in matrix', () => {
			const matrix = [[1, 'text'], [3, 4]];
			expect(() => AssertMatrix(matrix)).toThrow('Expected number');
		});

		test('should throw for object elements in matrix', () => {
			const matrix = [[1, {}], [3, 4]];
			expect(() => AssertMatrix(matrix)).toThrow('Expected number');
		});
	});

	describe('AssertMatrixSquare', () => {
		test('should accept valid square matrix 2x2', () => {
			const matrix = [[1, 2], [3, 4]];
			expect(() => AssertMatrixSquare(matrix)).not.toThrow();
		});

		test('should accept valid square matrix 3x3', () => {
			const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
			expect(() => AssertMatrixSquare(matrix)).not.toThrow();
		});

		test('should accept 1x1 matrix', () => {
			const matrix = [[5]];
			expect(() => AssertMatrixSquare(matrix)).not.toThrow();
		});

		test('should throw for rectangular matrix 2x3', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			expect(() => AssertMatrixSquare(matrix)).toThrow('Matrix must be square');
		});

		test('should throw for rectangular matrix 3x2', () => {
			const matrix = [[1, 2], [3, 4], [5, 6]];
			expect(() => AssertMatrixSquare(matrix)).toThrow('Matrix must be square');
		});

		test('should throw for empty matrix', () => {
			const matrix: number[][] = [];
			expect(() => AssertMatrixSquare(matrix)).toThrow('Matrix must be square');
		});

		test('should throw for non-array input', () => {
			expect(() => AssertMatrixSquare('not a matrix')).toThrow('Expected array');
			expect(() => AssertMatrixSquare(42)).toThrow('Expected array');
		});

		test('should throw for non-array rows', () => {
			const matrix = [1, 2, 3] as unknown;
			expect(() => AssertMatrixSquare(matrix)).toThrow('Expected array');
		});

		test('should throw for non-numeric elements in square matrix', () => {
			const matrix = [[1, 'x'], ['y', 4]];
			expect(() => AssertMatrixSquare(matrix)).toThrow('Expected number');
		});

		test('should throw for NaN in square matrix', () => {
			const matrix = [[1, NaN], [3, 4]];
			expect(() => AssertMatrixSquare(matrix)).toThrow('Expected finite number');
		});
	});

	describe('AssertMatricesCompatible', () => {
		test('should accept compatible 2x2 matrices', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[5, 6], [7, 8]];
			expect(() => AssertMatricesCompatible(a, b)).not.toThrow();
		});

		test('should accept multiple compatible matrices', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[5, 6], [7, 8]];
			const c = [[9, 10], [11, 12]];
			expect(() => AssertMatricesCompatible(a, b, c)).not.toThrow();
		});

		test('should accept single matrix', () => {
			const a = [[1, 2], [3, 4]];
			expect(() => AssertMatricesCompatible(a)).not.toThrow();
		});

		test('should throw for incompatible dimensions (different rows)', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[5, 6, 7]];
			expect(() => AssertMatricesCompatible(a, b)).toThrow('must have the same dimensions');
		});

		test('should throw for incompatible dimensions (different columns)', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[5, 6, 7], [8, 9, 10]];
			expect(() => AssertMatricesCompatible(a, b)).toThrow('must have the same dimensions');
		});

		test('should throw for no matrices provided', () => {
			expect(() => AssertMatricesCompatible()).toThrow('At least one matrix must be provided');
		});

		test('should throw when first matrix is invalid', () => {
			const a = 'not a matrix';
			const b = [[1, 2], [3, 4]];
			expect(() => AssertMatricesCompatible(a, b)).toThrow();
		});

		test('should throw when second matrix is invalid', () => {
			const a = [[1, 2], [3, 4]];
			const b = 'not a matrix';
			expect(() => AssertMatricesCompatible(a, b)).toThrow();
		});

		test('should throw for jagged matrix in compatibility check', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[5, 6], [7, 8, 9]];
			expect(() => AssertMatricesCompatible(a, b)).toThrow();
		});

		test('should report correct index when incompatibility is found', () => {
			const a = [[1, 2], [3, 4]];
			const b = [[5, 6], [7, 8]];
			const c = [[9, 10, 11]];
			expect(() => AssertMatricesCompatible(a, b, c)).toThrow('at index 2');
		});
	});

	describe('ValidateMatrix', () => {
		test('should return true for valid matrices', () => {
			expect(ValidateMatrix([[1, 2], [3, 4]])).toBe(true);
			expect(ValidateMatrix([[1, 2, 3], [4, 5, 6]])).toBe(true);
			expect(ValidateMatrix([[5]])).toBe(true);
		});

		test('should return false for non-arrays', () => {
			expect(ValidateMatrix('not a matrix')).toBe(false);
			expect(ValidateMatrix(42)).toBe(false);
			expect(ValidateMatrix(null)).toBe(false);
			expect(ValidateMatrix(undefined)).toBe(false);
		});

		test('should return false for matrices with invalid structure', () => {
			expect(ValidateMatrix([[1, NaN], [3, 4]])).toBe(false);
			expect(ValidateMatrix([1, 2, 3])).toBe(false);
		});

		test('should not throw on invalid input', () => {
			expect(() => ValidateMatrix(null)).not.toThrow();
			expect(() => ValidateMatrix('invalid')).not.toThrow();
		});
	});

	describe('ValidateMatrix1', () => {
		test('should return true for valid 1x1 matrix', () => {
			expect(ValidateMatrix1([[5]])).toBe(true);
			expect(ValidateMatrix1([[0]])).toBe(true);
		});

		test('should return false for non-1x1 matrices', () => {
			expect(ValidateMatrix1([[1, 2], [3, 4]])).toBe(false);
			expect(ValidateMatrix1([[1, 2]])).toBe(false);
			expect(ValidateMatrix1([[1], [2]])).toBe(false);
			expect(ValidateMatrix1([])).toBe(false);
		});

		test('should not throw on invalid input', () => {
			expect(() => ValidateMatrix1('invalid')).not.toThrow();
			expect(() => ValidateMatrix1(null)).not.toThrow();
		});
	});

	describe('ValidateMatrix2', () => {
		test('should return true for valid 2x2 matrix', () => {
			expect(ValidateMatrix2([[1, 2], [3, 4]])).toBe(true);
			expect(ValidateMatrix2([[0, 0], [0, 0]])).toBe(true);
		});

		test('should return false for non-2x2 matrices', () => {
			expect(ValidateMatrix2([[1]])).toBe(false);
			expect(ValidateMatrix2([[1, 2, 3], [4, 5, 6]])).toBe(false);
			expect(ValidateMatrix2([[1, 2], [3, 4], [5, 6]])).toBe(false);
		});

		test('should not throw on invalid input', () => {
			expect(() => ValidateMatrix2('invalid')).not.toThrow();
			expect(() => ValidateMatrix2(null)).not.toThrow();
		});
	});

	describe('ValidateMatrix3', () => {
		test('should return true for valid 3x3 matrix', () => {
			expect(ValidateMatrix3([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toBe(true);
			expect(ValidateMatrix3([[1, 0, 0], [0, 1, 0], [0, 0, 1]])).toBe(true);
		});

		test('should return false for non-3x3 matrices', () => {
			expect(ValidateMatrix3([[1, 2], [3, 4]])).toBe(false);
			expect(ValidateMatrix3([[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16]])).toBe(false);
		});

		test('should not throw on invalid input', () => {
			expect(() => ValidateMatrix3('invalid')).not.toThrow();
			expect(() => ValidateMatrix3(null)).not.toThrow();
		});
	});

	describe('ValidateMatrix4', () => {
		test('should return true for valid 4x4 matrix', () => {
			expect(ValidateMatrix4([
				[1, 2, 3, 4],
				[5, 6, 7, 8],
				[9, 10, 11, 12],
				[13, 14, 15, 16]
			])).toBe(true);
			expect(ValidateMatrix4([
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1]
			])).toBe(true);
		});

		test('should return false for non-4x4 matrices', () => {
			expect(ValidateMatrix4([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toBe(false);
			expect(ValidateMatrix4([[1, 2], [3, 4]])).toBe(false);
		});

		test('should not throw on invalid input', () => {
			expect(() => ValidateMatrix4('invalid')).not.toThrow();
			expect(() => ValidateMatrix4(null)).not.toThrow();
		});
	});

	describe('ValidateMatrixSquare', () => {
		test('should return true for valid square matrices', () => {
			expect(ValidateMatrixSquare([[1]])).toBe(true);
			expect(ValidateMatrixSquare([[1, 2], [3, 4]])).toBe(true);
			expect(ValidateMatrixSquare([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toBe(true);
		});

		test('should return false for rectangular matrices', () => {
			expect(ValidateMatrixSquare([[1, 2], [3, 4], [5, 6]])).toBe(false);
			expect(ValidateMatrixSquare([[1, 2, 3], [4, 5, 6]])).toBe(false);
		});

		test('should return false for empty matrix', () => {
			expect(ValidateMatrixSquare([])).toBe(false);
		});

		test('should return false for invalid input', () => {
			expect(ValidateMatrixSquare('invalid')).toBe(false);
			expect(ValidateMatrixSquare(null)).toBe(false);
			expect(ValidateMatrixSquare(42)).toBe(false);
		});

		test('should return false for matrix with NaN', () => {
			expect(ValidateMatrixSquare([[1, NaN], [3, 4]])).toBe(false);
		});

		test('should return false for matrix with non-array rows', () => {
			const matrix = [1, 2] as unknown;
			expect(ValidateMatrixSquare(matrix)).toBe(false);
		});

		test('should not throw on invalid input', () => {
			expect(() => ValidateMatrixSquare('invalid')).not.toThrow();
			expect(() => ValidateMatrixSquare([[1, 2, 3], [4, 5, 6]])).not.toThrow();
		});
	});
});
