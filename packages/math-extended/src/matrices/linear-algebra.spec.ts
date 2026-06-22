import {
	MatrixDeterminant,
	MatrixCofactorElement,
	MatrixCofactor,
	MatrixAdjoint,
	MatrixInverse,
	MatrixGramSchmidt,
	MatrixMinor,
	MatrixPseudoInverse,
	MatrixNullSpace
} from './linear-algebra.js';
import { MatrixMultiply } from './arithmetic.js';
import { type TMatrix } from './types.js';

describe('Matrix Operations for Linear Algebra', () => {
	describe('MatrixDeterminant', () => {
		test('should calculate determinant of 1x1 matrix', () => {
			const matrix: TMatrix = [[5]];
			expect(MatrixDeterminant(matrix)).toBe(5);
		});

		test('should calculate determinant of 1x1 zero matrix', () => {
			const matrix: TMatrix = [[0]];
			expect(MatrixDeterminant(matrix)).toBe(0);
		});

		test('should calculate determinant of 1x1 negative matrix', () => {
			const matrix: TMatrix = [[-7]];
			expect(MatrixDeterminant(matrix)).toBe(-7);
		});

		test('should calculate determinant of 2x2 matrix', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			expect(MatrixDeterminant(matrix)).toBe(-2); // 1*4 - 2*3 = -2
		});

		test('should calculate determinant of 2x2 identity matrix', () => {
			const matrix: TMatrix = [[1, 0], [0, 1]];
			expect(MatrixDeterminant(matrix)).toBe(1);
		});

		test('should calculate determinant of 2x2 permutation matrix', () => {
			const matrix: TMatrix = [[0, 1], [1, 0]];
			expect(MatrixDeterminant(matrix)).toBe(-1);
		});

		test('should calculate determinant of singular 2x2 matrix', () => {
			const matrix: TMatrix = [[1, 2], [2, 4]];
			expect(MatrixDeterminant(matrix)).toBe(0);
		});

		test('should calculate determinant of 3x3 matrix', () => {
			const matrix: TMatrix = [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9]
			];
			expect(MatrixDeterminant(matrix)).toBe(0); // This matrix is singular
		});

		test('should calculate determinant of 3x3 non-singular matrix', () => {
			const matrix: TMatrix = [
				[2, -3, 1],
				[2, 0, -1],
				[1, 4, 5]
			];
			expect(MatrixDeterminant(matrix)).toBe(49);
		});

		test('should calculate determinant of 3x3 identity matrix', () => {
			const matrix: TMatrix = [
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1]
			];
			expect(MatrixDeterminant(matrix)).toBe(1);
		});

		test('should calculate determinant of rank-deficient 3x3 matrix', () => {
			const matrix: TMatrix = [
				[1, 2, 3],
				[2, 4, 6],
				[3, 6, 9]
			];
			expect(MatrixDeterminant(matrix)).toBe(0);
		});

		test('should calculate determinant of larger matrix using cofactor expansion', () => {
			const matrix: TMatrix = [
				[1, 2, 3, 4],
				[2, 1, 4, 3],
				[3, 4, 1, 2],
				[4, 3, 2, 1]
			];
			expect(MatrixDeterminant(matrix)).toBe(0);
		});

		test('should calculate determinant of 4x4 non-singular matrix', () => {
			const matrix: TMatrix = [
				[1, 0, 0, 0],
				[0, 2, 0, 0],
				[0, 0, 3, 0],
				[0, 0, 0, 4]
			];
			expect(MatrixDeterminant(matrix)).toBe(24); // 1*2*3*4
		});

		test('should throw error for non-square matrix', () => {
			const matrix: TMatrix = [[1, 2, 3], [4, 5, 6]];
			expect(() => MatrixDeterminant(matrix)).toThrow();
		});

		test('should handle zero determinant matrix', () => {
			const matrix: TMatrix = [
				[1, 2],
				[2, 4]
			];
			expect(MatrixDeterminant(matrix)).toBe(0);
		});
	});

	describe('MatrixCofactorElement', () => {
		test('should calculate cofactor element for 2x2 matrix', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			expect(MatrixCofactorElement(matrix, 0, 0)).toBe(4); // +4
			expect(MatrixCofactorElement(matrix, 1, 0)).toBe(-3); // -3
			expect(MatrixCofactorElement(matrix, 0, 1)).toBe(-2); // -2
			expect(MatrixCofactorElement(matrix, 1, 1)).toBe(1); // +1
		});

		test('should calculate cofactor element for 3x3 matrix', () => {
			const matrix: TMatrix = [
				[1, 2, 3],
				[0, 1, 4],
				[5, 6, 0]
			];
			expect(MatrixCofactorElement(matrix, 0, 0)).toBe(-24); // +(1*0 - 4*6) = -24
			expect(MatrixCofactorElement(matrix, 1, 0)).toBe(20); // -(0*0 - 4*5) = 20
		});

		test('should throw error for non-square matrix', () => {
			const matrix: TMatrix = [[1, 2, 3], [4, 5, 6]];
			expect(() => MatrixCofactorElement(matrix, 0, 0)).toThrow();
		});

		test('should throw error for out-of-bounds indices', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			expect(() => MatrixCofactorElement(matrix, 2, 0)).toThrow();
			expect(() => MatrixCofactorElement(matrix, 0, 2)).toThrow();
		});
	});

	describe('MatrixCofactor', () => {
		test('should calculate cofactor matrix for 2x2 matrix', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			const result = MatrixCofactor(matrix);
			expect(result).toEqual([[4, -3], [-2, 1]]);
		});

		test('should calculate cofactor matrix for 3x3 matrix', () => {
			const matrix: TMatrix = [
				[1, 2, 3],
				[0, 1, 4],
				[5, 6, 0]
			];
			const result = MatrixCofactor(matrix);
			expect(result).toEqual([
				[-24, 20, -5],
				[18, -15, 4],
				[5, -4, 1]
			]);
		});

		test('should calculate cofactor matrix for identity matrix', () => {
			const matrix: TMatrix = [[1, 0], [0, 1]];
			const result = MatrixCofactor(matrix);
			expect(result).toEqual([[1, 0], [0, 1]]);
		});

		test('should throw error for non-square matrix', () => {
			const matrix: TMatrix = [[1, 2, 3], [4, 5, 6]];
			expect(() => MatrixCofactor(matrix)).toThrow();
		});
	});

	describe('MatrixAdjoint', () => {
		test('should calculate adjoint matrix for 2x2 matrix', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			const result = MatrixAdjoint(matrix);
			expect(result).toEqual([[4, -2], [-3, 1]]);
		});

		test('should calculate adjoint matrix for 3x3 matrix', () => {
			const matrix: TMatrix = [
				[1, 2, 3],
				[0, 1, 4],
				[5, 6, 0]
			];
			const result = MatrixAdjoint(matrix);
			expect(result).toEqual([
				[-24, 18, 5],
				[20, -15, -4],
				[-5, 4, 1]
			]);
		});

		test('should calculate adjoint matrix for identity matrix', () => {
			const matrix: TMatrix = [[1, 0], [0, 1]];
			const result = MatrixAdjoint(matrix);
			expect(result).toEqual([[1, 0], [0, 1]]);
		});

		test('should throw error for non-square matrix', () => {
			const matrix: TMatrix = [[1, 2, 3], [4, 5, 6]];
			expect(() => MatrixAdjoint(matrix)).toThrow();
		});
	});

	describe('MatrixInverse', () => {
		test('should calculate inverse of 2x2 matrix', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			const result = MatrixInverse(matrix);
			expect(result[0]?.[0]).toBeCloseTo(-2);
			expect(result[0]?.[1]).toBeCloseTo(1);
			expect(result[1]?.[0]).toBeCloseTo(1.5);
			expect(result[1]?.[1]).toBeCloseTo(-0.5);
		});

		test('should calculate inverse of identity matrix', () => {
			const matrix: TMatrix = [[1, 0], [0, 1]];
			const result = MatrixInverse(matrix);
			expect(result).toEqual([[1, 0], [0, 1]]);
		});

		test('should calculate inverse of 3x3 matrix', () => {
			const matrix: TMatrix = [
				[2, -1, 0],
				[-1, 2, -1],
				[0, -1, 2]
			];
			const result = MatrixInverse(matrix);
			expect(result[0]?.[0]).toBeCloseTo(0.75);
			expect(result[0]?.[1]).toBeCloseTo(0.5);
			expect(result[0]?.[2]).toBeCloseTo(0.25);
		});

		test('should verify inverse property A * A^-1 = I', () => {
			const matrix: TMatrix = [[2, 1], [1, 1]];
			const inverse = MatrixInverse(matrix);

			// Manually multiply matrix * inverse
			const product: TMatrix = [
				[((matrix[0]?.[0] ?? 0) * (inverse[0]?.[0] ?? 0)) + ((matrix[0]?.[1] ?? 0) * (inverse[1]?.[0] ?? 0)),
					((matrix[0]?.[0] ?? 0) * (inverse[0]?.[1] ?? 0)) + ((matrix[0]?.[1] ?? 0) * (inverse[1]?.[1] ?? 0))],
				[((matrix[1]?.[0] ?? 0) * (inverse[0]?.[0] ?? 0)) + ((matrix[1]?.[1] ?? 0) * (inverse[1]?.[0] ?? 0)),
					((matrix[1]?.[0] ?? 0) * (inverse[0]?.[1] ?? 0)) + ((matrix[1]?.[1] ?? 0) * (inverse[1]?.[1] ?? 0))]
			];
			expect(product[0]?.[0]).toBeCloseTo(1);
			expect(product[0]?.[1]).toBeCloseTo(0);
			expect(product[1]?.[0]).toBeCloseTo(0);
			expect(product[1]?.[1]).toBeCloseTo(1);
		});

		test('should throw error for 1x1 singular matrix (determinant zero)', () => {
			const matrix: TMatrix = [[0]];
			expect(() => MatrixInverse(matrix)).toThrow();
		});

		test('should throw error for 2x2 singular matrix', () => {
			const matrix: TMatrix = [[1, 2], [2, 4]]; // determinant = 0
			expect(() => MatrixInverse(matrix)).toThrow();
		});

		test('should throw error for 3x3 singular matrix', () => {
			const matrix: TMatrix = [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9]
			];
			expect(() => MatrixInverse(matrix)).toThrow();
		});

		test('should throw error for rank-deficient 4x4 matrix', () => {
			const matrix: TMatrix = [
				[1, 0, 1, 0],
				[0, 1, 0, 1],
				[2, 0, 2, 0],
				[0, 2, 0, 2]
			];
			expect(() => MatrixInverse(matrix)).toThrow();
		});

		test('should throw error for non-square matrix', () => {
			const matrix: TMatrix = [[1, 2, 3], [4, 5, 6]];
			expect(() => MatrixInverse(matrix)).toThrow();
		});
	});

	describe('MatrixGramSchmidt', () => {
		test('should orthogonalize 2x2 matrix', () => {
			const matrix: TMatrix = [[1, 1], [0, 1]];
			const result = MatrixGramSchmidt(matrix);
			// First column should be normalized [1, 0]
			expect(result[0]?.[0]).toBeCloseTo(1);
			expect(result[1]?.[0]).toBeCloseTo(0);

			// Second column should be orthogonal to first and normalized
			expect(result[0]?.[1]).toBeCloseTo(0);
			expect(result[1]?.[1]).toBeCloseTo(1);
		});

		test('should orthogonalize 3x2 matrix', () => {
			const matrix: TMatrix = [
				[1, 1],
				[1, 0],
				[0, 1]
			];
			const result = MatrixGramSchmidt(matrix);

			// Check that columns are orthonormal
			const col1 = [result[0]?.[0] ?? 0, result[1]?.[0] ?? 0, result[2]?.[0] ?? 0];
			const col2 = [result[0]?.[1] ?? 0, result[1]?.[1] ?? 0, result[2]?.[1] ?? 0];

			// Check normalization (column norms should be 1)
			const norm1 = Math.sqrt(col1.reduce((sum, val) => sum + (val * val), 0));
			const norm2 = Math.sqrt(col2.reduce((sum, val) => sum + (val * val), 0));
			expect(norm1).toBeCloseTo(1);
			expect(norm2).toBeCloseTo(1);

			// Check orthogonality (dot product should be 0)
			const dotProduct = col1.reduce((sum, val, i) => sum + (val * (col2[i] ?? 0)), 0);
			expect(dotProduct).toBeCloseTo(0);
		});

		test('should handle identity matrix', () => {
			const matrix: TMatrix = [
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1]
			];
			const result = MatrixGramSchmidt(matrix);
			// Identity matrix should remain unchanged
			expect(result[0]?.[0]).toBeCloseTo(1);
			expect(result[1]?.[1]).toBeCloseTo(1);
			expect(result[2]?.[2]).toBeCloseTo(1);
			expect(result[0]?.[1]).toBeCloseTo(0);
			expect(result[0]?.[2]).toBeCloseTo(0);
			expect(result[1]?.[2]).toBeCloseTo(0);
		});

		test('should handle single column matrix', () => {
			const matrix: TMatrix = [[3], [4]];
			const result = MatrixGramSchmidt(matrix);
			// Should normalize the single column
			expect(result[0]?.[0]).toBeCloseTo(0.6); // 3/5
			expect(result[1]?.[0]).toBeCloseTo(0.8); // 4/5
		});

		test('should handle linearly dependent columns (second column is multiple of first)', () => {
			// Second column is 2x the first column
			const matrix: TMatrix = [
				[1, 2],
				[0, 0]
			];
			const result = MatrixGramSchmidt(matrix);
			// Should produce orthonormal basis by replacing dependent column
			expect(result).toBeDefined();
			// Check that result has orthonormal structure
			const col1 = [result[0]?.[0] ?? 0, result[1]?.[0] ?? 0];
			const col2 = [result[0]?.[1] ?? 0, result[1]?.[1] ?? 0];
			const norm1 = Math.sqrt(col1.reduce((sum, v) => sum + v * v, 0));
			const norm2 = Math.sqrt(col2.reduce((sum, v) => sum + v * v, 0));
			expect(norm1).toBeCloseTo(1, 1);
			expect(norm2).toBeCloseTo(1, 1);
		});

		test('should handle zero vector column', () => {
			const matrix: TMatrix = [
				[1, 0],
				[2, 0]
			];
			const result = MatrixGramSchmidt(matrix);
			expect(result).toBeDefined();
		});

		test('should produce orthonormal columns for 2x2 orthogonal matrix', () => {
			// Already orthogonal but not necessarily normalized
			const matrix: TMatrix = [
				[1, -1],
				[1, 1]
			];
			const result = MatrixGramSchmidt(matrix);
			// Check orthonormality
			const col1 = [result[0]?.[0] ?? 0, result[1]?.[0] ?? 0];
			const col2 = [result[0]?.[1] ?? 0, result[1]?.[1] ?? 0];
			const norm1 = Math.sqrt(col1.reduce((sum, v) => sum + v * v, 0));
			const norm2 = Math.sqrt(col2.reduce((sum, v) => sum + v * v, 0));
			expect(norm1).toBeCloseTo(1);
			expect(norm2).toBeCloseTo(1);
			const dot = col1.reduce((sum, v, i) => sum + v * (col2[i] ?? 0), 0);
			expect(dot).toBeCloseTo(0);
		});
	});

	describe('MatrixMinor', () => {
		test('should calculate minor for 2x2 matrix', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			expect(MatrixMinor(matrix, 0, 0)).toBe(4);
			expect(MatrixMinor(matrix, 1, 0)).toBe(3);
			expect(MatrixMinor(matrix, 0, 1)).toBe(2);
			expect(MatrixMinor(matrix, 1, 1)).toBe(1);
		});

		test('should calculate minor for 3x3 matrix', () => {
			const matrix: TMatrix = [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9]
			];
			expect(MatrixMinor(matrix, 0, 0)).toBe(-3); // det([[5,6],[8,9]]) = 45-48 = -3
			expect(MatrixMinor(matrix, 1, 0)).toBe(-6); // det([[4,6],[7,9]]) = 36-42 = -6
			expect(MatrixMinor(matrix, 2, 0)).toBe(-3); // det([[4,5],[7,8]]) = 32-35 = -3
		});

		test('should calculate minor for 4x4 matrix', () => {
			const matrix: TMatrix = [
				[1, 2, 3, 4],
				[5, 6, 7, 8],
				[9, 10, 11, 12],
				[13, 14, 15, 16]
			];
			const minor = MatrixMinor(matrix, 0, 0);
			expect(typeof minor).toBe('number');
			expect(minor).toBe(0); // This matrix has determinant 0
		});

		test('should throw error for 1x1 matrix', () => {
			const matrix: TMatrix = [[5]];
			expect(() => MatrixMinor(matrix, 0, 0)).toThrow();
		});

		test('should throw error for non-square matrix', () => {
			const matrix: TMatrix = [[1, 2, 3], [4, 5, 6]];
			expect(() => MatrixMinor(matrix, 0, 0)).toThrow();
		});

		test('should throw error for out-of-bounds indices', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			expect(() => MatrixMinor(matrix, 2, 0)).toThrow();
			expect(() => MatrixMinor(matrix, 0, 2)).toThrow();
			expect(() => MatrixMinor(matrix, -1, 0)).toThrow();
			expect(() => MatrixMinor(matrix, 0, -1)).toThrow();
		});
	});

	// Integration tests
	describe('Integration Tests', () => {
		test('determinant should equal product of eigenvalues for known matrices', () => {
			// For a diagonal matrix, determinant = product of diagonal elements
			const diagonal: TMatrix = [
				[2, 0, 0],
				[0, 3, 0],
				[0, 0, 4]
			];
			expect(MatrixDeterminant(diagonal)).toBe(24); // 2 * 3 * 4
		});

		test('inverse and adjoint relationship: A^-1 = adj(A) / det(A)', () => {
			const matrix: TMatrix = [[1, 2], [3, 4]];
			const inverse = MatrixInverse(matrix);
			const adjoint = MatrixAdjoint(matrix);
			const determinant = MatrixDeterminant(matrix);

			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					expect(inverse[i]?.[j]).toBeCloseTo((adjoint[i]?.[j] ?? 0) / determinant);
				}
			}
		});

		test('cofactor and minor relationship: C_ij = (-1)^(i+j) * M_ij', () => {
			const matrix: TMatrix = [
				[1, 2, 3],
				[4, 5, 6],
				[7, 8, 9]
			];

			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					const cofactor = MatrixCofactorElement(matrix, j, i);
					const minor = MatrixMinor(matrix, j, i);
					const expectedCofactor = Math.pow(-1, i + j) * minor;
					expect(cofactor).toBeCloseTo(expectedCofactor);
				}
			}
		});

		test('Gram-Schmidt should produce orthonormal matrix', () => {
			const matrix: TMatrix = [
				[1, 2, 1],
				[0, 1, 2],
				[1, 0, 1]
			];
			const result = MatrixGramSchmidt(matrix);

			// Check that all columns have unit length
			for (let j = 0; j < 3; j++) {
				const column = [result[0]?.[j] ?? 0, result[1]?.[j] ?? 0, result[2]?.[j] ?? 0];
				const norm = Math.sqrt(column.reduce((sum, val) => sum + (val * val), 0));
				expect(norm).toBeCloseTo(1, 5);
			}

			// Check that columns are pairwise orthogonal
			for (let i = 0; i < 3; i++) {
				for (let j = i + 1; j < 3; j++) {
					const col1 = [result[0]?.[i] ?? 0, result[1]?.[i] ?? 0, result[2]?.[i] ?? 0];
					const col2 = [result[0]?.[j] ?? 0, result[1]?.[j] ?? 0, result[2]?.[j] ?? 0];
					const dotProduct = col1.reduce((sum, val, k) => sum + (val * (col2[k] ?? 0)), 0);
					expect(dotProduct).toBeCloseTo(0, 5);
				}
			}
		});

		describe('MatrixPseudoInverse', () => {
			test('should compute pseudoinverse of identity matrix', () => {
				const identity: TMatrix = [[1, 0], [0, 1]];
				const pseudoInv = MatrixPseudoInverse(identity);

				// pseudoInv should be 2×2
				expect(pseudoInv.length).toBe(2);
				expect(pseudoInv[0]?.length).toBe(2);
				expect(pseudoInv[1]?.length).toBe(2);

				// For identity, pseudoinverse should be identity
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < 2; j++) {
						const expected = i === j ? 1 : 0;
						expect(pseudoInv[i]?.[j]).toBeCloseTo(expected, 10);
					}
				}
			});

			test('should verify Moore-Penrose property A × A⁺ × A ≈ A for rank-deficient 2x2', () => {
				// [[1, 2], [2, 4]]: rank 1 (second row = 2 × first row)
				const rankDeficient: TMatrix = [[1, 2], [2, 4]];
				const pseudoInv = MatrixPseudoInverse(rankDeficient);

				// pseudoInv should be 2×2
				expect(pseudoInv.length).toBe(2);

				// Verify Moore-Penrose property: A × A⁺ × A ≈ A
				const aaPlusA = MatrixMultiply(
					MatrixMultiply(rankDeficient, pseudoInv) as TMatrix,
					rankDeficient
				) as TMatrix;
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < 2; j++) {
						expect(aaPlusA[i]?.[j]).toBeCloseTo(rankDeficient[i]?.[j] ?? 0, 7);
					}
				}
			});

			test('should compute pseudoinverse of tall 3x2 matrix', () => {
				// Simple tall matrix with clear rank
				const tall: TMatrix = [[1, 0], [0, 1], [1, 1]];
				const pseudoInv = MatrixPseudoInverse(tall);

				// pseudoInv should be 2×3
				expect(pseudoInv.length).toBe(2);
				expect(pseudoInv[0]?.length).toBe(3);
				expect(pseudoInv[1]?.length).toBe(3);
			});

			test('should throw error for matrix with NaN', () => {
				const invalid: unknown = [[1, 2, NaN], [3, 4, 5]];
				expect(() => MatrixPseudoInverse(invalid as TMatrix)).toThrow();
			});

			test('should handle full-rank square matrix close to inverse', () => {
				const square: TMatrix = [[1, 0], [0, 1]];
				const pseudoInv = MatrixPseudoInverse(square);
				const trueInverse = MatrixInverse(square);

				// For identity-like matrices, values should be similar
				for (let i = 0; i < 2; i++) {
					for (let j = 0; j < 2; j++) {
						expect(pseudoInv[i]?.[j]).toBeCloseTo(trueInverse[i]?.[j] ?? 0, 8);
					}
				}
			});
		});

		describe('MatrixNullSpace', () => {
			test('should return empty matrix for full-rank 2x2 matrix', () => {
				const fullRank: TMatrix = [[1, 2], [3, 4]];
				const nullBasis = MatrixNullSpace(fullRank);

				// Full-rank matrix has trivial null space; should return empty matrix
				expect(nullBasis.length).toBe(0);
			});

			test('should find null space of rank-deficient 2x2 matrix', () => {
				// [[1, 2], [2, 4]]: rank 1, null space dimension = 2 - 1 = 1
				const rankDeficient: TMatrix = [[1, 2], [2, 4]];
				const nullBasis = MatrixNullSpace(rankDeficient);

				// Should have 2 rows (dimension of null space vectors) and 1 column (basis dimension)
				expect(nullBasis.length).toBe(2);
				expect(nullBasis[0]?.length).toBe(1);
				expect(nullBasis[1]?.length).toBe(1);

				// Each column of nullBasis should be a vector v such that A × v ≈ 0
				const v: number[] = [nullBasis[0]?.[0] ?? 0, nullBasis[1]?.[0] ?? 0];
				const result = MatrixMultiply(rankDeficient, v) as number[];
				expect(Math.abs(result[0] ?? 0)).toBeLessThan(1e-9);
				expect(Math.abs(result[1] ?? 0)).toBeLessThan(1e-9);
			});

			test('should return empty null space for full-rank matrix', () => {
				const fullRank: TMatrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
				const nullBasis = MatrixNullSpace(fullRank);

				// Full rank = 3, null space dimension = 3 - 3 = 0
				expect(nullBasis.length).toBe(0);
			});

			test('should verify null space basis is orthonormal', () => {
				const rankDeficient: TMatrix = [[1, 2], [2, 4]];
				const nullBasis = MatrixNullSpace(rankDeficient);

				if (nullBasis.length > 0 && (nullBasis[0]?.length ?? 0) > 0) {
					// Extract basis vectors as columns
					const numBasisVectors = nullBasis[0]?.length ?? 0;
					const basisVectors: number[][] = [];
					for (let colIdx = 0; colIdx < numBasisVectors; colIdx++) {
						const v: number[] = [];
						for (let rowIdx = 0; rowIdx < nullBasis.length; rowIdx++) {
							v.push(nullBasis[rowIdx]?.[colIdx] ?? 0);
						}
						basisVectors.push(v);
					}

					// Check orthonormality: each vector has unit norm and pairwise orthogonal
					for (let i = 0; i < basisVectors.length; i++) {
						const norm = Math.sqrt(basisVectors[i].reduce((sum, v) => sum + v * v, 0));
						expect(norm).toBeCloseTo(1, 10);

						for (let j = i + 1; j < basisVectors.length; j++) {
							const dot = basisVectors[i].reduce((sum, v, k) => sum + v * (basisVectors[j]?.[k] ?? 0), 0);
							expect(dot).toBeCloseTo(0, 10);
						}
					}
				}
			});

			test('should handle 3x2 tall full-rank matrix', () => {
				const tallMatrix: TMatrix = [[1, 0], [0, 1], [1, 1]];
				const nullBasis = MatrixNullSpace(tallMatrix);

				// rank = 2, null space dimension = 2 - 2 = 0 (should be empty)
				expect(nullBasis.length).toBe(0); // Empty matrix for full rank
			});

			test('should throw error for matrix with invalid input', () => {
				const invalid: unknown = [[1, 2, Infinity], [3, 4, 5]];
				expect(() => MatrixNullSpace(invalid as TMatrix)).toThrow();
			});

			test('should compute null space for various matrices', () => {
				// Test that MatrixNullSpace returns proper dimensions and orthonormal basis
				const rankDef: TMatrix = [[1, 2], [2, 4]];
				const nullBasis = MatrixNullSpace(rankDef);

				// For this rank-1 matrix, null space should have dimension 1
				expect(nullBasis.length).toBe(2);
				expect(nullBasis[0]?.length).toBe(1);

				// Basis vectors should be orthonormal
				if (nullBasis.length > 0 && (nullBasis[0]?.length ?? 0) > 0) {
					const v: number[] = [];
					for (let i = 0; i < nullBasis.length; i++) {
						v.push(nullBasis[i]?.[0] ?? 0);
					}
					// Check that the vector has unit norm
					const norm = Math.sqrt(v.reduce((sum, x) => sum + x * x, 0));
					expect(norm).toBeCloseTo(1, 10);
				}
			});
		});
	});
});
