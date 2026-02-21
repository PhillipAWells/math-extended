/**
 * Core vector mathematics operations for linear algebra and geometric calculations.
 * Provides a comprehensive set of vector operations with type safety and error checking.
 */

import { Clamp } from '../clamp.js';
import { AssertVector, AssertVectors, AssertVectorValue, VectorError, AssertVector2, AssertVector3 } from './asserts.js';
import { TAnyVector, TVectorResult, TVector, TVector2, TVector3 } from './types.js';

/**
 * Creates a deep copy of a vector.
 * Essential for avoiding mutations when performing operations that should preserve the original vector.
 *
 * @template T - The vector type extending TVector
 * @param vector - The vector to clone
 * @returns A new vector with identical components
 *
 * @example
 * const original = [1, 2, 3];
 * const copy = VectorClone(original);
 * copy[0] = 10; // original remains unchanged
 */
export function VectorClone<T extends TAnyVector>(vector: T): TVectorResult<T> {
	AssertVector(vector);
	return vector.map((v) => v) as TVectorResult<T>;
}

/**
 * Compares two vectors for equality with optional tolerance for floating-point precision.
 * Useful for comparing vectors that may have slight numerical differences due to calculations.
 *
 * @template T - The vector type extending TVector
 * @param a - First vector to compare
 * @param b - Second vector to compare
 * @param tolerance - Maximum allowed difference between components (default: 0 for exact equality)
 * @returns True if vectors are equal within tolerance, false otherwise
 *
 * @example
 * const a = [1.0001, 2.0001];
 * const b = [1.0002, 2.0002];
 * const exactlyEqual = VectorEquals(a, b); // false
 * const approximatelyEqual = VectorEquals(a, b, 0.001); // true
 */
export function VectorEquals<T extends TAnyVector>(a: T, b: T, tolerance: number = 0): boolean {
	AssertVectors([a, b]);
	if (a.length !== b.length) return false;

	for (let i = 0; i < a.length; i++) {
		const av = a[i];
		AssertVectorValue(av, {});

		const bv = b[i];
		AssertVectorValue(bv, {});
		if (tolerance !== 0) {
			if (Math.abs(av - bv) > tolerance) return false;
		} else if (av !== bv) return false;
	}

	return true;
}

/**
 * Converts a vector to a human-readable string representation.
 * Useful for debugging, logging, and displaying vector values.
 *
 * @param vector - The vector to convert to string
 * @param style - Output format: 'parens' for (x, y, z) or 'brackets' for [x, y, z]
 * @returns String representation of the vector
 *
 * @example
 * const vec = [1, 2, 3];
 * const parens = VectorToString(vec, 'parens'); // "(1, 2, 3)"
 * const brackets = VectorToString(vec, 'brackets'); // "[1, 2, 3]"
 */
export function VectorToString(vector: TVector, style: 'parens' | 'brackets' = 'parens'): string {
	AssertVector(vector);

	const components = vector.map((v) => v.toString()).join(', ');
	if (style === 'parens') {
		return `(${components})`;
	} else if (style === 'brackets') {
		return `[${components}]`;
	} else {
		throw new Error(`Invalid style: ${style}. Use 'parens' or 'brackets'.`);
	}
}

/**
 * Performs component-wise addition of two vectors.
 * Fundamental operation for vector arithmetic, physics simulations, and geometric transformations.
 *
 * @template T - The vector type extending TVector
 * @param a - First vector (augend)
 * @param b - Second vector (addend)
 * @returns New vector where each component is the sum of corresponding components
 *
 * @example
 * const position = [10, 20, 30];
 * const velocity = [1, -2, 0.5];
 * const newPosition = VectorAdd(position, velocity); // [11, 18, 30.5]
 */
export function VectorAdd<T extends TAnyVector>(a:T, b: T): TVectorResult<T> {
	AssertVectors([a, b]);

	const result: number[] = [];

	for (let i = 0; i < a.length; i++) {
		const av = a[i];
		AssertVectorValue(av, {});

		const bv = b[i];
		AssertVectorValue(bv, {});
		result.push(av + bv);
	}

	return result as TVectorResult<T>;
}

