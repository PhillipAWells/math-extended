# AGENTS.md — @pawells/math-extended

Primary reference for AI agents working in this repository. Read this file before making any change.

---

## 1. Overview

`@pawells/math-extended` is an extended mathematical utilities library for TypeScript. It provides vectors, matrices, quaternions, scalar interpolation and easing, angle conversions, clamping, tolerance constants, general scalar utilities, statistical aggregates, and seedable random helpers.

- **Package:** `@pawells/math-extended` v3.1.0
- **License:** MIT
- **ESM-only:** `"type": "module"` in package.json; no CommonJS output
- **Node:** `>=22.0.0` (`.nvmrc` pins 24)
- **Workspace:** single-package NX workspace (`@pawells/math-extended-workspace`, private)

---

## 2. Architecture

### Domain layout

Source lives under `packages/math-extended/src/`. Four functional domains each follow the same internal shape:

```
<domain>/
  types.ts       — TypeScript types + exported Zod schemas
  core.ts        — primary operations (pure functions)
  <modules>.ts   — additional operations (arithmetic, decompositions, etc.)
  asserts.ts     — Assert* / Validate* guards + domain error class
  index.ts       — barrel re-exporting everything in the domain
```

| Domain | Entry | Types |
|---|---|---|
| `vectors/` | `vectors/index.ts` | `TVector`, `TVector2`, `TVector3`, `TVector4`, `TAnyVector`, `TVectorResult<T>` |
| `matrices/` | `matrices/index.ts` | `TMatrix`, `TMatrix1`–`TMatrix4`, `TMatrixAll`, `TMatrixSquare`, `TMatrixResult<T>` |
| `quaternions/` | `quaternions/index.ts` | `TQuaternion` (`[x,y,z,w]`), `TEulerAngles`, `TAxisAngle`, `TRotationMatrix`, `TRotation` |
| Scalar utilities | individual files | — |

Scalar utilities at `src/` root: `angles.ts`, `clamp.ts`, `constants.ts`, `core.ts`, `interpolation.ts`, `random.ts`, `scalar.ts`, `statistics.ts`.

### Public API barrel

All public exports flow through a single barrel:

```
packages/math-extended/src/index.ts
```

Consumers import only from the package root. Deep imports into `src/` subdirectories are not supported.

### Internal utilities

`src/internal/` contains two files that are NOT part of the public API and must not be re-exported from `src/index.ts`:

- `src/internal/guards.ts` — lightweight numeric/array/instance assertion helpers (`AssertNumber`, `AssertArray`, `AssertInstanceOf`, `AssertNotEquals`) and their constraint interfaces (`INumberConstraints`, `IArrayConstraints`, `IExceptionDetails`, all tagged `@internal`)
- `src/internal/make-validate.ts` — `makeValidate<T>` factory that converts an `Assert*` function into a boolean type guard

### Build output

`tsc` via `@nx/js/typescript` compiles source to `packages/math-extended/dist/`. The `dist/` directory is gitignored and excluded from the repo but included in the npm `files` array.

---

## 3. Key Concepts

### Immutability

Every operation returns a new value. Inputs are never mutated. This applies to all domains.

### Runtime validation model

The library uses a two-tier guard pattern per domain:

| Function prefix | Behaviour |
|---|---|
| `Assert*` | Throws a domain error if validation fails; used as a TypeScript assertion (`asserts value is T`) |
| `Validate*` | Returns a boolean type guard (`value is T`); never throws; created via `makeValidate(Assert*)` |

`Assert*` functions perform direct structural checks (not Zod `.parse()`). Zod schemas are exported for type inference and external use but are not in the hot path.

### Error classes

Each domain exports one error class:

| Class | Domain / file | `static Code` constant |
|---|---|---|
| `VectorError` | vectors | `VECTOR_ERROR` |
| `MatrixError` | matrices | `MATRIX_ERROR` |
| `QuaternionError` | quaternions | `QUATERNION_ERROR` |
| `ScalarError` | `scalar.ts`, `statistics.ts` | `SCALAR_ERROR` |

All four extend `BaseError` from `@pawells/typescript-common`. Every error has:
- A `code: string` property (accessed via inherited `Code` getter)
- Optional cause chaining via `{ cause: originalError }` in the constructor options

`ScalarError` is thrown by scalar operations where the failure is a domain constraint (e.g., degenerate interval in `InverseLerp`, empty array in `Mean`). Some scalar utilities still throw built-in `RangeError` for range/integer violations (e.g., `Lerp`, `Gcd`, `Factorial`, `Repeat`, `Range`). See Section 6 for the distinction.

