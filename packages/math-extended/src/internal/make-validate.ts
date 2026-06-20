/**
 * Factory function to create a Validate* type guard from an Assert* function.
 *
 * Converts an assertion function (which throws on invalid input) into a boolean
 * type guard predicate that returns true for valid input and false otherwise.
 * This pattern allows for type-safe conditional logic without exception handling.
 *
 * @typeParam T - The type being validated
 * @param assert - The assertion function to wrap (throws if validation fails)
 * @returns A type guard function that returns true if valid, false otherwise
 *
 * @example
 * ```typescript
 * // Create a type guard for vectors
 * const ValidateVector = makeValidate(AssertVector);
 *
 * // Use the guard in conditional logic
 * if (ValidateVector([1, 2, 3])) {
 *   console.log('Valid vector');
 * }
 * ```
 */
export function makeValidate<T>(
	assert: (value: unknown) => asserts value is T
): (value: unknown) => value is T {
	return (value: unknown): value is T => {
		try {
			assert(value);
			return true;
		}
		catch {
			return false;
		}
	};
}
