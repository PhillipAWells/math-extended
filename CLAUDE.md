@AGENTS.md

## Commands

All root scripts map to `yarn nx run-many --target=X --all`.

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

**Force real run (bypass NX cache):**
```bash
yarn nx run @pawells/math-extended:test --skip-nx-cache
```

## CI/CD

- **CI** (`.github/workflows/ci.yml`): pushes to `main`/`development/**`, PRs to `main`. Node 24, `HUSKY=0`, `NX_DAEMON=false`. Steps: typecheck → lint → test:coverage → build.
- **Publish** (`.github/workflows/publish.yml`): triggered by `v*` tag. Runs CI, then `yarn nx run-many -t publish` with OIDC provenance (`id-token: write`), creates GitHub Release.
- **Husky**: pre-commit runs lint + typecheck (`run-many --all`); commit-msg hook present.
