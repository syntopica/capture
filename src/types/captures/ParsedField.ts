/** One validated body field, or the reason it was refused. */
export type ParsedField<TValue> = { value: TValue } | { error: string }
