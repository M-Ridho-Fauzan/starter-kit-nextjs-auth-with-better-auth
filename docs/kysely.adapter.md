# Kysely Database Adapter

Connects Better Auth to a PostgreSQL (or MySQL/SQLite/MSSQL) database using Kysely.

## Config

Configure via the `database` section of `auth.config.ts`:

```typescript
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  database: {
    adapter: "kysely",
    url: process.env.DATABASE_URL!,
  },
});
```

| Option   | Type       | Required | Description                                                      |
|----------|------------|----------|------------------------------------------------------------------|
| `adapter`| `"kysely"` | yes      | Selects the Kysely adapter.                                      |
| `url`    | `string`   | no       | Database connection string. Required unless `client` is provided.|
| `client` | `Kysely<any>`| no     | Pre-initialized Kysely instance. Overrides `url` when provided.  |

## Registration

The adapter must be registered with the adapter registry before use:

```typescript
import { registerAdapter } from "@/auth/adapters";
import { createKyselyAdapter } from "@/auth/adapters/kysely.adapter";

registerAdapter("kysely", createKyselyAdapter);
```

## How It Works

1. `createKyselyAdapter` receives the `DatabaseConfig` object.
2. If `config.client` is provided, it uses that Kysely instance directly.
3. Otherwise, it dynamically imports `kysely` and `pg` and creates a new `Kysely` instance with a `PostgresDialect` connected to the URL.
4. It calls `kyselyAdapter(kysely, { type: "postgres" })` from `@better-auth/kysely-adapter` to produce a better-auth compatible adapter.

## Dynamic Import

The adapter uses `require("kysely")` and `require("pg")` at runtime. This means:

- **Without Kysely:** A clear error is thrown at boot time: `Cannot find module 'kysely'`
- **With Kysely:** The adapter works normally

## Prerequisites

- `kysely` installed
- `pg` (or the appropriate dialect driver for your database) installed

## Default Provider

The adapter defaults to `"postgres"` as the database type. Change in `kysely.adapter.ts` for MySQL, SQLite, or MSSQL:

```typescript
type: "mysql"  // or "sqlite" | "mssql"
```

## Serverless Databases (Neon, Supabase)

Serverless PostgreSQL providers require SSL connections and benefit from
connection pooling. Two approaches:

### 1. URL string (simple, `sslmode=require`)

Append `?sslmode=require` to the connection string for SSL enforcement:

```typescript
export default defineAuthConfig({
  database: {
    adapter: "kysely",
    url: "postgresql://user:pass@ep-example-123456.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});
```

### 2. Pre-initialized Kysely instance (recommended for serverless)

For serverless environments, create the Kysely instance externally with the
appropriate dialect and pool:

**Neon (`@neondatabase/serverless`):**

```typescript
import { Kysely } from "kysely";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PostgresDialect } from "kysely";

neonConfig.poolQueryViaFetch = true;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = new Kysely<unknown>({
  dialect: new PostgresDialect({ pool }),
});

export default defineAuthConfig({
  database: {
    adapter: "kysely",
    client: db,
  },
});
```

**Supabase (via `pg` with SSL):**

```typescript
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = new Kysely<unknown>({
  dialect: new PostgresDialect({ pool }),
});

export default defineAuthConfig({
  database: {
    adapter: "kysely",
    client: db,
  },
});
```

The `client` field accepts any pre-initialized Kysely instance — its type is
defined as `z.unknown()` in the schema to support any dialect variant.

## Example with Custom Client

```typescript
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const db = new Kysely<unknown>({
  dialect: new PostgresDialect({
    pool: new Pool({ connectionString: process.env.DATABASE_URL }),
  }),
});

export default defineAuthConfig({
  database: {
    adapter: "kysely",
    client: db,
  },
});
```

## Related

- [Adapter Registry](../src/auth/adapters/index.ts)
- [Database Config Types](../src/auth/config/types.ts)
- [Kysely Adapter Factory](../src/auth/adapters/kysely.adapter.ts)
