/**
 * Assertion utilities for quaternion validation and error handling.
 * Provides runtime type checking and validation for quaternion operations.
 */

import { BaseError, type TErrorMetadata } from '@pawells/typescript-common';
import { makeValidate } from '../internal/make-validate.js';
import { type TQuaternion, type TEulerAngles, type TAxisAngle, type TRotationMatrix } from './types.js';

/**
 * Error thrown when quaternion validation fails.
 */
export class QuaternionError extends BaseError<TQuaternionErrorMetadata> {
	/**
	 * Enumeration of quaternion operation error codes for classification and debugging.
	 *
	 * - `QUATERNION_ERROR` — General quaternion validation or operation failure
	 */
	public static readonly Code = Object.freeze({
		QUATERNION_ERROR: 'QUATERNION_ERROR'
	} as const);

	/**
	 * Creates a new QuaternionError instance with a code, message, and optional cause chain.
	 *
	 * The error extends BaseError to provide structured error classification and cause chain propagation.
	 * The code property is accessible via the `Code` getter (inherited from BaseError).
	 * The cause chain is accessible via the `Cause` getter (inherited from BaseError).
	 * Error metadata (code, cause) is accessible via the `Metadata` getter (inherited from BaseError).
	 *
	 * @param message - Human-readable error message describing the quaternion operation failure
	 * @param options - Optional configuration object
	 * @param options.cause - Original error to chain for root cause analysis
	 *
	 * @example
	 * ```typescript
	 * // Invalid quaternion
	 * throw new QuaternionError('Invalid quaternion');
	 *
	 * // With cause chain
	 * try {
	 *   // attempt operation
	 * } catch (originalError) {
	 *   throw new QuaternionError('Invalid quaternion', { cause: originalError });
	 * }
	 * ```
	 */
	constructor(message: string, options?: { cause?: Error }) {
		super(message, {
			code: QuaternionError.Code.QUATERNION_ERROR,
			cause: options?.cause
		});
	}
}

/**
 * Metadata structure for `QuaternionError` instances.
 *
 * Extends base error metadata from BaseError with quaternion-specific context.
 * Contains the error code for classification and an optional cause chain for root cause analysis.
 *
 * @typedef {object} TQuaternionErrorMetadata
 * @property {string} [code] - Error code for classification (e.g., `QUATERNION_ERROR`)
 * @property {Error} [cause] - Optional original error for cause chain propagation
 */
export type TQuaternionErrorMetadata = TErrorMetadata;

/**
 * Validates that a value is a proper quaternion.
 * A valid quaternion must be an array of exactly 4 finite numbers.
 *
 * @param quaternion - The value to validate as a quaternion
 * @throws {QuaternionError} If the input is not an array, if it does not have exactly 4 components, or if any component is not a finite number
 *
 * @example
 * ```typescript
 * AssertQuaternion([0, 0, 0, 1]); // Valid - passes silently
 * AssertQuaternion([1, 2, 3]);    // Throws QuaternionError - wrong length
 * AssertQuaternion([1, 2, 3, NaN]); // Throws QuaternionError - contains NaN
 * ```
 */
export function AssertQuaternion(quaternion: unknown): asserts quaternion is TQuaternion {
	if (!Array.isArray(quaternion)) {
		throw new QuaternionError('Quaternion must be an array');
	}

	if (quaternion.length !== 4) {
		throw new QuaternionError(`Quaternion must have exactly 4 components, got ${quaternion.length}`);
	}

	for (let i = 0; i < 4; i++) {
		if (typeof quaternion[i] !== 'number' || Number.isNaN(quaternion[i])) {
			throw new QuaternionError(`Quaternion component ${i} must be a number (not ${typeof quaternion[i]})`);
		}
	}
}

/**
 * Validates that a quaternion is normalized (unit quaternion).
 * A unit quaternion has a magnitude of 1 and represents a valid rotation.
 *
 * @param quaternion - The quaternion to validate
 * @param tolerance - Tolerance for floating-point comparison (default: 1e-6)
 * @throws {QuaternionError} If the quaternion is not a valid array of 4 numbers, or if its magnitude does not equal 1 within the specified tolerance
 *
 * @example
 * ```typescript
 * AssertNormalizedQuaternion([0, 0, 0, 1]); // Valid unit quaternion
 * AssertNormalizedQuaternion([1, 1, 1, 1]); // Throws - not normalized
 * ```
 */
export function AssertNormalizedQuaternion(quaternion: TQuaternion, tolerance = 1e-6): void {
	AssertQuaternion(quaternion);

	const [x, y, z, w] = quaternion;
	const magnitude = Math.sqrt((x * x) + (y * y) + (z * z) + (w * w));

	if (Math.abs(magnitude - 1) > tolerance) {
		throw new QuaternionError(`Quaternion must be normalized (magnitude = 1), got magnitude = ${magnitude}`);
	}
}

