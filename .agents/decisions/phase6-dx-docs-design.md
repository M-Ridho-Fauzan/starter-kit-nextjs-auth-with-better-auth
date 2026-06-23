# Phase 6 — DX & Documentation Design

## Status: Planned

---

## Problem Statement

Phases 1–5 deliver a fully functional Next.js 16 auth starter kit with email/password, OAuth, 2FA, roles, session management, middleware, React hooks, and shadcn/ui components. However, the project currently lacks the developer experience (DX) tooling and documentation that makes it frictionless for new users to adopt:

1. **No `.env.example`** — users must manually figure out which environment variables are needed based on their config choices.
2. **No setup wizard** — users must hand-write `auth.config.ts` from scratch.
3. **No README.md** — the public face of the project is missing.
4. **`docs/index.md`** exists but may not cover all generated outputs.
5. **No scripts/ directory** — no tooling infra for running or testing DX commands.
6. **No test coverage** for the DX tooling itself.

---

## Constraints

- The `.env.example` generator **must read the resolved config** (after Zod defaults are applied), not raw user input — because enabled/disabled states determine which vars are required.
- The generator must be **re-usable by the setup wizard** — the wizard generates a config in memory, then calls the same function to produce `.env.example`.
- The setup wizard **must generate `auth.config.ts` from scratch** using a template string — no AST manipulation (too fragile).
- Scripts must run via `tsx` (TypeScript executor) — they import `.ts` files directly, including `auth.config.ts` which uses `@/` path aliases.
- No hardcoded env var names — the generator must derive them from the schema's OAuth provider structure (including custom providers with dynamic IDs).
- `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` are **always required** (Better Auth internal requirements) even though they aren't in our Zod schema.
- Must maintain TypeScript strict mode — no `any`, no `as unknown`.
- Must maintain `verbatimModuleSyntax` in tsconfig — imports/exports must use `type` modifier where appropriate.

---

## TypeScript Interfaces

### scripts/lib/generate-env.ts — Public API

```typescript
/**
 * Represents a single environment variable entry for .env.example.
 */
export interface EnvVarEntry {
  /** The environment variable name (e.g. "DATABASE_URL"). */
  key: string;
  /** The default/placeholder value (empty string if none). */
  value: string;
  /** Whether this var is required for the current config. */
  required: boolean;
  /** Human-readable description. */
  description: string;
}

/**
 * Generates the full content of .env.example as a string.
 *
 * @param config - The resolved AuthConfig (after Zod defaults applied).
 * @returns The .env.example file content with comments and section headers.
 */
export function generateEnvExample(config: AuthConfig): string;
```

### scripts/lib/generate-env.ts — Internal Helpers

```typescript
/** Internal: builds the ordered list of env var entries from config. */
export function collectEnvVars(config: AuthConfig): EnvVarEntry[];

/** Internal: formats a single var as .env lines (comment + assignment). */
export function formatEnvVar(entry: EnvVarEntry): string;
```

### scripts/lib/write-config.ts — Config Template Generator

```typescript
/**
 * User selections from the setup wizard.
 */
export interface SetupSelections {
  database: {
    adapter: "prisma" | "drizzle" | "kysely" | "mongoose";
    url: string;
  };
  features: {
    emailPassword: { enabled: boolean; requireEmailVerification: boolean; passwordMinLength: number };
    passwordReset: boolean;
    oauth: {
      github: { enabled: boolean; clientId: string; clientSecret: string };
      google: { enabled: boolean; clientId: string; clientSecret: string };
      custom: Array<{ id: string; clientId: string; clientSecret: string }>;
    };
    twoFactor: { enabled: boolean };
    roles: { enabled: boolean; defaultRole: string; roles: string[] };
  };
  session: {
    strategy: "jwt" | "database";
    expiresIn: string;
    cookieName: string;
  };
  ui: {
    redirectAfterLogin: string;
    redirectAfterLogout: string;
  };
}

/**
 * Generates the TypeScript source code for auth.config.ts.
 *
 * @param selections - User choices from the setup wizard.
 * @returns The complete file content as a string.
 */
export function generateAuthConfigFile(selections: SetupSelections): string;
```

---

## File Structure