/**
 * Performs component-wise subtraction of two vectors.
 * Essential for calculating displacement, relative positions, and vector differences.
 *
 * @template T - The vector type extending TVector
 * @param a - First vector (minuend)
 * @param b - Second vector (subtrahend)
 * @returns New vector where each component is the difference of corresponding components
 *
 * @example
 * const target = [100, 50, 0];
 * const current = [80, 30, 0];
 * const direction = VectorSubtract(target, current); // [20, 20, 0]
 */
export function VectorSubtract<T extends TAnyVector>(a:T, b: T): TVectorResult<T> {
	AssertVectors([a, b]);

	const result: number[] = [];

	for (let i = 0; i < a.length; i++) {
		const av = a[i];
		AssertVectorValue(av, {}, { index: i });

		const bv = b[i];
		AssertVectorValue(bv, {}, { index: i });
		result.push(av - bv);
	}

	return result as TVectorResult<T>;
}

/**
 * Multiplies a vector by a scalar or performs component-wise multiplication with another vector.
 * Scalar multiplication scales the vector magnitude; component-wise multiplication is useful for scaling factors.
 *
 * @template T - The vector type extending TVector
 * @param a - Vector to multiply
 * @param b - Scalar number or vector for component-wise multiplication
 * @returns New vector with multiplied components
 *
 * @example
 * const velocity = [10, 5, 0];
 * const scaled = VectorMultiply(velocity, 2); // [20, 10, 0] - scalar multiplication
 * const factors = [1, -1, 0.5];
 * const componentWise = VectorMultiply(velocity, factors); // [10, -5, 0] - component-wise
 */
export function VectorMultiply<T extends TAnyVector>(a:T, b: T | number): TVectorResult<T> {
	const result: number[] = [];

	if (Array.isArray(b)) {
		if (b.length !== a.length) throw new Error('Vector Size Mismatch');

		for (let i = 0; i < a.length; i++) {
			const av = a[i];
			AssertVectorValue(av, {});

			const bv = b[i];
			AssertVectorValue(bv, {});

			const prod = av * bv;
			result.push(Object.is(prod, -0) ? 0 : prod);
		}
	} else if (typeof b === 'number') {
		for (const av of a) {
			AssertVectorValue(av, {});

			const prod = av * b;
			result.push(Object.is(prod, -0) ? 0 : prod);
		}
	}

	return result as TVectorResult<T>;
}

/**
 * Calculates the Euclidean distance between two vectors.
 * Fundamental for spatial calculations, collision detection, and proximity measurements.
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns The straight-line distance between the two points represented by the vectors
 *
 * @example
 * const pointA = [0, 0, 0];
 * const pointB = [3, 4, 0];
 * const distance = VectorDistance(pointA, pointB); // 5.0 (3-4-5 triangle)
 */
export function VectorDistance(a: TVector, b: TVector): number {
	return Math.sqrt(VectorDistanceSquared(a, b));
}

/**
 * Calculates the squared distance between two vectors.
 * More efficient than VectorDistance when only relative distances matter,
 * as it avoids the expensive square root operation.
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns The squared distance between vectors
 *
 * @example
 * const pointA = [1, 1];
 * const pointB = [4, 5];
 * const distSq = VectorDistanceSquared(pointA, pointB); // 25 (faster than distance comparison)
 */
export function VectorDistanceSquared(a:TVector, b: TVector): number {
	AssertVectors([a, b]);

	let sum = 0;

	for (let i = 0; i < a.length; i++) {
		const av = a[i];
		AssertVectorValue(av, {});

		const bv = b[i];
		AssertVectorValue(bv, {});
		sum += Math.pow(bv - av, 2);
	}

	return sum;
}

