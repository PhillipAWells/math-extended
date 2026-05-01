/**
 * Assertion utilities for quaternion validation and error handling.
 * Provides runtime type checking and validation for quaternion operations.
 */

import { AssertVector, VectorError } from '../vectors/asserts.js';
import { TQuaternion, TEulerAngles, TAxisAngle, TRotationMatrix } from './types.js';

/**
 * Custom error class for quaternion-specific validation errors.
 * Extends the base VectorError to maintain consistency with vector operations.
 */
export class QuaternionError extends VectorError {
	readonly code: string = 'QUATERNION_ERROR';

	/**
	 * Creates a new QuaternionError instance.
	 *
	 * @param message - Error message describing the validation failure
	 * @param options - Optional error context
	 * @param options.cause - Original error that caused this error
	 */
	constructor(message: string, options?: { cause?: unknown }) {
		super(message, options);
		this.name = 'QuaternionError';
	}
}

/**
 * Validates that a value is a proper quaternion.
 * A valid quaternion must be an array of exactly 4 finite numbers.
 *
 * @param quaternion - The value to validate as a quaternion
 * @param options - Validation options (currently unused, reserved for future extensions)
 * @throws {QuaternionError} If the quaternion is invalid
 *
 * @example
	 * ```typescript
	 * AssertQuaternion([0, 0, 0, 1]); // Valid - passes silently
	 * AssertQuaternion([1, 2, 3]);    // Throws QuaternionError - wrong length
	 * AssertQuaternion([1, 2, 3, NaN]); // Throws QuaternionError - contains NaN
	 * ```
 */
export function AssertQuaternion(quaternion: unknown, options: Record<string, unknown> = {}): asserts quaternion is TQuaternion {
	if (!Array.isArray(quaternion)) {
		throw new QuaternionError('Quaternion must be an array');
	}

	if (quaternion.length !== 4) {
		throw new QuaternionError(`Quaternion must have exactly 4 components, got ${quaternion.length}`);
	}

	// Use existing vector validation for number checking
	try {
		AssertVector(quaternion, options);
	} catch (error) {
		if (error instanceof VectorError) {
			throw new QuaternionError(error.message);
		}
		throw error;
	}
}

/**
 * Validates that a quaternion is normalized (unit quaternion).
 * A unit quaternion has a magnitude of 1 and represents a valid rotation.
 *
 * @param quaternion - The quaternion to validate
 * @param tolerance - Tolerance for floating-point comparison (default: 1e-6)
 * @throws {QuaternionError} If the quaternion is not normalized
 *
 * @example
	 * ```typescript
	 * AssertNormalizedQuaternion([0, 0, 0, 1]); // Valid unit quaternion
	 * AssertNormalizedQuaternion([1, 1, 1, 1]); // Throws - not normalized
	 * ```
 */
export function AssertNormalizedQuaternion(quaternion: TQuaternion, tolerance: number = 1e-6): void {
	AssertQuaternion(quaternion);

	const [x, y, z, w] = quaternion;
	const magnitude = Math.sqrt((x * x) + (y * y) + (z * z) + (w * w));

	if (Math.abs(magnitude - 1) > tolerance) {
		throw new QuaternionError(`Quaternion must be normalized (magnitude = 1), got magnitude = ${magnitude}`);
	}
}

/**
 * Validates that a value is proper Euler angles.
 * Euler angles must be an array of exactly 3 finite numbers.
 *
 * @param euler - The value to validate as Euler angles
 * @param options - Validation options
 * @throws {QuaternionError} If the Euler angles are invalid
 */
