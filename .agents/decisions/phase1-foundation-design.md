# Phase 1 — Core Foundation Design

> Status: **Approved** | Implemented by builder, reviewed by architect.

---

## Pending Decision Resolutions

### PD-001: Config Validation Strategy

**Decision: Option (c) — Zod for runtime validation + TypeScript types derived via `z.infer`**

**Rationale:**
- Better Auth itself uses Zod internally for endpoint body/query validation
- Single source of truth eliminates type/schema drift
- Runtime validation catches misconfiguration early
- Types via `z.infer<typeof Schema>` preserve full type safety with no `any`
- Pattern: `const config = AuthConfigSchema.parse(input)` for instant error on bad config

**Consequence for codebase:**
- `src/auth/config/schema.ts` — all Zod schemas
- `src/auth/config/types.ts` — re-exports `z.infer<...>` derived types
- `src/auth/config/index.ts` — `defineAuthConfig()` calls `AuthConfigSchema.parse()`

---

### PD-002: Adapter Interface Design

**Decision: Option (B) — Factory function returning adapter object**

**Rationale (based on better-auth research):**
- Better Auth's ORM adapters use factory functions: `prismaAdapter(prisma, { provider })`, `drizzleAdapter(db, { provider })`
- Built-in adapters accept a database instance directly
- A factory function is the simplest, most composable pattern
- No class overhead, easy to test with mocks

**Adapter contract:**
```typescript
type CreateAdapter = (config: DatabaseConfig) => unknown;
// Synchronous — adapter instantiation is synchronous.
// new PrismaClient(), new Pool(), etc. are all sync.
// Database connection happens lazily on first query.
```

**Implementation files:**
- `src/auth/adapters/types.ts` — `CreateAdapter` type
- `src/auth/adapters/index.ts` — registry `Map<string, CreateAdapter>` + `resolveAdapter()`
- `src/auth/adapters/prisma.adapter.ts` — factory wrapping `prismaAdapter()`
- `src/auth/adapters/drizzle.adapter.ts` — factory wrapping `drizzleAdapter()`
- `src/auth/adapters/kysely.adapter.ts` — factory wrapping built-in Kysely adapter

---

### PD-003: Server/Client Code Split

**Decision: `defineAuthConfig` is purely server-side. The `ui` section is metadata consumed by client helpers.**

| Config Section | Server Impact | Client Impact |
|---|---|---|
| `database` | Adapter instantiation | None (never sent to client) |
| `features.emailPassword` | `emailAndPassword` option | Client hook availability |
| `features.oauth.*` | `socialProviders` option | Sign-in button rendering |
| `features.twoFactor` | `twoFactor` plugin config | 2FA UI flow |
| `session` | `session` option + JWT/DB strategy | Cookie handling |
| `ui` | None (metadata only) | Theme, redirect URLs |

**Runtime flow:**
1. `defineAuthConfig()` validates and returns typed config
2. `src/auth/server.ts` imports config → calls `betterAuth()` with mapped options
3. Client code imports only `ui` section for redirects/theme
4. Client never sees database URLs or secrets

---

## File Structure

```
src/auth/
├── config/
│   ├── schema.ts              Zod schemas — single source of truth
│   │                          for runtime validation AND type inference.
│   │
│   ├── types.ts               Public TypeScript types, derived from
│   │                          Zod schema via z.infer<typeof Schema>.
│   │                          No hand-written types, zero drift.
│   │
│   ├── index.ts               Entry point publik. Ekspor:
│   │                          • defineAuthConfig() — validasi + return typed config
│   │                          • Semua type dari types.ts
│   │
│   └── index.test.ts          Test: valid/invalid config, default values,
│                              error messages, edge cases.
│
└── adapters/
    ├── types.ts               Type alias: type CreateAdapter = (cfg) => unknown
    │
    ├── index.ts               Registry: Map<string, CreateAdapter>
    │                          + resolveAdapter(config) untuk lookup & factory call.
    │
    ├── prisma.adapter.ts      Factory: createPrismaAdapter → prismaAdapter()
    │                          Handle url → new PrismaClient() atau client existing.
    │
    ├── drizzle.adapter.ts     Factory: createDrizzleAdapter → drizzleAdapter()
    │
    ├── kysely.adapter.ts      Factory: createKyselyAdapter → built-in Kysely
    │
    └── index.test.ts          Test: semua adapter factory bisa di-resolve,
                              error handling untuk adapter yg belum ada.
```

---

## Export Surface

`src/auth/config/index.ts` mengekspor:

```typescript
// ─── Function ───
export function defineAuthConfig(config: AuthConfig): AuthConfig;

// ─── Types — semua di-derive dari Zod schema ───
export type { AuthConfig };
export type { DatabaseConfig };
export type { SessionConfig };
export type { FeaturesConfig };
export type { EmailPasswordConfig };
export type { PasswordResetConfig };
export type { OAuthConfig };
export type { OAuthProviderConfig };
export type { TwoFactorConfig };
export type { RolesConfig };
export type { UiConfig };
```

**Tidak di-export:** Zod schemas (`AuthConfigSchema`, dll) — implementasi detail.

---

## CreateAdapter — Sync

```typescript
type CreateAdapter = (config: DatabaseConfig) => unknown;
```

Alasan **sync**:
- `new PrismaClient()` synchronous — koneksi terjadi lazy
- `prismaAdapter()`, `drizzleAdapter()` synchronous — cuma wrap existing client
- `new Pool()` synchronous
- User bisa kirim `client` (pre-initialized) atau `url` (kita buat client baru) — keduanya sync

---

## TypeScript Types Design (Ringkasan)

```
AuthConfig {
  database: DatabaseConfig          // { adapter, url?, client? }
  session: SessionConfig            // { expiresIn, strategy, cookieName, ... }
  features: FeaturesConfig          // wrapper untuk semua fitur
    ├── emailPassword: { enabled, requireEmailVerification, ... }
    ├── passwordReset: boolean | { expiresIn }
    ├── oauth: { github?, google?, custom? }
    ├── twoFactor: { enabled, methods }
    └── roles: { enabled, defaultRole, roles }
  ui: UiConfig                      // { theme, redirectAfterLogin, redirectAfterLogout }
}
```

Semua type di-derive dari Zod schemas via `z.infer`. Zod schemas adalah single source of truth. Setiap field punya default value yang masuk akal — config kosong tetap valid.
