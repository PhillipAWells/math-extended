# Math Extended

[![npm](https://img.shields.io/npm/v/@pawells/math-extended)](https://www.npmjs.com/package/@pawells/math-extended)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Extended mathematical utilities for TypeScript: vectors, matrices, quaternions, interpolation & easing, angle conversions, clamping, and seedable random helpers. ESM-only, targets ES2022.

## Requirements

- Node.js >= 22.0.0
- ESM-only package (`"type": "module"`)

## Installation

```bash
npm install @pawells/math-extended
# or
yarn add @pawells/math-extended
```

## Usage

All exports are available as individual named imports from the package root. Deep imports are not supported — the exports map exposes only `@pawells/math-extended`.

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

### Import Patterns

| Pattern | Best For | Example |
|---------|----------|---------|
| **Direct named** | Tree-shaking, small imports | `import { VectorAdd } from '@pawells/math-extended'` |
| **Mixed** | Flexibility | Multiple named imports together |

### Design Principles

- **Tree-shakeable** — every operation is an individually named export.
- **Immutable** — all operations return new values; inputs are never mutated.
- **Runtime validation** — types pair with exported Zod schemas. `Assert*` functions throw on invalid input; `Validate*` functions return a result object. Error classes (`VectorError`, `MatrixError`, `QuaternionError`) carry a `code` property and chain `cause`.

## API

### Core

| Export | Description |
|--------|-------------|
| `CubeRoot(value)` | Compute the cube root of a number |

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

The PRNG is swappable and seedable. By default the implementation uses `Math.random`; replace it with any seedable generator by calling `SetPRNG`.

| Export | Description |
|--------|-------------|
| `IPRNG` | Type for a zero-argument PRNG function `() => number` |
| `SetPRNG(prng)` | Replace the active PRNG with a custom implementation |
| `GetPRNG()` | Return the currently active PRNG |
| `RandomInt(min, max)` | Random integer in `[min, max]` |
| `RandomFloat(min, max)` | Random float in `[min, max)` |
| `RandomBool(probability?)` | Random boolean with optional probability; throws `RangeError` if probability is outside `[0, 1]` |
| `RandomNormal(mean?, stdDev?)` | Normal-distributed random number (Box-Muller transform) |
| `RandomChoice(array)` | Random element from an array |
| `RandomSample(array, count)` | `count` unique random elements without replacement |
| `RandomShuffle(array, clone?)` | Shuffle an array in-place, or return a shuffled clone when `clone` is `true` |

### Interpolation

All scalar interpolation functions share the signature `(a, b, t)` unless otherwise noted. `t` is typically in `[0, 1]`, but some functions (elastic, back, bounce, splines) may accept or produce values outside that range.

| Export | Description |
|--------|-------------|
| `LinearInterpolation(a, b, t)` | Linear interpolation (LERP) |
| `SmoothStep(a, b, t)` | Cubic smooth-step |
| `SmootherStep(a, b, t)` | Quintic smoother-step |
| `CosineInterpolation(a, b, t)` | Cosine interpolation |
| `CatmullRomInterpolation(p0, p1, p2, p3, t)` | Catmull-Rom spline |
| `HermiteInterpolation(p0, p1, t0, t1, t)` | Hermite spline |
| `StepInterpolation(a, b, t, threshold?)` | Step function with configurable threshold |
| `QuadraticEaseIn/Out/InOut` | Quadratic easing |
| `CubicEaseIn/Out/InOut` | Cubic easing |
| `SineEaseIn/Out/InOut` | Sine easing |
| `ExponentialEaseIn/Out/InOut` | Exponential easing |
| `CircularEaseIn/Out/InOut` | Circular easing |
| `ElasticEaseIn/Out/InOut` | Elastic easing |
| `BackEaseIn/Out/InOut` | Back (overshoot) easing |
| `BounceEaseIn/Out/InOut` | Bounce easing |

### Vectors

Vectors are plain number arrays (`TVector`, `TVector2`, `TVector3`, `TVector4`). All operations return new vectors; inputs are never mutated.

#### Types and schemas

| Export | Description |
|--------|-------------|
| `TVector` | `number[]` — variable-length vector |
| `TVector2` | `[number, number]` |
| `TVector3` | `[number, number, number]` |
| `TVector4` | `[number, number, number, number]` |
| `TAnyVector` | Union of `TVector2 \| TVector3 \| TVector4` |
| `TVectorResult<T>` | Operation result wrapper type |
| `VECTOR_SCHEMA` | Zod schema for `TVector` |
| `VECTOR2_SCHEMA` | Zod schema for `TVector2` |
| `VECTOR3_SCHEMA` | Zod schema for `TVector3` |
| `VECTOR4_SCHEMA` | Zod schema for `TVector4` |

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
| `VectorDistanceSquared(a, b)` | Squared distance (avoids `sqrt`) |
| `VectorAngle(a, b)` | Angle between two vectors (radians) |
| `VectorReflect(a, normal)` | Reflection about a normal |
| `VectorProject(a, b)` | Projection of `a` onto `b` |
| `VectorClamp(a, min, max)` | Clamp each component |
| `VectorLimit(a, max)` | Limit magnitude |
| `VectorClone(a)` | Deep copy |
| `VectorEquals(a, b)` | Equality check |
| `VectorIsZero(a)` | Check if zero vector |
| `VectorToString(a)` | Human-readable string |
| `VectorGramSchmidt(vectors)` | Gram-Schmidt orthogonalization |

#### 2D extras

| Export | Description |
|--------|-------------|
| `Vector2Rotate(v, radians)` | Rotate a 2D vector by an angle in radians |
| `Vector2FromAngle(radians)` | Unit vector from an angle in radians |
| `Vector2Cross(a, b)` | 2D cross product (scalar) |

#### 3D extras

| Export | Description |
|--------|-------------|
| `Vector3Cross(a, b)` | 3D cross product |
| `Vector3Reflect(a, normal)` | 3D reflection about a normal |
| `Vector3Reject(a, b)` | Vector rejection of `a` from `b` |
| `Vector3ScalarTripleProduct(a, b, c)` | Scalar triple product |
| `Vector3TripleProduct(a, b, c)` | Vector triple product |

#### Predefined vectors

| Export | Description |
|--------|-------------|
| `VectorZero(size)` | Zero vector of the given size |
| `VectorOne(size)` | All-ones vector of the given size |
| `Vector2Up/Down/Left/Right` | Unit 2D direction vectors |
| `Vector3Up/Down/Left/Right/Forward/Backward` | Unit 3D direction vectors |
| `Vector4Up/Down/Left/Right/Forward/Backward` | Unit 4D direction vectors |

#### Interpolation wrappers

Every scalar easing and interpolation function has a `Vector*` counterpart that interpolates component-wise.

| Export | Description |
|--------|-------------|
| `VectorLERP(a, b, t)` | Component-wise linear interpolation |
| `VectorSmoothStep(a, b, t)` | Component-wise smooth-step |
| `VectorSmootherStep(a, b, t)` | Component-wise smoother-step |
| `VectorCosineInterpolation(a, b, t)` | Component-wise cosine interpolation |
| `VectorCatmullRomInterpolation(p0, p1, p2, p3, t)` | Component-wise Catmull-Rom spline; throws if `t` is non-finite |
| `VectorHermiteInterpolation(p0, p1, t0, t1, t)` | Component-wise Hermite spline; throws if `t` is non-finite |
| `VectorStepInterpolation(a, b, t, threshold?)` | Component-wise step interpolation |
| `VectorSphericalLinearInterpolation(a, b, t)` | Spherical linear interpolation for vectors; throws if `t` is non-finite |
| `VectorQuadraticEaseIn/Out/InOut` | Component-wise quadratic easing |
| `VectorCubicEaseIn/Out/InOut` | Component-wise cubic easing |
| `VectorSineEaseIn/Out/InOut` | Component-wise sine easing |
| `VectorExponentialEaseIn/Out/InOut` | Component-wise exponential easing |
| `VectorCircularEaseIn/Out/InOut` | Component-wise circular easing |
| `VectorElasticEaseIn/Out/InOut` | Component-wise elastic easing |
| `VectorBackEaseIn/Out/InOut` | Component-wise back easing |
| `VectorBounceEaseIn/Out/InOut` | Component-wise bounce easing |

#### Guards and errors

| Export | Description |
|--------|-------------|
| `AssertVector(v)` | Throw `VectorError` if `v` is not a valid vector |
| `AssertVector2(v)` | Throw if not a `TVector2` |
| `AssertVector3(v)` | Throw if not a `TVector3` |
| `AssertVector4(v)` | Throw if not a `TVector4` |
| `AssertVectorNonZero(v)` | Throw if the vector is the zero vector |
| `AssertVectorSameSize(a, b)` | Throw if vectors differ in length |
| `ValidateVector(v)` | Return a result object; does not throw |
| `ValidateVector2(v)` | Return a result object for `TVector2` |
| `ValidateVector3(v)` | Return a result object for `TVector3` |
| `ValidateVector4(v)` | Return a result object for `TVector4` |
| `ValidateVectorSameSize(a, b)` | Return a result object for size compatibility |
| `VectorError` | Error class with `code` property and chained `cause` |

### Matrices

Matrices are `number[][]` arrays (`TMatrix`, `TMatrix1`–`TMatrix4`). All operations return new matrices; inputs are never mutated.

#### Types and schemas

| Export | Description |
|--------|-------------|
| `TMatrix` | `number[][]` — variable-size matrix |
| `TMatrix1` / `TMatrix2` / `TMatrix3` / `TMatrix4` | Typed 1×1 through 4×4 matrices |
| `TMatrixAll` | Union of all sized matrix types |
| `TMatrixSquare` | Constraint type for square matrices |
| `TMatrixResult<T>` | Operation result wrapper type |
| `IMatrixOperationOptions` | Options interface for matrix operations |
| `MATRIX_SCHEMA` (and sized variants) | Zod schemas for each matrix type |
| `TLUDecompositionResult` | `{ readonly L: TMatrix; readonly U: TMatrix; readonly P: number[] }` — result of `MatrixLU` |
| `TQRDecompositionResult` | `{ readonly Q: TMatrix; readonly R: TMatrix }` — result of `MatrixQR` |
| `TEigenDecompositionResult` | `{ eigenvalues: number[]; eigenvectors: TMatrix }` — result of `MatrixEigen` |
| `TSVDDecompositionResult` | `{ readonly U: TMatrix; readonly S: number[]; readonly VT: TMatrix }` — result of `MatrixSVD` |

#### Core

| Export | Description |
|--------|-------------|
| `MatrixCreate(rows, cols)` | Zero-filled matrix (typed overloads for 1×1–4×4) |
| `MatrixIdentity(n)` | `n×n` identity matrix |
| `MatrixClone(m)` | Deep copy |
| `MatrixEquals(a, b)` | Equality check |
| `MatrixTranspose(m)` | Transpose |
| `MatrixMap(m, fn)` | Map a function over every element |
| `MatrixTrace(m)` | Sum of diagonal elements |
| `MatrixRank(m)` | Matrix rank |
| `MatrixIsZero(m)` | Zero-matrix predicate |
| `MatrixIsIdentity(m)` | Identity predicate |
| `MatrixIsSymmetric(m)` | Symmetry predicate |
| `MatrixIsDiagonal(m)` | Diagonal predicate |

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
| `MatrixMinor(m, x, y)` | Minor for the element at `(x, y)` |
| `MatrixCofactor(m, row, col)` | Cofactor matrix |
| `MatrixCofactorElement(m, row, col)` | Single cofactor element at `(row, col)` |
| `MatrixAdjoint(m)` | Adjugate (classical adjoint) |
| `MatrixGramSchmidt(m)` | Gram-Schmidt orthogonalization |

#### Decompositions

| Export | Description |
|--------|-------------|
| `MatrixLU(m)` | LU decomposition with partial pivoting → `{ L, U, P }` |
| `MatrixQR(m)` | QR decomposition → `{ Q, R }` |
| `MatrixCholesky(m)` | Cholesky decomposition → lower-triangular `L` |
| `MatrixEigen(m)` | Eigenvalue decomposition → `{ eigenvalues, eigenvectors }` |
| `MatrixSVD(m)` | Singular value decomposition → `{ U, S, VT }` |
| `MatrixSolve(a, b)` | Solve `Ax = b` |

#### Norms

| Export | Description |
|--------|-------------|
| `MatrixFrobeniusNorm(m)` | Frobenius norm |
| `MatrixSpectralNorm(m)` | Spectral norm (largest singular value) |
| `Matrix1Norm(m)` | Column-sum (1-norm) |
| `MatrixInfinityNorm(m)` | Row-sum (∞-norm) |
| `MatrixNuclearNorm(m)` | Nuclear norm (sum of singular values) |
| `MatrixMaxNorm(m)` | Max absolute element |
| `MatrixPNorm(m, p)` | Generalized p-norm |

#### Transformations

| Export | Description |
|--------|-------------|
| `MatrixTranslation2D(x, y)` / `MatrixTranslation2D(v)` | 2D translation → `TMatrix3`; accepts individual coordinates or a `TVector2` |
| `MatrixTranslation3D(distance)` / `MatrixTranslation3D(x, y, z)` / `MatrixTranslation3D(v)` | 3D translation → `TMatrix4`; accepts a uniform distance, independent axes, or a `TVector3` |
| `MatrixScale2D(scale)` / `MatrixScale2D(x, y)` / `MatrixScale2D(v)` | 2D scale matrix → `TMatrix3`; accepts a uniform scale, independent axes, or a `TVector2` |
| `MatrixScale3D(scale)` / `MatrixScale3D(x, y, z)` / `MatrixScale3D(v)` | 3D scale matrix → `TMatrix4`; accepts a uniform scale, independent axes, or a `TVector3` |
| `MatrixRotation2D(angle)` | 2D rotation matrix |
| `MatrixRotation3D(roll, pitch, yaw)` / `MatrixRotation3D(v)` | Composite 3D rotation matrix from Roll (X) → Pitch (Y) → Yaw (Z); accepts individual angles or a `TVector3` |
| `MatrixRotation3DRoll(angle)` | 3D rotation around the X axis (roll) |
| `MatrixRotation3DPitch(angle)` | 3D rotation around the Y axis (pitch) |
| `MatrixRotation3DYaw(angle)` | 3D rotation around the Z axis (yaw) |
| `MatrixRotation3DEulerAngles(roll, pitch, yaw)` | Euler-angles rotation matrix |
| `MatrixTransform2D(v, TMatrix3)` | Apply a 2D transformation matrix to a vector |
| `MatrixTransform3D(v, TMatrix4)` | Apply a 3D transformation matrix to a vector |
| `MatrixDirection3D(direction, matrix)` | Transform a 3D direction vector by a 3×3 matrix (ignores translation) |
| `MatrixView(eye, target, up)` | View / look-at matrix |
| `MatrixPerspective(fovY, aspect, near, far)` | Perspective projection matrix |
| `MatrixOrthographic(left, right, bottom, top, near, far)` | Orthographic projection matrix |

#### Guards and errors

| Export | Description |
|--------|-------------|
| `AssertMatrix(m)` | Throw `MatrixError` if `m` is not a valid matrix |
| `AssertMatrix1(m)` / `AssertMatrix2(m)` / `AssertMatrix3(m)` / `AssertMatrix4(m)` | Throw if not a sized matrix |
| `AssertMatrixSquare(m)` | Throw if not a square matrix |
| `AssertMatricesCompatible(a, b)` | Throw if dimensions are incompatible for multiplication |
| `ValidateMatrix(m)` | Return a result object; does not throw |
| `ValidateMatrix1(m)` / `ValidateMatrix2(m)` / `ValidateMatrix3(m)` / `ValidateMatrix4(m)` | Return a result object for sized matrices |
| `ValidateMatrixSquare(m)` | Return a result object for square check |
| `MatrixError` | Error class with `code` property and chained `cause` |

### Quaternions

Quaternions are `[x, y, z, w]` tuples (`TQuaternion`). All operations return new values; inputs are never mutated.

#### Types and schemas

| Export | Description |
|--------|-------------|
| `TQuaternion` | `[x, y, z, w]` tuple |
| `TEulerAngles` | `[roll, pitch, yaw]` tuple |
| `TAxisAngle` | `[x, y, z, angle]` tuple |
| `TRotationMatrix` | 3×3 rotation matrix type |
| `TRotation` | Union of all rotation representation types |
| `QUATERNION_SCHEMA` (and related schemas) | Zod schemas for quaternion types |

`QUATERNION_SCHEMA` validates a 4-tuple `[x, y, z, w]` where each component must be of type `number`. `NaN` is **rejected** (fails the schema). `Infinity` is **permitted** — the schema checks only that the value is a number and not `NaN`; it does not require finite values.

#### Core

| Export | Description |
|--------|-------------|
| `QuaternionIdentity()` | Identity quaternion `[0, 0, 0, 1]` |
| `QuaternionClone(q)` | Deep copy |
| `QuaternionEquals(a, b)` | Equality check |
| `QuaternionMultiply(a, b)` | Hamilton product |
| `QuaternionConjugate(q)` | Conjugate |
| `QuaternionInverse(q)` | Inverse |
| `QuaternionNormalize(q)` | Unit quaternion |
| `QuaternionMagnitude(q)` | Length |
| `QuaternionRotateVector(q, v)` | Rotate a `TVector3` by a quaternion |

#### Predefined

| Export | Description |
|--------|-------------|
| `QuaternionRotationX(angle)` | Rotation quaternion around the X axis |
| `QuaternionRotationY(angle)` | Rotation quaternion around the Y axis |
| `QuaternionRotationZ(angle)` | Rotation quaternion around the Z axis |

#### Conversions

| Export | Description |
|--------|-------------|
| `QuaternionFromEuler(roll, pitch, yaw)` | Euler angles → quaternion |
| `QuaternionToEuler(q)` | Quaternion → `TEulerAngles` |
| `QuaternionFromAxisAngle(axis, angle)` | Axis-angle → quaternion |
| `QuaternionToAxisAngle(q)` | Quaternion → `TAxisAngle` |
| `QuaternionFromAxisAngleVector(v)` | `TAxisAngle` tuple → quaternion |
| `QuaternionFromRotationMatrix(m)` | 3×3 rotation matrix → quaternion |
| `QuaternionToRotationMatrix(q)` | Quaternion → 3×3 rotation matrix |
| `QuaternionFromTransformationMatrix(m)` | 4×4 transform matrix → quaternion |
| `QuaternionToTransformationMatrix(q)` | Quaternion → 4×4 transform matrix |
| `IsValidRotationMatrix(matrix, tolerance?)` | Validate a 3×3 rotation matrix (returns `boolean`) |

#### Interpolation

| Export | Description |
|--------|-------------|
| `QuaternionSLERP(a, b, t)` | Spherical linear interpolation |
| `QuaternionNLERP(a, b, t)` | Normalized linear interpolation |
| `QuaternionSQUAD(q0, q1, q2, q3, t)` | Spherical cubic spline |
| `QuaternionCreatePath(qs)` | Pre-compute SQUAD control points from a sequence of quaternions |

#### Guards and errors

| Export | Description |
|--------|-------------|
| `AssertQuaternion(q)` | Throw `QuaternionError` if `q` is not a valid quaternion |
| `AssertQuaternions(qs)` | Throw if any element of an array is not a valid quaternion |
| `AssertNormalizedQuaternion(q)` | Throw if `q` is not unit-length |
| `AssertEulerAngles(e)` | Throw if `e` is not a valid `TEulerAngles` |
| `AssertAxisAngle(a)` | Throw if `a` is not a valid `TAxisAngle` |
| `AssertRotationMatrix(m)` | Throw if `m` is not a valid rotation matrix |
| `ValidateQuaternion(q)` | Return a result object; does not throw |
| `ValidateQuaternions(qs)` | Return a result object for an array of quaternions |
| `ValidateNormalizedQuaternion(q)` | Return a result object for unit-length check |
| `ValidateEulerAngles(e)` | Return a result object for `TEulerAngles` |
| `ValidateAxisAngle(a)` | Return a result object for `TAxisAngle` |
| `ValidateRotationMatrix(m)` | Return a result object for rotation matrix validity |
| `QuaternionError` | Error class with `code` property and chained `cause` |

## Development

```bash
yarn build          # Compile TypeScript → ./build/
yarn typecheck      # Type-check without building
yarn lint           # ESLint
yarn lint:fix       # ESLint with auto-fix
yarn test           # Run tests
yarn test:coverage  # Tests with coverage report (80% threshold on all 4 metrics)
yarn clean          # Remove build output
```

Run a single test file:

```bash
yarn vitest --run src/<file>.spec.ts
```

## License

MIT © Phillip Aaron Wells
