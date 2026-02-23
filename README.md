# Math Extended

[![npm](https://img.shields.io/npm/v/@pawells/math-extended)](https://www.npmjs.com/package/@pawells/math-extended)
[![GitHub Release](https://img.shields.io/github/v/release/PhillipAWells/math-extended)](https://github.com/PhillipAWells/math-extended/releases)
[![CI](https://github.com/PhillipAWells/math-extended/actions/workflows/ci.yml/badge.svg)](https://github.com/PhillipAWells/math-extended/actions/workflows/ci.yml)
[![Node](https://img.shields.io/badge/node-%3E%3D24-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![GitHub Sponsors](https://img.shields.io/github/sponsors/PhillipAWells?style=social)](https://github.com/sponsors/PhillipAWells)

Shared TypeScript math library — vectors, matrices, quaternions, interpolation, angles, and random utilities. ESM-only, targets ES2022.

## Installation

```bash
npm install @pawells/math-extended
# or
yarn add @pawells/math-extended
```

## Usage

All exports are available as individual named imports for tree-shaking, or grouped via namespace imports for convenience.

### Direct Named Imports (Tree-Shaking Friendly)

```typescript
import {
  VectorAdd, VectorNormalize, VectorDot,
  MatrixMultiply, MatrixRotation3D,
  QuaternionSLERP, QuaternionFromEuler,
  LinearInterpolation, SmoothStep,
  DegreesToRadians, RandomFloat,
} from '@pawells/math-extended';

// Vector math
const a = VectorAdd([1, 0, 0], [0, 1, 0]); // [1, 1, 0]
const n = VectorNormalize([3, 4, 0]);        // [0.6, 0.8, 0]

// Interpolation
const v = SmoothStep(0, 10, 0.5); // 5

// Angles
const rad = DegreesToRadians(180); // Math.PI
```

### Namespace Imports (Grouped)

Import related utilities together using namespace imports:

```typescript
import { VectorUtils, MatrixUtils, QuaternionUtils } from '@pawells/math-extended';

// Access utilities via namespace
VectorUtils.VectorAdd([1, 0, 0], [0, 1, 0]);
MatrixUtils.MatrixMultiply(matA, matB);
QuaternionUtils.QuaternionSLERP(q1, q2, 0.5);
```

### Import Patterns

| Pattern | Best For | Example |
|---------|----------|---------|
| **Direct named** | Tree-shaking, small imports | `import { VectorAdd } from '@pawells/math-extended'` |
| **Namespace** | Grouping related functions | `import { VectorUtils } from '@pawells/math-extended'` |
| **Mixed** | Flexibility | Both patterns together |

## API

### Angles

| Export | Description |
|--------|-------------|
| `DegreesToRadians(degrees)` | Convert degrees to radians |
| `RadiansToDegrees(radians)` | Convert radians to degrees |
| `NormalizeRadians(radians)` | Normalize to `[0, 2π)` |
| `NormalizeDegrees(degrees)` | Normalize to `[0°, 360°)` |
| `FormatRadians(radians)` | Format radians as a human-readable string |

### Clamp

| Export | Description |
|--------|-------------|
| `Clamp(x, min, max)` | Clamp a number between min and max |

### Random

| Export | Description |
|--------|-------------|
| `RandomInt(min, max)` | Random integer in `[min, max]` |
| `RandomFloat(min, max)` | Random float in `[min, max)` |
| `RandomBool(probability?)` | Random boolean with optional probability |
| `RandomNormal(mean?, stdDev?)` | Normal-distributed random number |
| `RandomChoice(array)` | Random element from an array |
| `RandomSample(array, count)` | `count` unique random elements |
| `RandomShuffle(array, clone?)` | Shuffle an array (in-place or cloned) |

### Interpolation

All interpolation functions share the signature `(a, b, t)`. `t` is typically in `[0, 1]`, but some functions (e.g. elastic, back, bounce, splines) may accept or produce values outside that range.

| Export | Description |
|--------|-------------|
| `LinearInterpolation` | Linear interpolation (LERP) |
| `SmoothStep` | Cubic smooth-step |
| `SmootherStep` | Quintic smoother-step |
| `CosineInterpolation` | Cosine interpolation |
| `CatmullRomInterpolation` | Catmull-Rom spline `(p0, p1, p2, p3, t)` |
| `HermiteInterpolation` | Hermite spline `(p0, p1, t0, t1, t)` |
| `SphericalLinearInterpolation` | Shortest-arc scalar SLERP |
| `StepInterpolation` | Step function with configurable threshold |
| `QuadraticEaseIn/Out/InOut` | Quadratic easing |
| `CubicEaseIn/Out/InOut` | Cubic easing |
| `SineEaseIn/Out/InOut` | Sine easing |
| `ExponentialEaseIn/Out/InOut` | Exponential easing |
| `CircularEaseIn/Out/InOut` | Circular easing |
| `ElasticEaseIn/Out/InOut` | Elastic easing |
| `BackEaseIn/Out/InOut` | Back (overshoot) easing |
| `BounceEaseIn/Out/InOut` | Bounce easing |

### Vectors

Vectors are plain number arrays (`TVector`, `TVector2`, `TVector3`, `TVector4`). All operations return new vectors.

#### Core operations

| Export | Description |
|--------|-------------|
| `VectorAdd(a, b)` | Component-wise addition |
| `VectorSubtract(a, b)` | Component-wise subtraction |
| `VectorMultiply(a, b)` | Scalar or component-wise multiplication |
| `VectorDivide(a, b)` | Scalar or component-wise division |
| `VectorNegate(a)` | Negate all components |
| `VectorAbs(a)` | Absolute value of each component |
| `VectorDot(a, b)` | Dot product |
| `VectorMagnitude(a)` | Vector length |
| `VectorNormalize(a)` | Unit vector |
| `VectorDistance(a, b)` | Euclidean distance |
| `VectorDistanceSquared(a, b)` | Squared distance (avoids sqrt) |
| `VectorAngle(a, b)` | Angle between two vectors (radians) |
| `VectorReflect(a, normal)` | Reflection about a normal |
| `VectorProject(a, b)` | Projection of `a` onto `b` |
| `VectorClamp(a, min, max)` | Clamp each component |
| `VectorLimit(a, max)` | Limit magnitude |
| `VectorLERP(a, b, t)` | Linear interpolation |
| `VectorClone(a)` | Deep copy |
| `VectorEquals(a, b)` | Equality check |
| `VectorIsZero(a)` | Check if zero vector |
| `VectorIsValid(v)` | Type-guard validation |
| `VectorToString(a)` | Human-readable string |
| `VectorMap(a, fn)` | Map a function over components |
| `VectorGramSchmidt(vectors, normalize?)` | Gram-Schmidt orthogonalization |

#### 2D / 3D extras

| Export | Description |
|--------|-------------|
| `Vector2Cross(a, b)` | 2D cross product (scalar) |
| `Vector2Rotate(v, angle)` | Rotate a 2D vector |
| `Vector2FromAngle(angle)` | Unit vector from angle |
| `Vector3Cross(a, b)` | 3D cross product |
| `Vector3Reflect(a, normal)` | 3D reflection |
| `Vector3TripleProduct(a, b, c)` | Vector triple product |
| `Vector3ScalarTripleProduct(a, b, c)` | Scalar triple product |

#### Predefined vectors

`VectorZero`, `VectorOne`, `Vector2Up/Down/Left/Right`, `Vector3Up/Down/Left/Right/Forward/Backward`, `Vector4Up/Down/Left/Right/Forward/Backward`

#### Interpolation wrappers

Every scalar easing function has a `Vector*` counterpart (e.g., `VectorSmoothStep`, `VectorCubicEaseIn`, `VectorSLERP`, …) that interpolates component-wise.

#### Assertions

`AssertVector`, `AssertVector2`, `AssertVector3`, `AssertVector4`, `AssertVectorValue`, `AssertVectors`, `VectorError`

### Matrices

Matrices are `number[][]` arrays (`IMatrix`, `IMatrix1`–`IMatrix4`). All operations return new matrices.

#### Core

| Export | Description |
|--------|-------------|
| `MatrixCreate(rows, cols)` | Zero-filled matrix (typed overloads for 1×1–4×4) |
| `MatrixIdentity(n)` | Identity matrix |
| `MatrixClone(m)` | Deep copy |
| `MatrixEquals(a, b)` | Equality check |
| `MatrixIsValid(m)` | Validation without throwing |
| `MatrixIsSquare(m)` | Square check |
| `MatrixIsIdentity(m)` | Identity check |
| `MatrixIsSymmetric(m)` | Symmetry check |
| `MatrixIsDiagonal(m)` | Diagonal check |
| `MatrixIsZero(m)` | Zero-matrix check |
| `MatrixSize(m)` | `[rows, cols]` tuple |
| `MatrixSizeSquare(m)` | `n` for an `n×n` matrix |
| `MatrixTranspose(m)` | Transpose |
| `MatrixTrace(m)` | Sum of diagonal elements |
| `MatrixToString(m)` | Human-readable string |
| `MatrixMap(m, fn)` | Map a function over every element |

#### Arithmetic

| Export | Description |
|--------|-------------|
| `MatrixAdd(a, b)` | Element-wise addition |
| `MatrixSubtract(a, b)` | Element-wise subtraction |
| `MatrixMultiply(a, b)` | Matrix × matrix / vector / scalar (auto-dispatch) |
| `MatrixSubmatrix(m, col, row, w, h)` | Extract a rectangular region |
| `MatrixPad(m, rows, cols)` | Zero-pad to target dimensions |
| `MatrixCombine(c11, c12, c21, c22)` | Assemble four quadrant blocks |

#### Linear algebra

| Export | Description |
|--------|-------------|
| `MatrixDeterminant(m)` | Determinant |
| `MatrixInverse(m)` | Matrix inverse |
| `MatrixRank(m)` | Rank |
| `MatrixMinor(m, row, col)` | Minor |
| `MatrixCofactor(m, row, col)` | Cofactor |
| `MatrixAdjoint(m)` | Adjugate (classical adjoint) |
| `MatrixGramSchmidt(m)` | Gram-Schmidt orthogonalization |

#### Decompositions

| Export | Description |
|--------|-------------|
| `MatrixLU(m)` | LU decomposition `{ L, U }` |
| `MatrixQR(m)` | QR decomposition `{ Q, R }` |
| `MatrixCholesky(m)` | Cholesky decomposition `L` |
| `MatrixEigen(m)` | Eigenvalue decomposition `{ eigenvalues, eigenvectors }` |
| `MatrixSVD(m)` | Singular value decomposition `{ U, S, VT }` |
| `MatrixSolve(a, b)` | Solve `Ax = b` |

#### Normalization

| Export | Description |
|--------|-------------|
| `MatrixFrobeniusNorm(m)` | Frobenius norm |
| `Matrix1Norm(m)` | Column-sum (1-norm) |
| `MatrixInfinityNorm(m)` | Row-sum (∞-norm) |
| `MatrixMaxNorm(m)` | Max absolute element |
| `MatrixNuclearNorm(m)` | Nuclear norm (sum of singular values) |
| `MatrixSpectralNorm(m)` | Spectral norm (largest singular value) |
| `MatrixPNorm(m, p)` | Generalized p-norm |

#### Transformations

| Export | Description |
|--------|-------------|
| `MatrixTranslation2D(tx, ty)` | 2D translation matrix |
| `MatrixTranslation3D(tx, ty, tz)` | 3D translation matrix |
| `MatrixScale2D(sx, sy)` | 2D scale matrix |
| `MatrixScale3D(sx, sy, sz)` | 3D scale matrix |
| `MatrixRotation2D(angle)` | 2D rotation matrix |
| `MatrixRotation3D(axis, angle)` | 3D rotation around an axis |
| `MatrixRotation3DPitch/Yaw/Roll(angle)` | Axis-specific 3D rotations |
| `MatrixRotation3DEulerAngles(...)` | Euler-angles rotation matrix |
| `MatrixTransform2D(...)` | Combined 2D TRS matrix |
| `MatrixTransform3D(...)` | Combined 3D TRS matrix |
| `MatrixDirection3D(forward, up)` | Look-at direction matrix |
| `MatrixPerspective(fov, aspect, near, far)` | Perspective projection |
| `MatrixOrthographic(...)` | Orthographic projection |
| `MatrixView(eye, target, up)` | View/look-at matrix |

#### Assertions

`AssertMatrix`, `AssertMatrix1`–`AssertMatrix4`, `AssertMatrixRow`, `AssertMatrixValue`, `AssertMatrices`, `MatrixError`

### Quaternions

Quaternions are `[x, y, z, w]` tuples (`TQuaternion`).

#### Core

| Export | Description |
|--------|-------------|
| `QuaternionMultiply(a, b)` | Hamilton product |
| `QuaternionConjugate(q)` | Conjugate |
| `QuaternionInverse(q)` | Inverse |
| `QuaternionNormalize(q)` | Unit quaternion |
| `QuaternionMagnitude(q)` | Length |
| `QuaternionEquals(a, b)` | Equality check |
| `QuaternionClone(q)` | Deep copy |
| `QuaternionRotateVector(q, v)` | Rotate a vector by a quaternion |

#### Predefined

| Export | Description |
|--------|-------------|
| `QuaternionIdentity()` | Identity quaternion `[0,0,0,1]` |
| `QuaternionRotationX/Y/Z(angle)` | Axis-aligned rotation quaternions |

#### Conversions

| Export | Description |
|--------|-------------|
| `QuaternionFromEuler(roll, pitch, yaw)` | Euler angles → quaternion |
| `QuaternionToEuler(q)` | Quaternion → `TEulerAngles` |
| `QuaternionFromAxisAngle(axis, angle)` | Axis-angle → quaternion |
| `QuaternionToAxisAngle(q)` | Quaternion → `TAxisAngle` |
| `QuaternionFromRotationMatrix(m)` | 3×3 rotation matrix → quaternion |
| `QuaternionToRotationMatrix(q)` | Quaternion → 3×3 rotation matrix |
| `QuaternionFromTransformationMatrix(m)` | 4×4 transform matrix → quaternion |
| `QuaternionToTransformationMatrix(q)` | Quaternion → 4×4 transform matrix |

#### Interpolation

| Export | Description |
|--------|-------------|
| `QuaternionSLERP(a, b, t)` | Spherical linear interpolation |
| `QuaternionNLERP(a, b, t)` | Normalized linear interpolation |
| `QuaternionSQUAD(q0, q1, s1, s2, t)` | Spherical cubic spline |
| `QuaternionCreatePath(qs)` | Pre-compute SQUAD control points |

#### Assertions

`AssertQuaternion`, `AssertQuaternions`, `AssertNormalizedQuaternion`, `AssertAxisAngle`, `AssertEulerAngles`, `AssertRotationMatrix`, `QuaternionError`

## Development

```bash
yarn install        # Install dependencies
yarn build          # Compile TypeScript → ./build/
yarn dev            # Build + run
yarn watch          # Watch mode
yarn typecheck      # Type check without building
yarn lint           # ESLint
yarn lint:fix       # ESLint with auto-fix
yarn test           # Run tests (1077 tests)
yarn test:ui        # Interactive Vitest UI
yarn test:coverage  # Tests with coverage report
```

## Requirements

- Node.js >= 24.0.0

## License

MIT — See [LICENSE](./LICENSE) for details.
