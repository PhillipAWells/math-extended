# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

[Unreleased]: https://github.com/PhillipAWells/math-extended/compare/v3.0.1...HEAD
[3.0.1]: https://github.com/PhillipAWells/math-extended/releases/tag/v3.0.1