```
starterkit-auth-nextjs/
├── scripts/
│   ├── lib/
│   │   ├── generate-env.ts          — Core logic: collectEnvVars(), formatEnvVar(), generateEnvExample()
│   │   ├── generate-env.test.ts     — Test suite for generate-env.ts (vitest)
│   │   ├── write-config.ts          — Core logic: generateAuthConfigFile() template builder
│   │   └── write-config.test.ts     — Test suite for write-config.ts (vitest)
│   │
│   ├── generate-env.example.ts      — Entry point: imports auth.config.ts → writes .env.example
│   ├── setup.ts                     — Entry point: interactive @clack/prompts wizard
│   └── setup.test.ts                — Integration test: mock @clack/prompts, verify outputs
│
├── README.md                        — New: public-facing project documentation
├── docs/
│   └── index.md                     — Updated: ensure all 14 docs are linked, add setup/generate-env docs
├── tsconfig.json                    — Updated: add "scripts/**/*.ts" to "include"
├── package.json                     — Updated: add scripts entries + @clack/prompts + tsx deps
├── AGENTS.md                        — Updated: mark Phase 6 checklist items [x]
└── .env.example                     — Output of generate-env script (git-committed example)
```

---

## Implementation Notes

### 1. `scripts/lib/generate-env.ts` — Core Env Generator

**Which env vars to generate and when:**

| Env Var | Condition | Always? |
|---|---|---|
| `DATABASE_URL` | Always (starter kit convention — even if `client` used) | Yes |
| `BETTER_AUTH_SECRET` | Always required by Better Auth internally | Yes |
| `BETTER_AUTH_URL` | Always required by Better Auth internally | Yes |
| `GITHUB_CLIENT_ID` | `oauth.github.enabled === true` | No |
| `GITHUB_CLIENT_SECRET` | `oauth.github.enabled === true` | No |
| `GOOGLE_CLIENT_ID` | `oauth.google.enabled === true` | No |
| `GOOGLE_CLIENT_SECRET` | `oauth.google.enabled === true` | No |
| `{ID}_CLIENT_ID` | For each custom provider where `enabled === true` | No |
| `{ID}_CLIENT_SECRET` | For each custom provider where `enabled === true` | No |

**Edge cases:**
- If a feature (e.g., OAuth GitHub) exists in config but `enabled: false`, its env vars must appear **commented out** so the user knows they exist.
- If `oauth` section is entirely omitted (undefined after defaults), all OAuth vars are commented out.
- Custom OAuth providers: the `id` field is used to generate `{UPPERCASE_ID}_CLIENT_ID` and `{UPPERCASE_ID}_CLIENT_SECRET`.
- Non-alphanumeric characters in custom provider IDs should be replaced with underscores, and the result uppercased (e.g., `id: "my-provider"` → `MY_PROVIDER_CLIENT_ID`).
- `BETTER_AUTH_SECRET` should warn if user doesn't set a 32+ char secret — but in .env.example, just put a placeholder comment.
- For `database.url`, if the config uses `database.client` instead, still include `DATABASE_URL` as a documented optional var (starter kit convention).

**Output format:**
```env
# ─── Database ───

# Database connection URL (required)
DATABASE_URL=

# ─── Better Auth ───

# Secret key for token signing (min 32 characters, required)
BETTER_AUTH_SECRET=

# Your application's public URL (required)
BETTER_AUTH_URL=

# ─── OAuth Providers ───

# GitHub OAuth App client ID (required when GitHub OAuth is enabled)
# GITHUB_CLIENT_ID=

# GitHub OAuth App client secret (required when GitHub OAuth is enabled)
# GITHUB_CLIENT_SECRET=
```

### 2. `scripts/lib/write-config.ts` — Config Template Generator

**Template approach:**
Use a template literal function that maps `SetupSelections` to a valid `auth.config.ts` source file. The template must:
- Always include `defineAuthConfig` import
- Include `process.env.X!` references matching the env var names from the generator
- Only include enabled features
- Only include OAuth providers that are enabled
- Use proper TypeScript formatting

**Edge cases:**
- If `emailPassword.enabled === false`, the entire `emailPassword` section can be omitted from the generated file (Zod defaults handle it).
- If `passwordReset === false`, omit it.
- If `twoFactor.enabled === false`, omit the section.
- If `roles.enabled === false`, omit the section.
- If no OAuth providers are enabled, omit the entire `oauth` section.
- The `ui` section can always be included with defaults.

### 3. `scripts/generate-env.example.ts` — Entry Point

```typescript
// Thin wrapper — imports config, calls generateEnvExample, writes file.
// Must handle: missing auth.config.ts, write errors gracefully.
// Must use fs/promises for async write.
// Should log a success message with emoji.
```