/**
 * Calculates the dot product (scalar product) of two vectors.
 * Fundamental operation for projections, angles, and determining vector relationships.
 * Returns positive for acute angles, zero for perpendicular vectors, negative for obtuse angles.
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns The dot product (scalar value)
 *
 * @example
 * const forward = [0, 0, 1];
 * const direction = [0, 0, 2];
 * const dot = VectorDot(forward, direction); // 2 (same direction)
 *
 * const perpendicular = [1, 0, 0];
 * const dotPerp = VectorDot(forward, perpendicular); // 0 (perpendicular)
 */
export function VectorDot(a:TVector, b: TVector): number {
	AssertVectors([a, b]);

	let dotProduct = 0;

	for (let i = 0; i < a.length; i++) {
		const av = a[i];
		AssertVectorValue(av, {});

		const bv = b[i];
		AssertVectorValue(bv, {});
		dotProduct += av * bv;
	}

	return dotProduct;
}

/**
 * Normalizes a vector to unit length (magnitude of 1).
 * Essential for direction vectors, surface normals, and unit calculations.
 * Preserves direction while standardizing magnitude.
 *
 * @template T - The vector type extending TVector
 * @param a - Vector to normalize
 * @returns Unit vector in the same direction
 * @throws {VectorError} If the vector is zero or has infinite magnitude
 *
 * @example
 * const vector = [3, 4, 0];
 * const normalized = VectorNormalize(vector); // [0.6, 0.8, 0] (magnitude = 1)
 *
 * const direction = [10, 0, 0];
 * const unitDirection = VectorNormalize(direction); // [1, 0, 0]
 */
export function VectorNormalize<T extends TAnyVector>(a: T): TVectorResult<T> {
	AssertVector(a);

	const magnitude = VectorMagnitude(a);
	if (magnitude === 0) throw new VectorError(`Cannot Normalize a Zero Vector: ${VectorToString(a)}`);
	if (magnitude === Number.POSITIVE_INFINITY) throw new VectorError(`Cannot Normalize a Vector with Infinite Magnitude: ${VectorToString(a)}`);

	const result = VectorClone(a);

	for (let i = 0; i < a.length; i++) {
		const av = a[i];
		AssertVectorValue(av, {});
		result[i] = av / magnitude;
	}

	return result as TVectorResult<T>;
}

/**
 * Calculates the magnitude (length) of a vector.
 * Fundamental for distance calculations, normalization, and vector analysis.
 *
 * @param a - Vector to measure
 * @returns The magnitude (length) of the vector
 *
 * @example
 * const velocity = [3, 4, 0];
 * const speed = VectorMagnitude(velocity); // 5.0
 *
 * const unitVector = [1, 0, 0];
 * const unitLength = VectorMagnitude(unitVector); // 1.0
 */
export function VectorMagnitude(a: TVector): number {
	AssertVector(a);

	let sum = 0;

	for (const av of a) {
		AssertVectorValue(av, {});
		sum += Math.pow(av, 2);
	}

	return Math.sqrt(sum);
}

/**
 * Returns a vector with the absolute value of each component.
 * Useful for distance calculations, bounding box calculations, and ensuring positive values.
 *
 * @template T - The vector type extending TVector
 * @param a - Vector to process
 * @returns New vector with absolute values of all components
 *
 * @example
 * const vector = [-3, 4, -2];
 * const absolute = VectorAbs(vector); // [3, 4, 2]
 *
 * const mixed = [1.5, -2.7, 0];
 * const absValues = VectorAbs(mixed); // [1.5, 2.7, 0]
 */
export function VectorAbs<T extends TAnyVector>(a: T):TVectorResult<T> {
	AssertVector(a);

	const result: number[] = [];

	for (const av of a) {
		AssertVectorValue(av, {});
		result.push(Math.abs(av));
	}

	return result as TVectorResult<T>;
}

