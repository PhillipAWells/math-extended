# Math Extended Workspace

[![CI](https://github.com/PhillipAWells/math-extended/actions/workflows/ci.yml/badge.svg)](https://github.com/PhillipAWells/math-extended/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

## Description

Extended mathematical utilities for TypeScript: vectors, matrices, quaternions, interpolation & easing, angle conversions, clamping, and seedable random helpers. ESM-only, fully typed, runtime-validated with Zod, and tree-shakeable — every operation is an individual named export.

Published as [`@pawells/math-extended`](https://www.npmjs.com/package/@pawells/math-extended) (v3.1.0, MIT). This repository is an NX monorepo; the single published package lives in [`packages/math-extended`](./packages/math-extended/).

## Requirements

- **Node.js** >= 22.0.0
- **ESM only** — the package ships `"type": "module"`; `require()` is not supported
- **Development** — Yarn Berry 4.16.0 via corepack (contributors only; consumers use any package manager)

## Installation

```bash
yarn add @pawells/math-extended
# or
npm install @pawells/math-extended
```

## Quick Start

Import named exports directly from the package root. Deep imports are not supported.

```ts
import {
  VectorAdd,
  VectorNormalize,
  Clamp,
  LinearInterpolation,
  DegreesToRadians,
  QuaternionFromEuler,
} from '@pawells/math-extended';

const sum  = VectorAdd([1, 2, 3], [4, 5, 6]);              // [5, 7, 9]
const unit = VectorNormalize([3, 4]);                       // [0.6, 0.8]
const t    = Clamp(1.5, 0, 1);                             // 1
const mid  = LinearInterpolation(0, 10, 0.5);              // 5
const rad  = DegreesToRadians(90);                         // ~1.5708
const q    = QuaternionFromEuler([0, 0, DegreesToRadians(90)]);
```

Every export is individually tree-shakeable; bundle only what you use.

## API Reference

The library is organized into seven domains:

| Domain | Summary |
|---|---|
| **Angles** | Convert, normalize, and format degree/radian values (`DegreesToRadians`, `RadiansToDegrees`, `NormalizeRadians`, `NormalizeDegrees`, `FormatRadians`, `WrapAngle`, `DeltaAngle`) |
| **Clamp** | Constrain a number to a range (`Clamp`) |
| **Constants** | Tolerance constants for robust numeric comparisons (`EPSILON`, `EPSILON_LOOSE`, `EPSILON_TIGHT`, `EPSILON_COMPARISON`, `EPSILON_ORTHOGONAL`, `EPSILON_STRUCTURAL`, `EPSILON_DECOMPOSITION`) |
| **Core** | Foundational math helpers (`CubeRoot`) |
| **Scalar** | Extended numeric operations with `ScalarError` (`InverseLerp`, `Remap`, `MoveTowards`, `Mod`, `Repeat`, `PingPong`, `Approximately`, `Clamp01`, `Sign`, `RoundToNearest`, `Gcd`, `Lcm`, `Factorial`, `Linspace`, `Range`) |
| **Statistics** | Descriptive statistics over number arrays with `ScalarError` (`Sum`, `Product`, `Mean`, `Variance`, `StandardDeviation`, `Median`) |
| **Random** | Seedable PRNG (`SetPRNG`/`GetPRNG`) plus `RandomInt`, `RandomFloat`, `RandomBool`, `RandomNormal`, `RandomChoice`, `RandomSample`, `RandomShuffle` |
| **Interpolation** | LERP, `SmoothStep`/`SmootherStep`, full easing families (Quadratic/Cubic/Sine/Exponential/Circular/Elastic/Back/Bounce × In/Out/InOut), `CatmullRomInterpolation`, `HermiteInterpolation`, `CosineInterpolation`, `StepInterpolation` |
| **Vectors** | `TVector`/`TVector2`–`TVector4`; arithmetic, dot/cross products, normalize, distance, reflect/project, predefined constants (`VectorZero`, `Vector3Forward`, …), per-component easing wrappers, and `Assert*`/`Validate*` guards with `VectorError` |
| **Matrices** | `TMatrix1`–`TMatrix4`; arithmetic, determinant/inverse/rank, decompositions (LU/QR/Cholesky/Eigen/SVD), solve, norms (Frobenius/spectral/1/∞/nuclear/max/p), 2D & 3D transformation factories (translation, scale, rotation, view, perspective, orthographic), and `Assert*`/`Validate*` guards with `MatrixError` |
| **Quaternions** | `TQuaternion` `[x,y,z,w]`; Hamilton multiply, conjugate/inverse, conversions (Euler/axis-angle/rotation-matrix), SLERP/NLERP/SQUAD, predefined rotations, and `Assert*`/`Validate*` guards with `QuaternionError` |

All types pair with exported Zod schemas (e.g. `VECTOR_SCHEMA`). Custom error classes (`VectorError`, `MatrixError`, `QuaternionError`) carry a `code` property and chain `cause` for full error context.

See [the package README](./packages/math-extended/README.md) for the complete API reference with signatures and examples.

## Development

Root scripts are dispatched through NX and run against the `@pawells/math-extended` package:

```bash
yarn build           # Compile TypeScript → packages/math-extended/dist/
yarn typecheck       # Type-check without emitting
yarn lint            # ESLint
yarn lint:fix        # ESLint with auto-fix
yarn test            # Run tests
yarn test:coverage   # Run tests with coverage report (80% threshold)
yarn clean           # Remove build artifacts
```

CI runs: `typecheck` → `lint` → `test:coverage` → `build`.

## License

MIT © Phillip Aaron Wells. See [LICENSE](./LICENSE).
