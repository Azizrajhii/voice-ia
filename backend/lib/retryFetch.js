function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calls fetchFn(), retrying on a transient response status (per retryOnStatus)
 * or a thrown network error, with exponential backoff. Non-retryable
 * statuses (e.g. 429 quota errors, where waiting a few hundred ms won't help)
 * are returned immediately on the first attempt.
 */
export async function retryFetch(fetchFn, { maxRetries = 2, baseDelayMs = 400, retryOnStatus = () => false } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    let response;
    try {
      response = await fetchFn();
    } catch (error) {
      if (attempt >= maxRetries) throw error;
      await sleep(baseDelayMs * 2 ** attempt);
      continue;
    }

    if (attempt < maxRetries && retryOnStatus(response.status)) {
      await sleep(baseDelayMs * 2 ** attempt);
      continue;
    }
    return response;
  }
}
