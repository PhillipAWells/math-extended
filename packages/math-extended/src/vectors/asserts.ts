/**
 * Vector assertion utilities for type safety and runtime validation.
 * Provides comprehensive validation functions to ensure vector data integrity
 * and catch errors early in mathematical operations.
 */

import { BaseError, type TErrorMetadata } from '@pawells/typescript-common';
import { makeValidate } from '../internal/make-validate.js';
import { VECTOR2_SCHEMA, VECTOR3_SCHEMA, VECTOR4_SCHEMA, VECTOR_SCHEMA, type TVector, type TVector2, type TVector3, type TVector4 } from './types.js';
import z from 'zod/v4';

/**
 * Vector error class for validation failures and vector operations.
 * Extends Error to provide detailed error information with optional cause chain.
 *
 * @example
 * ```typescript
 * throw new VectorError('Invalid vector dimensions', { cause: originalError });
 * ```
 */
export class VectorError extends BaseError<TVectorErrorMetadata> {
	/**
	 * Enumeration of vector operation error codes for classification and debugging.
	 *
	 * - `VECTOR_ERROR` — General vector validation or operation failure
	 */
	public static readonly Code = Object.freeze({
		VECTOR_ERROR: 'VECTOR_ERROR'
	} as const);

	/**
	 * Creates a new VectorError instance with a code, message, and optional cause chain.
	 *
	 * The error extends BaseError to provide structured error classification and cause chain propagation.
	 * The code property is accessible via the `Code` getter (inherited from BaseError).
	 * The cause chain is accessible via the `Cause` getter (inherited from BaseError).
	 * Error metadata (code, cause) is accessible via the `Metadata` getter (inherited from BaseError).
	 *
	 * @param message - Human-readable error message describing the vector operation failure
	 * @param options - Optional configuration object
	 * @param options.cause - Original error to chain for root cause analysis
	 *
	 * @example
	 * ```typescript
	 * // Invalid vector dimensions
	 * throw new VectorError('Invalid vector dimensions');
	 *
	 * // With cause chain
	 * try {
	 *   // attempt operation
	 * } catch (originalError) {
	 *   throw new VectorError('Invalid vector', { cause: originalError });
	 * }
	 * ```
	 */
	constructor(message: string, options?: { cause?: Error }) {
		super(message, {
			code: VectorError.Code.VECTOR_ERROR,
			cause: options?.cause
		});
	}
}

/**
 * Metadata structure for `VectorError` instances.
 *
 * Extends base error metadata from BaseError with vector-specific context.
 * Contains the error code for classification and an optional cause chain for root cause analysis.
 *
 * @typedef {object} TVectorErrorMetadata
 * @property {string} [code] - Error code for classification (e.g., `VECTOR_ERROR`)
 * @property {Error} [cause] - Optional original error for cause chain propagation
 */
export type TVectorErrorMetadata = TErrorMetadata;

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
 * // Validate with size constraint
 * AssertVector([1, 2], { size: 2 });
 * // Throws VectorError for non-array input
 * AssertVector("not a vector"); // throws VectorError
 * ```
 */
export function AssertVector(vector: unknown): asserts vector is TVector {
	try {
		VECTOR_SCHEMA.parse(vector);
	}
	catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new VectorError(`Invalid vector: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
	}
}
/**
 * Validates that an unknown value is a valid vector (array of numbers).
 * Returns a boolean instead of throwing; use AssertVector for strict validation.
 *
 * @param vector - The value to validate as a vector
 * @returns true if the value is a valid vector, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateVector([1, 2, 3])) {
 *   console.log('Valid vector');
 * }
 * ```
 */
