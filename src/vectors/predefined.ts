/**
 * Predefined vector factory functions for common mathematical operations.
 * Provides convenient constructors for standard vectors used in graphics, physics, and mathematics.
 */

import type { TVector, TVector2, TVector3, TVector4 } from './types.js';

type TVectorSize3 = 3;
type TVectorSize4 = 4;

/**
 * Creates a zero vector of the specified dimension.
 * Zero vectors are commonly used as initial values, identity elements in addition,
 * and as the origin point in coordinate systems.
 *
 * @param size - The dimension of the vector (1, 2, 3, or 4)
 * @returns A vector with all components set to 0
 *
 * @example
	 * ```typescript
	 * const origin2D = VectorZero(2); // [0, 0]
	 * const origin3D = VectorZero(3); // [0, 0, 0]
	 * const origin4D = VectorZero(4); // [0, 0, 0, 0]
	 * ```
 */
export function VectorZero(size: 1): TVector;
export function VectorZero(size: 2): TVector2;
export function VectorZero(size: TVectorSize3): TVector3;
export function VectorZero(size: TVectorSize4): TVector4;
export function VectorZero(size: number): TVector | TVector2 | TVector3 | TVector4 {
	return new Array(size).fill(0);
}

/**
 * Creates a vector with all components set to 1.
 * One vectors are useful for scaling operations, default values,
 * and mathematical operations where unit values are needed.
 *
 * @param size - The dimension of the vector (1, 2, 3, or 4)
 * @returns A vector with all components set to 1
 *
 * @example
	 * ```typescript
	 * const ones2D = VectorOne(2); // [1, 1]
	 * const ones3D = VectorOne(3); // [1, 1, 1]
	 * const ones4D = VectorOne(4); // [1, 1, 1, 1]
	 * ```
 */
export function VectorOne(size: 1): TVector;
export function VectorOne(size: 2): TVector2;
export function VectorOne(size: TVectorSize3): TVector3;
export function VectorOne(size: TVectorSize4): TVector4;
export function VectorOne(size: number): TVector | TVector2 | TVector3 | TVector4 {
	return new Array(size).fill(1);
}

/**
 * Creates a 2D unit vector pointing upward (positive Y direction).
 * Standard in screen coordinates where Y increases downward, or
 * mathematical coordinates where Y increases upward.
 *
 * @returns [0, 1] - Unit vector in positive Y direction
 *
 * @example
	 * ```typescript
	 * const upDirection = Vector2Up(); // Character movement upward
	 * const velocity = Vector2Up().map(c => c * speed); // Moving up at given speed
	 * ```
 */
export function Vector2Up(): TVector2 {
	return [0, 1];
}

/**
 * Creates a 3D unit vector pointing upward (positive Y direction).
 * Standard in 3D graphics and physics where Y is typically the vertical axis.
 *
 * @returns [0, 1, 0] - Unit vector in positive Y direction
 *
 * @example
	 * ```typescript
	 * const worldUp = Vector3Up(); // World space up direction
	 * const jumpForce = Vector3Up().map(c => c * jumpStrength);
	 * ```
 */
export function Vector3Up(): TVector3 {
	return [0, 1, 0];
}

/**
 * Creates a 4D unit vector pointing upward (positive Y direction).
 * Useful in homogeneous coordinates and 4D transformations.
 *
 * @returns [0, 1, 0, 0] - Unit vector in positive Y direction
 * @example
	 * ```typescript
	 * const up4 = Vector4Up(); // [0, 1, 0, 0]
	 * ```
 */
export function Vector4Up(): TVector4 {
	return [0, 1, 0, 0];
}

/**
 * Creates a 2D unit vector pointing downward (negative Y direction).
 * Commonly used for gravity, falling objects, or downward movement.
 *
 * @returns [0, -1] - Unit vector in negative Y direction
 *
 * @example
	 * ```typescript
	 * const gravity = Vector2Down().map(c => c * 9.81); // Gravity force
	 * const dropDirection = Vector2Down(); // Object falling down
	 * ```
 */
export function Vector2Down(): TVector2 {
	return [0, -1];
}

/**
 * Creates a 3D unit vector pointing downward (negative Y direction).
 * Standard for gravity simulation and downward movement in 3D space.
 *
 * @returns [0, -1, 0] - Unit vector in negative Y direction
 *
 * @example
	 * ```typescript
	 * const gravityForce = Vector3Down().map(c => c * 9.81);
	 * const downwardRay = Vector3Down(); // Raycast downward
	 * ```
 */
export function Vector3Down(): TVector3 {
	return [0, -1, 0];
}

