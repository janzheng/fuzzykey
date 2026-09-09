# Changelog

## 2026-09-07 — Deployed

- POST now schedules KV expiration using `ttl`; omitted TTL really expires new/overwritten keys after eight hours. Existing keys are not migrated. Review callers relying on indefinite retention before deploying.
- Invalid TTL fails before writing with HTTP 400 / `FUZZYKEY_INVALID_TTL`; rejected writes return HTTP 500 / `FUZZYKEY_WRITE_FAILED`.
- Added six local regression tests. [Validation](RUNLOG.md); [rollout task](TASKS.md). Deployed to the existing Fuzzykey Worker as version `3b4861f3-2e20-4c2f-a0fa-f80eb33a0dc3`; a 60-second key was readable immediately and absent at 78 seconds.

## 2026-09-08 — Versioned reads and pagination

Deployed additive `/v2/read` and `/v2/list` APIs. Reads distinguish missing keys
from stored null and retain false/zero values; lists expose one bounded page and
its continuation cursor. Existing routes and storage remain unchanged. Callers
must explicitly select the v2 routes. Source `85149fe`; rollout evidence in RUNLOG.md.
