import {
	RandomInt,
	RandomFloat,
	RandomChoice,
	RandomSample,
	RandomShuffle,
	RandomBool,
	RandomNormal,
} from './random.ts';

describe('Math > Random ', () => {
	describe('RandomInt', () => {
		test('Generate a Random Integer within a Positive Range', () => {
			const min = 1;
			const max = 10;
			const result = RandomInt(min, max);
			expect(result).toBeGreaterThanOrEqual(min);
			expect(result).toBeLessThanOrEqual(max);
			expect(Number.isInteger(result)).toBe(true);
		});

		test('Generate a Random Integer within a Negative Range', () => {
			const min = -10;
			const max = -1;
			const result = RandomInt(min, max);
			expect(result).toBeGreaterThanOrEqual(min);
			expect(result).toBeLessThanOrEqual(max);
			expect(Number.isInteger(result)).toBe(true);
		});

		test('If the minimum value and maximum value are the same, return the minimum value.', () => {
			const min = 5;
			const max = 5;
			const result = RandomInt(min, max);
			expect(result).toBe(min);
		});

		test('If the minimum value is greater than the maximum value, return NaN.', () => {
			const min = 10;
			const max = 5;
			const result = RandomInt(min, max);
			expect(result).toBeNaN();
		});

		test('Should include both min and max values over multiple runs', () => {
			const min = 1;
			const max = 3;
			const results = new Set<number>();

			// Run enough times to likely hit all values
			for (let i = 0; i < 100; i++) {
				results.add(RandomInt(min, max));
			}

			expect(results.has(min)).toBe(true);
			expect(results.has(max)).toBe(true);
		});
	});

	describe('RandomFloat', () => {
		test('Generate a Random Float within Range', () => {
			const min = 0;
			const max = 1;
			const result = RandomFloat(min, max);
			expect(result).toBeGreaterThanOrEqual(min);
			expect(result).toBeLessThan(max);
			expect(typeof result).toBe('number');
		});

		test('Generate a Random Float within Negative Range', () => {
			const min = -5.5;
			const max = -1.1;
			const result = RandomFloat(min, max);
			expect(result).toBeGreaterThanOrEqual(min);
			expect(result).toBeLessThan(max);
		});

		test('If minimum equals maximum, return NaN', () => {
			const min = 5.5;
			const max = 5.5;
			const result = RandomFloat(min, max);
			expect(result).toBeNaN();
		});

		test('If minimum is greater than maximum, return NaN', () => {
			const min = 10.5;
			const max = 5.5;
			const result = RandomFloat(min, max);
			expect(result).toBeNaN();
		});

		test('Should generate different values over multiple runs', () => {
			const results = new Set<number>();

			for (let i = 0; i < 10; i++) {
				results.add(RandomFloat(0, 1));
			}

			// Should have generated different values (very unlikely to get duplicates)
			expect(results.size).toBeGreaterThan(1);
		});
	});

	describe('RandomChoice', () => {
		test('Choose from array of numbers', () => {
			const array = [1, 2, 3, 4, 5];
			const result = RandomChoice(array);
			expect(array).toContain(result);
		});

		test('Choose from array of strings', () => {
			const array = ['red', 'green', 'blue'];
			const result = RandomChoice(array);
			expect(array).toContain(result);
		});

		test('Return undefined for empty array', () => {
			const array: number[] = [];
			const result = RandomChoice(array);
			expect(result).toBeUndefined();
		});

		test('Return the only element for single-element array', () => {
			const array = [42];
			const result = RandomChoice(array);
			expect(result).toBe(42);
		});

		test('Should eventually choose all elements over multiple runs', () => {
			const array = [1, 2, 3];
			const results = new Set<number>();

			for (let i = 0; i < 50; i++) {
				const choice = RandomChoice(array);
				if (choice !== undefined) {
					results.add(choice);
				}
			}

			expect(results.size).toBe(3);
		});
	});

	describe('RandomSample', () => {
		test('Sample multiple elements without replacement', () => {
			const array = [1, 2, 3, 4, 5];
			const result = RandomSample(array, 3);
			expect(result).toHaveLength(3);
			expect(new Set(result).size).toBe(3); // All unique
			result.forEach((item) => {
				expect(array).toContain(item);
			});
		});

		test('Sample all elements', () => {
			const array = [1, 2, 3];
			const result = RandomSample(array, 3);
			expect(result).toHaveLength(3);
			expect(new Set(result).size).toBe(3);
		});

		test('Return empty array for invalid inputs', () => {
			const array = [1, 2, 3];
			expect(RandomSample(array, 0)).toEqual([]);
			expect(RandomSample(array, -1)).toEqual([]);
			expect(RandomSample(array, 5)).toEqual([]); // More than available
			expect(RandomSample([], 1)).toEqual([]);
		});

		test('Sample single element', () => {
			const array = [1, 2, 3, 4, 5];
			const result = RandomSample(array, 1);
			expect(result).toHaveLength(1);
			expect(array).toContain(result[0]);
		});
	});
	describe('RandomShuffle', () => {
		test('Shuffle modifies original array by default', () => {
			const original = [1, 2, 3, 4, 5];
			const copy = [...original];
			const result = RandomShuffle(original);
			expect(result).toBe(original);
			expect(result).toHaveLength(copy.length);

			// Should contain all original elements
			copy.forEach((item) => {
				expect(result).toContain(item);
			});
		});

		test('Shuffle with clone=true does not modify original array', () => {
			const original = [1, 2, 3, 4, 5];
			const copy = [...original];
			const result = RandomShuffle(original, true);
			expect(result).not.toBe(original);
			expect(original).toEqual(copy);
			expect(result).toHaveLength(original.length);

			// Should contain all original elements
			original.forEach((item) => {
				expect(result).toContain(item);
			});
		});

		test('Shuffle with clone=false modifies original array', () => {
			const original = [1, 2, 3, 4, 5];
			const copy = [...original];
			const result = RandomShuffle(original, false);
			expect(result).toBe(original);
			expect(result).toHaveLength(copy.length);

			// Should contain all original elements
			copy.forEach((item) => {
				expect(result).toContain(item);
			});
		});

		test('Shuffle empty array', () => {
			const array: number[] = [];
			const result = RandomShuffle(array);
			expect(result).toEqual([]);
		});

		test('Shuffle single element array', () => {
			const array = [42];
			const result = RandomShuffle(array);
			expect(result).toEqual([42]);
		});

		test('Should eventually produce different arrangements', () => {
			const arrangements = new Set<string>();

			for (let i = 0; i < 20; i++) {
				const array = [1, 2, 3];
				RandomShuffle(array);
				arrangements.add(JSON.stringify(array));
			}

			// Should have generated at least 2 different arrangements
			expect(arrangements.size).toBeGreaterThan(1);
		});
	});

	describe('RandomBool', () => {
		test('Generate random boolean with default probability', () => {
			const result = RandomBool();
			expect(typeof result).toBe('boolean');
		});

		test('Generate random boolean with custom probability', () => {
			// Test with very high probability
			let trueCount = 0;

			for (let i = 0; i < 100; i++) {
				if (RandomBool(0.9)) {
					trueCount++;
				}
			}
			// Should be mostly true (allowing some variance)
			expect(trueCount).toBeGreaterThan(70);

			// Test with very low probability
			let falseCount = 0;

			for (let i = 0; i < 100; i++) {
				if (!RandomBool(0.1)) {
					falseCount++;
				}
			}
			// Should be mostly false (allowing some variance)
			expect(falseCount).toBeGreaterThan(70);
		});

		test('Return false for invalid probabilities', () => {
			expect(RandomBool(-0.1)).toBe(false);
			expect(RandomBool(1.1)).toBe(false);
		});

		test('Return true for probability 1.0', () => {
			for (let i = 0; i < 10; i++) {
				expect(RandomBool(1.0)).toBe(true);
			}
		});

		test('Return false for probability 0.0', () => {
			for (let i = 0; i < 10; i++) {
				expect(RandomBool(0.0)).toBe(false);
			}
		});
	});

	describe('RandomNormal', () => {
		test('Generate random normal distribution with default parameters', () => {
			const results: number[] = [];

			for (let i = 0; i < 1000; i++) {
				results.push(RandomNormal());
			}

			const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
			const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
			// Should be approximately standard normal (mean ≈ 0, variance ≈ 1)
			expect(Math.abs(mean)).toBeLessThan(0.1);
			expect(Math.abs(variance - 1)).toBeLessThan(0.2);
		});

		test('Generate random normal distribution with custom parameters', () => {
			const targetMean = 100;
			const targetStd = 15;
			const results: number[] = [];

			for (let i = 0; i < 1000; i++) {
				results.push(RandomNormal(targetMean, targetStd));
			}

			const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
			const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
			const stdDev = Math.sqrt(variance);
			// Should be approximately the target distribution			expect(Math.abs(mean - targetMean)).toBeLessThan(2);
			expect(Math.abs(stdDev - targetStd)).toBeLessThan(2);
		});
	});
});
