async function fetchJson(url, init) {
  const response = await fetch(url, init);
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Invalid JSON in response from ${url}`);
  }
  if (!response.ok) {
    const message = body.error ?? `Failed to fetch ${url} (status ${response.status})`;
    throw new Error(message);
  }
  return body;
}
async function fetchArray(url, signal) {
  const result = await fetchJson(url, { signal });
  if (Array.isArray(result)) {
    return result;
  }
  return result.data;
}
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export { fetchWithTimeout as a, fetchArray as f };