### makeValidate factory

`src/internal/make-validate.ts` exports a single function:

```typescript
makeValidate<T>(assert: (value: unknown) => asserts value is T): (value: unknown) => value is T
```

It wraps an `Assert*` function in a try/catch and returns the boolean equivalent. Most `Validate*` exports in `asserts.ts` files are created this way. `ValidateVectorSameSize` is hand-rolled due to its non-standard signature.

### Zod schemas

Each domain's `types.ts` exports named Zod schemas (e.g., `VECTOR_SCHEMA`, `MATRIX_SCHEMA`, `QUATERNION_SCHEMA`). These are re-exported in the public API and are intended for external callers who need runtime schema validation or type inference via `z.infer<>`.

---

## 4. Public API

Import everything from the package root. Never use deep imports.

```typescript
import { VectorAdd, TVector3, VECTOR3_SCHEMA } from '@pawells/math-extended';
```

### Angles (`angles.ts`)

| Export | Description |
|---|---|
| `DegreesToRadians(degrees)` | Degrees → radians; no validation |
| `RadiansToDegrees(radians)` | Radians → degrees; no validation |
| `FormatRadians(radians)` | Formats as π-fraction string; throws if not finite |
| `NormalizeRadians(radians)` | Wraps to `[0, 2π)`; throws if not finite |
| `NormalizeDegrees(degrees)` | Wraps to `[0°, 360°)`; throws if not finite |
| `WrapAngle(radians)` | Wraps to `(-π, π]`; throws if not finite |
| `DeltaAngle(from, to)` | Shortest signed angular difference in `(-π, π]`; throws if either is not finite |

### Clamp (`clamp.ts`)

| Export | Description |
|---|---|
| `Clamp(value, min, max)` | Clamps a number to `[min, max]` |

### Constants (`constants.ts`)

| Export | Value | Description |
|---|---|---|
| `EPSILON` | `1e-10` | General-purpose tolerance for floating-point equality comparisons |
| `EPSILON_LOOSE` | `1e-6` | Looser tolerance for operations that accumulate rounding errors |
| `EPSILON_TIGHT` | `Number.EPSILON` | Tightest tolerance — JS machine epsilon (~2.2e-16) |

### Core (`core.ts`)

| Export | Description |
|---|---|
| `CubeRoot(value)` | Sign-preserving cube root |

### Scalar (`scalar.ts`)

**Error class:** `ScalarError` — extends `BaseError`; `static Code.SCALAR_ERROR`.

| Export | Description |
|---|---|
| `Lerp(a, b, t)` | Linear interpolation clamped to `[0, 1]`; throws `RangeError` if non-finite |
| `LerpUnclamped(a, b, t)` | Linear interpolation without clamping (extrapolates); throws `RangeError` if non-finite |
| `InverseLerp(a, b, value)` | Finds `t` such that `Lerp(a, b, t) === value`; throws `ScalarError` if `a === b`, `RangeError` if non-finite |
| `Remap(value, inMin, inMax, outMin, outMax)` | Maps value from `[inMin, inMax]` to `[outMin, outMax]`; throws `ScalarError` if `inMin === inMax`, `RangeError` if non-finite |
| `MoveTowards(current, target, maxDelta)` | Moves `current` towards `target` by at most `maxDelta`; throws `RangeError` if non-finite |
| `Mod(a, n)` | Euclidean modulo (result sign follows divisor); throws `RangeError` if `n === 0` or non-finite |
| `Repeat(t, length)` | Wraps `t` into `[0, length)`; throws `RangeError` if `length <= 0` or non-finite |
| `PingPong(t, length)` | Oscillates `t` between `0` and `length` (triangular wave); throws `RangeError` if `length <= 0` or non-finite |
| `Approximately(a, b, epsilon?)` | Returns `true` if `|a − b| <= epsilon` (default `EPSILON`); returns `false` for non-finite inputs, never throws |
| `Clamp01(value)` | Clamps to `[0, 1]`; convenience for `Clamp(value, 0, 1)` |
| `Sign(value)` | Returns `-1`, `0`, or `1`; treats `-0` as `0` |
| `RoundToNearest(value, step)` | Rounds to nearest multiple of `step`; throws `RangeError` if `step <= 0` or non-finite |
| `Gcd(a, b)` | Greatest common divisor (Euclidean); throws `RangeError` if either is not an integer |
| `Lcm(a, b)` | Least common multiple; throws `RangeError` if either is not an integer |
| `Factorial(n)` | `n!`; throws `RangeError` if `n` is negative or not an integer |
| `Linspace(start, stop, count)` | `count` evenly spaced values from `start` to `stop` inclusive; throws `RangeError` if `count` is negative or not an integer |
| `Range(start, stop, step?)` | Half-open `[start, stop)` with given step (default `1`); throws `RangeError` if `step === 0`; returns `[]` if step points away from stop |

