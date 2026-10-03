/** How much the drain has left, without any of it: what a health dashboard
 * may see. */
export type UndrainedCount = {
  readonly schemaVersion: 1
  readonly count: number
  readonly oldestAt: string | null
}
