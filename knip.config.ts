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
 * Only `route.ts` is listed as an entry, and that is the whole truth about this
 * service: no page, no layout, no middleware, because it renders nothing. The
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
  entry: ['src/app/**/route.ts', 'src/**/*.test.ts', 'scripts/*.mjs'],
  project: ['src/**/*.{ts,tsx}'],
})
