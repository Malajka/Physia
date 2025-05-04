/**
 * Performs a fetch request with a timeout abort.
 * @param url - The URL to request.
 * @param options - Fetch options.
 * @param timeoutMs - Timeout in milliseconds before aborting the request.
 * @returns A promise that resolves to the fetch Response.
 * @throws DOMException if the request is aborted due to timeout.
 */
export default async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}
