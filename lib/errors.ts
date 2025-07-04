export function invariant(
  condition: any,
  message?: string | (() => string),
): asserts condition {
  if (condition) return

  const provided: string | undefined = typeof message === 'function' ? message() : message;
  throw new Error(provided);
}

export const raise = (message?: string | (() => string)) => {
  const provided: string | undefined = typeof message === 'function' ? message() : message;
  throw new Error(provided);
}
