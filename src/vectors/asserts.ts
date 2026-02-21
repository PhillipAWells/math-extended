/**
 * Vector assertion utilities for type safety and runtime validation.
 * Provides comprehensive validation functions to ensure vector data integrity
 * and catch errors early in mathematical operations.
 */

import { IAssertException, IAssertNumberArgs, IAssertArrayArgs, SetExceptionMessage, ThrowException } from '@pawells/typescript-common';
import { TVector, TVector2, TVector3, TVector4 } from './types.js';

/**
 * Configuration options for vector assertion functions.
 * Allows flexible validation of vector properties and constraints.
 */
export type TAssertVectorArgs = IAssertNumberArgs & IAssertArrayArgs;

/**
 * Extended configuration for validating multiple vectors.
 * Includes all single vector options plus multi-vector constraints.
 */
interface IAssertVectorsArgs extends TAssertVectorArgs {
	/**
	 * Minimum vector size allowed.
	 * If specified, vectors must have at least this many components.
	 */
	minSize?: number;
	/**
	 * Whether all vectors must have the same size.
	 * Default: true when using individual arguments, configurable when using array syntax.
	 */
	sameSize?: boolean;
	/**
	 * Whether all vector elements must be finite numbers.
	 * If true, validates that each element is not Infinity or -Infinity.
	 */
	finite?: boolean;
}
/**
 * Extended exception interface for vector-specific error information.
 * Provides additional context about which vector component caused the error.
 */
interface IAssertVectorException extends IAssertException {
	/**
	 * Index of the vector component that caused the validation failure.
	 * Useful for debugging which specific element is invalid.
	 */
	index?: number;
}
type TAssertVectorValueArgs = IAssertNumberArgs;

/**
 * Specialized error class for vector-related operations and validations.
 * Thrown when vector assertions fail or vector operations encounter invalid data.
 *
 * @example
 * try {
 *   AssertVector("not a vector");
 * } catch (error) {
 *   if (error instanceof VectorError) {
 *     console.log("Vector validation failed:", error.message);
 *   }
 * }
 */
