const BOX_MULLER_COEFFICIENT = -2;
const BOX_MULLER_MIN_U1 = Number.EPSILON; // Avoid log(0) = -Infinity in Box-Muller transform

/** Type for a PRNG function that returns a random number in [0, 1) */
export type IPRNG = () => number;

/**
 * Global PRNG instance used by all random functions.
 * Defaults to Math.random(). Can be overridden by calling SetPRNG().
 * @internal
 */
let globalPRNG: IPRNG = Math.random;

/**
 * Sets a custom PRNG (Pseudo-Random Number Generator) for all random functions.
 * Useful for deterministic testing with seeded RNGs or alternative implementations.
 *
 * @param prng - A function that returns a random number in [0, 1)
 * @example
 * ```typescript
 * // Use a seeded PRNG for reproducible results
 * const seededRNG = createSeededRNG(42);
 * SetPRNG(seededRNG);
 *
 * // Use Math.random() again (default)
 * SetPRNG(Math.random);
 * ```
 */
export function SetPRNG(prng: IPRNG): void {
	globalPRNG = prng;
}

/**
 * Gets the current PRNG function.
 * @internal
 * @returns The currently configured PRNG function
 * @example
 * ```typescript
 * const prng = GetPRNG();
 * const randomNumber = prng(); // Returns value in [0, 1)
 * ```
 */
export function GetPRNG(): IPRNG {
	return globalPRNG;
}

/**
 * Generates a random integer within the specified range (inclusive).
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer between min and max. Returns Number.NaN when min > max.
 * @example
 * ```typescript
 * RandomInt(1, 6) // Returns 1, 2, 3, 4, 5, or 6 (dice roll)
 * ```
 * @example
 * ```typescript
 * RandomInt(-5, 5) // Returns any integer from -5 to 5
 * ```
 * @example
 * ```typescript
 * RandomInt(10, 5) // Returns Number.NaN (invalid range)
 * ```
 */
export function RandomInt(min: number, max: number): number {
	if (min > max) return Number.NaN;

	return Math.floor((globalPRNG() * (max - min + 1)) + min);
}

/**
 * Generates a random floating-point number within the specified range.
 * Note: Asymmetry with RandomInt — this function returns NaN when min >= max (not just min > max).
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Random float between min (inclusive) and max (exclusive). Returns Number.NaN when min >= max.
 * @example
 * ```typescript
 * RandomFloat(0, 1) // Returns 0.0 to 0.999...
 * ```
 * @example
 * ```typescript
 * RandomFloat(-1.5, 1.5) // Returns any float from -1.5 to 1.499...
 * ```
 * @example
 * ```typescript
 * RandomFloat(5, 5) // Returns Number.NaN (min equals max)
 * ```
 */
export function RandomFloat(min: number, max: number): number {
	if (min >= max) return Number.NaN;

	return (globalPRNG() * (max - min)) + min;
}

/**
 * Randomly selects one element from an array.
 * @template T - The type of elements in the array
 * @param array - Array to choose from
 * @returns Random element from the array, or undefined if array is empty
 * @example
 * ```typescript
 * RandomChoice([1, 2, 3, 4, 5]) // Returns one of the numbers
 * ```
 * @example
 * ```typescript
 * RandomChoice(['red', 'green', 'blue']) // Returns one of the colors
 * ```
 */
export function RandomChoice<T>(array: T[]): T | undefined {
	if (array.length === 0) return undefined;

	const index = RandomInt(0, array.length - 1);
	return array[index];
}

/**
 * Randomly selects multiple elements from an array without replacement.
 * Uses a partial Fisher-Yates shuffle, running only `count` iterations for O(count) time.
 * @template T - The type of elements in the array
 * @param array - Array to choose from
 * @param count - Number of elements to select
 * @returns Array of `count` unique randomly selected elements, or empty array if inputs are invalid
 * @example
 * ```typescript
 * RandomSample([1, 2, 3, 4, 5], 3) // Returns 3 unique numbers
 * ```
 * @example
 * ```typescript
 * RandomSample(['a', 'b', 'c'], 2) // Returns 2 unique letters
 * ```
 */
export function RandomSample<T>(array: T[], count: number): T[] {
	if (array.length === 0 || count <= 0 || count > array.length) return [];

	// Partial Fisher-Yates shuffle: O(count) guaranteed, no collision retries
	const copy = [...array];

	for (let i = 0; i < count; i++) {
		const j = RandomInt(i, copy.length - 1);
		const temp = copy[i] as T;
		copy[i] = copy[j] as T;
		copy[j] = temp;
	}

	return copy.slice(0, count);
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @template T - The type of elements in the array
 * @param array - Array to shuffle
 * @param clone - If true, returns a shuffled copy; if false/undefined, modifies original array
 * @returns Shuffled array (original reference if clone=false, new array if clone=true)
 * @example
 * ```typescript
 * RandomShuffle([1, 2, 3, 4, 5]) // Modifies and returns original array
 * ```
 * @example
 * ```typescript
 * RandomShuffle([1, 2, 3, 4, 5], true) // Returns new shuffled array, original unchanged
 * ```
 */
export function RandomShuffle<T>(array: T[], clone?: boolean): T[] {
	const targetArray = clone ? [...array] : array;

	for (let i = targetArray.length - 1; i > 0; i--) {
		const j = RandomInt(0, i);
		const temp = targetArray[i];
		targetArray[i] = targetArray[j] as T;
		targetArray[j] = temp as T;
	}

	return targetArray;
}

/**
 * Generates a random boolean value.
 * @param probability - Probability of returning true (0.0 to 1.0, default: 0.5)
 * @returns Random boolean based on probability
 * @throws {RangeError} If probability is outside the range [0, 1]
 * @example
 * ```typescript
 * RandomBool() // 50% chance of true
 * ```
 * @example
 * ```typescript
 * RandomBool(0.8) // 80% chance of true
 * ```
 */
export function RandomBool(probability = 0.5): boolean {
	if (probability < 0 || probability > 1) throw new RangeError(`Probability must be between 0 and 1, got ${probability}`);

	return globalPRNG() < probability;
}

/**
 * Generates a random number following a normal (Gaussian) distribution.
 * Uses the Box-Muller transform. The first uniform sample u1 is resampled
 * until it is ≥ `Number.EPSILON` to avoid `log(0) = -Infinity`.
 * @param mean - Mean of the distribution (default: 0)
 * @param standardDeviation - Standard deviation of the distribution (default: 1)
 * @returns Random number from normal distribution
 * @throws Never throws; always returns a valid number
 * @example
 * ```typescript
 * RandomNormal() // Standard normal distribution (mean=0, std=1)
 * ```
 * @example
 * ```typescript
 * RandomNormal(100, 15) // IQ-like distribution (mean=100, std=15)
 * ```
 */
export function RandomNormal(mean = 0, standardDeviation = 1): number {
	// Box-Muller transform — u1 must be > 0 to avoid log(0) = -Infinity
	let u1 = globalPRNG();
	/**
	 * Avoid log(0) → -Infinity by rejecting u1 too close to 0.
	 * BOX_MULLER_MIN_U1 = Number.EPSILON ≈ 2.22e-16.
	 * Expected retry probability per call: ~2.22e-16 (effectively never executed).
	 * Box-Muller with u1 >= Number.EPSILON is statistically sound and produces
	 * valid normal-distributed values.
	 */
	while (u1 < BOX_MULLER_MIN_U1) {
		u1 = globalPRNG();
	}
	const u2 = globalPRNG();

	const z0 = Math.sqrt(BOX_MULLER_COEFFICIENT * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
	return (z0 * standardDeviation) + mean;
}
