-- The service learns how far each clip got.
--
-- Additive: every existing row keeps its meaning and reads as 'captured', which
-- is what it was. Run once against the live database; `schema.sql` carries the
-- same columns for a fresh install.
-- SPEC: ~/p/brain/docs/superpowers/specs/2026-08-04-clip-state-in-the-browser-design.md
ALTER TABLE captures
  ADD COLUMN state    VARCHAR(16) NOT NULL DEFAULT 'captured',
  ADD COLUMN state_at DATETIME        NULL,
  ADD COLUMN clip_dir TEXT            NULL;