### Statistics (`statistics.ts`)

| Export | Description |
|---|---|
| `Sum(values)` | Sum of array; returns `0` for empty array |
| `Product(values)` | Product of array; returns `1` (multiplicative identity) for empty array |
| `Mean(values)` | Arithmetic mean; throws `ScalarError` if array is empty |
| `Variance(values, population?)` | Variance using Welford's algorithm; `population=false` (default) uses `n-1`; throws `ScalarError` if empty or sample variant has fewer than 2 values |
| `StandardDeviation(values, population?)` | Square root of `Variance`; same error conditions |
| `Median(values)` | Median (non-mutating); throws `ScalarError` if array is empty |

### Interpolation (`interpolation.ts`)

Scalar easing families: `LinearInterpolation`, `SmoothStep`, `SmootherStep`, `CosineInterpolation`, `StepInterpolation`, `CatmullRomInterpolation`, `HermiteInterpolation`, plus `EaseIn`/`EaseOut`/`EaseInOut` variants for Quadratic, Cubic, Sine, Exponential, Elastic, Circular, Back, and Bounce.

### Random (`random.ts`)

| Export | Description |
|---|---|
| `IPRNG` | Type for a PRNG function returning `[0, 1)` |
| `SetPRNG(prng)` | Replaces the global PRNG used by all random functions |
| `GetPRNG()` | Returns the current global PRNG |
| `RandomInt(min, max)` | Inclusive integer; returns `NaN` if `min > max` |
| `RandomFloat(min, max)` | Float in `[min, max)`; returns `NaN` if `min >= max` |
| `RandomBool(probability?)` | Boolean with given probability; throws `RangeError` if out of `[0, 1]` |
| `RandomChoice(array)` | Picks one element; returns `undefined` for empty arrays |
| `RandomSample(array, count)` | Picks `count` unique elements (partial Fisher-Yates) |
| `RandomShuffle(array, clone?)` | Fisher-Yates shuffle; mutates in place unless `clone=true` |
| `RandomNormal(mean?, std?)` | Box-Muller Gaussian; never throws |

### Vectors (`vectors/`)

**Types and schemas:** `TVector`, `TVector2`, `TVector3`, `TVector4`, `TAnyVector`, `TVectorResult<T>`, `TVectorSameSize`, `VECTOR_SCHEMA`, `VECTOR2_SCHEMA`, `VECTOR3_SCHEMA`, `VECTOR4_SCHEMA`, `VECTOR_NONEMPTY_SCHEMA`, `VECTOR_SAME_SIZE_SCHEMA`

**Guards:** `AssertVector`, `AssertVector2`, `AssertVector3`, `AssertVector4`, `AssertVectorSameSize`, `AssertVectorNonZero`, `ValidateVector`, `ValidateVector2`, `ValidateVector3`, `ValidateVector4`, `ValidateVectorSameSize`, `VectorError`

**Core:** `VectorAdd`, `VectorSubtract`, `VectorMultiply`, `VectorDivide`, `VectorScale`, `VectorDot`, `VectorNormalize`, `VectorMagnitude`, `VectorDistance`, `VectorDistanceSquared`, `VectorNegate`, `VectorAbs`, `VectorAngle`, `VectorClamp`, `VectorLimit`, `VectorFloor`, `VectorCeil`, `VectorRound`, `VectorMin`, `VectorMax`, `VectorEquals`, `VectorClone`, `VectorIsZero`, `VectorIsFinite`, `VectorToString`, `VectorReflect`, `VectorProject`, `VectorGramSchmidt`, `Vector2Rotate`, `Vector2FromAngle`, `Vector2Cross`, `Vector3Cross`, `VectorCrossMagnitude`, `Vector3Reflect`, `Vector3Reject`, `Vector3ScalarTripleProduct`, `Vector3TripleProduct`, `VectorMidpoint`, `VectorMoveTowards`, `Vector2AngleSigned`, `Vector3AngleSigned`, `VectorIsNormalized`, `Vector3ProjectOnPlane`, `Vector3RotateAround`, `VectorManhattanDistance`, `VectorChebyshevDistance`