export function AssertEulerAngles(euler: unknown, options: Record<string, unknown> = {}): asserts euler is TEulerAngles {
	if (!Array.isArray(euler)) {
		throw new QuaternionError('Euler angles must be an array');
	}

	if (euler.length !== 3) {
		throw new QuaternionError(`Euler angles must have exactly 3 components, got ${euler.length}`);
	}

	try {
		AssertVector(euler, options);
	} catch (error) {
		if (error instanceof VectorError) {
			throw new QuaternionError(`Invalid Euler angles: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Validates that a value is proper axis-angle representation.
 * Axis-angle must be an array of exactly 4 finite numbers.
 *
 * @param axisAngle - The value to validate as axis-angle
 * @param options - Validation options
 * @throws {QuaternionError} If the axis-angle is invalid
 */
export function AssertAxisAngle(axisAngle: unknown, options: Record<string, unknown> = {}): asserts axisAngle is TAxisAngle {
	if (!Array.isArray(axisAngle)) {
		throw new QuaternionError('Axis-angle must be an array');
	}

	if (axisAngle.length !== 4) {
		throw new QuaternionError(`Axis-angle must have exactly 4 components, got ${axisAngle.length}`);
	}

	try {
		AssertVector(axisAngle, options);
	} catch (error) {
		if (error instanceof VectorError) {
			throw new QuaternionError(`Invalid axis-angle: ${error.message}`);
		}
		throw error;
	}
}

/**
 * Validates that a value is a proper rotation matrix.
 * Rotation matrix must be a 3x3 matrix (TMatrix3).
 *
 * @param matrix - The value to validate as a rotation matrix
 * @param options - Validation options
 * @throws {QuaternionError} If the rotation matrix is invalid
 */
export function AssertRotationMatrix(matrix: unknown, options: Record<string, unknown> = {}): asserts matrix is TRotationMatrix {
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
		try {
			AssertVector(matrix[i], options);
		} catch (error) {
			if (error instanceof VectorError) {
				throw new QuaternionError(`Invalid rotation matrix row ${i}: ${error.message}`);
			}
			throw error;
		}
	}
}

/**
 * Validates that multiple quaternions are all valid.
 * Convenience function for batch validation.
 *
 * @param quaternions - Array of quaternions to validate
 * @param options - Validation options
 * @throws {QuaternionError} If any quaternion is invalid
 */
export function AssertQuaternions(quaternions: unknown[], options: Record<string, unknown> = {}): asserts quaternions is TQuaternion[] {
	if (!Array.isArray(quaternions)) {
		throw new QuaternionError('Quaternions must be an array');
	}

	for (let i = 0; i < quaternions.length; i++) {
		try {
			AssertQuaternion(quaternions[i], options);
		} catch (error) {
			if (error instanceof QuaternionError) {
				throw new QuaternionError(`Invalid quaternion at index ${i}: ${error.message}`);
			}
			throw error;
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
 * @param options - Validation options
 * @returns true if the quaternion is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateQuaternion(someValue)) {
 *   // Process the valid quaternion
 * }
 * ```
 */
export function ValidateQuaternion(quaternion: unknown, options: Record<string, unknown> = {}): quaternion is TQuaternion {
	try {
		AssertQuaternion(quaternion, options);
		return true;
	} catch {
		return false;
	}
}

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
export function ValidateNormalizedQuaternion(quaternion: TQuaternion, tolerance: number = 1e-6): boolean {
	try {
		AssertNormalizedQuaternion(quaternion, tolerance);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates that an unknown value is valid Euler angles without throwing an error.
 *
 * @param euler - The value to validate as Euler angles
 * @param options - Validation options
 * @returns true if the Euler angles are valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateEulerAngles([0.5, 1.0, 1.5])) {
 *   // Process the valid Euler angles
 * }
 * ```
 */
export function ValidateEulerAngles(euler: unknown, options: Record<string, unknown> = {}): euler is TEulerAngles {
	try {
		AssertEulerAngles(euler, options);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates that an unknown value is a valid axis-angle representation without throwing an error.
 *
 * @param axisAngle - The value to validate as axis-angle
 * @param options - Validation options
 * @returns true if the axis-angle is valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateAxisAngle({ axis: [0, 0, 1], angle: Math.PI / 2 })) {
 *   // Process the valid axis-angle
 * }
 * ```
 */
export function ValidateAxisAngle(axisAngle: unknown, options: Record<string, unknown> = {}): axisAngle is TAxisAngle {
	try {
		AssertAxisAngle(axisAngle, options);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates that an unknown value is a valid rotation matrix without throwing an error.
 *
 * @param matrix - The value to validate as a rotation matrix
 * @param options - Validation options
 * @returns true if the matrix is a valid rotation matrix, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateRotationMatrix(someValue)) {
 *   // Process the valid rotation matrix
 * }
 * ```
 */
export function ValidateRotationMatrix(matrix: unknown, options: Record<string, unknown> = {}): matrix is TRotationMatrix {
	try {
		AssertRotationMatrix(matrix, options);
		return true;
	} catch {
		return false;
	}
}

/**
 * Validates that an unknown value is an array of valid quaternions without throwing an error.
 *
 * @param quaternions - The value to validate as an array of quaternions
 * @param options - Validation options
 * @returns true if all quaternions are valid, false otherwise
 *
 * @example
 * ```typescript
 * if (ValidateQuaternions([q1, q2, q3])) {
 *   // Process the valid quaternion array
 * }
 * ```
 */
export function ValidateQuaternions(quaternions: unknown[], options: Record<string, unknown> = {}): quaternions is TQuaternion[] {
	try {
		AssertQuaternions(quaternions, options);
		return true;
	} catch {
		return false;
	}
}
