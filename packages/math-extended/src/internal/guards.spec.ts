import {
	AssertNumber,
	AssertArray,
	AssertInstanceOf,
	AssertNotEquals,
	type IExceptionDetails
} from './guards.js';

describe('Internal Guards', () => {
	describe('AssertNumber', () => {
		describe('basic type validation', () => {
			it('should pass for valid numbers', () => {
				expect(() => AssertNumber(0)).not.toThrow();
				expect(() => AssertNumber(1)).not.toThrow();
				expect(() => AssertNumber(-1)).not.toThrow();
				expect(() => AssertNumber(3.14159)).not.toThrow();
				expect(() => AssertNumber(-2.5)).not.toThrow();
				expect(() => AssertNumber(Number.MAX_SAFE_INTEGER)).not.toThrow();
				expect(() => AssertNumber(Number.MIN_SAFE_INTEGER)).not.toThrow();
			});

			it('should throw for non-number values', () => {
				expect(() => AssertNumber(null)).toThrow(Error);
				expect(() => AssertNumber(undefined)).toThrow(Error);
				expect(() => AssertNumber('string')).toThrow(Error);
				expect(() => AssertNumber({})).toThrow(Error);
				expect(() => AssertNumber([])).toThrow(Error);
				expect(() => AssertNumber(true)).toThrow(Error);
				expect(() => AssertNumber(false)).toThrow(Error);
			});

			it('should provide default error message for non-number', () => {
				expect(() => AssertNumber('string')).toThrow('Expected a number, got string');
				expect(() => AssertNumber(null)).toThrow('Expected a number, got object');
			});
		});

		describe('finite constraint', () => {
			it('should pass for finite numbers when { finite: true }', () => {
				expect(() => AssertNumber(0, { finite: true })).not.toThrow();
				expect(() => AssertNumber(1.5, { finite: true })).not.toThrow();
				expect(() => AssertNumber(-1000, { finite: true })).not.toThrow();
				expect(() => AssertNumber(Number.MAX_SAFE_INTEGER, { finite: true })).not.toThrow();
			});

			it('should throw for NaN when { finite: true }', () => {
				expect(() => AssertNumber(NaN, { finite: true })).toThrow(Error);
				expect(() => AssertNumber(NaN, { finite: true })).toThrow('Expected a finite number, got NaN');
			});

			it('should throw for Infinity when { finite: true }', () => {
				expect(() => AssertNumber(Infinity, { finite: true })).toThrow(Error);
				expect(() => AssertNumber(Infinity, { finite: true })).toThrow('Expected a finite number, got Infinity');
			});

			it('should throw for -Infinity when { finite: true }', () => {
				expect(() => AssertNumber(-Infinity, { finite: true })).toThrow(Error);
				expect(() => AssertNumber(-Infinity, { finite: true })).toThrow('Expected a finite number, got -Infinity');
			});

			it('should ignore { finite: false }', () => {
				expect(() => AssertNumber(NaN, { finite: false })).not.toThrow();
				expect(() => AssertNumber(Infinity, { finite: false })).not.toThrow();
			});
		});

		describe('integer constraint', () => {
			it('should pass for integers when { integer: true }', () => {
				expect(() => AssertNumber(0, { integer: true })).not.toThrow();
				expect(() => AssertNumber(1, { integer: true })).not.toThrow();
				expect(() => AssertNumber(-1, { integer: true })).not.toThrow();
				expect(() => AssertNumber(999999, { integer: true })).not.toThrow();
			});

			it('should throw for non-integers when { integer: true }', () => {
				expect(() => AssertNumber(1.5, { integer: true })).toThrow(Error);
				expect(() => AssertNumber(1.1, { integer: true })).toThrow(Error);
				expect(() => AssertNumber(0.5, { integer: true })).toThrow(Error);
				expect(() => AssertNumber(-1.5, { integer: true })).toThrow(Error);
			});

			it('should provide default error message for non-integer', () => {
				expect(() => AssertNumber(1.5, { integer: true })).toThrow('Expected an integer, got 1.5');
				expect(() => AssertNumber(0.1, { integer: true })).toThrow('Expected an integer, got 0.1');
			});

			it('should throw for NaN when { integer: true }', () => {
				expect(() => AssertNumber(NaN, { integer: true })).toThrow();
			});

			it('should ignore { integer: false }', () => {
				expect(() => AssertNumber(1.5, { integer: false })).not.toThrow();
			});
		});

		describe('gt (greater than) constraint', () => {
			it('should pass when value > constraint', () => {
				expect(() => AssertNumber(2, { gt: 1 })).not.toThrow();
				expect(() => AssertNumber(0.1, { gt: 0 })).not.toThrow();
				expect(() => AssertNumber(5, { gt: -10 })).not.toThrow();
			});

			it('should throw when value equals constraint', () => {
				expect(() => AssertNumber(1, { gt: 1 })).toThrow(Error);
				expect(() => AssertNumber(0, { gt: 0 })).toThrow(Error);
			});

			it('should throw when value < constraint', () => {
				expect(() => AssertNumber(0, { gt: 1 })).toThrow(Error);
				expect(() => AssertNumber(-1, { gt: 0 })).toThrow(Error);
			});

			it('should provide default error message for gt violation', () => {
				expect(() => AssertNumber(1, { gt: 1 })).toThrow('Expected value > 1, got 1');
				expect(() => AssertNumber(0, { gt: 5 })).toThrow('Expected value > 5, got 0');
			});

			it('should work with boundary values', () => {
				expect(() => AssertNumber(Number.MIN_VALUE, { gt: 0 })).not.toThrow();
				expect(() => AssertNumber(-Number.MIN_VALUE, { gt: -Number.MIN_VALUE })).toThrow();
			});
		});

		describe('gte (greater than or equal) constraint', () => {
			it('should pass when value >= constraint', () => {
				expect(() => AssertNumber(2, { gte: 1 })).not.toThrow();
				expect(() => AssertNumber(1, { gte: 1 })).not.toThrow();
				expect(() => AssertNumber(0, { gte: 0 })).not.toThrow();
			});

			it('should throw when value < constraint', () => {
				expect(() => AssertNumber(0, { gte: 1 })).toThrow(Error);
				expect(() => AssertNumber(-1, { gte: 0 })).toThrow(Error);
			});

			it('should provide default error message for gte violation', () => {
				expect(() => AssertNumber(0, { gte: 1 })).toThrow('Expected value >= 1, got 0');
				expect(() => AssertNumber(-5, { gte: -3 })).toThrow('Expected value >= -3, got -5');
			});

			it('should work with boundary values', () => {
				expect(() => AssertNumber(1, { gte: 1 })).not.toThrow();
				expect(() => AssertNumber(0.99999, { gte: 1 })).toThrow();
			});
		});

		describe('lt (less than) constraint', () => {
			it('should pass when value < constraint', () => {
				expect(() => AssertNumber(0, { lt: 1 })).not.toThrow();
				expect(() => AssertNumber(-1, { lt: 0 })).not.toThrow();
				expect(() => AssertNumber(-10, { lt: 5 })).not.toThrow();
			});

			it('should throw when value equals constraint', () => {
				expect(() => AssertNumber(1, { lt: 1 })).toThrow(Error);
				expect(() => AssertNumber(0, { lt: 0 })).toThrow(Error);
			});

			it('should throw when value > constraint', () => {
				expect(() => AssertNumber(2, { lt: 1 })).toThrow(Error);
				expect(() => AssertNumber(1, { lt: 0 })).toThrow(Error);
			});

			it('should provide default error message for lt violation', () => {
				expect(() => AssertNumber(1, { lt: 1 })).toThrow('Expected value < 1, got 1');
				expect(() => AssertNumber(5, { lt: 0 })).toThrow('Expected value < 0, got 5');
			});

			it('should work with boundary values', () => {
				expect(() => AssertNumber(-Number.MIN_VALUE, { lt: 0 })).not.toThrow();
				expect(() => AssertNumber(Number.MIN_VALUE, { lt: 0 })).toThrow();
			});
		});

		describe('lte (less than or equal) constraint', () => {
			it('should pass when value <= constraint', () => {
				expect(() => AssertNumber(0, { lte: 1 })).not.toThrow();
				expect(() => AssertNumber(1, { lte: 1 })).not.toThrow();
				expect(() => AssertNumber(-1, { lte: 0 })).not.toThrow();
			});

			it('should throw when value > constraint', () => {
				expect(() => AssertNumber(2, { lte: 1 })).toThrow(Error);
				expect(() => AssertNumber(1, { lte: 0 })).toThrow(Error);
			});

			it('should provide default error message for lte violation', () => {
				expect(() => AssertNumber(2, { lte: 1 })).toThrow('Expected value <= 1, got 2');
				expect(() => AssertNumber(1, { lte: 0 })).toThrow('Expected value <= 0, got 1');
			});

			it('should work with boundary values', () => {
				expect(() => AssertNumber(1, { lte: 1 })).not.toThrow();
				expect(() => AssertNumber(1.00001, { lte: 1 })).toThrow();
			});
		});

		describe('eq (equality) constraint', () => {
			it('should pass when value === constraint', () => {
				expect(() => AssertNumber(1, { eq: 1 })).not.toThrow();
				expect(() => AssertNumber(0, { eq: 0 })).not.toThrow();
				expect(() => AssertNumber(-5, { eq: -5 })).not.toThrow();
			});

			it('should throw when value !== constraint', () => {
				expect(() => AssertNumber(1, { eq: 2 })).toThrow(Error);
				expect(() => AssertNumber(0, { eq: 1 })).toThrow(Error);
				expect(() => AssertNumber(3.14, { eq: 3 })).toThrow(Error);
			});

			it('should provide default error message for eq violation', () => {
				expect(() => AssertNumber(1, { eq: 2 })).toThrow('Expected value === 2, got 1');
				expect(() => AssertNumber(0, { eq: 1 })).toThrow('Expected value === 1, got 0');
			});

			it('should work with special numeric values', () => {
				expect(() => AssertNumber(NaN, { eq: NaN })).toThrow('Expected value === NaN, got NaN');
				expect(() => AssertNumber(Infinity, { eq: Infinity })).not.toThrow();
				expect(() => AssertNumber(-Infinity, { eq: -Infinity })).not.toThrow();
			});
		});

		describe('combined constraints', () => {
			it('should enforce multiple constraints together', () => {
				expect(() => AssertNumber(5, { gte: 0, lte: 10 })).not.toThrow();
				expect(() => AssertNumber(5, { gte: 0, lte: 10, integer: true })).not.toThrow();
				expect(() => AssertNumber(5, { gte: 0, lte: 10, finite: true })).not.toThrow();
			});

			it('should throw on first violated constraint in sequence', () => {
				expect(() => AssertNumber(15, { gte: 0, lte: 10 })).toThrow('Expected value <= 10');
				expect(() => AssertNumber(5.5, { integer: true, gte: 0, lte: 10 })).toThrow('Expected an integer');
				expect(() => AssertNumber(NaN, { finite: true, integer: true })).toThrow('Expected an integer');
			});

			it('should validate finite + integer together', () => {
				expect(() => AssertNumber(5, { finite: true, integer: true })).not.toThrow();
				expect(() => AssertNumber(5.5, { finite: true, integer: true })).toThrow('Expected an integer');
				expect(() => AssertNumber(Infinity, { finite: true, integer: true })).toThrow('Expected an integer');
			});

			it('should validate range + integer together', () => {
				expect(() => AssertNumber(5, { integer: true, gte: 0, lte: 10 })).not.toThrow();
				expect(() => AssertNumber(5.5, { integer: true, gte: 0, lte: 10 })).toThrow('Expected an integer');
				expect(() => AssertNumber(15, { integer: true, gte: 0, lte: 10 })).toThrow('Expected value <= 10');
			});

			it('should validate gt + lt together', () => {
				expect(() => AssertNumber(5, { gt: 0, lt: 10 })).not.toThrow();
				expect(() => AssertNumber(0, { gt: 0, lt: 10 })).toThrow('Expected value > 0');
				expect(() => AssertNumber(10, { gt: 0, lt: 10 })).toThrow('Expected value < 10');
			});

			it('should validate gte + lte together', () => {
				expect(() => AssertNumber(0, { gte: 0, lte: 10 })).not.toThrow();
				expect(() => AssertNumber(10, { gte: 0, lte: 10 })).not.toThrow();
				expect(() => AssertNumber(-1, { gte: 0, lte: 10 })).toThrow('Expected value >= 0');
			});
		});

		describe('custom exception message', () => {
			it('should use custom message when provided', () => {
				const exception: IExceptionDetails = { message: 'Custom error' };
				expect(() => AssertNumber('not a number', undefined, exception)).toThrow('Custom error');
			});

			it('should use custom message for constraint violations', () => {
				const exception: IExceptionDetails = { message: 'Value is too large' };
				expect(() => AssertNumber(15, { lte: 10 }, exception)).toThrow('Value is too large');
			});

			it('should use custom message for all constraint types', () => {
				const exception: IExceptionDetails = { message: 'Constraint failed' };
				expect(() => AssertNumber(5.5, { integer: true }, exception)).toThrow('Constraint failed');
				expect(() => AssertNumber(NaN, { finite: true }, exception)).toThrow('Constraint failed');
				expect(() => AssertNumber(0, { gt: 0 }, exception)).toThrow('Constraint failed');
			});

			it('should prefer custom message over defaults', () => {
				const exception: IExceptionDetails = { message: 'My custom message' };
				expect(() => AssertNumber('string', undefined, exception)).toThrow('My custom message');
				expect(() => AssertNumber(1, { eq: 2 }, exception)).toThrow('My custom message');
			});
		});

		describe('type guard behavior', () => {
			it('should narrow type to number after successful assertion', () => {
				const value: unknown = 42;
				AssertNumber(value);
				const narrowed: number = value; // TypeScript should accept this
				expect(narrowed).toBe(42);
			});
		});
	});

	describe('AssertArray', () => {
		describe('basic type validation', () => {
			it('should pass for arrays', () => {
				expect(() => AssertArray([])).not.toThrow();
				expect(() => AssertArray([1])).not.toThrow();
				expect(() => AssertArray([1, 2, 3])).not.toThrow();
				expect(() => AssertArray(['a', 'b', 'c'])).not.toThrow();
				expect(() => AssertArray([null, undefined, {}])).not.toThrow();
			});

			it('should throw for non-array values', () => {
				expect(() => AssertArray(null)).toThrow(Error);
				expect(() => AssertArray(undefined)).toThrow(Error);
				expect(() => AssertArray('string')).toThrow(Error);
				expect(() => AssertArray(123)).toThrow(Error);
				expect(() => AssertArray({})).toThrow(Error);
				expect(() => AssertArray(true)).toThrow(Error);
			});

			it('should provide default error message for non-array', () => {
				expect(() => AssertArray('string')).toThrow('Expected an array, got string');
				expect(() => AssertArray(null)).toThrow('Expected an array, got object');
				expect(() => AssertArray(123)).toThrow('Expected an array, got number');
			});
		});

		describe('size (exact) constraint', () => {
			it('should pass when array length equals size', () => {
				expect(() => AssertArray([], { size: 0 })).not.toThrow();
				expect(() => AssertArray([1], { size: 1 })).not.toThrow();
				expect(() => AssertArray([1, 2, 3], { size: 3 })).not.toThrow();
				expect(() => AssertArray([1, 2, 3, 4, 5], { size: 5 })).not.toThrow();
			});

			it('should throw when array length does not equal size', () => {
				expect(() => AssertArray([1], { size: 0 })).toThrow(Error);
				expect(() => AssertArray([], { size: 1 })).toThrow(Error);
				expect(() => AssertArray([1, 2], { size: 3 })).toThrow(Error);
				expect(() => AssertArray([1, 2, 3, 4], { size: 2 })).toThrow(Error);
			});

			it('should provide default error message for size violation', () => {
				expect(() => AssertArray([1], { size: 2 })).toThrow('Expected array of size 2, got 1');
				expect(() => AssertArray([1, 2, 3], { size: 5 })).toThrow('Expected array of size 5, got 3');
				expect(() => AssertArray([], { size: 1 })).toThrow('Expected array of size 1, got 0');
			});

			it('should work with size 0', () => {
				expect(() => AssertArray([], { size: 0 })).not.toThrow();
				expect(() => AssertArray([1], { size: 0 })).toThrow();
			});

			it('should work with large sizes', () => {
				const largeArray = new Array(1000).fill(0);
				expect(() => AssertArray(largeArray, { size: 1000 })).not.toThrow();
				expect(() => AssertArray(largeArray, { size: 999 })).toThrow();
				expect(() => AssertArray(largeArray, { size: 1001 })).toThrow();
			});
		});

		describe('minSize constraint', () => {
			it('should pass when array length >= minSize', () => {
				expect(() => AssertArray([], { minSize: 0 })).not.toThrow();
				expect(() => AssertArray([1], { minSize: 1 })).not.toThrow();
				expect(() => AssertArray([1, 2, 3], { minSize: 2 })).not.toThrow();
				expect(() => AssertArray([1, 2, 3], { minSize: 3 })).not.toThrow();
			});

			it('should throw when array length < minSize', () => {
				expect(() => AssertArray([], { minSize: 1 })).toThrow(Error);
				expect(() => AssertArray([1], { minSize: 2 })).toThrow(Error);
				expect(() => AssertArray([1, 2], { minSize: 5 })).toThrow(Error);
			});

			it('should provide default error message for minSize violation', () => {
				expect(() => AssertArray([], { minSize: 1 })).toThrow('Expected array of at least 1 elements, got 0');
				expect(() => AssertArray([1], { minSize: 2 })).toThrow('Expected array of at least 2 elements, got 1');
				expect(() => AssertArray([1, 2], { minSize: 5 })).toThrow('Expected array of at least 5 elements, got 2');
			});

			it('should work with minSize 0', () => {
				expect(() => AssertArray([], { minSize: 0 })).not.toThrow();
				expect(() => AssertArray([1], { minSize: 0 })).not.toThrow();
			});

			it('should work with large minSize', () => {
				const largeArray = new Array(1000).fill(0);
				expect(() => AssertArray(largeArray, { minSize: 1000 })).not.toThrow();
				expect(() => AssertArray(largeArray, { minSize: 1001 })).toThrow();
			});
		});

		describe('maxSize constraint', () => {
			it('should pass when array length <= maxSize', () => {
				expect(() => AssertArray([], { maxSize: 0 })).not.toThrow();
				expect(() => AssertArray([1], { maxSize: 1 })).not.toThrow();
				expect(() => AssertArray([1, 2], { maxSize: 3 })).not.toThrow();
				expect(() => AssertArray([1, 2, 3], { maxSize: 10 })).not.toThrow();
			});

			it('should throw when array length > maxSize', () => {
				expect(() => AssertArray([1], { maxSize: 0 })).toThrow(Error);
				expect(() => AssertArray([1, 2], { maxSize: 1 })).toThrow(Error);
				expect(() => AssertArray([1, 2, 3], { maxSize: 2 })).toThrow(Error);
			});

			it('should provide default error message for maxSize violation', () => {
				expect(() => AssertArray([1], { maxSize: 0 })).toThrow('Expected array of at most 0 elements, got 1');
				expect(() => AssertArray([1, 2, 3], { maxSize: 2 })).toThrow('Expected array of at most 2 elements, got 3');
			});

			it('should work with maxSize 0', () => {
				expect(() => AssertArray([], { maxSize: 0 })).not.toThrow();
				expect(() => AssertArray([1], { maxSize: 0 })).toThrow();
			});

			it('should work with large maxSize', () => {
				const largeArray = new Array(1000).fill(0);
				expect(() => AssertArray(largeArray, { maxSize: 1000 })).not.toThrow();
				expect(() => AssertArray(largeArray, { maxSize: 999 })).toThrow();
			});
		});

		describe('combined constraints', () => {
			it('should enforce size and minSize together', () => {
				expect(() => AssertArray([1, 2], { size: 2, minSize: 1 })).not.toThrow();
				expect(() => AssertArray([1], { size: 2, minSize: 1 })).toThrow('Expected array of size 2');
			});

			it('should enforce size and maxSize together', () => {
				expect(() => AssertArray([1, 2], { size: 2, maxSize: 3 })).not.toThrow();
				expect(() => AssertArray([1, 2, 3], { size: 2, maxSize: 3 })).toThrow('Expected array of size 2');
			});

			it('should enforce minSize and maxSize together', () => {
				expect(() => AssertArray([1, 2], { minSize: 1, maxSize: 3 })).not.toThrow();
				expect(() => AssertArray([], { minSize: 1, maxSize: 3 })).toThrow('Expected array of at least 1 elements');
				expect(() => AssertArray([1, 2, 3, 4], { minSize: 1, maxSize: 3 })).toThrow('Expected array of at most 3 elements');
			});

			it('should enforce all three constraints together', () => {
				expect(() => AssertArray([1, 2], { size: 2, minSize: 1, maxSize: 3 })).not.toThrow();
				expect(() => AssertArray([1], { size: 2, minSize: 1, maxSize: 3 })).toThrow('Expected array of size 2');
				expect(() => AssertArray([], { size: 2, minSize: 1, maxSize: 3 })).toThrow('Expected array of size 2');
			});

			it('should check constraints in order: size, minSize, maxSize', () => {
				const tooSmall = [1];
				expect(() => AssertArray(tooSmall, { size: 2, minSize: 2, maxSize: 3 })).toThrow('Expected array of size 2');
			});
		});

		describe('custom exception message', () => {
			it('should use custom message for type violation', () => {
				const exception: IExceptionDetails = { message: 'Must be an array' };
				expect(() => AssertArray('not array', undefined, exception)).toThrow('Must be an array');
			});

			it('should use custom message for size violation', () => {
				const exception: IExceptionDetails = { message: 'Wrong array size' };
				expect(() => AssertArray([1, 2], { size: 3 }, exception)).toThrow('Wrong array size');
			});

			it('should use custom message for minSize violation', () => {
				const exception: IExceptionDetails = { message: 'Array too small' };
				expect(() => AssertArray([], { minSize: 1 }, exception)).toThrow('Array too small');
			});

			it('should use custom message for maxSize violation', () => {
				const exception: IExceptionDetails = { message: 'Array too large' };
				expect(() => AssertArray([1, 2, 3], { maxSize: 2 }, exception)).toThrow('Array too large');
			});

			it('should prefer custom message over defaults', () => {
				const exception: IExceptionDetails = { message: 'Custom constraint message' };
				expect(() => AssertArray(null, { minSize: 5 }, exception)).toThrow('Custom constraint message');
			});
		});

		describe('type guard behavior', () => {
			it('should narrow type to unknown[] after successful assertion', () => {
				const value: unknown = [1, 2, 3];
				AssertArray(value);
				const narrowed: unknown[] = value; // TypeScript should accept this
				expect(Array.isArray(narrowed)).toBe(true);
			});
		});
	});

	describe('AssertInstanceOf', () => {
		describe('basic type validation', () => {
			it('should pass for correct instances', () => {
				expect(() => AssertInstanceOf(new Error(), Error)).not.toThrow();
				expect(() => AssertInstanceOf(new Date(), Date)).not.toThrow();
				expect(() => AssertInstanceOf([], Array)).not.toThrow();
				expect(() => AssertInstanceOf({}, Object)).not.toThrow();
			});

			it('should throw for incorrect instances', () => {
				expect(() => AssertInstanceOf(123, Error)).toThrow(Error);
				expect(() => AssertInstanceOf('string', Date)).toThrow(Error);
				expect(() => AssertInstanceOf({}, Error)).toThrow(Error);
				expect(() => AssertInstanceOf([], Date)).toThrow(Error);
			});

			it('should throw for null', () => {
				expect(() => AssertInstanceOf(null, Error)).toThrow(Error);
				expect(() => AssertInstanceOf(null, Date)).toThrow(Error);
			});

			it('should throw for undefined', () => {
				expect(() => AssertInstanceOf(undefined, Error)).toThrow(Error);
				expect(() => AssertInstanceOf(undefined, Date)).toThrow(Error);
			});
		});

		describe('error messages', () => {
			it('should provide default error message with constructor name', () => {
				expect(() => AssertInstanceOf(123, Error)).toThrow('Expected instance of Error, got number');
				expect(() => AssertInstanceOf('string', Date)).toThrow('Expected instance of Date, got string');
				expect(() => AssertInstanceOf(null, Array)).toThrow('Expected instance of Array, got object');
			});

			it('should construct message with provided constructor name', () => {
				class MyValidatorClass {}
				expect(() => AssertInstanceOf(123, MyValidatorClass)).toThrow('Expected instance of MyValidatorClass, got number');
			});

			it('should handle all built-in types with their names', () => {
				expect(() => AssertInstanceOf({}, RegExp)).toThrow('Expected instance of RegExp');
				expect(() => AssertInstanceOf({}, Set)).toThrow('Expected instance of Set');
				expect(() => AssertInstanceOf({}, Map)).toThrow('Expected instance of Map');
			});
		});

		describe('custom exception message', () => {
			it('should use custom message when provided', () => {
				const exception: IExceptionDetails = { message: 'Value must be an Error instance' };
				expect(() => AssertInstanceOf(123, Error, exception)).toThrow('Value must be an Error instance');
			});

			it('should use custom message for all instance types', () => {
				const exception: IExceptionDetails = { message: 'Custom message' };
				expect(() => AssertInstanceOf('string', Date, exception)).toThrow('Custom message');
				expect(() => AssertInstanceOf(123, Array, exception)).toThrow('Custom message');
				expect(() => AssertInstanceOf(null, Error, exception)).toThrow('Custom message');
			});

			it('should prefer custom message over defaults', () => {
				const exception: IExceptionDetails = { message: 'My custom error' };
				expect(() => AssertInstanceOf('not an error', Error, exception)).toThrow('My custom error');
			});
		});

		describe('with custom classes', () => {
			class CustomError extends Error {
				constructor(message: string) {
					super(message);
					this.name = 'CustomError';
				}
			}

			class Shape {
				name = 'shape';
			}

			class Circle extends Shape {
				radius = 1;
			}

			it('should pass for instances of custom class', () => {
				const circle = new Circle();
				expect(() => AssertInstanceOf(circle, Circle)).not.toThrow();
				expect(() => AssertInstanceOf(circle, Shape)).not.toThrow();
				expect(() => AssertInstanceOf(circle, Object)).not.toThrow();
			});

			it('should throw for non-instances of custom class', () => {
				expect(() => AssertInstanceOf(new Shape(), Circle)).toThrow();
				expect(() => AssertInstanceOf({ radius: 1 }, Circle)).toThrow();
			});

			it('should work with custom error classes', () => {
				const err = new CustomError('test');
				expect(() => AssertInstanceOf(err, CustomError)).not.toThrow();
				expect(() => AssertInstanceOf(err, Error)).not.toThrow();
				expect(() => AssertInstanceOf(new Error(), CustomError)).toThrow();
			});

			it('should provide correct message for custom classes', () => {
				expect(() => AssertInstanceOf({}, Circle)).toThrow('Expected instance of Circle, got object');
				expect(() => AssertInstanceOf(123, Shape)).toThrow('Expected instance of Shape, got number');
			});
		});

		describe('type guard behavior', () => {
			class MyClass {
				value = 42;
			}

			it('should narrow type to T after successful assertion', () => {
				const value: unknown = new MyClass();
				AssertInstanceOf(value, MyClass);
				const narrowed: MyClass = value; // TypeScript should accept this
				expect(narrowed.value).toBe(42);
			});
		});
	});

	describe('AssertNotEquals', () => {
		describe('basic inequality validation', () => {
			it('should pass for different values', () => {
				expect(() => AssertNotEquals(1, 2)).not.toThrow();
				expect(() => AssertNotEquals('a', 'b')).not.toThrow();
				expect(() => AssertNotEquals(null, undefined)).not.toThrow();
				expect(() => AssertNotEquals([], [1])).not.toThrow();
				expect(() => AssertNotEquals({}, { a: 1 })).not.toThrow();
			});

			it('should throw for equal values', () => {
				expect(() => AssertNotEquals(1, 1)).toThrow(Error);
				expect(() => AssertNotEquals('a', 'a')).toThrow(Error);
				expect(() => AssertNotEquals(true, true)).toThrow(Error);
				expect(() => AssertNotEquals(false, false)).toThrow(Error);
			});
		});

		describe('strict equality (===)', () => {
			it('should use strict equality check', () => {
				expect(() => AssertNotEquals(1, '1')).not.toThrow();
				expect(() => AssertNotEquals(0, false)).not.toThrow();
				expect(() => AssertNotEquals(null, undefined)).not.toThrow();
				expect(() => AssertNotEquals('0', 0)).not.toThrow();
			});

			it('should detect same object references', () => {
				const obj = { a: 1 };
				expect(() => AssertNotEquals(obj, obj)).toThrow();
			});

			it('should not consider different objects as equal', () => {
				expect(() => AssertNotEquals({ a: 1 }, { a: 1 })).not.toThrow();
				expect(() => AssertNotEquals([1, 2], [1, 2])).not.toThrow();
			});
		});

		describe('numeric values', () => {
			it('should pass for different numbers', () => {
				expect(() => AssertNotEquals(0, 1)).not.toThrow();
				expect(() => AssertNotEquals(-1, 1)).not.toThrow();
				expect(() => AssertNotEquals(3.14, 2.71)).not.toThrow();
			});

			it('should throw for equal numbers', () => {
				expect(() => AssertNotEquals(0, 0)).toThrow();
				expect(() => AssertNotEquals(42, 42)).toThrow();
				expect(() => AssertNotEquals(-1, -1)).toThrow();
			});

			it('should handle NaN correctly', () => {
				expect(() => AssertNotEquals(NaN, NaN)).not.toThrow(); // NaN !== NaN
				expect(() => AssertNotEquals(NaN, 0)).not.toThrow();
			});

			it('should distinguish between positive and negative zero', () => {
				// In JS, +0 === -0 is true
				expect(() => AssertNotEquals(0, -0)).toThrow();
				expect(() => AssertNotEquals(+0, -0)).toThrow();
			});

			it('should handle Infinity', () => {
				expect(() => AssertNotEquals(Infinity, Infinity)).toThrow();
				expect(() => AssertNotEquals(-Infinity, -Infinity)).toThrow();
				expect(() => AssertNotEquals(Infinity, -Infinity)).not.toThrow();
				expect(() => AssertNotEquals(Infinity, 0)).not.toThrow();
			});
		});

		describe('string values', () => {
			it('should pass for different strings', () => {
				expect(() => AssertNotEquals('', 'a')).not.toThrow();
				expect(() => AssertNotEquals('hello', 'world')).not.toThrow();
				expect(() => AssertNotEquals('A', 'a')).not.toThrow();
			});

			it('should throw for equal strings', () => {
				expect(() => AssertNotEquals('', '')).toThrow();
				expect(() => AssertNotEquals('test', 'test')).toThrow();
				expect(() => AssertNotEquals('hello', 'hello')).toThrow();
			});

			it('should be case-sensitive', () => {
				expect(() => AssertNotEquals('A', 'a')).not.toThrow();
			});
		});

		describe('custom exception message', () => {
			it('should use custom message when provided', () => {
				const exception: IExceptionDetails = { message: 'Values must be different' };
				expect(() => AssertNotEquals(1, 1, exception)).toThrow('Values must be different');
			});

			it('should use custom message for all types', () => {
				const exception: IExceptionDetails = { message: 'Custom message' };
				expect(() => AssertNotEquals('a', 'a', exception)).toThrow('Custom message');
				expect(() => AssertNotEquals(true, true, exception)).toThrow('Custom message');
				expect(() => AssertNotEquals(null, null, exception)).toThrow('Custom message');
			});

			it('should prefer custom message over default', () => {
				const exception: IExceptionDetails = { message: 'Custom inequality message' };
				expect(() => AssertNotEquals(0, 0, exception)).toThrow('Custom inequality message');
			});
		});

		describe('default error message', () => {
			it('should provide default message for equal values', () => {
				expect(() => AssertNotEquals(1, 1)).toThrow('Values must not be equal');
				expect(() => AssertNotEquals('test', 'test')).toThrow('Values must not be equal');
			});
		});

		describe('with null and undefined', () => {
			it('should pass for null vs undefined', () => {
				expect(() => AssertNotEquals(null, undefined)).not.toThrow();
			});

			it('should throw for null vs null', () => {
				expect(() => AssertNotEquals(null, null)).toThrow();
			});

			it('should throw for undefined vs undefined', () => {
				expect(() => AssertNotEquals(undefined, undefined)).toThrow();
			});
		});
	});

	describe('Integration: multiple guards', () => {
		it('should allow chaining multiple assertions', () => {
			const value: unknown = 42;
			expect(() => {
				AssertNumber(value);
				AssertNumber(value, { finite: true });
				AssertNumber(value, { integer: true });
			}).not.toThrow();
		});

		it('should allow combining different guard types', () => {
			const arr: unknown = [1, 2, 3];
			expect(() => {
				AssertArray(arr);
				AssertArray(arr, { minSize: 1 });
				AssertInstanceOf(arr, Array);
			}).not.toThrow();
		});

		it('should stop at first failure in chain', () => {
			const arr: unknown = [1, 2, 3];
			expect(() => {
				AssertArray(arr);
				AssertArray(arr, { size: 5 }); // This should throw
				// The next line should not execute due to the throw above
				AssertInstanceOf(arr, Array);
			}).toThrow('Expected array of size 5');
		});

		it('should work with AssertNotEquals in validation flow', () => {
			const a = 1;
			const b = 2;
			expect(() => {
				AssertNumber(a, { integer: true });
				AssertNumber(b, { integer: true });
				AssertNotEquals(a, b);
			}).not.toThrow();
		});
	});
});
