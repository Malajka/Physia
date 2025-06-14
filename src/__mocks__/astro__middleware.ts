export function defineMiddleware(fn: (c: unknown, n: () => unknown) => unknown) {
  return fn;
}