export class VectorError extends Error {
	/**
	 * Creates a new VectorError instance.
	 *
	 * @param message - Optional error message describing the validation failure
	 */
	constructor(message?: string) {
		super(message);
		this.name = 'VectorError';
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

/**
 * Validates that an unknown value is a valid vector (array of numbers).
 *
 * Performs comprehensive validation including array structure, size constraints,
 * and element-level number validation for every component.
 *
 * @param vector - The value to validate as a vector
 * @param args - Validation constraints (size, minSize, maxSize, finite, integer, gt, gte, lt, lte, eq)
 * @param exception - Custom exception details if validation fails
 * @throws {VectorError} If the value is not a valid vector meeting all constraints
 *
 * @example
 * ```typescript
 * // Basic validation — passes silently for a valid vector
 * AssertVector([1, 2, 3]);
 *
 * // Validate with size constraint
 * AssertVector([1, 2], { size: 2 });
 *
 * // Throws VectorError for non-array input
 * AssertVector("not a vector"); // throws VectorError
 * ```
 */
export function AssertVector(vector: unknown, args: TAssertVectorArgs = {}, exception: IAssertVectorException = {}): asserts vector is TVector {
	// Initialize exception configuration with defaults
	const exc: IAssertVectorException = exception ?? {};
	exc.class ??= VectorError;

	// First validate that it's an array
	if (!Array.isArray(vector)) {
		SetExceptionMessage(exc, 'Not a Valid Vector');
		ThrowException(exc);
	}

	// Type cast is safe after array validation
	const array = vector as unknown[];

	// Validate array size constraints (inherited from AssertArrayArgs)
	if (args.size !== undefined && array.length !== args.size) {
		SetExceptionMessage(exc, `Vector does not match expected size. (size: ${args.size})`);
		ThrowException(exc);
	}

	if (args.minSize !== undefined && array.length < args.minSize) {
		SetExceptionMessage(exc, `Vector is less than minimum size. (min: ${args.minSize})`);
		ThrowException(exc);
	}

	if (args.maxSize !== undefined && array.length > args.maxSize) {
		SetExceptionMessage(exc, `Vector exceeds maximum size. (max: ${args.maxSize})`);
		ThrowException(exc);
	}

	// Validate each element is a valid number using AssertVectorValue
	for (let i = 0; i < array.length; i++) {
		try {
			AssertVectorValue(array[i], args, { ...exc, index: i });
		} catch (error) {
			// Re-throw with vector context if it's our error type
			if (error instanceof VectorError) {
				throw error;
			}
			// Wrap other errors in VectorError
			SetExceptionMessage(exc, `Invalid Vector Element${exc.index ? `[${exc.index}]` : ''}: ${(error as Error).message}`);
			exc.index = i;
			ThrowException(exc);
		}
	}
}

/**
 * Validates that an unknown value is a valid 2D vector (exactly 2 numeric components).
 *
 * @param vector - The value to validate as a 2D vector
 * @param exception - Custom exception details if validation fails
 * @throws {VectorError} If the value is not a 2-component vector
 *
 * @example
 * ```typescript
 * AssertVector2([1, 2]);       // passes
 * AssertVector2([1, 2, 3]);    // throws — too many components
 * AssertVector2("not a vec");  // throws
 * ```
 */
export function AssertVector2(vector: unknown, exception: IAssertVectorException = {}): asserts vector is TVector2 {
	AssertVector(vector, { size: 2 }, exception);
}

/**
 * Validates that an unknown value is a valid 3D vector (exactly 3 numeric components).
 *
 * @param vector - The value to validate as a 3D vector
 * @param exception - Custom exception details if validation fails
 * @throws {VectorError} If the value is not a 3-component vector
 *
 * @example
 * ```typescript
 * AssertVector3([1, 2, 3]);    // passes
 * AssertVector3([1, 2]);       // throws — too few components
 * AssertVector3(null);         // throws
 * ```
 */
export function AssertVector3(vector: unknown, exception: IAssertVectorException = {}): asserts vector is TVector3 {
	AssertVector(vector, { size: 3 }, exception);
}

/**
 * Validates that an unknown value is a valid 4D vector (exactly 4 numeric components).
 *
 * @param vector - The value to validate as a 4D vector
 * @param exception - Custom exception details if validation fails
 * @throws {VectorError} If the value is not a 4-component vector
 *
 * @example
 * ```typescript
 * AssertVector4([1, 2, 3, 4]); // passes
 * AssertVector4([1, 2, 3]);    // throws — too few components
 * AssertVector4(undefined);    // throws
 * ```
 */
export function AssertVector4(vector: unknown, exception: IAssertVectorException = {}): asserts vector is TVector4 {
	AssertVector(vector, { size: 4 }, exception);
}

/**
 * Validates that an unknown value is a valid vector element (a finite, non-NaN number).
 *
 * Supports optional numeric constraints such as range bounds, integer enforcement,
 * and finiteness checks. Throws `VectorError` with the component index when available.
 *
 * @param value - The value to validate as a vector element
 * @param args - Numeric constraints (finite, integer, gt, gte, lt, lte, eq)
 * @param exception - Custom exception details, optionally including a component `index`
 * @throws {VectorError} If the value is not a valid number or violates any constraint
 *
 * @example
 * ```typescript
 * AssertVectorValue(3.14);                       // passes
 * AssertVectorValue(3.14, { finite: true });      // passes
 * AssertVectorValue(Infinity, { finite: true });  // throws
 * AssertVectorValue(NaN);                         // throws
 * AssertVectorValue(5, { gte: 0, lte: 10 });     // passes
 * ```
 */
export function AssertVectorValue(value: unknown, args: TAssertVectorValueArgs = {}, exception: IAssertVectorException = {}): asserts value is number {
	// Initialize exception configuration with defaults
	const exc: IAssertVectorException = exception ?? {};
	exc.class ??= VectorError;

	// Validate that the value is a number (and not NaN)
	if (typeof value !== 'number' || Number.isNaN(value)) {
		if (exc.index !== undefined) {
			SetExceptionMessage(exc, `Vector[${exc.index}] Not a Number`);
		} else {
			SetExceptionMessage(exc, `Vector element must be a number, got ${typeof value}`);
		}
		ThrowException(exc);
	}

	// Type cast is safe after number validation
	const numValue = value as number;

	// Apply all number validation constraints using the same logic as AssertNumber
	// but with VectorError as the default error class instead of NumberError

	// Validate finite constraint (if specified, value must be finite)
	if (args.finite === true && !Number.isFinite(numValue)) {
		SetExceptionMessage(exc, `Vector${exc.index ? `[${exc.index}]` : ''} Must be Finite`);
		ThrowException(exc);
	}

	// Validate integer constraint (if specified, value must be an integer)
	if (args.integer === true && !Number.isInteger(numValue)) {
		SetExceptionMessage(exc, `Vector${exc.index ? `[${exc.index}]` : ''} Must be an Integer`);
		ThrowException(exc);
	}

	// Validate equality constraint (if specified, value must exactly match)
	if (args.eq !== undefined && numValue !== args.eq) {
		SetExceptionMessage(exc, `Vector${exc.index ? `[${exc.index}]` : ''} Must be equal to ${args.eq}`);
		ThrowException(exc);
	}

	// Validate greater than constraint (exclusive - value must be strictly greater)
	if (args.gt !== undefined && numValue <= args.gt) {
		SetExceptionMessage(exc, `Vector${exc.index ? `[${exc.index}]` : ''} Must be greater than ${args.gt}`);
		ThrowException(exc);
	}

	// Validate greater than or equal constraint (inclusive - value can equal the bound)
	if (args.gte !== undefined && numValue < args.gte) {
		SetExceptionMessage(exc, `Vector${exc.index ? `[${exc.index}]` : ''} Must be greater than or equal to ${args.gte}`);
		ThrowException(exc);
	}

	// Validate less than constraint (exclusive - value must be strictly less)
	if (args.lt !== undefined && numValue >= args.lt) {
		SetExceptionMessage(exc, `Vector${exc.index ? `[${exc.index}]` : ''} Must be less than ${args.lt}`);
		ThrowException(exc);
	}

	// Validate less than or equal constraint (inclusive - value can equal the bound)
	if (args.lte !== undefined && numValue > args.lte) {
		SetExceptionMessage(exc, `Vector${exc.index ? `[${exc.index}]` : ''} Must be less than or equal to ${args.lte}`);
		ThrowException(exc);
	}
}

/**
 * Validates an array of vectors, ensuring each vector is valid and optionally
 * enforcing that all vectors share the same size.
 *
 * @param vectors - The array of vectors to validate (must be non-empty)
 * @param args - Validation constraints applied to each vector; set `sameSize: true`
 *   to require all vectors to have identical lengths
 * @param exception - Custom exception details if validation fails
 * @throws {VectorError} If the array is empty, any vector is invalid, or sizes
 *   differ when `sameSize` is `true`
 *
 * @example
 * ```typescript
 * // Validate an array of 3D vectors
 * AssertVectors([[1, 2, 3], [4, 5, 6]]);
 *
 * // Require all vectors to share the same length
 * AssertVectors([[1, 2], [3, 4]], { sameSize: true });
 *
 * // Throws because vectors have different sizes
 * AssertVectors([[1, 2], [1, 2, 3]], { sameSize: true }); // throws
 * ```
 */
export function AssertVectors(vectors: unknown[], args?: IAssertVectorsArgs, exception?: IAssertVectorException): void {
	const exc: IAssertVectorException = exception ?? {};
	exc.class ??= VectorError;

	// Validate that vectors is an array of arrays
	if (!Array.isArray(vectors)) {
		SetExceptionMessage(exc, 'Vectors argument must be an array of vectors');
		ThrowException(exc);
	}

	if (vectors.length === 0) {
		SetExceptionMessage(exc, 'Vectors array is empty');
		ThrowException(exc);
	}

	// Validate each vector and collect their sizes
	const sizes: number[] = [];

	for (let i = 0; i < vectors.length; i++) {
		try {
			AssertVector(vectors[i], args, { ...exc, index: i });
			sizes.push((vectors[i] as unknown[]).length);
		} catch (error) {
			if (error instanceof VectorError) {
				throw error;
			}
			SetExceptionMessage(exc, `Invalid vector at index ${i}: ${(error as Error).message}`);
			exc.index = i;
			ThrowException(exc);
		}
	}

	// Check if all vectors have the same size if required
	const requireSameSize = args?.sameSize ?? true;
	if (requireSameSize) {
		const [firstSize] = sizes;

		for (let i = 1; i < sizes.length; i++) {
			if (sizes[i] !== firstSize) {
				SetExceptionMessage(exc, `Vectors at index 0 and ${i} do not have the same size (${firstSize} vs ${sizes[i]})`);
				exc.index = i;
				ThrowException(exc);
			}
		}
	}
}