**How config is imported:**
```typescript
// Script runs via: npx tsx scripts/generate-env.example.ts
// tsx resolves @/ path alias via tsconfig paths — BUT tsconfig.json
// currently doesn't include scripts/. We need to either:
// Option A: Add "scripts/**/*.ts" to root tsconfig.json include
// Option B: Create scripts/tsconfig.json that extends root and adds its own include
//
// Decision: Option A — simpler, keeps one tsconfig. The root tsconfig already
// has allowImportingTsExtensions and noEmit, so adding scripts/ is safe.
```

### 4. `scripts/setup.ts` — Setup Wizard

**Prompt flow using @clack/prompts:**

```
Step 1:  intro banner: "⚡ NextJS Auth Starter Kit Setup"

Step 2:  select("Which database adapter do you want to use?")
         choices: ["prisma", "drizzle", "kysely", "mongoose"]

Step 3:  text("Enter your database connection URL")
         placeholder: "postgresql://localhost:5432/mydb"
         validate: non-empty

Step 4:  confirm("Enable email/password authentication?")

Step 5:  if emailPassword: confirm("Require email verification before sign-in?")

Step 6:  confirm("Enable password reset?")

Step 7:  confirm("Enable GitHub OAuth?")
         if yes: text("GitHub Client ID"), password("GitHub Client Secret")

Step 8:  confirm("Enable Google OAuth?")
         if yes: text("Google Client ID"), password("Google Client Secret")

Step 9:  custom OAuth loop:
         confirm("Add a custom OAuth provider?")
         if yes: text("Provider ID (e.g. 'microsoft')")
                 text("Client ID"), password("Client Secret")
         repeat until user declines

Step 10: confirm("Enable two-factor authentication (TOTP)?")

Step 11: confirm("Enable role-based access control?")
         if yes: text("Default role name"), default: "user"
                 text("Comma-separated roles"), default: "user,admin"

Step 12: select("Session strategy")
         choices: ["jwt", "database"]

Step 13: text("Session expiry duration"), default: "7d"

Step 14: text("Redirect URL after login"), default: "/dashboard"

Step 15: text("Redirect URL after logout"), default: "/"

Step 16: confirm("Generate auth.config.ts and .env.example?")

Step 17: outro with next steps
```

**Edge cases:**
- Handle `isCancel()` from @clack prompts — exit gracefully with a message.
- Validate database URL is non-empty and looks like a URL.
- Validate session expiry is a valid duration string.
- If user disables a section in a prior step, skip follow-up questions.
- If user wants to add many custom OAuth providers, the loop must support that.
- If user runs the wizard in a non-empty directory, warn before overwriting `auth.config.ts`.
- The wizard should NOT install npm dependencies — that's the user's job after setup.

**Integration with env generator:**
After building the `SetupSelections` object, the wizard:
1. Calls `generateAuthConfigFile(selections)` to get the `auth.config.ts` content.
2. Converts selections into an `AuthConfig` object (using `defineAuthConfig` from the schema module) to pass to `generateEnvExample()`.
3. Writes both files to disk.

**Alternative:** The wizard could avoid importing `defineAuthConfig` (which would pull in the whole auth module) and instead use a lighter approach — build a partial config object and pass it to a standalone `collectEnvVars` function. This is cleaner.

Actually, since the wizard runs via `tsx` and has access to the full source tree, importing `defineAuthConfig` is fine. But to avoid side effects (like importing `auth.config.ts` which imports the real config), the wizard should import from the library directly:

```typescript
import { defineAuthConfig } from "../src/auth/config";
```

This would validate the in-memory config and give us a properly defaulted `AuthConfig` object to pass to `generateEnvExample()`.

### 5. `scripts/generate-env.test.ts` — Test Suite

**Test scenarios:**

1. **Minimal config** (database only, no features):
   - Input: `{ database: { adapter: "prisma", url: "..." } }` (all other sections defaulted)
   - Expected: vars include DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL
   - Expected: GITHUB_CLIENT_ID is commented out
   - Expected: GOOGLE_CLIENT_ID is commented out
   - Total uncommented vars: 3 (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL)

2. **GitHub OAuth enabled**:
   - Input with `features.oauth.github.enabled: true`
   - Expected: GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET uncommented