**Interpolation wrappers:** `VectorLERP`, `VectorSmoothStep`, `VectorSmootherStep`, `VectorCosineInterpolation`, `VectorSphericalLinearInterpolation`, `VectorCatmullRomInterpolation`, `VectorHermiteInterpolation`, `VectorStepInterpolation`, plus `VectorQuadraticEaseIn/Out/InOut`, `VectorCubicEaseIn/Out/InOut`, `VectorSineEaseIn/Out/InOut`, `VectorExponentialEaseIn/Out/InOut`, `VectorCircularEaseIn/Out/InOut`, `VectorElasticEaseIn/Out/InOut`, `VectorBackEaseIn/Out/InOut`, `VectorBounceEaseIn/Out/InOut`

**Predefined constants:** `VectorZero(size)`, `VectorOne(size)`, `Vector2Up/Down/Left/Right`, `Vector3Up/Down/Left/Right/Forward/Backward`, `Vector4Up/Down/Left/Right/Forward/Backward`

### Matrices (`matrices/`)

**Types and schemas:** `TMatrix`, `TMatrix1`–`TMatrix4`, `TMatrixAll`, `TMatrixSquare`, `TMatrixResult<T>`, `TLUDecompositionResult`, `TQRDecompositionResult`, `TEigenDecompositionResult`, `TSVDDecompositionResult`, `MATRIX_SCHEMA`, `MATRIX1_SCHEMA`–`MATRIX4_SCHEMA`, `MATRIX_SQUARE_SCHEMA`

**Guards:** `AssertMatrix`, `AssertMatrix1`–`AssertMatrix4`, `AssertMatrixSquare`, `AssertMatricesCompatible`, `ValidateMatrix`, `ValidateMatrix1`–`ValidateMatrix4`, `ValidateMatrixSquare`, `MatrixError`

**Core:** `MatrixCreate`, `MatrixIdentity`, `MatrixClone`, `MatrixEquals`, `MatrixTranspose`, `MatrixMap`, `MatrixSize`, `MatrixSizeSquare`, `MatrixToString`, `MatrixTrace`, `MatrixRank`, `MatrixIsZero`, `MatrixIsIdentity`, `MatrixIsSymmetric`, `MatrixIsDiagonal`, `MatrixIsFinite`

**Arithmetic:** `MatrixAdd`, `MatrixSubtract`, `MatrixMultiply`, `MatrixSubmatrix`, `MatrixPad`, `MatrixCombine`, `MatrixCofactorElement`

**Linear algebra:** `MatrixDeterminant`, `MatrixInverse`, `MatrixMinor`, `MatrixCofactor`, `MatrixAdjoint`, `MatrixGramSchmidt`, `MatrixNullSpace`, `MatrixPseudoInverse`, `MatrixConditionNumber`, `MatrixIsInvertible`, `MatrixLeastSquares`, `MatrixPower`, `MatrixKronecker`

**Decompositions:** `MatrixCholesky`, `MatrixEigen`, `MatrixLU`, `MatrixQR`, `MatrixSVD`, `MatrixSolve`, and result types `TEigenDecompositionResult`, `TLUDecompositionResult`, `TQRDecompositionResult`, `TSVDDecompositionResult`

**Transformations:** `MatrixTranslation2D`, `MatrixTranslation3D`, `MatrixScale2D`, `MatrixScale3D`, `MatrixRotation2D`, `MatrixRotation3D`, `MatrixRotation3DRoll`, `MatrixRotation3DPitch`, `MatrixRotation3DYaw`, `MatrixRotation3DEulerAngles`, `MatrixTRS`, `MatrixDecomposeTRS`, `MatrixTransform2D`, `MatrixTransform3D`, `MatrixDirection3D`, `MatrixView`, `MatrixLookAt`, `MatrixPerspective`, `MatrixOrthographic`, `MatrixShear2D`, `MatrixShear3D`, `MatrixReflection2D`

**Norms:** `MatrixNormalize`, `MatrixFrobeniusNorm`, `MatrixSpectralNorm`, `Matrix1Norm`, `MatrixInfinityNorm`, `MatrixNuclearNorm`, `MatrixMaxNorm`, `MatrixPNorm`

**Normalization predicates:** `MatrixIsOrthogonal`, `MatrixIsPositiveDefinite`