/**
 * Checks if a vector is a zero vector (all components are zero).
 * Important for validating input vectors and avoiding division by zero in calculations.
 *
 * @param vector - Vector to check
 * @returns True if all components are zero, false otherwise
 *
 * @example
 * const zero = [0, 0, 0];
 * const isZero = VectorIsZero(zero); // true
 *
 * const notZero = [0, 0.001, 0];
 * const isNotZero = VectorIsZero(notZero); // false
 */
export function VectorIsZero(vector: TVector): boolean {
	return vector.every((v) => v === 0);
}

/**
 * Calculates the angle between two vectors in radians.
 * Essential for determining angular relationships, rotations, and orientations.
 * Always returns a positive angle between 0 and π radians.
 *
 * @param a - First vector
 * @param b - Second vector
 * @returns Angle between vectors in radians (0 to π)
 * @throws {VectorError} If either vector is zero
 *
 * @example
 * const right = [1, 0, 0];
 * const up = [0, 1, 0];
 * const angle = VectorAngle(right, up); // π/2 (90 degrees)
 *
 * const forward = [0, 0, 1];
 * const backward = [0, 0, -1];
 * const oppositeAngle = VectorAngle(forward, backward); // π (180 degrees)
 */
export function VectorAngle(a: TVector, b: TVector): number {
	AssertVectors([a, b]);
	if (VectorIsZero(a) || VectorIsZero(b)) throw new VectorError('Cannot Calculate Angle with Zero Vectors');
	const dot = VectorDot(a, b);
	const magProduct = VectorMagnitude(a) * VectorMagnitude(b);
	const cosTheta = Clamp(dot / magProduct, -1, 1);
	return Math.acos(cosTheta);
}

/**
 * Rotates a 2D vector by the specified angle in radians.
 * Essential for 2D transformations, sprite rotations, and directional calculations.
 *
 * @param vector - 2D vector to rotate
 * @param radians - Rotation angle in radians (positive = counterclockwise)
 * @returns New rotated 2D vector
 *
 * @example
 * const right = [1, 0];
 * const rotated90 = Vector2Rotate(right, Math.PI / 2); // [0, 1] (up)
 * const rotated180 = Vector2Rotate(right, Math.PI); // [-1, 0] (left)
 */
export function Vector2Rotate(vector: TVector2, radians: number): TVector2 {
	AssertVector2(vector);

	const cos = Math.cos(radians);
	const sin = Math.sin(radians);
	const [v0, v1] = vector;
	return [
		(v0 * cos) - (v1 * sin),
		(v0 * sin) + (v1 * cos),
	];
}

/**
 * Creates a 2D unit vector from an angle in radians.
 * Useful for creating directional vectors from angular measurements.
 *
 * @param radians - Angle in radians (0 = right, π/2 = up)
 * @returns Unit vector pointing in the specified direction
 *
 * @example
 * const right = Vector2FromAngle(0); // [1, 0]
 * const up = Vector2FromAngle(Math.PI / 2); // [0, 1]
 * const diagonal = Vector2FromAngle(Math.PI / 4); // [0.707, 0.707]
 */
export function Vector2FromAngle(radians: number): TVector2 {
	return [Math.cos(radians), Math.sin(radians)];
}

/**
 * Calculates the 2D cross product (returns a scalar).
 * In 2D, the cross product represents the signed area of the parallelogram formed by the vectors.
 * Useful for determining relative orientation and winding order.
 *
 * @param a - First 2D vector
 * @param b - Second 2D vector
 * @returns Scalar cross product (positive = counterclockwise, negative = clockwise)
 *
 * @example
 * const right = [1, 0];
 * const up = [0, 1];
 * const cross = Vector2Cross(right, up); // 1 (counterclockwise)
 * const crossReverse = Vector2Cross(up, right); // -1 (clockwise)
 */
export function Vector2Cross(a: TVector2, b: TVector2): number {
	AssertVector2(a);
	AssertVector2(b);
	return (a[0] * b[1]) - (a[1] * b[0]);
}

