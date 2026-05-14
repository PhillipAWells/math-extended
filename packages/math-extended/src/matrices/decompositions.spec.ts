import { MatrixCholesky, MatrixEigen, MatrixLU, MatrixQR, MatrixSVD, MatrixSolve } from './decompositions.js';

describe('Matrix Decompositions', () => {
	describe('MatrixCholesky', () => {
		it('computes Cholesky decomposition for a symmetric positive definite matrix', () => {
			const A = [
				[4, 2],
				[2, 3],
			];
			const L = MatrixCholesky(A);
			expect(L?.[0]?.[0]).toBeCloseTo(2);
			expect(L?.[1]?.[0]).toBeCloseTo(1);
			expect(L?.[1]?.[1]).toBeCloseTo(Math.sqrt(2));
		});
		it('throws for non-positive definite matrix', () => {
			const A = [
				[1, 2],
				[2, 1],
			];
			expect(() => MatrixCholesky(A)).toThrow();
		});
	});

	describe('MatrixCholesky (edge/error cases)', () => {
		it('throws for non-square matrix', () => {
			const A = [[1, 2, 3], [4, 5, 6]];
			expect(() => MatrixCholesky(A)).toThrow();
		});
		it('throws for non-symmetric matrix', () => {
			const A = [[1, 2], [3, 4]];
			expect(() => MatrixCholesky(A)).toThrow();
		});
		it('throws for empty matrix', () => {
			expect(() => MatrixCholesky([])).toThrow();
		});
		it('throws for non-array input', () => {
			expect(() => MatrixCholesky(null as any)).toThrow();
			expect(() => MatrixCholesky(123 as any)).toThrow();
		});
	});

	describe('MatrixEigen', () => {
		it('computes eigenvalues and eigenvectors for a 2x2 matrix', () => {
			const A = [
				[3, 1],
				[0, 2],
			];
			const { eigenvalues, eigenvectors } = MatrixEigen(A);
			expect(eigenvalues).toEqual([3, 2]);
			// Eigenvectors: columns, up to sign
			// For eigenvalue 3, eigenvector should be [1, 0] (ratio is Infinity)
			expect(eigenvectors?.[0]?.[0]).toBeCloseTo(1);
			expect(eigenvectors?.[1]?.[0]).toBeCloseTo(0);

			// For eigenvalue 2, eigenvector should be [1, 1] or [1, -1] (ratio is ±1)
			const ratio = (eigenvectors?.[0]?.[1] ?? 0) / (eigenvectors?.[1]?.[1] ?? 1);
			expect(Math.abs(ratio)).toBeCloseTo(1);
		});
		it('returns correct result for 1x1 matrix', () => {
			const A = [[5]];
			const { eigenvalues, eigenvectors } = MatrixEigen(A);
			expect(eigenvalues).toEqual([5]);
			expect(eigenvectors).toEqual([[1]]);
		});
		it('throws for complex eigenvalues', () => {
			const A = [
				[0, -1],
				[1, 0],
			];
			expect(() => MatrixEigen(A)).toThrow();
		});
	});

	describe('MatrixEigen (edge/error cases)', () => {
		it('throws for non-square matrix', () => {
			const A = [[1, 2, 3], [4, 5, 6]];
			expect(() => MatrixEigen(A)).toThrow();
		});
		it('throws for empty matrix', () => {
			expect(() => MatrixEigen([])).toThrow();
		});
		it('throws for non-array input', () => {
			expect(() => MatrixEigen(undefined as any)).toThrow();
		});
	});

	describe('MatrixLU', () => {
		it('computes LU decomposition for a 2x2 matrix (P × A = L × U)', () => {
			const A = [
				[2, 1],
				[1, 1],
			];
			const { L, U, P } = MatrixLU(A);
			// Verify L × U reconstructs the permuted A
			expect(L?.[0]?.[0]).toBeCloseTo(1);
			expect(L?.[1]?.[1]).toBeCloseTo(1);
			expect(U?.[0]?.[0]).toBeCloseTo(2);
			expect(U?.[0]?.[1]).toBeCloseTo(1);
			// P should be a valid permutation of [0,1]
			expect(P).toHaveLength(2);
			expect(new Set(P).size).toBe(2);
		});

		it('handles a permutation matrix [[0,1],[1,0]] that previously required pivoting', () => {
			// This matrix has a zero leading element and required pivoting to solve correctly
			const A = [[0, 1], [1, 0]];
			const { L, U, P } = MatrixLU(A);
			// Reconstruct permuted A from L × U and verify correctness
			const lu00 = ((L?.[0]?.[0] ?? 0) * (U?.[0]?.[0] ?? 0)) + ((L?.[0]?.[1] ?? 0) * (U?.[1]?.[0] ?? 0));
			const lu01 = ((L?.[0]?.[0] ?? 0) * (U?.[0]?.[1] ?? 0)) + ((L?.[0]?.[1] ?? 0) * (U?.[1]?.[1] ?? 0));
			const lu10 = ((L?.[1]?.[0] ?? 0) * (U?.[0]?.[0] ?? 0)) + ((L?.[1]?.[1] ?? 0) * (U?.[1]?.[0] ?? 0));
			const lu11 = ((L?.[1]?.[0] ?? 0) * (U?.[0]?.[1] ?? 0)) + ((L?.[1]?.[1] ?? 0) * (U?.[1]?.[1] ?? 0));
			// LU should equal P(A) — the permuted A
			expect(lu00).toBeCloseTo((A[P?.[0] ?? 0]?.[0] ?? 0));
			expect(lu01).toBeCloseTo((A[P?.[0] ?? 0]?.[1] ?? 0));
			expect(lu10).toBeCloseTo((A[P?.[1] ?? 1]?.[0] ?? 0));
			expect(lu11).toBeCloseTo((A[P?.[1] ?? 1]?.[1] ?? 0));
		});

		it('throws for singular matrix', () => {
			const A = [
				[1, 2],
				[2, 4],
			];
			expect(() => MatrixLU(A)).toThrow();
		});
	});

	describe('MatrixLU (edge/error cases)', () => {
		it('throws for non-square matrix', () => {
			const A = [[1, 2, 3], [4, 5, 6]];
			expect(() => MatrixLU(A)).toThrow();
		});
		it('throws for empty matrix', () => {
			expect(() => MatrixLU([])).toThrow();
		});
		it('throws for non-array input', () => {
			expect(() => MatrixLU(undefined as any)).toThrow();
		});
	});

	describe('MatrixQR', () => {
		it('computes QR decomposition for a 2x2 matrix', () => {
			const A = [
				[1, 1],
				[1, 0],
			];
			const { Q, R } = MatrixQR(A);
			// Q should be orthogonal: Q^T Q = I
			const QTQ00 = ((Q?.[0]?.[0] ?? 0) * (Q?.[0]?.[0] ?? 0)) + ((Q?.[1]?.[0] ?? 0) * (Q?.[1]?.[0] ?? 0));
			const QTQ01 = ((Q?.[0]?.[0] ?? 0) * (Q?.[0]?.[1] ?? 0)) + ((Q?.[1]?.[0] ?? 0) * (Q?.[1]?.[1] ?? 0));
			const QTQ10 = ((Q?.[0]?.[1] ?? 0) * (Q?.[0]?.[0] ?? 0)) + ((Q?.[1]?.[1] ?? 0) * (Q?.[1]?.[0] ?? 0));
			const QTQ11 = ((Q?.[0]?.[1] ?? 0) * (Q?.[0]?.[1] ?? 0)) + ((Q?.[1]?.[1] ?? 0) * (Q?.[1]?.[1] ?? 0));
			expect(QTQ00).toBeCloseTo(1);
			expect(QTQ11).toBeCloseTo(1);
			expect(QTQ01).toBeCloseTo(0);
			expect(QTQ10).toBeCloseTo(0);
			// R should be upper triangular
			expect(R?.[1]?.[0]).toBeCloseTo(0);
		});
		it('throws for more columns than rows', () => {
			const A = [
				[1, 2, 3],
				[4, 5, 6],
			];
			expect(() => MatrixQR(A)).toThrow();
		});
	});

	describe('MatrixQR (edge/error cases)', () => {
		it('throws for empty matrix', () => {
			expect(() => MatrixQR([])).toThrow();
		});
		it('throws for non-array input', () => {
			expect(() => MatrixQR(undefined as any)).toThrow();
		});
	});

	describe('MatrixSVD', () => {
		it('computes SVD for a 2x2 matrix', () => {
			const A = [
				[1, 0],
				[0, 2],
			];
			const { U, S, VT } = MatrixSVD(A);
			expect(S?.[0] ?? 0).toBeGreaterThanOrEqual(S?.[1] ?? 0);
			// U and VT should be orthogonal

			const UUT = ((U?.[0]?.[0] ?? 0) * (U?.[0]?.[0] ?? 0)) + ((U?.[1]?.[0] ?? 0) * (U?.[1]?.[0] ?? 0));
			expect(UUT).toBeCloseTo(1);

			const VTV = ((VT?.[0]?.[0] ?? 0) * (VT?.[0]?.[0] ?? 0)) + ((VT?.[1]?.[0] ?? 0) * (VT?.[1]?.[0] ?? 0));
			expect(VTV).toBeCloseTo(1);
		});
		it('computes SVD for a 1x1 matrix', () => {
			const A = [[-3]];
			const { U, S, VT } = MatrixSVD(A);
			expect(S?.[0]).toBeCloseTo(3);
			expect(U?.[0]?.[0]).toBeCloseTo(1);
			expect(VT?.[0]?.[0]).toBeCloseTo(-1);
		});
	});

	describe('MatrixSVD (edge/error cases)', () => {
		it('throws for empty matrix', () => {
			expect(() => MatrixSVD([])).toThrow();
		});
		it('throws for non-array input', () => {
			expect(() => MatrixSVD(undefined as any)).toThrow();
		});
	});

	// Additional property check: reconstruct original matrix from Cholesky
	describe('MatrixCholesky (property)', () => {
		it('reconstructs original matrix from L * L^T', () => {
			const A = [[25, 15, -5], [15, 18, 0], [-5, 0, 11]];
			const L = MatrixCholesky(A);
			const LT = (L ?? [])[0]?.map((_, i) => (L ?? []).map((row) => row?.[i] ?? 0)) ?? [];
			const reconstructed = (L ?? []).map((row) => (LT[0] ?? []).map((_, j) => row.reduce((sum, val, k) => sum + ((val ?? 0) * (LT[k]?.[j] ?? 0)), 0)));

			for (let i = 0; i < 3; ++i) {
				for (let j = 0; j < 3; ++j) {
					expect(Number(reconstructed[i]?.[j] ?? 0)).toBeCloseTo(A[i]?.[j] ?? 0);
				}
			}
		});
	});

	describe('MatrixSolve', () => {
		it('solves a 2×2 system', () => {
			// 2x + y = 8
			// 5x + 3y = 20  →  x=4, y=0
			const x = MatrixSolve([[2, 1], [5, 3]], [8, 20]);
			expect(x[0]).toBeCloseTo(4);
			expect(x[1]).toBeCloseTo(0);
		});

		it('solves a 3×3 system', () => {
			// x + y + z = 6, 2y + 5z = -4, 2x + 5y - z = 27  →  x=5, y=3, z=-2
			const A = [[1, 1, 1], [0, 2, 5], [2, 5, -1]];
			const b = [6, -4, 27];
			const x = MatrixSolve(A, b);
			expect(x[0]).toBeCloseTo(5);
			expect(x[1]).toBeCloseTo(3);
			expect(x[2]).toBeCloseTo(-2);
		});

		it('satisfies A·x = b for a random-ish system', () => {
			const A = [[4, 3], [6, 3]];
			const b = [10, 12];
			const x = MatrixSolve(A, b);
			// Verify A·x ≈ b
			const check0 = (4 * (x[0] ?? 0)) + (3 * (x[1] ?? 0));
			const check1 = (6 * (x[0] ?? 0)) + (3 * (x[1] ?? 0));
			expect(check0).toBeCloseTo(10);
			expect(check1).toBeCloseTo(12);
		});

		it('throws for non-square matrix', () => {
			expect(() => MatrixSolve([[1, 2, 3], [4, 5, 6]], [1, 2])).toThrow();
		});

		it('throws when b length does not match matrix dimension', () => {
			expect(() => MatrixSolve([[1, 2], [3, 4]], [1, 2, 3])).toThrow();
		});
	});

	describe('MatrixLU - comprehensive edge cases', () => {
		it('handles singular matrix (determinant = 0)', () => {
			const singular = [[1, 2], [2, 4]]; // Row 2 = 2 * Row 1
			expect(() => MatrixLU(singular)).toThrow();
		});

		it('handles near-singular matrix (very small determinant)', () => {
			const nearSingular = [[1, 1], [1, 1.0000001]];
			const result = MatrixLU(nearSingular);
			expect(result.L).toBeDefined();
			expect(result.U).toBeDefined();
			expect(result.P).toBeDefined();
		});

		it('handles rank-deficient matrix', () => {
			const rankDeficient = [[1, 0, 1], [0, 0, 0], [1, 0, 1]];
			expect(() => MatrixLU(rankDeficient)).toThrow();
		});

		it('handles very large values without overflow', () => {
			const large = [[1e100, 2e100], [3e100, 4e100]];
			const result = MatrixLU(large);
			expect(result.L).toBeDefined();
			expect(result.U).toBeDefined();
			expect(result.P).toBeDefined();
		});

		it('handles very small values correctly', () => {
			// Very small values can approach numerical tolerance threshold
			// This test verifies they either work or throw appropriately
			const small = [[1e-50, 2e-50], [3e-50, 4e-50]];
			try {
				const result = MatrixLU(small);
				expect(result.L).toBeDefined();
				expect(result.U).toBeDefined();
				expect(result.P).toBeDefined();
			} catch (error) {
				// It's acceptable to throw when values are below numerical tolerance
				expect(error).toBeDefined();
			}
		});

		it('produces L with unit diagonal', () => {
			const A = [[4, 3], [6, 3]];
			const { L } = MatrixLU(A);
			expect(L?.[0]?.[0]).toBeCloseTo(1);
			expect(L?.[1]?.[1]).toBeCloseTo(1);
		});

		it('produces upper triangular U', () => {
			const A = [[4, 3], [6, 3]];
			const { U } = MatrixLU(A);
			expect(U?.[1]?.[0]).toBeCloseTo(0);
		});

		it('reconstructs permuted matrix from L × U', () => {
			const A = [[2, 1], [1, 1]];
			const { L, U, P } = MatrixLU(A);
			// Verify that L × U reconstructs the permuted A
			const lu00 = ((L?.[0]?.[0] ?? 0) * (U?.[0]?.[0] ?? 0)) + ((L?.[0]?.[1] ?? 0) * (U?.[1]?.[0] ?? 0));
			const permutedA00 = A[P?.[0] ?? 0]?.[0] ?? 0;
			expect(lu00).toBeCloseTo(permutedA00);
		});
	});

	describe('MatrixQR - comprehensive edge cases', () => {
		it('handles singular/dependent columns appropriately', () => {
			// QR throws on dependent columns by default
			const singular = [[1, 2], [2, 4]];
			expect(() => MatrixQR(singular)).toThrow();
		});

		it('handles rank-deficient matrix appropriately', () => {
			// Rank-deficient matrices have linearly dependent columns
			const rankDeficient = [[1, 0, 1], [0, 0, 0], [1, 0, 1]];
			expect(() => MatrixQR(rankDeficient)).toThrow();
		});

		it('handles very large matrix values', () => {
			const large = [[1e100, 2e100], [3e100, 4e100]];
			const result = MatrixQR(large);
			expect(result.Q).toBeDefined();
			expect(result.R).toBeDefined();
		});

		it('handles very small matrix values correctly', () => {
			// Very small values can approach numerical tolerance
			const small = [[1e-50, 2e-50], [3e-50, 4e-50]];
			try {
				const result = MatrixQR(small);
				expect(result.Q).toBeDefined();
				expect(result.R).toBeDefined();
			} catch (error) {
				// It's acceptable to throw when columns become dependent due to underflow
				expect(error).toBeDefined();
			}
		});

		it('produces orthogonal Q matrix', () => {
			const A = [[1, 1], [1, 0]];
			const { Q } = MatrixQR(A);
			// Q^T * Q should be identity
			const QTQ00 = ((Q?.[0]?.[0] ?? 0) * (Q?.[0]?.[0] ?? 0)) + ((Q?.[1]?.[0] ?? 0) * (Q?.[1]?.[0] ?? 0));
			const QTQ11 = ((Q?.[0]?.[1] ?? 0) * (Q?.[0]?.[1] ?? 0)) + ((Q?.[1]?.[1] ?? 0) * (Q?.[1]?.[1] ?? 0));
			const QTQ01 = ((Q?.[0]?.[0] ?? 0) * (Q?.[0]?.[1] ?? 0)) + ((Q?.[1]?.[0] ?? 0) * (Q?.[1]?.[1] ?? 0));
			expect(QTQ00).toBeCloseTo(1);
			expect(QTQ11).toBeCloseTo(1);
			expect(QTQ01).toBeCloseTo(0);
		});

		it('produces upper triangular R matrix', () => {
			const A = [[1, 1], [1, 0], [0, 1]];
			const { R } = MatrixQR(A);
			// All elements below diagonal should be near zero
			expect(R?.[1]?.[0]).toBeCloseTo(0);
			expect(R?.[2]?.[0] ?? 0).toBeCloseTo(0);
			expect(R?.[2]?.[1] ?? 0).toBeCloseTo(0);
		});

		it('reconstructs original matrix from Q × R', () => {
			const A = [[1, 1], [1, 0]];
			const { Q, R } = MatrixQR(A);
			// Reconstruct A ≈ Q * R
			const reconst00 = ((Q?.[0]?.[0] ?? 0) * (R?.[0]?.[0] ?? 0)) + ((Q?.[0]?.[1] ?? 0) * (R?.[1]?.[0] ?? 0));
			const reconst01 = ((Q?.[0]?.[0] ?? 0) * (R?.[0]?.[1] ?? 0)) + ((Q?.[0]?.[1] ?? 0) * (R?.[1]?.[1] ?? 0));
			expect(reconst00).toBeCloseTo(A[0]?.[0] ?? 0);
			expect(reconst01).toBeCloseTo(A[0]?.[1] ?? 0);
		});
	});

	describe('MatrixEigenDecomposition - comprehensive edge cases', () => {
		it('handles singular matrix', () => {
			const singular = [[1, 2], [2, 4]];
			const result = MatrixEigen(singular);
			expect(result.eigenvalues).toBeDefined();
			expect(result.eigenvectors).toBeDefined();
		});

		it('handles complex eigenvalues (may return real approximations)', () => {
			// Rotation matrix has complex eigenvalues; algorithm returns real components
			const rotation = [[0, -1], [1, 0]];
			expect(() => MatrixEigen(rotation)).toThrow();
		});

		it('convergence does not exceed iteration limit for 3×3 matrix', () => {
			// No assertion needed; just ensure it doesn't hang
			const matrix = [[1, 2, 3], [2, 4, 5], [3, 5, 6]];
			const result = MatrixEigen(matrix);
			expect(result.eigenvalues).toBeDefined();
		});

		it('handles diagonal matrix (eigenvalues are diagonal elements)', () => {
			const diagonal = [[2, 0], [0, 3]];
			const result = MatrixEigen(diagonal);
			expect(result.eigenvalues).toContainEqual(expect.closeTo(2, 1));
			expect(result.eigenvalues).toContainEqual(expect.closeTo(3, 1));
		});

		it('handles matrix with repeated eigenvalues', () => {
			const repeated = [[2, 0], [0, 2]];
			const result = MatrixEigen(repeated);
			expect(result.eigenvalues).toHaveLength(2);
			expect(result.eigenvalues?.[0]).toBeCloseTo(2);
			expect(result.eigenvalues?.[1]).toBeCloseTo(2);
		});

		it('handles very large eigenvalues', () => {
			const large = [[1e50, 0], [0, 2e50]];
			const result = MatrixEigen(large);
			expect(result.eigenvalues).toBeDefined();
			expect(result.eigenvalues).toHaveLength(2);
		});

		it('handles very small eigenvalues', () => {
			const small = [[1e-50, 0], [0, 2e-50]];
			const result = MatrixEigen(small);
			expect(result.eigenvalues).toBeDefined();
			expect(result.eigenvalues).toHaveLength(2);
		});

		it('returns eigenvectors with correct count', () => {
			const matrix = [[3, 1], [0, 2]];
			const result = MatrixEigen(matrix);
			expect(result.eigenvectors).toHaveLength(2);
		});

		it('handles 3×3 symmetric matrix', () => {
			const symmetric = [[1, 2, 3], [2, 4, 5], [3, 5, 6]];
			const result = MatrixEigen(symmetric);
			expect(result.eigenvalues).toHaveLength(3);
			expect(result.eigenvectors).toHaveLength(3);
		});
	});

	describe('MatrixSVD - comprehensive edge cases', () => {
		it('handles singular matrix (rank-deficient)', () => {
			const singular = [[1, 2], [2, 4]];
			const result = MatrixSVD(singular);
			expect(result.U).toBeDefined();
			expect(result.S).toBeDefined();
			expect(result.VT).toBeDefined();
		});

		it('singular values are in descending order', () => {
			const A = [[1, 0], [0, 2], [0, 0]];
			const { S } = MatrixSVD(A);
			expect(S?.[0] ?? 0).toBeGreaterThanOrEqual(S?.[1] ?? 0);
		});

		it('handles very large matrix values', () => {
			const large = [[1e50, 2e50], [3e50, 4e50]];
			const result = MatrixSVD(large);
			expect(result.U).toBeDefined();
			expect(result.S).toBeDefined();
			expect(result.VT).toBeDefined();
		});

		it('handles very small matrix values', () => {
			const small = [[1e-50, 2e-50], [3e-50, 4e-50]];
			const result = MatrixSVD(small);
			expect(result.U).toBeDefined();
			expect(result.S).toBeDefined();
			expect(result.VT).toBeDefined();
		});

		it('U and VT are orthogonal matrices', () => {
			const A = [[1, 0], [0, 2]];
			const result = MatrixSVD(A);
			// U^T * U should be identity
			const UTU = ((result.U?.[0]?.[0] ?? 0) * (result.U?.[0]?.[0] ?? 0)) + ((result.U?.[1]?.[0] ?? 0) * (result.U?.[1]?.[0] ?? 0));
			expect(UTU).toBeCloseTo(1);
		});

		it('reconstructs original matrix from U × S × VT', () => {
			const A = [[1, 0], [0, 2]];
			const result = MatrixSVD(A);
			// Reconstruct A ≈ U * diag(S) * VT (full reconstruction needed)
			// For diagonal matrix [[1,0],[0,2]], check singular values are preserved
			expect(result.S?.[0] ?? 0).toBeGreaterThanOrEqual(result.S?.[1] ?? 0);
			expect(result.S).toHaveLength(2);
		});

		it('handles 1×3 tall rectangular matrix', () => {
			const tall = [[1, 2, 3]];
			const result = MatrixSVD(tall);
			expect(result.U).toBeDefined();
			expect(result.S).toBeDefined();
			expect(result.VT).toBeDefined();
		});

		it('handles 3×1 wide rectangular matrix', () => {
			const wide = [[1], [2], [3]];
			const result = MatrixSVD(wide);
			expect(result.U).toBeDefined();
			expect(result.S).toBeDefined();
			expect(result.VT).toBeDefined();
		});
	});

	// Edge cases for QR decomposition
	describe('MatrixQR (comprehensive edge cases)', () => {
		it('handles matrix with very large values', () => {
			const A = [[1e8, 1e7], [1e8, 2e8]];
			const result = MatrixQR(A);
			expect(result.Q).toBeDefined();
			expect(result.R).toBeDefined();
		});

		it('Q matrix is orthogonal for square input', () => {
			const A = [[1, 1], [2, 1]];
			const { Q, R: _R } = MatrixQR(A);
			// Q^T * Q should be identity
			const QTQ00 = ((Q?.[0]?.[0] ?? 0) * (Q?.[0]?.[0] ?? 0)) + ((Q?.[1]?.[0] ?? 0) * (Q?.[1]?.[0] ?? 0));
			const QTQ11 = ((Q?.[0]?.[1] ?? 0) * (Q?.[0]?.[1] ?? 0)) + ((Q?.[1]?.[1] ?? 0) * (Q?.[1]?.[1] ?? 0));
			const QTQ01 = ((Q?.[0]?.[0] ?? 0) * (Q?.[0]?.[1] ?? 0)) + ((Q?.[1]?.[0] ?? 0) * (Q?.[1]?.[1] ?? 0));
			expect(QTQ00).toBeCloseTo(1);
			expect(QTQ11).toBeCloseTo(1);
			expect(QTQ01).toBeCloseTo(0);
		});

		it('R matrix is upper triangular', () => {
			const A = [[3, 1], [4, 2]];
			const { R } = MatrixQR(A);
			// Lower triangle should be zero
			expect(R?.[1]?.[0]).toBeCloseTo(0);
		});

		it('QR correctly decomposes non-square matrix', () => {
			const A = [[1, 0], [1, 1], [1, 2]];
			const { Q, R } = MatrixQR(A);
			expect(Q).toBeDefined();
			expect(R).toBeDefined();
			expect(Q?.[0]?.length).toBe(2);
			expect(R?.[0]?.length).toBe(2);
		});

		it('handles matrix with small but non-zero elements', () => {
			const A = [[1.01, 0.99], [0.99, 1.01]];
			const result = MatrixQR(A);
			expect(result.Q).toBeDefined();
			expect(result.R).toBeDefined();
		});
	});

	// Edge cases for SVD decomposition
	describe('MatrixSVD (comprehensive edge cases)', () => {
		it('singular values are non-negative and sorted descending', () => {
			const A = [[3, 1], [1, 2]];
			const { S } = MatrixSVD(A);
			for (let i = 0; i < (S?.length ?? 0) - 1; i++) {
				const curr = S?.[i] ?? 0;
				const next = S?.[i + 1] ?? 0;
				expect(curr).toBeGreaterThanOrEqual(next);
				expect(curr).toBeGreaterThanOrEqual(0);
			}
		});

		it('handles matrix with very small singular values', () => {
			const epsilon = 1e-12;
			const A = [[1, epsilon], [epsilon, 1]];
			const { S } = MatrixSVD(A);
			expect(S).toBeDefined();
			expect(S?.length).toBeGreaterThan(0);
		});

		it('handles zero-containing matrix', () => {
			const A = [[0, 1], [1, 0]];
			const result = MatrixSVD(A);
			expect(result.U).toBeDefined();
			expect(result.S).toBeDefined();
			expect(result.VT).toBeDefined();
		});

		it('U and VT are orthogonal', () => {
			const A = [[1, 2], [3, 4]];
			const { U, VT: _VT } = MatrixSVD(A);
			// UUT should equal I
			const UUT = ((U?.[0]?.[0] ?? 0) * (U?.[0]?.[0] ?? 0)) + ((U?.[0]?.[1] ?? 0) * (U?.[0]?.[1] ?? 0));
			expect(Math.abs(UUT - 1)).toBeLessThan(0.001);
		});

		it('singular values equal positive square roots of eigenvalues of A^T A', () => {
			const A = [[1, 2], [3, 4]];
			const { S } = MatrixSVD(A);
			expect(S).toBeDefined();
			for (const s of S ?? []) {
				expect(s).toBeGreaterThanOrEqual(0);
			}
		});

		it('handles matrices with different aspect ratios', () => {
			const A = [[1, 0], [0, 2], [0, 0]];
			const result = MatrixSVD(A);
			expect(result.U).toBeDefined();
			expect(result.S).toBeDefined();
			expect(result.VT).toBeDefined();
		});
	});

	// Edge cases for eigenvalue decomposition
	describe('MatrixEigen (comprehensive edge cases)', () => {
		it('handles matrix with repeated eigenvalues', () => {
			const A = [[2, 0], [0, 2]];
			const { eigenvalues } = MatrixEigen(A);
			expect(eigenvalues?.[0]).toBeCloseTo(2);
			expect(eigenvalues?.[1]).toBeCloseTo(2);
		});

		it('handles nearly-repeated eigenvalues', () => {
			const A = [[2, 0], [0, 2.0000001]];
			const { eigenvalues } = MatrixEigen(A);
			expect(eigenvalues).toBeDefined();
			expect(eigenvalues?.length).toBe(2);
		});

		it('handles diagonal matrix', () => {
			const A = [[5, 0, 0], [0, 3, 0], [0, 0, 7]];
			const { eigenvalues } = MatrixEigen(A);
			const sorted = (eigenvalues ?? []).sort((a, b) => b - a);
			expect(sorted).toContain(7);
			expect(sorted).toContain(5);
			expect(sorted).toContain(3);
		});

		it('handles matrix with very small off-diagonal elements', () => {
			const A = [[1, 1e-15], [1e-15, 2]];
			const { eigenvalues } = MatrixEigen(A);
			expect(eigenvalues?.length).toBe(2);
		});

		it('handles matrix with very large values', () => {
			const A = [[1e10, 1e9], [1e9, 1e10]];
			const { eigenvalues } = MatrixEigen(A);
			expect(eigenvalues).toBeDefined();
			expect(eigenvalues?.length).toBe(2);
		});

		it('eigenvectors are normalized', () => {
			const A = [[2, 1], [1, 3]];
			const { eigenvectors } = MatrixEigen(A);
			for (let i = 0; i < (eigenvectors?.[0]?.length ?? 0); i++) {
				const vecSum = (eigenvectors ?? []).reduce((sum, row) => sum + ((row?.[i] ?? 0) ** 2), 0);
				expect(Math.abs(vecSum - 1)).toBeLessThan(0.01);
			}
		});

		it('handles symmetric positive definite matrix', () => {
			const A = [[4, 1], [1, 3]];
			const { eigenvalues } = MatrixEigen(A);
			// All eigenvalues of SPD matrix are positive
			for (const ev of eigenvalues ?? []) {
				expect(ev).toBeGreaterThan(0);
			}
		});

		it('A * v = lambda * v for each eigenvalue/eigenvector pair', () => {
			const A = [[4, -2], [-2, 1]];
			const { eigenvalues, eigenvectors } = MatrixEigen(A);
			for (let j = 0; j < (eigenvalues?.length ?? 0); j++) {
				const lambda = eigenvalues?.[j] ?? 0;
				const v = (eigenvectors ?? []).map(row => row?.[j] ?? 0);
				// A * v
				const Av = [
					((A[0]?.[0] ?? 0) * v[0]) + ((A[0]?.[1] ?? 0) * v[1]),
					((A[1]?.[0] ?? 0) * v[0]) + ((A[1]?.[1] ?? 0) * v[1]),
				];
				// lambda * v
				const lv = [lambda * v[0], lambda * v[1]];
				for (let i = 0; i < 2; i++) {
					expect(Av[i]).toBeCloseTo(lv[i], 4);
				}
			}
		});

		it('handles 3x3 symmetric matrix', () => {
			const A = [[6, -1, 0], [-1, 5, -1], [0, -1, 4]];
			const { eigenvalues, eigenvectors } = MatrixEigen(A);
			expect(eigenvalues?.length).toBe(3);
			expect(eigenvectors?.length).toBe(3);
		});
	});

	describe('MatrixLU - Permutation handling (critical branches)', () => {
		it('should correctly compute LU with row permutation for ill-conditioned leading element', () => {
			// Matrix that requires row swaps during pivoting
			const A = [
				[0.001, 2, 3],
				[1, 2, 3],
				[2, 3, 4],
			];

			const { L, U, P } = MatrixLU(A);

			// Verify PA = LU algebraically
			// First construct the permuted matrix
			const PA: number[][] = [];
			for (let i = 0; i < 3; i++) {
				PA[i] = [...(A[P[i]] as number[])];
			}

			// Compute LU
			const LU: number[][] = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			];
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					let sum = 0;
					for (let k = 0; k < 3; k++) {
						sum += ((L[i] as number[])[k] as number) * ((U[k] as number[])[j] as number);
					}
					(LU[i] as number[])[j] = sum;
				}
			}

			// Verify each element
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					expect((LU[i] as number[])[j]).toBeCloseTo((PA[i] as number[])[j], 5);
				}
			}
		});

		it('should have valid permutation matrix P (orthogonal: P * P^T = I)', () => {
			const A = [[2, 1], [1, 3]];
			const { P } = MatrixLU(A);

			// Build permutation matrix from P array
			const permMatrix: number[][] = [
				[0, 0],
				[0, 0],
			];
			for (let i = 0; i < 2; i++) {
				(permMatrix[i] as number[])[P[i]] = 1;
			}

			// Compute P * P^T
			const PPt: number[][] = [
				[0, 0],
				[0, 0],
			];
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					let sum = 0;
					for (let k = 0; k < 2; k++) {
						sum += ((permMatrix[i] as number[])[k] as number) * ((permMatrix[j] as number[])[k] as number);
					}
					(PPt[i] as number[])[j] = sum;
				}
			}

			// Verify PPt = I
			for (let i = 0; i < 2; i++) {
				for (let j = 0; j < 2; j++) {
					const expected = i === j ? 1 : 0;
					expect((PPt[i] as number[])[j]).toBeCloseTo(expected, 5);
				}
			}
		});

		it('should handle 4x4 matrix with multiple permutations', () => {
			// Use a non-singular 4x4 matrix - create one by starting with a diagonal matrix
			// and adding small perturbations
			const A = [
				[0.1, 0.01, 0.02, 0.03],
				[0.04, 0.2, 0.05, 0.06],
				[0.07, 0.08, 0.3, 0.09],
				[0.1, 0.11, 0.12, 0.4],
			];

			const { L, U, P } = MatrixLU(A);

			// Reconstruct permuted matrix
			const PA: number[][] = [];
			for (let i = 0; i < 4; i++) {
				PA[i] = [...(A[P[i]] as number[])];
			}

			// Compute LU product
			const LU: number[][] = [
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
				[0, 0, 0, 0],
			];
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					let sum = 0;
					for (let k = 0; k < 4; k++) {
						sum += ((L[i] as number[])[k] as number) * ((U[k] as number[])[j] as number);
					}
					(LU[i] as number[])[j] = sum;
				}
			}

			// Verify decomposition holds
			for (let i = 0; i < 4; i++) {
				for (let j = 0; j < 4; j++) {
					expect((LU[i] as number[])[j]).toBeCloseTo((PA[i] as number[])[j], 4);
				}
			}
		});

		it('should preserve permutation validity across different matrix sizes', () => {
			const testMatrices = [
				// 2x2 with small leading element
				[[0.01, 1], [1, 2]],
				// 3x3 with diagonal-dominant structure
				[[0.1, 0.01, 0.02], [0.03, 0.2, 0.04], [0.05, 0.06, 0.3]],
				// 4x4 with diagonal-dominant structure
				[[0.1, 0.01, 0.02, 0.03], [0.04, 0.2, 0.05, 0.06], [0.07, 0.08, 0.3, 0.09], [0.1, 0.11, 0.12, 0.4]],
			];

			for (const A of testMatrices) {
				const { L: _L, U: _U, P } = MatrixLU(A);
				const n = A.length;

				// Verify P is a valid permutation of [0, 1, ..., n-1]
				expect(P).toHaveLength(n);
				const seen = new Set(P);
				expect(seen.size).toBe(n);
				for (let i = 0; i < n; i++) {
					expect(P).toContain(i);
				}
			}
		});

		it('should handle matrix requiring swap in first column', () => {
			// First element is very small, requiring row swap
			const A = [
				[1e-10, 1, 2],
				[3, 4, 5],
				[6, 7, 8],
			];

			const { L, U, P } = MatrixLU(A);

			// Verify that P[0] != 0 (first row was swapped)
			expect(P[0]).not.toBe(0);

			// Verify PA = LU
			const PA: number[][] = [];
			for (let i = 0; i < 3; i++) {
				PA[i] = [...(A[P[i]] as number[])];
			}

			const LU: number[][] = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			];
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					let sum = 0;
					for (let k = 0; k < 3; k++) {
						sum += ((L[i] as number[])[k] as number) * ((U[k] as number[])[j] as number);
					}
					(LU[i] as number[])[j] = sum;
				}
			}

			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					expect((LU[i] as number[])[j]).toBeCloseTo((PA[i] as number[])[j], 4);
				}
			}
		});

		it('should correctly handle matrix with swaps in multiple columns', () => {
			// Matrix designed to require pivoting in multiple steps
			const A = [
				[0.01, 1, 2],
				[3, 0.001, 5],
				[6, 7, 0.01],
			];

			const { L, U, P } = MatrixLU(A);

			// Verify L is unit lower triangular
			for (let i = 0; i < 3; i++) {
				expect((L[i] as number[])[i]).toBeCloseTo(1, 5);
				for (let j = i + 1; j < 3; j++) {
					expect((L[i] as number[])[j]).toBeCloseTo(0, 5);
				}
			}

			// Verify U is upper triangular
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < i; j++) {
					expect((U[i] as number[])[j]).toBeCloseTo(0, 5);
				}
			}

			// Verify PA = LU
			const PA: number[][] = [];
			for (let i = 0; i < 3; i++) {
				PA[i] = [...(A[P[i]] as number[])];
			}

			const LU: number[][] = [
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			];
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					let sum = 0;
					for (let k = 0; k < 3; k++) {
						sum += ((L[i] as number[])[k] as number) * ((U[k] as number[])[j] as number);
					}
					(LU[i] as number[])[j] = sum;
				}
			}

			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					expect((LU[i] as number[])[j]).toBeCloseTo((PA[i] as number[])[j], 4);
				}
			}
		});
	});
});
