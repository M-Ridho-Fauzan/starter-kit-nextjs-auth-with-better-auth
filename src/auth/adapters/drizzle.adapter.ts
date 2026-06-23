import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { DatabaseConfig } from "../config/types";

interface DrizzleLike {
  [key: string]: unknown;
}

export function createDrizzleAdapter(config: DatabaseConfig): unknown {
  const db: DrizzleLike = config.client as DrizzleLike | undefined
    ?? createDrizzleDB(config.url);

  return drizzleAdapter(db, {
    provider: "pg",
  });
}

function createDrizzleDB(url?: string): DrizzleLike {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { drizzle } = require("drizzle-orm/node-postgres") as {
    drizzle: (...args: unknown[]) => DrizzleLike;
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Pool } = require("pg") as {
    Pool: new (options?: { connectionString?: string }) => unknown;
  };
  const pool = new Pool({ connectionString: url });
  return drizzle(pool);
}