/**
 * Calculates the 3D rejection of vector a from vector b.
 * Returns the component of vector a that is perpendicular to vector b.
 * Useful for separating parallel and perpendicular components.
 *
 * @param a - Vector to reject from
 * @param b - Vector to reject onto
 * @returns Component of a perpendicular to b
 * @throws {VectorError} If vector b is zero
 *
 * @example
 * const force = [5, 3, 0];
 * const surface = [1, 0, 0];
 * const perpendicular = Vector3Reject(force, surface); // [0, 3, 0]
 */
export function Vector3Reject(a: TVector3, b: TVector3): TVector3 {
	AssertVector3(a);
	AssertVector3(b);
	if (VectorIsZero(b)) throw new VectorError('Cannot compute rejection with a zero vector');
	const projection = VectorProject(a, b);
	return VectorSubtract(a, projection);
}

/**
 * Projects vector a onto vector b.
 * Returns the component of vector a that lies parallel to vector b.
 * Essential for shadow calculations, force decomposition, and geometric projections.
 *
 * @template T - The vector type extending TVector
 * @param a - Vector to project
 * @param b - Vector to project onto
 * @returns Component of a parallel to b
 * @throws {VectorError} If vector b is zero
 *
 * @example
 * const force = [5, 3, 0];
 * const surface = [1, 0, 0];
 * const parallel = VectorProject(force, surface); // [5, 0, 0]
 */
export function VectorProject<T extends TAnyVector>(a: T, b: T): TVectorResult<T> {
	AssertVectors([a, b]);
	if (VectorIsZero(b)) throw new VectorError('Cannot project onto a zero vector');
	const dot = VectorDot(a, b);
	const magSquared = Math.pow(VectorMagnitude(b), 2);
	const scalar = dot / magSquared;

	const result: number[] = [];

	for (const bv of b) {
		AssertVectorValue(bv, {});
		result.push(scalar * bv);
	}

	return result as TVectorResult<T>;
}

/**
 * Reflects an incident vector across a 3D normal (specialized version).
 * This is a specialized version of VectorReflect for 3D vectors.
 * Automatically normalizes the normal vector for consistent results.
 *
 * @param incident - The incoming vector to reflect
 * @param normal - The surface normal (will be normalized automatically)
 * @returns The reflected vector
 * @throws {VectorError} If the normal is a zero vector
 *
 * @example
 * const incoming = [1, -1, 0];
 * const normal = [0, 1, 0]; // surface normal (upward)
 * const reflected = Vector3Reflect(incoming, normal); // [1, 1, 0]
 */
export function Vector3Reflect(incident: TVector3, normal: TVector3): TVector3 {
	AssertVector3(incident);
	AssertVector3(normal);
	if (VectorIsZero(normal)) throw new VectorError('Cannot reflect across a zero normal');
	const normalizedNormal = VectorNormalize(normal);
	return VectorReflect(incident, normalizedNormal);
}

/**
 * Calculates the 3D cross product of two vectors.
 * Returns a vector perpendicular to both input vectors.
 * Essential for surface normals, torque calculations, and 3D rotations.
 *
 * @param a - First 3D vector
 * @param b - Second 3D vector
 * @returns Vector perpendicular to both a and b (following right-hand rule)
 *
 * @example
 * const right = [1, 0, 0];
 * const forward = [0, 0, 1];
 * const up = Vector3Cross(right, forward); // [0, 1, 0]
 *
 * const normal = Vector3Cross([1, 0, 0], [0, 1, 0]); // [0, 0, 1]
 */
export function Vector3Cross(a: TVector3, b: TVector3): TVector3 {
	AssertVector3(a);
	AssertVector3(b);
	return [
		(a[1] * b[2]) - (a[2] * b[1]),
		(a[2] * b[0]) - (a[0] * b[2]),
		(a[0] * b[1]) - (a[1] * b[0]),
	];
}

