import { createBaseConfig } from '@syntopica/eslint-config/base'
import { createCodeQualityConfig } from '@syntopica/eslint-config/code-quality'
import { createNextjsConfig } from '@syntopica/eslint-config/nextjs'
import architecture from './eslint.architecture.js'

// Layer order: base -> framework -> code-quality -> architecture.
//
// The accessibility layer is deliberately absent. This service renders nothing:
// every route is a handler returning JSON and there is not one JSX element in
// the repository, so a11y rules would have no file to fire on and would only
// make the config look like it covers something it does not.
export default [
  ...createBaseConfig({ tsconfigRootDir: import.meta.dirname }),
  ...createNextjsConfig({ tsconfigRootDir: import.meta.dirname }),
  ...createCodeQualityConfig(),
  ...architecture,
  {
    // A `describe` block is a container, not a function with logic, so its
    // length says nothing about complexity - and a repeated literal in a test is
    // the fixture and the assertion at once, which lose their meaning the moment
    // they are hoisted into a shared constant. `normalizeUrl.test.ts` is the
    // clearest case: its repeated URL *is* the thing under test, and naming it
    // would hide the very string the parity contract is about.
    //
    // `max-params` deliberately stays on for tests: it fires on a helper's
    // shape, which is the same signal it carries anywhere else.
    files: ['src/**/*.test.ts'],
    rules: {
      'max-lines-per-function': 'off',
      'sonarjs/no-duplicate-string': 'off',
    },
  },
  {
    // eslint-plugin-react 7.37.5 - the newest there is - crashes on ESLint 10
    // while auto-detecting the React version: `detectReactVersion` calls
    // `context.getFilename()`, removed in ESLint 10, and every file fails with
    // "contextOrFilename.getFilename is not a function" before a single rule
    // runs. Pinning the version here skips detection entirely, which is the
    // only workaround available until the plugin is fixed upstream.
    settings: { react: { version: '19.2.4' } },
  },
]