/**
 * Validates that a value is proper Euler angles.
 * Euler angles must be an array of exactly 3 numbers. NaN is rejected; Infinity is intentionally permitted.
 *
 * @param euler - The value to validate as Euler angles
 * @throws {QuaternionError} If the input is not an array, if it does not have exactly 3 components, or if any component is NaN
 *
 * @example
 * ```typescript
 * AssertEulerAngles([0.5, 1.0, 1.5]); // Valid - passes silently
 * AssertEulerAngles([0.5, 1.0]);      // Throws QuaternionError - wrong length
 * AssertEulerAngles([0.5, 1.0, NaN]); // Throws QuaternionError - contains NaN
 * AssertEulerAngles([0.5, Infinity, 1.5]); // Valid - Infinity is permitted
 * ```
 */
export function AssertEulerAngles(euler: unknown): asserts euler is TEulerAngles {
	if (!Array.isArray(euler)) {
		throw new QuaternionError('Euler angles must be an array');
	}

	if (euler.length !== 3) {
		throw new QuaternionError(`Euler angles must have exactly 3 components, got ${euler.length}`);
	}

	// Validate each element is a number (NaN is rejected; Infinity is intentionally permitted)
	for (let i = 0; i < 3; i++) {
		if (typeof euler[i] !== 'number' || Number.isNaN(euler[i])) {
			throw new QuaternionError(`Invalid Euler angles: component ${i} must be a number (not ${typeof euler[i]})`);
		}
	}
}

/**
 * Validates that a value is proper axis-angle representation.
 * Axis-angle must be an array of exactly 4 numbers. NaN is rejected; Infinity is intentionally permitted.
 *
 * @param axisAngle - The value to validate as axis-angle
 * @throws {QuaternionError} If the input is not an array, if it does not have exactly 4 components, or if any component is NaN
 *
 * @example
 * ```typescript
 * AssertAxisAngle([0, 0, 1, Math.PI / 2]); // Valid - passes silently
 * AssertAxisAngle([0, 0, 1]);              // Throws QuaternionError - wrong length
 * AssertAxisAngle([0, 0, 1, NaN]);         // Throws QuaternionError - contains NaN
 * AssertAxisAngle([0, 0, 0, Infinity]);    // Valid - Infinity is permitted
 * ```
 */
export function AssertAxisAngle(axisAngle: unknown): asserts axisAngle is TAxisAngle {
	if (!Array.isArray(axisAngle)) {
		throw new QuaternionError('Axis-angle must be an array');
	}

	if (axisAngle.length !== 4) {
		throw new QuaternionError(`Axis-angle must have exactly 4 components, got ${axisAngle.length}`);
	}

	// Validate each element is a number (NaN is rejected; Infinity is intentionally permitted)
	for (let i = 0; i < 4; i++) {
		if (typeof axisAngle[i] !== 'number' || Number.isNaN(axisAngle[i])) {
			throw new QuaternionError(`Invalid axis-angle: component ${i} must be a number (not ${typeof axisAngle[i]})`);
		}
	}
}

/**
 * Validates that a value is a proper rotation matrix.
 * Rotation matrix must be a 3x3 matrix (TMatrix3). NaN is rejected; Infinity is intentionally permitted.
 *
 * @param matrix - The value to validate as a rotation matrix
 * @throws {QuaternionError} If the input is not an array, if it is not 3x3, or if any element is NaN
 *
 * @example
 * ```typescript
 * const matrix = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]; // Identity matrix
 * AssertRotationMatrix(matrix); // Valid - passes silently
 * AssertRotationMatrix([[1, 0, 0], [0, 1, 0]]); // Throws - not 3x3
 * AssertRotationMatrix([[Infinity, 0, 0], [0, 1, 0], [0, 0, 1]]); // Valid - Infinity is permitted
 * ```
 */
export function AssertRotationMatrix(matrix: unknown): asserts matrix is TRotationMatrix {
	if (!Array.isArray(matrix)) {
		throw new QuaternionError('Rotation matrix must be an array');
	}

	if (matrix.length !== 3) {
		throw new QuaternionError(`Rotation matrix must have exactly 3 rows, got ${matrix.length}`);
	}

	// Validate each row
	for (let i = 0; i < 3; i++) {
		if (!Array.isArray(matrix[i])) {
			throw new QuaternionError(`Rotation matrix row ${i} must be an array`);
		}

		if (matrix[i].length !== 3) {
			throw new QuaternionError(`Rotation matrix row ${i} must have exactly 3 elements, got ${matrix[i].length}`);
		}

		// Validate each element is a number (NaN is rejected; Infinity is intentionally permitted)
		for (let j = 0; j < 3; j++) {
			if (typeof matrix[i][j] !== 'number' || Number.isNaN(matrix[i][j])) {
				throw new QuaternionError(`Invalid rotation matrix row ${i}: component ${j} must be a number (not ${typeof matrix[i][j]})`);
			}
		}
	}
}