Note: `MatrixEigenQRIteration` is a private internal helper inside `MatrixEigen`. It is not exported and not part of the public API.

### Quaternions (`quaternions/`)

**Types and schemas:** `TQuaternion`, `TEulerAngles`, `TAxisAngle`, `TRotationMatrix`, `TRotation`, `QUATERNION_SCHEMA`, `EULER_ANGLES_SCHEMA`, `AXIS_ANGLE_SCHEMA`, `ROTATION_MATRIX_SCHEMA`

**Guards:** `AssertQuaternion`, `AssertNormalizedQuaternion`, `AssertEulerAngles`, `AssertAxisAngle`, `AssertRotationMatrix`, `AssertQuaternions`, `ValidateQuaternion`, `ValidateNormalizedQuaternion`, `ValidateEulerAngles`, `ValidateAxisAngle`, `ValidateRotationMatrix`, `ValidateQuaternions`, `QuaternionError`

**Core:** `QuaternionIdentity`, `QuaternionClone`, `QuaternionEquals`, `QuaternionMagnitude`, `QuaternionNormalize`, `QuaternionConjugate`, `QuaternionInverse`, `QuaternionMultiply`, `QuaternionFromAxisAngle`, `QuaternionFromAxisAngleVector`, `QuaternionToAxisAngle`, `QuaternionFromEuler`, `QuaternionToEuler`, `QuaternionRotateVector`, `QuaternionSLERP`, `QuaternionIsFinite`, `QuaternionDot`, `QuaternionAngleBetween`, `QuaternionFromToRotation`, `QuaternionRotateTowards`

**Conversions:** `QuaternionFromRotationMatrix`, `QuaternionToRotationMatrix`, `QuaternionFromTransformationMatrix`, `QuaternionToTransformationMatrix`, `IsValidRotationMatrix`, `QuaternionLookRotation`

**Interpolation:** `QuaternionNLERP`, `QuaternionSQUAD`, `QuaternionCreatePath`

**Predefined:** `QuaternionRotationX`, `QuaternionRotationY`, `QuaternionRotationZ`

### Not public

`src/internal/guards.ts` and `src/internal/make-validate.ts` are internal. Their exports (`AssertNumber`, `AssertArray`, `AssertInstanceOf`, `AssertNotEquals`, `makeValidate`, `INumberConstraints`, `IArrayConstraints`, `IExceptionDetails`) do not appear in `src/index.ts` and are not part of the consumer API.

---

## 5. Coding Patterns

### ESM relative imports

All relative imports must use the `.js` extension even though source files are `.ts`. This is an ESM runtime requirement enforced by `nodenext` module resolution.

```typescript
import { AssertVector } from '../internal/guards.js';  // correct
import { AssertVector } from '../internal/guards';      // wrong — breaks at runtime
```

### import type

Use `import type` for type-only imports. ESLint enforces `@typescript-eslint/consistent-type-imports` as an error.

```typescript
import type { TVector3 } from './types.js';
```

### readonly

All class properties are `readonly` by default. Mutate only when explicitly necessary.

### Prohibited syntax

The following are ESLint errors in this repo:

- `@ts-ignore` — use a proper type guard instead
- `as Type` casts — use type guards or assertion functions. **One accepted exception:** narrowing a freshly-constructed generic result to its concrete result type (e.g. `result as TVectorResult<T>` or `result as TMatrixResult<T>`) when TypeScript cannot infer the conditional type. This pattern is used throughout the source. All other `as` casts remain prohibited.
- `!` non-null assertions — guard explicitly
- `any` — use `unknown` with type guards
- `console.*` — no console logging in library code

### JSDoc requirements

All exported symbols require JSDoc with:
- Description
- `@param name -` (dash separator after name)
- `@returns`
- `@throws {ErrorClass}` for every thrown error type
- `@example` with a fenced TypeScript code block

### Style

Tabs (not spaces), single quotes (avoidEscape), semicolons always, `comma-dangle: 'never'`. These are enforced by `@stylistic/eslint-plugin`.

---

## 6. Common Gotchas

### Quaternion Infinity-allowed / NaN-rejected

`AssertQuaternion` rejects NaN but **intentionally permits Infinity**. The same policy applies to `AssertEulerAngles`, `AssertAxisAngle`, and `AssertRotationMatrix`. This is documented in the source code with explicit comments. Do not add `Number.isFinite` checks to these guards.

