import {
	AssertMatrix,
	AssertMatrix1,
	AssertMatrix2,
	AssertMatrix3,
	AssertMatrix4,
	AssertMatrices,
	AssertMatrixRow,
	AssertMatrixValue,
	MatrixError,
} from './asserts.js';

describe('Matrix Assertions', () => {
	describe('MatrixError', () => {
		test('should create MatrixError with default message', () => {
			const error = new MatrixError();
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
				const matrix = [1, 2, 3] as any;
				expect(() => AssertMatrix(matrix)).toThrow(MatrixError);
			});
		});

		describe('size constraints', () => {
			test('should accept matrix with exact size tuple', () => {
				const matrix = [[1, 2, 3], [4, 5, 6]];
				expect(() => AssertMatrix(matrix, { size: [2, 3] })).not.toThrow();
			});

			test('should throw for matrix with wrong size tuple', () => {
				const matrix = [[1, 2], [3, 4]];
				expect(() => AssertMatrix(matrix, { size: [3, 3] })).toThrow(MatrixError);
			});

			test('should accept square matrix with exact size number', () => {
				const matrix = [[1, 2], [3, 4]];
				expect(() => AssertMatrix(matrix, { size: 2 })).not.toThrow();
			});

			test('should throw for non-square matrix when size number specified', () => {
				const matrix = [[1, 2, 3], [4, 5, 6]];
				expect(() => AssertMatrix(matrix, { size: 2 })).toThrow(MatrixError);
			});

			test('should accept matrix with exact rows', () => {
				const matrix = [[1, 2], [3, 4], [5, 6]];
				expect(() => AssertMatrix(matrix, { rows: 3 })).not.toThrow();
			});

			test('should throw for matrix with wrong rows', () => {
				const matrix = [[1, 2], [3, 4]];
				expect(() => AssertMatrix(matrix, { rows: 3 })).toThrow(MatrixError);
			});

			test('should accept matrix with exact columns', () => {
				const matrix = [[1, 2, 3], [4, 5, 6]];
				expect(() => AssertMatrix(matrix, { columns: 3 })).not.toThrow();
			});

			test('should throw for matrix with wrong columns', () => {
				const matrix = [[1, 2], [3, 4]];
				expect(() => AssertMatrix(matrix, { columns: 3 })).toThrow(MatrixError);
			});

			test('should accept matrix with minimum rows', () => {
				const matrix = [[1, 2], [3, 4], [5, 6]];
				expect(() => AssertMatrix(matrix, { minRows: 2 })).not.toThrow();
			});

			test('should throw for matrix with too few rows', () => {
				const matrix = [[1, 2]];
				expect(() => AssertMatrix(matrix, { minRows: 3 })).toThrow(MatrixError);
			});

			test('should accept matrix with maximum rows', () => {
				const matrix = [[1, 2], [3, 4]];
				expect(() => AssertMatrix(matrix, { maxRows: 3 })).not.toThrow();
			});

			test('should throw for matrix with too many rows', () => {
				const matrix = [[1, 2], [3, 4], [5, 6], [7, 8]];
				expect(() => AssertMatrix(matrix, { maxRows: 3 })).toThrow(MatrixError);
			});

			test('should accept matrix with minimum columns', () => {
				const matrix = [[1, 2, 3], [4, 5, 6]];
				expect(() => AssertMatrix(matrix, { minColumns: 2 })).not.toThrow();
			});

			test('should throw for matrix with too few columns', () => {
				const matrix = [[1], [2]];
				expect(() => AssertMatrix(matrix, { minColumns: 3 })).toThrow(MatrixError);
			});

			test('should accept matrix with maximum columns', () => {
				const matrix = [[1, 2], [3, 4]];
				expect(() => AssertMatrix(matrix, { maxColumns: 3 })).not.toThrow();
			});

			test('should throw for matrix with too many columns', () => {
				const matrix = [[1, 2, 3, 4], [5, 6, 7, 8]];
				expect(() => AssertMatrix(matrix, { maxColumns: 3 })).toThrow(MatrixError);
			});

			test('should accept square matrix when square constraint is true', () => {
				const matrix = [[1, 2], [3, 4]];
				expect(() => AssertMatrix(matrix, { square: true })).not.toThrow();
			});

			test('should throw for non-square matrix when square constraint is true', () => {
				const matrix = [[1, 2, 3], [4, 5, 6]];
				expect(() => AssertMatrix(matrix, { square: true })).toThrow(MatrixError);
			});
		});

		describe('combined constraints', () => {
			test('should accept matrix meeting all constraints', () => {
				const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
				expect(() => AssertMatrix(matrix, {
					minRows: 2,
					maxRows: 5,
					minColumns: 2,
					maxColumns: 5,
					square: true,
				})).not.toThrow();
			});

			test('should throw when any constraint is violated', () => {
				const matrix = [[1, 2, 3], [4, 5, 6]];
				expect(() => AssertMatrix(matrix, {
					minRows: 2,
					square: true,
				})).toThrow(MatrixError);
			});
		});

		describe('custom exceptions', () => {
			test('should use custom exception message', () => {
				const matrix = 'invalid';
				expect(() => AssertMatrix(matrix, {}, { message: 'Custom error message' }))
					.toThrow('Custom error message');
			});
		});
	});

	describe('AssertMatrixRow', () => {
		test('should accept valid number array', () => {
			const row = [1, 2, 3, 4];
			expect(() => AssertMatrixRow(row)).not.toThrow();
		});

		test('should accept empty array', () => {
			const row: number[] = [];
			expect(() => AssertMatrixRow(row)).not.toThrow();
		});

		test('should accept array with floating point numbers', () => {
			const row = [1.5, 2.7, 3.14];
			expect(() => AssertMatrixRow(row)).not.toThrow();
		});

		test('should accept array with negative numbers', () => {
			const row = [-1, -2.5, -3];
			expect(() => AssertMatrixRow(row)).not.toThrow();
		});

		test('should accept array with zeros', () => {
			const row = [0, 0, 0];
			expect(() => AssertMatrixRow(row)).not.toThrow();
		});

		test('should throw for non-array input', () => {
			expect(() => AssertMatrixRow('not an array')).toThrow(MatrixError);
			expect(() => AssertMatrixRow(42)).toThrow(MatrixError);
			expect(() => AssertMatrixRow(null)).toThrow(MatrixError);
			expect(() => AssertMatrixRow(undefined)).toThrow(MatrixError);
		});

		test('should throw for array with non-numeric elements', () => {
			const row = [1, 'invalid', 3];
			expect(() => AssertMatrixRow(row)).toThrow(MatrixError);
		});

		test('should throw for array with NaN elements', () => {
			const row = [1, NaN, 3];
			expect(() => AssertMatrixRow(row)).toThrow(MatrixError);
		});

		test('should throw for array with Infinity elements', () => {
			const row = [1, Infinity, 3];
			expect(() => AssertMatrixRow(row)).toThrow(MatrixError);
		});

		test('should throw for array with -Infinity elements', () => {
			const row = [1, -Infinity, 3];
			expect(() => AssertMatrixRow(row)).toThrow(MatrixError);
		});

		test('should include row index in error message when provided', () => {
			const row = 'invalid';
			expect(() => AssertMatrixRow(row, { rowIndex: 2 }))
				.toThrow('Matrix row at row 2 must be an array');
		});
	});

	describe('AssertMatrixValue', () => {
		test('should accept valid finite numbers', () => {
			expect(() => AssertMatrixValue(42)).not.toThrow();
			expect(() => AssertMatrixValue(0)).not.toThrow();
			expect(() => AssertMatrixValue(-5)).not.toThrow();
			expect(() => AssertMatrixValue(3.14)).not.toThrow();
			expect(() => AssertMatrixValue(-2.7)).not.toThrow();
		});

		test('should throw for non-numeric values', () => {
			expect(() => AssertMatrixValue('string')).toThrow(MatrixError);
			expect(() => AssertMatrixValue(true)).toThrow(MatrixError);
			expect(() => AssertMatrixValue([])).toThrow(MatrixError);
			expect(() => AssertMatrixValue({})).toThrow(MatrixError);
			expect(() => AssertMatrixValue(null)).toThrow(MatrixError);
			expect(() => AssertMatrixValue(undefined)).toThrow(MatrixError);
		});

		test('should throw for NaN', () => {
			expect(() => AssertMatrixValue(NaN)).toThrow(MatrixError);
		});

		test('should throw for Infinity', () => {
			expect(() => AssertMatrixValue(Infinity)).toThrow(MatrixError);
		});

		test('should throw for -Infinity', () => {
			expect(() => AssertMatrixValue(-Infinity)).toThrow(MatrixError);
		});

		test('should include position in error message when provided', () => {
			expect(() => AssertMatrixValue('invalid', { rowIndex: 1, columnIndex: 2 }))
				.toThrow('Matrix value at row 1, column 2 must be a finite number');
		});
	});

	describe('AssertMatrices', () => {
		describe('without transposition', () => {
			test('should accept matrices with identical dimensions', () => {
				const a = [[1, 2], [3, 4]];
				const b = [[5, 6], [7, 8]];
				expect(() => AssertMatrices(a, b)).not.toThrow();
			});

			test('should accept larger matrices with identical dimensions', () => {
				const a = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
				const b = [[9, 8, 7], [6, 5, 4], [3, 2, 1]];
				expect(() => AssertMatrices(a, b)).not.toThrow();
			});

			test('should accept single element matrices', () => {
				const a = [[1]];
				const b = [[2]];
				expect(() => AssertMatrices(a, b)).not.toThrow();
			});

			test('should throw for matrices with different row counts', () => {
				const a = [[1, 2], [3, 4]];
				const b = [[5, 6], [7, 8], [9, 10]];
				expect(() => AssertMatrices(a, b)).toThrow(MatrixError);
			});

			test('should throw for matrices with different column counts', () => {
				const a = [[1, 2, 3], [4, 5, 6]];
				const b = [[7, 8], [9, 10]];
				expect(() => AssertMatrices(a, b)).toThrow(MatrixError);
			});

			test('should throw for matrices with completely different dimensions', () => {
				const a = [[1, 2]];
				const b = [[3], [4], [5]];
				expect(() => AssertMatrices(a, b)).toThrow(MatrixError);
			});
		});

		describe('with transposition allowed', () => {
			test('should accept matrices compatible for standard multiplication', () => {
				const a = [[1, 2], [3, 4]]; // 2x2
				const b = [[5, 6], [7, 8]]; // 2x2
				expect(() => AssertMatrices(a, b, { transposition: true })).not.toThrow();
			});

			test('should accept matrices where A columns = B rows', () => {
				const a = [[1, 2, 3], [4, 5, 6]]; // 3x2
				const b = [[7, 8], [9, 10], [11, 12]]; // 2x3
				expect(() => AssertMatrices(a, b, { transposition: true })).not.toThrow();
			});

			test('should accept matrices where A columns = B columns (B transposed)', () => {
				const a = [[1, 2], [3, 4]]; // 2x2
				const b = [[5, 7], [6, 8]]; // 2x2, could be transposed to 2x2
				expect(() => AssertMatrices(a, b, { transposition: true })).not.toThrow();
			});

			test('should accept matrices where A rows = B rows (A transposed)', () => {
				const a = [[1, 2], [3, 4]]; // 2x2
				const b = [[5, 6], [7, 8]]; // 2x2
				expect(() => AssertMatrices(a, b, { transposition: true })).not.toThrow();
			});

			test('should accept matrices where A rows = B columns (both transposed)', () => {
				const a = [[1, 2, 3], [4, 5, 6]]; // 3x2
				const b = [[7, 8, 9], [10, 11, 12]]; // 3x2
				expect(() => AssertMatrices(a, b, { transposition: true })).not.toThrow();
			});

			test('should throw for completely incompatible matrices', () => {
				const a = [[1, 2], [3, 4], [5, 6]]; // 2x3
				const b = [[7], [8], [9], [10]]; // 1x4
				expect(() => AssertMatrices(a, b, { transposition: true })).toThrow(MatrixError);
			});
		});

		describe('invalid inputs', () => {
			test('should throw for invalid first matrix', () => {
				const a = 'invalid';
				const b = [[1, 2], [3, 4]];
				expect(() => AssertMatrices(a, b)).toThrow(MatrixError);
			});

			test('should throw for invalid second matrix', () => {
				const a = [[1, 2], [3, 4]];
				const b = 'invalid';
				expect(() => AssertMatrices(a, b)).toThrow(MatrixError);
			});

			test('should throw for both invalid matrices', () => {
				const a = 'invalid';
				const b = 'also invalid';
				expect(() => AssertMatrices(a, b)).toThrow(MatrixError);
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
				[13, 14, 15, 16],
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
				[13, 14, 15, 16],
			];
			expect(() => AssertMatrix4(matrix)).not.toThrow();
		});

		test('should accept 4x4 identity matrix', () => {
			const matrix = [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1],
			];
			expect(() => AssertMatrix4(matrix)).not.toThrow();
		});

		test('should accept 4x4 matrix with mixed numbers', () => {
			const matrix = [
				[-1.5, 0, 2.7, -3],
				[4, -5.14, 6, 0],
				[0, 7.2, -8, 9],
				[10, 0, -11.5, 12],
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
				[21, 22, 23, 24, 25],
			];
			expect(() => AssertMatrix4(matrix)).toThrow(MatrixError);
		});

		test('should throw for 4x3 matrix', () => {
			const matrix = [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9],
				[10, 11, 12],
			];
			expect(() => AssertMatrix4(matrix)).toThrow(MatrixError);
		});

		test('should throw for 3x4 matrix', () => {
			const matrix = [
				[1, 2, 3, 4],
				[5, 6, 7, 8],
				[9, 10, 11, 12],
			];
			expect(() => AssertMatrix4(matrix)).toThrow(MatrixError);
		});

		test('should throw for non-matrix input', () => {
			expect(() => AssertMatrix4('invalid')).toThrow(MatrixError);
			expect(() => AssertMatrix4(undefined)).toThrow(MatrixError);
		});
	});

	describe('error message specificity', () => {
		test('AssertMatrix should provide specific error messages for size constraints', () => {
			const matrix = [[1, 2], [3, 4]]; // 2x2
			expect(() => AssertMatrix(matrix, { size: [3, 3] }))
				.toThrow('Matrix has 2 rows, expected exactly 3');

			expect(() => AssertMatrix(matrix, { size: 3 }))
				.toThrow('Square matrix has 2 rows, expected exactly 3');

			expect(() => AssertMatrix(matrix, { rows: 3 }))
				.toThrow('Matrix has 2 rows, expected exactly 3');

			expect(() => AssertMatrix(matrix, { columns: 3 }))
				.toThrow('Matrix has 2 columns, expected exactly 3');

			expect(() => AssertMatrix(matrix, { minRows: 5 }))
				.toThrow('Matrix has 2 rows, minimum required is 5');

			expect(() => AssertMatrix(matrix, { maxRows: 1 }))
				.toThrow('Matrix has 2 rows, maximum allowed is 1');

			expect(() => AssertMatrix(matrix, { minColumns: 5 }))
				.toThrow('Matrix has 2 columns, minimum required is 5');

			expect(() => AssertMatrix(matrix, { maxColumns: 1 }))
				.toThrow('Matrix has 2 columns, maximum allowed is 1');

			expect(() => AssertMatrix([[1, 2, 3], [4, 5, 6]], { square: true }))
				.toThrow('Matrix must be square but has 2 rows and 3 columns');
		});

		test('AssertMatrices should provide specific error messages', () => {
			const a = [[1, 2], [3, 4]]; // 2x2
			const b = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]; // 3x3
			expect(() => AssertMatrices(a, b))
				.toThrow('Matrices must have identical dimensions for addition/subtraction. Matrix A is 2×2, Matrix B is 3×3');

			const c = [[1, 2], [3, 4], [5, 6]]; // 3x2
			const d = [[1], [2], [3], [4]]; // 4x1
			expect(() => AssertMatrices(c, d, { transposition: true }))
				.toThrow('Matrices are not compatible for multiplication even with transposition. Matrix A is 3×2, Matrix B is 4×1');
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

		test('should handle very large numbers', () => {
			const matrix = [[Number.MAX_VALUE, Number.MIN_VALUE]];
			expect(() => AssertMatrix(matrix)).not.toThrow();
		});

		test('should handle very small numbers', () => {
			const matrix = [[Number.EPSILON, -Number.EPSILON]];
			expect(() => AssertMatrix(matrix)).not.toThrow();
		});
	});
});
