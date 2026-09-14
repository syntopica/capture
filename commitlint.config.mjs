// Mirrors createCommitlintConfig() in @syntopica/quality-config/commitlint.
// commitlint reads a config file, not a TypeScript factory, so this file is
// the shape that factory produces - see it for the rationale behind each
// deviation from the conventional preset.
//
// Added 2026-09-14. Both @commitlint packages were already declared here, but
// lefthook.yml carried no commit-msg hook and no config file existed, so
// nothing ran them: knip reported @commitlint/cli as an unused devDependency,
// which was accurate. The release tooling reads the commit type to pick the
// semver bump, so an unchecked subject is a silent release defect.
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
      ],
    ],
    'subject-case': [0],
    'body-max-line-length': [0],
    'footer-max-line-length': [0],
  },
}
