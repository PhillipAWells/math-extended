# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [3.1.0]

### Added

**Constants (`constants.ts`)**

- `EPSILON`, `EPSILON_LOOSE`, `EPSILON_TIGHT` — standard floating-point comparison tolerances exported from the package root.
- `EPSILON_COMPARISON` (`1e-8`) — default tolerance for value-equality comparisons (e.g., `MatrixEquals`, `QuaternionEquals`).
- `EPSILON_ORTHOGONAL` (`1e-9`) — tolerance for orthogonality checks (e.g., `MatrixIsOrthogonal`).
- `EPSILON_STRUCTURAL` (`1e-14`) — tolerance for structural matrix predicates (`MatrixIsZero`, `MatrixIsIdentity`, `MatrixIsSymmetric`, `MatrixIsDiagonal`).
- `EPSILON_DECOMPOSITION` (`1e-12`) — numerical tolerance for matrix decomposition algorithms (LU, QR, SVD, Cholesky).

**Scalar utilities (`scalar.ts`) + `ScalarError`**

- `ScalarError` — domain error class for scalar operations; extends `BaseError` with a `code` property.
- `InverseLerp(a, b, value)` — returns the unclamped `t` that produces `value` between `a` and `b`.
- `Remap(value, inMin, inMax, outMin, outMax)` — maps a value from one range to another.
- `MoveTowards(current, target, maxDelta)` — moves a scalar toward a target by at most `maxDelta`.
- `Mod(a, b)` — modulo that always returns a non-negative result (floored division remainder).
- `Repeat(value, length)` — wraps a value to `[0, length)`, analogous to a sawtooth wave.
- `PingPong(value, length)` — bounces a value back and forth between `0` and `length`.
- `Approximately(a, b, epsilon?)` — returns `true` when two scalars are within an epsilon of each other.
- `Clamp01(value)` — clamps a number to `[0, 1]`; shorthand for `Clamp(value, 0, 1)`.
- `Sign(value)` — returns `−1`, `0`, or `1` depending on the sign of the value.
- `RoundToNearest(value, step)` — rounds a value to the nearest multiple of `step`.
- `Gcd(a, b)` — greatest common divisor of two non-negative integers.
- `Lcm(a, b)` — least common multiple of two non-negative integers.
- `Factorial(n)` — factorial of a non-negative integer; throws `RangeError` for negative or non-integer inputs.
- `Linspace(start, stop, count)` — returns an evenly-spaced array of `count` values from `start` to `stop`.
- `Range(start, stop, step?)` — returns an array of values in `[start, stop)` incremented by `step`.

**Statistics (`statistics.ts`)**

- `Sum(values)` — sum of a numeric array.
- `Product(values)` — product of a numeric array.
- `Mean(values)` — arithmetic mean of a numeric array.
- `Variance(values, population?)` — population or sample variance (sample by default).
- `StandardDeviation(values, population?)` — population or sample standard deviation.
- `Median(values)` — median of a numeric array; handles both odd and even lengths.

**Angles (`angles.ts`)**

- `WrapAngle(radians)` — wraps an angle in radians to `(−π, π]`.
- `DeltaAngle(from, to)` — shortest signed difference between two angles in radians, in `(−π, π]`.

**Finiteness predicates**

- `VectorIsFinite(vector)` — returns `true` when every component of a vector is finite (no `NaN` or `Infinity`).
- `MatrixIsFinite(matrix)` — returns `true` when every element of a matrix is finite.
- `QuaternionIsFinite(quaternion)` — returns `true` when all four quaternion components are finite.

**Quaternions (`quaternions/`)**

- `QuaternionDot(a, b)` — dot product of two quaternions as 4-component vectors.
- `QuaternionAngleBetween(a, b)` — angle in radians between two unit quaternions.
- `QuaternionFromToRotation(from, to)` — shortest-arc rotation quaternion that rotates `from` to `to`.
- `QuaternionLookRotation(forward, up?)` — constructs a look-rotation quaternion from a forward direction and an optional up vector.
- `QuaternionRotateTowards(from, to, maxDelta)` — rotates `from` toward `to` by at most `maxDelta` radians.

**Matrices (`matrices/`)**

