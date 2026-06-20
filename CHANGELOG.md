# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Public type `TSVDDecompositionResult` exported from the package root (return type of `MatrixSVD`).
- `MatrixTranslation2D` now accepts a single `TVector2` argument in addition to two separate numbers, matching the existing overload on `MatrixTranslation3D`.
- Dedicated tests for internal validation guards, matrix decomposition edge cases and round-trips, all four Shepperd branches in quaternion-to-matrix conversion, and seeded-PRNG random helpers; branch coverage raised to approximately 85%.

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
- Removed all prohibited type-assertion casts (`as Type`) throughout the source.
- Numerous JSDoc formatting fixes: doubled code fences removed, indentation corrected, missing `@throws` and `@example` tags filled in.

### Removed

- `MatrixEigenQRIteration` is no longer exported from the package. It was previously exported by mistake despite being marked `@private`. It is now module-internal. Callers should use `MatrixEigen` instead. **This is a breaking change for any consumer that imported `MatrixEigenQRIteration` directly.**

## [3.0.1] — Initial published baseline

> No release tag exists in this repository for 3.0.1. This entry documents the state of the package at the version declared in `packages/math-extended/package.json`. No date is recorded because none can be verified from the repository history.

Initial implementation of `@pawells/math-extended` including:

- Vectors: `TVector`, `TVector2`–`TVector4`; arithmetic, dot/cross product, normalize, lerp, predefined constants.
- Matrices: `TMatrix1`–`TMatrix4`; arithmetic, determinant, inverse, rank; LU, QR, Cholesky, Eigen, and SVD decompositions; TRS, perspective, orthographic, and view-matrix transformations.
- Quaternions: `TQuaternion` (`[x, y, z, w]`); Hamilton product, conjugate/inverse, Euler/axis-angle/matrix conversions, SLERP, NLERP, and SQUAD.
- Interpolation: scalar easing families (`interpolation.ts`).
- Angle helpers: radian/degree conversions (`angles.ts`).

[Unreleased]: https://github.com/PhillipAWells/math-extended/compare/v3.0.1...HEAD
[3.0.1]: https://github.com/PhillipAWells/math-extended/releases/tag/v3.0.1