/**
 * Calculates the magnitude of the 3D cross product.
 * Equivalent to the area of the parallelogram formed by the two vectors.
 * Useful for area calculations and determining vector orthogonality.
 *
 * @param a - First 3D vector
 * @param b - Second 3D vector
 * @returns Magnitude of the cross product
 *
 * @example
 * const side1 = [3, 0, 0];
 * const side2 = [0, 4, 0];
 * const area = VectorCrossMagnitude(side1, side2); // 12 (area of rectangle)
 */
export function VectorCrossMagnitude(a: TVector3, b: TVector3): number {
	AssertVector3(a);
	AssertVector3(b);

	const c = Vector3Cross(a, b);
	return Math.sqrt((c[0] * c[0]) + (c[1] * c[1]) + (c[2] * c[2]));
}

/**
 * Calculates the scalar triple product of three 3D vectors.
 * Returns the signed volume of the parallelepiped formed by the three vectors.
 * Useful for determining orientation and volume calculations.
 *
 * @param a - First 3D vector
 * @param b - Second 3D vector
 * @param c - Third 3D vector
 * @returns Signed volume (positive = right-handed orientation)
 *
 * @example
 * const x = [1, 0, 0];
 * const y = [0, 1, 0];
 * const z = [0, 0, 1];
 * const volume = Vector3ScalarTripleProduct(x, y, z); // 1 (unit cube)
 */
export function Vector3ScalarTripleProduct(a: TVector3, b: TVector3, c: TVector3): number {
	AssertVector3(a);
	AssertVector3(b);
	AssertVector3(c);

	const crossProduct = Vector3Cross(b, c);
	return VectorDot(a, crossProduct);
}

/**
 * Calculates the vector triple product of three 3D vectors.
 * Implements the formula: a × (b × c)
 * Useful for advanced geometric calculations and physics simulations.
 *
 * @param a - First 3D vector
 * @param b - Second 3D vector
 * @param c - Third 3D vector
 * @returns Vector result of a × (b × c)
 *
 * @example
 * const a = [1, 0, 0];
 * const b = [0, 1, 0];
 * const c = [0, 0, 1];
 * const result = Vector3TripleProduct(a, b, c); // [0, 0, 0]
 */
export function Vector3TripleProduct(a: TVector3, b: TVector3, c: TVector3): TVector3 {
	AssertVector3(a);
	AssertVector3(b);
	AssertVector3(c);

	const crossProduct = Vector3Cross(b, c);
	return Vector3Cross(a, crossProduct);
}

/**
 * Reflects a vector across a normal surface.
 * Simulates perfect reflection like light bouncing off a mirror.
 * The normal vector is automatically normalized for consistent results.
 *
 * @template T - The vector type extending TVector
 * @param incident - The incoming vector to reflect
 * @param normal - The surface normal vector
 * @returns The reflected vector
 *
 * @example
 * const incoming = [1, -1, 0];
 * const wall = [0, 1, 0]; // vertical wall normal
 * const bounced = VectorReflect(incoming, wall); // [1, 1, 0]
 */
export function VectorReflect<T extends TAnyVector>(incident: T, normal: T): TVectorResult<T> {
	AssertVectors([incident, normal]);

	const normalizedNormal = VectorNormalize(normal);
	const dot = VectorDot(incident, normalizedNormal);

	const result: number[] = [];

	for (let i = 0; i < incident.length; i++) {
		const iv = incident[i];
		AssertVectorValue(iv, {});

		const nnv = normalizedNormal[i];
		AssertVectorValue(nnv, {});
		result.push(iv - (2 * dot * nnv));
	}

	return result as TVectorResult<T>;
}

/**
 * Negates all components of a vector (multiplies by -1).
 * Creates a vector pointing in the exact opposite direction.
 * Handles special case of zero to avoid negative zero (-0).
 *
 * @template T - The vector type extending TVector
 * @param a - Vector to negate
 * @returns Vector with all components negated
 *
 * @example
 * const forward = [0, 0, 1];
 * const backward = VectorNegate(forward); // [0, 0, -1]
 *
 * const velocity = [5, -3, 2];
 * const opposite = VectorNegate(velocity); // [-5, 3, -2]
 */