- `MatrixConditionNumber(matrix)` — ratio of largest to smallest singular value; measures numerical sensitivity.
- `MatrixIsInvertible(matrix, tolerance?)` — returns `true` when the matrix determinant exceeds the tolerance.
- `MatrixLeastSquares(A, b)` — solves the least-squares problem `Ax ≈ b` via the normal equations.
- `MatrixDecomposeTRS(matrix)` — extracts translation, rotation (Euler angles as `TVector3`), and scale from a `TMatrix4` TRS matrix.
- `MatrixIsOrthogonal(matrix, tolerance?)` — returns `true` when `A · Aᵀ ≈ I`.
- `MatrixIsPositiveDefinite(matrix)` — returns `true` when all eigenvalues are positive (Cholesky-based check).
- `MatrixPower(matrix, exponent)` — raises a square matrix to an integer power via repeated multiplication.
- `MatrixKronecker(A, B)` — Kronecker (tensor) product of two matrices.
- `MatrixShear2D(shearX, shearY)` — 3×3 2-D shear transformation matrix.
- `MatrixShear3D(shearXY, shearXZ, shearYX, shearYZ, shearZX, shearZY)` — 4×4 3-D shear transformation matrix.
- `MatrixReflection2D(angle)` — 3×3 2-D reflection matrix across a line through the origin at `angle` radians from the X-axis.

**Vectors (`vectors/`)**

- `VectorMidpoint(a, b)` — returns the midpoint between two same-size vectors; generic `<T extends TAnyVector>`.
- `VectorMoveTowards(current, target, maxDelta)` — moves a vector toward a target by at most `maxDelta` in magnitude.
- `Vector2AngleSigned(from, to)` — signed angle in radians from one `TVector2` to another, in `(−π, π]`.
- `Vector3AngleSigned(from, to, axis)` — signed angle in radians from one `TVector3` to another around a reference axis.
- `VectorIsNormalized(vector, tolerance?)` — returns `true` when the vector magnitude is within tolerance of `1`.
- `Vector3ProjectOnPlane(vector, planeNormal)` — projects a `TVector3` onto the plane defined by its normal.
- `Vector3RotateAround(vector, pivot, axis, angle)` — rotates a `TVector3` around a pivot point by an angle in radians.
- `VectorManhattanDistance(a, b)` — sum of absolute component differences between two same-size vectors.
- `VectorChebyshevDistance(a, b)` — maximum absolute component difference between two same-size vectors.

**Misc**

- Public type `TSVDDecompositionResult` exported from the package root (return type of `MatrixSVD`).
- `MatrixTranslation2D` now accepts a single `TVector2` argument in addition to two separate numbers, matching the existing overload on `MatrixTranslation3D`.
- Dedicated tests for internal validation guards, matrix decomposition edge cases and round-trips, all four Shepperd branches in quaternion-to-matrix conversion, and seeded-PRNG random helpers; branch coverage raised to approximately 85%.
- `VectorScale(vector, scalar)` — scalar multiplication for any vector type, generic `<T extends TAnyVector>` returning `TVectorResult<T>`.
- `VectorFloor(vector)` — component-wise `Math.floor`, generic `<T extends TAnyVector>` returning `TVectorResult<T>`.
- `VectorCeil(vector)` — component-wise `Math.ceil`, generic `<T extends TAnyVector>` returning `TVectorResult<T>`.
- `VectorRound(vector)` — component-wise `Math.round`, generic `<T extends TAnyVector>` returning `TVectorResult<T>`.
- `VectorMin(a, b)` — component-wise minimum of two same-size vectors, generic `<T extends TAnyVector>` returning `TVectorResult<T>`; throws `VectorError` if sizes differ.
- `VectorMax(a, b)` — component-wise maximum of two same-size vectors, generic `<T extends TAnyVector>` returning `TVectorResult<T>`; throws `VectorError` if sizes differ.
- `MatrixLookAt(eye, target, up)` — alias of `MatrixView`; returns `TMatrix4`. Added for API consistency with graphics libraries that use the look-at name.
- `MatrixTRS(translation, rotation, scale)` — composite `TMatrix4` from translation, Euler-radians rotation, and scale (`TVector3` each); applies scale first, then rotation, then translation.
- `MatrixNormalize(matrix)` — scales a matrix to unit Frobenius norm; generic `<T extends TMatrix>` returning `TMatrixResult<T>`; throws `MatrixError` on a zero matrix.
- `MatrixNullSpace(matrix, tolerance?)` — orthonormal basis for the null space as columns; returns an empty matrix when the input has full column rank.
- `MatrixPseudoInverse(matrix, tolerance?)` — Moore-Penrose pseudoinverse via SVD; returns an `n×m` matrix for any `m×n` input.

