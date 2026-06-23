# Full Project Review — NextJS Auth Starter Kit

**Review date**: 2026-06-23
**Reviewer**: code-reviewer agent
**NOTE**: critical & medium issue fixed

## Summary

**Overall verdict**: PASS WITH NOTES

The codebase is well-structured, config-driven, and demonstrates strong architectural decisions. The Zod schema validation, adapter registry pattern, and consistent hook/action patterns are standout strengths. However, there are TypeScript strictness violations (particularly `any` usage in adapter factories), missing JSDoc on exported symbols, and several hardcoded values that should flow from `auth.config.ts`. These are non-blocking but should be addressed before production release.

**Key strengths**:

- Clean `auth.config.ts` → Zod schema → typed config pipeline
- Adapter registry pattern with dynamic dispatch
- Consistent Server Action + Hook + Component pattern across all features
- Comprehensive documentation across all features
- 14 test files covering core functionality

**Critical issues**: 0 blocking, 6 high-priority recommendations

---

## Phase 1 — Core Foundation

### Strengths

- `schema.ts` uses Zod with sensible defaults and custom duration validation — excellent config safety
- `types.ts` correctly derives both input and output types from Zod schemas
- `defineAuthConfig()` is a clean entry point that validates and returns typed config
- `mapper.ts` cleanly separates concerns (database, email, oauth, session, advanced, plugins)
- `oauth.ts` is a focused utility for extracting enabled providers
- `server.ts` and `auth-client.ts` are clean singletons with JSDoc and examples
- Adapter registry pattern (`registerAdapter`/`resolveAdapter`) is extensible and testable
- `auth.config.ts` matches the AGENTS.md target API almost exactly

### Issues

- `schema.ts:43` — `client: z.any().optional()` uses `any`. Should be `z.unknown().optional()` to satisfy strict mode.
- `config/index.ts:6-8` — `defineAuthConfig` function has no JSDoc. This is the primary public API entry point — it MUST have JSDoc with `@param`, `@returns`, `@example`.
- `config/index.ts:10-21` — All re-exported types lack JSDoc. Every `export type` should have at least a one-line description.
- `adapters/index.ts:6-8` — `registerAdapter` has no JSDoc. Needs `@param name`, `@param factory`, `@example`.
- `adapters/index.ts:10-20` — `resolveAdapter` has no JSDoc. Needs `@param config`, `@returns`, `@throws`.
- `adapters/index.ts:22-24` — `hasAdapter` has no JSDoc.
- `adapters/types.ts:9` — `CreateAdapter` type has no JSDoc. Should document the contract.
- `mapper.ts:14` — `match[1]!` and `match[2]!` use non-null assertions after regex validation. While safe due to the regex, this violates strict null check intent. The regex guarantees these exist, but a `!` still suppresses the compiler — consider destructuring with a guard.
- `mapper.ts:36` — `mapConfig` has `@internal` tag but is exported. Either make it non-exported or remove `@internal`.
- `mapper.ts:52` — `resolveAdapter(database) as BetterAuthOptions["database"]` is an unsafe `as` cast. The return type of `resolveAdapter` is `unknown`.
- `mapper.ts:184` — `(socialProviders as Record<string, unknown>)[provider.id]` — unsafe cast for dynamic property assignment.
- `mapper.ts:237,240` — `nextCookies() as BetterAuthPlugin` and `twoFactor() as BetterAuthPlugin` — casts needed because plugin types don't match exactly, but should have inline comments explaining why.
- `adapters/prisma.adapter.ts:39` — `config.client as PrismaClientLike | undefined` — unsafe cast without validation.
- `adapters/drizzle.adapter.ts:28-29` — `const db: any = config.client ?? createDrizzleDB(config.url)` — explicit `any` with eslint-disable. Should define a minimal `DrizzleLike` interface similar to Prisma's `PrismaClientLike`.
- `adapters/drizzle.adapter.ts:37` — `function createDrizzleDB(url?: string): any` — returns `any`.
- `adapters/kysely.adapter.ts:29-30` — `const kysely: any = config.client ?? createKyselyDB(config.url)` — same `any` issue.
- `adapters/kysely.adapter.ts:38` — `function createKyselyDB(url?: string): any` — returns `any`.
- `adapters/kysely.adapter.ts:40-55` — All `require()` type assertions use `any` extensively (8 eslint-disable comments). Should define minimal interfaces like Prisma does.

