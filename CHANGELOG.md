# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-05-01

### Added

- `solver` module with 21 physics equation-solving functions across three domains.
  - Kinematics: 7 SUVAT solvers (`solveVelocity`, `solveInitialVelocity`, `solveAcceleration`,
    `solveTime`, `solveDisplacement`, `solveVelocityFromDistance`, `solveAccelerationFromDistance`).
  - Dynamics: 6 force and momentum solvers (`solveForce`, `solveMass`, `solveAccelerationFromForce`,
    `solveMomentum`, `solveVelocityFromMomentum`, `solveImpulse`).
  - Energy and power: 8 solvers (`solveKineticEnergy`, `solveMassFromKE`, `solveVelocityFromKE`,
    `solveWork`, `solveForceFromWork`, `solveDistanceFromWork`, `solvePower`, `solvePowerFromWork`).
  - Geometry: 2D shape and 3D solid solvers.
  - All solvers return `ISolverQuantity<TUnit, TValue>` carrying both value and unit for chaining.
- `units` module with typed enums and conversion functions for 12 physical quantity domains:
  acceleration, angle, area, energy, force, length, mass, momentum, power, pressure, temperature,
  time, velocity, and volume.
- `AreaUnit` enum and `AreaConvert` function for area unit conversions.
- `VolumeUnit` enum and `VolumeConvert` function for volume unit conversions.
- `MomentumUnit` compound type (`[MassUnit, TVelocityUnit]`) and `MomentumConvert` function.
- Vector overloads for `VelocityConvert`, `AccelerationConvert`, and `ForceConvert`, enabling
  component-wise conversion of `TVector2`, `TVector3`, and `TVector4` inputs.
- `ISolverQuantity` interface exported from the public entry point.
- Namespace exports (`VectorUtils`, `MatrixUtils`, `QuaternionUtils`, `UnitsUtils`, `SolverUtils`)
  alongside direct named exports for tree-shaking.

### Changed

- **BREAKING:** Velocity units replaced enum-based `VelocityUnit` with a tuple-based compound type
  `TVelocityUnit` (`[LengthUnit, TimeUnit]`). Any switch statement or equality check against the
  former `VelocityUnit` enum members must be rewritten to use tuple comparisons.
- **BREAKING:** `@pawells/typescript-common` runtime dependency upgraded to v2.0.0. The v1.x
  assertion helpers are no longer compatible; update that peer dependency alongside this package.
- `angles` module replaced by the `units` module. Angle utilities are now exported from `units`.
- All bare `Error` throws replaced with domain-specific error classes throughout the library.
- Namespace exports consolidated into submodule index files.
- Type-only imports converted to `import type` throughout the source.
- CI workflow updated: branch triggers corrected; `HUSKY=0` set in all CI jobs.
- Dependency updates: ESLint group (4 packages), TypeScript group (2 packages),
  `@pawells/typescript-common` (1.3.1 → 1.4.1), `softprops/action-gh-release` (v2 → v3),
  Vitest group (3 packages).

### Fixed

- `VectorLimit` implementation restored after accidental removal.
- Missing type parameters added to exports.
- `AngleNormalize` unit normalization corrected.
- `QuaternionError` message parameter made optional; unused parameter removed from constructor.
- JSDoc examples updated to remove stale type names throughout the codebase.
- Constants extracted and duplicate definitions removed.
- ESLint warnings (4) resolved to clean lint output.

## [1.1.1] - 2026-03-12

### Changed

- Legacy `.eslintignore` file removed; ignore patterns consolidated into `eslint.config.mjs`.

### Fixed

- `RandomInt` / `RandomFloat`: replaced `do-while` loop with `while` loop to satisfy ESLint rules.

## [1.1.0] - 2026-03-12

### Added

- CLAUDE.md referencing AGENTS.md as the primary agent context document.
- Anthropic Claude Code extension added to devcontainer configuration.
- Node.js 24 added to the CI test matrix alongside Node.js 22.
- `COREPACK_*` environment variables added to devcontainer for consistent package manager setup.

### Changed

- `@pawells/typescript-common` upgraded to v1.3.1.
- `MatrixSVD` index sort now uses `ArraySortBy` from the common library.
- Minimum required Node.js version lowered to 22.x LTS.
- JSDoc improved across angles, interpolation, and matrix modules.
- AGENTS.md and README.md updated to reflect recent bug fixes.

### Fixed