export const ValidateVector: (vector: unknown) => vector is TVector = makeValidate(AssertVector);

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
export function AssertVector2(vector: unknown): asserts vector is TVector2 {
	try {
		VECTOR2_SCHEMA.parse(vector);
	}
	catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new VectorError(`Invalid 2D vector: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
	}
}
/**
 * Validates that an unknown value is a valid 2D vector (exactly 2 numeric components).
 * Returns a boolean instead of throwing; use AssertVector2 for strict validation.
 *
 * @param vector - The value to validate as a 2D vector
 * @returns true if the value is a valid 2-component vector, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateVector2([1, 2])) {
 *   console.log('Valid 2D vector');
 * }
 * ```
 */
export const ValidateVector2: (vector: unknown) => vector is TVector2 = makeValidate(AssertVector2);

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
export function AssertVector3(vector: unknown): asserts vector is TVector3 {
	try {
		VECTOR3_SCHEMA.parse(vector);
	}
	catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new VectorError(`Invalid 3D vector: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
	}
}
/**
 * Validates that an unknown value is a valid 3D vector (exactly 3 numeric components).
 * Returns a boolean instead of throwing; use AssertVector3 for strict validation.
 *
 * @param vector - The value to validate as a 3D vector
 * @returns true if the value is a valid 3-component vector, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateVector3([1, 2, 3])) {
 *   console.log('Valid 3D vector');
 * }
 * ```
 */
export const ValidateVector3: (vector: unknown) => vector is TVector3 = makeValidate(AssertVector3);

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
export function AssertVector4(vector: unknown): asserts vector is TVector4 {
	try {
		VECTOR4_SCHEMA.parse(vector);
	}
	catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new VectorError(`Invalid 4D vector: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
	}
}
/**
 * Validates that an unknown value is a valid 4D vector (exactly 4 numeric components).
 * Returns a boolean instead of throwing; use AssertVector4 for strict validation.
 *
 * @param vector - The value to validate as a 4D vector
 * @returns true if the value is a valid 4-component vector, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateVector4([1, 2, 3, 4])) {
 *   console.log('Valid 4D vector');
 * }
 * ```
 */
export const ValidateVector4: (vector: unknown) => vector is TVector4 = makeValidate(AssertVector4);

/**
 * Zod schema that validates a non-empty array of vectors where every element is
 * itself a valid vector (array of numbers) and all vectors share the same length.
 *
 * Rejects empty arrays, non-array inputs, elements that are not arrays, and
 * collections where any two vectors differ in component count.
 *
 * @example
 * ```typescript
 * VECTOR_SAME_SIZE_SCHEMA.parse([[1, 2], [3, 4]]); // passes
 * VECTOR_SAME_SIZE_SCHEMA.parse([[1, 2], [3, 4, 5]]); // throws — mismatched sizes
 * VECTOR_SAME_SIZE_SCHEMA.parse([]); // throws — empty array
 * ```
 */
export const VECTOR_SAME_SIZE_SCHEMA = z.array(VECTOR_SCHEMA).superRefine((vectors, ctx) => {
	if (!Array.isArray(vectors) || vectors.length === 0) {
		ctx.addIssue({
			code: 'custom',
			message: 'Input must be a non-empty array of vectors'
		});
		return;
	}

	const [firstVector] = vectors;
	if (!Array.isArray(firstVector)) {
		ctx.addIssue({
			code: 'custom',
			message: 'Each item must be an array representing a vector'
		});
		return;
	}

	const size = firstVector.length;
	for (const vector of vectors) {
		if (!Array.isArray(vector)) {
			ctx.addIssue({
				code: 'custom',
				message: 'Each item must be an array representing a vector'
			});
			return;
		}
		if (vector.length !== size) {
			ctx.addIssue({
				code: 'custom',
				message: `All vectors must have the same size. Expected size: ${size}, but got: ${vector.length}`
			});
			return;
		}
	}
});
/**
 * TypeScript type inferred from {@link VECTOR_SAME_SIZE_SCHEMA}.
 * Represents a non-empty array of vectors that all share the same component count.
 */
export type TVectorSameSize = z.infer<typeof VECTOR_SAME_SIZE_SCHEMA>;

/**
 * Asserts that every vector in the array is a valid vector and that all vectors
 * share the same number of components.
 *
 * @param vectors - The array of values to validate as same-sized vectors
 * @throws {VectorError} If the input is empty, contains a non-array element, or
 *   if any two vectors differ in component count
 *
 * @example
 * ```typescript
 * AssertVectorSameSize([[1, 2, 3], [4, 5, 6]]); // passes
 * AssertVectorSameSize([[1, 2], [3, 4, 5]]);    // throws VectorError — mismatched sizes
 * AssertVectorSameSize([]);                       // throws VectorError — empty array
 * ```
 */
export function AssertVectorSameSize(vectors: unknown[]): asserts vectors is TVectorSameSize {
	try {
		VECTOR_SAME_SIZE_SCHEMA.parse(vectors);
	}
	catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new VectorError(`Vectors must have same size: ${message}`, {
			cause: error instanceof Error ? error : undefined
		});
	}
}
/**
 * Validates that all vectors in the array have the same size.
 * Returns a boolean instead of throwing; use AssertVectorSameSize for strict validation.
 *
 * @param vectors - The array of vectors to validate for uniform size
 * @returns true if all vectors have the same size, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateVectorSameSize([[1, 2], [3, 4], [5, 6]])) {
 *   console.log('All vectors have matching dimensions');
 * }
 * ```
 */
export function ValidateVectorSameSize(vectors: unknown[]): vectors is TVectorSameSize {
	try {
		AssertVectorSameSize(vectors);
		return true;
	}
	catch {
		return false;
	}
}

/**
 * Validates that the given vector is not a zero vector (all components are not zero).
 * Throws a VectorError if the vector is zero.
 *
 * @param vector - The vector to validate
 * @param label - The label for the vector used in the error message (default: 'Vector')
 * @throws {VectorError} If the vector is a zero vector
 *
 * @example
 * ```typescript
 * const v = [1, 2, 3];
 * AssertVectorNonZero(v); // Valid
 *
 * const zero = [0, 0, 0];
 * AssertVectorNonZero(zero, 'Direction'); // Throws VectorError: Direction must not be zero
 * ```
 */
export function AssertVectorNonZero(vector: TVector, label = 'Vector'): void {
	AssertVector(vector);
	// Check if vector is zero (all components are 0)
	const isZero = vector.every(v => v === 0);
	if (isZero) {
		throw new VectorError(`${label} must not be zero`);
	}
}