/**
 * Validates that multiple quaternions are all valid.
 * Convenience function for batch validation.
 *
 * @param quaternions - Array of quaternions to validate
 * @throws {QuaternionError} If the input is not an array or if any quaternion in the array is invalid
 *
 * @example
 * ```typescript
 * AssertQuaternions([[0, 0, 0, 1], [1, 0, 0, 0]]); // Valid - passes silently
 * AssertQuaternions([[0, 0, 0, 1], [1, 2, 3]]);    // Throws - second quaternion invalid
 * ```
 */
export function AssertQuaternions(quaternions: unknown[]): asserts quaternions is TQuaternion[] {
	if (!Array.isArray(quaternions)) {
		throw new QuaternionError('Quaternions must be an array');
	}

	for (let i = 0; i < quaternions.length; i++) {
		try {
			AssertQuaternion(quaternions[i]);
		}
		catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			throw new QuaternionError(`Invalid quaternion at index ${i}: ${message}`, {
				cause: error instanceof Error ? error : undefined
			});
		}
	}
}

/**
 * Validates that an unknown value is a valid quaternion without throwing an error.
 *
 * This function performs the same validation as AssertQuaternion but returns
 * a boolean instead of throwing an exception, making it suitable for
 * conditional logic where exceptions are not desired.
 *
 * @param quaternion - The value to validate as a quaternion
 * @returns true if the quaternion is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateQuaternion(someValue)) {
 *   // Process the valid quaternion
 * }
 * ```
 */
export const ValidateQuaternion: (quaternion: unknown) => quaternion is TQuaternion = makeValidate(AssertQuaternion);

/**
 * Validates that a quaternion is normalized (magnitude = 1) without throwing an error.
 *
 * @param quaternion - The quaternion to validate as normalized
 * @param tolerance - Maximum allowed deviation from unit magnitude (default: 1e-6)
 * @returns true if the quaternion is normalized, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateNormalizedQuaternion([1, 0, 0, 0])) {
 *   // Process the normalized quaternion
 * }
 * ```
 */
export function ValidateNormalizedQuaternion(quaternion: TQuaternion, tolerance = 1e-6): boolean {
	try {
		AssertNormalizedQuaternion(quaternion, tolerance);
		return true;
	}
	catch {
		return false;
	}
}

/**
 * Validates that an unknown value is valid Euler angles without throwing an error.
 *
 * @param euler - The value to validate as Euler angles
 * @returns true if the Euler angles are valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateEulerAngles([0.5, 1.0, 1.5])) {
 *   // Process the valid Euler angles
 * }
 * ```
 */
export const ValidateEulerAngles: (euler: unknown) => euler is TEulerAngles = makeValidate(AssertEulerAngles);

/**
 * Validates that an unknown value is a valid axis-angle representation without throwing an error.
 *
 * @param axisAngle - The value to validate as axis-angle
 * @returns true if the axis-angle is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateAxisAngle([0, 0, 1, Math.PI / 2])) {
 *   // Process the valid axis-angle
 * }
 * ```
 */
export const ValidateAxisAngle: (axisAngle: unknown) => axisAngle is TAxisAngle = makeValidate(AssertAxisAngle);

/**
 * Validates that an unknown value is a valid rotation matrix without throwing an error.
 *
 * @param matrix - The value to validate as a rotation matrix
 * @returns true if the matrix is a valid rotation matrix, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateRotationMatrix([[1, 0, 0], [0, 1, 0], [0, 0, 1]])) {
 *   // Process the valid rotation matrix
 * }
 * ```
 */
export const ValidateRotationMatrix: (matrix: unknown) => matrix is TRotationMatrix = makeValidate(AssertRotationMatrix);

/**
 * Validates that an unknown value is an array of valid quaternions without throwing an error.
 *
 * @param quaternions - The value to validate as an array of quaternions
 * @returns true if all quaternions are valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateQuaternions([[0, 0, 0, 1], [1, 0, 0, 0]])) {
 *   // Process the valid quaternion array
 * }
 * ```
 */
export function ValidateQuaternions(quaternions: unknown[]): quaternions is TQuaternion[] {
	try {
		AssertQuaternions(quaternions);
		return true;
	}
	catch {
		return false;
	}
}
