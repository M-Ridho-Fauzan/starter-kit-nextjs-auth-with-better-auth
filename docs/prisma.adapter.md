# Prisma Database Adapter

Connects Better Auth to a PostgreSQL (or other Prisma-supported) database using Prisma ORM.

## Config

Configure via the `database` section of `auth.config.ts`:

```typescript
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  database: {
    adapter: "prisma",
    url: process.env.DATABASE_URL!,
  },
});
```

| Option     | Type   | Required | Description                                                                 |
|------------|--------|----------|-----------------------------------------------------------------------------|
| `adapter`  | `"prisma"` | yes   | Selects the Prisma adapter.                                                 |
| `url`      | `string`   | no   | Database connection string. Required unless `client` is provided.           |
| `client`   | `PrismaClient` | no | Pre-initialized PrismaClient instance. Overrides `url` when provided. |

## Registration

The adapter must be registered with the adapter registry before use:

```typescript
import { registerAdapter } from "@/auth/adapters";
import { createPrismaAdapter } from "@/auth/adapters/prisma.adapter";

registerAdapter("prisma", createPrismaAdapter);
```

This is typically done at app boot time (e.g., in the auth route handler or a server initializer).

## How It Works

1. `createPrismaAdapter` receives the `DatabaseConfig` object.
2. If `config.client` is provided, it uses that PrismaClient instance directly.
3. Otherwise, it dynamically imports `@prisma/client` and creates a new `PrismaClient` with `datasourceUrl: config.url`.
4. It calls `prismaAdapter(prisma, { provider: "postgresql" })` from `@better-auth/prisma-adapter` to produce a better-auth compatible adapter.
5. The adapter is returned as the `database` option to `betterAuth()`.

## Dynamic Import

The adapter uses `require("@prisma/client")` at runtime rather than a static import. This means:

- **Without Prisma:** A clear error is thrown at boot time: `Cannot find module '@prisma/client'`
- **With Prisma:** The adapter works normally after running `prisma generate`

You must have `@prisma/client` installed and generated (`prisma generate`) in your project for this adapter to function.

## Prerequisites

- `@prisma/client` installed
- `prisma` CLI installed and a `schema.prisma` file defined
- `prisma generate` has been run

## Default Provider

The adapter currently defaults to `"postgresql"` as the database provider. Change the provider in `prisma.adapter.ts` if using SQLite, MySQL, CockroachDB, etc.:

```typescript
provider: "sqlite"  // or "mysql" | "cockroachdb" | "sqlserver" | "mongodb"
```

## Serverless Databases (Neon, Supabase)

Serverless PostgreSQL providers like Neon and Supabase require SSL connections
and often benefit from connection pooling. Two approaches:

### 1. URL string (simple, `sslmode=require`)

Append `?sslmode=require` to the connection string for SSL enforcement:

```typescript
export default defineAuthConfig({
  database: {
    adapter: "prisma",
    url: "postgresql://user:pass@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});
```

Supported by Neon and Supabase when connecting directly via the provided
connection string.

### 2. Pre-initialized client (recommended for serverless)

For serverless environments (Vercel, Netlify, Cloudflare), create the client
externally to control pooling, SSL, and connection lifecycle:

**Neon (`@neondatabase/serverless`):**

```typescript
import { PrismaClient } from "@prisma/client";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

neonConfig.poolQueryViaFetch = true;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaNeon(pool);
const prisma = new PrismaClient({ adapter });

export default defineAuthConfig({
  database: {
    adapter: "prisma",
    client: prisma,
  },
});
```

**Supabase:**

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL!,
});

export default defineAuthConfig({
  database: {
    adapter: "prisma",
    client: prisma,
  },
});
```

The `client` field accepts any pre-initialized instance — its type is defined
as `z.unknown()` in the schema to support any Prisma-compatible client variant.

## Example with Custom Client

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export default defineAuthConfig({
  database: {
    adapter: "prisma",
    client: prisma,
  },
});
```

## Related

- [Adapter Registry](../src/auth/adapters/index.ts)
- [Database Config Types](../src/auth/config/types.ts)
- [Prisma Adapter Factory](../src/auth/adapters/prisma.adapter.ts)
