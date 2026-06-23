# Session Management

## Overview

Session management controls how authenticated user sessions are created, stored,
and validated. This starter kit supports two strategies: **JWT** (default) and
**Database**.

Configure the strategy in `auth.config.ts`:

```typescript
export default defineAuthConfig({
  session: {
    expiresIn: "7d",
    strategy: "jwt", // or "database"
    cookieName: "auth_session",
  },
});
```

---

## JWT Strategy (Default)

Session data is encoded into a signed JWT stored in a client-side cookie. The
server validates the JWT on each request without a database lookup.

**Pros:**
- Stateless — no database reads per request for session validation
- Faster request processing (no DB round-trip)
- Scales horizontally without shared session storage

**Cons:**
- Cannot revoke individual sessions without maintaining a blocklist
- Session data is limited by cookie size (~4 KB)
- Sensitive data must not be stored in the JWT payload

**When to use:**
- Standard web applications
- High-traffic APIs where scalability is critical
- Applications where immediate session revocation is not required

---

## Database Strategy

A unique session ID is stored in the cookie; the actual session data lives in the
database. Every authenticated request performs a database lookup to retrieve the
session.

**Pros:**
- Individual sessions can be revoked instantly (delete the DB row)
- No limit on session data size
- Full audit trail of active sessions per user
- Better for applications handling sensitive data

**Cons:**
- Requires a database query on every authenticated request
- Higher per-request latency under load
- Requires a session table in the database schema

**When to use:**
- Admin dashboards and financial applications
- Apps requiring device-level session management
- Applications where session revocation is a compliance requirement

---

## `getServerSession()` Utility

A thin wrapper around `auth.api.getSession()` that automatically injects request
headers. Use this in Server Components and Server Actions.

```typescript
import { getServerSession } from "@/lib/auth/server-utils";

// Server Component
export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    return <p>Please sign in to access this page.</p>;
  }

  return <p>Welcome, {session.user.name}!</p>;
}
```

```typescript
import { getServerSession } from "@/lib/auth/server-utils";

// Server Action
export async function deleteAccount() {
  const session = await getServerSession();
  if (!session) throw new Error("Unauthorized");

  // Proceed with deletion
}
```

The returned `Session` type includes any custom fields configured via
`user.additionalFields` (e.g., `role` when roles are enabled).

---

## Migration Note: Switching to Database Strategy

When you set `strategy: "database"` in `auth.config.ts`, Better Auth
automatically creates and manages a `session` table through the configured
database adapter.

1. **Run a migration** to create the `session` table:

   ```bash
   # Prisma
   npx prisma migrate dev --name add-sessions

   # Drizzle
   pnpm db:generate
   pnpm db:migrate
   ```

2. **Verify** the `session` table exists with columns for `id`, `userId`,
   `token`, `expiresAt`, `createdAt`, and `updatedAt`.

3. **Existing users will need to sign in again** — the migration does not
   convert existing JWT sessions to database sessions.

No code changes are needed in `auth.config.ts` beyond setting the `strategy`
field. The mapper handles the rest.
