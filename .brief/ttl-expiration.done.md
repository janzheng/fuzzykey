# Enforce Fuzzykey key expiration

**Status:** done (local implementation; rollout remains FK003)
**From:** Coverflow integration review, 2026-09-07
**Task:** [TASKS.md](../TASKS.md)

## Problem

POST accepts `ttl` (default 28,800 seconds) but passes it only inside KV metadata. Successful writes therefore never schedule expiration. Callers cannot rely on TTL for temporary data.

## Sources

- [Reviewed source](https://github.com/janzheng/fuzzykey/blob/156f5b55f7707c611b86b6841b2d5fc872c5f47a/lib/fuzzykey-handlers.js)
- [Cloudflare KV write and expiration contract](https://developers.cloudflare.com/kv/api/write-key-value-pairs/) — checked 2026-09-07; expirationTtl is seconds from write, minimum 60.

## Recommendation

Pass validated TTL as the top-level `expirationTtl` option to `FUZZYKEY.put`. Keep metadata.ttl and the existing eight-hour default for compatibility with the intended API. Accept safe integer seconds >=60; reject invalid explicit values with HTTP 400 and a stable JSON error code before any mutation. Await KV and return HTTP 500 if persistence fails.

This changes retention for new and overwritten keys after deployment: omitted TTL will now really expire after eight hours. Existing keys are not migrated or deleted. Rewriting a key restarts its TTL. No bulk cleanup or deployment is part of this source fix.

## Implementation

1. Add Node built-in handler tests with a recording KV binding: explicit/default/minimum TTL, invalid TTL, list bypass, and storage failure.
2. Change POST validation and KV options, preserving metadata and success response.
3. Document the retention change and rollout procedure; record passing evidence.
4. Keep Coverflow explicit TTL guarded for unverified deployments. Allow an explicit upgraded-endpoint setting only after the operator verifies that endpoint. Do not infer deployment from a source edit.

## Rollout follow-up

Review default expiration impact before deploying. Deploy the fixed Worker separately, then write a disposable key with ttl=60, verify its existence and later expiration (allowing KV propagation), and enable the verified endpoint in Coverflow. Never infer expiry from metadata alone.
