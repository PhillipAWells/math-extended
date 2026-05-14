import {
	VectorError,
	AssertVector,
	AssertVector2,
	AssertVector3,
	AssertVector4,
	AssertVectorSameSize,
	ValidateVectorSameSize,
} from './asserts.js';

describe('Vector Assertions', () => {
	describe('VectorError', () => {
		it('should create a VectorError with message', () => {
			const error = new VectorError('test message');
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(VectorError);
			expect(error.message).toBe('test message');
		});

		it('should create a VectorError without message', () => {
			const error = new VectorError('');
			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(VectorError);
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
	});

	describe('AssertVectorSameSize', () => {
		it('should pass for valid vectors of same size', () => {
			expect(() => AssertVectorSameSize([[1, 2], [3, 4]])).not.toThrow();
			expect(() => AssertVectorSameSize([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).not.toThrow();
			expect(() => AssertVectorSameSize([[1]])).not.toThrow();
		});

		it('should throw for vectors of different sizes', () => {
			expect(() => AssertVectorSameSize([[1, 2], [3, 4, 5]])).toThrow(VectorError);
			expect(() => AssertVectorSameSize([[1], [2, 3], [4, 5, 6]])).toThrow(VectorError);
		});

		it('should throw for invalid vectors', () => {
			expect(() => AssertVectorSameSize([[1, 2], 'invalid' as unknown])).toThrow(VectorError);
			expect(() => AssertVectorSameSize([[1, 2], [3, 'string' as unknown]])).toThrow(VectorError);
		});

		it('should throw when no vectors provided', () => {
			expect(() => AssertVectorSameSize([])).toThrow(VectorError);
		});

		it('should handle single vector correctly', () => {
			expect(() => AssertVectorSameSize([[1, 2]])).not.toThrow();
		});

		it('should provide descriptive error for size mismatch', () => {
			expect(() => AssertVectorSameSize([[1, 2], [3, 4, 5]])).toThrow();
		});

		it('should provide descriptive error for no vectors', () => {
			const emptyVectors: unknown[] = [];
			expect(() => AssertVectorSameSize(emptyVectors)).toThrow();
		});
	});

	describe('ValidateVectorSameSize', () => {
		it('should return true for valid vectors of same size', () => {
			expect(ValidateVectorSameSize([[1, 2], [3, 4]])).toBe(true);
			expect(ValidateVectorSameSize([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toBe(true);
			expect(ValidateVectorSameSize([[1]])).toBe(true);
		});

		it('should return false for vectors of different sizes', () => {
			expect(ValidateVectorSameSize([[1, 2], [3, 4, 5]])).toBe(false);
			expect(ValidateVectorSameSize([[1], [2, 3], [4, 5, 6]])).toBe(false);
		});

		it('should return false for invalid vectors', () => {
			expect(ValidateVectorSameSize([[1, 2], 'invalid' as unknown])).toBe(false);
			expect(ValidateVectorSameSize([[1, 2], [3, 'string' as unknown]])).toBe(false);
		});

		it('should return false when empty array provided', () => {
			expect(ValidateVectorSameSize([])).toBe(false);
		});

		it('should not throw on invalid input', () => {
			expect(() => ValidateVectorSameSize([])).not.toThrow();
			expect(() => ValidateVectorSameSize([[1, 2], 'invalid' as unknown])).not.toThrow();
		});
	});
});
