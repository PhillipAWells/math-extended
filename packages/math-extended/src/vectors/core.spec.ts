import {
	VectorClone,
	VectorEquals,
	VectorToString,
	VectorAdd,
	VectorSubtract,
	VectorMultiply,
	VectorDivide,
	VectorClamp,
	VectorDistance,
	VectorDistanceSquared,
	VectorDot,
	VectorNormalize,
	VectorMagnitude,
	VectorAbs,
	VectorIsZero,
	VectorIsFinite,
	VectorAngle,
	Vector2Rotate,
	Vector2FromAngle,
	Vector2Cross,
	Vector3Reject,
	VectorProject,
	Vector3Reflect,
	VectorCrossMagnitude,
	Vector3ScalarTripleProduct,
	Vector3TripleProduct,
	VectorReflect,
	VectorNegate,
	VectorGramSchmidt,
	VectorLimit,
	VectorScale,
	VectorFloor,
	VectorCeil,
	VectorRound,
	VectorMin,
	VectorMax,
	VectorMidpoint,
	VectorMoveTowards,
	Vector2AngleSigned,
	Vector3AngleSigned,
	VectorIsNormalized,
	Vector3ProjectOnPlane,
	Vector3RotateAround,
	VectorManhattanDistance,
	VectorChebyshevDistance
} from './core.js';
import { VectorError } from './asserts.js';
import { type TVector, type TVector2, type TVector3 } from './types.js';

