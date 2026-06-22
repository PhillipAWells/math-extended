/**
 * Tolerance constants for numeric comparisons and floating-point operations.
 */

/**
 * General-purpose numeric tolerance for floating-point equality comparisons.
 * Use this as the default epsilon for most scalar robustness operations.
 *
 * @example
 * ```typescript
 * import { EPSILON, Approximately } from '@pawells/math-extended';
 *
 * Approximately(0.1 + 0.2, 0.3, EPSILON); // true
 * ```
 */
export const EPSILON = 1e-10;

/**
 * Loose tolerance for operations requiring larger epsilon (e.g., when accumulating floating-point errors).
 * Use when stricter comparison would be too sensitive to rounding errors.
 *
 * @example
 * ```typescript
 * import { EPSILON_LOOSE } from '@pawells/math-extended';
 *
 * // Useful for comparing results after multiple iterations
 * const threshold = EPSILON_LOOSE;
 * ```
 */
export const EPSILON_LOOSE = 1e-6;

/**
 * Tight tolerance based on JavaScript's machine epsilon.
 * Use only for operations where maximum precision is required.
 *
 * @remarks
 * Number.EPSILON ≈ 2.220446049250313e-16, the smallest representable difference between 1 and the next larger number in IEEE 754 double precision.
 * This is the absolute floor for distinguishing distinct floating-point values.
 *
 * @example
 * ```typescript
 * import { EPSILON_TIGHT } from '@pawells/math-extended';
 *
 * // For extremely precise comparisons (rarely needed)
 * const precision = EPSILON_TIGHT;
 * ```
 */
export const EPSILON_TIGHT = Number.EPSILON;

/**
 * Tolerance for default value-equality comparisons (e.g., MatrixEquals, QuaternionEquals).
 * Use this as the standard epsilon when comparing whether two computed values are "close enough".
 *
 * @example
 * ```typescript
 * import { EPSILON_COMPARISON, MatrixEquals } from '@pawells/math-extended';
 *
 * MatrixEquals(a, b, EPSILON_COMPARISON); // default tolerance for matrix equality
 * ```
 */
export const EPSILON_COMPARISON = 1e-8;

/**
 * Tolerance for orthogonality checks (e.g., MatrixIsOrthogonal).
 * Use when verifying that vectors or matrices maintain orthogonal properties.
 *
 * @example
 * ```typescript
 * import { EPSILON_ORTHOGONAL, MatrixIsOrthogonal } from '@pawells/math-extended';
 *
 * MatrixIsOrthogonal(matrix, EPSILON_ORTHOGONAL); // check orthogonality
 * ```
 */
export const EPSILON_ORTHOGONAL = 1e-9;

/**
 * Tolerance for structural matrix predicates (zero, identity, symmetric, diagonal).
 * Use for checking whether a matrix exhibits special structure within floating-point tolerance.
 *
 * @example
 * ```typescript
 * import { EPSILON_STRUCTURAL, MatrixIsIdentity } from '@pawells/math-extended';
 *
 * MatrixIsIdentity(matrix, EPSILON_STRUCTURAL); // strict identity check
 * ```
 */
export const EPSILON_STRUCTURAL = 1e-14;

/**
 * Numerical tolerance for matrix decompositions (LU, QR, SVD, Cholesky).
 * Use internally in decomposition algorithms to detect singular/near-singular values.
 *
 * @example
 * ```typescript
 * import { EPSILON_DECOMPOSITION } from '@pawells/math-extended';
 *
 * // Typically used internally by decomposition functions
 * const tolerance = EPSILON_DECOMPOSITION;
 * ```
 */
export const EPSILON_DECOMPOSITION = 1e-12;
