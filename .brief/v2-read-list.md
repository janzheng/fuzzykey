# Fuzzykey v2 read/list compatibility

Additive GET routes provide stable value and pagination contracts while leaving the legacy root API unchanged.

- `GET /v2/read?key=...&scope=...` returns `{ version: 2, key, exists, value }`. `exists` is determined from the raw KV result before JSON parsing, so a stored JSON `null` differs from a missing key and JSON booleans remain booleans.
- `GET /v2/list?scope=...&limit=...&cursor=...` performs exactly one KV list call. Limit is 1–1000; incomplete pages return the opaque cursor.
- These read routes inherit the current unauthenticated Worker policy. A scope is only a key prefix and does not provide tenant isolation.
- Rollout is deliberately separate. Coverflow callers require an explicit base URL and reject non-v2 response shapes, so they cannot silently use the deployed legacy endpoint.

Source contract: Cloudflare Workers KV binding documentation for `get()` and `list()`.
