import { test } from "node:test";
import assert from "node:assert/strict";
import { retryFetch } from "./retryFetch.js";

test("succeeds immediately when the first response is not retryable", async () => {
  let calls = 0;
  const response = await retryFetch(
    async () => {
      calls += 1;
      return { status: 200, ok: true };
    },
    { retryOnStatus: (status) => status === 503, baseDelayMs: 1 },
  );
  assert.equal(calls, 1);
  assert.equal(response.status, 200);
});

test("retries on a matching status and succeeds once it recovers", async () => {
  let calls = 0;
  const response = await retryFetch(
    async () => {
      calls += 1;
      return calls < 3 ? { status: 503 } : { status: 200, ok: true };
    },
    { retryOnStatus: (status) => status === 503, baseDelayMs: 1 },
  );
  assert.equal(calls, 3);
  assert.equal(response.status, 200);
});

test("gives up after maxRetries and returns the last failing response", async () => {
  let calls = 0;
  const response = await retryFetch(
    async () => {
      calls += 1;
      return { status: 503 };
    },
    { retryOnStatus: (status) => status === 503, baseDelayMs: 1, maxRetries: 2 },
  );
  assert.equal(calls, 3);
  assert.equal(response.status, 503);
});

test("does not retry a status retryOnStatus rejects", async () => {
  let calls = 0;
  const response = await retryFetch(
    async () => {
      calls += 1;
      return { status: 429 };
    },
    { retryOnStatus: (status) => status === 503, baseDelayMs: 1 },
  );
  assert.equal(calls, 1);
  assert.equal(response.status, 429);
});

test("retries a thrown network error, then rethrows once exhausted", async () => {
  let calls = 0;
  await assert.rejects(
    () =>
      retryFetch(
        async () => {
          calls += 1;
          throw new Error("network down");
        },
        { baseDelayMs: 1, maxRetries: 2 },
      ),
    /network down/,
  );
  assert.equal(calls, 3);
});
