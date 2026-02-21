import { QuaternionIdentity, QuaternionEquals, QuaternionNormalize } from './core.js';
import { QuaternionRotationX, QuaternionRotationY, QuaternionRotationZ } from './predefined.js';
import { QuaternionError } from './asserts.js';
import { TQuaternion, IRotationMatrix } from './types.js';
import { IMatrix4 } from '../matrices/types.ts';
import { DegreesToRadians } from '../angles.ts';
import { IsValidRotationMatrix, QuaternionFromRotationMatrix, QuaternionFromTransformationMatrix, QuaternionToRotationMatrix, QuaternionToTransformationMatrix } from './conversions.js';
import { AssertMatrixRow, AssertMatrixValue } from '../matrices/asserts.ts';

describe('Quaternion Conversions', () => {
	const TOLERANCE = 1e-6;
	describe('QuaternionToRotationMatrix', () => {
		test('should convert identity quaternion to identity matrix', () => {
			const quaternion = QuaternionIdentity();
			const matrix = QuaternionToRotationMatrix(quaternion);

			const expectedMatrix: IRotationMatrix = [
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(matrix).toEqual(expectedMatrix);
		});

		test('should convert 90-degree rotation around X-axis', () => {
			const quaternion = QuaternionRotationX(DegreesToRadians(90));
			const matrix = QuaternionToRotationMatrix(quaternion);
			// 90° rotation around X should transform Y to Z and Z to -Y
			expect(matrix[0][0]).toBeCloseTo(1, 5);
			expect(matrix[0][1]).toBeCloseTo(0, 5);
			expect(matrix[0][2]).toBeCloseTo(0, 5);
			expect(matrix[1][0]).toBeCloseTo(0, 5);
			expect(matrix[1][1]).toBeCloseTo(0, 5);
			expect(matrix[1][2]).toBeCloseTo(-1, 5);
			expect(matrix[2][0]).toBeCloseTo(0, 5);
			expect(matrix[2][1]).toBeCloseTo(1, 5);
			expect(matrix[2][2]).toBeCloseTo(0, 5);
		});

		test('should convert 90-degree rotation around Y-axis', () => {
			const quaternion = QuaternionRotationY(DegreesToRadians(90));
			const matrix = QuaternionToRotationMatrix(quaternion);
			// 90° rotation around Y should transform X to -Z and Z to X
			expect(matrix[0][0]).toBeCloseTo(0, 5);
			expect(matrix[0][1]).toBeCloseTo(0, 5);
			expect(matrix[0][2]).toBeCloseTo(1, 5);
			expect(matrix[1][0]).toBeCloseTo(0, 5);
			expect(matrix[1][1]).toBeCloseTo(1, 5);
			expect(matrix[1][2]).toBeCloseTo(0, 5);
			expect(matrix[2][0]).toBeCloseTo(-1, 5);
			expect(matrix[2][1]).toBeCloseTo(0, 5);
			expect(matrix[2][2]).toBeCloseTo(0, 5);
		});

		test('should convert 90-degree rotation around Z-axis', () => {
			const quaternion = QuaternionRotationZ(DegreesToRadians(90));
			const matrix = QuaternionToRotationMatrix(quaternion);
			// 90° rotation around Z should transform X to Y and Y to -X
			expect(matrix[0][0]).toBeCloseTo(0, 5);
			expect(matrix[0][1]).toBeCloseTo(-1, 5);
			expect(matrix[0][2]).toBeCloseTo(0, 5);
			expect(matrix[1][0]).toBeCloseTo(1, 5);
			expect(matrix[1][1]).toBeCloseTo(0, 5);
			expect(matrix[1][2]).toBeCloseTo(0, 5);
			expect(matrix[2][0]).toBeCloseTo(0, 5);
			expect(matrix[2][1]).toBeCloseTo(0, 5);
			expect(matrix[2][2]).toBeCloseTo(1, 5);
		});

		test('should throw for non-normalized quaternion', () => {
			const nonNormalized: TQuaternion = [1, 1, 1, 1];
			expect(() => QuaternionToRotationMatrix(nonNormalized)).toThrow(QuaternionError);
		});
	});

	describe('QuaternionFromRotationMatrix', () => {
		test('should convert identity matrix to identity quaternion', () => {
			const identityMatrix: IRotationMatrix = [
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			];

			const quaternion = QuaternionFromRotationMatrix(identityMatrix);
			const expected = QuaternionIdentity();
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should convert 90-degree X rotation matrix', () => {
			const matrix: IRotationMatrix = [
				[1, 0, 0],
				[0, 0, -1],
				[0, 1, 0],
			];

			const quaternion = QuaternionFromRotationMatrix(matrix);
			const expected = QuaternionRotationX(DegreesToRadians(90));
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should convert 90-degree Y rotation matrix', () => {
			const matrix: IRotationMatrix = [
				[0, 0, 1],
				[0, 1, 0],
				[-1, 0, 0],
			];

			const quaternion = QuaternionFromRotationMatrix(matrix);
			const expected = QuaternionRotationY(DegreesToRadians(90));
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should convert 90-degree Z rotation matrix', () => {
			const matrix: IRotationMatrix = [
				[0, -1, 0],
				[1, 0, 0],
				[0, 0, 1],
			];

			const quaternion = QuaternionFromRotationMatrix(matrix);
			const expected = QuaternionRotationZ(DegreesToRadians(90));
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should handle matrix with largest diagonal element in different positions', () => {
			// Test case where m11 is largest
			const matrix: IRotationMatrix = [
				[0, 0, 1],
				[0, 1, 0],
				[-1, 0, 0],
			];

			const quaternion = QuaternionFromRotationMatrix(matrix);
			expect(quaternion).toHaveLength(4);
			expect(Math.abs(Math.sqrt((quaternion[0] ** 2) + (quaternion[1] ** 2) + (quaternion[2] ** 2) + (quaternion[3] ** 2)) - 1)).toBeLessThan(TOLERANCE);
		});

		test('should handle matrix with largest diagonal element m22', () => {
			// Test case where m22 is largest
			const matrix: IRotationMatrix = [
				[0, 1, 0],
				[-1, 0, 0],
				[0, 0, 1],
			];

			const quaternion = QuaternionFromRotationMatrix(matrix);
			expect(quaternion).toHaveLength(4);
			expect(Math.abs(Math.sqrt((quaternion[0] ** 2) + (quaternion[1] ** 2) + (quaternion[2] ** 2) + (quaternion[3] ** 2)) - 1)).toBeLessThan(TOLERANCE);
		});

		test('should throw for invalid matrix dimensions', () => {
			const invalidMatrix = [[1, 0], [0, 1]] as any;
			expect(() => QuaternionFromRotationMatrix(invalidMatrix)).toThrow();
		});
	});

	describe('QuaternionToTransformationMatrix', () => {
		test('should convert identity quaternion to 4x4 identity matrix', () => {
			const quaternion = QuaternionIdentity();
			const matrix4x4 = QuaternionToTransformationMatrix(quaternion);

			const expected: IMatrix4 = [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1],
			];
			expect(matrix4x4).toEqual(expected);
		});

		test('should convert rotation quaternion to 4x4 transformation matrix', () => {
			const quaternion = QuaternionRotationZ(DegreesToRadians(90));
			const matrix4x4 = QuaternionToTransformationMatrix(quaternion);
			// Should be a 4x4 matrix
			expect(matrix4x4).toHaveLength(4);
			expect(matrix4x4[0]).toHaveLength(4);

			// Last row should be [0, 0, 0, 1]
			expect(matrix4x4[3][0]).toBeCloseTo(0, 5);
			expect(matrix4x4[3][1]).toBeCloseTo(0, 5);
			expect(matrix4x4[3][2]).toBeCloseTo(0, 5);
			expect(matrix4x4[3][3]).toBeCloseTo(1, 5);

			// Translation elements should be 0
			expect(matrix4x4[0][3]).toBeCloseTo(0, 5);
			expect(matrix4x4[1][3]).toBeCloseTo(0, 5);
			expect(matrix4x4[2][3]).toBeCloseTo(0, 5);
		});

		test('should maintain rotation properties in 4x4 matrix', () => {
			const quaternion = QuaternionRotationX(DegreesToRadians(45));
			const matrix4x4 = QuaternionToTransformationMatrix(quaternion);

			// Extract 3x3 rotation part
			const rotationMatrix: IRotationMatrix = [
				[matrix4x4[0][0], matrix4x4[0][1], matrix4x4[0][2]],
				[matrix4x4[1][0], matrix4x4[1][1], matrix4x4[1][2]],
				[matrix4x4[2][0], matrix4x4[2][1], matrix4x4[2][2]],
			];
			expect(IsValidRotationMatrix(rotationMatrix)).toBe(true);
		});
	});

	describe('QuaternionFromTransformationMatrix', () => {
		test('should extract rotation from 4x4 identity matrix', () => {
			const matrix4x4: IMatrix4 = [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1],
			];

			const quaternion = QuaternionFromTransformationMatrix(matrix4x4);
			const expected = QuaternionIdentity();
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should extract rotation ignoring translation', () => {
			const matrix4x4: IMatrix4 = [
				[1, 0, 0, 5],   // Translation in X
				[0, 1, 0, 10],  // Translation in Y
				[0, 0, 1, 15],  // Translation in Z
				[0, 0, 0, 1],
			];

			const quaternion = QuaternionFromTransformationMatrix(matrix4x4);
			const expected = QuaternionIdentity();
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should extract rotation with translation present', () => {
			// Create a Z-rotation matrix with translation
			const cos90 = Math.cos(DegreesToRadians(90));
			const sin90 = Math.sin(DegreesToRadians(90));

			const matrix4x4: IMatrix4 = [
				[cos90, -sin90, 0, 100],
				[sin90, cos90, 0, 200],
				[0, 0, 1, 300],
				[0, 0, 0, 1],
			];

			const quaternion = QuaternionFromTransformationMatrix(matrix4x4);
			const expected = QuaternionRotationZ(DegreesToRadians(90));
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should throw for invalid matrix structure', () => {
			const invalidMatrix = [[1, 0], [0, 1]] as any;
			expect(() => QuaternionFromTransformationMatrix(invalidMatrix)).toThrow();
		});
	});

	describe('IsValidRotationMatrix', () => {
		test('should validate identity matrix', () => {
			const identityMatrix: IRotationMatrix = [
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(identityMatrix)).toBe(true);
		});

		test('should validate proper rotation matrices', () => {
			// 90-degree rotation around Z-axis
			const rotationZ: IRotationMatrix = [
				[0, -1, 0],
				[1, 0, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(rotationZ)).toBe(true);
		});

		test('should reject non-orthogonal matrix', () => {
			const nonOrthogonal: IRotationMatrix = [
				[1, 1, 0],  // Not orthogonal
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(nonOrthogonal)).toBe(false);
		});

		test('should reject matrix with non-unit column vectors', () => {
			const nonUnit: IRotationMatrix = [
				[2, 0, 0],  // Column 1 has length 2, not 1
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(nonUnit)).toBe(false);
		});

		test('should reject matrix with determinant -1 (reflection)', () => {
			const reflection: IRotationMatrix = [
				[-1, 0, 0],  // Reflection, det = -1
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(reflection)).toBe(false);
		});

		test('should respect custom tolerance', () => {
			const almostValid: IRotationMatrix = [
				[1.0001, 0, 0],  // Slightly off from 1
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(almostValid, 1e-6)).toBe(false);
			expect(IsValidRotationMatrix(almostValid, 1e-3)).toBe(true);
		});

		test('should validate complex rotation matrix', () => {
			// 45-degree rotation around Y-axis
			const cos45 = Math.cos(DegreesToRadians(45));
			const sin45 = Math.sin(DegreesToRadians(45));

			const rotationY: IRotationMatrix = [
				[cos45, 0, sin45],
				[0, 1, 0],
				[-sin45, 0, cos45],
			];
			expect(IsValidRotationMatrix(rotationY)).toBe(true);
		});
	});

	describe('Round-trip conversions', () => {
		test('quaternion -> matrix -> quaternion should preserve rotation', () => {
			const originalQuaternion = QuaternionRotationX(DegreesToRadians(45));
			const matrix = QuaternionToRotationMatrix(originalQuaternion);
			const convertedQuaternion = QuaternionFromRotationMatrix(matrix);
			expect(QuaternionEquals(originalQuaternion, convertedQuaternion, TOLERANCE, true)).toBe(true);
		});

		test('matrix -> quaternion -> matrix should preserve matrix', () => {
			const originalMatrix: IRotationMatrix = [
				[0, -1, 0],
				[1, 0, 0],
				[0, 0, 1],
			];

			const quaternion = QuaternionFromRotationMatrix(originalMatrix);
			const convertedMatrix = QuaternionToRotationMatrix(quaternion);

			// Compare each element
			for (let i = 0; i < 3; i++) {
				const originalRow = originalMatrix[i];
				AssertMatrixRow(originalRow);

				const convertedRow = convertedMatrix[i];
				AssertMatrixRow(convertedRow);

				for (let j = 0; j < 3; j++) {
					const originalValue = originalRow[j];
					AssertMatrixValue(originalValue);

					const convertedValue = convertedRow[j];
					AssertMatrixValue(convertedValue);
					expect(convertedValue).toBeCloseTo(originalValue, 5);
				}
			}
		});

		test('quaternion -> 4x4 matrix -> quaternion should preserve rotation', () => {
			const originalQuaternion = QuaternionRotationY(DegreesToRadians(60));
			const matrix4x4 = QuaternionToTransformationMatrix(originalQuaternion);
			const convertedQuaternion = QuaternionFromTransformationMatrix(matrix4x4);
			expect(QuaternionEquals(originalQuaternion, convertedQuaternion, TOLERANCE, true)).toBe(true);
		});
	});

	describe('Edge cases and error conditions', () => {
		test('should handle zero quaternion input for conversion functions', () => {
			const zeroQuaternion: TQuaternion = [0, 0, 0, 0];
			expect(() => QuaternionToRotationMatrix(zeroQuaternion)).toThrow(QuaternionError);
		});

		test('should handle very small quaternion components', () => {
			const smallQuaternion = QuaternionNormalize([1e-10, 1e-10, 1e-10, 1e-10]);
			const matrix = QuaternionToRotationMatrix(smallQuaternion);
			const convertedBack = QuaternionFromRotationMatrix(matrix);
			expect(QuaternionEquals(smallQuaternion, convertedBack, TOLERANCE, true)).toBe(true);
		});

		test('should handle matrices from known quaternion conversions', () => {
			// Test all the branch conditions in QuaternionFromRotationMatrix
			const testQuaternions = [
				QuaternionRotationX(DegreesToRadians(30)),
				QuaternionRotationY(DegreesToRadians(60)),
				QuaternionRotationZ(DegreesToRadians(120)),
				QuaternionNormalize([0.5, 0.5, 0.5, 0.5]),
			];

			for (const quaternion of testQuaternions) {
				const matrix = QuaternionToRotationMatrix(quaternion);
				const convertedBack = QuaternionFromRotationMatrix(matrix);
				expect(QuaternionEquals(quaternion, convertedBack, TOLERANCE, true)).toBe(true);
			}
		});
	});
});
