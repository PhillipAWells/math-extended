# Math Extended

[![npm](https://img.shields.io/npm/v/@pawells/math-extended)](https://www.npmjs.com/package/@pawells/math-extended)
[![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Extended mathematical utilities for TypeScript: vectors, matrices, quaternions, interpolation & easing, angle conversions, scalar utilities, statistics, clamping, and seedable random helpers. ESM-only, targets ES2022.

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
- **Runtime validation** — types pair with exported Zod schemas. `Assert*` functions throw on invalid input; `Validate*` functions return a `boolean` type guard (`value is T`) and never throw. Error classes (`VectorError`, `MatrixError`, `QuaternionError`, `ScalarError`) carry a `code` property and chain `cause`.

## API

### Constants

Tolerance constants for numeric comparisons. Import these alongside `Approximately` and other robustness helpers.

| Export | Value | Description |
|--------|-------|-------------|
| `EPSILON` | `1e-10` | General-purpose tolerance for floating-point equality comparisons |
| `EPSILON_LOOSE` | `1e-6` | Loose tolerance for operations accumulating rounding errors |
| `EPSILON_TIGHT` | `Number.EPSILON` | Tight tolerance based on JavaScript's machine epsilon (~2.22e-16) |
| `EPSILON_COMPARISON` | `1e-8` | Default tolerance for value-equality comparisons (e.g., `MatrixEquals`) |
| `EPSILON_ORTHOGONAL` | `1e-9` | Tolerance for orthogonality checks (e.g., `MatrixIsOrthogonal`) |
| `EPSILON_STRUCTURAL` | `1e-14` | Tolerance for structural matrix predicates (`MatrixIsZero`, `MatrixIsIdentity`, `MatrixIsSymmetric`, `MatrixIsDiagonal`) |
| `EPSILON_DECOMPOSITION` | `1e-12` | Numerical tolerance for matrix decompositions (LU, QR, SVD, Cholesky) |

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
| `WrapAngle(radians)` | Wrap an angle in radians to the range `(-π, π]`; throws if not finite |
| `DeltaAngle(from, to)` | Shortest signed angular difference from `from` to `to`, in `(-π, π]`; throws if not finite |

### Clamp

| Export | Description |
|--------|-------------|
| `Clamp(x, min, max)` | Clamp a number between min and max |

### Scalar

Extended scalar operations. `ScalarError` is thrown by functions that require degenerate-interval or type guards; see individual signatures for `RangeError` vs `ScalarError` distinctions.

| Export | Description |
|--------|-------------|
| `ScalarError` | Error class for scalar validation failures; has `code` property and chains `cause` |
| `Lerp(a, b, t)` | Linear interpolation with `t` clamped to `[0, 1]`; throws `RangeError` if any argument is not finite |
| `LerpUnclamped(a, b, t)` | Linear interpolation without clamping, allowing extrapolation; throws `RangeError` if not finite |
| `InverseLerp(a, b, value)` | Inverse lerp: finds `t` such that `Lerp(a, b, t) = value`; throws `ScalarError` if `a === b`, `RangeError` if not finite |
| `Remap(value, inMin, inMax, outMin, outMax)` | Map a value from one range to another; throws `ScalarError` if `inMin === inMax`, `RangeError` if not finite |
| `MoveTowards(current, target, maxDelta)` | Move `current` towards `target` by at most `maxDelta`; throws `RangeError` if not finite |
| `Mod(a, n)` | True Euclidean modulo (result sign follows divisor); throws `RangeError` if `n === 0` or not finite |
| `Repeat(t, length)` | Wrap `t` into `[0, length)`; throws `RangeError` if `length <= 0` or not finite |
| `PingPong(t, length)` | Oscillate `t` between `0` and `length` (triangular wave); throws `RangeError` if `length <= 0` or not finite |
| `Approximately(a, b, epsilon?)` | Return `true` if `\|a - b\| <= epsilon` (default `EPSILON`); never throws, returns `false` for non-finite inputs |
| `Clamp01(value)` | Clamp a number to `[0, 1]`; convenience wrapper for `Clamp(value, 0, 1)` |
| `Sign(value)` | Return `-1`, `0`, or `1`; normalises `-0` to `0` |
| `RoundToNearest(value, step)` | Round `value` to the nearest multiple of `step`; throws `RangeError` if `step <= 0` or not finite |
| `Gcd(a, b)` | Greatest common divisor (Euclidean); throws `RangeError` if either argument is not an integer |
| `Lcm(a, b)` | Least common multiple; throws `RangeError` if either argument is not an integer |
| `Factorial(n)` | `n!` for non-negative integers; throws `RangeError` if `n` is negative or not an integer |
| `Linspace(start, stop, count)` | `count` evenly spaced values from `start` to `stop` (inclusive); throws `RangeError` if `count` is negative or not an integer |
| `Range(start, stop, step?)` | Half-open range `[start, stop)` with given step (default `1`); throws `RangeError` if `step === 0` |

### Statistics

Descriptive statistics over `number[]` arrays. All functions throw `ScalarError` on empty input; `Variance` and `StandardDeviation` additionally throw when sample mode (`population=false`) receives fewer than 2 values.

| Export | Description |
|--------|-------------|
| `Sum(values)` | Sum of all values; returns `0` for an empty array |
| `Product(values)` | Product of all values; returns `1` for an empty array |
| `Mean(values)` | Arithmetic mean; throws `ScalarError` if empty |
| `Variance(values, population?)` | Sample variance by default (`population=false`, divides by `n-1`); pass `true` for population variance; uses Welford's algorithm |
| `StandardDeviation(values, population?)` | Square root of `Variance`; same overload and error behaviour |
| `Median(values)` | Middle value (odd length) or average of two middle values (even length); throws `ScalarError` if empty |

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
| `VectorScale(a, scalar)` | Multiply each component by a scalar |
| `VectorNegate(a)` | Negate all components |
| `VectorAbs(a)` | Absolute value of each component |
| `VectorFloor(a)` | Apply `Math.floor` to each component |
| `VectorCeil(a)` | Apply `Math.ceil` to each component |
| `VectorRound(a)` | Apply `Math.round` to each component |
| `VectorMin(a, b)` | Component-wise minimum of two vectors |
| `VectorMax(a, b)` | Component-wise maximum of two vectors |
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
| `VectorIsFinite(a)` | Return `true` if all components are finite (not NaN or Infinity); throws `VectorError` if input is not a valid vector structure |
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
| `VectorCrossMagnitude(a, b)` | Magnitude of the 3D cross product (area of parallelogram) |
| `Vector3Reflect(a, normal)` | 3D reflection about a normal |
| `Vector3Reject(a, b)` | Vector rejection of `a` from `b` |
| `Vector3ScalarTripleProduct(a, b, c)` | Scalar triple product |
| `Vector3TripleProduct(a, b, c)` | Vector triple product |
| `Vector3ProjectOnPlane(v, planeNormal)` | Project vector onto a plane defined by its normal; throws `VectorError` if `planeNormal` is zero |
| `Vector3RotateAround(v, axis, radians)` | Rotate vector around an axis using Rodrigues' formula; throws `VectorError` if `axis` is zero |

#### Geometry and distances

| Export | Description |
|--------|-------------|
| `VectorMidpoint(a, b)` | Midpoint between two vectors (component-wise average); throws `VectorError` if sizes differ |
| `VectorMoveTowards(current, target, maxDistance)` | Move vector towards target by at most `maxDistance` units; throws `VectorError` if sizes differ |
| `VectorManhattanDistance(a, b)` | Sum of absolute component differences (taxicab distance); throws `VectorError` if sizes differ |
| `VectorChebyshevDistance(a, b)` | Maximum absolute component difference (chessboard distance); throws `VectorError` if sizes differ |
| `VectorIsNormalized(vector, tolerance?)` | Return `true` if vector magnitude is within `tolerance` of `1` (default `EPSILON_LOOSE`); throws `VectorError` if invalid |
| `Vector2AngleSigned(a, b)` | Signed angle from `a` to `b` in 2D, in `(-π, π]`; throws `VectorError` if inputs are not `TVector2` |
| `Vector3AngleSigned(a, b, axis)` | Signed angle from `a` to `b` around `axis` in 3D; throws `VectorError` if any input is not `TVector3` or `axis` is zero |

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
| `ValidateVector(v)` | Return `true` if `v` is a valid vector (`value is TVector`); never throws |
| `ValidateVector2(v)` | Return `true` if `v` is a `TVector2`; never throws |
| `ValidateVector3(v)` | Return `true` if `v` is a `TVector3`; never throws |
| `ValidateVector4(v)` | Return `true` if `v` is a `TVector4`; never throws |
| `ValidateVectorSameSize(vs)` | Return `true` if all vectors in the array have the same length; never throws |
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
| `MatrixSize(m)` | Returns `[rows, cols]` dimensions |
| `MatrixSizeSquare(m)` | Returns `n` for an `n×n` matrix; throws if not square |
| `MatrixToString(m, precision?)` | Formatted string representation |
| `MatrixTrace(m)` | Sum of diagonal elements |
| `MatrixRank(m)` | Matrix rank |
| `MatrixIsZero(m)` | Zero-matrix predicate |
| `MatrixIsIdentity(m)` | Identity predicate |
| `MatrixIsSymmetric(m)` | Symmetry predicate |
| `MatrixIsDiagonal(m)` | Diagonal predicate |
| `MatrixIsFinite(m)` | Return `true` if every element is finite (not NaN or Infinity); throws `MatrixError` if input is not a valid matrix structure |

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
| `MatrixCofactor(m)` | Full cofactor matrix |
| `MatrixCofactorElement(m, x, y)` | Single cofactor element at `(x, y)` |
| `MatrixAdjoint(m)` | Adjugate (classical adjoint) |
| `MatrixGramSchmidt(m)` | Gram-Schmidt orthogonalization (returns orthonormal columns) |
| `MatrixNullSpace(m, tolerance?)` | Orthonormal basis for the null space (columns); empty matrix if full rank |
| `MatrixPseudoInverse(m, tolerance?)` | Moore-Penrose pseudoinverse via SVD |
| `MatrixConditionNumber(m)` | 2-norm condition number (σ_max / σ_min); returns `Infinity` for singular matrices |
| `MatrixIsInvertible(m, tolerance?)` | Return `true` if the matrix is square and numerically full rank; returns `false` for non-square |
| `MatrixLeastSquares(a, b)` | Least-squares solution `x` to `Ax = b` via pseudoinverse; throws `MatrixError` on dimension mismatch |
| `MatrixPower(m, exponent)` | Integer matrix exponentiation by squaring; throws `MatrixError` if not square or exponent is not an integer |
| `MatrixKronecker(a, b)` | Kronecker (tensor) product of two matrices; result is `(m·p)×(n·q)` |
| `MatrixIsOrthogonal(m, tolerance?)` | Return `true` if the matrix is square and Qᵀ × Q ≈ I within tolerance; returns `false` for non-square |
| `MatrixIsPositiveDefinite(m)` | Return `true` if the matrix is symmetric and positive definite (via Cholesky); returns `false` otherwise |

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
| `MatrixNormalize(m)` | Scale to unit Frobenius norm; throws `MatrixError` on zero matrix |
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
| `MatrixTRS(translation, rotation, scale)` | Composite TRS matrix (Translation × Rotation × Scale) from three `TVector3` arguments; rotation is Euler angles in radians (roll/pitch/yaw) |
| `MatrixDecomposeTRS(m)` | Decompose a 4×4 TRS matrix into `{ translation, rotation, scale }` (`TVector3` each); Euler angles in radians (roll/pitch/yaw) |
| `MatrixShear2D(shearX, shearY)` | 2D shear matrix → `TMatrix3`; convention: x′ = x + shearX·y, y′ = shearY·x + y |
| `MatrixShear3D(xy, xz, yx, yz, zx, zy)` | 3D shear matrix → `TMatrix4`; convention: x′ = x + xy·y + xz·z, y′ = yx·x + y + yz·z, z′ = zx·x + zy·y + z |
| `MatrixReflection2D(angle)` | 2D reflection matrix → `TMatrix3`; reflects across a line through the origin at `angle` radians from the X-axis |
| `MatrixTransform2D(v, TMatrix3)` | Apply a 2D transformation matrix to a vector |
| `MatrixTransform3D(v, TMatrix4)` | Apply a 3D transformation matrix to a vector |
| `MatrixDirection3D(direction, matrix)` | Transform a 3D direction vector by a 3×3 matrix (ignores translation) |
| `MatrixView(eye, target, up)` | View matrix (camera look-at) |
| `MatrixLookAt(eye, target, up)` | Alias of `MatrixView`; industry-standard look-at name |
| `MatrixPerspective(fovY, aspect, near, far)` | Perspective projection matrix |
| `MatrixOrthographic(left, right, bottom, top, near, far)` | Orthographic projection matrix |

#### Guards and errors

| Export | Description |
|--------|-------------|
| `AssertMatrix(m)` | Throw `MatrixError` if `m` is not a valid matrix |
| `AssertMatrix1(m)` / `AssertMatrix2(m)` / `AssertMatrix3(m)` / `AssertMatrix4(m)` | Throw if not a sized matrix |
| `AssertMatrixSquare(m)` | Throw if not a square matrix |
| `AssertMatricesCompatible(a, b)` | Throw if dimensions are incompatible for multiplication |
| `ValidateMatrix(m)` | Return `true` if `m` is a valid matrix (`value is TMatrix`); never throws |
| `ValidateMatrix1(m)` / `ValidateMatrix2(m)` / `ValidateMatrix3(m)` / `ValidateMatrix4(m)` | Return `true` if `m` is the corresponding sized matrix; never throws |
| `ValidateMatrixSquare(m)` | Return `true` if `m` is a square matrix (`value is TMatrixSquare`); never throws |
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
| `QuaternionIsFinite(q)` | Return `true` if all 4 components are finite; throws `QuaternionError` if input is not a valid quaternion structure |
| `QuaternionDot(a, b)` | Dot product of two quaternions (sum of component-wise products); throws `QuaternionError` if either is invalid |
| `QuaternionAngleBetween(a, b)` | Angle in radians of the relative rotation between two quaternions, in `[0, π]`; throws `QuaternionError` if either is invalid |
| `QuaternionFromToRotation(from, to)` | Shortest-arc rotation quaternion from one direction vector to another; handles parallel and anti-parallel cases; throws `QuaternionError` if either vector has zero magnitude |
| `QuaternionLookRotation(forward, up?)` | Orientation quaternion aligning the object's forward (+Z) axis with `forward`; `up` defaults to `[0, 1, 0]`; throws `QuaternionError` if vectors are parallel |
| `QuaternionRotateTowards(from, to, maxRadians)` | Rotate `from` towards `to` by at most `maxRadians`; returns normalized source if `maxRadians <= 0`, target if angle already within range |

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
| `ValidateQuaternion(q)` | Return `true` if `q` is a valid quaternion; never throws |
| `ValidateQuaternions(qs)` | Return `true` if every element of an array is a valid quaternion; never throws |
| `ValidateNormalizedQuaternion(q)` | Return `true` if `q` is unit-length; never throws |
| `ValidateEulerAngles(e)` | Return `true` if `e` is a valid `TEulerAngles`; never throws |
| `ValidateAxisAngle(a)` | Return `true` if `a` is a valid `TAxisAngle`; never throws |
| `ValidateRotationMatrix(m)` | Return `true` if `m` is a valid rotation matrix; never throws |
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