### Changed

- `LinearInterpolation` now clamps `t` to `[0, 1]` by default and validates all three inputs, throwing `RangeError` on non-finite values. Pass `{ clamped: false }` to allow extrapolation beyond the `[a, b]` range. `VectorLERP` gains the same `options.clamped` parameter (default clamped). The standalone `Lerp` and `LerpUnclamped` helpers added earlier in this cycle were consolidated into `LinearInterpolation` before this version shipped.
- `SphericalLinearInterpolation`, `CatmullRomInterpolation`, and `HermiteInterpolation` (vectors) and the angle helper functions now reject non-finite inputs by throwing instead of silently producing `NaN` or `Infinity` results.
- `QUATERNION_SCHEMA` reworked so its inferred TypeScript type aligns exactly with `TQuaternion`; `NaN` components are now rejected at runtime, while `Infinity` is intentionally permitted and documented.
- Validation guards across all domains reimplemented to avoid calling Zod `.parse()` on the hot path; observable behavior and error messages are unchanged, and schemas remain exported for type inference. This is a net performance improvement for code that validates frequently.
- Shared `makeValidate` factory introduced and used consistently across the vectors, matrices, and quaternions domains, replacing per-domain duplicates.

### Fixed

- Broke a circular import in the matrices validation module that could leave module-level exports `undefined` at runtime under ESM static initialisation order.
- `MatrixInverse`, `matrixMultiplyVector`, and `MatrixTransform2D` now throw `MatrixError` instead of the base `Error`, making them consistent with the rest of the matrices domain.
- `MatrixDeterminant` no longer silently swallows errors from non-singular matrices; unexpected errors now propagate.
- `ValidateMatrixSquare` type signature corrected to narrow to `TMatrixSquare` rather than the wider base type.
- Numerous JSDoc formatting fixes: doubled code fences removed, indentation corrected, missing `@throws` and `@example` tags filled in.
- Documentation: `Matrix_PseudoInverse` corrected to `MatrixPseudoInverse` (no underscore) in AGENTS.md.
- Documentation: `VectorLinearInterpolation` corrected to `VectorLERP` (real export name) in AGENTS.md.
- Documentation: phantom `MatrixIsSquare`, `MatrixRotationX/Y/Z`, `VectorCross` (bare), and `IMatrixOperationOptions` removed from API documentation — none of these exist in source.
- Documentation: `Validate*` guard descriptions corrected from "return a result object" to accurately describe the boolean type-guard return (`value is T`).

### Removed

- `MatrixEigenQRIteration` is no longer exported from the package. It was previously exported by mistake despite being marked `@private`. It is now module-internal. Callers should use `MatrixEigen` instead. **This is a breaking change for any consumer that imported `MatrixEigenQRIteration` directly.**

## [3.0.1]

Initial published baseline of `@pawells/math-extended` including:

- Vectors: `TVector`, `TVector2`–`TVector4`; arithmetic, dot/cross product, normalize, lerp, predefined constants.
- Matrices: `TMatrix1`–`TMatrix4`; arithmetic, determinant, inverse, rank; LU, QR, Cholesky, Eigen, and SVD decompositions; TRS, perspective, orthographic, and view-matrix transformations.
- Quaternions: `TQuaternion` (`[x, y, z, w]`); Hamilton product, conjugate/inverse, Euler/axis-angle/matrix conversions, SLERP, NLERP, and SQUAD.
- Interpolation: scalar easing families (`interpolation.ts`).
- Angle helpers: radian/degree conversions (`angles.ts`).

[Unreleased]: https://github.com/PhillipAWells/math-extended/compare/v3.1.0...HEAD
[3.1.0]: https://github.com/PhillipAWells/math-extended/compare/v3.0.1...v3.1.0
[3.0.1]: https://github.com/PhillipAWells/math-extended/releases/tag/v3.0.1
