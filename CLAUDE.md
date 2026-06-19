# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Identity

Single-package NX monorepo. Root workspace: `@pawells/math-extended-workspace` (private). One publishable package: `@pawells/math-extended` v3.0.1, MIT. ESM-only (`"type": "module"`). Node >= 22.0.0; `.nvmrc` = 24.

## Commands

All root scripts map to `yarn nx run-many --target=X --all` (effectively targets the single package).

```bash
yarn build             # tsc via @nx/js/typescript → packages/math-extended/dist/
yarn typecheck
yarn lint
yarn lint:fix
yarn test              # Vitest — watch mode by default
yarn test:coverage     # Vitest + coverage (80% threshold on all 4 metrics)
yarn clean
```

**Run tests once (no watch):**
```bash
yarn test --run
```

**Target a single test file:**
```bash
# From repo root:
yarn nx run @pawells/math-extended:test -- --run src/vectors/core.spec.ts
# Or from packages/math-extended/:
yarn vitest --run src/vectors/core.spec.ts
```

**Single package NX target:**
```bash
yarn nx run @pawells/math-extended:build
```

**Full CI pipeline (no `yarn pipeline` script — run in sequence):**
```bash
yarn typecheck && yarn lint && yarn test:coverage && yarn build
```

**Affected only:**
```bash
yarn nx affected --target=test
```

## Toolchain

- Yarn Berry 4.16.0 via corepack; `.yarnrc.yml` nodeLinker: `node-modules`; CI uses `yarn install --immutable`
- NX ~22.7.5: `@nx/js/typescript` (build/typecheck), `@nx/eslint/plugin` (lint), `@nx/vite` + vitest (test)
- Vitest pool: forks, maxForks=2, fileParallelism=false (nx.json targetDefaults)
- No Prettier — `.prettierrc` exists but Prettier is not installed; ESLint owns all formatting

## TypeScript Config Layering

This repo uses `nodenext` module resolution (differs from some org defaults that use `bundler`).

- `tsconfig.base.json` — shared: ES2022 target, `module`/`moduleResolution`: `nodenext`, strict + declaration + declarationMap + sourceMap + composite + esModuleInterop + isolatedModules + noUnusedLocals/Parameters + noImplicitReturns + noFallthroughCasesInSwitch + skipLibCheck
- Root `tsconfig.json` — project references only
- Per package: `tsconfig.json` references `tsconfig.lib.json` (build: rootDir `src/`, outDir `dist/`) and `tsconfig.spec.json` (includes `*.spec.ts`/`*.test.ts`, vitest globals)

## ESLint (flat config, `eslint.config.mjs`)

Key rules enforced as errors: `@typescript-eslint/no-explicit-any`, `no-floating-promises`, `no-non-null-assertion`, `consistent-type-imports`, `no-console`.

Style: tabs, single quotes (avoidEscape), semicolons always, `comma-dangle: 'never'`, interface member delimiter `semi`.

## Code Architecture

Public API: single barrel at `packages/math-extended/src/index.ts`. Consumers import only from the package root — no deep imports.

Four functional domains under `packages/math-extended/src/`, each following the same internal shape (`types.ts` + Zod schemas, `core.ts`, domain modules, `asserts.ts`, `index.ts`):

- **vectors/** — `TVector`/`TVector2`–`TVector4`; arithmetic, dot/cross, normalize, lerp, predefined constants
- **matrices/** — `TMatrix1`–`TMatrix4` (`number[][]`); arithmetic, linear-algebra (det/inverse/rank), decompositions (LU/QR/Cholesky/Eigen/SVD), transformations (TRS, perspective/ortho/view), normalization
- **quaternions/** — `TQuaternion` `[x,y,z,w]`; Hamilton product, conjugate/inverse, Euler/axis-angle/matrix conversions, SLERP/NLERP/SQUAD
- **interpolation.ts / angles.ts** — scalar easing families; radian/degree helpers

**Cross-cutting patterns — preserve these when editing:**

1. **Immutability** — every operation returns a new value; never mutate inputs
2. **Runtime validation** — each domain exports Zod schemas (e.g. `VECTOR_SCHEMA`) and `asserts.ts` guards (`Assert*`/`Validate*`); custom error classes (`VectorError`, `MatrixError`, `QuaternionError`) carry a `code: string` property and chain `{ cause: originalError }`
3. **ESM relative imports** — use `.js` extension on all relative imports (e.g. `from './core.js'`)
4. **Colocated tests** — `*.spec.ts` files sit next to the source they test

Runtime dependencies: `@pawells/typescript-common`, `zod` (~4.4.3), `tslib`.

## CI/CD

- **CI** (`.github/workflows/ci.yml`): pushes to `main`/`development/**`, PRs to `main`. Node 24, `HUSKY=0`, `NX_DAEMON=false`. Steps: typecheck → lint → test:coverage → build.
- **Publish** (`.github/workflows/publish.yml`): triggered by `v*` tag. Runs CI, then `yarn nx run-many -t publish` with OIDC provenance (`id-token: write`), creates GitHub Release.
- **Husky**: pre-commit runs lint + typecheck (`run-many --all`); commit-msg hook present.
