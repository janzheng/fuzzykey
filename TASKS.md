# Fuzzykey tasks

- [x] FK001 Implement validated KV expiration and regression tests. [Brief](.brief/ttl-expiration.done.md)
- [x] FK002 Document retention compatibility and record validation. Depends on FK001.
- [ ] FK003 Deploy after reviewing the eight-hour default retention change; verify a disposable key actually expires and configure Coverflow for the verified endpoint. Separate rollout; not part of the local fix.

Validation: six handler tests pass; see [RUNLOG.md](RUNLOG.md). No deployment performed.