export function VectorNegate<T extends TAnyVector>(a: T): TVectorResult<T> {
	const result: number[] = [];

	for (const av of a) {
		AssertVectorValue(av, {});
		// Special handling for zero to avoid negative zero (-0)
		if (av === 0) {
			result.push(0);
		} else {
			result.push(-1 * av);
		}
	}

	return result as TVectorResult<T>;
}

/**
 * Divides a vector by a scalar or performs component-wise division with another vector.
 * Scalar division scales the vector magnitude down; component-wise division is the inverse of component-wise multiplication.
 *
 * @template T - The vector type extending TVector
 * @param a - Vector to divide (dividend)
 * @param b - Scalar number or vector for component-wise division (divisor)
 * @returns New vector with divided components
 * @throws {VectorError} If any divisor component is zero
 *
 * @example
 * const velocity = [20, 10, 0];
 * const halved = VectorDivide(velocity, 2); // [10, 5, 0] - scalar division
 * const factors = [2, 5, 1];
 * const componentWise = VectorDivide(velocity, factors); // [10, 2, 0] - component-wise
 */
export function VectorDivide<T extends TAnyVector>(a: T, b: T | number): TVectorResult<T> {
	const result: number[] = [];

	if (Array.isArray(b)) {
		if (b.length !== a.length) throw new VectorError('Vector Size Mismatch');

		for (let i = 0; i < a.length; i++) {
			const av = a[i];
			AssertVectorValue(av, {});

			const bv = b[i];
			AssertVectorValue(bv, {});
			if (bv === 0) throw new VectorError(`Division by zero at component [${i}]`);

			const quot = av / bv;
			result.push(Object.is(quot, -0) ? 0 : quot);
		}
	} else if (typeof b === 'number') {
		if (b === 0) throw new VectorError('Division by zero scalar');
		for (const av of a) {
			AssertVectorValue(av, {});

			const quot = av / b;
			result.push(Object.is(quot, -0) ? 0 : quot);
		}
	}

	return result as TVectorResult<T>;
}

/**
 * Clamps each component of a vector between the corresponding min and max values.
 * Can accept scalar min/max (same bounds for all components) or vectors for per-component bounds.
 * Mirrors the scalar `Clamp` function for vector operations.
 *
 * @template T - The vector type extending TVector
 * @param a - Vector whose components are to be clamped
 * @param min - Minimum value (scalar applied to all components, or vector for per-component bounds)
 * @param max - Maximum value (scalar applied to all components, or vector for per-component bounds)
 * @returns New vector with each component clamped between min and max
 *
 * @example
 * const v = [5, -3, 12, 0];
 * VectorClamp(v, 0, 10); // [5, 0, 10, 0] - scalar bounds
 *
 * const mins = [0, -5, 0, -1];
 * const maxs = [10, 5, 8, 1];
 * VectorClamp(v, mins, maxs); // [5, -3, 8, 0] - per-component bounds
 */
export function VectorClamp<T extends TAnyVector>(a: T, min: T | number, max: T | number): TVectorResult<T> {
	AssertVector(a);

	const result: number[] = [];

	for (let i = 0; i < a.length; i++) {
		const av = a[i];
		AssertVectorValue(av, {});

		const minV = Array.isArray(min) ? (min[i] as number) : min;
		const maxV = Array.isArray(max) ? (max[i] as number) : max;
		result.push(Math.max(minV, Math.min(av, maxV)));
	}

	return result as TVectorResult<T>;
}

/**
 * Limits the magnitude of a vector to a maximum value.
 * If the vector's magnitude exceeds the limit, scales it down proportionally.
 * Preserves direction while constraining magnitude.
 *
 * @template T - The vector type extending TVector
 * @param a - Vector to limit
 * @param max - Maximum allowed magnitude
 * @returns Vector with magnitude limited to max
 * @throws {VectorError} If max is negative
 *
 * @example
 * const velocity = [15, 20, 0]; // magnitude ≈ 25
 * const limited = VectorLimit(velocity, 10); // magnitude = 10, same direction
 *
 * const small = [1, 1, 0]; // magnitude ≈ 1.414
 * const unchanged = VectorLimit(small, 5); // unchanged since already under limit
 */
