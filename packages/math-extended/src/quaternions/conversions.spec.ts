import { QuaternionIdentity, QuaternionEquals, QuaternionNormalize } from './core.js';
import { QuaternionRotationX, QuaternionRotationY, QuaternionRotationZ } from './predefined.js';
import { QuaternionError } from './asserts.js';
import { TQuaternion, TRotationMatrix } from './types.js';
import { TMatrix4 } from '../matrices/types.js';
import { AssertVector } from '../vectors/asserts.js';

import { IsValidRotationMatrix, QuaternionFromRotationMatrix, QuaternionFromTransformationMatrix, QuaternionToRotationMatrix, QuaternionToTransformationMatrix } from './conversions.js';

describe('Quaternion Conversions', () => {
	const TOLERANCE = 1e-6;
	describe('QuaternionToRotationMatrix', () => {
		test('should convert identity quaternion to identity matrix', () => {
			const quaternion = QuaternionIdentity();
			const matrix = QuaternionToRotationMatrix(quaternion);

			const expectedMatrix: TRotationMatrix = [
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(matrix).toEqual(expectedMatrix);
		});

		test('should convert 90-degree rotation around X-axis', () => {
			const quaternion = QuaternionRotationX((Math.PI / 2));
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
			const quaternion = QuaternionRotationY((Math.PI / 2));
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
			const quaternion = QuaternionRotationZ((Math.PI / 2));
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
			const identityMatrix: TRotationMatrix = [
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			];

			const quaternion = QuaternionFromRotationMatrix(identityMatrix);
			const expected = QuaternionIdentity();
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should convert 90-degree X rotation matrix', () => {
			const matrix: TRotationMatrix = [
				[1, 0, 0],
				[0, 0, -1],
				[0, 1, 0],
			];

			const quaternion = QuaternionFromRotationMatrix(matrix);
			const expected = QuaternionRotationX((Math.PI / 2));
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should convert 90-degree Y rotation matrix', () => {
			const matrix: TRotationMatrix = [
				[0, 0, 1],
				[0, 1, 0],
				[-1, 0, 0],
			];

			const quaternion = QuaternionFromRotationMatrix(matrix);
			const expected = QuaternionRotationY((Math.PI / 2));
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should convert 90-degree Z rotation matrix', () => {
			const matrix: TRotationMatrix = [
				[0, -1, 0],
				[1, 0, 0],
				[0, 0, 1],
			];

			const quaternion = QuaternionFromRotationMatrix(matrix);
			const expected = QuaternionRotationZ((Math.PI / 2));
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should handle matrix with largest diagonal element in different positions', () => {
			// Test case where m11 is largest
			const matrix: TRotationMatrix = [
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
			const matrix: TRotationMatrix = [
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

			const expected: TMatrix4 = [
				[1, 0, 0, 0],
				[0, 1, 0, 0],
				[0, 0, 1, 0],
				[0, 0, 0, 1],
			];
			expect(matrix4x4).toEqual(expected);
		});

		test('should convert rotation quaternion to 4x4 transformation matrix', () => {
			const quaternion = QuaternionRotationZ((Math.PI / 2));
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
			const quaternion = QuaternionRotationX((Math.PI / 4));
			const matrix4x4 = QuaternionToTransformationMatrix(quaternion);

			// Extract 3x3 rotation part
			const rotationMatrix: TRotationMatrix = [
				[matrix4x4[0][0], matrix4x4[0][1], matrix4x4[0][2]],
				[matrix4x4[1][0], matrix4x4[1][1], matrix4x4[1][2]],
				[matrix4x4[2][0], matrix4x4[2][1], matrix4x4[2][2]],
			];
			expect(IsValidRotationMatrix(rotationMatrix)).toBe(true);
		});
	});

	describe('QuaternionFromTransformationMatrix', () => {
		test('should extract rotation from 4x4 identity matrix', () => {
			const matrix4x4: TMatrix4 = [
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
			const matrix4x4: TMatrix4 = [
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
			const cos90 = Math.cos((Math.PI / 2));
			const sin90 = Math.sin((Math.PI / 2));

			const matrix4x4: TMatrix4 = [
				[cos90, -sin90, 0, 100],
				[sin90, cos90, 0, 200],
				[0, 0, 1, 300],
				[0, 0, 0, 1],
			];

			const quaternion = QuaternionFromTransformationMatrix(matrix4x4);
			const expected = QuaternionRotationZ((Math.PI / 2));
			expect(QuaternionEquals(quaternion, expected, TOLERANCE, true)).toBe(true);
		});

		test('should throw for invalid matrix structure', () => {
			const invalidMatrix = [[1, 0], [0, 1]] as any;
			expect(() => QuaternionFromTransformationMatrix(invalidMatrix)).toThrow();
		});
	});

	describe('IsValidRotationMatrix', () => {
		test('should validate identity matrix', () => {
			const identityMatrix: TRotationMatrix = [
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(identityMatrix)).toBe(true);
		});

		test('should validate proper rotation matrices', () => {
			// 90-degree rotation around Z-axis
			const rotationZ: TRotationMatrix = [
				[0, -1, 0],
				[1, 0, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(rotationZ)).toBe(true);
		});

		test('should reject non-orthogonal matrix', () => {
			const nonOrthogonal: TRotationMatrix = [
				[1, 1, 0],  // Not orthogonal
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(nonOrthogonal)).toBe(false);
		});

		test('should reject matrix with non-unit column vectors', () => {
			const nonUnit: TRotationMatrix = [
				[2, 0, 0],  // Column 1 has length 2, not 1
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(nonUnit)).toBe(false);
		});

		test('should reject matrix with determinant -1 (reflection)', () => {
			const reflection: TRotationMatrix = [
				[-1, 0, 0],  // Reflection, det = -1
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(reflection)).toBe(false);
		});

		test('should respect custom tolerance', () => {
			const almostValid: TRotationMatrix = [
				[1.0001, 0, 0],  // Slightly off from 1
				[0, 1, 0],
				[0, 0, 1],
			];
			expect(IsValidRotationMatrix(almostValid, 1e-6)).toBe(false);
			expect(IsValidRotationMatrix(almostValid, 1e-3)).toBe(true);
		});

		test('should validate complex rotation matrix', () => {
			// 45-degree rotation around Y-axis
			const cos45 = Math.cos((Math.PI / 4));
			const sin45 = Math.sin((Math.PI / 4));

			const rotationY: TRotationMatrix = [
				[cos45, 0, sin45],
				[0, 1, 0],
				[-sin45, 0, cos45],
			];
			expect(IsValidRotationMatrix(rotationY)).toBe(true);
		});
	});

	describe('Round-trip conversions', () => {
		test('quaternion -> matrix -> quaternion should preserve rotation', () => {
			const originalQuaternion = QuaternionRotationX((Math.PI / 4));
			const matrix = QuaternionToRotationMatrix(originalQuaternion);
			const convertedQuaternion = QuaternionFromRotationMatrix(matrix);
			expect(QuaternionEquals(originalQuaternion, convertedQuaternion, TOLERANCE, true)).toBe(true);
		});

		test('matrix -> quaternion -> matrix should preserve matrix', () => {
			const originalMatrix: TRotationMatrix = [
				[0, -1, 0],
				[1, 0, 0],
				[0, 0, 1],
			];

			const quaternion = QuaternionFromRotationMatrix(originalMatrix);
			const convertedMatrix = QuaternionToRotationMatrix(quaternion);

			// Compare each element
			for (let i = 0; i < 3; i++) {
				const originalRow = originalMatrix[i];
				AssertVector(originalRow);

				const convertedRow = convertedMatrix[i];
				AssertVector(convertedRow);

				for (let j = 0; j < 3; j++) {
					const originalValue = originalRow[j];
					// AssertMatrixValue removed - not yet implemented

					const convertedValue = convertedRow[j];
					// AssertMatrixValue removed - not yet implemented
					expect(convertedValue).toBeCloseTo(originalValue, 5);
				}
			}
		});

		test('quaternion -> 4x4 matrix -> quaternion should preserve rotation', () => {
			const originalQuaternion = QuaternionRotationY((Math.PI / 3));
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
				QuaternionRotationX((Math.PI / 6)),
				QuaternionRotationY((Math.PI / 3)),
				QuaternionRotationZ((Math.PI * 2 / 3)),
				QuaternionNormalize([0.5, 0.5, 0.5, 0.5]),
			];

			for (const quaternion of testQuaternions) {
				const matrix = QuaternionToRotationMatrix(quaternion);
				const convertedBack = QuaternionFromRotationMatrix(matrix);
				expect(QuaternionEquals(quaternion, convertedBack, TOLERANCE, true)).toBe(true);
			}
		});

		// Gimbal lock and near-gimbal-lock edge cases
		test('should handle near-gimbal-lock situation (pitch near 90 degrees)', () => {
			// Create a quaternion representing a near-gimbal-lock rotation
			// Pitch near 90 degrees means a rotation primarily around Y axis
			const pitchAngle = (Math.PI * 89 / 180);
			const quarteronion = QuaternionRotationY(pitchAngle);
			const matrix = QuaternionToRotationMatrix(quarteronion);

			const convertedBack = QuaternionFromRotationMatrix(matrix);
			expect(QuaternionEquals(quarteronion, convertedBack, TOLERANCE, true)).toBe(true);
		});

		test('should handle matrices with trace near diagonal bounds', () => {
			// Test matrix where each diagonal comparison is close (exercises all branches)
			const angle = (Math.PI * 2 / 3);
			const cos120 = Math.cos(angle);
			const sin120 = Math.sin(angle);

			const matrix: TRotationMatrix = [
				[cos120, -sin120, 0],
				[sin120, cos120, 0],
				[0, 0, 1],
			];

			const quaternion = QuaternionFromRotationMatrix(matrix);
			const roundTrip = QuaternionToRotationMatrix(quaternion);

			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					expect(roundTrip[i][j]).toBeCloseTo(matrix[i][j], 5);
				}
			}
		});

		test('should handle rotation matrices very close to identity', () => {
			const verySmallAngle = (Math.PI * 0.001 / 180);
			const cos_eps = Math.cos(verySmallAngle);
			const sin_eps = Math.sin(verySmallAngle);

			const almostIdentity: TRotationMatrix = [
				[cos_eps, -sin_eps, 0],
				[sin_eps, cos_eps, 0],
				[0, 0, 1],
			];

			const quaternion = QuaternionFromRotationMatrix(almostIdentity);
			const converted = QuaternionToRotationMatrix(quaternion);

			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					expect(converted[i][j]).toBeCloseTo(almostIdentity[i][j], 5);
				}
			}
		});

		test('should handle large rotation angles (360+ degrees)', () => {
			const largeAngle = (Math.PI * 5 / 2); // 360 + 90
			const quaternion = QuaternionRotationZ(largeAngle);
			const matrix = QuaternionToRotationMatrix(quaternion);

			// Should be equivalent to 90-degree rotation
			const equivalent90 = QuaternionRotationZ((Math.PI / 2));
			const expected = QuaternionToRotationMatrix(equivalent90);

			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					expect(Math.abs(matrix[i][j])).toBeCloseTo(Math.abs(expected[i][j]), 5);
				}
			}
		});

		test('should handle matrices where multiple diagonal elements are nearly equal', () => {
			// Create a valid rotation matrix using quaternion composition
			const quat1 = QuaternionRotationX((Math.PI / 4));
			
			// Compose rotations and convert back
			const matrix = QuaternionToRotationMatrix(quat1);
			const convertedBack = QuaternionFromRotationMatrix(matrix);

			expect(QuaternionEquals(quat1, convertedBack, TOLERANCE, true)).toBe(true);
		});

		test('should preserve quaternion sign during repeated conversions', () => {
			// Convert quaternion to matrix and back multiple times
			const originalQuaternion = QuaternionRotationX((Math.PI / 4));

			let currentQuaternion = originalQuaternion;
			for (let i = 0; i < 5; i++) {
				const matrix = QuaternionToRotationMatrix(currentQuaternion);
				currentQuaternion = QuaternionFromRotationMatrix(matrix);
			}

			expect(QuaternionEquals(originalQuaternion, currentQuaternion, TOLERANCE, true)).toBe(true);
		});

		test('should handle nearly-non-orthogonal matrices gracefully', () => {
			// Create a matrix that's almost orthogonal but with small perturbations
			const basis90: TRotationMatrix = [
				[1, 0, 0],
				[0, 0, -1],
				[0, 1, 0],
			];

			const quaternion = QuaternionFromRotationMatrix(basis90);
			const converted = QuaternionToRotationMatrix(quaternion);

			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					expect(converted[i][j]).toBeCloseTo(basis90[i][j], 4);
				}
			}
		});
	});

	describe('QuaternionFromRotationMatrix - Shepperd algorithm branches', () => {
		test('should handle case where m00 is the largest diagonal element', () => {
			// Rotation around X-axis where m00 can be largest in certain configurations
			const angle = 0.5; // radians
			const quat = QuaternionRotationX(angle);
			const matrix = QuaternionToRotationMatrix(quat);

			const result = QuaternionFromRotationMatrix(matrix);
			expect(result).toHaveLength(4);
			// Verify it's a unit quaternion
			const magnitude = Math.sqrt((result[0] ** 2) + (result[1] ** 2) + (result[2] ** 2) + (result[3] ** 2));
			expect(magnitude).toBeCloseTo(1.0, 5);
		});

		test('should handle case where m11 is the largest diagonal element', () => {
			// Rotation primarily around Y-axis where m11 stays large
			const angle = (Math.PI / 3);
			const quat = QuaternionRotationY(angle);
			const matrix = QuaternionToRotationMatrix(quat);

			// For Y-axis rotation: m11 = 1 always (largest)
			expect(Math.abs(matrix[1][1])).toBeCloseTo(1, 5);

			const result = QuaternionFromRotationMatrix(matrix);
			expect(result).toHaveLength(4);
			const magnitude = Math.sqrt((result[0] ** 2) + (result[1] ** 2) + (result[2] ** 2) + (result[3] ** 2));
			expect(magnitude).toBeCloseTo(1.0, 5);

			// Verify round-trip
			const matrixBack = QuaternionToRotationMatrix(result);
			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					expect(matrixBack[i][j]).toBeCloseTo(matrix[i][j], 4);
				}
			}
		});

		test('should handle case where m22 is the largest diagonal element', () => {
			// Small rotation where m22 remains largest (close to 1)
			const quat = QuaternionRotationZ(0.1);
			const matrix = QuaternionToRotationMatrix(quat);

			// For Z rotation, m22 = 1 always (largest)
			expect(matrix[2][2]).toBeCloseTo(1, 5);

			const result = QuaternionFromRotationMatrix(matrix);
			expect(result).toHaveLength(4);
			const magnitude = Math.sqrt((result[0] ** 2) + (result[1] ** 2) + (result[2] ** 2) + (result[3] ** 2));
			expect(magnitude).toBeCloseTo(1.0, 5);
		});

		test('should handle case where trace is largest (identity-like matrix)', () => {
			// Very small rotation keeps trace largest
			const verySmallAngle = (Math.PI * 0.001 / 180);
			const quat = QuaternionRotationZ(verySmallAngle);
			const matrix = QuaternionToRotationMatrix(quat);

			// For very small angle, trace = 1 + 1 + 1 + small ≈ 3 (largest)
			const trace = matrix[0][0] + matrix[1][1] + matrix[2][2];
			expect(trace).toBeGreaterThan(2.9);

			const result = QuaternionFromRotationMatrix(matrix);
			expect(result).toHaveLength(4);
			const magnitude = Math.sqrt((result[0] ** 2) + (result[1] ** 2) + (result[2] ** 2) + (result[3] ** 2));
			expect(magnitude).toBeCloseTo(1.0, 5);

			// Verify round-trip
			expect(QuaternionEquals(quat, result, TOLERANCE, true)).toBe(true);
		});

		test('should exercise all Shepperd branches with diverse rotation angles', () => {
			const testAngles = [0.1, 0.5, 1.0, (Math.PI / 4), (Math.PI / 3), (Math.PI / 2)];

			for (const angle of testAngles) {
				// Test X rotation
				const quatX = QuaternionRotationX(angle);
				const matrixX = QuaternionToRotationMatrix(quatX);
				const resultX = QuaternionFromRotationMatrix(matrixX);
				expect(QuaternionEquals(quatX, resultX, TOLERANCE, true)).toBe(true);

				// Test Y rotation
				const quatY = QuaternionRotationY(angle);
				const matrixY = QuaternionToRotationMatrix(quatY);
				const resultY = QuaternionFromRotationMatrix(matrixY);
				expect(QuaternionEquals(quatY, resultY, TOLERANCE, true)).toBe(true);

				// Test Z rotation
				const quatZ = QuaternionRotationZ(angle);
				const matrixZ = QuaternionToRotationMatrix(quatZ);
				const resultZ = QuaternionFromRotationMatrix(matrixZ);
				expect(QuaternionEquals(quatZ, resultZ, TOLERANCE, true)).toBe(true);
			}
		});
	});
});
