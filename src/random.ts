const BOX_MULLER_COEFFICIENT = -2;

/**
 * Generates a random integer within the specified range (inclusive).
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer between min and max, or NaN if min > max
 * @throws Returns `Number.NaN` when `min > max`
 * @example RandomInt(1, 6) // Returns 1, 2, 3, 4, 5, or 6 (dice roll)
 * @example RandomInt(-5, 5) // Returns any integer from -5 to 5
 * @example RandomInt(10, 5) // Returns Number.NaN (invalid range)
 */
export function RandomInt(min: number, max: number): number {
	if (min > max) return Number.NaN;

	return Math.floor((Math.random() * (max - min + 1)) + min);
}

/**
 * Generates a random floating-point number within the specified range.
 * Note: Asymmetry with RandomInt — this function returns NaN when min >= max (not just min > max).
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (exclusive)
 * @returns Random float between min (inclusive) and max (exclusive), or NaN if min >= max
 * @throws Returns `Number.NaN` when `min >= max`
 * @example RandomFloat(0, 1) // Returns 0.0 to 0.999...
 * @example RandomFloat(-1.5, 1.5) // Returns any float from -1.5 to 1.499...
 * @example RandomFloat(5, 5) // Returns Number.NaN (min equals max)
 */
export function RandomFloat(min: number, max: number): number {
	if (min >= max) return Number.NaN;

	return (Math.random() * (max - min)) + min;
}

/**
 * Randomly selects one element from an array.
 * @template T - The type of elements in the array
 * @param array - Array to choose from
 * @returns Random element from the array, or undefined if array is empty
 * @example RandomChoice([1, 2, 3, 4, 5]) // Returns one of the numbers
 * @example RandomChoice(['red', 'green', 'blue']) // Returns one of the colors
 */
export function RandomChoice<T>(array: T[]): T | undefined {
	if (array.length === 0) return undefined;

	const index = RandomInt(0, array.length - 1);
	return array[index];
}

/**
 * Randomly selects multiple elements from an array without replacement.
 * @template T - The type of elements in the array
 * @param array - Array to choose from
 * @param count - Number of elements to select
 * @returns Array of randomly selected elements, or empty array if invalid inputs
 * @example RandomSample([1, 2, 3, 4, 5], 3) // Returns 3 unique numbers
 * @example RandomSample(['a', 'b', 'c'], 2) // Returns 2 unique letters
 */
export function RandomSample<T>(array: T[], count: number): T[] {
	if (array.length === 0 || count <= 0 || count > array.length) return [];

	const result: T[] = [];
	const indices = new Set<number>();

	while (result.length < count) {
		const index = RandomInt(0, array.length - 1);
		if (!indices.has(index)) {
			indices.add(index);

			const element = array[index];
			if (element !== undefined) {
				result.push(element);
			}
		}
	}

	return result;
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * @template T - The type of elements in the array
 * @param array - Array to shuffle
 * @param clone - If true, returns a shuffled copy; if false/undefined, modifies original array
 * @returns Shuffled array (original reference if clone=false, new array if clone=true)
 * @example RandomShuffle([1, 2, 3, 4, 5]) // Modifies and returns original array
 * @example RandomShuffle([1, 2, 3, 4, 5], true) // Returns new shuffled array, original unchanged
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
 * @example RandomBool() // 50% chance of true
 * @example RandomBool(0.8) // 80% chance of true
 */
export function RandomBool(probability: number = 0.5): boolean {
	if (probability < 0 || probability > 1) return false;

	return Math.random() < probability;
}

/**
 * Generates a random number following a normal (Gaussian) distribution.
 * Uses the Box-Muller transform for generating normally distributed values.
 * @param mean - Mean of the distribution (default: 0)
 * @param standardDeviation - Standard deviation of the distribution (default: 1)
 * @returns Random number from normal distribution
 * @example RandomNormal() // Standard normal distribution (mean=0, std=1)
 * @example RandomNormal(100, 15) // IQ-like distribution (mean=100, std=15)
 */
export function RandomNormal(mean: number = 0, standardDeviation: number = 1): number {
	// Box-Muller transform
	const u1 = Math.random();
	const u2 = Math.random();

	const z0 = Math.sqrt(BOX_MULLER_COEFFICIENT * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
	return (z0 * standardDeviation) + mean;
}
