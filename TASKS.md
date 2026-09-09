# Fuzzykey tasks

- [x] FK001 Implement validated KV expiration and regression tests. [Brief](.brief/ttl-expiration.done.md)
- [x] FK002 Document retention compatibility and record validation. Depends on FK001.
- [x] FK003 Deploy after reviewing the eight-hour default retention change; verify a disposable key actually expires and configure Coverflow for the verified endpoint. Completed 2026-09-07; deployed source fix `5a4acb4`, verified expiration at 78 seconds, and updated Coverflow examples with the verified endpoint.

Validation: six handler tests pass; see [RUNLOG.md](RUNLOG.md). Live deployment and expiration check passed; details in RUNLOG.

- [x] [completed 2026-09-08 by codex-integration-rollout-20260908] FK004 Deploy and fixture-verify the additive v2 read/list API. Implementation and local contracts are in [the v2 brief](.brief/v2-read-list.md). Source `85149fe` pushed to main; Worker version `6b29e9e3-98fa-48b4-aa76-f6020f7021db` deployed and verified through actual Coverflow v2 consumers; reads remain unauthenticated and scopes are key prefixes, not isolation boundaries.
