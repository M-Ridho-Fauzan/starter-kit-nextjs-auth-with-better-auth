import { prismaAdapter } from "better-auth/adapters/prisma";
import type { DatabaseConfig } from "../config/types";

/**
 * Minimal PrismaClient interface matching what better-auth expects.
 * This avoids requiring `@prisma/client` to be generated at compile time.
 * At runtime, the actual PrismaClient from `@prisma/client` is used.
 */
interface PrismaClientLike {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  [key: string]: unknown;
}

/**
 * Prisma adapter factory.
 *
 * Accepts a database URL or a pre-initialized PrismaClient instance.
 * Returns a better-auth compatible database adapter.
 *
 * Register with the adapter registry:
 * ```ts
 * import { registerAdapter } from "./index";
 * import { createPrismaAdapter } from "./prisma.adapter";
 * registerAdapter("prisma", createPrismaAdapter);
 * ```
 *
 * @example
 * ```ts
 * // Using a URL (creates PrismaClient internally)
 * createPrismaAdapter({ adapter: "prisma", url: "postgresql://..." });
 *
 * // Using a pre-initialized client
 * const prisma = new PrismaClient();
 * createPrismaAdapter({ adapter: "prisma", client: prisma });
 * ```
 */
export function createPrismaAdapter(config: DatabaseConfig): unknown {
  const prisma: PrismaClientLike = config.client as PrismaClientLike | undefined
    ?? createPrismaClient(config.url);

  return prismaAdapter(prisma, {
    provider: "postgresql",
  });
}

function createPrismaClient(url?: string): PrismaClientLike {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client") as {
    PrismaClient: new (options: { adapter: unknown }) => PrismaClientLike;
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaPg } = require("@prisma/adapter-pg") as {
    PrismaPg: new (url: string) => unknown;
  };
  const adapter = new PrismaPg(url!);
  return new PrismaClient({ adapter });
}
