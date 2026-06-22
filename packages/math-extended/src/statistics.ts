import { ScalarError } from './scalar.js';

/**
 * Computes the sum of all values in an array.
 * Returns 0 for an empty array.
 *
 * @param values - Array of numbers to sum
 * @returns Sum of all values
 *
 * @example
 * ```typescript
 * Sum([1, 2, 3, 4, 5]) // 15
 * Sum([])              // 0
 * Sum([-10, 10])       // 0
 * ```
 */
export function Sum(values: number[]): number {
	return values.reduce((acc, val) => acc + val, 0);
}

/**
 * Computes the product of all values in an array.
 * Returns 1 for an empty array (multiplicative identity).
 *
 * @param values - Array of numbers to multiply
 * @returns Product of all values
 *
 * @example
 * ```typescript
 * Product([2, 3, 4])   // 24
 * Product([])          // 1
 * Product([5, 0, 10])  // 0
 * ```
 */
export function Product(values: number[]): number {
	return values.reduce((acc, val) => acc * val, 1);
}

/**
 * Computes the arithmetic mean (average) of values in an array.
 *
 * @param values - Array of numbers
 * @returns Arithmetic mean
 * @throws {ScalarError} If values array is empty
 *
 * @example
 * ```typescript
 * Mean([1, 2, 3, 4, 5])  // 3
 * Mean([10, 20])         // 15
 * Mean([])               // throws ScalarError
 * ```
 */
export function Mean(values: number[]): number {
	if (values.length === 0) {
		throw new ScalarError('Mean: values array cannot be empty');
	}
	return Sum(values) / values.length;
}

/**
 * Computes the variance of values in an array using numerically-stable Welford's algorithm.
 * By default computes sample variance (dividing by n-1), or population variance if requested.
 *
 * @param values - Array of numbers
 * @param population - If true, computes population variance (divide by n); if false (default), computes sample variance (divide by n-1)
 * @returns Variance of the values
 * @throws {ScalarError} If values array is empty, or if sample variance is requested with fewer than 2 values
 *
 * @remarks
 * Sample variance (population=false): uses n-1 denominator; appropriate for estimating population variance from a sample.
 * Population variance (population=true): uses n denominator; appropriate when the array represents the entire population.
 *
 * @example
 * ```typescript
 * Variance([1, 2, 3, 4, 5])             // ≈ 2.5 (sample variance)
 * Variance([1, 2, 3, 4, 5], true)       // 2.0 (population variance)
 * Variance([10])                         // throws ScalarError (need ≥ 2 for sample)
 * Variance([10], true)                  // 0 (population variance of 1 element)
 * ```
 */
export function Variance(values: number[], population = false): number {
	if (values.length === 0) {
		throw new ScalarError('Variance: values array cannot be empty');
	}
	if (!population && values.length < 2) {
		throw new ScalarError('Variance: sample variance requires at least 2 values');
	}

	// Welford's algorithm for numerically stable variance computation
	let mean = 0;
	let sumSquaredDiffs = 0;

	for (let i = 0; i < values.length; i++) {
		const delta = values[i] - mean;
		mean += delta / (i + 1);
		const delta2 = values[i] - mean;
		sumSquaredDiffs += delta * delta2;
	}

	const divisor = population ? values.length : values.length - 1;
	return sumSquaredDiffs / divisor;
}

/**
 * Computes the standard deviation of values in an array.
 * By default computes sample standard deviation, or population standard deviation if requested.
 *
 * @param values - Array of numbers
 * @param population - If true, computes population standard deviation; if false (default), computes sample standard deviation
 * @returns Standard deviation of the values
 * @throws {ScalarError} If values array is empty, or if sample standard deviation is requested with fewer than 2 values
 *
 * @remarks
 * Standard deviation is the square root of variance.
 * Sample standard deviation: sqrt(variance with n-1 denominator).
 * Population standard deviation: sqrt(variance with n denominator).
 *
 * @example
 * ```typescript
 * StandardDeviation([1, 2, 3, 4, 5])        // ≈ 1.58 (sample)
 * StandardDeviation([1, 2, 3, 4, 5], true)  // ≈ 1.41 (population)
 * ```
 */
export function StandardDeviation(values: number[], population = false): number {
	return Math.sqrt(Variance(values, population));
}

/**
 * Computes the median of values in an array.
 * Does not mutate the input array; creates an internal sorted copy.
 *
 * @param values - Array of numbers
 * @returns Median value (middle value for odd length, average of two middle values for even length)
 * @throws {ScalarError} If values array is empty
 *
 * @remarks
 * For an array of length n:
 * - If n is odd: returns the element at index (n-1)/2.
 * - If n is even: returns the average of elements at indices (n/2 - 1) and (n/2).
 *
 * @example
 * ```typescript
 * Median([3, 1, 4, 1, 5])    // 3 (middle value of [1, 1, 3, 4, 5])
 * Median([1, 2, 3, 4])       // 2.5 (average of 2 and 3)
 * Median([5])                // 5
 * Median([])                 // throws ScalarError
 * ```
 */
export function Median(values: number[]): number {
	if (values.length === 0) {
		throw new ScalarError('Median: values array cannot be empty');
	}

	// Sort a copy to avoid mutating the input
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);

	if (sorted.length % 2 === 1) {
		// Odd length: return middle element
		const medianVal = sorted[mid];
		if (medianVal === undefined) throw new ScalarError('Median: index out of bounds');
		return medianVal;
	}

	// Even length: return average of two middle elements
	const left = sorted[mid - 1];
	const right = sorted[mid];
	if (left === undefined || right === undefined) throw new ScalarError('Median: index out of bounds');
	return (left + right) / 2;
}
