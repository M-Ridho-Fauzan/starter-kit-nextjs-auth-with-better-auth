# AGENTS.md — NextJS Auth Starter Kit

## Project Overview

A production-grade Next.js 16 authentication starter kit inspired by
Laravel Jetstream & Breeze. Built on Better Auth with a single
`auth.config.ts` entry point. Flexible, config-driven, fully documented.

**Stack target**: Next.js 16 (App Router), Better Auth, TypeScript strict,
shadcn/ui, Tailwind CSS v4.

---

## Agent Roles & When to Use Each

### architect (Plan mode — gemini-2.5-pro)

Activated when: starting a new feature, resolving design ambiguity,
choosing between implementation patterns, or designing adapter interfaces.

Responsibilities:

- Design TypeScript interfaces and types BEFORE any code is written
- Evaluate trade-offs between approaches
- Output every decision to `.agents/decisions/[feature]-design.md`
- Never write implementation code — only specs and interfaces
- Must answer: "How does the user configure this from auth.config.ts?"

### builder (Build mode — deepseek-v4-flash)

Activated when: a feature has a completed design doc in `.agents/decisions/`.

Responsibilities:

- Read the relevant design doc FIRST, then implement exactly what is specified
- One feature at a time — do not start next feature until current passes typecheck
- Run `pnpm typecheck && pnpm test` after every implementation
- Call `write-docs` command after each completed feature
- Update the checklist in this file after each completed item

### docs-writer

Activated by: the `write-docs` command or directly by builder after feature completion.

Responsibilities:

- Generate `docs/[feature].md` using the docs-writing skill
- Document: purpose, config options, default values, usage examples, caveats
- Update `docs/index.md` table of contents
- Never document unimplemented features

### reviewer

Activated by: the `reviewer` command or manually before any PR/release.

Responsibilities:

- Check TypeScript strict compliance
- Verify every public API has JSDoc
- Verify config options are properly typed and documented
- Check adapter pattern consistency across ORM adapters
- Output review to `.agents/reviews/[feature]-review.md`

---

## Code Standards (enforced by all agents)

- TypeScript strict mode — no `any`, no `as unknown`
- Every exported function, type, and interface must have JSDoc
- All configurable values must flow from `auth.config.ts` — zero hardcoding
- File naming conventions:
  - Adapters: `src/auth/adapters/[name].adapter.ts`
  - Features: `src/auth/features/[name]/index.ts`
  - Components: `src/components/auth/[name].tsx`
  - Hooks: `src/hooks/use-[name].ts`
  - Docs: `docs/[feature].md`
- No direct imports from better-auth internals — always use the create-auth-skill patterns
- Every feature must export a proper TypeScript type for its config section

---

## auth.config.ts Target API

This is the north star. Every decision should serve making this API clean:

```typescript
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  database: {
    adapter: "prisma", // "drizzle" | "kysely" | "mongoose"
    url: process.env.DATABASE_URL!,
  },
  features: {
    emailPassword: {
      enabled: true,
      requireEmailVerification: true,
      passwordMinLength: 8,
    },
    passwordReset: true,
    oauth: {
      github: {
        enabled: true,
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
      google: {
        enabled: false,
        clientId: "",
        clientSecret: "",
      },
    },
    twoFactor: {
      enabled: false,
      methods: ["totp"],
    },
    roles: {
      enabled: false,
      defaultRole: "user",
      roles: ["user", "admin"],
    },
  },
  session: {
    expiresIn: "7d",
    strategy: "jwt", // "database"
    cookieName: "auth_session",
  },
  ui: {
    theme: "shadcn",
    redirectAfterLogin: "/dashboard",
    redirectAfterLogout: "/",
  },
});
```

---

## Feature Implementation Checklist

Builder updates this after each completed item. Architect must create a
design doc before any item is marked in-progress.

### Phase 1 — Core Foundation

- [x] `auth.config.ts` schema + TypeScript types (`defineAuthConfig`)
- [x] Better Auth core setup + adapter interface
- [x] Database adapter: Prisma
- [x] Database adapter: Drizzle
- [x] Database adapter: Kysely

