// src/__mocks__/astro__middleware.ts

// Export a fake `defineMiddleware` function
// In tests, it's enough that it simply returns the argument passed to it
export function defineMiddleware(fn: (c: unknown, n: () => unknown) => unknown) {
  return fn;
}
