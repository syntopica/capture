/** A validated request body, or the reason it was refused. */
export type ParsedInput<TInput> = { input: TInput } | { error: string }