### Phase 2 — Auth Features

- [x] Email + password registration & login
- [x] Email verification
- [x] Password reset flow
- [x] OAuth: GitHub
- [x] OAuth: Google
- [x] OAuth: extensible for custom providers

### Phase 3 — Advanced Features

- [x] Two-factor authentication (TOTP)
- [x] Role & permission system
- [x] Session management (JWT & DB strategy)

### Phase 4 — Next.js Integration

- [x] Auth middleware (`middleware.ts`)
- [x] Server-side session utilities (`getServerSession()`)
- [x] React hooks: `useAuth`, `useSession`
- [x] Protected route example (`examples/protected-layout.example.tsx`)

### Phase 5 — UI Layer

- [x] shadcn/ui auth forms (login, register, forgot-password, reset-password, resend-verification, social-login)
- [x] Auth layout component
- [x] User profile component
- [x] Theme config from `auth.config.ts` (CSS variables ready, `.dark` class supported)

### Phase 6 — DX & Documentation

- [x] Auto-generated `docs/` per feature
- [x] `docs/index.md` master index
- [x] `.env.example` generator script
- [x] Setup wizard CLI (`scripts/setup.ts`)
- [x] README.md

---

## Do NOT Rules (all agents must respect)

- Do NOT hardcode any database URL, secret, or credential
- Do NOT import from better-auth package internals — use create-auth-skill
- Do NOT create UI components without checking `auth.config.ts ui` section
- Do NOT mark a checklist item complete without running typecheck
- Do NOT start a new feature if the current one has failing tests
- Do NOT write docs for features not yet implemented
- Do NOT use `any` type even as temporary placeholder — use `unknown`

---

## Session Workflow

Each OpenCode session should follow this pattern:

1. **Read** this file + `PLAN.md` at session start
2. **Check** `.agents/decisions/` for any pending design docs
3. **Execute** one checklist item per session (Plan → Build → Docs → Review)
4. **Update** checklist in this file after completion
5. **Commit** with message: `feat([feature]): [what was done]`

---

## Post-Review Improvements (Session 2026-06-23)

All issues from `.agents/reviews/full-project-review.md` High Priority section fixed:

### TypeScript strict compliance
- **`any` removed**: `drizzle.adapter.ts` — created `DrizzleLike` interface; `kysely.adapter.ts` — uses `Parameters<typeof kyselyAdapter>[0]` type inference; `schema.ts:43` — `z.any()` → `z.unknown()`
- **JSDoc added**: All missing exported functions (`defineAuthConfig`, `registerAdapter`, `resolveAdapter`, `hasAdapter`, all 8 hooks, all 11 UI components, all script utilities)
- **JSDoc added**: All missing exported types (`OAuthProviderSelections`, `CustomOAuthProviderSelections`, `SetupSelections`, `EnvVarEntry`, re-exported config types)

### Config-driven compliance
- **Hardcoded redirects fixed**: `email-password.ts:50`, `email-verification.ts:81` → `config.ui.redirectAfterLogin`; `password-reset.ts:91` → `config.ui.redirectAfterLogout`
- **New UiConfig fields**: `twoFactorSettingsPath` (default `"/settings/2fa"`), `protectedPaths` (default `["/dashboard", "/settings"]`), `roleRestrictions` (default `{"/admin": ["admin"]}`)
- **middleware.ts**: reads `protectedPaths` and `roleRestrictions` from `auth.config.ts`
- **user-profile.tsx**: reads `twoFactorSettingsPath` from config

### Security
- **XSS fixed**: `two-factor-setup-form.tsx` — replaced `dangerouslySetInnerHTML` with `<QRCodeSVG>` from `qrcode.react`

### Code quality
- **Role access consolidated**: `getUserRole(session)` utility added to `server-utils.ts`, used by `hasRole()` and `middleware.ts`
- **Test files updated**: All 5 test files importing modules that reference `auth.config.ts` now properly mock it
- **166/166 tests passing**, typecheck clean
