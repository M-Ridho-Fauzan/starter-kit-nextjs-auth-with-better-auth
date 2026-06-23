# Middleware

## Overview

`src/middleware.ts` provides route protection for your Next.js app. It guards
both **authentication** (login required) and **authorization** (role-based
access) at the edge of the request pipeline — before any page renders.

The middleware runs on every matching request and checks the session cookie
before the page component is even invoked.

---

## Runtime: Node.js (not Edge)

Better Auth's database adapter factories call `require()` at initialization
(e.g. `@prisma/client`), which is **not available in the Edge Runtime**.

The middleware exports `runtime = "nodejs"` to run in Next.js's Node.js
runtime. This is a known limitation:

- Middleware still runs before the page renders (no performance regression)
- No cold-start penalty difference for typical Node.js deployments
- If true Edge Runtime is required, you must decode the session cookie
  manually using `jose` — this is not provided by the starter kit

---

## Route Protection

### Authentication (Login Required)

The middleware defines a list of protected path prefixes:

```typescript
const protectedPaths: string[] = ["/dashboard", "/settings", "/admin"];
```

Any request to these paths (or their sub-paths) without a valid session is
redirected to the login page. The original URL is passed as a `redirect` query
parameter so the user can be sent back after sign-in.

### Role-Based Authorization

Path-role mappings are defined in the `roleRestrictions` object:

```typescript
const roleRestrictions: Record<string, string[]> = {
  "/admin": ["admin"],
};
```

Users without the required role are redirected to the default authenticated
path (`/dashboard` by default).

---

## Customization

Edit `src/middleware.ts` directly to:

- Add or remove protected paths in the `protectedPaths` array
- Change role restrictions in the `roleRestrictions` object
- Modify the `matcher` config to include/exclude paths

```typescript
// Example: protect /dashboard for all authenticated users,
// /admin for admins only
const protectedPaths = ["/dashboard", "/settings", "/admin", "/api/private"];
const roleRestrictions = {
  "/admin": ["admin"],
  "/moderator": ["admin", "moderator"],
};
```

The `LOGIN_PATH` and `DEFAULT_AUTH_PATH` constants read from
`auth.config.ts` `ui.redirectAfterLogout` and `ui.redirectAfterLogin`
respectively. Update those values in your config to change redirect behavior.

---

## Matcher

The middleware's `config.matcher` determines which routes trigger the middleware:

```typescript
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|login|register|verify-email|forgot-password|reset-password|2fa).*)",
  ],
};
```

Public auth pages (`/login`, `/register`, etc.) and static assets are excluded.
Add any additional public paths to the negative lookahead group.
