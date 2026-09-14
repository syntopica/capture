import { createKnipConfig } from '@syntopica/quality-config/knip'

/**
 * The baseline's Next.js preset assumes the App Router lives at `app/` in the
 * repository root. This project keeps it at `src/app/`, so every entry and
 * project pattern the preset ships matched nothing - and knip exited 0 having
 * inspected no source file at all. Left alone that is the worst kind of green:
 * a gate reporting clean because it never looked. Knip says so out loud
 * ("Refine entry pattern (no matches)"), which is worth reading rather than
 * scrolling past. Verified the other way too, with a deliberately dead export.
 *
 * `route.ts` was listed as an entry here until 2026-09-14. Knip 6.35's Next.js
 * plugin registers those files itself, and the two kinds of entry are not
 * equivalent: `includeEntryExports` (the preset sets it true) reaches an entry
 * the project declares but not one a plugin registers. So listing them turned
 * every route handler into a reported dead export - `POST`, `PATCH` and two
 * `GET`s - because nothing in the repository imports what the framework calls.
 * Dropping the glob leaves the files analysed exactly as before, verified two
 * ways: no route reports as an unused file, and a probe export added to
 * `src/utils/url/isHttpsUrl.ts` still fails the gate. What is genuinely lost is
 * dead-export detection inside the route files themselves, where the exports
 * are the framework's contract and the file is little else.
 *
 * No page, no layout, no middleware, because this service renders nothing. The
 * preset's patterns for those are dropped rather than carried as decoration,
 * and config files are left out because knip's own plugins already treat them
 * as entries.
 *
 * `Object.assign` rather than a spread: `KnipConfig` is a union that includes a
 * callable form, and spreading it trips `no-misused-spread` - the rule is right
 * that spreading a maybe-function is a bug waiting to happen, even though this
 * value is an object.
 */
export default Object.assign(createKnipConfig({ framework: 'nextjs' }), {
  entry: ['src/**/*.test.ts', 'scripts/*.mjs'],
  project: ['src/**/*.{ts,tsx}'],
})