3. **Google OAuth enabled**:
   - Input with `features.oauth.google.enabled: true`
   - Expected: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET uncommented

4. **Custom OAuth provider**:
   - Input with `features.oauth.custom: [{ id: "microsoft", clientId: "", clientSecret: "", enabled: true }]`
   - Expected: MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET generated

5. **All features enabled**:
   - All OAuth providers + custom + all features
   - Expected: all vars uncommented

6. **Provider names are sanitized**:
   - Input with `id: "my-custom-provider"`
   - Expected: MY_CUSTOM_PROVIDER_CLIENT_ID (hyphen → underscore, uppercase)

7. **Disabled features still produce commented vars**:
   - Input with `features.oauth.github.enabled: false`
   - Expected: GITHUB_CLIENT_ID present but commented out

**Testing strategy:**
- Import `collectEnvVars` and `generateEnvExample` directly (vitest can resolve `@/` via the same alias config).
- Use `defineAuthConfig(minimalConfig)` to produce a defaulted config for tests.

### 6. `scripts/setup.test.ts` — Setup Wizard Test Suite

**Testing strategy:**
- Mock `@clack/prompts` using `vi.mock("@clack/prompts")`.
- Mock `fs/promises` using `vi.mock("node:fs/promises")`.
- `@clack/prompts` exports: `intro`, `outro`, `select`, `confirm`, `text`, `password`, `isCancel`.
- Each prompt function returns a Promise. Mock them to return specific values in order.
- Test that the generated `auth.config.ts` content matches expected template output.

**Test scenarios:**

1. **Default flow** (all defaults, minimal interaction):
   - Mock: database adapter "prisma", URL "postgresql://...", all features declined
   - Expected: generated config has no feature sections, uses defaults

2. **Full featured flow**:
   - Mock: all features enabled, GitHub + Google OAuth with credentials, custom provider
   - Expected: generated config matches expected template

3. **Cancellation**:
   - Mock: first prompt returns cancel signal
   - Expected: script exits gracefully, no files written

4. **Partial feature selection**:
   - Mock: email/password enabled, password reset enabled, OAuth declined, 2FA declined, roles enabled
   - Expected: generated config includes only those feature sections

### 7. `README.md`

**Required sections** (fully self-contained — no links that 404):

```
# NextJS Auth Starter Kit

A production-grade Next.js 16 authentication starter kit built on Better Auth
with a single auth.config.ts entry point. Config-driven, type-safe, and fully
extensible.

## Features

- [x] Email & Password authentication
- [x] Email verification
- [x] Password reset
- [x] OAuth (GitHub, Google, custom providers)
- [x] Two-factor authentication (TOTP)
- [x] Role-based access control
- [x] Session management (JWT & database strategies)
- [x] Auth middleware for route protection
- [x] React hooks (useAuth, useSession)
- [x] shadcn/ui auth components
- [x] Database adapters (Prisma, Drizzle, Kysely)

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL (or your chosen database)

### Installation

```bash
git clone <repo-url>
cd starterkit-auth-nextjs
pnpm install
```

### Configuration

1. **Run the setup wizard:**
   ```bash
   pnpm setup
   ```

2. **Or configure manually** by editing `auth.config.ts` then:
   ```bash
   pnpm generate-env
   cp .env.example .env
   ```

3. **Set up your database:**
   ```bash
   # For Prisma:
   npx prisma migrate dev

   # For Drizzle:
   npx drizzle-kit push

   # For Kysely:
   # Run your migration tool
   ```

4. **Start the dev server:**
   ```bash
   pnpm dev
   ```

## Configuration

[Overview of auth.config.ts with the target API from AGENTS.md]

## Project Structure

[Directory tree showing src/ layout]

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js dev server |
| `pnpm build` | Build for production |
| `pnpm typecheck` | Run TypeScript type check |
| `pnpm test` | Run all tests |
| `pnpm generate-env` | Generate .env.example from current config |
| `pnpm setup` | Interactive setup wizard |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Database connection URL |
| `BETTER_AUTH_SECRET` | Yes | Secret for token signing (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | Public URL of your app |
| `GITHUB_CLIENT_ID` | If GitHub OAuth | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | If GitHub OAuth | GitHub OAuth App client secret |
| `GOOGLE_CLIENT_ID` | If Google OAuth | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | If Google OAuth | Google OAuth client secret |
| `{ID}_CLIENT_ID` | Per custom provider | Custom OAuth provider client ID |
| `{ID}_CLIENT_SECRET` | Per custom provider | Custom OAuth provider client secret |

## Documentation

[Links to docs/index.md or individual markdown files]

## License

MIT
```

