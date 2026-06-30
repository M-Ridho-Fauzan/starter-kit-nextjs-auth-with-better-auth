# Bugfix Release Cleanup Review — 2026-06-24

Status: **PASS**

## Verification

- `pnpm typecheck` — zero errors
- `pnpm test` — 166/166 passing (20 test files)

---

## Review Questions — Findings

### 1. `require()` pattern in `server.ts` vs `verbatimModuleSyntax`

**No issue.** `verbatimModuleSyntax: true` enforces that ESM `import` statements
use `import type` for type-only imports. The `require()` calls in `server.ts`
are CommonJS function calls, NOT import declarations — `verbatimModuleSyntax`
does not apply to them. The `typeof import("./adapters/prisma.adapter").createPrismaAdapter`
syntax is a type expression used in an `as` assertion (type position), which is
also fine.

**Pattern is correct:**
- `server.ts` does a runtime `require()` inside a `switch` on `config.database.adapter`
- Each adapter file has a static `import { prismaAdapter } from "better-auth/adapters/prisma"` at the top, which always resolves (better-auth is a hard dependency)
- The optional packages (`@prisma/client`, `drizzle-orm`, `kysely`) are `require()`-d inside the factory functions at runtime, not at module load
- Only the configured adapter's module is loaded

### 2. Removing email callbacks from `auth.config.ts`

**No issue.** No tests depend on email callbacks being in the default config.

**Analysis:**
- `EmailConfig` schema defines both callbacks as `.optional()` with `.default({})`
- The mapper (`mapper.ts:70-96`) checks `config.email.sendPasswordResetEmail` and
  `config.email.sendVerificationEmail` — both are `undefined` when omitted
- Fallback functions (`createSendPasswordResetFallback`, `createSendVerificationFallback`)
  provide console.warn/error behavior in development/production
- `mapper.test.ts:204-209` explicitly tests "omits emailVerification when not required
  and no callback" — this test already covers the exact scenario
- `mapper.test.ts:234-240` tests the fallback path ("uses fallback when passwordReset
  is enabled but no callback provided")
- `requireEmailVerification: false` means email verification is not enforced, and
  the fallback `sendVerificationEmail` is only attached when verification IS required

### 3. Test mocks for `auth.config.ts`

**All mocks are properly structured.** Each test mocks only the fields it reads:

| Test File | Fields Mocked | Used By |
|-----------|--------------|---------|
| `proxy.test.ts` | `ui.redirectAfterLogin`, `ui.redirectAfterLogout`, `ui.protectedPaths`, `ui.roleRestrictions` | `proxy.ts` reads all four at module scope |
| `email-verification.test.ts` | `ui.redirectAfterLogin`, `ui.redirectAfterLogout` | `email-verification.ts:75` reads `redirectAfterLogin` |
| `email-password.test.ts` | `ui.redirectAfterLogin`, `ui.redirectAfterLogout` | `email-password.ts:47,84` reads `redirectAfterLogin` |
| `password-reset.test.ts` | `ui.redirectAfterLogin`, `ui.redirectAfterLogout` | `password-reset.ts:84` reads `redirectAfterLogout` |

The `config/index.test.ts` at line 173-177 tests "rejects missing database config"
with `defineAuthConfig({} as AuthConfigInput)` — this still works because the root
schema requires `database.adapter` and the superRefine requires `url` or `client`.

### 4. Client-side imports of `auth.config.ts`

**No issue.** All 4 page components that import `auth.config.ts` are Server Components
(no `"use client"` directive):
- `src/app/dashboard/page.tsx` — reads `ui.redirectAfterLogout`, `ui.twoFactorSettingsPath`
- `src/app/(auth)/settings/2fa/page.tsx` — reads `features.twoFactor.enabled`
- `src/app/(auth)/login/page.tsx` — passes config to `getEnabledOAuthProviders()`
- `src/app/(auth)/register/page.tsx` — passes config to `getEnabledOAuthProviders()`

No client components import `auth.config.ts`. The `?? ""` fallback for OAuth env vars
prevents `undefined` from leaking to the client.

---

## Issues Found

### P0 (Blocking)

None.

### P1 (Should fix before release)

None.

### P2 (Known limitations — tracked)

1. **`two-factor.ts:79` — hardcoded redirect path.** `redirect("/dashboard")` is
   annotated with `TODO: read from auth.config.ts ui.redirectAfterLogin`. This is
   documented in the decision doc and deferred. Not a regression — was hardcoded
   before this session too.

---

## Confirmation of All 7 Fixes

| # | Fix | Status |
|---|-----|--------|
| C2 | `server.ts` — lazy `require()` instead of static imports | ✅ Verified |
| C3 | `package.json` — `postinstall` script for `prisma generate` | ✅ Verified |
| W1 | `package.json` — Prisma in optionalDependencies, `@types/react` in devDependencies, `pg` in dependencies, removed `@prisma/driver-adapter-utils` | ✅ Verified |
| W5 | `schema.ts` — `database.url` required with superRefine | ✅ Verified |
| W6 | `prisma/schema.prisma` — `role String?` field on user model | ✅ Verified |
| I4 | `auth.config.ts` — GitHub OAuth disabled by default, `requireEmailVerification: false`, `?? ""` for env vars, email callbacks removed | ✅ Verified |
| I2 | `.gitignore` — `catatan.md` added | ✅ Verified |

---

## Release Readiness

**The project is ready for public release.**

- Zero type errors (`pnpm typecheck` passes)
- 166/166 tests passing (`pnpm test` passes)
- All 7 fixes properly implemented and verified
- No `any` types in reviewed files
- All adapter patterns consistent (lazy loading via `require()`)
- All mocks correctly structured for test isolation
- No client-side leakage of server-only config
- Known limitation (hardcoded redirect in two-factor) is documented with TODO
