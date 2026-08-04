import boundaries from 'eslint-plugin-boundaries'

/**
 * The layering this service already follows, checked instead of remembered.
 *
 * Route handlers must be thin - validate, call one service, return a response -
 * which stays true only for as long as nobody reaches past the service layer.
 * The rule that catches that is "routes must not import db": a handler holding
 * the MySQL pool is a handler with business logic in it, and it reads as the
 * convenient thing to do every single time.
 *
 * `utils` staying pure is the other half. Everything under `utils/` is
 * synchronous, deterministic and testable without a database; the moment one of
 * them imports a service that stops being true, and the unit tests that make
 * this repo cheap to change start needing a live MySQL.
 *
 * Written against eslint-plugin-boundaries v7, whose selector shape is not the
 * one older examples use: `from` and `disallow` each take a single object, not
 * an array, and the target sits behind a `to` key -
 * `disallow: { to: { element: { type: 'db' } } }`. A v6-shaped config is
 * accepted without error and matches nothing, so the rule reports clean while
 * enforcing nothing. That is not hypothetical: the first version of this file
 * was written that way, passed, and was caught only by importing the pool into
 * a route on purpose to watch the rule fail to fire. **Any change here gets the
 * same treatment - break it deliberately and confirm it complains.**
 */
export default [
  {
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: true },
      // The patterns do not overlap, and that is why `db` sits at `src/db`
      // rather than under `src/services`. Nested layers meant two patterns
      // matched the same file, `services` won whichever order they were
      // listed in, and every database module classified as an ordinary
      // service - so the route/db policy had nothing to fire on and the rule
      // reported clean while enforcing nothing. Expressing the boundary in
      // the directory tree is also the truer statement: the pool is
      // infrastructure underneath the services, not one of them.
      'boundaries/elements': [
        { type: 'routes', pattern: 'src/app/**', partialMatch: false },
        { type: 'services', pattern: 'src/services/**', partialMatch: false },
        { type: 'db', pattern: 'src/db/**', partialMatch: false },
        { type: 'utils', pattern: 'src/utils/**', partialMatch: false },
        { type: 'types', pattern: 'src/types/**', partialMatch: false },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          policies: [
            {
              from: { element: { type: 'routes' } },
              disallow: { to: { element: { type: 'db' } } },
              message:
                'A route handler must go through a service, never hold the database pool itself.',
            },
            {
              from: { element: { type: 'utils' } },
              disallow: {
                to: { element: { types: { anyOf: ['services', 'db'] } } },
              },
              message:
                'utils/ is pure by contract: no IO, so no service and no database.',
            },
          ],
        },
      ],
    },
  },
]