---

## Phase 2 — Auth Features

### Strengths

- `actions/types.ts` has clean, well-documented result types (`AuthSuccessResult`, `AuthErrorResult`, `AuthActionResult`)
- All Server Actions follow a consistent pattern: validate FormData → call auth API → return typed result
- Error handling consistently catches errors, checks for `digest` (Next.js redirect), and returns structured errors
- `email-password.ts` correctly handles two-factor redirect detection
- `password-reset.ts` properly handles both request and reset flows
- `email-verification.ts` handles both resend and verify flows

### Issues

- `email-password.ts:16-17,61-63` — `formData.get("email") as string` and similar casts. `FormData.get()` returns `string | File | null`. The `as string` cast bypasses null checking. Should use explicit null check before cast (which is done on the next line, but the cast is still technically unsafe if the value is a `File`).
- `email-password.ts:32` — `const resultAny = result as Record<string, unknown>` — unsafe cast to check `twoFactorRedirect`. Better Auth's return type should be used directly, or a type guard should be defined.
- `email-password.ts:50` — `redirect("/dashboard")` is hardcoded. Should read from `auth.config.ts` `ui.redirectAfterLogin`. Same applies to `email-verification.ts:81` and `password-reset.ts:91` (`redirect("/login")`).
- `two-factor.ts:13-36` — `twoFactorAPI()` function uses `auth.api as unknown as { ... }` — double cast to access plugin methods at runtime. This is a known pattern for optional plugins but the inline type definition is fragile. Should be extracted to a shared type or use Better Auth's plugin type inference.
- `two-factor.ts:47,89,128,169,208` — All `formData.get("...") as string` casts have the same issue as email-password.ts.

---

## Phase 3 — Advanced Features

### Strengths

- All five 2FA actions are well-documented with JSDoc
- Consistent error handling pattern across all actions
- `generateBackupCodesAction` properly returns typed data
- `disableTwoFactorAction` and `enableTwoFactorAction` have clear success messages

### Issues

- (No additional issues beyond those noted in Phase 2)

---

## Phase 4 — Next.js Integration

### Strengths

- `middleware.ts` correctly exports `runtime = "nodejs"` with clear documentation explaining why
- `getServerSession()` in `server-utils.ts` has excellent JSDoc with multiple examples
- `hasRole()` in `server-utils.ts` is well-documented with parameter descriptions
- All hooks follow a consistent pattern and have JSDoc with examples
- `use-auth.ts` provides a clean `UseAuthResult` interface with documented properties
- `use-session.ts` has good documentation distinguishing it from `useAuth()`
- `use-role.ts` and `use-has-role.ts` provide complementary role-checking patterns
- `use-social-login.ts` handles provider casting with `as never` (reasonable for dynamic providers)

### Issues

- `middleware.ts:37` — `protectedPaths` is hardcoded: `["/dashboard", "/settings", "/admin"]`. Should come from `auth.config.ts` (e.g., a `ui.protectedPaths` option).
- `middleware.ts:43-45` — `roleRestrictions` is hardcoded. Should come from `auth.config.ts` (e.g., a `roles.restrictions` option).
- `middleware.ts:69` — `(session.user as Record<string, unknown>).role as string | undefined` — double unsafe cast for role access.
- `server-utils.ts:64` — `(session.user as Record<string, unknown>).role` — same unsafe cast pattern. When roles are enabled, the user type should include the `role` field.
- `use-role.ts:22` — `(data.user as Record<string, unknown>).role as string | undefined` — same pattern.
- `use-has-role.ts:24` — `(data.user as Record<string, unknown>).role` — same pattern.
- The `Record<string, unknown>` pattern for role access appears in 4 files. This should be consolidated into a utility function or the session type should be properly extended when roles are enabled.
- `use-login.ts:9` — `useLoginForm` function has no `@returns` JSDoc.
- `use-register.ts:9` — `useRegisterForm` function has no `@returns` JSDoc.
- `use-forgot-password.ts:9` — `useForgotPasswordForm` function has no `@returns` JSDoc.
- `use-reset-password.ts:9` — `useResetPasswordForm` function has no `@returns` JSDoc.
- `use-resend-verification.ts:8` — `useResendVerificationForm` has no `@returns` JSDoc.
- `use-backup-codes.ts:6` — `useBackupCodes` has no `@returns` JSDoc.
- `use-two-factor-setup-form.ts:8` — `useTwoFactorSetupForm` has no `@returns` JSDoc.
- `use-verify-totp-form.ts:8` — `useVerifyTotpForm` has no `@returns` JSDoc.

