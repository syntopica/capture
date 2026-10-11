# TODO log - capture-service

Closed work, newest first, grouped by year and month.

## 2026

### 2026-10

- 2026-10-11 - Deployed `main` at `40a3419` (UTC `oldestAt`, the dependency
  upgrade, the audit waiver) with the documented `pnpm build:cpanel` + rsync +
  persistent-app restart. **Rollback point:** the previous production build was
  `18bc65c` (2026-10-03); a full tarball of the app directory taken just before
  the upload sits in root's home on the production host as
  `brain-capture-backup-20261011.tar.gz` (the 2026-10-03 one is kept too). Smoke
  test, read-only with a real token: `/api/captures/count` 200 (`count 0`), the
  same call without a token 401, `/api/have` 200, `/api/captures?drained=false`
  200; the server process restarted at the deploy time.
- 2026-10-11 - Stale `/have` clip links: the code was kept (Codex, high), and
  the production config was fixed instead. Owner decision relayed by the
  coordinator. The server `.env` was backed up as `.env.bak-20261011`, its
  `CLIPS_REPOSITORY_URL` line removed, the app restarted; `/have` for an
  ingested clip now answers `"clip_url":null` with `state` and `clip_dir`
  intact. Revert: restore the backup and restart.
- 2026-10-11 - Clip 01M3QXGJ re-mirrored with the clips tooling's own `push`
  (`tools/capture/push.py`, the per-row step of `push_index_to_service.py`):
  `/have?url=https://x.com/trq212/status/2101009392611278961` now answers
  `captured: true`, `state: ingested`, the processed `clip_dir`, `captured_at`
  2026-09-30T01:05:24Z. The Python run needed `SSL_CERT_FILE`; filed in the
  clips repo's TODO.
- 2026-10-11 - `check:security` red on GHSA-vfj7-8cjw-p6xm (braces <=3.0.3, no
  patched release, lint-time only): `audit:check` now runs
  `baseline-audit --level high` from quality-config with an expiring waiver in
  `.baseline-advisories.json` (expires 2026-12-31, same advisory and expiry as
  codeality's). Owner decision relayed by the coordinator. Evidence:
  `pnpm check:security` reports 0 unwaived, 1 waived.
- 2026-10-11 - `pnpm type-check` TS4111 failures: already fixed before this
  pass; every `process.env` read uses bracket access. Evidence:
  `pnpm type-check` exits 0 on `e8423bd`.
- 2026-10-11 - `pnpm knip` and `gitleaks`: knip already exited 0 (binaries are a
  warning in the shared preset) and `@commitlint/cli` was no longer reported;
  `gitleaks` is now declared in `ignoreBinaries` with the reason, so the warning
  is gone. The remaining `dependency-cruiser ... Remove from ignoreDependencies`
  line is a hint from the shared preset's own list, not a failure. Evidence:
  `pnpm knip` exit 0, no unlisted binaries.
- 2026-10-11 - Shared package scope migration: the lockfile was regenerated for
  `@syntopica/*` in `a306567` and the gate is green on it. `npm view` shows the
  scope published (`quality-config` 0.13.1, `eslint-config` 0.9.0, `tsconfig`
  0.3.1, `prettier-config` 0.2.2). Evidence: `pnpm check` and
  `pnpm check:quality` exit 0.
- 2026-10-11 - `POST /api/capture` 500 for desktop clip 01M3QXGJ: root cause was
  the deployment, not the code. After the 2026-09-26 host move the server's
  `DB_SOCKET` still named the cPanel socket, so every authenticated request
  failed to connect until it was fixed on 2026-10-03 (the 2026-09-30 ingest
  falls inside that window). Reproduced locally against MariaDB 11.4: with
  `DB_SOCKET=/var/lib/mysql/mysql.sock` a POST answers 401 without a token and
  500 with one (`connect ENOENT`); with the right connection the same body
  (`{url, capture_source: "mac-clips"}`) answers 201 and the PATCH 200.
  Production answers authenticated `GET /api/have` and `/api/captures/count`
  with 200 today. Regression test:
  `src/services/captures/desktopClipMirror.integration.test.ts`. The clip itself
  is still absent from the service (`/api/have` says `captured: false`); the
  repair is re-running the mirror from the Mac
  (`~/p/wiki/tools/capture/push_index_to_service.py` or the next
  `clips ingest`), which writes production data and was left to the owner.
- 2026-10-11 - `oldestAt` across mixed offsets: `GET /api/captures/count` now
  parses the undrained `captured_at` values and returns the earliest instant in
  UTC (`toISOString`); unparseable values are counted but do not date the
  backlog. No migration. Decided (Codex, high): compute in process, no
  normalised column. Evidence: `pnpm test` (unit) and the
  `countUndrainedCaptures` integration test against MariaDB 11.4, which asserts
  `2000-01-01T22:30:00.000Z` for `Z`/`+02:00` probes where `MIN` would return
  the later `Z` string.