/**
 * Creates a 4D unit vector pointing downward (negative Y direction).
 *
 * @returns [0, -1, 0, 0] - Unit vector in negative Y direction
 * @example
	 * ```typescript
	 * const down4 = Vector4Down(); // [0, -1, 0, 0]
	 * ```
 */
export function Vector4Down(): TVector4 {
	return [0, -1, 0, 0];
}

/**
 * Creates a 2D unit vector pointing left (negative X direction).
 * Standard for leftward movement in 2D coordinate systems.
 *
 * @returns [-1, 0] - Unit vector in negative X direction
 *
 * @example
	 * ```typescript
	 * const leftMovement = Vector2Left().map(c => c * speed);
	 * const leftDirection = Vector2Left(); // Character facing left
	 * ```
 */
export function Vector2Left(): TVector2 {
	return [-1, 0];
}

/**
 * Creates a 3D unit vector pointing left (negative X direction).
 * Standard for leftward movement in 3D coordinate systems.
 *
 * @returns [-1, 0, 0] - Unit vector in negative X direction
 *
 * @example
	 * ```typescript
	 * const strafeLeft = Vector3Left().map(c => c * strafeSpeed);
	 * ```
 */
export function Vector3Left(): TVector3 {
	return [-1, 0, 0];
}

/**
 * Creates a 4D unit vector pointing left (negative X direction).
 *
 * @returns [-1, 0, 0, 0] - Unit vector in negative X direction
 * @example
	 * ```typescript
	 * const left4 = Vector4Left(); // [-1, 0, 0, 0]
	 * ```
 */
export function Vector4Left(): TVector4 {
	return [-1, 0, 0, 0];
}

/**
 * Creates a 2D unit vector pointing right (positive X direction).
 * Standard for rightward movement in 2D coordinate systems.
 *
 * @returns [1, 0] - Unit vector in positive X direction
 *
 * @example
	 * ```typescript
	 * const rightMovement = Vector2Right().map(c => c * speed);
	 * const rightDirection = Vector2Right(); // Character facing right
	 * ```
 */
export function Vector2Right(): TVector2 {
	return [1, 0];
}

/**
 * Creates a 3D unit vector pointing right (positive X direction).
 * Standard for rightward movement in 3D coordinate systems.
 *
 * @returns [1, 0, 0] - Unit vector in positive X direction
 *
 * @example
	 * ```typescript
	 * const strafeRight = Vector3Right().map(c => c * strafeSpeed);
	 * ```
 */
export function Vector3Right(): TVector3 {
	return [1, 0, 0];
}

/**
 * Creates a 4D unit vector pointing right (positive X direction).
 *
 * @returns [1, 0, 0, 0] - Unit vector in positive X direction
 * @example
	 * ```typescript
	 * const right4 = Vector4Right(); // [1, 0, 0, 0]
	 * ```
 */
export function Vector4Right(): TVector4 {
	return [1, 0, 0, 0];
}

/**
 * Creates a 3D unit vector pointing forward (positive Z direction).
 * Standard in right-handed coordinate systems where Z points toward the viewer.
 * Commonly used for forward movement and camera directions.
 *
 * @returns [0, 0, 1] - Unit vector in positive Z direction
 *
 * @example
	 * ```typescript
	 * const forwardMovement = Vector3Forward().map(c => c * speed);
	 * const cameraForward = Vector3Forward(); // Camera looking direction
	 * ```
 */
export function Vector3Forward(): TVector3 {
	return [0, 0, 1];
}

/**
 * Creates a 4D unit vector pointing forward (positive Z direction).
 *
 * @returns [0, 0, 1, 0] - Unit vector in positive Z direction
 * @example
	 * ```typescript
	 * const forward4 = Vector4Forward(); // [0, 0, 1, 0]
	 * ```
 */
export function Vector4Forward(): TVector4 {
	return [0, 0, 1, 0];
}

/**
 * Creates a 3D unit vector pointing backward (negative Z direction).
 * Standard in right-handed coordinate systems where negative Z points away from the viewer.
 * Commonly used for backward movement and opposite camera directions.
 *
 * @returns [0, 0, -1] - Unit vector in negative Z direction
 *
 * @example
	 * ```typescript
	 * const backwardMovement = Vector3Backward().map(c => c * speed);
	 * const reverseDirection = Vector3Backward(); // Moving away from target
	 * ```
 */
export function Vector3Backward(): TVector3 {
	return [0, 0, -1];
}

/**
 * Creates a 4D unit vector pointing backward (negative Z direction).
 *
 * @returns [0, 0, -1, 0] - Unit vector in negative Z direction
 * @example
	 * ```typescript
	 * const backward4 = Vector4Backward(); // [0, 0, -1, 0]
	 * ```
 */
export function Vector4Backward(): TVector4 {
	return [0, 0, -1, 0];
}
