# Run log

## 2026-09-07 — TTL expiration regression

Source base: `156f5b55f7707c611b86b6841b2d5fc872c5f47a`; local edits, Node built-in test runner, recording KV binding. No credentials, deployment, or live writes.

| Run | Result | Evidence |
| --- | --- | --- |
| `node --test tests/ttl.test.js` before fix | 1 passed, 5 failed | Explicit/default/minimum expiration options absent; invalid TTL accepted; persistence failure returned HTTP 200. |
| `npm test` after fix | 6 passed, 0 failed | Exact KV expiration options, metadata preservation, invalid TTL rejection before mutation, list bypass, rejected write. Expected fixture error is logged by the handler. |

Reproducible tests: [tests/ttl.test.js](tests/ttl.test.js). The KV mock checks the real handler's binding calls; it does not prove production expiration. [FK003 rollout](TASKS.md) remains open.


## 2026-09-07 — Commit, push and deployment preparation

User authorized commit, push and Cloudflare deployment. Re-ran `npm test`: six
passed. `git diff --check` passed; origin/main matched the source base before
commit. Fix committed and pushed to origin/main as `5a4acb4`.

`npx --yes wrangler@4.129.1 whoami` could not refresh the expired saved OAuth token.
Started interactive `wrangler login` for the user to authorize in their browser.
No Worker deployment has occurred. The checkout has only a placeholder
`wrangler.toml.example`; recover and verify the existing Worker's binding/config
before deploying, rather than creating a new KV namespace. FK003 remains open.


## 2026-09-07 — Production deployment and live TTL verification

- Authentication renewed successfully after two expired two-minute login attempts.
- Recovered the existing Worker's settings through the Cloudflare API. Kept its
  `FUZZYKEY` KV namespace and compatibility date `2022-08-04`; created no namespace.
  Local `wrangler.toml` is ignored, matching this repository's configuration policy.
- `wrangler init --from-dash` unexpectedly created a starter in `/tmp/fuzzykey`;
  that starter was not deployed. Used the authoritative API settings instead.
- `npx --yes wrangler@4.129.1 deploy --dry-run` passed, then `deploy` succeeded.
  Source fix `5a4acb4`, checkout `2acad29`; deployed version
  `3b4861f3-2e20-4c2f-a0fa-f80eb33a0dc3` at
  `https://fuzzykey.yawnxyz.workers.dev`.
- Previous version for rollback: `dcd6ca4b-5815-44bc-bd9d-f4b5d55e137d`.
- Live curl check: TTL 59 returned HTTP 400 / `FUZZYKEY_INVALID_TTL`.
  A unique disposable key with TTL 60 was readable immediately after its POST,
  then absent (value and metadata null) at 78 seconds. It expired naturally;
  no existing data was modified. An initial urllib probe returned a non-JSON
  HTTP error before any valid write; curl completed the checks.
- Coverflow examples now use the verified endpoint with explicit
  `ttlSupported: true`. Other deployments remain unverified; existing flows were
  not rewritten. The eight-hour default was covered locally, not by an eight-hour
  live wait. KV propagation across all regions was not tested.

FK003 is complete. Production now applies TTL to new/overwritten keys, including
omitted TTL's eight-hour default. Older keys were not migrated.
## 2026-09-08 — Versioned read and cursor-list qualification

Added opt-in `/v2/read` and `/v2/list` handlers without changing the legacy routes or deploying. Recording KV fixtures establish that raw missing `null` is distinct from stored JSON `null`, JSON booleans and numbers retain their types, and a list request passes one bounded page with its opaque cursor. `npm test` passes 9 tests. Coverflow separately requires an explicit v2 deployment URL and rejects legacy response shapes. Reads remain under the current unauthenticated policy; scope prefixes are not isolation boundaries. [Implementation brief](.brief/v2-read-list.md).
