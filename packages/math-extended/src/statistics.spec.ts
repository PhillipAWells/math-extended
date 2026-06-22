import { expect, test, describe } from 'vitest';
import { Sum, Product, Mean, Variance, StandardDeviation, Median } from './statistics.js';
import { ScalarError } from './scalar.js';

describe('Math Extended > Statistics', () => {
	describe('Sum', () => {
		test('Sum computes total of array elements', () => {
			expect(Sum([1, 2, 3, 4, 5])).toBe(15);
			expect(Sum([10, 20])).toBe(30);
		});

		test('Sum returns 0 for empty array', () => {
			expect(Sum([])).toBe(0);
		});

		test('Sum handles negative values', () => {
			expect(Sum([-1, 2, -3, 4])).toBe(2);
			expect(Sum([-10, 10])).toBe(0);
		});

		test('Sum handles floating-point values', () => {
			expect(Sum([0.1, 0.2, 0.3])).toBeCloseTo(0.6);
		});
	});

	describe('Product', () => {
		test('Product computes multiplication of array elements', () => {
			expect(Product([2, 3, 4])).toBe(24);
			expect(Product([5, 2])).toBe(10);
		});

		test('Product returns 1 for empty array', () => {
			expect(Product([])).toBe(1);
		});

		test('Product returns 0 if any element is 0', () => {
			expect(Product([5, 0, 10])).toBe(0);
		});

		test('Product handles negative values', () => {
			expect(Product([-2, 3, -4])).toBe(24);
			expect(Product([-1, -1])).toBe(1);
		});
	});

	describe('Mean', () => {
		test('Mean computes average of array elements', () => {
			expect(Mean([1, 2, 3, 4, 5])).toBe(3);
			expect(Mean([10, 20])).toBe(15);
		});

		test('Mean with single element', () => {
			expect(Mean([42])).toBe(42);
		});

		test('Mean throws on empty array', () => {
			expect(() => Mean([])).toThrow(ScalarError);
		});

		test('Mean with negative values', () => {
			expect(Mean([-1, 0, 1])).toBe(0);
			expect(Mean([-10, 10])).toBe(0);
		});
	});

	describe('Variance', () => {
		test('Variance computes sample variance by default', () => {
			const values = [1, 2, 3, 4, 5];
			const variance = Variance(values);
			expect(variance).toBeCloseTo(2.5);
		});

		test('Variance computes population variance when requested', () => {
			const values = [1, 2, 3, 4, 5];
			const variance = Variance(values, true);
			expect(variance).toBeCloseTo(2.0);
		});

		test('Variance with two values (minimum for sample)', () => {
			const values = [1, 3];
			const sampleVar = Variance(values);
			const populationVar = Variance(values, true);
			expect(sampleVar).toBe(2);
			expect(populationVar).toBe(1);
		});

		test('Variance with identical values', () => {
			expect(Variance([5, 5, 5, 5])).toBe(0);
			expect(Variance([5, 5, 5, 5], true)).toBe(0);
		});

		test('Variance throws on empty array', () => {
			expect(() => Variance([])).toThrow(ScalarError);
		});

		test('Variance throws on single element with sample variance', () => {
			expect(() => Variance([10])).toThrow(ScalarError);
		});

		test('Variance allows single element with population variance', () => {
			expect(Variance([10], true)).toBe(0);
		});

		test('Variance is numerically stable', () => {
			// Test with large values that could cause precision issues
			const values = [1e10, 1e10 + 1, 1e10 + 2];
			const variance = Variance(values);
			expect(variance).toBeCloseTo(1);
		});
	});

	describe('StandardDeviation', () => {
		test('StandardDeviation is square root of variance', () => {
			const values = [1, 2, 3, 4, 5];
			const sampleStd = StandardDeviation(values);
			expect(sampleStd).toBeCloseTo(Math.sqrt(2.5));
		});

		test('StandardDeviation with population flag', () => {
			const values = [1, 2, 3, 4, 5];
			const populationStd = StandardDeviation(values, true);
			expect(populationStd).toBeCloseTo(Math.sqrt(2.0));
		});

		test('StandardDeviation throws on empty array', () => {
			expect(() => StandardDeviation([])).toThrow(ScalarError);
		});

		test('StandardDeviation throws on single value with sample', () => {
			expect(() => StandardDeviation([5])).toThrow(ScalarError);
		});

		test('StandardDeviation with identical values', () => {
			expect(StandardDeviation([7, 7, 7])).toBe(0);
		});
	});

	describe('Median', () => {
		test('Median with odd length array', () => {
			expect(Median([3, 1, 4, 1, 5])).toBe(3);
			expect(Median([5, 1, 3])).toBe(3);
		});

		test('Median with even length array', () => {
			expect(Median([1, 2, 3, 4])).toBe(2.5);
			expect(Median([10, 20])).toBe(15);
		});

		test('Median with single element', () => {
			expect(Median([42])).toBe(42);
		});

		test('Median with unsorted input', () => {
			expect(Median([5, 2, 8, 1, 9])).toBe(5);
		});

		test('Median with duplicate values', () => {
			expect(Median([1, 1, 1, 2, 2])).toBe(1);
			expect(Median([1, 2, 2, 2, 3])).toBe(2);
		});

		test('Median with negative values', () => {
			expect(Median([-5, -1, 0, 1, 5])).toBe(0);
			expect(Median([-2, -1])).toBe(-1.5);
		});

		test('Median does not mutate input array', () => {
			const original = [3, 1, 4, 1, 5];
			const originalCopy = [...original];
			Median(original);
			expect(original).toEqual(originalCopy);
		});

		test('Median throws on empty array', () => {
			expect(() => Median([])).toThrow(ScalarError);
		});

		test('Median with floating-point values', () => {
			expect(Median([1.5, 2.5, 3.5])).toBe(2.5);
			expect(Median([0.1, 0.2, 0.3, 0.4])).toBeCloseTo(0.25);
		});
	});
});
