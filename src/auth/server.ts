/**
 * Better Auth server instance.
 *
 * Singleton — imports `auth.config.ts` at build time and creates
 * the better-auth instance once at module load time.
 *
 * @example
 * ```ts
 * // In API routes or server components:
 * import { auth } from "@/auth/server";
 * const session = await auth.api.getSession({ headers });
 * ```
 */
import { betterAuth } from "better-auth";
import config from "../../auth.config";
import { mapConfig } from "./mapper";
import { registerAdapter } from "./adapters/index";

switch (config.database.adapter) {
  case "prisma": {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createPrismaAdapter } = require("./adapters/prisma.adapter") as {
      createPrismaAdapter: typeof import("./adapters/prisma.adapter").createPrismaAdapter;
    };
    registerAdapter("prisma", createPrismaAdapter);
    break;
  }
  case "drizzle": {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createDrizzleAdapter } = require("./adapters/drizzle.adapter") as {
      createDrizzleAdapter: typeof import("./adapters/drizzle.adapter").createDrizzleAdapter;
    };
    registerAdapter("drizzle", createDrizzleAdapter);
    break;
  }
  case "kysely": {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createKyselyAdapter } = require("./adapters/kysely.adapter") as {
      createKyselyAdapter: typeof import("./adapters/kysely.adapter").createKyselyAdapter;
    };
    registerAdapter("kysely", createKyselyAdapter);
    break;
  }
  default:
    throw new Error(`Unknown database adapter: "${config.database.adapter}"`);
}

export const auth = betterAuth(mapConfig(config));

/** Inferred session type — use for type-safe session access. */
export type Session = typeof auth.$Infer.Session;
