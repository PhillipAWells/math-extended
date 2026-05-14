/**
 * Vector assertion utilities for type safety and runtime validation.
 * Provides comprehensive validation functions to ensure vector data integrity
 * and catch errors early in mathematical operations.
 */

import { VECTOR2_SCHEMA, VECTOR3_SCHEMA, VECTOR4_SCHEMA, VECTOR_SCHEMA, type TVector, type TVector2, type TVector3, type TVector4 } from './types.js';
import z from 'zod';

/**
 * Vector error class for validation failures and vector operations.
 * Extends Error to provide detailed error information with optional cause chain.
 *
 * @example
 * ```typescript
 * throw new VectorError('Invalid vector dimensions', { cause: originalError });
 * ```
 */
export class VectorError extends Error {
	public readonly code: string = 'VECTOR_ERROR';

	constructor(message: string, options?: { cause?: unknown }) {
		super(message);
		this.name = 'VectorError';
		if (options?.cause) {
			this.cause = options.cause;
		}
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
 * // Validate with size constraint
 * AssertVector([1, 2], { size: 2 });
 * // Throws VectorError for non-array input
 * AssertVector("not a vector"); // throws VectorError
 * ```
 */
export function AssertVector(vector: unknown): asserts vector is TVector {
	try {
		VECTOR_SCHEMA.parse(vector);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new VectorError(`Invalid vector: ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}
export function ValidateVector(vector: unknown): boolean {
	try {
		AssertVector(vector);
		return true;
	} catch {
		return false;
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
export function AssertVector2(vector: unknown): asserts vector is TVector2 {
	try {
		VECTOR2_SCHEMA.parse(vector);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new VectorError(`Invalid 2D vector: ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}
export function ValidateVector2(vector: unknown): boolean {
	try {
		AssertVector2(vector);
		return true;
	} catch {
		return false;
	}
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
export function AssertVector3(vector: unknown): asserts vector is TVector3 {
	try {
		VECTOR3_SCHEMA.parse(vector);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new VectorError(`Invalid 3D vector: ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}
export function ValidateVector3(vector: unknown): boolean {
	try {
		AssertVector3(vector);
		return true;
	} catch {
		return false;
	}
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
export function AssertVector4(vector: unknown): asserts vector is TVector4 {
	try {
		VECTOR4_SCHEMA.parse(vector);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new VectorError(`Invalid 4D vector: ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}
export function ValidateVector4(vector: unknown): boolean {
	try {
		AssertVector4(vector);
		return true;
	} catch {
		return false;
	}
}

export const VECTOR_SAME_SIZE_SCHEMA = z.array(VECTOR_SCHEMA).superRefine((vectors, ctx) => {
	if (!Array.isArray(vectors) || vectors.length === 0) {
		ctx.addIssue({
			code: 'custom',
			message: 'Input must be a non-empty array of vectors',
		});
		return;
	}

	const [firstVector] = vectors;
	if (!Array.isArray(firstVector)) {
		ctx.addIssue({
			code: 'custom',
			message: 'Each item must be an array representing a vector',
		});
		return;
	}

	const size = firstVector.length;
	for (const vector of vectors) {
		if (!Array.isArray(vector)) {
			ctx.addIssue({
				code: 'custom',
				message: 'Each item must be an array representing a vector',
			});
			return;
		}
		if (vector.length !== size) {
			ctx.addIssue({
				code: 'custom',
				message: `All vectors must have the same size. Expected size: ${size}, but got: ${vector.length}`,
			});
			return;
		}
	}
});
export type TVectorSameSize = z.infer<typeof VECTOR_SAME_SIZE_SCHEMA>;
export function AssertVectorSameSize(vectors: unknown[]): asserts vectors is TVectorSameSize {
	try {
		VECTOR_SAME_SIZE_SCHEMA.parse(vectors);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new VectorError(`Vectors must have same size: ${message}`, {
			cause: error instanceof Error ? error : undefined,
		});
	}
}
export function ValidateVectorSameSize(vectors: unknown[]): boolean {
	try {
		AssertVectorSameSize(vectors);
		return true;
	} catch {
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
	const isZero = vector.every((v) => v === 0);
	if (isZero) {
		throw new VectorError(`${label} must not be zero`);
	}
}
