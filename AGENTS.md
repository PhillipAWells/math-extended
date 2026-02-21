# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

`@pawells/math-extended` is a shared TypeScript math utility library published to npm. It targets ES2022, is distributed as ESM, and has one runtime dependency (`@pawells/typescript-common`). The library exports from a single entry point (`src/index.ts`) which re-exports from seven domain modules.

## Commands

```bash
yarn build            # Compile TypeScript → ./build/
yarn dev              # Build and run (tsc && node build/index.js)
yarn watch            # TypeScript watch mode
yarn typecheck        # Type check without emitting
yarn lint             # ESLint src/
yarn lint:fix         # ESLint with auto-fix
yarn test             # Run Vitest tests
yarn test:ui          # Open interactive Vitest UI in a browser
yarn test:coverage    # Run tests with coverage report
yarn start            # Run built output
```

To run a single test file: `yarn vitest run src/path/to/file.test.ts`

## Architecture

All source lives under `src/` and is compiled to `./build/` by `tsc`. The suite currently has **1077 tests**.

**Entry point** (`src/index.ts`): The single public export surface. All utilities, helpers, and types intended for consumers must be re-exported from this file.

### Module structure

| Module | Source files | Description |
|--------|-------------|-------------|
| `angles` | `src/angles.ts` | Degree/radian conversion and normalization |
| `clamp` | `src/clamp.ts` | Numeric clamping |
| `interpolation` | `src/interpolation.ts` | Scalar interpolation and 30+ easing functions |
| `random` | `src/random.ts` | Random numbers, choices, sampling, shuffling |
| `vectors` | `src/vectors/` (5 files) | N-dimensional vector math |
| `matrices` | `src/matrices/` (8 files) | Matrix arithmetic, decompositions, transforms |
| `quaternions` | `src/quaternions/` (6 files) | Quaternion math for 3D rotations |

**Vectors sub-modules**: `types`, `core`, `asserts`, `interpolation`, `predefined`
**Matrices sub-modules**: `types`, `core`, `arithmetic`, `asserts`, `decompositions`, `linear-algebra`, `normalization`, `transformations`
**Quaternions sub-modules**: `types`, `core`, `asserts`, `conversions`, `interpolation`, `predefined`

## Key Patterns

**Adding exports**: Implement new utilities in the relevant `src/` domain file and re-export from the domain `index.ts` (e.g., `src/vectors/index.ts`). The top-level `src/index.ts` already re-exports all domain indexes.

**Runtime dependency**: `@pawells/typescript-common` provides shared assertion helpers (`AssertArray2D`, `SetExceptionMessage`, `ThrowException`, etc.). Add new assertions by composing these primitives. Do **not** add further runtime dependencies.

**ESM only**: The package is `"type": "module"`. Use ESM import/export syntax throughout; avoid CommonJS patterns.

**JSDoc**: All exported functions, types, and classes must have complete JSDoc blocks including `@param`, `@returns`, `@throws`, and at least one `@example`.

## TypeScript Configuration

Requires Node.js 24. Outputs to `./build/`, targets ES2022, module resolution `bundler`. Declaration files (`.d.ts`) and source maps are emitted alongside JS. Strict mode is fully enabled (`strict`, `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`).

## CI/CD

Single workflow (`.github/workflows/ci.yml`) triggered on push to `main`, PRs to `main`, and `v*` tags:
- **Push to `main` / PR**: typecheck → lint → test → build
- **Push `v*` tag**: typecheck → lint → test → build → publish to npm (with provenance) → create GitHub Release