---

## Phase 5 — UI Layer

### Strengths

- `auth-layout.tsx` is a clean, reusable centered card layout with responsive design
- All form components follow the same pattern: use hook → destructure `[state, formAction, pending]` → render form
- `social-login-buttons.tsx` gracefully handles empty providers list
- `backup-codes-display.tsx` has a working copy-to-clipboard feature with feedback
- `two-factor-setup-form.tsx` has a two-phase UI (setup form → QR code display)
- `user-profile.tsx` combines auth state, role, and navigation in a clean component
- All components use shadcn/ui primitives consistently

### Issues

- `auth-layout.tsx` — The `AuthLayout` component has no JSDoc (only a comment inside the function).
- `login-form.tsx` — `LoginForm` has no JSDoc.
- `register-form.tsx` — `RegisterForm` has no JSDoc.
- `forgot-password-form.tsx` — `ForgotPasswordForm` has no JSDoc.
- `reset-password-form.tsx` — `ResetPasswordForm` has no JSDoc.
- `resend-verification-form.tsx` — `ResendVerificationForm` has no JSDoc.
- `social-login-buttons.tsx` — `SocialLoginButtons` has no JSDoc. `SocialLoginButtonsProps` interface has no JSDoc.
- `two-factor-setup-form.tsx` — `TwoFactorSetupForm` has no JSDoc.
- `two-factor-verify-form.tsx` — `TwoFactorVerifyForm` has no JSDoc.
- `backup-codes-display.tsx` — `BackupCodesDisplay` has no JSDoc. `BackupCodesDisplayProps` has no JSDoc.
- `user-profile.tsx` — `UserProfile` has no JSDoc. `AvatarFallback` has no JSDoc.
- `two-factor-setup-form.tsx:33` — `dangerouslySetInnerHTML={{ __html: setupData.totpURI }}` is a potential XSS vector. The `totpURI` comes from the server, but if compromised, could inject malicious HTML. Consider rendering as a plain text QR code image or using a sanitization library.
- `user-profile.tsx:68` — Hardcoded route `/settings/2fa` should come from `auth.config.ts` or a constants file.

---

## Phase 6 — DX & Documentation

### Strengths

- `setup.ts` is a comprehensive interactive wizard covering all config options
- `generate-env.example.ts` correctly generates `.env.example` from config
- `scripts/lib/write-config.ts` generates clean `auth.config.ts` files
- `scripts/lib/generate-env.ts` has a well-structured `EnvVarEntry` type with JSDoc
- All 14 docs files exist and cover their respective features thoroughly
- `docs/index.md` is well-organized with clear navigation
- `README.md` is comprehensive with quick start, configuration, project structure, and scripts
- `.env.example` is clean and well-commented
- `examples/protected-layout.example.tsx` has good documentation and practical usage

### Issues

