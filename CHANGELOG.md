# Changelog

## Unreleased

- POST now schedules KV expiration using `ttl`; omitted TTL really expires new/overwritten keys after eight hours. Existing keys are not migrated. Review callers relying on indefinite retention before deploying.
- Invalid TTL fails before writing with HTTP 400 / `FUZZYKEY_INVALID_TTL`; rejected writes return HTTP 500 / `FUZZYKEY_WRITE_FAILED`.
- Added six local regression tests. [Validation](RUNLOG.md); [rollout task](TASKS.md). This source change has not been deployed in this work.
