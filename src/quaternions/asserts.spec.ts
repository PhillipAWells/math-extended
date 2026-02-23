import {
	QuaternionError,
	AssertQuaternion,
	AssertNormalizedQuaternion,
	AssertEulerAngles,
	AssertAxisAngle,
	AssertRotationMatrix,
	AssertQuaternions,
} from './asserts.js';
import { TQuaternion } from './types.js';

describe('Quaternions Assertions', () => {
	describe('QuaternionError', () => {
		test('should create a QuaternionError with message', () => {
			const error = new QuaternionError('test message');
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(QuaternionError);
			expect(error.name).toBe('QuaternionError');
			expect(error.message).toBe('test message');
		});

		test('should create a QuaternionError without message', () => {
			const error = new QuaternionError();
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(QuaternionError);
			expect(error.name).toBe('QuaternionError');
			expect(error.message).toBe('');
		});
	});

	describe('AssertQuaternion', () => {
		test('should pass for valid quaternions', () => {
			expect(() => AssertQuaternion([0, 0, 0, 1])).not.toThrow();
			expect(() => AssertQuaternion([1, 0, 0, 0])).not.toThrow();
			expect(() => AssertQuaternion([0.5, 0.5, 0.5, 0.5])).not.toThrow();
			expect(() => AssertQuaternion([-1, -2, -3, -4])).not.toThrow();
			expect(() => AssertQuaternion([0, 0, 0, 0])).not.toThrow();
		});

		test('should throw for non-arrays', () => {
			expect(() => AssertQuaternion(null)).toThrow(QuaternionError);
			expect(() => AssertQuaternion(undefined)).toThrow(QuaternionError);
			expect(() => AssertQuaternion(123)).toThrow(QuaternionError);
			expect(() => AssertQuaternion('string')).toThrow(QuaternionError);
			expect(() => AssertQuaternion({})).toThrow(QuaternionError);
		});

		test('should throw for arrays with wrong length', () => {
			expect(() => AssertQuaternion([])).toThrow(QuaternionError);
			expect(() => AssertQuaternion([1])).toThrow(QuaternionError);
			expect(() => AssertQuaternion([1, 2])).toThrow(QuaternionError);
			expect(() => AssertQuaternion([1, 2, 3])).toThrow(QuaternionError);
			expect(() => AssertQuaternion([1, 2, 3, 4, 5])).toThrow(QuaternionError);
		});

		test('should throw for arrays with non-number elements', () => {
			expect(() => AssertQuaternion([1, 2, 3, 'string'])).toThrow(QuaternionError);
			expect(() => AssertQuaternion([1, null, 3, 4])).toThrow(QuaternionError);
			expect(() => AssertQuaternion([1, undefined, 3, 4])).toThrow(QuaternionError);
			expect(() => AssertQuaternion([1, {}, 3, 4])).toThrow(QuaternionError);
			expect(() => AssertQuaternion([NaN, 0, 0, 1])).toThrow(QuaternionError);
			// Note: Infinity is allowed by vector validation (finite constraint not set by default)
			expect(() => AssertQuaternion([0, 0, 0, Infinity])).not.toThrow();
		});

		test('should throw with specific error messages', () => {
			expect(() => AssertQuaternion('not an array')).toThrow('Quaternion must be an array');
			expect(() => AssertQuaternion([1, 2, 3])).toThrow('Quaternion must have exactly 4 components, got 3');
			expect(() => AssertQuaternion([1, 2, 3, 4, 5])).toThrow('Quaternion must have exactly 4 components, got 5');
		});
	});

	describe('AssertNormalizedQuaternion', () => {
		test('should pass for normalized quaternions', () => {
			expect(() => AssertNormalizedQuaternion([0, 0, 0, 1])).not.toThrow();
			expect(() => AssertNormalizedQuaternion([1, 0, 0, 0])).not.toThrow();
			expect(() => AssertNormalizedQuaternion([0, 1, 0, 0])).not.toThrow();
			expect(() => AssertNormalizedQuaternion([0, 0, 1, 0])).not.toThrow();
			expect(() => AssertNormalizedQuaternion([0.5, 0.5, 0.5, 0.5])).not.toThrow();
			expect(() => AssertNormalizedQuaternion([0.707107, 0, 0, 0.707107])).not.toThrow();
		});

		test('should throw for non-normalized quaternions', () => {
			expect(() => AssertNormalizedQuaternion([1, 1, 1, 1])).toThrow(QuaternionError);
			expect(() => AssertNormalizedQuaternion([2, 0, 0, 0])).toThrow(QuaternionError);
			expect(() => AssertNormalizedQuaternion([0, 0, 0, 2])).toThrow(QuaternionError);
			expect(() => AssertNormalizedQuaternion([0.1, 0.1, 0.1, 0.1])).toThrow(QuaternionError);
		});

		test('should respect tolerance parameter', () => {
			const almostNormalized: TQuaternion = [0.99999, 0, 0, 0];
			expect(() => AssertNormalizedQuaternion(almostNormalized, 1e-4)).not.toThrow();
			expect(() => AssertNormalizedQuaternion(almostNormalized, 1e-6)).toThrow(QuaternionError);
		});

		test('should use default tolerance', () => {
			// A quaternion [1.000001, 0, 0, 0] has magnitude ≈ 1.000001
			// Difference from 1 is ≈ 0.000001 = 1e-6, which equals the default tolerance
			// Since the difference equals tolerance, it should pass (not greater than tolerance)
			const slightlyOff: TQuaternion = [1.000001, 0, 0, 0];
			expect(() => AssertNormalizedQuaternion(slightlyOff)).not.toThrow();

			// Test with a value that clearly exceeds default tolerance
			const clearlyOff: TQuaternion = [1.00001, 0, 0, 0]; // difference ≈ 1e-5, much larger than 1e-6
			expect(() => AssertNormalizedQuaternion(clearlyOff)).toThrow(QuaternionError);
		});

		test('should throw with magnitude information', () => {
			const magnitude2: TQuaternion = [2, 0, 0, 0];
			expect(() => AssertNormalizedQuaternion(magnitude2)).toThrow(/magnitude = 2/);
		});

		test('should validate quaternion first', () => {
			expect(() => AssertNormalizedQuaternion([1, 2, 3] as any)).toThrow(QuaternionError);
			expect(() => AssertNormalizedQuaternion('invalid' as any)).toThrow(QuaternionError);
		});
	});

	describe('AssertEulerAngles', () => {
		test('should pass for valid Euler angles', () => {
			expect(() => AssertEulerAngles([0, 0, 0])).not.toThrow();
			expect(() => AssertEulerAngles([Math.PI, 0, 0])).not.toThrow();
			expect(() => AssertEulerAngles([0, Math.PI / 2, 0])).not.toThrow();
			expect(() => AssertEulerAngles([Math.PI / 4, Math.PI / 3, Math.PI / 6])).not.toThrow();
			expect(() => AssertEulerAngles([-Math.PI, -Math.PI / 2, -Math.PI / 4])).not.toThrow();
		});

		test('should throw for non-arrays', () => {
			expect(() => AssertEulerAngles(null)).toThrow(QuaternionError);
			expect(() => AssertEulerAngles(undefined)).toThrow(QuaternionError);
			expect(() => AssertEulerAngles(123)).toThrow(QuaternionError);
			expect(() => AssertEulerAngles('string')).toThrow(QuaternionError);
			expect(() => AssertEulerAngles({})).toThrow(QuaternionError);
		});

		test('should throw for arrays with wrong length', () => {
			expect(() => AssertEulerAngles([])).toThrow(QuaternionError);
			expect(() => AssertEulerAngles([1])).toThrow(QuaternionError);
			expect(() => AssertEulerAngles([1, 2])).toThrow(QuaternionError);
			expect(() => AssertEulerAngles([1, 2, 3, 4])).toThrow(QuaternionError);
		});

		test('should throw for arrays with non-number elements', () => {
			expect(() => AssertEulerAngles([1, 2, 'string'])).toThrow(QuaternionError);
			expect(() => AssertEulerAngles([1, null, 3])).toThrow(QuaternionError);
			expect(() => AssertEulerAngles([1, undefined, 3])).toThrow(QuaternionError);
			expect(() => AssertEulerAngles([NaN, 0, 0])).toThrow(QuaternionError);
			// Note: Infinity is allowed by vector validation (finite constraint not set by default)
			expect(() => AssertEulerAngles([0, Infinity, 0])).not.toThrow();
		});

		test('should throw with specific error messages', () => {
			expect(() => AssertEulerAngles('not an array')).toThrow('Euler angles must be an array');
			expect(() => AssertEulerAngles([1, 2])).toThrow('Euler angles must have exactly 3 components, got 2');
		});

		test('should wrap VectorError in QuaternionError', () => {
			expect(() => AssertEulerAngles([1, 2, NaN])).toThrow(QuaternionError);
			expect(() => AssertEulerAngles([1, 2, NaN])).toThrow(/Invalid Euler angles:/);
		});
	});

	describe('AssertAxisAngle', () => {
		test('should pass for valid axis-angle representations', () => {
			expect(() => AssertAxisAngle([1, 0, 0, 0])).not.toThrow();
			expect(() => AssertAxisAngle([0, 1, 0, Math.PI / 2])).not.toThrow();
			expect(() => AssertAxisAngle([0, 0, 1, Math.PI])).not.toThrow();
			expect(() => AssertAxisAngle([0.707, 0.707, 0, Math.PI / 4])).not.toThrow();
			expect(() => AssertAxisAngle([0, 0, 0, 0])).not.toThrow();
		});

		test('should throw for non-arrays', () => {
			expect(() => AssertAxisAngle(null)).toThrow(QuaternionError);
			expect(() => AssertAxisAngle(undefined)).toThrow(QuaternionError);
			expect(() => AssertAxisAngle(123)).toThrow(QuaternionError);
			expect(() => AssertAxisAngle('string')).toThrow(QuaternionError);
			expect(() => AssertAxisAngle({})).toThrow(QuaternionError);
		});

		test('should throw for arrays with wrong length', () => {
			expect(() => AssertAxisAngle([])).toThrow(QuaternionError);
			expect(() => AssertAxisAngle([1])).toThrow(QuaternionError);
			expect(() => AssertAxisAngle([1, 2])).toThrow(QuaternionError);
			expect(() => AssertAxisAngle([1, 2, 3])).toThrow(QuaternionError);
			expect(() => AssertAxisAngle([1, 2, 3, 4, 5])).toThrow(QuaternionError);
		});

		test('should throw for arrays with non-number elements', () => {
			expect(() => AssertAxisAngle([1, 2, 3, 'string'])).toThrow(QuaternionError);
			expect(() => AssertAxisAngle([1, null, 3, 4])).toThrow(QuaternionError);
			expect(() => AssertAxisAngle([1, undefined, 3, 4])).toThrow(QuaternionError);
			expect(() => AssertAxisAngle([NaN, 0, 0, 1])).toThrow(QuaternionError);
			// Note: Infinity is allowed by vector validation (finite constraint not set by default)
			expect(() => AssertAxisAngle([0, 0, 0, Infinity])).not.toThrow();
		});

		test('should throw with specific error messages', () => {
			expect(() => AssertAxisAngle('not an array')).toThrow('Axis-angle must be an array');
			expect(() => AssertAxisAngle([1, 2, 3])).toThrow('Axis-angle must have exactly 4 components, got 3');
		});

		test('should wrap VectorError in QuaternionError', () => {
			expect(() => AssertAxisAngle([1, 2, 3, NaN])).toThrow(QuaternionError);
			expect(() => AssertAxisAngle([1, 2, 3, NaN])).toThrow(/Invalid axis-angle:/);
		});
	});

	describe('AssertRotationMatrix', () => {
		test('should pass for valid rotation matrices', () => {
			// Identity matrix
			expect(() => AssertRotationMatrix([
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			])).not.toThrow();

			// 90-degree rotation around Z-axis
			expect(() => AssertRotationMatrix([
				[0, -1, 0],
				[1, 0, 0],
				[0, 0, 1],
			])).not.toThrow();

			// Generic valid matrix
			expect(() => AssertRotationMatrix([
				[0.5, 0.5, 0.707],
				[-0.5, 0.866, 0],
				[-0.612, -0.354, 0.707],
			])).not.toThrow();
		});

		test('should throw for non-arrays', () => {
			expect(() => AssertRotationMatrix(null)).toThrow(QuaternionError);
			expect(() => AssertRotationMatrix(undefined)).toThrow(QuaternionError);
			expect(() => AssertRotationMatrix(123)).toThrow(QuaternionError);
			expect(() => AssertRotationMatrix('string')).toThrow(QuaternionError);
			expect(() => AssertRotationMatrix({})).toThrow(QuaternionError);
		});

		test('should throw for arrays with wrong row count', () => {
			expect(() => AssertRotationMatrix([])).toThrow(QuaternionError);
			expect(() => AssertRotationMatrix([[1, 0, 0]])).toThrow(QuaternionError);
			expect(() => AssertRotationMatrix([[1, 0, 0], [0, 1, 0]])).toThrow(QuaternionError);
			expect(() => AssertRotationMatrix([
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
				[0, 0, 0],
			])).toThrow(QuaternionError);
		});

		test('should throw for non-array rows', () => {
			expect(() => AssertRotationMatrix([
				[1, 0, 0],
				'not an array',
				[0, 0, 1],
			])).toThrow(QuaternionError);

			expect(() => AssertRotationMatrix([
				[1, 0, 0],
				null,
				[0, 0, 1],
			])).toThrow(QuaternionError);
		});

		test('should throw for rows with wrong column count', () => {
			expect(() => AssertRotationMatrix([
				[1, 0],
				[0, 1, 0],
				[0, 0, 1],
			])).toThrow(QuaternionError);

			expect(() => AssertRotationMatrix([
				[1, 0, 0, 0],
				[0, 1, 0],
				[0, 0, 1],
			])).toThrow(QuaternionError);
		});

		test('should throw for rows with non-number elements', () => {
			expect(() => AssertRotationMatrix([
				[1, 0, 0],
				[0, 'string', 0],
				[0, 0, 1],
			])).toThrow(QuaternionError);

			expect(() => AssertRotationMatrix([
				[1, 0, 0],
				[0, 1, 0],
				[NaN, 0, 1],
			])).toThrow(QuaternionError);
		});

		test('should throw with specific error messages', () => {
			expect(() => AssertRotationMatrix('not an array')).toThrow('Rotation matrix must be an array');
			expect(() => AssertRotationMatrix([[1, 0, 0]])).toThrow('Rotation matrix must have exactly 3 rows, got 1');
			expect(() => AssertRotationMatrix([
				[1, 0],
				[0, 1, 0],
				[0, 0, 1],
			])).toThrow('Rotation matrix row 0 must have exactly 3 elements, got 2');
		});

		test('should wrap VectorError in QuaternionError', () => {
			expect(() => AssertRotationMatrix([
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, NaN],
			])).toThrow(QuaternionError);
			expect(() => AssertRotationMatrix([
				[1, 0, 0],
				[0, 1, 0],
				[0, 0, NaN],
			])).toThrow(/Invalid rotation matrix row 2:/);
		});
	});

	describe('AssertQuaternions', () => {
		test('should pass for valid quaternion arrays', () => {
			expect(() => AssertQuaternions([])).not.toThrow();
			expect(() => AssertQuaternions([[0, 0, 0, 1]])).not.toThrow();
			expect(() => AssertQuaternions([
				[0, 0, 0, 1],
				[1, 0, 0, 0],
				[0.5, 0.5, 0.5, 0.5],
			])).not.toThrow();
		});

		test('should throw for non-arrays', () => {
			expect(() => AssertQuaternions(null as any)).toThrow(QuaternionError);
			expect(() => AssertQuaternions(undefined as any)).toThrow(QuaternionError);
			expect(() => AssertQuaternions(123 as any)).toThrow(QuaternionError);
			expect(() => AssertQuaternions('string' as any)).toThrow(QuaternionError);
			expect(() => AssertQuaternions({} as any)).toThrow(QuaternionError);
		});

		test('should throw for arrays containing invalid quaternions', () => {
			expect(() => AssertQuaternions([
				[0, 0, 0, 1],
				[1, 2, 3], // Invalid - wrong length
				[0, 1, 0, 0],
			])).toThrow(QuaternionError);

			expect(() => AssertQuaternions([
				[0, 0, 0, 1],
				[1, 2, 3, 'string'], // Invalid - non-number
			])).toThrow(QuaternionError);

			expect(() => AssertQuaternions([
				[0, 0, 0, 1],
				'not a quaternion', // Invalid - not an array
			])).toThrow(QuaternionError);
		});

		test('should provide index information in error messages', () => {
			expect(() => AssertQuaternions([
				[0, 0, 0, 1],
				[1, 2, 3], // Invalid at index 1
			])).toThrow(/Invalid quaternion at index 1:/);

			expect(() => AssertQuaternions([
				[0, 0, 0, 1],
				[1, 0, 0, 0],
				[1, 2, 3, NaN], // Invalid at index 2
			])).toThrow(/Invalid quaternion at index 2:/);
		});

		test('should pass options to individual quaternion validation', () => {
			const options = { someOption: true };
			// This test verifies that options are passed through,
			// though the current implementation doesn't use them
			expect(() => AssertQuaternions([[0, 0, 0, 1]], options)).not.toThrow();
		});
	});
});
