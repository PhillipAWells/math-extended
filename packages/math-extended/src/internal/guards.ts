/**
 * Internal guard utilities for math-extended.
 *
 * These lightweight inline guards replace @pawells/typescript-common assert utilities
 * for numeric, array, and instance validation in math hot paths.
 *
 * @internal
 */

/**
 * Constraints for numeric validation.
 * @internal
 */
export interface INumberConstraints {
	/** Value must be an integer */
	integer?: boolean;
	/** Value must be finite (not NaN or Infinity) */
	finite?: boolean;
	/** Value must be strictly greater than this */
	gt?: number;
	/** Value must be greater than or equal to this */
	gte?: number;
	/** Value must be strictly less than this */
	lt?: number;
	/** Value must be less than or equal to this */
	lte?: number;
	/** Value must equal this exactly */
	eq?: number;
}

/**
 * Constraints for array validation.
 * @internal
 */
export interface IArrayConstraints {
	/** Array must have exactly this many elements */
	size?: number;
	/** Array must have at least this many elements */
	minSize?: number;
	/** Array must have at most this many elements */
	maxSize?: number;
}

/**
 * Exception details for error messages.
 * @internal
 */
export interface IExceptionDetails {
	/** Custom error message */
	message?: string;
	/** Error code (unused in lightweight guards, kept for compatibility) */
	code?: string;
}

/**
 * Asserts that a value is a number, optionally with constraints.
 * Throws an Error on validation failure with a descriptive message.
 *
 * @param value - The value to validate
 * @param constraints - Optional numeric constraints (finite, integer, range)
 * @param exception - Optional custom error message and code
 * @throws {Error} If value is not a number or constraints are violated
 * @example
 * ```typescript
 * AssertNumber(x); // x must be a number
 * AssertNumber(t, { finite: true }); // t must be finite (not NaN/Infinity)
 * AssertNumber(rows, { gte: 2 }); // rows must be >= 2
 * ```
 */
export function AssertNumber(
	value: unknown,
	constraints?: INumberConstraints,
	exception?: IExceptionDetails
): asserts value is number {
	if (typeof value !== 'number') {
		throw new Error(exception?.message ?? `Expected a number, got ${typeof value}`);
	}

	// Check integer constraint
	if (constraints?.integer === true && !Number.isInteger(value)) {
		throw new Error(exception?.message ?? `Expected an integer, got ${value}`);
	}

	// Check finite constraint
	if (constraints?.finite === true && !Number.isFinite(value)) {
		throw new Error(exception?.message ?? `Expected a finite number, got ${value}`);
	}

	// Check range constraints
	if (constraints?.gt !== undefined && value <= constraints.gt) {
		throw new Error(
			exception?.message ?? `Expected value > ${constraints.gt}, got ${value}`
		);
	}

	if (constraints?.gte !== undefined && value < constraints.gte) {
		throw new Error(
			exception?.message ?? `Expected value >= ${constraints.gte}, got ${value}`
		);
	}

	if (constraints?.lt !== undefined && value >= constraints.lt) {
		throw new Error(
			exception?.message ?? `Expected value < ${constraints.lt}, got ${value}`
		);
	}

	if (constraints?.lte !== undefined && value > constraints.lte) {
		throw new Error(
			exception?.message ?? `Expected value <= ${constraints.lte}, got ${value}`
		);
	}

	if (constraints?.eq !== undefined && value !== constraints.eq) {
		throw new Error(
			exception?.message ?? `Expected value === ${constraints.eq}, got ${value}`
		);
	}
}

/**
 * Asserts that a value is an array, optionally with size constraints.
 * Throws an Error on validation failure with a descriptive message.
 *
 * @param value - The value to validate
 * @param constraints - Optional size constraints (size, minSize, maxSize)
 * @param exception - Optional custom error message and code
 * @throws {Error} If value is not an array or constraints are violated
 * @example
 * ```typescript
 * AssertArray(items); // items must be an array
 * AssertArray(quaternions, { minSize: 2 }); // must have at least 2 elements
 * ```
 */
export function AssertArray(
	value: unknown,
	constraints?: IArrayConstraints,
	exception?: IExceptionDetails
): asserts value is unknown[] {
	if (!Array.isArray(value)) {
		throw new Error(exception?.message ?? `Expected an array, got ${typeof value}`);
	}

	// Check exact size
	if (constraints?.size !== undefined && value.length !== constraints.size) {
		throw new Error(
			exception?.message ?? `Expected array of size ${constraints.size}, got ${value.length}`
		);
	}

	// Check minimum size
	if (constraints?.minSize !== undefined && value.length < constraints.minSize) {
		throw new Error(
			exception?.message
			?? `Expected array of at least ${constraints.minSize} elements, got ${value.length}`
		);
	}

	// Check maximum size
	if (constraints?.maxSize !== undefined && value.length > constraints.maxSize) {
		throw new Error(
			exception?.message
			?? `Expected array of at most ${constraints.maxSize} elements, got ${value.length}`
		);
	}
}

/**
 * Asserts that a value is an instance of a given constructor.
 * Throws an Error on validation failure with a descriptive message.
 *
 * @template T - The type being asserted
 * @param value - The value to validate
 * @param ctor - The constructor to check against
 * @param exception - Optional custom error message and code
 * @throws {Error} If value is not an instance of ctor
 * @example
 * ```typescript
 * AssertInstanceOf(err, Error); // err must be an Error instance
 * AssertInstanceOf(shape, Circle); // shape must be a Circle instance
 * ```
 */
export function AssertInstanceOf<T>(
	value: unknown,
	ctor: abstract new (...args: never[]) => T,
	exception?: IExceptionDetails
): asserts value is T {
	if (!(value instanceof ctor)) {
		const typeName = ctor.name ?? 'unknown type';
		throw new Error(
			exception?.message ?? `Expected instance of ${typeName}, got ${typeof value}`
		);
	}
}

/**
 * Asserts that two values are not equal.
 * Throws an Error on validation failure with a descriptive message.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @param exception - Optional custom error message and code
 * @throws {Error} If values are equal (===)
 * @example
 * ```typescript
 * AssertNotEquals(left, right); // left must not equal right
 * AssertNotEquals(0, count); // count must not be zero
 * ```
 */
export function AssertNotEquals(
	a: unknown,
	b: unknown,
	exception?: IExceptionDetails
): void {
	if (a === b) {
		throw new Error(exception?.message ?? 'Values must not be equal');
	}
}
