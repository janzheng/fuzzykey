# Fuzzykey v2 read/list compatibility

Additive GET routes provide stable value and pagination contracts while leaving the legacy root API unchanged.

- `GET /v2/read?key=...&scope=...` returns `{ version: 2, key, exists, value }`. `exists` is determined from the raw KV result before JSON parsing, so a stored JSON `null` differs from a missing key and JSON booleans remain booleans.
- `GET /v2/list?scope=...&limit=...&cursor=...` performs exactly one KV list call. Limit is 1–1000; incomplete pages return the opaque cursor.
- These read routes inherit the current unauthenticated Worker policy. A scope is only a key prefix and does not provide tenant isolation.
- Rollout is deliberately separate. Coverflow callers require an explicit base URL and reject non-v2 response shapes, so they cannot silently use the deployed legacy endpoint.

Source contract: Cloudflare Workers KV binding documentation for `get()` and `list()`.


## Rollout completed — 2026-09-08

`codex-integration-rollout-20260908` deployed source `85149fe` as Worker version
`6b29e9e3-98fa-48b4-aa76-f6020f7021db`. Nine local tests and four live read-only
checks pass, including actual Coverflow consumers. Use
`https://fuzzykey.yawnxyz.workers.dev` as the explicit v2 base URL. See RUNLOG.md
for evidence and limits. No legacy data was migrated.
