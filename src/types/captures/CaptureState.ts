/** How far the clip for a captured URL got.
 *
 * The service never derives this and only receives it: the ledger under
 * `brain/.ingest/clips/` decides, the Mac pushes after the ledger is on
 * origin/main, and this column repeats the answer so a browser can read it per
 * tab. `needs-claude` is a clip that exists and routed to the manual lane.
 * SPEC: ~/p/brain/docs/superpowers/specs/2026-08-04-clip-state-in-the-browser-design.md */
export type CaptureState = 'captured' | 'ingested' | 'needs-claude'
