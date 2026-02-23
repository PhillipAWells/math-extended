# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

`@pawells/math-extended` is a shared TypeScript math utility library published to npm. It targets ES2022, is distributed as ESM, and has one runtime dependency (`@pawells/typescript-common`). The library exports from a single entry point (`src/index.ts`) which re-exports from seven domain modules.

## Commands

```bash
# Build & Run
yarn build            # Compile TypeScript → ./build/
yarn dev              # Build and run (tsc && node build/index.js)
yarn watch            # TypeScript watch mode
yarn start            # Run built output

# Code Quality
yarn typecheck        # Type check without emitting
yarn lint             # ESLint check (src/)
yarn lint:fix         # ESLint with auto-fix

# Testing
yarn test             # Run Vitest tests once
yarn test:ui          # Open interactive Vitest UI in a browser
yarn test:coverage    # Run tests with coverage report (70% minimum)
```

To run a single test file: `yarn vitest run src/path/to/file.test.ts`

## Architecture

All source lives under `src/` and is compiled to `./build/` by `tsc`. The suite currently has **1077 tests**.

**Entry point** (`src/index.ts`): The single public export surface with both:
- **Namespace exports** (`VectorUtils`, `MatrixUtils`, `QuaternionUtils`) for grouped imports
- **Direct named exports** for tree-shaking optimization

All utilities, helpers, and types intended for consumers must be re-exported from this file.

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

## ESLint Configuration

Modern ESLint flat config (`eslint.config.mjs`) with:
- **TypeScript-specific rules** (`@typescript-eslint/eslint-plugin`)
- **Stylistic rules** (`@stylistic/eslint-plugin`) — tabs, single quotes, semicolons, trailing commas
- **Import management** — sorted imports, cycle detection, unused imports removal
- **Test relaxations** (`.test.ts`, `.spec.ts`) — disabled strict naming in tests

Key enforced conventions:
- Classes/Interfaces/Types: **PascalCase**
- Functions: **PascalCase**
- Constants: **UPPER_CASE**
- Tabs for indentation, single quotes, explicit return types

Configuration file: `eslint.config.mjs`
Ignore file: `.eslintignore`
ESLint commands: `yarn lint`, `yarn lint:fix`

## CI/CD

Single workflow (`.github/workflows/ci.yml`) triggered on push to `main`, PRs to `main`, and `v*` tags:
- **Push to `main` / PR**: typecheck → lint → test → build
- **Push `v*` tag**: typecheck → lint → test → build → publish to npm (with provenance) → create GitHub Release

## Compliance & Documentation

**Template Compliance**: ~95% aligned with `lib/library.template.md`

Key compliance files:
- `.gitignore` — Build, dependencies, IDE, testing, logs, temp files
- `.npmignore` — Published package includes only: `build/`, `README.md`, `LICENSE`, `package.json`
- ESLint configuration — Flat config with TypeScript, stylistic, and import rules
- Test coverage — 70% minimum enforced via Vitest
- Documentation — See `GAP_ANALYSIS.md` for any remaining template gaps

Published scope: `@pawells/math-extended` on npm (public access)
