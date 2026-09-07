# Fuzzykey tasks

- [x] FK001 Implement validated KV expiration and regression tests. [Brief](.brief/ttl-expiration.done.md)
- [x] FK002 Document retention compatibility and record validation. Depends on FK001.
- [x] FK003 Deploy after reviewing the eight-hour default retention change; verify a disposable key actually expires and configure Coverflow for the verified endpoint. Completed 2026-09-07; deployed source fix `5a4acb4`, verified expiration at 78 seconds, and updated Coverflow examples with the verified endpoint.

Validation: six handler tests pass; see [RUNLOG.md](RUNLOG.md). Live deployment and expiration check passed; details in RUNLOG.
