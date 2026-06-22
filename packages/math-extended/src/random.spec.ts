import {
	SetPRNG,
	GetPRNG,
	RandomInt,
	RandomFloat,
	RandomChoice,
	RandomSample,
	RandomShuffle,
	RandomBool,
	RandomNormal,
	type IPRNG
} from './random.js';

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

		test('Throw RangeError for invalid probabilities', () => {
			expect(() => RandomBool(-0.1)).toThrow(RangeError);
			expect(() => RandomBool(1.1)).toThrow(RangeError);
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

	describe('SetPRNG / GetPRNG', () => {
		let originalPRNG: IPRNG;

		beforeEach(() => {
			originalPRNG = GetPRNG();
		});

		afterEach(() => {
			SetPRNG(originalPRNG);
		});

		test('GetPRNG returns a function', () => {
			const prng = GetPRNG();
			expect(typeof prng).toBe('function');
		});

		test('GetPRNG returns the currently set PRNG', () => {
			const customPRNG = (): number => 0.5;
			SetPRNG(customPRNG);
			const retrieved = GetPRNG();
			expect(retrieved).toBe(customPRNG);
		});

		test('SetPRNG and GetPRNG round-trip', () => {
			let callCount = 0;
			const customPRNG = (): number => {
				callCount++;
				return 0.42;
			};
			SetPRNG(customPRNG);
			const retrieved = GetPRNG();
			const result = retrieved();
			expect(result).toBe(0.42);
			expect(callCount).toBe(1);
		});

		test('Random functions use SetPRNG when configured', () => {
			let callCount = 0;
			const stubbedPRNG = (): number => {
				callCount++;
				return 0.5;
			};
			SetPRNG(stubbedPRNG);
			RandomInt(0, 10);
			expect(callCount).toBe(1);
		});

		test('SetPRNG affects all random functions deterministically', () => {
			// Create a simple linear congruential generator for determinism
			let seed = 12345;
			const seededPRNG = (): number => {
				seed = (seed * 1103515245 + 12345) & 0x7fffffff;
				return seed / 0x7fffffff;
			};

			SetPRNG(seededPRNG);
			const int1 = RandomInt(1, 100);
			const int2 = RandomInt(1, 100);

			// Reset to same seed
			seed = 12345;
			SetPRNG(seededPRNG);
			const int1Again = RandomInt(1, 100);
			const int2Again = RandomInt(1, 100);

			expect(int1).toBe(int1Again);
			expect(int2).toBe(int2Again);
		});
	});

	describe('RandomInt with deterministic PRNG', () => {
		let originalPRNG: IPRNG;

		beforeEach(() => {
			originalPRNG = GetPRNG();
		});

		afterEach(() => {
			SetPRNG(originalPRNG);
		});

		test('RandomInt is deterministic with seeded PRNG', () => {
			let seed = 42;
			const seededPRNG = (): number => {
				seed = (seed * 1103515245 + 12345) & 0x7fffffff;
				return seed / 0x7fffffff;
			};

			SetPRNG(seededPRNG);
			const result1 = RandomInt(1, 100);

			seed = 42; // Reset seed
			SetPRNG(seededPRNG);
			const result2 = RandomInt(1, 100);

			expect(result1).toBe(result2);
		});

		test('RandomInt(min, max) with PRNG returning 0', () => {
			SetPRNG(() => 0);
			const result = RandomInt(10, 20);
			expect(result).toBe(10);
		});

		test('RandomInt(min, max) with PRNG returning 0.999...', () => {
			SetPRNG(() => 0.9999);
			const result = RandomInt(0, 1);
			// Math.floor(0.9999 * 2 + 0) = Math.floor(1.9998) = 1
			expect(result).toBe(1);
		});

		test('RandomInt with negative range is deterministic', () => {
			SetPRNG(() => 0.5);
			const result = RandomInt(-10, -5);
			expect(result).toBeGreaterThanOrEqual(-10);
			expect(result).toBeLessThanOrEqual(-5);
		});
	});

	describe('RandomFloat with deterministic PRNG', () => {
		let originalPRNG: IPRNG;

		beforeEach(() => {
			originalPRNG = GetPRNG();
		});

		afterEach(() => {
			SetPRNG(originalPRNG);
		});

		test('RandomFloat is deterministic with seeded PRNG', () => {
			let seed = 42;
			const seededPRNG = (): number => {
				seed = (seed * 1103515245 + 12345) & 0x7fffffff;
				return seed / 0x7fffffff;
			};

			SetPRNG(seededPRNG);
			const result1 = RandomFloat(0, 1);

			seed = 42; // Reset seed
			SetPRNG(seededPRNG);
			const result2 = RandomFloat(0, 1);

			expect(result1).toBe(result2);
		});

		test('RandomFloat(min, max) with PRNG returning 0', () => {
			SetPRNG(() => 0);
			const result = RandomFloat(10, 20);
			expect(result).toBe(10);
		});

		test('RandomFloat(min, max) with PRNG returning 0.999...', () => {
			SetPRNG(() => 0.9999);
			const result = RandomFloat(0, 1);
			// 0.9999 * 1 + 0 = 0.9999
			expect(result).toBeCloseTo(0.9999, 4);
		});

		test('RandomFloat rejects min >= max', () => {
			SetPRNG(() => 0.5);
			expect(RandomFloat(5, 5)).toBeNaN();
			expect(RandomFloat(5, 4)).toBeNaN();
		});
	});

	describe('RandomBool with deterministic PRNG', () => {
		let originalPRNG: IPRNG;

		beforeEach(() => {
			originalPRNG = GetPRNG();
		});

		afterEach(() => {
			SetPRNG(originalPRNG);
		});

		test('RandomBool with probability 0 always returns false', () => {
			SetPRNG(() => 0.5);
			for (let i = 0; i < 10; i++) {
				expect(RandomBool(0)).toBe(false);
			}
		});

		test('RandomBool with probability 1 always returns true', () => {
			SetPRNG(() => 0.5);
			for (let i = 0; i < 10; i++) {
				expect(RandomBool(1)).toBe(true);
			}
		});

		test('RandomBool with PRNG returning value < probability returns true', () => {
			SetPRNG(() => 0.3);
			expect(RandomBool(0.5)).toBe(true);
		});

		test('RandomBool with PRNG returning value >= probability returns false', () => {
			SetPRNG(() => 0.7);
			expect(RandomBool(0.5)).toBe(false);
		});

		test('RandomBool is deterministic with seeded PRNG', () => {
			let seed = 42;
			const seededPRNG = (): number => {
				seed = (seed * 1103515245 + 12345) & 0x7fffffff;
				return seed / 0x7fffffff;
			};

			SetPRNG(seededPRNG);
			const result1 = RandomBool(0.7);

			seed = 42; // Reset seed
			SetPRNG(seededPRNG);
			const result2 = RandomBool(0.7);

			expect(result1).toBe(result2);
		});

		test('RandomBool throws RangeError for negative probability', () => {
			expect(() => RandomBool(-0.1)).toThrow(RangeError);
		});

		test('RandomBool throws RangeError for probability > 1', () => {
			expect(() => RandomBool(1.1)).toThrow(RangeError);
		});
	});

	describe('RandomSample with deterministic PRNG', () => {
		let originalPRNG: IPRNG;

		beforeEach(() => {
			originalPRNG = GetPRNG();
		});

		afterEach(() => {
			SetPRNG(originalPRNG);
		});

		test('RandomSample is deterministic with seeded PRNG', () => {
			let seed = 42;
			const seededPRNG = (): number => {
				seed = (seed * 1103515245 + 12345) & 0x7fffffff;
				return seed / 0x7fffffff;
			};

			SetPRNG(seededPRNG);
			const result1 = RandomSample([1, 2, 3, 4, 5], 3);

			seed = 42; // Reset seed
			SetPRNG(seededPRNG);
			const result2 = RandomSample([1, 2, 3, 4, 5], 3);

			expect(result1).toEqual(result2);
		});

		test('RandomSample with empty array returns empty', () => {
			SetPRNG(() => 0.5);
			expect(RandomSample([], 3)).toEqual([]);
		});

		test('RandomSample with count 0 returns empty', () => {
			SetPRNG(() => 0.5);
			expect(RandomSample([1, 2, 3], 0)).toEqual([]);
		});

		test('RandomSample with count > array length returns empty', () => {
			SetPRNG(() => 0.5);
			expect(RandomSample([1, 2, 3], 5)).toEqual([]);
		});

		test('RandomSample with count = array length returns all elements', () => {
			let seed = 99;
			const seededPRNG = (): number => {
				seed = (seed * 1103515245 + 12345) & 0x7fffffff;
				return seed / 0x7fffffff;
			};
			SetPRNG(seededPRNG);
			const array = [1, 2, 3];
			const result = RandomSample(array, 3);
			expect(result).toHaveLength(3);
			expect(new Set(result).size).toBe(3);
			result.forEach((item) => {
				expect(array).toContain(item);
			});
		});

		test('RandomSample with count 1 returns single element from array', () => {
			SetPRNG(() => 0.5);
			const result = RandomSample([10, 20, 30], 1);
			expect(result).toHaveLength(1);
			expect([10, 20, 30]).toContain(result[0]);
		});
	});

	describe('RandomShuffle with deterministic PRNG', () => {
		let originalPRNG: IPRNG;

		beforeEach(() => {
			originalPRNG = GetPRNG();
		});

		afterEach(() => {
			SetPRNG(originalPRNG);
		});

		test('RandomShuffle is deterministic with seeded PRNG', () => {
			let seed = 42;
			const seededPRNG = (): number => {
				seed = (seed * 1103515245 + 12345) & 0x7fffffff;
				return seed / 0x7fffffff;
			};

			SetPRNG(seededPRNG);
			const array1 = [1, 2, 3, 4, 5];
			const result1 = RandomShuffle(array1);

			seed = 42; // Reset seed
			SetPRNG(seededPRNG);
			const array2 = [1, 2, 3, 4, 5];
			const result2 = RandomShuffle(array2);

			expect(result1).toEqual(result2);
		});

		test('RandomShuffle with clone=true is deterministic', () => {
			let seed = 42;
			const seededPRNG = (): number => {
				seed = (seed * 1103515245 + 12345) & 0x7fffffff;
				return seed / 0x7fffffff;
			};

			SetPRNG(seededPRNG);
			const original1 = [1, 2, 3, 4, 5];
			const result1 = RandomShuffle(original1, true);

			seed = 42; // Reset seed
			SetPRNG(seededPRNG);
			const original2 = [1, 2, 3, 4, 5];
			const result2 = RandomShuffle(original2, true);

			expect(result1).toEqual(result2);
		});

		test('RandomShuffle with clone=true does not mutate original', () => {
			SetPRNG(() => 0.5);
			const original = [1, 2, 3];
			const originalCopy = [...original];
			const result = RandomShuffle(original, true);
			expect(original).toEqual(originalCopy);
			expect(result).not.toBe(original);
		});

		test('RandomShuffle with clone=false mutates original', () => {
			SetPRNG(() => 0.5);
			const array = [1, 2, 3];
			const result = RandomShuffle(array, false);
			expect(result).toBe(array);
		});

		test('RandomShuffle empty array returns empty', () => {
			SetPRNG(() => 0.5);
			expect(RandomShuffle([])).toEqual([]);
		});

		test('RandomShuffle single element array returns unchanged', () => {
			SetPRNG(() => 0.5);
			const result = RandomShuffle([42]);
			expect(result).toEqual([42]);
		});
	});

	describe('RandomNormal - Box-Muller retry branch', () => {
		let originalPRNG: IPRNG;

		beforeEach(() => {
			originalPRNG = GetPRNG();
		});

		afterEach(() => {
			SetPRNG(originalPRNG);
		});

		test('RandomNormal returns finite number even with Box-Muller resample', () => {
			let callCount = 0;
			const stubbedPRNG = (): number => {
				callCount++;
				// First call returns value < BOX_MULLER_MIN_U1 to force resample
				// Second call returns a valid u1
				// Third call returns u2
				if (callCount === 1) {
					return 1e-20; // Much smaller than Number.EPSILON (~2.22e-16)
				}
				return 0.5; // Valid value for subsequent calls
			};
			SetPRNG(stubbedPRNG);
			const result = RandomNormal();
			expect(Number.isFinite(result)).toBe(true);
			// Should have called PRNG at least 3 times (1 failed u1, 1 retry u1, 1 u2)
			expect(callCount).toBeGreaterThanOrEqual(3);
		});

		test('RandomNormal with u1 = Number.EPSILON is accepted (>= threshold)', () => {
			let callCount = 0;
			const stubbedPRNG = (): number => {
				callCount++;
				if (callCount === 1) {
					return Number.EPSILON; // Exactly at threshold
				}
				return 0.5;
			};
			SetPRNG(stubbedPRNG);
			const result = RandomNormal();
			expect(Number.isFinite(result)).toBe(true);
			// Should call exactly twice (u1 and u2, no resample)
			expect(callCount).toBe(2);
		});

		test('RandomNormal with multiple resamples', () => {
			let callCount = 0;
			const stubbedPRNG = (): number => {
				callCount++;
				// First two calls return tiny values to force multiple resamples
				// Third and fourth return valid values
				if (callCount === 1 || callCount === 2) {
					return 1e-30;
				}
				return 0.5;
			};
			SetPRNG(stubbedPRNG);
			const result = RandomNormal();
			expect(Number.isFinite(result)).toBe(true);
			expect(callCount).toBeGreaterThanOrEqual(4);
		});

		test('RandomNormal with custom mean and standard deviation via seeded PRNG', () => {
			let seed = 42;
			const seededPRNG = (): number => {
				seed = (seed * 1103515245 + 12345) & 0x7fffffff;
				return (seed / 0x7fffffff) * 0.99999 + 0.00001; // Ensure > EPSILON
			};
			SetPRNG(seededPRNG);
			const result1 = RandomNormal(100, 15);
			expect(Number.isFinite(result1)).toBe(true);

			seed = 42;
			SetPRNG(seededPRNG);
			const result2 = RandomNormal(100, 15);
			expect(result1).toBe(result2);
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
