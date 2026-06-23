# Role & Permission System

Simple role-based access control using Better Auth's `additionalFields`.

## Config

### Enable roles

```typescript
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  features: {
    roles: {
      enabled: true,
      defaultRole: "user",
      roles: ["user", "admin"],
    },
  },
});
```

### Configuration options

| Option         | Type       | Default           | Description                        |
|----------------|------------|-------------------|------------------------------------|
| `enabled`      | `boolean`  | `false`           | Enable or disable the role system  |
| `defaultRole`  | `string`   | `"user"`          | Default role assigned on sign-up   |
| `roles`        | `string[]` | `["user","admin"]`| Valid roles (acts as an enum)      |

## How it works

The `role` field is added to the user schema via Better Auth's
`user.additionalFields`. It is:

- **Not user-inputtable** — `input: false` means it's always set by the system.
- **Required** — every user gets a role on sign-up.
- **Defaulted** — uses `config.features.roles.defaultRole`.

### Default role assignment on registration

When a new user registers via `auth.api.signUpEmail()`, Better Auth
automatically assigns the `defaultValue` (from `config.features.roles.defaultRole`)
to the user's `role` field. No custom Server Action logic is needed.

### Database migration

Enable `roles` in `auth.config.ts`, then run a database migration:

```bash
# Prisma
npx prisma migrate dev --name add-role-field

# Drizzle / Kysely
# Create and run a migration to add a `role` column (text/enum) to the user table.
```

The `role` field definition is automatically handled by Better Auth's
database adapters based on `user.additionalFields`.

## Server-side usage

### `hasRole`

```typescript
import { hasRole } from "@/lib/auth/server-utils";
import { auth } from "@/auth/server";
import { headers } from "next/headers";

const session = await auth.api.getSession({ headers: await headers() });

if (hasRole(session, "admin")) {
  // Allow admin-only action
}

if (hasRole(session, ["admin", "editor"])) {
  // Allow admin or editor
}
```

| Param     | Type                         | Description                          |
|-----------|------------------------------|--------------------------------------|
| `session` | `Session \| null \| undefined` | Server session from `auth.api.getSession()` |
| `role`    | `string \| string[]`          | Single role or list of accepted roles |

| Returns   | Description                          |
|-----------|--------------------------------------|
| `boolean` | `true` if user has one of the roles  |

## Client-side hooks

### `useRole`

```tsx
import { useRole } from "@/hooks/use-role";

function ProfileBadge() {
  const role = useRole();
  return <span>Role: {role ?? "guest"}</span>;
}
```

Returns the user's role string from the session, or `undefined` if
not logged in.

### `useHasRole`

```tsx
import { useHasRole } from "@/hooks/use-has-role";

function AdminPanel() {
  const isAdmin = useHasRole("admin");
  if (!isAdmin) return null;
  return <div>Admin panel</div>;
}
```

| Param  | Type               | Description                        |
|--------|--------------------|------------------------------------|
| `role` | `string \| string[]` | Single role or list of accepted roles |

| Returns   | Description                            |
|-----------|----------------------------------------|
| `boolean` | `true` if user has one of the roles    |

## Related

- [Server Utils](../src/lib/auth/server-utils.ts)
- [useRole hook](../src/hooks/use-role.ts)
- [useHasRole hook](../src/hooks/use-has-role.ts)
- [Mapper (buildUserConfig)](../src/auth/mapper.ts)
