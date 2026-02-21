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
		it('computes LU decomposition for a 2x2 matrix', () => {
			const A = [
				[2, 1],
				[1, 1],
			];
			const { L, U } = MatrixLU(A);
			expect(L?.[0]?.[0]).toBeCloseTo(1);
			expect(L?.[1]?.[0]).toBeCloseTo(0.5);
			expect(L?.[1]?.[1]).toBeCloseTo(1);
			expect(U?.[0]?.[0]).toBeCloseTo(2);
			expect(U?.[0]?.[1]).toBeCloseTo(1);
			expect(U?.[1]?.[1]).toBeCloseTo(0.5);
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
});