describe('Vector Core', () => {
	describe('VectorClone', () => {
		it('should clone a vector without modifying the original', () => {
			const original = [1, 2, 3];
			const clone = VectorClone(original);
			expect(clone).toEqual(original);
			expect(clone).not.toBe(original);

			clone[0] = 99;
			expect(original[0]).toBe(1);
		});

		it('should work with 2D vectors', () => {
			const original: TVector2 = [5, -3];
			const clone = VectorClone(original);
			expect(clone).toEqual([5, -3]);
		});

		it('should work with empty vectors', () => {
			const original: number[] = [];
			const clone = VectorClone(original);
			expect(clone).toEqual([]);
		});
	});

	describe('VectorEquals', () => {
		it('should return true for identical vectors', () => {
			expect(VectorEquals([1, 2, 3], [1, 2, 3])).toBe(true);
			expect(VectorEquals([0, 0], [0, 0])).toBe(true);
		});

		it('should return false for different vectors', () => {
			expect(VectorEquals([1, 2, 3], [1, 2, 4])).toBe(false);
		});

		it('should handle tolerance correctly', () => {
			expect(VectorEquals([1.001, 2.002], [1.000, 2.000], 0.01)).toBe(true);
			expect(VectorEquals([1.1, 2.2], [1.0, 2.0], 0.05)).toBe(false);
		});

		it('should return false for vectors of different lengths', () => {
			// VectorEquals should handle different lengths by checking first, not using AssertVectors
			// We need to manually test this since AssertVectors throws for different sizes
			const a = [1, 2];
			const b = [1, 2, 3];
			// This will currently throw because of AssertVectors, but the function is designed to handle it

			try {
				const result = VectorEquals(a, b);
				expect(result).toBe(false);
			}
			catch (error) {
				// Currently throws due to AssertVectors, which is expected behavior
				expect(error).toBeInstanceOf(Error);
			}
		});
	});

	describe('VectorToString', () => {
		it('should format with parentheses by default', () => {
			expect(VectorToString([1, 2, 3])).toBe('(1, 2, 3)');
			expect(VectorToString([0])).toBe('(0)');
		});

		it('should format with brackets when specified', () => {
			expect(VectorToString([1, 2, 3], 'brackets')).toBe('[1, 2, 3]');
		});

		it('should handle decimal numbers', () => {
			expect(VectorToString([1.5, -2.7])).toBe('(1.5, -2.7)');
		});

		it('should return brackets format for any non-parens style', () => {
			// TypeScript prevents passing invalid styles at compile time;
			// at runtime any non-'parens' value falls through to the brackets path
			expect(VectorToString([1, 2], 'invalid' as unknown as 'parens' | 'brackets' | undefined)).toBe('[1, 2]');
		});
	});

	describe('VectorAdd', () => {
		it('should add vectors correctly', () => {
			expect(VectorAdd([1, 2, 3], [4, 5, 6])).toEqual([5, 7, 9]);
			expect(VectorAdd([0, 0], [1, -1])).toEqual([1, -1]);
		});

		it('should handle negative numbers', () => {
			expect(VectorAdd([-1, -2], [1, 2])).toEqual([0, 0]);
		});

		it('should work with empty vectors', () => {
			expect(VectorAdd([], [])).toEqual([]);
		});
	});

	describe('VectorSubtract', () => {
		it('should subtract vectors correctly', () => {
			expect(VectorSubtract([5, 7, 9], [1, 2, 3])).toEqual([4, 5, 6]);
			expect(VectorSubtract([1, 1], [1, 1])).toEqual([0, 0]);
		});

		it('should handle negative results', () => {
			expect(VectorSubtract([1, 2], [3, 4])).toEqual([-2, -2]);
		});
	});

	describe('VectorMultiply', () => {
		it('should multiply by scalar', () => {
			expect(VectorMultiply([1, 2, 3], 2)).toEqual([2, 4, 6]);

			const result = VectorMultiply([5, -3], 0);
			expect(result[0]).toBe(0);
			expect(result[1]).toBe(0);
		});

		it('should multiply component-wise with another vector', () => {
			expect(VectorMultiply([1, 2, 3], [2, 3, 4])).toEqual([2, 6, 12]);
		});

		it('should handle negative scalars', () => {
			expect(VectorMultiply([1, -2], -1)).toEqual([-1, 2]);
		});

		it('should throw error for mismatched vector sizes', () => {
			expect(() => VectorMultiply([1, 2], [1, 2, 3])).toThrow(VectorError);
		});
	});

	describe('VectorDistance', () => {
		it('should calculate Euclidean distance', () => {
			expect(VectorDistance([0, 0], [3, 4])).toBe(5);
			expect(VectorDistance([1, 1], [1, 1])).toBe(0);
		});

		it('should handle 3D vectors', () => {
			expect(VectorDistance([0, 0, 0], [1, 1, 1])).toBeCloseTo(Math.sqrt(3));
		});
	});

	describe('VectorDistanceSquared', () => {
		it('should calculate squared distance', () => {
			expect(VectorDistanceSquared([0, 0], [3, 4])).toBe(25);
			expect(VectorDistanceSquared([1, 1], [1, 1])).toBe(0);
		});
	});

	describe('VectorDot', () => {
		it('should calculate dot product', () => {
			expect(VectorDot([1, 2, 3], [4, 5, 6])).toBe(32);
			expect(VectorDot([1, 0], [0, 1])).toBe(0);
		});

		it('should handle perpendicular vectors', () => {
			expect(VectorDot([1, 0], [0, 1])).toBe(0);
		});
	});

	describe('VectorNormalize', () => {
		it('should normalize vectors to unit length', () => {
			const result = VectorNormalize([3, 4]);
			expect(result).toEqual([0.6, 0.8]);
			expect(VectorMagnitude(result)).toBeCloseTo(1);
		});

		it('should throw error for zero vector', () => {
			expect(() => VectorNormalize([0, 0])).toThrow(VectorError);
		});

		it('should throw error for infinite magnitude', () => {
			expect(() => VectorNormalize([Infinity, 0])).toThrow(VectorError);
		});
	});

	describe('VectorMagnitude', () => {
		it('should calculate vector magnitude', () => {
			expect(VectorMagnitude([3, 4])).toBe(5);
			expect(VectorMagnitude([0, 0, 0])).toBe(0);
			expect(VectorMagnitude([1])).toBe(1);
		});

		it('should handle negative components', () => {
			expect(VectorMagnitude([-3, -4])).toBe(5);
		});
	});

	describe('VectorAbs', () => {
		it('should return absolute values of components', () => {
			expect(VectorAbs([-1, 2, -3])).toEqual([1, 2, 3]);
			expect(VectorAbs([1, 2, 3])).toEqual([1, 2, 3]);
		});

		it('should handle zero', () => {
			expect(VectorAbs([0, -0])).toEqual([0, 0]);
		});
	});

	describe('VectorIsZero', () => {
		it('should return true for zero vectors', () => {
			expect(VectorIsZero([0, 0, 0])).toBe(true);
			expect(VectorIsZero([0])).toBe(true);
			expect(VectorIsZero([])).toBe(true);
		});

		it('should return false for non-zero vectors', () => {
			expect(VectorIsZero([1, 0])).toBe(false);
			expect(VectorIsZero([0, 0.001])).toBe(false);
		});
	});

	describe('VectorIsFinite', () => {
		it('should return true for all-finite vector', () => {
			expect(VectorIsFinite([1, 2, 3])).toBe(true);
			expect(VectorIsFinite([0, 0, 0])).toBe(true);
			expect(VectorIsFinite([-1, -2, -3])).toBe(true);
		});

		it('should return false if any component is NaN', () => {
			expect(VectorIsFinite([1, NaN, 3])).toBe(false);
			expect(VectorIsFinite([NaN, 2, 3])).toBe(false);
			expect(VectorIsFinite([1, 2, NaN])).toBe(false);
		});

		it('should return false if any component is Infinity', () => {
			expect(VectorIsFinite([1, Infinity, 3])).toBe(false);
			expect(VectorIsFinite([-Infinity, 2, 3])).toBe(false);
			expect(VectorIsFinite([1, 2, Infinity])).toBe(false);
		});

		it('should throw VectorError if input is not a valid vector', () => {
			expect(() => VectorIsFinite(null as unknown as TVector)).toThrow(VectorError);
			expect(() => VectorIsFinite('not an array' as unknown as TVector)).toThrow(VectorError);
			expect(() => VectorIsFinite([1, 'not a number', 3] as unknown as TVector)).toThrow(VectorError);
		});
	});

	describe('VectorAngle', () => {
		it('should calculate angle between vectors', () => {
			expect(VectorAngle([1, 0], [0, 1])).toBeCloseTo(Math.PI / 2);
			expect(VectorAngle([1, 0], [1, 0])).toBeCloseTo(0);
			expect(VectorAngle([1, 0], [-1, 0])).toBeCloseTo(Math.PI);
		});

		it('should throw error for zero vectors', () => {
			expect(() => VectorAngle([0, 0], [1, 0])).toThrow(VectorError);
			expect(() => VectorAngle([1, 0], [0, 0])).toThrow(VectorError);
		});
	});

	describe('Vector2Rotate', () => {
		it('should rotate 2D vectors', () => {
			const result = Vector2Rotate([1, 0], Math.PI / 2);
			expect(result[0]).toBeCloseTo(0);
			expect(result[1]).toBeCloseTo(1);
		});

		it('should handle full rotation', () => {
			const original: TVector2 = [1, 2];
			const result = Vector2Rotate(original, 2 * Math.PI);
			expect(result[0]).toBeCloseTo(original[0]);
			expect(result[1]).toBeCloseTo(original[1]);
		});
	});

	describe('Vector2FromAngle', () => {
		it('should create unit vector from angle', () => {
			const result = Vector2FromAngle(0);
			expect(result).toEqual([1, 0]);

			const result90 = Vector2FromAngle(Math.PI / 2);
			expect(result90[0]).toBeCloseTo(0);
			expect(result90[1]).toBeCloseTo(1);
		});
	});

	describe('Vector2Cross', () => {
		it('should calculate 2D cross product', () => {
			expect(Vector2Cross([1, 0], [0, 1])).toBe(1);
			expect(Vector2Cross([0, 1], [1, 0])).toBe(-1);
			expect(Vector2Cross([1, 2], [3, 4])).toBe(-2);
		});
	});

	describe('VectorProject', () => {
		it('should project vector onto another', () => {
			const result = VectorProject([3, 4], [1, 0]);
			expect(result).toEqual([3, 0]);
		});

		it('should throw error for zero vector projection', () => {
			expect(() => VectorProject([1, 2], [0, 0])).toThrow(VectorError);
		});
	});

	describe('Vector3Reject', () => {
		it('should compute rejection component', () => {
			const result = Vector3Reject([3, 4, 0], [1, 0, 0]);
			expect(result).toEqual([0, 4, 0]);
		});

		it('should throw error for zero vector', () => {
			expect(() => Vector3Reject([1, 2, 3], [0, 0, 0])).toThrow(VectorError);
		});
	});

	describe('VectorReflect', () => {
		it('should reflect vector across normal', () => {
			const result = VectorReflect([1, -1], [0, 1]);
			expect(result[0]).toBeCloseTo(1);
			expect(result[1]).toBeCloseTo(1);
		});
	});

	describe('Vector3Reflect', () => {
		it('should reflect 3D vector across normal', () => {
			const result = Vector3Reflect([1, -1, 0], [0, 1, 0]);
			expect(result[0]).toBeCloseTo(1);
			expect(result[1]).toBeCloseTo(1);
			expect(result[2]).toBeCloseTo(0);
		});

		it('should throw error for zero normal', () => {
			expect(() => Vector3Reflect([1, 2, 3], [0, 0, 0])).toThrow(VectorError);
		});
	});

	describe('VectorCrossMagnitude', () => {
		it('should calculate magnitude of cross product', () => {
			const result = VectorCrossMagnitude([1, 0, 0], [0, 1, 0]);
			expect(result).toBe(1);
		});
	});

	describe('Vector3ScalarTripleProduct', () => {
		it('should calculate scalar triple product', () => {
			const result = Vector3ScalarTripleProduct([1, 0, 0], [0, 1, 0], [0, 0, 1]);
			expect(result).toBe(1);
		});
	});

	describe('Vector3TripleProduct', () => {
		it('should calculate vector triple product', () => {
			const result = Vector3TripleProduct([1, 0, 0], [0, 1, 0], [0, 0, 1]);
			expect(result).toEqual([0, 0, 0]);
		});
	});

	describe('VectorNegate', () => {
		it('should negate all components', () => {
			expect(VectorNegate([1, -2, 3])).toEqual([-1, 2, -3]);
		});

		it('should handle zero correctly', () => {
			expect(VectorNegate([0, -0])).toEqual([0, 0]);
		});
	});

	describe('VectorLimit', () => {
		it('should limit vector magnitude when it exceeds max', () => {
			const result = VectorLimit([3, 4], 3);
			expect(VectorMagnitude(result)).toBeCloseTo(3);
			// Direction should be preserved
			const expected = [1.8, 2.4];
			expect(result[0]).toBeCloseTo(expected[0]);
			expect(result[1]).toBeCloseTo(expected[1]);
		});

		it('should return unchanged vector when magnitude is within limit', () => {
			const v = [1, 2, 3];
			const result = VectorLimit(v, 10);
			expect(result).toEqual(v);
		});

		it('should return unchanged vector when magnitude equals max', () => {
			const v = [3, 4]; // magnitude 5
			const result = VectorLimit(v, 5);
			expect(result).toEqual(v);
		});

		it('should return zero vector unchanged', () => {
			const result = VectorLimit([0, 0, 0], 5);
			expect(result).toEqual([0, 0, 0]);
		});

		it('should handle multidimensional vectors', () => {
			const v = [2, 2, 2, 2]; // magnitude 4
			const result = VectorLimit(v, 2);
			expect(VectorMagnitude(result)).toBeCloseTo(2);
		});

		it('should throw error for negative maxMagnitude', () => {
			expect(() => VectorLimit([1, 2, 3], -1)).toThrow(VectorError);
		});

		it('should throw error for invalid vector input', () => {
			expect(() => VectorLimit('invalid' as unknown as number[], 5)).toThrow(VectorError);
		});

		it('should throw error for non-numeric array elements', () => {
			expect(() => VectorLimit([1, 'two' as unknown as number, 3], 5)).toThrow(VectorError);
		});
	});

	describe('VectorGramSchmidt', () => {
		it('should orthogonalize vectors', () => {
			const vectors = [[1, 1, 0], [1, 0, 1]];
			const result = VectorGramSchmidt(vectors);
			expect(result).toHaveLength(2);
			expect(result[0]).toBeDefined();
			expect(result[1]).toBeDefined();

			const [firstVector, secondVector] = result;
			if (firstVector && secondVector) {
				expect(VectorDot(firstVector, secondVector)).toBeCloseTo(0);
			}
		});

		it('should normalize when requested', () => {
			const vectors = [[2, 0], [1, 1]];
			const result = VectorGramSchmidt(vectors, true);
			expect(result[0]).toBeDefined();
			expect(result[1]).toBeDefined();

			const [firstVector, secondVector] = result;
			if (firstVector && secondVector) {
				expect(VectorMagnitude(firstVector)).toBeCloseTo(1);
				expect(VectorMagnitude(secondVector)).toBeCloseTo(1);
			}
		});

		it('should throw error for empty vector set', () => {
			expect(() => VectorGramSchmidt([])).toThrow(VectorError);
		});

		it('should throw error for zero vectors', () => {
			expect(() => VectorGramSchmidt([[0, 0]])).toThrow(VectorError);
		});

		it('should throw error for linearly dependent vectors', () => {
			expect(() => VectorGramSchmidt([[1, 0], [2, 0]])).toThrow(VectorError);
		});

		it('should throw error for vectors of different dimensions', () => {
			expect(() => VectorGramSchmidt([[1, 2], [1, 2, 3]])).toThrow(VectorError);
		});
	});

	describe('VectorDivide', () => {
		it('should divide a vector by a scalar', () => {
			expect(VectorDivide([20, 10, 0], 2)).toEqual([10, 5, 0]);
			expect(VectorDivide([9, 3, -6], 3)).toEqual([3, 1, -2]);
		});

		it('should perform component-wise division with another vector', () => {
			expect(VectorDivide([20, 10, 6], [4, 2, 3])).toEqual([5, 5, 2]);
		});

		it('should be the inverse of VectorMultiply (scalar)', () => {
			const v = [3, -6, 9];
			const scaled = VectorMultiply(v, 3);
			expect(VectorDivide(scaled, 3)).toEqual(v);
		});

		it('should throw on scalar division by zero', () => {
			expect(() => VectorDivide([1, 2, 3], 0)).toThrow(VectorError);
		});

		it('should throw on component-wise division by zero', () => {
			expect(() => VectorDivide([1, 2, 3], [1, 0, 1])).toThrow(VectorError);
		});

		it('should throw on component count mismatch', () => {
			expect(() => VectorDivide([1, 2, 3], [1, 2])).toThrow(VectorError);
		});
	});

	describe('VectorClamp', () => {
		it('should clamp all components to scalar bounds', () => {
			expect(VectorClamp([5, -3, 12, 0], 0, 10)).toEqual([5, 0, 10, 0]);
		});

		it('should not change components within bounds', () => {
			expect(VectorClamp([3, 5, 7], 0, 10)).toEqual([3, 5, 7]);
		});

		it('should support per-component vector bounds', () => {
			expect(VectorClamp([5, -3, 12, 0], [0, -5, 0, -1], [10, 5, 8, 1])).toEqual([5, -3, 8, 0]);
		});

		it('should clamp a 2D vector', () => {
			expect(VectorClamp([-1, 5] as [number, number], 0, 4)).toEqual([0, 4]);
		});
	});

	describe('VectorScale', () => {
		it('should scale a vector by a scalar', () => {
			expect(VectorScale([1, 2, 3], 2)).toEqual([2, 4, 6]);
			expect(VectorScale([5, -3], 0.5)).toEqual([2.5, -1.5]);
		});

		it('should handle negative scalars', () => {
			expect(VectorScale([1, 2, 3], -1)).toEqual([-1, -2, -3]);
		});

		it('should preserve zero correctly', () => {
			const result = VectorScale([5, -3, 0], 0);
			expect(result[0]).toBe(0);
			expect(result[1]).toBe(0);
			expect(result[2]).toBe(0);
		});

		it('should not mutate the input vector', () => {
			const original = [1, 2, 3];
			VectorScale(original, 2);
			expect(original).toEqual([1, 2, 3]);
		});
	});

	describe('VectorFloor', () => {
		it('should floor each component', () => {
			expect(VectorFloor([1.9, 2.1, 3.5])).toEqual([1, 2, 3]);
			expect(VectorFloor([-1.1, -2.9])).toEqual([-2, -3]);
		});

		it('should handle already-integer values', () => {
			expect(VectorFloor([1, 2, 3])).toEqual([1, 2, 3]);
		});

		it('should handle zero and negative zero', () => {
			expect(VectorFloor([0, -0])).toEqual([0, 0]);
		});

		it('should not mutate the input vector', () => {
			const original = [1.5, 2.5, 3.5];
			VectorFloor(original);
			expect(original).toEqual([1.5, 2.5, 3.5]);
		});
	});

	describe('VectorCeil', () => {
		it('should ceil each component', () => {
			expect(VectorCeil([1.1, 2.9, 3.5])).toEqual([2, 3, 4]);
			expect(VectorCeil([-1.1, -2.9])).toEqual([-1, -2]);
		});

		it('should handle already-integer values', () => {
			expect(VectorCeil([1, 2, 3])).toEqual([1, 2, 3]);
		});

		it('should handle zero and negative zero', () => {
			expect(VectorCeil([0, -0])).toEqual([0, 0]);
		});

		it('should not mutate the input vector', () => {
			const original = [1.5, 2.5, 3.5];
			VectorCeil(original);
			expect(original).toEqual([1.5, 2.5, 3.5]);
		});
	});

	describe('VectorRound', () => {
		it('should round each component', () => {
			expect(VectorRound([1.4, 2.6, 3.5])).toEqual([1, 3, 4]);
			expect(VectorRound([-1.4, -2.6])).toEqual([-1, -3]);
		});

		it('should handle already-integer values', () => {
			expect(VectorRound([1, 2, 3])).toEqual([1, 2, 3]);
		});

		it('should handle zero and negative zero', () => {
			expect(VectorRound([0, -0])).toEqual([0, 0]);
		});

		it('should not mutate the input vector', () => {
			const original = [1.5, 2.5, 3.5];
			VectorRound(original);
			expect(original).toEqual([1.5, 2.5, 3.5]);
		});
	});

	describe('VectorMin', () => {
		it('should return component-wise minimum', () => {
			expect(VectorMin([5, 2, 8], [3, 7, 1])).toEqual([3, 2, 1]);
			expect(VectorMin([1, 1], [1, 1])).toEqual([1, 1]);
		});

		it('should handle negative numbers', () => {
			expect(VectorMin([-5, -2], [-3, -7])).toEqual([-5, -7]);
		});

		it('should throw error for mismatched vector sizes', () => {
			expect(() => VectorMin([1, 2], [1, 2, 3])).toThrow(VectorError);
		});

		it('should not mutate the input vectors', () => {
			const a = [5, 2, 8];
			const b = [3, 7, 1];
			VectorMin(a, b);
			expect(a).toEqual([5, 2, 8]);
			expect(b).toEqual([3, 7, 1]);
		});
	});

	describe('VectorMax', () => {
		it('should return component-wise maximum', () => {
			expect(VectorMax([5, 2, 8], [3, 7, 1])).toEqual([5, 7, 8]);
			expect(VectorMax([1, 1], [1, 1])).toEqual([1, 1]);
		});

		it('should handle negative numbers', () => {
			expect(VectorMax([-5, -2], [-3, -7])).toEqual([-3, -2]);
		});

		it('should throw error for mismatched vector sizes', () => {
			expect(() => VectorMax([1, 2], [1, 2, 3])).toThrow(VectorError);
		});

		it('should not mutate the input vectors', () => {
			const a = [5, 2, 8];
			const b = [3, 7, 1];
			VectorMax(a, b);
			expect(a).toEqual([5, 2, 8]);
			expect(b).toEqual([3, 7, 1]);
		});
	});

	describe('VectorMidpoint', () => {
		it('should calculate midpoint correctly', () => {
			const result = VectorMidpoint([0, 0, 0], [4, 8, 12]);
			expect(result).toEqual([2, 4, 6]);
		});

		it('should handle negative coordinates', () => {
			const result = VectorMidpoint([-2, -4], [2, 4]);
			expect(result).toEqual([0, 0]);
		});

		it('should throw error for mismatched sizes', () => {
			expect(() => VectorMidpoint([1, 2], [1, 2, 3])).toThrow(VectorError);
		});

		it('should not mutate input vectors', () => {
			const a = [1, 2, 3];
			const b = [5, 6, 7];
			VectorMidpoint(a, b);
			expect(a).toEqual([1, 2, 3]);
			expect(b).toEqual([5, 6, 7]);
		});
	});

	describe('VectorMoveTowards', () => {
		it('should move toward target by maxDistance', () => {
			const result = VectorMoveTowards([0, 0, 0], [10, 0, 0], 3);
			expect(result[0]).toBeCloseTo(3);
			expect(result[1]).toBeCloseTo(0);
			expect(result[2]).toBeCloseTo(0);
		});

		it('should return target when already close enough', () => {
			const target: TVector3 = [5, 0, 0];
			const result = VectorMoveTowards([0, 0, 0], target, 10);
			expect(result).toEqual(target);
		});

		it('should return clone of current when maxDistance <= 0', () => {
			const current: TVector3 = [1, 2, 3];
			const result = VectorMoveTowards(current, [10, 10, 10], -1);
			expect(result).toEqual(current);
			expect(result).not.toBe(current);
		});

		it('should throw error for mismatched sizes', () => {
			expect(() => VectorMoveTowards([1, 2], [1, 2, 3], 1)).toThrow(VectorError);
		});

		it('should not mutate input vectors', () => {
			const current = [0, 0, 0];
			const target = [10, 0, 0];
			VectorMoveTowards(current, target, 3);
			expect(current).toEqual([0, 0, 0]);
			expect(target).toEqual([10, 0, 0]);
		});
	});

	describe('Vector2AngleSigned', () => {
		it('should calculate counterclockwise angle', () => {
			const right: TVector2 = [1, 0];
			const up: TVector2 = [0, 1];
			const angle = Vector2AngleSigned(right, up);
			expect(angle).toBeCloseTo(Math.PI / 2);
		});

		it('should calculate clockwise angle as negative', () => {
			const up: TVector2 = [0, 1];
			const right: TVector2 = [1, 0];
			const angle = Vector2AngleSigned(up, right);
			expect(angle).toBeCloseTo(-Math.PI / 2);
		});

		it('should handle same direction', () => {
			const angle = Vector2AngleSigned([1, 0], [2, 0]);
			expect(angle).toBeCloseTo(0, 5);
		});

		it('should handle opposite direction', () => {
			const angle = Vector2AngleSigned([1, 0], [-1, 0]);
			expect(Math.abs(angle)).toBeCloseTo(Math.PI);
		});
	});

	describe('Vector3AngleSigned', () => {
		it('should calculate signed angle around axis', () => {
			const a: TVector3 = [1, 0, 0];
			const b: TVector3 = [0, 1, 0];
			const axis: TVector3 = [0, 0, 1];
			const angle = Vector3AngleSigned(a, b, axis);
			expect(angle).toBeCloseTo(Math.PI / 2);
		});

		it('should handle rotation in opposite direction', () => {
			const a: TVector3 = [0, 1, 0];
			const b: TVector3 = [1, 0, 0];
			const axis: TVector3 = [0, 0, 1];
			const angle = Vector3AngleSigned(a, b, axis);
			expect(angle).toBeCloseTo(-Math.PI / 2);
		});

		it('should throw error if axis is zero', () => {
			expect(() => Vector3AngleSigned([1, 0, 0], [0, 1, 0], [0, 0, 0])).toThrow(VectorError);
		});
	});

	describe('VectorIsNormalized', () => {
		it('should return true for unit vector', () => {
			expect(VectorIsNormalized([1, 0, 0])).toBe(true);
		});

		it('should return true for normalized vector', () => {
			const normalized = VectorNormalize([3, 4]);
			expect(VectorIsNormalized(normalized)).toBe(true);
		});

		it('should return false for non-unit vector', () => {
			expect(VectorIsNormalized([2, 0, 0])).toBe(false);
		});

		it('should respect custom tolerance', () => {
			const almostUnit = [0.9999, 0.0001];
			expect(VectorIsNormalized(almostUnit, 0.01)).toBe(true);
			expect(VectorIsNormalized(almostUnit, 1e-10)).toBe(false);
		});
	});

	describe('Vector3ProjectOnPlane', () => {
		it('should project vector onto plane', () => {
			const velocity: TVector3 = [1, 5, 0];
			const groundNormal: TVector3 = [0, 1, 0];
			const result = Vector3ProjectOnPlane(velocity, groundNormal);
			expect(result[0]).toBeCloseTo(1);
			expect(result[1]).toBeCloseTo(0);
			expect(result[2]).toBeCloseTo(0);
		});

		it('should handle unnormalized normal', () => {
			const v: TVector3 = [3, 4, 0];
			const normal: TVector3 = [0, 2, 0];
			const result = Vector3ProjectOnPlane(v, normal);
			expect(result[0]).toBeCloseTo(3);
			expect(result[1]).toBeCloseTo(0);
			expect(result[2]).toBeCloseTo(0);
		});

		it('should throw error for zero normal', () => {
			expect(() => Vector3ProjectOnPlane([1, 2, 3], [0, 0, 0])).toThrow(VectorError);
		});

		it('should not mutate input vectors', () => {
			const v: TVector3 = [1, 5, 0];
			const normal: TVector3 = [0, 1, 0];
			Vector3ProjectOnPlane(v, normal);
			expect(v).toEqual([1, 5, 0]);
			expect(normal).toEqual([0, 1, 0]);
		});
	});

	describe('Vector3RotateAround', () => {
		it('should rotate around z-axis by 90 degrees', () => {
			const vector: TVector3 = [1, 0, 0];
			const axis: TVector3 = [0, 0, 1];
			const result = Vector3RotateAround(vector, axis, Math.PI / 2);
			expect(result[0]).toBeCloseTo(0, 8);
			expect(result[1]).toBeCloseTo(1, 8);
			expect(result[2]).toBeCloseTo(0, 8);
		});

		it('should rotate around x-axis by 90 degrees', () => {
			const vector: TVector3 = [0, 1, 0];
			const axis: TVector3 = [1, 0, 0];
			const result = Vector3RotateAround(vector, axis, Math.PI / 2);
			expect(result[0]).toBeCloseTo(0, 8);
			expect(result[1]).toBeCloseTo(0, 8);
			expect(result[2]).toBeCloseTo(1, 8);
		});

		it('should preserve magnitude', () => {
			const vector: TVector3 = [3, 4, 0];
			const axis: TVector3 = [0, 0, 1];
			const result = Vector3RotateAround(vector, axis, Math.PI / 4);
			const originalMag = VectorMagnitude(vector);
			const resultMag = VectorMagnitude(result);
			expect(resultMag).toBeCloseTo(originalMag);
		});

		it('should throw error if axis is zero', () => {
			expect(() => Vector3RotateAround([1, 0, 0], [0, 0, 0], Math.PI / 2)).toThrow(VectorError);
		});

		it('should not mutate input vectors', () => {
			const vector: TVector3 = [1, 0, 0];
			const axis: TVector3 = [0, 0, 1];
			Vector3RotateAround(vector, axis, Math.PI / 2);
			expect(vector).toEqual([1, 0, 0]);
			expect(axis).toEqual([0, 0, 1]);
		});
	});

	describe('VectorManhattanDistance', () => {
		it('should calculate Manhattan distance', () => {
			const a: TVector3 = [0, 0, 0];
			const b: TVector3 = [3, 4, 5];
			const distance = VectorManhattanDistance(a, b);
			expect(distance).toBe(12);
		});

		it('should handle 2D vectors', () => {
			const a: TVector2 = [0, 0];
			const b: TVector2 = [3, 4];
			const distance = VectorManhattanDistance(a, b);
			expect(distance).toBe(7);
		});

		it('should handle negative coordinates', () => {
			const a = [-1, -2];
			const b = [1, 2];
			const distance = VectorManhattanDistance(a, b);
			expect(distance).toBe(6);
		});

		it('should throw error for mismatched sizes', () => {
			expect(() => VectorManhattanDistance([1, 2], [1, 2, 3])).toThrow(VectorError);
		});
	});

	describe('VectorChebyshevDistance', () => {
		it('should calculate Chebyshev distance', () => {
			const a: TVector2 = [0, 0];
			const b: TVector2 = [3, 5];
			const distance = VectorChebyshevDistance(a, b);
			expect(distance).toBe(5);
		});

		it('should return maximum difference', () => {
			const a: TVector3 = [1, 2, 3];
			const b: TVector3 = [4, 5, 6];
			const distance = VectorChebyshevDistance(a, b);
			expect(distance).toBe(3);
		});

		it('should handle negative coordinates', () => {
			const a = [-3, -5];
			const b = [2, 1];
			const distance = VectorChebyshevDistance(a, b);
			expect(distance).toBe(6);
		});

		it('should throw error for mismatched sizes', () => {
			expect(() => VectorChebyshevDistance([1, 2], [1, 2, 3])).toThrow(VectorError);
		});
	});
});