### 8. `docs/index.md` Update

The current `docs/index.md` already lists 14 documents. Verify all links are correct and add a "DX Tools" section if needed (for setup wizard docs if we decide to create them). For now, the index is likely complete since docs for each feature already exist.

### 9. `tsconfig.json` Update

Add to the `include` array:
```json
"scripts/**/*.ts"
```

This ensures `tsx` can resolve `@/` path aliases in scripts (since the paths are defined in the root tsconfig).

Note: When `verbatimModuleSyntax` is on, TypeScript enforces that type-only imports use the `type` keyword. The scripts directory must follow the same rule, which is fine.

### 10. `package.json` Updates

**New dependencies:**
```json
{
  "devDependencies": {
    "@clack/prompts": "^0.9.0",
    "tsx": "^4.19.0"
  }
}
```

**New scripts:**
```json
{
  "scripts": {
    "generate-env": "tsx scripts/generate-env.example.ts",
    "setup": "tsx scripts/setup.ts"
  }
}
```

---

## Implementation Order (Dependency Graph)

```
Step 1: Update tsconfig.json (add "scripts/**/*.ts" to include)
   ↓
Step 2: Install dependencies (@clack/prompts, tsx) + update package.json scripts
   ↓
Step 3: Create scripts/lib/generate-env.ts (core logic — no side effects, testable)
   ↓
Step 4: Create scripts/lib/generate-env.test.ts (verify env generation logic)
   ↓
Step 5: Create scripts/generate-env.example.ts (thin entry point — write file)
   ↓
Step 6: Update docs/index.md (ensure all docs are linked)
   ↓
Step 7: Create scripts/lib/write-config.ts (template builder for auth.config.ts)
   ↓
Step 8: Create scripts/lib/write-config.test.ts (verify template output)
   ↓
Step 9: Create scripts/setup.ts (interactive wizard using @clack/prompts)
   ↓
Step 10: Create scripts/setup.test.ts (mock @clack/prompts, verify end-to-end)
   ↓
Step 11: Create README.md with full documentation
   ↓
Step 12: Run pnpm typecheck && pnpm test
   ↓
Step 13: Generate .env.example by running pnpm generate-env
   ↓
Step 14: Update AGENTS.md — mark Phase 6 items [x]
   ↓
Step 15: Update PLAN.md — set Current Phase to "Complete"
```

---

## Open Questions / Decisions to Make

1. **Should `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` be added to the Zod schema?**
   - Pro: They'd flow from `auth.config.ts` like everything else.
   - Con: They're not user-facing UX features — they're Better Auth infrastructure. Users already set them in `.env`.
   - **Decision: No** — keep them as env-only vars. The schema documents features, not infra. Document them in `.env.example` and README.

2. **Should the setup wizard generate a full `auth.config.ts` with all sections even if disabled (commented out)?**
   - Option A: Only include enabled sections.
   - Option B: Include all sections, with disabled ones commented out as a reference.
   - **Decision: Option A** — cleaner, less noise. Zod defaults handle the rest.

3. **Should the setup wizard also run database migrations?**
   - Pro: Full "one command setup" experience.
   - Con: Fragile — Prisma, Drizzle, Kysely use different migration CLIs. User may not want auto-migration.
   - **Decision: No** — just print the migration command for the user to run manually.

4. **Should we create a separate `scripts/tsconfig.json` or reuse the root one?**
   - Option A: Add `"scripts/**/*.ts"` to root tsconfig's `include`.
   - Option B: Create `scripts/tsconfig.json` extending root.
   - **Decision: Option A** — simpler. The root tsconfig has `noEmit` so adding scripts won't break anything. However, we should verify that tsconfig includes `auth.config.ts` paths properly when running scripts.

5. **Should `docs/setup.md` be created?**
   - Pro: Documents the setup wizard for users.
   - Con: The README already covers quick start. Docs/ is for feature details.
   - **Decision: No** — the setup wizard is self-documenting (interactive prompts with descriptions). README quick start section is sufficient.

6. **Should the `.env.example` be committed to git?**
   - Yes — it's an example file, not a secrets file. It should be in the repo. The user copies it to `.env`.

---

## Sign-off

Ready for Build: Phase 6 DX & Documentation
