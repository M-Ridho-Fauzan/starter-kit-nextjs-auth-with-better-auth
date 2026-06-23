# Session Management Design

## Status: Implemented

## Summary

Add `getServerSession()` utility, document JWT vs database strategy trade-offs, and add `Session` type documentation.

## Changes

1. **`getServerSession()`** – ergonomic wrapper in `src/lib/auth/server-utils.ts` that calls `auth.api.getSession({ headers: await headers() })`.
2. **`mapper.ts` comment** – documented that Better Auth has NO explicit `session.strategy` option; strategy is implicit based on database adapter.
3. **`docs/session-management.md`** – documents JWT vs DB trade-offs, `getServerSession()` usage, migration notes.
4. **Test cases** – 4 new tests for `getServerSession()` (success, null, error, role field).

## Files

- `src/lib/auth/server-utils.ts` – new `getServerSession()` function
- `src/lib/auth/server-utils.test.ts` – 4 new tests
- `src/auth/mapper.ts` – JSDoc comment on `mapSession()`
- `docs/session-management.md` – new documentation page
- `docs/index.md` – add session management link to TOC
- `AGENTS.md` – mark session management as [x]
