import { QuaternionIdentity, QuaternionClone, QuaternionEquals, QuaternionMagnitude, QuaternionNormalize, QuaternionConjugate, QuaternionInverse, QuaternionMultiply, QuaternionFromAxisAngle, QuaternionFromAxisAngleVector, QuaternionToAxisAngle, QuaternionFromEuler, QuaternionToEuler, QuaternionRotateVector, QuaternionSLERP } from './core.js';
import { QuaternionError } from './asserts.js';
import { TQuaternion } from './types.js';
import { TVector3, TVector4 } from '../vectors/types.ts';

describe('Quaternion Core Functions', () => {
	describe('QuaternionIdentity', () => {
		test('should return identity quaternion', () => {
			const identity = QuaternionIdentity();
			expect(identity).toEqual([0, 0, 0, 1]);
		});
	});

	describe('QuaternionClone', () => {
		test('should create a deep copy of quaternion', () => {
			const original: TQuaternion = [1, 2, 3, 4];
			const cloned = QuaternionClone(original);
			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);

			// Verify independence
			cloned[0] = 999;
			expect(original[0]).toBe(1);
		});

		test('should throw for invalid quaternion', () => {
			expect(() => QuaternionClone([1, 2, 3] as any)).toThrow(QuaternionError);
		});
	});

	describe('QuaternionEquals', () => {
		test('should return true for identical quaternions', () => {
			const q1: TQuaternion = [0, 0, 0, 1];
			const q2: TQuaternion = [0, 0, 0, 1];
			expect(QuaternionEquals(q1, q2)).toBe(true);
		});

		test('should return false for different quaternions', () => {
			const q1: TQuaternion = [0, 0, 0, 1];
			const q2: TQuaternion = [1, 0, 0, 0];
			expect(QuaternionEquals(q1, q2)).toBe(false);
		});

		test('should handle tolerance', () => {
			const q1: TQuaternion = [0.000001, 0, 0, 1];
			const q2: TQuaternion = [0, 0, 0, 1];
			expect(QuaternionEquals(q1, q2, 1e-7)).toBe(false);
			expect(QuaternionEquals(q1, q2, 1e-5)).toBe(true);
		});

		test('should detect equivalent rotations when checkEquivalence is true', () => {
			const q1: TQuaternion = [0, 0, 0, 1];
			const q2: TQuaternion = [0, 0, 0, -1]; // Same rotation, opposite quaternion
			expect(QuaternionEquals(q1, q2, 1e-6, false)).toBe(false);
			expect(QuaternionEquals(q1, q2, 1e-6, true)).toBe(true);
		});
	});

	describe('QuaternionMagnitude', () => {
		test('should calculate magnitude correctly', () => {
			const q: TQuaternion = [1, 2, 2, 0];
			const magnitude = QuaternionMagnitude(q);
			expect(magnitude).toBeCloseTo(3, 6);
		});

		test('should return 1 for unit quaternions', () => {
			const q: TQuaternion = [0, 0, 0, 1];
			expect(QuaternionMagnitude(q)).toBeCloseTo(1, 6);
		});
	});

	describe('QuaternionNormalize', () => {
		test('should normalize quaternion to unit length', () => {
			const q: TQuaternion = [1, 1, 1, 1];
			const normalized = QuaternionNormalize(q);
			expect(QuaternionMagnitude(normalized)).toBeCloseTo(1, 6);
		});

		test('should preserve identity quaternion', () => {
			const identity = QuaternionIdentity();
			const normalized = QuaternionNormalize(identity);
			expect(normalized).toEqual(identity);
		});
	});

	describe('QuaternionConjugate', () => {
		test('should negate x, y, z components', () => {
			const q: TQuaternion = [1, 2, 3, 4];
			const conjugate = QuaternionConjugate(q);
			expect(conjugate).toEqual([-1, -2, -3, 4]);
		});

		test('should preserve identity quaternion', () => {
			const identity = QuaternionIdentity();
			const conjugate = QuaternionConjugate(identity);
			// Check values are effectively zero (handles -0 vs 0)
			expect(Math.abs(conjugate[0])).toBeCloseTo(0, 6);
			expect(Math.abs(conjugate[1])).toBeCloseTo(0, 6);
			expect(Math.abs(conjugate[2])).toBeCloseTo(0, 6);
			expect(conjugate[3]).toBe(1);
		});
	});

	describe('QuaternionInverse', () => {
		test('should calculate inverse correctly for unit quaternion', () => {
			const q: TQuaternion = [0, 0, 0.7071067811865476, 0.7071067811865476]; // 90° around Z (properly normalized)
			const inverse = QuaternionInverse(q);
			const conjugate = QuaternionConjugate(q);
			// For unit quaternions, inverse equals conjugate
			expect(inverse[0]).toBeCloseTo(conjugate[0], 6);
			expect(inverse[1]).toBeCloseTo(conjugate[1], 6);
			expect(inverse[2]).toBeCloseTo(conjugate[2], 6);
			expect(inverse[3]).toBeCloseTo(conjugate[3], 6);
		});

		test('should satisfy q * q^-1 = identity', () => {
			const q: TQuaternion = [0.5, 0.5, 0.5, 0.5];
			const inverse = QuaternionInverse(q);
			const product = QuaternionMultiply(q, inverse);
			const identity = QuaternionIdentity();
			expect(product[0]).toBeCloseTo(identity[0], 6);
			expect(product[1]).toBeCloseTo(identity[1], 6);
			expect(product[2]).toBeCloseTo(identity[2], 6);
			expect(product[3]).toBeCloseTo(identity[3], 6);
		});

		test('should throw for zero quaternion', () => {
			const zero: TQuaternion = [0, 0, 0, 0];
			expect(() => QuaternionInverse(zero)).toThrow();
		});
	});

	describe('QuaternionMultiply', () => {
		test('should multiply quaternions correctly', () => {
			const q1: TQuaternion = [0, 0, 0, 1]; // Identity
			const q2: TQuaternion = [1, 0, 0, 0]; // 180° around X
			const product = QuaternionMultiply(q1, q2);
			expect(product).toEqual([1, 0, 0, 0]);
		});

		test('should be non-commutative', () => {
			const q1: TQuaternion = [0.7071067811865476, 0, 0, 0.7071067811865476]; // 90° around X
			const q2: TQuaternion = [0, 0.7071067811865476, 0, 0.7071067811865476]; // 90° around Y

			const product1 = QuaternionMultiply(q1, q2);
			const product2 = QuaternionMultiply(q2, q1);
			expect(QuaternionEquals(product1, product2)).toBe(false);
		});

		test('should preserve magnitude for unit quaternions', () => {
			const q1 = QuaternionNormalize([1, 1, 0, 1]);
			const q2 = QuaternionNormalize([0, 1, 1, 1]);
			const product = QuaternionMultiply(q1, q2);
			expect(QuaternionMagnitude(product)).toBeCloseTo(1, 6);
		});
	});

	describe('QuaternionFromAxisAngle', () => {
		test('should create quaternion from axis-angle', () => {
			const axis:TVector3 = [0, 0, 1]; // Z-axis
			const angle = Math.PI / 2; // 90 degrees
			const q = QuaternionFromAxisAngle(axis, angle);
			expect(q[0]).toBeCloseTo(0, 6);
			expect(q[1]).toBeCloseTo(0, 6);
			expect(q[2]).toBeCloseTo(0.7071067811865476, 6);
			expect(q[3]).toBeCloseTo(0.7071067811865476, 6);
		});

		test('should handle zero angle', () => {
			const axis:TVector3 = [1, 0, 0];
			const angle = 0;
			const q = QuaternionFromAxisAngle(axis, angle);
			expect(q).toEqual([0, 0, 0, 1]); // Identity
		});

		test('should normalize axis automatically', () => {
			const unnormalizedAxis: TVector3 = [2, 0, 0]; // Will be normalized to [1, 0, 0]
			const angle = Math.PI;
			const q = QuaternionFromAxisAngle(unnormalizedAxis, angle);
			expect(q[0]).toBeCloseTo(1, 6);
			expect(q[1]).toBeCloseTo(0, 6);
			expect(q[2]).toBeCloseTo(0, 6);
			expect(q[3]).toBeCloseTo(0, 6);
		});
	});

	describe('QuaternionFromAxisAngleVector', () => {
		test('should create quaternion from 4-component axis-angle', () => {
			const axisAngle: TVector4 = [0, 0, 1, Math.PI / 2]; // 90° around Z
			const q = QuaternionFromAxisAngleVector(axisAngle);
			expect(q[0]).toBeCloseTo(0, 6);
			expect(q[1]).toBeCloseTo(0, 6);
			expect(q[2]).toBeCloseTo(0.7071067811865476, 6);
			expect(q[3]).toBeCloseTo(0.7071067811865476, 6);
		});
	});

	describe('QuaternionToAxisAngle', () => {
		test('should convert quaternion to axis-angle', () => {
			const q: TQuaternion = [0, 0, 0.7071067811865476, 0.7071067811865476]; // 90° around Z (properly normalized)
			const axisAngle = QuaternionToAxisAngle(q);
			expect(axisAngle[0]).toBeCloseTo(0, 6);
			expect(axisAngle[1]).toBeCloseTo(0, 6);
			expect(axisAngle[2]).toBeCloseTo(1, 6);
			expect(axisAngle[3]).toBeCloseTo(Math.PI / 2, 6);
		});

		test('should handle identity quaternion', () => {
			const identity = QuaternionIdentity();
			const axisAngle = QuaternionToAxisAngle(identity);
			expect(axisAngle[3]).toBeCloseTo(0, 6); // Zero angle
		});
	});

	describe('QuaternionFromEuler', () => {
		test('should create quaternion from Euler angles', () => {
			const euler: TVector3 = [0, Math.PI / 2, 0]; // 90° pitch
			const q = QuaternionFromEuler(euler);
			// Should be roughly [0, sin(45°), 0, cos(45°)]
			expect(q[0]).toBeCloseTo(0, 6);
			expect(q[1]).toBeCloseTo(0.7071067811865476, 6);
			expect(q[2]).toBeCloseTo(0, 6);
			expect(q[3]).toBeCloseTo(0.7071067811865476, 6);
		});

		test('should handle zero angles', () => {
			const euler: TVector3 = [0, 0, 0];
			const q = QuaternionFromEuler(euler);
			expect(q).toEqual([0, 0, 0, 1]); // Identity
		});
	});

	describe('QuaternionToEuler', () => {
		test('should convert quaternion to Euler angles', () => {
			const q: TQuaternion = [0, 0.7071067811865476, 0, 0.7071067811865476]; // 90° around Y (properly normalized)
			const euler = QuaternionToEuler(q);
			// Note: Due to Euler angle ambiguity, multiple representations are valid
			// The key is that converting back should give the same rotation
			const backToQuaternion = QuaternionFromEuler(euler);

			// Test that rotating a vector gives the same result
			const testVector: TVector3 = [1, 0, 0];
			const rotated1 = QuaternionRotateVector(q, testVector);
			const rotated2 = QuaternionRotateVector(backToQuaternion, testVector);
			expect(rotated1[0]).toBeCloseTo(rotated2[0], 6);
			expect(rotated1[1]).toBeCloseTo(rotated2[1], 6);
			expect(rotated1[2]).toBeCloseTo(rotated2[2], 6);
		});

		test('should handle identity quaternion', () => {
			const identity = QuaternionIdentity();
			const euler = QuaternionToEuler(identity);
			expect(euler).toEqual([0, 0, 0]);
		});
	});

	describe('QuaternionRotateVector', () => {
		test('should rotate vector correctly', () => {
			const q = QuaternionFromAxisAngle([0, 0, 1] as TVector3, Math.PI / 2); // 90° around Z
			const vector: TVector3 = [1, 0, 0]; // Point along X-axis
			const rotated = QuaternionRotateVector(q, vector);
			// Should point along Y-axis after 90° Z rotation
			expect(rotated[0]).toBeCloseTo(0, 6);
			expect(rotated[1]).toBeCloseTo(1, 6);
			expect(rotated[2]).toBeCloseTo(0, 6);
		});

		test('should preserve vector length', () => {
			const q = QuaternionFromAxisAngle([1, 1, 1] as TVector3, Math.PI / 3); // 60° around diagonal
			const vector: TVector3 = [3, 4, 5];
			const rotated = QuaternionRotateVector(q, vector);

			const originalLength = Math.sqrt((3 * 3) + (4 * 4) + (5 * 5));
			const rotatedLength = Math.sqrt((rotated[0] * rotated[0]) + (rotated[1] * rotated[1]) + (rotated[2] * rotated[2]));
			expect(rotatedLength).toBeCloseTo(originalLength, 6);
		});

		test('should not change vector with identity quaternion', () => {
			const identity = QuaternionIdentity();
			const vector: TVector3 = [1, 2, 3];
			const rotated = QuaternionRotateVector(identity, vector);
			expect(rotated).toEqual(vector);
		});
	});

	describe('QuaternionSLERP', () => {
		test('should interpolate between quaternions', () => {
			const q1 = QuaternionIdentity();
			const q2 = QuaternionFromAxisAngle([0, 0, 1], Math.PI / 2); // 90° around Z

			const halfway = QuaternionSLERP(q1, q2, 0.5);
			// Should be roughly 45° rotation
			expect(QuaternionMagnitude(halfway)).toBeCloseTo(1, 6);
			expect(halfway[2]).toBeCloseTo(Math.sin(Math.PI / 8), 6); // sin(45°/2)
			expect(halfway[3]).toBeCloseTo(Math.cos(Math.PI / 8), 6); // cos(45°/2)
		});

		test('should return start quaternion at t=0', () => {
			const q1: TQuaternion = [1, 0, 0, 0];
			const q2: TQuaternion = [0, 1, 0, 0];
			const result = QuaternionSLERP(q1, q2, 0);
			expect(result[0]).toBeCloseTo(q1[0], 6);
			expect(result[1]).toBeCloseTo(q1[1], 6);
			expect(result[2]).toBeCloseTo(q1[2], 6);
			expect(result[3]).toBeCloseTo(q1[3], 6);
		});

		test('should return end quaternion at t=1', () => {
			const q1: TQuaternion = [1, 0, 0, 0];
			const q2: TQuaternion = [0, 1, 0, 0];
			const result = QuaternionSLERP(q1, q2, 1);
			expect(result[0]).toBeCloseTo(q2[0], 6);
			expect(result[1]).toBeCloseTo(q2[1], 6);
			expect(result[2]).toBeCloseTo(q2[2], 6);
			expect(result[3]).toBeCloseTo(q2[3], 6);
		});

		test('should handle very close quaternions', () => {
			const q1: TQuaternion = [0, 0, 0, 1];
			const q2: TQuaternion = [0.0001, 0, 0, 0.99999999];
			const normalized = QuaternionNormalize(q2);

			const result = QuaternionSLERP(q1, normalized, 0.5);
			expect(QuaternionMagnitude(result)).toBeCloseTo(1, 6);
		});

		test('should clamp t to [0, 1] range', () => {
			const q1 = QuaternionIdentity();
			const q2 = QuaternionFromAxisAngle([0, 0, 1], Math.PI / 2);

			const resultBelow = QuaternionSLERP(q1, q2, -0.5);
			const resultAt0 = QuaternionSLERP(q1, q2, 0);
			expect(QuaternionEquals(resultBelow, resultAt0)).toBe(true);

			const resultAbove = QuaternionSLERP(q1, q2, 1.5);
			const resultAt1 = QuaternionSLERP(q1, q2, 1);
			expect(QuaternionEquals(resultAbove, resultAt1)).toBe(true);
		});
	});
});
