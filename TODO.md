# TODO - capture-service

States: `[ ]` pending - `[~]` partial or unverified - `[!]` blocked - `[x]`
verified complete - `[-]` obsolete or superseded.

## Gate debt (2026-10-11)

- [!] **Reconcile historical normalized keys before deploying the blank-query
  fix.** Existing service rows with blank or bare identity parameters, including
  a blank value before a nonempty repeated value, may carry a different key than
  the Python index. A read-only audit on 2026-10-21 using the existing
  application pool and local environment was rejected with
  ER_ACCESS_DENIED_ERROR before any rows were read; no credentials were changed
  or printed. Blocked on a working supported read-only database connection. Then
  count affected rows and potential collisions, and design a recoverable re-key
  if needed. Do not infer stored-data parity from the 18 synthetic cases,
  rebuild an index, merge captures or mutate production rows automatically.
  Eight database integration cases remain unexecuted without a configured
  isolated database; production is not a test fixture.
- [!] **Review existing ESLint 10 peer compatibility warnings.**
  `pnpm peers check` reports eslint-plugin-jsx-a11y 6.10.2, eslint-plugin-react
  7.37.5 and eslint-plugin-import 2.32.0 declaring support only through ESLint 9
  while 10.12.0 is installed. Current lint passes; investigate
  upstream-compatible releases before changing the stack. Do not suppress the
  warning or downgrade dependencies as part of the URL/security repair.

  - Registry verification 2026-10-21:
    `pnpm view <plugin> version peerDependencies --json` confirms 6.10.2, 7.37.5
    and 2.32.0 are still the latest releases and their declared ranges exclude
    ESLint 10. Blocked on upstream releases with compatible peer declarations;
    current lint remains green.

## Daily round

Filed by `~/p/bin/daily`; one bullet per finding, updated in place while it
repeats.
