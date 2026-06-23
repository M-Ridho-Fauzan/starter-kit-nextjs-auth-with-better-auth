import { kyselyAdapter } from "@better-auth/kysely-adapter";
import type { DatabaseConfig } from "../config/types";

type KyselyDB = Parameters<typeof kyselyAdapter>[0];

export function createKyselyAdapter(config: DatabaseConfig): unknown {
  const kysely = config.client as KyselyDB | undefined
    ?? createKyselyDB(config.url) as KyselyDB;

  return kyselyAdapter(kysely, {
    type: "postgres",
  });
}

function createKyselyDB(url?: string): unknown {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Kysely } = require("kysely") as {
    Kysely: new (options: { dialect: unknown }) => unknown;
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PostgresDialect } = require("kysely") as {
    PostgresDialect: new (options: { pool: { connectionString?: string } }) => unknown;
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Pool } = require("pg") as {
    Pool: new (options?: { connectionString?: string }) => { [key: string]: unknown };
  };
  const pool = new Pool({ connectionString: url });
  return new Kysely({
    dialect: new PostgresDialect({ pool }),
  });
}
