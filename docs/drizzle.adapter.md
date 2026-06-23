# Drizzle Database Adapter

Connects Better Auth to a PostgreSQL (or MySQL/SQLite) database using Drizzle ORM.

## Config

Configure via the `database` section of `auth.config.ts`:

```typescript
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  database: {
    adapter: "drizzle",
    url: process.env.DATABASE_URL!,
  },
});
```

| Option   | Type       | Required | Description                                                      |
|----------|------------|----------|------------------------------------------------------------------|
| `adapter`| `"drizzle"`| yes      | Selects the Drizzle adapter.                                     |
| `url`    | `string`   | no       | Database connection string. Required unless `client` is provided.|
| `client` | `DB`       | no       | Pre-initialized Drizzle ORM instance. Overrides `url` when provided.|

## Registration

The adapter must be registered with the adapter registry before use:

```typescript
import { registerAdapter } from "@/auth/adapters";
import { createDrizzleAdapter } from "@/auth/adapters/drizzle.adapter";

registerAdapter("drizzle", createDrizzleAdapter);
```

## How It Works

1. `createDrizzleAdapter` receives the `DatabaseConfig` object.
2. If `config.client` is provided, it uses that Drizzle DB instance directly.
3. Otherwise, it dynamically imports `drizzle-orm/node-postgres` and creates a new DB instance with a connection pool from the URL.
4. It calls `drizzleAdapter(db, { provider: "pg" })` from `@better-auth/drizzle-adapter` to produce a better-auth compatible adapter.

## Dynamic Import

The adapter uses `require("drizzle-orm/node-postgres")` and `require("pg")` at runtime. This means:

- **Without Drizzle:** A clear error is thrown at boot time: `Cannot find module 'drizzle-orm/node-postgres'`
- **With Drizzle:** The adapter works normally

## Prerequisites

- `drizzle-orm` installed
- `pg` (or the appropriate driver for your database) installed

## Default Provider

The adapter defaults to `"pg"` as the database provider. Change the provider in `drizzle.adapter.ts` for MySQL or SQLite:

```typescript
provider: "mysql"  // or "sqlite"
```

## Serverless Databases (Neon, Supabase)

Serverless PostgreSQL providers require SSL connections and benefit from
connection pooling. Two approaches:

### 1. URL string (simple, `sslmode=require`)

Append `?sslmode=require` to the connection string for SSL enforcement:

```typescript
export default defineAuthConfig({
  database: {
    adapter: "drizzle",
    url: "postgresql://user:pass@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});
```

### 2. Pre-initialized Drizzle instance (recommended for serverless)

For serverless environments, create the Drizzle instance externally with the
appropriate driver:

**Neon (`@neondatabase/serverless`):**

```typescript
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";

neonConfig.poolQueryViaFetch = true;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export default defineAuthConfig({
  database: {
    adapter: "drizzle",
    client: db,
  },
});
```

**Supabase (via `pg` with SSL):**

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = drizzle(pool);

export default defineAuthConfig({
  database: {
    adapter: "drizzle",
    client: db,
  },
});
```

The `client` field accepts any pre-initialized Drizzle ORM instance — its type
is defined as `z.unknown()` in the schema to support any driver variant.

## Example with Custom Client

```typescript
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export default defineAuthConfig({
  database: {
    adapter: "drizzle",
    client: db,
  },
});
```

## Related

- [Adapter Registry](../src/auth/adapters/index.ts)
- [Database Config Types](../src/auth/config/types.ts)
- [Drizzle Adapter Factory](../src/auth/adapters/drizzle.adapter.ts)
