# TODO - brain-capture

States: `[ ]` pending - `[~]` partial or unverified - `[!]` blocked - `[x]`
verified complete - `[-]` obsolete or superseded.

## Baseline gate debt

- [x] **Cobertura de tipos al 96.93%, el liston compartido es 99%.** `dupes`,
      `knip` y `deps:graph` pasaron limpios; este es el unico gate que no llega.
      25 expresiones sin cubrir, 18 de ellas en
      `src/services/captures/captureFromRow.ts` -- un mapper de filas de base de
      datos, o sea un borde real con el driver, no dejadez. `type-coverage`
      corre con `--at-least 96.9`, que congela el estado actual: la cobertura ya
      no puede bajar, y el numero en `package.json` es la deuda, visible en
      cualquier diff que lo toque. Tipar la fila en `captureFromRow.ts` es lo
      que sube el numero; al hacerlo, subir tambien el `--at-least` y borrar
      esta entrada cuando llegue a 99. Done 2026-09-08:
      `src/types/captures/CaptureRow.ts` names the columns from `schema.sql`,
      `captureFromRow` and both queries use it, and the `--at-least` override is
      gone so the shared 99% bar enforces. `pnpm type-coverage`: 805 / 813,
      99.01%. The 8 left are `as` casts, and the margin is one cast: the next
      `as` in `src/` drops the gate below 99.

## Gates red on `main` before this branch

- [ ] **`pnpm type-check` fails with TS4111 in four files that never changed.**
      `@busirocket/tsconfig` 0.3.0 sets `noPropertyAccessFromIndexSignature`, so
      every `process.env.X` in `src/db/capturePool.ts`,
      `src/utils/captures/clipsRepositoryUrl.ts` and the two integration tests
      must become `process.env['X']`. Nine errors, verified on a clean archive
      of HEAD on 2026-09-08. `check:ci` runs `type-check` first, so CI is red
      until this lands.
- [ ] **`pnpm knip` fails: `gitleaks` is an unlisted binary and
      `@commitlint/cli` an unused devDependency.** Verified on a clean archive
      of HEAD on 2026-09-08. `secrets:check` calls `gitleaks` without a package
      that provides it; either list it under `ignoreBinaries` in
      `knip.config.ts` with the reason, or install it as a dependency.
      `dependency-cruiser` can also leave `ignoreDependencies`, per knip's own
      hint.

## Daily round

Filed by `~/p/bin/daily`; one bullet per finding, updated in place while it
repeats.

## Shared package scope migration (2026-09-14)

- [ ] After the owner publishes the renamed shared packages, regenerate the lockfile and run the existing repository quality gate. Source references now use the new scope; the lockfile is intentionally unchanged because the packages are not available offline.
