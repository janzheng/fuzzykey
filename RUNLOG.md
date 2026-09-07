# Run log

## 2026-09-07 — TTL expiration regression

Source base: `156f5b55f7707c611b86b6841b2d5fc872c5f47a`; local edits, Node built-in test runner, recording KV binding. No credentials, deployment, or live writes.

| Run | Result | Evidence |
| --- | --- | --- |
| `node --test tests/ttl.test.js` before fix | 1 passed, 5 failed | Explicit/default/minimum expiration options absent; invalid TTL accepted; persistence failure returned HTTP 200. |
| `npm test` after fix | 6 passed, 0 failed | Exact KV expiration options, metadata preservation, invalid TTL rejection before mutation, list bypass, rejected write. Expected fixture error is logged by the handler. |

Reproducible tests: [tests/ttl.test.js](tests/ttl.test.js). The KV mock checks the real handler's binding calls; it does not prove production expiration. [FK003 rollout](TASKS.md) remains open.