### Non-finite rejection in vector interpolation and angle helpers

The vector interpolation functions (`VectorSphericalLinearInterpolation`, `VectorCatmullRomInterpolation`, `VectorHermiteInterpolation`) and the angle helpers (`FormatRadians`, `NormalizeRadians`, `NormalizeDegrees`) reject non-finite inputs (NaN and Infinity) via `AssertNumber(x, { finite: true })`. This is the opposite of the quaternion policy — both are intentional.

### No deep imports

Consumers must import from `@pawells/math-extended` only. There is no supported deep-import path. The package `exports` map in `package.json` exposes only the root `.`.

### nodenext module resolution

This repo uses `module: "nodenext"` and `moduleResolution: "nodenext"` in `tsconfig.base.json`. This differs from some other `@pawells/` repos that use `"bundler"`. Consequences: `.js` extensions on all relative imports are mandatory, and `import type` is enforced.

### NX result caching can mask failures

NX caches task results by default. If you suspect a stale cache hit (e.g., a test passes when it should not), append `--skip-nx-cache`:

```bash
yarn nx run @pawells/math-extended:test --skip-nx-cache
yarn nx run @pawells/math-extended:typecheck --skip-nx-cache
```

### Vitest does not type-check

Vitest runs tests without type checking. A test file can pass even with type errors. Always run `yarn typecheck` separately:

```bash
yarn typecheck && yarn test:coverage
```

### RandomInt vs RandomFloat NaN boundary

`RandomInt` returns `NaN` when `min > max`. `RandomFloat` returns `NaN` when `min >= max` (zero-width interval also invalid). Guard for `NaN` in callers that pass dynamic bounds.

### MatrixSpectralNorm and MatrixNuclearNorm cost

Both functions compute a full SVD internally (O(n³) or worse). Prefer `MatrixFrobeniusNorm` when an exact spectral or nuclear norm is not required.

### ScalarError vs RangeError in scalar.ts

`scalar.ts` uses two different error types. `ScalarError` is thrown for domain constraint failures that have no sensible result (e.g., degenerate interval in `InverseLerp`/`Remap`, empty array in `Mean`/`Variance`/`Median`). Built-in `RangeError` is thrown for invalid input values that violate numeric contracts (e.g., non-finite inputs to `Lerp`/`MoveTowards`, non-integer arguments to `Gcd`/`Lcm`/`Factorial`, `step === 0` in `Range`, `length <= 0` in `Repeat`/`PingPong`). Both classes are thrown by public API functions in this module — callers must handle both.

### Finiteness predicates do not route through Assert*

`VectorIsFinite`, `MatrixIsFinite`, and `QuaternionIsFinite` perform their own structural validation and then check finiteness directly, without calling `AssertVector`/`AssertMatrix`/`AssertQuaternion`. They return `false` (not throw) when any component is `NaN` or `Infinity`. Structural errors (wrong type, wrong length, NaN components in the structure check) still throw the domain error. In particular, `QuaternionIsFinite` returns `false` for a quaternion containing `Infinity` even though `AssertQuaternion` permits `Infinity` — the two functions enforce different contracts.

---

## 7. Testing Notes

### Framework

Vitest, configured via `@nx/vite`. Tests run in `forks` pool with `maxForks=2` and `fileParallelism=false` (see `nx.json` targetDefaults).

### Colocated spec files

Test files sit next to the source they test:

```
src/vectors/core.ts
src/vectors/core.spec.ts
```

### Coverage threshold

All four metrics must meet 80%: lines, functions, branches, statements. Coverage is enforced by `yarn test:coverage` and checked in CI.

### Running tests

```bash
# Run all tests once (no watch)
yarn test --run

# Run all tests with coverage
yarn test:coverage

# Target a single test file (from repo root)
yarn nx run @pawells/math-extended:test -- --run src/vectors/core.spec.ts

# Target a single test file (from packages/math-extended/)
yarn vitest --run src/vectors/core.spec.ts

# Force a real run, bypassing NX cache
yarn nx run @pawells/math-extended:test --skip-nx-cache -- --run
```

### Deterministic random tests

The global PRNG is swappable. Use `SetPRNG` and `GetPRNG` to install a seeded deterministic generator around random-dependent tests, then restore the original:

```typescript
import { SetPRNG, GetPRNG } from '@pawells/math-extended';

const original = GetPRNG();
SetPRNG(() => 0.5); // deterministic
// ... run test ...
SetPRNG(original);  // restore
```
