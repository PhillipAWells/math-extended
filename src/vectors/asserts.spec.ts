import {
	VectorError,
	AssertVector,
	AssertVector2,
	AssertVector3,
	AssertVector4,
	AssertVectorValue,
	AssertVectors,
} from './asserts.js';

describe('Vector Assertions', () => {
	describe('VectorError', () => {
		it('should create a VectorError with message', () => {
			const error = new VectorError('test message');
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(VectorError);
			expect(error.name).toBe('VectorError');
			expect(error.message).toBe('test message');
		});

		it('should create a VectorError without message', () => {
			const error = new VectorError();
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(VectorError);
			expect(error.name).toBe('VectorError');
			expect(error.message).toBe('');
		});
	});

	describe('AssertVector', () => {
		it('should pass for valid vectors', () => {
			expect(() => AssertVector([1, 2, 3])).not.toThrow();
			expect(() => AssertVector([0])).not.toThrow();
			expect(() => AssertVector([1.5, -2.7, 3.14])).not.toThrow();
			expect(() => AssertVector([])).not.toThrow();
		});

		it('should throw for non-arrays', () => {
			expect(() => AssertVector(null)).toThrow(VectorError);
			expect(() => AssertVector(undefined)).toThrow(VectorError);
			expect(() => AssertVector(123)).toThrow(VectorError);
			expect(() => AssertVector('string')).toThrow(VectorError);
			expect(() => AssertVector({})).toThrow(VectorError);
		});

		it('should throw for arrays with non-number elements', () => {
			expect(() => AssertVector([1, 2, 'string'])).toThrow(VectorError);
			expect(() => AssertVector([1, null, 3])).toThrow(VectorError);
			expect(() => AssertVector([1, undefined, 3])).toThrow(VectorError);
			expect(() => AssertVector([1, {}, 3])).toThrow(VectorError);
			expect(() => AssertVector([NaN])).toThrow(VectorError);
		});

		it('should respect size constraints', () => {
			// Exact size
			expect(() => AssertVector([1, 2], { size: 2 })).not.toThrow();
			expect(() => AssertVector([1, 2, 3], { size: 2 })).toThrow(VectorError);
			expect(() => AssertVector([1], { size: 2 })).toThrow(VectorError);

			// Minimum size
			expect(() => AssertVector([1, 2, 3], { minSize: 2 })).not.toThrow();
			expect(() => AssertVector([1, 2], { minSize: 2 })).not.toThrow();
			expect(() => AssertVector([1], { minSize: 2 })).toThrow(VectorError);

			// Maximum size
			expect(() => AssertVector([1], { maxSize: 2 })).not.toThrow();
			expect(() => AssertVector([1, 2], { maxSize: 2 })).not.toThrow();
			expect(() => AssertVector([1, 2, 3], { maxSize: 2 })).toThrow(VectorError);
		});

		it('should respect combined constraints', () => {
			expect(() => AssertVector([1, 2], { minSize: 1, maxSize: 3 })).not.toThrow();
			expect(() => AssertVector([1], { minSize: 2, maxSize: 3 })).toThrow(VectorError);
			expect(() => AssertVector([1, 2, 3, 4], { minSize: 1, maxSize: 3 })).toThrow(VectorError);
		});

		it('should use custom exception properties', () => {
			const customException = { message: 'Custom error', customProp: true };
			expect(() => AssertVector('invalid', {}, customException)).toThrow('Custom error');
		});
	});

	describe('AssertVector2', () => {
		it('should pass for valid 2D vectors', () => {
			expect(() => AssertVector2([1, 2])).not.toThrow();
			expect(() => AssertVector2([0, 0])).not.toThrow();
			expect(() => AssertVector2([-1.5, 2.7])).not.toThrow();
		});

		it('should throw for invalid 2D vectors', () => {
			expect(() => AssertVector2([1])).toThrow(VectorError);
			expect(() => AssertVector2([1, 2, 3])).toThrow(VectorError);
			expect(() => AssertVector2([])).toThrow(VectorError);
			expect(() => AssertVector2([1, 'string'])).toThrow(VectorError);
			expect(() => AssertVector2('invalid')).toThrow(VectorError);
		});

		it('should use custom exception properties', () => {
			const customException = { message: 'Custom 2D error' };
			expect(() => AssertVector2([1], customException)).toThrow('Custom 2D error');
		});
	});

	describe('AssertVector3', () => {
		it('should pass for valid 3D vectors', () => {
			expect(() => AssertVector3([1, 2, 3])).not.toThrow();
			expect(() => AssertVector3([0, 0, 0])).not.toThrow();
			expect(() => AssertVector3([-1.5, 2.7, -3.14])).not.toThrow();
		});

		it('should throw for invalid 3D vectors', () => {
			expect(() => AssertVector3([1, 2])).toThrow(VectorError);
			expect(() => AssertVector3([1, 2, 3, 4])).toThrow(VectorError);
			expect(() => AssertVector3([])).toThrow(VectorError);
			expect(() => AssertVector3([1, 2, 'string'])).toThrow(VectorError);
			expect(() => AssertVector3('invalid')).toThrow(VectorError);
		});

		it('should use custom exception properties', () => {
			const customException = { message: 'Custom 3D error' };
			expect(() => AssertVector3([1, 2], customException)).toThrow('Custom 3D error');
		});
	});

	describe('AssertVector4', () => {
		it('should pass for valid 4D vectors', () => {
			expect(() => AssertVector4([1, 2, 3, 4])).not.toThrow();
			expect(() => AssertVector4([0, 0, 0, 0])).not.toThrow();
			expect(() => AssertVector4([-1.5, 2.7, -3.14, 4.2])).not.toThrow();
		});

		it('should throw for invalid 4D vectors', () => {
			expect(() => AssertVector4([1, 2, 3])).toThrow(VectorError);
			expect(() => AssertVector4([1, 2, 3, 4, 5])).toThrow(VectorError);
			expect(() => AssertVector4([])).toThrow(VectorError);
			expect(() => AssertVector4([1, 2, 3, 'string'])).toThrow(VectorError);
			expect(() => AssertVector4('invalid')).toThrow(VectorError);
		});

		it('should use custom exception properties', () => {
			const customException = { message: 'Custom 4D error' };
			expect(() => AssertVector4([1, 2, 3], customException)).toThrow('Custom 4D error');
		});
	});

	describe('AssertVectorValue', () => {
		it('should pass for valid numbers', () => {
			expect(() => AssertVectorValue(1)).not.toThrow();
			expect(() => AssertVectorValue(0)).not.toThrow();
			expect(() => AssertVectorValue(-1.5)).not.toThrow();
			expect(() => AssertVectorValue(3.14159)).not.toThrow();
			expect(() => AssertVectorValue(Infinity)).not.toThrow();
			expect(() => AssertVectorValue(-Infinity)).not.toThrow();
		});

		it('should throw for invalid values', () => {
			expect(() => AssertVectorValue(NaN)).toThrow(VectorError);
			expect(() => AssertVectorValue('string')).toThrow(VectorError);
			expect(() => AssertVectorValue(null)).toThrow(VectorError);
			expect(() => AssertVectorValue(undefined)).toThrow(VectorError);
			expect(() => AssertVectorValue({})).toThrow(VectorError);
			expect(() => AssertVectorValue([])).toThrow(VectorError);
		});

		it('should include index in error message when provided', () => {
			expect(() => AssertVectorValue('invalid', {}, { index: 42 })).toThrow('Vector[42] Not a Number');
		});

		it('should throw with generic message when no index provided', () => {
			expect(() => AssertVectorValue('invalid')).toThrow('Vector element must be a number, got string');
		});

		it('should use custom exception properties', () => {
			const customException = { message: 'Custom value error' };
			expect(() => AssertVectorValue('invalid', {}, customException)).toThrow('Custom value error');
		});
	});

	describe('AssertVectorValue (extended constraints)', () => {
		it('should throw if finite=true and value is Infinity', () => {
			expect(() => AssertVectorValue(Infinity, { finite: true })).toThrow('Vector Must be Finite');
			expect(() => AssertVectorValue(-Infinity, { finite: true })).toThrow('Vector Must be Finite');
		});
		it('should throw if integer=true and value is not integer', () => {
			expect(() => AssertVectorValue(1.5, { integer: true })).toThrow('Vector Must be an Integer');
		});
		it('should throw if eq is set and value does not match', () => {
			expect(() => AssertVectorValue(2, { eq: 3 })).toThrow('Vector Must be equal to 3');
		});
		it('should throw if gt is set and value is not greater', () => {
			expect(() => AssertVectorValue(2, { gt: 2 })).toThrow('Vector Must be greater than 2');
			expect(() => AssertVectorValue(1, { gt: 2 })).toThrow('Vector Must be greater than 2');
		});
		it('should throw if gte is set and value is less', () => {
			expect(() => AssertVectorValue(1, { gte: 2 })).toThrow('Vector Must be greater than or equal to 2');
		});
		it('should throw if lt is set and value is not less', () => {
			expect(() => AssertVectorValue(3, { lt: 2 })).toThrow('Vector Must be less than 2');
			expect(() => AssertVectorValue(2, { lt: 2 })).toThrow('Vector Must be less than 2');
		});
		it('should throw if lte is set and value is greater', () => {
			expect(() => AssertVectorValue(3, { lte: 2 })).toThrow('Vector Must be less than or equal to 2');
		});
		it('should include index in all constraint error messages', () => {
			expect(() => AssertVectorValue(Infinity, { finite: true }, { index: 5 })).toThrow('Vector[5] Must be Finite');
			expect(() => AssertVectorValue(1.5, { integer: true }, { index: 6 })).toThrow('Vector[6] Must be an Integer');
			expect(() => AssertVectorValue(2, { eq: 3 }, { index: 7 })).toThrow('Vector[7] Must be equal to 3');
			expect(() => AssertVectorValue(2, { gt: 2 }, { index: 8 })).toThrow('Vector[8] Must be greater than 2');
			expect(() => AssertVectorValue(1, { gte: 2 }, { index: 9 })).toThrow('Vector[9] Must be greater than or equal to 2');
			expect(() => AssertVectorValue(3, { lt: 2 }, { index: 10 })).toThrow('Vector[10] Must be less than 2');
			expect(() => AssertVectorValue(3, { lte: 2 }, { index: 11 })).toThrow('Vector[11] Must be less than or equal to 2');
		});
	});

	describe('AssertVectors', () => {
		describe('individual arguments syntax', () => {
			it('should pass for valid vectors of same size', () => {
				expect(() => AssertVectors([[1, 2], [3, 4]])).not.toThrow();
				expect(() => AssertVectors([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).not.toThrow();
				expect(() => AssertVectors([[1]])).not.toThrow();
			});

			it('should throw for vectors of different sizes', () => {
				expect(() => AssertVectors([[1, 2], [3, 4, 5]])).toThrow(VectorError);
				expect(() => AssertVectors([[1], [2, 3], [4, 5, 6]])).toThrow(VectorError);
			});

			it('should throw for invalid vectors', () => {
				expect(() => AssertVectors([[1, 2], 'invalid'])).toThrow(VectorError);
				expect(() => AssertVectors([[1, 2], [3, 'string']])).toThrow(VectorError);
			});

			it('should throw when no vectors provided', () => {
				expect(() => AssertVectors([])).toThrow(VectorError);
			});
		});

		describe('array with args syntax', () => {
			it('should pass for valid vectors with same size check', () => {
				const vectors = [[1, 2], [3, 4]];
				expect(() => AssertVectors(vectors, { sameSize: true })).not.toThrow();
			});

			it('should pass for valid vectors without same size check', () => {
				const vectors = [[1, 2], [3, 4, 5]];
				expect(() => AssertVectors(vectors, { sameSize: false })).not.toThrow();
			});

			it('should throw for vectors of different sizes when sameSize is true', () => {
				const vectors = [[1, 2], [3, 4, 5]];
				expect(() => AssertVectors(vectors, { sameSize: true })).toThrow(VectorError);
			});

			it('should respect size constraints', () => {
				const vectors = [[1, 2], [3, 4]];
				expect(() => AssertVectors(vectors, { size: 2 })).not.toThrow();
				expect(() => AssertVectors(vectors, { size: 3 })).toThrow(VectorError);

				expect(() => AssertVectors(vectors, { minSize: 1 })).not.toThrow();
				expect(() => AssertVectors(vectors, { minSize: 3 })).toThrow(VectorError);

				expect(() => AssertVectors(vectors, { maxSize: 3 })).not.toThrow();
				expect(() => AssertVectors(vectors, { maxSize: 1 })).toThrow(VectorError);
			});

			it('should use custom exception properties', () => {
				const vectors = [[1, 2], [3, 4, 5]];
				const customException = { message: 'Custom vectors error' };
				expect(() => AssertVectors(vectors, { sameSize: true }, customException)).toThrow('Custom vectors error');
			});

			it('should throw when empty array provided', () => {
				expect(() => AssertVectors([], {})).toThrow(VectorError);
			});
		});

		describe('edge cases', () => {
			it('should handle single vector correctly', () => {
				expect(() => AssertVectors([[1, 2]])).not.toThrow();

				const vectors = [[1, 2]];
				expect(() => AssertVectors(vectors, { sameSize: true })).not.toThrow();
			});

			it('should handle mixed valid and invalid vectors', () => {
				// @ts-expect-error - second vector contains a string, which is not a valid vector element
				expect(() => AssertVectors([1, 2], [3, 'invalid'])).toThrow(VectorError);

				expect(() => AssertVectors([[1, 2], [3, 'invalid']], {})).toThrow(VectorError);
				expect(() => AssertVectors([[1, 2], [3, 'invalid']], {})).toThrow(VectorError);
			});

			it('should detect args object correctly', () => {
				// This should be treated as individual vectors, not array + args
				// @ts-expect-error - second argument is not a valid options object, should be treated as a vector
				expect(() => AssertVectors([1, 2], { notAnArgsObject: true })).toThrow(VectorError);
			});
		});

		describe('error messages', () => {
			it('should provide descriptive error for size mismatch', () => {
				expect(() => AssertVectors([[1, 2], [3, 4, 5]])).toThrow('Vectors at index 0 and 1 do not have the same size (2 vs 3)');
			});

			it('should provide descriptive error for no vectors', () => {
				const emptyVectors: unknown[] = [];
				expect(() => AssertVectors(emptyVectors, { sameSize: true })).toThrow('Vectors array is empty');
			});
		});
	});
});