- `MatrixInverse`: reimplemented with O(n³) complexity using LU decomposition; LU partial pivoting
  corrected.
- `MatrixSVD`: cleanup and correctness fixes.
- `VectorProject`: uses `VectorDot` instead of a sqrt-then-square round trip; `Math.pow(x, 2)`
  replaced with `x * x`; unreachable `else` branch removed from `VectorToString`.
- `FormatRadians`: now covers all rational fractions; `NormalizeDegrees` received epsilon cleanup.
- `QuaternionToAxisAngle`: sign handling corrected; redundant `Math.abs` removed from SLERP.
- `RandomNormal`: guarded against `Infinity`; `RandomBool` now throws on invalid probability;
  `RandomSample` uses Fisher-Yates shuffle.

## [1.0.5] - 2026-02-25

### Added

- Derivation comments for smootherstep coefficients.
- Edge case documentation for `RandomInt` / `RandomFloat` asymmetry.
- Husky `commit-msg` hook that rejects `Co-Authored-By` trailers.

### Changed

- GitHub Actions versions updated from `@v4` to `@v6`.
- CI workflow separated into discrete `ci.yml` and publish workflow files; trigger conditions
  standardized.

### Fixed

- Concurrency group collision prevented when `ci.yml` is called as a reusable workflow.
- Parameter spacing corrected in vector core functions.
- `NormalizeRadians`: epsilon boundary cleanup applied.

## [1.0.4] - 2026-02-23

### Added

- `exports` field in `package.json` with ESM-only entry point.
- `tsconfig.test.json` for Vitest type checking.
- Coverage thresholds raised to 80% on all four Vitest metrics.

### Changed

- TypeScript configuration split into four files: `tsconfig.json`, `tsconfig.build.json`,
  `tsconfig.test.json`, `tsconfig.eslint.json`.
- AGENTS.md updated to document the 4-config tsconfig split and 80% coverage threshold.

### Fixed

- Type check errors in spec files resolved.
- `QuaternionError` message parameter made optional.
- `allowImportingTsExtensions` and `vitest/globals` types enabled in tsconfig.

## [1.0.3] - 2026-02-23

### Added

- Namespace re-exports for module grouping (`VectorUtils`, `MatrixUtils`, `QuaternionUtils`).
- Namespace import documentation in AGENTS.md.

### Changed

- Build and package configuration updated.
- `.gitignore` and `.npmignore` reorganized for Yarn and publish scope.
- Devcontainer configuration updated.
- GitHub Actions workflow updated for lint and test execution.

### Fixed

- Compiler options cleaned up and reorganized in `tsconfig.json`.

## [1.0.2] - 2026-02-21

### Changed

- Version bump to 1.0.2.

## [1.0.1] - 2026-02-21

### Added

- Initial library entry point (`src/index.ts`) re-exporting all modules.
- `vectors` module: N-dimensional vector math.
- `matrices` module: matrix arithmetic, decompositions, and transform utilities.
- `quaternions` module: quaternion math for 3D rotations.
- `random` module: random numbers, choices, sampling, and shuffling.
- `interpolation` module: scalar interpolation and 30+ easing functions.
- `clamp` module: numeric clamping utilities.
- `angles` module: degree/radian conversion and normalization.
- README.md and AGENTS.md documentation.
- Devcontainer, CI/CD workflow (`.github/workflows/ci.yml`), and Husky git hooks.
- Initial project configuration (TypeScript, ESLint, Vitest, Yarn Berry 4).

[Unreleased]: https://github.com/PhillipAWells/math-extended/compare/v4.0.0...HEAD
[4.0.0]: https://github.com/PhillipAWells/math-extended/compare/v3.0.0...v4.0.0
[3.0.0]: https://github.com/PhillipAWells/math-extended/compare/v2.0.0...v3.0.0
[2.1.0]: https://github.com/PhillipAWells/math-extended/compare/v2.0.0...development/2.1
[2.0.0]: https://github.com/PhillipAWells/math-extended/compare/v1.1.1...v2.0.0
[1.1.1]: https://github.com/PhillipAWells/math-extended/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/PhillipAWells/math-extended/compare/v1.0.5...v1.1.0
[1.0.5]: https://github.com/PhillipAWells/math-extended/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/PhillipAWells/math-extended/compare/v1.0.3...v1.0.4
[1.0.3]: https://github.com/PhillipAWells/math-extended/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/PhillipAWells/math-extended/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/PhillipAWells/math-extended/releases/tag/v1.0.1
