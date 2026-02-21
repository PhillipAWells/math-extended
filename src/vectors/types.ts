/**
 * Vector type definitions for mathematical operations and geometric calculations.
 * These types provide a flexible foundation for vector operations while maintaining type safety.
 */

/**
 * Generic vector type representing an array of numbers with arbitrary dimensions.
 * Useful for mathematical operations on vectors of any size.
 *
 * @example
 * const vector: TVector = [1, 2, 3, 4, 5]; // 5D vector
 */
export type TVector = number[];

/**
 * 2D vector type supporting both tuple and array representations.
 * Commonly used for 2D graphics, physics simulations, and coordinate systems.
 *
 * @example
 * const position: TVector2 = [10, 20];     // Tuple representation (preferred)
 * const velocity: TVector2 = [5.5, -3.2]; // Array representation
 */
export type TVector2 = [number, number];

/**
 * 3D vector type supporting both tuple and array representations.
 * Essential for 3D graphics, spatial calculations, and physics simulations.
 *
 * @example
 * const position: TVector3 = [10, 20, 30];      // 3D position
 * const direction: TVector3 = [0, 1, 0];       // Unit vector (up)
 * const velocity: TVector3 = [2.5, -1.8, 3.2]; // 3D velocity
 */
export type TVector3 = [number, number, number];

/**
 * 4D vector type supporting both tuple and array representations.
 * Used for homogeneous coordinates in 3D transformations and projections.
 *
 * @example
 * const homogeneous: TVector4 = [10, 20, 30, 1]; // 3D point in homogeneous coordinates
 * const direction: TVector4 = [0, 1, 0, 0];     // 3D direction vector
 */
export type TVector4 = [number, number, number, number];

/**
 * Union type representing any vector type.
 * Useful for functions that can accept vectors of any dimension.
 *
 * @example
 * function processVector(vector: TAnyVector): void {
 *   // Can handle any vector dimension
 * }
 */
export type TAnyVector = TVector | TVector2 | TVector3 | TVector4;

/**
 * Conditional type that preserves the specific vector type through operations.
 * Ensures type safety by returning the same specific vector type as the input.
 *
 * @template T - The input vector type extending TAnyVector
 * @example
 * function operation<T extends TAnyVector>(vector: T): TVectorResult<T> {
 *   // Returns same specific type as input
 * }
 */
export type TVectorResult<T extends TAnyVector> = T extends TVector2 ? TVector2 : T extends TVector3 ? TVector3 : T extends TVector4 ? TVector4 : TVector;
