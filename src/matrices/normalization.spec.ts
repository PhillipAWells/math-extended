import { MatrixFrobeniusNorm, MatrixSpectralNorm, Matrix1Norm, MatrixInfinityNorm, MatrixNuclearNorm, MatrixMaxNorm, MatrixPNorm } from './normalization.js';
import { MatrixIdentity } from './core.js';
import { IMatrix } from './types.js';

describe('Matrix Normalizations', () => {
	describe('MatrixFrobeniusNorm', () => {
		test('should compute Frobenius norm for 2x2 matrix', () => {
			const matrix = [[3, 4], [0, 0]];
			expect(MatrixFrobeniusNorm(matrix)).toBe(5); // sqrt(3² + 4²) = 5
		});

		test('should compute Frobenius norm for identity matrix', () => {
			const matrix = MatrixIdentity(2);
			expect(MatrixFrobeniusNorm(matrix)).toBe(Math.sqrt(2)); // sqrt(1² + 1²) = sqrt(2)
		});

		test('should compute Frobenius norm for zero matrix', () => {
			const matrix = [[0, 0], [0, 0]];
			expect(MatrixFrobeniusNorm(matrix)).toBe(0);
		});

		test('should compute Frobenius norm for rectangular matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			const expected = Math.sqrt(1 + 4 + 9 + 16 + 25 + 36); // sqrt(91)
			expect(MatrixFrobeniusNorm(matrix)).toBeCloseTo(expected, 10);
		});

		test('should handle single element matrix', () => {
			const matrix = [[7]];
			expect(MatrixFrobeniusNorm(matrix)).toBe(7);
		});

		test('should handle negative values', () => {
			const matrix = [[-3, 4], [0, -5]];
			const expected = Math.sqrt(9 + 16 + 0 + 25); // sqrt(50)
			expect(MatrixFrobeniusNorm(matrix)).toBeCloseTo(expected, 10);
		});

		test('should throw for empty matrix', () => {
			const matrix: IMatrix = [];
			expect(() => MatrixFrobeniusNorm(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should throw error for invalid matrix', () => {
			expect(() => MatrixFrobeniusNorm('invalid' as any)).toThrow();
		});
	});

	describe('MatrixSpectralNorm', () => {
		test('should compute spectral norm for diagonal matrix', () => {
			const matrix = [[3, 0], [0, 4]];
			expect(MatrixSpectralNorm(matrix)).toBe(4); // largest singular value
		});

		test('should compute spectral norm for identity matrix', () => {
			const matrix = MatrixIdentity(3);
			expect(MatrixSpectralNorm(matrix)).toBe(1); // all singular values are 1
		});

		test('should compute spectral norm for zero matrix', () => {
			const matrix = [[0, 0], [0, 0]];
			expect(MatrixSpectralNorm(matrix)).toBe(0);
		});

		test('should handle single element matrix', () => {
			const matrix = [[5]];
			expect(MatrixSpectralNorm(matrix)).toBeCloseTo(5);
		});

		test('should handle rectangular matrix', () => {
			const matrix = [[1, 0], [0, 0], [0, 0]];
			expect(MatrixSpectralNorm(matrix)).toBe(1);
		});

		test('should throw for empty matrix', () => {
			const matrix: IMatrix = [];
			expect(() => MatrixSpectralNorm(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should throw error for invalid matrix', () => {
			expect(() => MatrixSpectralNorm('invalid' as any)).toThrow();
		});
	});

	describe('Matrix1Norm', () => {
		test('should compute 1-norm for square matrix', () => {
			const matrix = [[1, 2], [3, 4]];
			expect(Matrix1Norm(matrix)).toBe(6); // max column sum: max(|1|+|3|, |2|+|4|) = max(4, 6) = 6
		});

		test('should compute 1-norm for rectangular matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			const expected = Math.max(1 + 4, 2 + 5, 3 + 6); // max(5, 7, 9) = 9
			expect(Matrix1Norm(matrix)).toBe(expected);
		});

		test('should handle negative values', () => {
			const matrix = [[-1, 2], [3, -4]];
			const expected = Math.max(1 + 3, 2 + 4); // max(4, 6) = 6
			expect(Matrix1Norm(matrix)).toBe(expected);
		});

		test('should compute 1-norm for identity matrix', () => {
			const matrix = MatrixIdentity(3);
			expect(Matrix1Norm(matrix)).toBe(1); // each column sums to 1
		});

		test('should compute 1-norm for zero matrix', () => {
			const matrix = [[0, 0], [0, 0]];
			expect(Matrix1Norm(matrix)).toBe(0);
		});

		test('should handle single element matrix', () => {
			const matrix = [[7]];
			expect(Matrix1Norm(matrix)).toBe(7);
		});

		test('should throw for empty matrix', () => {
			const matrix: IMatrix = [];
			expect(() => Matrix1Norm(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should handle single column matrix', () => {
			const matrix = [[1], [2], [3]];
			expect(Matrix1Norm(matrix)).toBe(6); // sum of absolute values: 1 + 2 + 3 = 6
		});
	});

	describe('MatrixInfinityNorm', () => {
		test('should compute infinity norm for square matrix', () => {
			const matrix = [[1, 2], [3, 4]];
			expect(MatrixInfinityNorm(matrix)).toBe(7); // max row sum: max(|1|+|2|, |3|+|4|) = max(3, 7) = 7
		});

		test('should compute infinity norm for rectangular matrix', () => {
			const matrix = [[1, 2, 3], [4, 5, 6]];
			const expected = Math.max(1 + 2 + 3, 4 + 5 + 6); // max(6, 15) = 15
			expect(MatrixInfinityNorm(matrix)).toBe(expected);
		});

		test('should handle negative values', () => {
			const matrix = [[-1, 2], [3, -4]];
			const expected = Math.max(1 + 2, 3 + 4); // max(3, 7) = 7
			expect(MatrixInfinityNorm(matrix)).toBe(expected);
		});

		test('should compute infinity norm for identity matrix', () => {
			const matrix = MatrixIdentity(3);
			expect(MatrixInfinityNorm(matrix)).toBe(1); // each row sums to 1
		});

		test('should compute infinity norm for zero matrix', () => {
			const matrix = [[0, 0], [0, 0]];
			expect(MatrixInfinityNorm(matrix)).toBe(0);
		});

		test('should handle single element matrix', () => {
			const matrix = [[7]];
			expect(MatrixInfinityNorm(matrix)).toBe(7);
		});

		test('should throw for empty matrix', () => {
			const matrix: IMatrix = [];
			expect(() => MatrixInfinityNorm(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should handle single row matrix', () => {
			const matrix = [[1, 2, 3]];
			expect(MatrixInfinityNorm(matrix)).toBe(6); // sum of absolute values: 1 + 2 + 3 = 6
		});
	});

	describe('MatrixNuclearNorm', () => {
		test('should compute nuclear norm for diagonal matrix', () => {
			const matrix = [[3, 0], [0, 4]];
			expect(MatrixNuclearNorm(matrix)).toBe(7); // sum of singular values: 3 + 4 = 7
		});

		test('should compute nuclear norm for identity matrix', () => {
			const matrix = MatrixIdentity(3);
			expect(MatrixNuclearNorm(matrix)).toBe(3); // sum of all singular values (all are 1)
		});

		test('should compute nuclear norm for zero matrix', () => {
			const matrix = [[0, 0], [0, 0]];
			expect(MatrixNuclearNorm(matrix)).toBe(0);
		});

		test('should handle single element matrix', () => {
			const matrix = [[5]];
			expect(MatrixNuclearNorm(matrix)).toBe(5);
		});

		test('should handle rectangular matrix', () => {
			const matrix = [[1, 0], [0, 0], [0, 0]];
			expect(MatrixNuclearNorm(matrix)).toBe(1); // only one non-zero singular value
		});

		test('should throw for empty matrix', () => {
			const matrix: IMatrix = [];
			expect(() => MatrixNuclearNorm(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should throw error for invalid matrix', () => {
			expect(() => MatrixNuclearNorm('invalid' as any)).toThrow();
		});
	});

	describe('MatrixMaxNorm', () => {
		test('should compute max norm for square matrix', () => {
			const matrix = [[1, -5], [3, 2]];
			expect(MatrixMaxNorm(matrix)).toBe(5); // max absolute value
		});

		test('should compute max norm for rectangular matrix', () => {
			const matrix = [[1, 2, -8], [4, 5, 6]];
			expect(MatrixMaxNorm(matrix)).toBe(8); // max absolute value
		});

		test('should handle all positive values', () => {
			const matrix = [[1, 2], [3, 4]];
			expect(MatrixMaxNorm(matrix)).toBe(4);
		});

		test('should handle all negative values', () => {
			const matrix = [[-1, -2], [-3, -4]];
			expect(MatrixMaxNorm(matrix)).toBe(4);
		});

		test('should compute max norm for identity matrix', () => {
			const matrix = MatrixIdentity(3);
			expect(MatrixMaxNorm(matrix)).toBe(1);
		});

		test('should compute max norm for zero matrix', () => {
			const matrix = [[0, 0], [0, 0]];
			expect(MatrixMaxNorm(matrix)).toBe(0);
		});

		test('should handle single element matrix', () => {
			const matrix = [[-7]];
			expect(MatrixMaxNorm(matrix)).toBe(7);
		});

		test('should throw for empty matrix', () => {
			const matrix: IMatrix = [];
			expect(() => MatrixMaxNorm(matrix)).toThrow('Matrix must have at least one row and one column');
		});

		test('should handle fractional values', () => {
			const matrix = [[0.1, -0.5], [0.3, 0.2]];
			expect(MatrixMaxNorm(matrix)).toBe(0.5);
		});
	});

	describe('MatrixPNorm', () => {
		test('should compute 1-norm (p=1)', () => {
			const matrix = [[1, 2], [3, 4]];
			const expected = 1 + 2 + 3 + 4; // sum of absolute values = 10
			expect(MatrixPNorm(matrix, 1)).toBe(expected);
		});

		test('should compute 2-norm (p=2, Frobenius norm)', () => {
			const matrix = [[3, 4], [0, 0]];
			const expected = Math.sqrt(9 + 16); // sqrt(25) = 5
			expect(MatrixPNorm(matrix, 2)).toBe(expected);
		});

		test('should compute infinity norm (p=Infinity)', () => {
			const matrix = [[1, -5], [3, 2]];
			expect(MatrixPNorm(matrix, Infinity)).toBe(5); // max absolute value
		});

		test('should compute 3-norm', () => {
			const matrix = [[1, 2], [3, 4]];
			const expected = Math.pow(1 + 8 + 27 + 64, 1 / 3); // (1³ + 2³ + 3³ + 4³)^(1/3)
			expect(MatrixPNorm(matrix, 3)).toBeCloseTo(expected, 10);
		});

		test('should handle negative values with even p', () => {
			const matrix = [[-1, 2], [-3, 4]];
			const expected = Math.sqrt(1 + 4 + 9 + 16); // sqrt(30)
			expect(MatrixPNorm(matrix, 2)).toBeCloseTo(expected, 10);
		});

		test('should handle negative values with odd p', () => {
			const matrix = [[-1, 2], [-3, 4]];
			const expected = Math.pow(1 + 8 + 27 + 64, 1 / 3); // (|-1|³ + |2|³ + |-3|³ + |4|³)^(1/3)
			expect(MatrixPNorm(matrix, 3)).toBeCloseTo(expected, 10);
		});

		test('should compute p-norm for identity matrix', () => {
			const matrix = MatrixIdentity(2);
			const expected = Math.pow(2, 1 / 2); // (1² + 1²)^(1/2) = sqrt(2)
			expect(MatrixPNorm(matrix, 2)).toBeCloseTo(expected, 10);
		});

		test('should compute p-norm for zero matrix', () => {
			const matrix = [[0, 0], [0, 0]];
			expect(MatrixPNorm(matrix, 2)).toBe(0);
			expect(MatrixPNorm(matrix, 5)).toBe(0);
		});

		test('should handle single element matrix', () => {
			const matrix = [[5]];
			expect(MatrixPNorm(matrix, 2)).toBeCloseTo(5, 10);
			expect(MatrixPNorm(matrix, 3)).toBeCloseTo(5, 10);
		});

		test('should throw for empty matrix', () => {
			const matrix: IMatrix = [];
			expect(() => MatrixPNorm(matrix, 2)).toThrow('Matrix must have at least one row and one column');
		});

		test('should throw error for p < 1', () => {
			const matrix = [[1, 2]];
			expect(() => MatrixPNorm(matrix, 0.5)).toThrow('p-norm parameter must be >= 1');
			expect(() => MatrixPNorm(matrix, 0)).toThrow('p-norm parameter must be >= 1');
			expect(() => MatrixPNorm(matrix, -1)).toThrow('p-norm parameter must be >= 1');
		});

		test('should handle edge case p = 1', () => {
			const matrix = [[1, 2], [3, 4]];
			expect(MatrixPNorm(matrix, 1)).toBe(10); // sum of absolute values
		});

		test('should handle large p values', () => {
			const matrix = [[1, 5], [2, 3]];
			const result = MatrixPNorm(matrix, 100);
			expect(result).toBeCloseTo(5, 10); // approaches max norm as p increases
		});

		test('should be consistent with other norm functions', () => {
			const matrix = [[1, 2], [3, 4]];
			// p=1 should match sum of absolute values
			expect(MatrixPNorm(matrix, 1)).toBe(10);

			// p=2 should match Frobenius norm
			expect(MatrixPNorm(matrix, 2)).toBeCloseTo(MatrixFrobeniusNorm(matrix), 10);

			// p=Infinity should match max norm
			expect(MatrixPNorm(matrix, Infinity)).toBe(MatrixMaxNorm(matrix));
		});
	});

	describe('Error handling', () => {
		test('should throw error for invalid matrices across all norm functions', () => {
			const invalidInputs = [
				'invalid',
				123,
				null,
				undefined,
				[['not', 'numbers']],
				[[1, 2], [3]], // inconsistent row lengths
			];

			const normFunctions = [
				MatrixFrobeniusNorm,
				MatrixSpectralNorm,
				Matrix1Norm,
				MatrixInfinityNorm,
				MatrixNuclearNorm,
				MatrixMaxNorm,
			];
			invalidInputs.forEach((input) => {
				normFunctions.forEach((func) => {
					expect(() => func(input as any)).toThrow();
				});
				expect(() => MatrixPNorm(input as any, 2)).toThrow();
			});
		});
	});
	describe('Performance and edge cases', () => {
		test('should handle large matrices efficiently', () => {
			// Create a 10x10 matrix with known values
			const size = 10;
			const matrix: IMatrix = [];

			for (let i = 0; i < size; i++) {
				const row: number[] = [];

				for (let j = 0; j < size; j++) {
					row.push(i + j + 1);
				}
				matrix.push(row);
			}

			// These should complete without timeout
			expect(typeof MatrixFrobeniusNorm(matrix)).toBe('number');
			expect(typeof Matrix1Norm(matrix)).toBe('number');
			expect(typeof MatrixInfinityNorm(matrix)).toBe('number');
			expect(typeof MatrixMaxNorm(matrix)).toBe('number');
			expect(typeof MatrixPNorm(matrix, 2)).toBe('number');
		});

		test('should maintain precision for small values', () => {
			const matrix = [[1e-10, 2e-10], [3e-10, 4e-10]];
			expect(MatrixFrobeniusNorm(matrix)).toBeGreaterThan(0);
			expect(MatrixMaxNorm(matrix)).toBe(4e-10);
			expect(Matrix1Norm(matrix)).toBe(6e-10);
			expect(MatrixInfinityNorm(matrix)).toBeCloseTo(7e-10);
		});
	});
});