export function VectorLimit<T extends TAnyVector>(a: T, max: number): TVectorResult<T> {
	if (max < 0) throw new VectorError('Maximum magnitude cannot be negative');
	const magnitude = VectorMagnitude(a);
	if (magnitude <= max || magnitude === 0) return VectorClone(a);
	const scaleFactor = max / magnitude;
	return VectorMultiply(a, scaleFactor);
}

/**
 * Validates if the input is a properly formatted vector.
 * Performs comprehensive validation without throwing errors.
 * Useful for input validation and defensive programming.
 *
 * @param vector - Input to validate
 * @returns True if input is a valid vector, false otherwise
 *
 * @example
 * const valid = VectorIsValid([1, 2, 3]); // true
 * const invalid = VectorIsValid("not a vector"); // false
 * const nullVector = VectorIsValid(null); // false
 * const emptyArray = VectorIsValid([]); // depends on implementation
 */
export function VectorIsValid(vector: unknown): boolean {
	try {
		AssertVector(vector);
		return true;
	} catch {
		return false;
	}
}

/**
 * Performs Gram-Schmidt orthogonalization on a set of vectors.
 * Converts a set of linearly independent vectors into an orthogonal (or orthonormal) set.
 * Essential for creating coordinate systems and orthogonal bases.
 *
 * @template T - The vector type extending TVector
 * @param vectors - Array of vectors to orthogonalize
 * @param normalize - Whether to normalize the resulting vectors (default: false)
 * @returns Array of orthogonal (or orthonormal) vectors
 * @throws {VectorError} If vectors are linearly dependent or invalid
 *
 * @example
 * const vectors = [[1, 1, 0], [1, 0, 1], [0, 1, 1]];
 * const orthogonal = VectorGramSchmidt(vectors); // Orthogonal set
 * const orthonormal = VectorGramSchmidt(vectors, true); // Orthonormal set
 */
export function VectorGramSchmidt<T extends TAnyVector>(vectors: T[], normalize: boolean = false): TVectorResult<T>[] {
	if (vectors.length === 0) throw new VectorError('GramSchmidt: Empty Vector Set');
	const [firstVector] = vectors;
	if (!firstVector) throw new VectorError('GramSchmidt: Undefined First Vector');
	const dimension = firstVector.length;
	for (const [i, vector] of vectors.entries()) {
		AssertVector(vector);
		if (vector.length !== dimension) throw new VectorError(`GramSchmidt: Vector at index ${i} has different dimension than first vector. Expected ${dimension}, got ${vector.length}`);
		if (VectorIsZero(vector)) throw new VectorError(`GramSchmidt: Vector at index ${i} is a zero vector. Cannot orthogonalize zero vectors.`);
	}

	const result: TVectorResult<T>[] = [];

	for (const [i, currentVector] of vectors.entries()) {
		AssertVector(currentVector);

		let orthogonalVector: TVectorResult<T> = VectorClone(currentVector) as TVectorResult<T>;

		for (let j = 0; j < i; j++) {
			const previousVector = result[j];
			AssertVector(previousVector);

			const projection = VectorProject(currentVector as unknown as T, previousVector as unknown as T);
			orthogonalVector = VectorSubtract(orthogonalVector as unknown as T, projection as unknown as T) as TVectorResult<T>;
		}
		if (VectorIsZero(orthogonalVector)) throw new VectorError(`GramSchmidt: Vector at index ${i} is linearly dependent on previous vectors. Cannot orthogonalize linearly dependent vectors.`);
		if (normalize) orthogonalVector = VectorNormalize(orthogonalVector as unknown as T) as TVectorResult<T>;
		result.push(orthogonalVector);
	}

	return result;
}
