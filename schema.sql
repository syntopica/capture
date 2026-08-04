-- brain-capture: the URL inbox.
--
-- Two tables and nothing else. The service records URLs and answers whether a
-- URL is already recorded; the body of an article is captured by the harvest on
-- the owner's Mac, never here.
-- SPEC: ~/p/brain/docs/superpowers/specs/2026-08-04-capture-service-design.md

CREATE TABLE IF NOT EXISTS captures (
  -- The article's identity is host plus path, lowercased, with query string,
  -- fragment and trailing slash removed. It is the primary key because a URL
  -- captured twice is one capture, and answering that is the whole point of
  -- the service. The normalisation must stay identical to the one in
  -- ~/p/brain/tools/capture/url_index.py: an index that answers a different
  -- question than the one it was built from is worse than no index.
  normalized_url VARCHAR(700) NOT NULL PRIMARY KEY,
  url            TEXT         NOT NULL,
  note           TEXT             NULL,
  capture_id     CHAR(26)     NOT NULL,
  capture_source VARCHAR(64)  NOT NULL,
  -- Sent by the client with its own UTC offset intact. A phone captures in
  -- local time and the offset is information about where it happened.
  captured_at    VARCHAR(40)  NOT NULL,
  -- Set when `clips` has taken the URL out of the inbox. It means exactly that
  -- and never "a page was written": synthesis state lives in the clip's own
  -- derived state and in the ledger, and an inbox that learns to answer it
  -- becomes a second ledger that will disagree with the first.
  drained_at     DATETIME         NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY captures_capture_id (capture_id),
  KEY captures_drained_at (drained_at)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS capture_tokens (
  -- The SHA-256 of the token, never the token. A database dump then leaks no
  -- credential, and revocation is one UPDATE rather than a redeploy - which is
  -- the property that made a capture token worth having instead of a GitHub
  -- PAT in an iCloud-synced plist.
  token_sha256 CHAR(64)    NOT NULL PRIMARY KEY,
  -- One row per device, so a lost phone revokes one token and the log says
  -- which device captured what.
  label        VARCHAR(64) NOT NULL,
  created_at   DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at   DATETIME        NULL,
  last_used_at DATETIME        NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
