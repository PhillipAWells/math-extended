import {
	MatrixRotation2D,
	MatrixRotation3DRoll,
	MatrixRotation3DPitch,
	MatrixRotation3DYaw,
	MatrixRotation3D,
	MatrixRotation3DEulerAngles,
	MatrixScale2D,
	MatrixScale3D,
	MatrixTranslation2D,
	MatrixTranslation3D,
	MatrixTransform2D,
	MatrixTransform3D,
	MatrixDirection3D,
	MatrixView,
	MatrixPerspective,
	MatrixOrthographic,
} from './transformations.js';
import { DegreesToRadians } from '../angles.ts';
import { AssertMatrixRow, AssertMatrixValue } from './asserts.js';
import { MatrixIdentity } from './core.js';
import { IMatrix3, IMatrix4 } from './types.js';
import { VectorMagnitude } from '../vectors/core.ts';
import { TVector2, TVector3 } from '../vectors/types.ts';

describe('Matrix Transformations', () => {
	// Helper function to check if matrices are approximately equal
	function expectMatrixToBeCloseTo(actual: number[][], expected: number[][], precision = 5): void {
		expect(actual.length).toBe(expected.length);

		for (let i = 0; i < actual.length; i++) {
			const actualRow = actual[i];
			expect(actualRow).toBeDefined();
			AssertMatrixRow(actualRow);

			const expectedRow = expected[i];
			expect(expectedRow).toBeDefined();
			AssertMatrixRow(expectedRow);

			const actualRowLength = actualRow.length;
			const expectedRowLength = expectedRow.length;
			expect(actualRowLength).toBe(expectedRowLength);

			for (let j = 0; j < actualRow.length; j++) {
				const actualValue = actualRow[j];
				AssertMatrixValue(actualValue);

				const expectedValue = expectedRow[j];
				AssertMatrixValue(expectedValue);

				expect(actualValue).toBeCloseTo(expectedValue, precision);
			}
		}
	}

	describe('2D Rotation', () => {
		describe('MatrixRotation2D', () => {
			test('should create identity matrix for 0 radians', () => {
				const matrix = MatrixRotation2D(0);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0],
					[0, 1, 0],
					[0, 0, 1],
				]);
			});

			test('should create 90-degree rotation matrix', () => {
				const matrix = MatrixRotation2D(Math.PI / 2);
				expectMatrixToBeCloseTo(matrix, [
					[0, -1, 0],
					[1, 0, 0],
					[0, 0, 1],
				]);
			});

			test('should create 180-degree rotation matrix', () => {
				const matrix = MatrixRotation2D(Math.PI);
				expectMatrixToBeCloseTo(matrix, [
					[-1, 0, 0],
					[0, -1, 0],
					[0, 0, 1],
				]);
			});

			test('should create 270-degree rotation matrix', () => {
				const matrix = MatrixRotation2D(3 * Math.PI / 2);
				expectMatrixToBeCloseTo(matrix, [
					[0, 1, 0],
					[-1, 0, 0],
					[0, 0, 1],
				]);
			});

			test('should handle negative angles', () => {
				const matrix = MatrixRotation2D(-Math.PI / 2);
				expectMatrixToBeCloseTo(matrix, [
					[0, 1, 0],
					[-1, 0, 0],
					[0, 0, 1],
				]);
			});

			test('should throw for invalid input', () => {
				// @ts-expect-error Argument of type 'string' is not assignable to parameter of type 'number'. This should throw at runtime.
				expect(() => MatrixRotation2D('invalid')).toThrow('Rotation angle must be a number');
				expect(() => MatrixRotation2D(NaN)).toThrow('Rotation angle must be a number');
				expect(() => MatrixRotation2D(Infinity)).toThrow('Rotation angle must be a number');
			});
		});
	});

	describe('3D Rotations', () => {
		describe('MatrixRotation3DRoll', () => {
			test('should create identity matrix for 0 radians', () => {
				const matrix = MatrixRotation3DRoll(0);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should create 90-degree roll rotation', () => {
				const matrix = MatrixRotation3DRoll(Math.PI / 2);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 0],
					[0, 0, -1, 0],
					[0, 1, 0, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should throw for invalid input', () => {
				expect(() => MatrixRotation3DRoll(NaN)).toThrow('Rotation angle must be a number');
			});
		});

		describe('MatrixRotation3DPitch', () => {
			test('should create identity matrix for 0 radians', () => {
				const matrix = MatrixRotation3DPitch(0);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should create 90-degree pitch rotation', () => {
				const matrix = MatrixRotation3DPitch(Math.PI / 2);
				expectMatrixToBeCloseTo(matrix, [
					[0, 0, 1, 0],
					[0, 1, 0, 0],
					[-1, 0, 0, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should throw for invalid input', () => {
				expect(() => MatrixRotation3DPitch(NaN)).toThrow('Rotation angle must be a number');
			});
		});

		describe('MatrixRotation3DYaw', () => {
			test('should create identity matrix for 0 radians', () => {
				const matrix = MatrixRotation3DYaw(0);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should create 90-degree yaw rotation', () => {
				const matrix = MatrixRotation3DYaw(Math.PI / 2);
				expectMatrixToBeCloseTo(matrix, [
					[0, -1, 0, 0],
					[1, 0, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should throw for invalid input', () => {
				expect(() => MatrixRotation3DYaw(NaN)).toThrow('Rotation angle must be a number');
			});
		});

		describe('MatrixRotation3D', () => {
			test('should create identity matrix for zero rotation', () => {
				const matrix = MatrixRotation3D(0, 0, 0);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should handle single axis rotations', () => {
				const rollMatrix = MatrixRotation3D(Math.PI / 2, 0, 0);
				const expectedRoll = MatrixRotation3DRoll(Math.PI / 2);
				expectMatrixToBeCloseTo(rollMatrix, expectedRoll);

				const pitchMatrix = MatrixRotation3D(0, Math.PI / 2, 0);
				const expectedPitch = MatrixRotation3DPitch(Math.PI / 2);
				expectMatrixToBeCloseTo(pitchMatrix, expectedPitch);

				const yawMatrix = MatrixRotation3D(0, 0, Math.PI / 2);
				const expectedYaw = MatrixRotation3DYaw(Math.PI / 2);
				expectMatrixToBeCloseTo(yawMatrix, expectedYaw);
			});

			test('should create complex rotation with all axes', () => {
				const matrix = MatrixRotation3D(
					DegreesToRadians(60),
					DegreesToRadians(30),
					DegreesToRadians(45),
				);
				// Matrix should not be identity
				expect(matrix).not.toEqual([
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);

				// Should be a proper rotation matrix (orthogonal with determinant 1)
				// Basic check: bottom row should be [0, 0, 0, 1]
				expectMatrixToBeCloseTo([matrix[3]], [[0, 0, 0, 1]]);
			});

			test('should handle vector input', () => {
				const eulerAngles: TVector3 = [Math.PI / 4, Math.PI / 6, Math.PI / 3];
				const matrix = MatrixRotation3D(eulerAngles);
				const expected = MatrixRotation3D(Math.PI / 4, Math.PI / 6, Math.PI / 3);
				expectMatrixToBeCloseTo(matrix, expected);
			});
		});

		describe('MatrixRotation3DEulerAngles', () => {
			test('should convert degrees to radians and create rotation matrix', () => {
				const matrix = MatrixRotation3DEulerAngles(60, 30, 45);
				const expected = MatrixRotation3D(
					DegreesToRadians(60),
					DegreesToRadians(30),
					DegreesToRadians(45),
				);
				expectMatrixToBeCloseTo(matrix, expected);
			});

			test('should handle zero degrees', () => {
				const matrix = MatrixRotation3DEulerAngles(0, 0, 0);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);
			});
		});
	});

	describe('Scaling Transformations', () => {
		describe('Matrix_Transformation_Scale2D', () => {
			test('should create identity scale for (1, 1)', () => {
				const matrix = MatrixScale2D(1, 1);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0],
					[0, 1, 0],
					[0, 0, 1],
				]);
			});

			test('should create proper scale matrix', () => {
				const matrix = MatrixScale2D(2, 3);
				expectMatrixToBeCloseTo(matrix, [
					[2, 0, 0],
					[0, 3, 0],
					[0, 0, 1],
				]);
			});

			test('should handle negative scaling (flipping)', () => {
				const matrix = MatrixScale2D(-1, 1);
				expectMatrixToBeCloseTo(matrix, [
					[-1, 0, 0],
					[0, 1, 0],
					[0, 0, 1],
				]);
			});

			test('should handle zero scaling', () => {
				const matrix = MatrixScale2D(0, 1);
				expectMatrixToBeCloseTo(matrix, [
					[0, 0, 0],
					[0, 1, 0],
					[0, 0, 1],
				]);
			});
		});

		describe('Matrix_Transformation_Scale3D', () => {
			test('should create identity scale for (1, 1, 1)', () => {
				const matrix = MatrixScale3D(1, 1, 1);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should create proper 3D scale matrix', () => {
				const matrix = MatrixScale3D(2, 3, 4);
				expectMatrixToBeCloseTo(matrix, [
					[2, 0, 0, 0],
					[0, 3, 0, 0],
					[0, 0, 4, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should handle negative scaling', () => {
				const matrix = MatrixScale3D(-1, -1, -1);
				expectMatrixToBeCloseTo(matrix, [
					[-1, 0, 0, 0],
					[0, -1, 0, 0],
					[0, 0, -1, 0],
					[0, 0, 0, 1],
				]);
			});
		});
	});

	describe('Scale Transformations', () => {
		describe('MatrixScale2D', () => {
			test('should create uniform scale matrix', () => {
				const matrix = MatrixScale2D(2);
				expectMatrixToBeCloseTo(matrix, [
					[2, 0, 0],
					[0, 2, 0],
					[0, 0, 1],
				]);
			});

			test('should create identity for scale 1', () => {
				const matrix = MatrixScale2D(1);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0],
					[0, 1, 0],
					[0, 0, 1],
				]);
			});

			test('should create independent scale matrix', () => {
				const matrix = MatrixScale2D(2, 3);
				expectMatrixToBeCloseTo(matrix, [
					[2, 0, 0],
					[0, 3, 0],
					[0, 0, 1],
				]);
			});

			test('should handle vector input', () => {
				const scaleVector: TVector2 = [2, 3];
				const matrix = MatrixScale2D(scaleVector);
				expectMatrixToBeCloseTo(matrix, [
					[2, 0, 0],
					[0, 3, 0],
					[0, 0, 1],
				]);
			});

			test('should handle negative scaling (flipping)', () => {
				const matrix = MatrixScale2D(-1, 1);
				expectMatrixToBeCloseTo(matrix, [
					[-1, 0, 0],
					[0, 1, 0],
					[0, 0, 1],
				]);
			});
		});

		describe('MatrixScale3D', () => {
			test('should create uniform scale matrix', () => {
				const matrix = MatrixScale3D(2);
				expectMatrixToBeCloseTo(matrix, [
					[2, 0, 0, 0],
					[0, 2, 0, 0],
					[0, 0, 2, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should create identity for scale 1', () => {
				const matrix = MatrixScale3D(1);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should create independent scale matrix', () => {
				const matrix = MatrixScale3D(2, 3, 4);
				expectMatrixToBeCloseTo(matrix, [
					[2, 0, 0, 0],
					[0, 3, 0, 0],
					[0, 0, 4, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should handle vector input', () => {
				const scaleVector: TVector3 = [2, 3, 4];
				const matrix = MatrixScale3D(scaleVector);
				expectMatrixToBeCloseTo(matrix, [
					[2, 0, 0, 0],
					[0, 3, 0, 0],
					[0, 0, 4, 0],
					[0, 0, 0, 1],
				]);
			});
		});
	});

	describe('Translation Transformations', () => {
		describe('MatrixTranslation2D', () => {
			test('should create identity for zero translation', () => {
				const matrix = MatrixTranslation2D(0, 0);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0],
					[0, 1, 0],
					[0, 0, 1],
				]);
			});

			test('should create proper translation matrix', () => {
				const matrix = MatrixTranslation2D(5, 7);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 5],
					[0, 1, 7],
					[0, 0, 1],
				]);
			});

			test('should handle negative translation', () => {
				const matrix = MatrixTranslation2D(-3, -4);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, -3],
					[0, 1, -4],
					[0, 0, 1],
				]);
			});
		});

		describe('MatrixTranslation3D', () => {
			test('should create identity for zero translation', () => {
				const matrix = MatrixTranslation3D(0, 0, 0);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should create proper 3D translation matrix', () => {
				const matrix = MatrixTranslation3D(1, 2, 3);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 1],
					[0, 1, 0, 2],
					[0, 0, 1, 3],
					[0, 0, 0, 1],
				]);
			});

			test('should handle uniform translation', () => {
				const matrix = MatrixTranslation3D(5);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 5],
					[0, 1, 0, 5],
					[0, 0, 1, 5],
					[0, 0, 0, 1],
				]);
			});

			test('should handle vector input', () => {
				const translationVector: TVector3 = [1, 2, 3];
				const matrix = MatrixTranslation3D(translationVector[0], translationVector[1], translationVector[2]);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, 1],
					[0, 1, 0, 2],
					[0, 0, 1, 3],
					[0, 0, 0, 1],
				]);
			});

			test('should handle negative translation', () => {
				const matrix = MatrixTranslation3D(-5, -10, -15);
				expectMatrixToBeCloseTo(matrix, [
					[1, 0, 0, -5],
					[0, 1, 0, -10],
					[0, 0, 1, -15],
					[0, 0, 0, 1],
				]);
			});
		});
	});

	describe('Vector Transformations', () => {
		describe('MatrixTransform2D', () => {
			test('should transform vector with identity matrix', () => {
				const identity = MatrixIdentity(3);
				const vector: TVector2 = [3, 4];
				const result = MatrixTransform2D(vector, identity);
				expect(result[0]).toBeCloseTo(3);
				expect(result[1]).toBeCloseTo(4);
			});

			test('should transform vector with translation', () => {
				const translation = MatrixTranslation2D(2, 3);
				const vector: TVector2 = [1, 1];
				const result = MatrixTransform2D(vector, translation);
				expect(result[0]).toBeCloseTo(3);
				expect(result[1]).toBeCloseTo(4);
			});

			test('should transform vector with rotation', () => {
				const rotation = MatrixRotation2D(Math.PI / 2);
				const vector: TVector2 = [1, 0];
				const result = MatrixTransform2D(vector, rotation);
				expect(result[0]).toBeCloseTo(0, 5);
				expect(result[1]).toBeCloseTo(1, 5);
			});

			test('should transform vector with scaling', () => {
				const scale = MatrixScale2D(2, 3);
				const vector: TVector2 = [4, 5];
				const result = MatrixTransform2D(vector, scale);
				expect(result[0]).toBeCloseTo(8);
				expect(result[1]).toBeCloseTo(15);
			});

			test('should throw for invalid matrix', () => {
				const invalidMatrix = [[1, 0], [0, 1]]; // Wrong size
				// @ts-expect-error Invalid matrix size should cause a type error: MatrixTransform2D expects a 3x3 matrix
				expect(() => MatrixTransform2D([1, 1], invalidMatrix)).toThrow();
			});

			test('should throw for invalid vector', () => {
				const identity = MatrixIdentity(3);
				expect(() => MatrixTransform2D([1], identity)).toThrow();
			});

			test('should throw for degenerate transformation', () => {
				const degenerate: IMatrix3 = [
					[1, 0, 0],
					[0, 1, 0],
					[0, 0, 0], // w = 0 causes division by zero
				];
				expect(() => MatrixTransform2D([1, 1], degenerate)).toThrow('2D transformation w component near zero');
			});
		});

		describe('MatrixTransform3D', () => {
			test('should transform vector with identity matrix', () => {
				const identity = MatrixIdentity(4);
				const vector: TVector3 = [3, 4, 5];
				const result = MatrixTransform3D(vector, identity);
				expect(result[0]).toBeCloseTo(3);
				expect(result[1]).toBeCloseTo(4);
				expect(result[2]).toBeCloseTo(5);
			});

			test('should transform vector with translation', () => {
				const translation = MatrixTranslation3D(1, 2, 3);
				const vector: TVector3 = [4, 5, 6];
				const result = MatrixTransform3D(vector, translation);
				expect(result[0]).toBeCloseTo(5);
				expect(result[1]).toBeCloseTo(7);
				expect(result[2]).toBeCloseTo(9);
			});

			test('should transform vector with rotation', () => {
				const rotation = MatrixRotation3DYaw(Math.PI / 2);
				const vector: TVector3 = [1, 0, 0];
				const result = MatrixTransform3D(vector, rotation);
				expect(result[0]).toBeCloseTo(0, 5);
				expect(result[1]).toBeCloseTo(1, 5);
				expect(result[2]).toBeCloseTo(0, 5);
			});

			test('should transform vector with scaling', () => {
				const scale = MatrixScale3D(2, 3, 4);
				const vector: TVector3 = [1, 2, 3];
				const result = MatrixTransform3D(vector, scale);
				expect(result[0]).toBeCloseTo(2);
				expect(result[1]).toBeCloseTo(6);
				expect(result[2]).toBeCloseTo(12);
			});

			test('should throw for invalid matrix', () => {
				const invalidMatrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // Wrong size
				// @ts-expect-error Invalid matrix size should cause a type error: MatrixTransform3D expects a 4x4 matrix
				expect(() => MatrixTransform3D([1, 1, 1], invalidMatrix)).toThrow();
			});

			test('should throw for invalid vector', () => {
				const identity = MatrixIdentity(4);
				expect(() => MatrixTransform3D([1, 1], identity)).toThrow();
			});

			test('should throw for degenerate transformation', () => {
				const degenerate: IMatrix4 = [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 0], // w = 0 causes division by zero
				];
				expect(() => MatrixTransform3D([1, 1, 1] as [number, number, number], degenerate)).toThrow('3D transformation w component near zero');
			});
		});

		describe('MatrixDirection3D', () => {
			test('should transform direction with identity matrix', () => {
				const identity = MatrixIdentity(3);
				const direction: TVector3 = [1, 0, 0];
				const result = MatrixDirection3D(direction, identity);
				expect(result[0]).toBeCloseTo(1);
				expect(result[1]).toBeCloseTo(0);
				expect(result[2]).toBeCloseTo(0);
			});

			test('should transform direction with rotation', () => {
				// Extract 3x3 rotation part from 4x4 matrix
				const yaw4x4 = MatrixRotation3DYaw(Math.PI / 2);
				const rotation3x3: IMatrix3 = [
					[yaw4x4[0][0], yaw4x4[0][1], yaw4x4[0][2]],
					[yaw4x4[1][0], yaw4x4[1][1], yaw4x4[1][2]],
					[yaw4x4[2][0], yaw4x4[2][1], yaw4x4[2][2]],
				];
				const direction: TVector3 = [1, 0, 0];
				const result = MatrixDirection3D(direction, rotation3x3);
				expect(result[0]).toBeCloseTo(0, 5);
				expect(result[1]).toBeCloseTo(1, 5);
				expect(result[2]).toBeCloseTo(0, 5);
			});

			test('should ignore translation (direction vectors should not be translated)', () => {
				// Create a 3x3 matrix that would translate if it were 4x4
				const transform: IMatrix3 = [
					[1, 0, 5], // Translation component in 3x3 context
					[0, 1, 10],
					[0, 0, 1],
				];
				const direction: TVector3 = [1, 1, 0];
				const result = MatrixDirection3D(direction, transform);
				// Should apply transformation but not translation effects
				expect(result[0]).toBeCloseTo(1);
				expect(result[1]).toBeCloseTo(1);
				expect(result[2]).toBeCloseTo(0);
			});

			test('should throw for invalid matrix', () => {
				const invalidMatrix = [[1, 0], [0, 1]]; // Wrong size
				// @ts-expect-error Invalid matrix size should cause a type error: MatrixDirection3D expects a 3x3 matrix
				expect(() => MatrixDirection3D([1, 1, 1], invalidMatrix)).toThrow();
			});

			test('should throw for invalid direction', () => {
				const identity: IMatrix3 = [
					[1, 0, 0],
					[0, 1, 0],
					[0, 0, 1],
				];
				expect(() => MatrixDirection3D([1, 1], identity)).toThrow();
			});
		});
	});

	describe('View and Projection Matrices', () => {
		describe('MatrixView', () => {
			test('should create view matrix looking down negative Z', () => {
				const eye: TVector3 = [0, 0, 0];
				const target: TVector3 = [0, 0, -1];
				const up: TVector3 = [0, 1, 0];
				const viewMatrix = MatrixView(eye, target, up);
				// Should be approximately identity since we're at origin looking down -Z
				expectMatrixToBeCloseTo(viewMatrix, [
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);
			});

			test('should create view matrix with translation', () => {
				const eye:TVector3 = [0, 0, 5];
				const target:TVector3 = [0, 0, 0];
				const up:TVector3 = [0, 1, 0];
				const viewMatrix = MatrixView(eye, target, up);
				// Should translate camera position
				expect(viewMatrix[0][3]).toBeCloseTo(0);
				expect(viewMatrix[1][3]).toBeCloseTo(0);
				expect(viewMatrix[2][3]).toBeCloseTo(-5);
				expect(viewMatrix[3][3]).toBeCloseTo(1);
			});

			test('should create view matrix with rotation', () => {
				const eye:TVector3 = [1, 0, 0];
				const target:TVector3 = [0, 0, 0];
				const up:TVector3 = [0, 1, 0];
				const viewMatrix = MatrixView(eye, target, up);
				// Camera is to the right of origin looking towards it
				// This should create a rotation
				expect(viewMatrix).not.toEqual([
					[1, 0, 0, 0],
					[0, 1, 0, 0],
					[0, 0, 1, 0],
					[0, 0, 0, 1],
				]);

				// Bottom row should always be [0, 0, 0, 1]
				expectMatrixToBeCloseTo([viewMatrix[3]], [[0, 0, 0, 1]]);
			});

			test('should throw for invalid vectors', () => {
				expect(() => MatrixView([1, 2], [0, 0, 0], [0, 1, 0])).toThrow();
				expect(() => MatrixView([0, 0, 0], [1, 2], [0, 1, 0])).toThrow();
				expect(() => MatrixView([0, 0, 0], [0, 0, 0], [1, 2])).toThrow();
			});
		});

		describe('Matrix_Transformation_Perspective', () => {
			test('should create perspective matrix with valid parameters', () => {
				const fovY = Math.PI / 4; // 45 degrees
				const aspect = 16 / 9;
				const near = 0.1;
				const far = 100;

				const perspective = MatrixPerspective(fovY, aspect, near, far);
				// Should have specific structure for perspective matrix
				expect(perspective[0][0]).toBeGreaterThan(0); // X scaling
				expect(perspective[1][1]).toBeGreaterThan(0); // Y scaling
				expect(perspective[2][2]).toBeLessThan(0);    // Z mapping (negative)
				expect(perspective[2][3]).toBeLessThan(0);    // Z translation (negative)
				expect(perspective[3][2]).toBe(-1);           // Perspective trigger
				expect(perspective[3][3]).toBe(0);            // Clear diagonal
			});

			test('should throw for invalid near plane', () => {
				expect(() => MatrixPerspective(Math.PI / 4, 1, 0, 100)).toThrow('Near clipping plane must be greater than 0');
				expect(() => MatrixPerspective(Math.PI / 4, 1, -1, 100)).toThrow('Near clipping plane must be greater than 0');
			});

			test('should throw for invalid far plane', () => {
				expect(() => MatrixPerspective(Math.PI / 4, 1, 1, 0)).toThrow('Far clipping plane must be greater than 0');
				expect(() => MatrixPerspective(Math.PI / 4, 1, 1, -1)).toThrow('Far clipping plane must be greater than 0');
			});

			test('should throw when near >= far', () => {
				expect(() => MatrixPerspective(Math.PI / 4, 1, 100, 100)).toThrow('Near clipping plane must be less than far clipping plane');
				expect(() => MatrixPerspective(Math.PI / 4, 1, 100, 50)).toThrow('Near clipping plane must be less than far clipping plane');
			});

			test('should throw for invalid aspect ratio', () => {
				expect(() => MatrixPerspective(Math.PI / 4, 0, 0.1, 100)).toThrow('Aspect ratio must be greater than 0');
				expect(() => MatrixPerspective(Math.PI / 4, -1, 0.1, 100)).toThrow('Aspect ratio must be greater than 0');
			});
		});

		describe('MatrixOrthographic', () => {
			test('should create orthographic matrix with valid parameters', () => {
				const left = -10;
				const right = 10;
				const bottom = -5;
				const top = 5;
				const near = -100;
				const far = 100;

				const ortho = MatrixOrthographic(left, right, bottom, top, near, far);
				// Should have specific structure for orthographic matrix
				expect(ortho[0][0]).toBeCloseTo(2 / (right - left));     // X scaling
				expect(ortho[1][1]).toBeCloseTo(2 / (top - bottom));     // Y scaling
				expect(ortho[2][2]).toBeCloseTo(-2 / (far - near));      // Z scaling (negative)
				expect(ortho[0][3]).toBeCloseTo(-(right + left) / (right - left));   // X translation
				expect(ortho[1][3]).toBeCloseTo(-(top + bottom) / (top - bottom));   // Y translation
				expect(ortho[2][3]).toBeCloseTo(-(far + near) / (far - near));       // Z translation
				expect(ortho[3][3]).toBe(1);                             // Homogeneous coordinate
			});

			test('should throw for equal boundaries', () => {
				expect(() => MatrixOrthographic(5, 5, -5, 5, -100, 100)).toThrow('Left and right bounds must not be equal');
				expect(() => MatrixOrthographic(-5, 5, 3, 3, -100, 100)).toThrow('Bottom and top bounds must not be equal');
				expect(() => MatrixOrthographic(-5, 5, -5, 5, 50, 50)).toThrow('Near and far clipping planes must not be equal');
			});

			test('should handle negative coordinate spaces', () => {
				const ortho = MatrixOrthographic(-100, -50, -25, -10, 10, 20);
				// Should still create valid matrix
				expect(ortho[3][3]).toBe(1);
				expect(ortho[0][0]).toBeCloseTo(2 / (-50 - -100));
				expect(ortho[1][1]).toBeCloseTo(2 / (-10 - -25));
				expect(ortho[2][2]).toBeCloseTo(-2 / (20 - 10));
			});
		});
	});

	describe('Integration Tests', () => {
		test('should compose transformations correctly', () => {
			// Create a composite transformation: translate, then rotate, then scale
			const translation = MatrixTranslation2D(5, 5);
			const rotation = MatrixRotation2D(Math.PI / 4); // 45 degrees
			const scale = MatrixScale2D(2, 2);

			// Apply transformations in sequence
			const point = [1, 0];

			// First translate
			const translated = MatrixTransform2D(point, translation);
			expect(translated[0]).toBeCloseTo(6);
			expect(translated[1]).toBeCloseTo(5);

			// Then rotate
			const rotated = MatrixTransform2D(translated, rotation);

			// Then scale
			const final = MatrixTransform2D(rotated, scale);
			// Final result should be properly transformed
			expect(final).toBeDefined();
			expect(Array.isArray(final)).toBe(true);
			expect(final.length).toBe(2);
		});

		test('should maintain vector magnitude for rotation only', () => {
			const vector: TVector2 = [3, 4]; // magnitude = 5
			const rotation = MatrixRotation2D(Math.PI / 3); // 60 degrees

			const rotated = MatrixTransform2D(vector, rotation);
			const originalMagnitude = VectorMagnitude(vector);
			const rotatedMagnitude = VectorMagnitude(rotated);
			expect(rotatedMagnitude).toBeCloseTo(originalMagnitude, 5);
		});

		test('should transform 3D vectors correctly with combined rotations', () => {
			const vector = [1, 0, 0] as [number, number, number];

			// First rotate around Y (pitch), then around Z (yaw)
			const pitch90 = MatrixRotation3DPitch(Math.PI / 2);
			const yaw90 = MatrixRotation3DYaw(Math.PI / 2);

			const afterPitch = MatrixTransform3D(vector as [number, number, number], pitch90);
			expect(afterPitch[0]).toBeCloseTo(0, 5);
			expect(afterPitch[1]).toBeCloseTo(0, 5);
			expect(afterPitch[2]).toBeCloseTo(-1, 5);

			const afterYaw = MatrixTransform3D(afterPitch as [number, number, number], yaw90);
			expect(afterYaw[0]).toBeCloseTo(0, 5);
			expect(afterYaw[1]).toBeCloseTo(0, 5);
			expect(afterYaw[2]).toBeCloseTo(-1, 5);
		});

		test('should preserve direction vector properties', () => {
			const direction: TVector3 = [1, 1, 1];
			const rotation3x3: IMatrix3 = [
				[1, 0, 0],
				[0, 0, -1],
				[0, 1, 0],
			];

			const rotatedDirection = MatrixDirection3D(direction, rotation3x3);
			const originalMagnitude = VectorMagnitude(direction);
			const rotatedMagnitude = VectorMagnitude(rotatedDirection);
			// Direction transformations should preserve magnitude
			expect(rotatedMagnitude).toBeCloseTo(originalMagnitude, 5);
		});
	});
});
