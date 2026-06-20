# AGENTS.md — @pawells/math-extended

Primary reference for AI agents working in this repository. Read this file before making any change.

---

## 1. Overview

`@pawells/math-extended` is an extended mathematical utilities library for TypeScript. It provides vectors, matrices, quaternions, scalar interpolation and easing, angle conversions, clamping, and seedable random helpers.

- **Package:** `@pawells/math-extended` v3.0.1
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

Scalar utilities at `src/` root: `angles.ts`, `clamp.ts`, `core.ts`, `interpolation.ts`, `random.ts`.

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

| Class | Domain | `static Code` constant |
|---|---|---|
| `VectorError` | vectors | `VECTOR_ERROR` |
| `MatrixError` | matrices | `MATRIX_ERROR` |
| `QuaternionError` | quaternions | `QUATERNION_ERROR` |

All three extend `BaseError` from `@pawells/typescript-common`. Every error has:
- A `code: string` property (accessed via inherited `Code` getter)
- Optional cause chaining via `{ cause: originalError }` in the constructor options

Scalar utilities (`random.ts`) intentionally throw built-in `RangeError` rather than a domain error class — there is no `ScalarError`.

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

### Clamp (`clamp.ts`)

| Export | Description |
|---|---|
| `Clamp(value, min, max)` | Clamps a number to `[min, max]` |

### Core (`core.ts`)

| Export | Description |
|---|---|
| `CubeRoot(value)` | Sign-preserving cube root |

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

**Core:** `VectorAdd`, `VectorSubtract`, `VectorMultiply`, `VectorDivide`, `VectorScale`, `VectorDot`, `VectorCross`, `VectorNormalize`, `VectorMagnitude`, `VectorDistance`, `VectorNegate`, `VectorClamp`, `VectorFloor`, `VectorCeil`, `VectorRound`, `VectorMin`, `VectorMax`, `VectorEquals`, `VectorClone`, `Vector3Reject`

**Interpolation wrappers:** `VectorLinearInterpolation`, `VectorSmoothStep`, `VectorSmootherStep`, `VectorCosineInterpolation`, `VectorSphericalLinearInterpolation`, `VectorCatmullRomInterpolation`, `VectorHermiteInterpolation`, plus `VectorEaseIn`/`VectorEaseOut`/`VectorEaseInOut` variants for all easing families

**Predefined constants:** `VectorZero`, `VectorOne`, `Vector2Up/Down/Left/Right`, `Vector3Up/Down/Left/Right/Forward/Backward`, `Vector4Zero/One`

### Matrices (`matrices/`)

**Types and schemas:** `TMatrix`, `TMatrix1`–`TMatrix4`, `TMatrixAll`, `TMatrixSquare`, `TMatrixResult<T>`, `MATRIX_SCHEMA`, `MATRIX1_SCHEMA`–`MATRIX4_SCHEMA`, `MATRIX_SQUARE_SCHEMA`

**Guards:** `AssertMatrix`, `AssertMatrix1`–`AssertMatrix4`, `AssertMatrixSquare`, `ValidateMatrix`, `ValidateMatrix1`–`ValidateMatrix4`, `ValidateMatrixSquare`, `MatrixError`

**Core:** `MatrixAdd`, `MatrixSubtract`, `MatrixMultiply`, `MatrixTranspose`, `MatrixIdentity`, `MatrixSize`, `MatrixSizeSquare`, `MatrixIsSquare`, `MatrixEquals`, `MatrixClone`, `MatrixSubmatrix`, `MatrixCofactorElement`

**Linear algebra:** `MatrixDeterminant`, `MatrixInverse`, `MatrixRank`, `MatrixTrace`, `MatrixNullSpace`

**Decompositions:** `MatrixCholesky`, `MatrixEigen`, `MatrixLU`, `MatrixQR`, `MatrixSVD`, `MatrixSolve`, and result types `TEigenDecompositionResult`, `TLUDecompositionResult`, `TQRDecompositionResult`, `TSVDDecompositionResult`

**Transformations:** `MatrixTranslation2D`, `MatrixTranslation3D`, `MatrixScale2D`, `MatrixScale3D`, `MatrixRotation2D`, `MatrixRotationX`, `MatrixRotationY`, `MatrixRotationZ`, `MatrixTRS`, `MatrixPerspective`, `MatrixOrthographic`, `MatrixLookAt`

**Normalization:** `MatrixNormalize`, `MatrixFrobeniusNorm`, `MatrixSpectralNorm`, `MatrixNuclearNorm`, `MatrixGramSchmidt`, `Matrix_PseudoInverse`

Note: `MatrixEigenQRIteration` is a private internal helper inside `MatrixEigen`. It is not exported and not part of the public API.

### Quaternions (`quaternions/`)

**Types and schemas:** `TQuaternion`, `TEulerAngles`, `TAxisAngle`, `TRotationMatrix`, `TRotation`, `QUATERNION_SCHEMA`, `EULER_ANGLES_SCHEMA`, `AXIS_ANGLE_SCHEMA`, `ROTATION_MATRIX_SCHEMA`

**Guards:** `AssertQuaternion`, `AssertNormalizedQuaternion`, `AssertEulerAngles`, `AssertAxisAngle`, `AssertRotationMatrix`, `AssertQuaternions`, `ValidateQuaternion`, `ValidateNormalizedQuaternion`, `ValidateEulerAngles`, `ValidateAxisAngle`, `ValidateRotationMatrix`, `ValidateQuaternions`, `QuaternionError`

**Core:** `QuaternionIdentity`, `QuaternionClone`, `QuaternionEquals`, `QuaternionMagnitude`, `QuaternionNormalize`, `QuaternionConjugate`, `QuaternionInverse`, `QuaternionMultiply`, `QuaternionFromAxisAngle`, `QuaternionFromAxisAngleVector`, `QuaternionToAxisAngle`, `QuaternionFromEuler`, `QuaternionToEuler`, `QuaternionRotateVector`, `QuaternionSLERP`

**Conversions:** `QuaternionFromRotationMatrix`, `QuaternionToRotationMatrix`, `QuaternionFromTransformationMatrix`, `QuaternionToTransformationMatrix`, `IsValidRotationMatrix`

**Interpolation:** `QuaternionNLERP`, `QuaternionSQUAD`

**Predefined:** `QuaternionIdentityConstant`

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
- `as Type` casts — use type guards or assertion functions
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