- `write-config.ts:1-11` — `OAuthProviderSelections`, `CustomOAuthProviderSelections`, and `SetupSelections` interfaces have no JSDoc. These are public API for the setup wizard.
- `write-config.ts:122` — `generateAuthConfigFile` has no JSDoc.
- `generate-env.ts:3-8` — `EnvVarEntry` interface has no JSDoc (it's in the file but the comment is minimal).
- `generate-env.ts:14` — `collectEnvVars` has no JSDoc.
- `generate-env.ts:133` — `formatEnvVar` has no JSDoc.
- `generate-env.ts:141` — `generateEnvExample` has no JSDoc.
- `setup.ts` — The entire setup script has no module-level JSDoc explaining its purpose.
- `docs/react-hooks.md` — Only documents `useAuth` and `useSession`. Missing docs for `useRole`, `useHasRole`, `useSocialLogin`, `useLoginForm`, `useRegisterForm`, `useForgotPasswordForm`, `useResetPasswordForm`, `useResendVerificationForm`, `useTwoFactorSetupForm`, `useVerifyTotpForm`, `useBackupCodes`.
- `docs/ui-components.md` — Missing `TwoFactorVerifyForm` and `BackupCodesDisplay` from the component table.

---

## Cross-cutting Issues

### TypeScript strict compliance

- **`any` usage**: 14 instances in source code (drizzle.adapter.ts: 4, kysely.adapter.ts: 10, schema.ts: 1). All have `eslint-disable` comments but violate the "zero `any`" rule in AGENTS.md.
- **`as` casts**: 12 instances in non-test source code. Most are in mapper.ts (4), middleware.ts (1), server-utils.ts (1), hooks (2), prisma.adapter.ts (1), email-password.ts (1), two-factor.ts (1). The `as Record<string, unknown>` pattern for role access is the most common.
- **`as unknown`**: 1 instance in production code (`two-factor.ts:14`) — double cast for plugin API access.
- **No `@ts-ignore` or `@ts-expect-error`**: ✓ Clean
- **`noUncheckedIndexedAccess`**: Configured in tsconfig.json ✓

### JSDoc coverage

- **Missing JSDoc on exported functions**: `defineAuthConfig`, `registerAdapter`, `resolveAdapter`, `hasAdapter`, `useLoginForm`, `useRegisterForm`, `useForgotPasswordForm`, `useResetPasswordForm`, `useResendVerificationForm`, `useBackupCodes`, `useTwoFactorSetupForm`, `useVerifyTotpForm`, `generateAuthConfigFile`, `collectEnvVars`, `formatEnvVar`, `generateEnvExample`
- **Missing JSDoc on exported types**: `CreateAdapter`, `AuthActionResult` (has inline comment but not JSDoc), all re-exported config types in `config/index.ts`, `OAuthProviderSelections`, `CustomOAuthProviderSelections`, `SetupSelections`, `EnvVarEntry`
- **Missing JSDoc on exported components**: All 11 UI components (`LoginForm`, `RegisterForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `ResendVerificationForm`, `SocialLoginButtons`, `TwoFactorSetupForm`, `TwoFactorVerifyForm`, `BackupCodesDisplay`, `UserProfile`, `AuthLayout`)
- **Well-documented**: `useAuth`, `useSession`, `useRole`, `useHasRole`, `useSocialLogin`, `getServerSession`, `hasRole`, all server actions, `mapConfig`, `getEnabledOAuthProviders`, `auth`, `authClient`, all adapter factories

### Config-driven compliance

- **Hardcoded redirect paths**: `email-password.ts:50` (`"/dashboard"`), `email-verification.ts:81` (`"/dashboard"`), `password-reset.ts:91` (`"/login"`), `user-profile.tsx:68` (`"/settings/2fa"`)
- **Hardcoded middleware paths**: `middleware.ts:37` (`protectedPaths`), `middleware.ts:43-45` (`roleRestrictions`)
- **Hardcoded adapter providers**: All adapters hardcode `"postgresql"` / `"pg"` / `"postgres"` — should come from config or be configurable
- **Correctly config-driven**: Session config, UI config, email callbacks, OAuth providers, 2FA settings, role settings

### Adapter pattern consistency

- **Shape**: All three adapters export `create[Name]Adapter(config: DatabaseConfig): unknown` ✓
- **Parameters**: All accept `DatabaseConfig` ✓
- **Return type**: All return `unknown` ✓
- **Registration**: All documented with `registerAdapter` examples ✓
- **Factory dispatch**: `resolveAdapter` correctly maps adapter name to factory ✓
- **Inconsistency**: Prisma defines `PrismaClientLike` interface; Drizzle and Kysely use `any`. Should standardize with minimal interfaces for all three.

### Import conventions

- **Subpath imports from better-auth**: `better-auth/plugins`, `better-auth/next-js`, `better-auth/adapters/drizzle`, `better-auth/adapters/prisma`, `better-auth/client` — all are official subpath exports, acceptable.
- **Separate package**: `@better-auth/kysely-adapter` — this is a separate package, different from the others which use subpath imports. Consistent with Better Auth's package structure.
- **No imports from better-auth internals**: ✓ (no `better-auth/internal/*` or `@better-auth/core/*` deep imports)

### File naming conventions

- **Adapters**: `prisma.adapter.ts`, `drizzle.adapter.ts`, `kysely.adapter.ts` ✓
- **Components**: `src/components/auth/*.tsx`, `src/components/user/*.tsx` ✓
- **Hooks**: `src/hooks/use-*.ts` ✓
- **Actions**: `src/lib/auth/actions/*.ts` — differs from AGENTS.md "features" pattern but is a reasonable alternative structure
- **Docs**: `docs/*.md` ✓

---

## Score by Phase

| Phase       | Score      | Notes                                                                       |
| ----------- | ---------- | --------------------------------------------------------------------------- |
| 1           | 7/10       | Strong architecture, but `any` in adapters and missing JSDoc on core APIs   |
| 2           | 8/10       | Clean patterns, but hardcoded redirect paths and `as string` casts          |
| 3           | 9/10       | Well-structured, follows Phase 2 patterns consistently                      |
| 4           | 7/10       | Good hooks/middleware, but hardcoded middleware paths and role access casts |
| 5           | 7/10       | Clean components, but no JSDoc on any component and potential XSS           |
| 6           | 8/10       | Comprehensive docs and DX tools, but missing JSDoc on script utilities      |
| **Overall** | **7.7/10** | Solid foundation with clear improvement path                                |

---

## Recommendations

### High Priority (before production)

1. **Replace `any` with proper interfaces** in `drizzle.adapter.ts` and `kysely.adapter.ts`. Define minimal `DrizzleLike` and `KyselyLike` interfaces similar to `PrismaClientLike` in `prisma.adapter.ts`.

2. **Replace `z.any()` with `z.unknown()`** in `schema.ts:43` for the `client` field.

3. **Add JSDoc to all exported symbols** — especially `defineAuthConfig`, all adapter functions, all UI components, and all hook return types. This is a hard requirement per AGENTS.md.

4. **Make hardcoded redirect paths config-driven** — extract `"/dashboard"`, `"/login"`, and `"/settings/2fa"` to read from `auth.config.ts` or a shared constants module.

5. **Sanitize `dangerouslySetInnerHTML`** in `two-factor-setup-form.tsx:33` — the TOTP URI from the server should be rendered as a QR code image, not raw HTML.

6. **Add `protectedPaths` and `roleRestrictions` to `auth.config.ts`** schema so middleware configuration flows from the central config.

### Medium Priority

7. **Consolidate role access pattern** — the `Record<string, unknown>` cast for `session.user.role` appears in 4 files. Create a `getUserRole(session)` utility.

8. **Add inline comments to `as` casts** in `mapper.ts` explaining why each cast is necessary (per AGENTS.md rule).

9. **Complete `docs/react-hooks.md`** — document all 12 hooks, not just `useAuth` and `useSession`.

10. **Add JSDoc to script utilities** (`generateAuthConfigFile`, `collectEnvVars`, `formatEnvVar`, `generateEnvExample`).

### Low Priority

11. **Make adapter provider configurable** — currently hardcoded to PostgreSQL. Add a `provider` field to `DatabaseConfig` or detect from URL.

12. **Add component-level JSDoc** to all 11 UI components with `@example` tags.

13. **Update `docs/ui-components.md`** to include `TwoFactorVerifyForm` and `BackupCodesDisplay` in the component table.
