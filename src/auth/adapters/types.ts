import type { DatabaseConfig } from "../config/types";

/**
 * Creates a better-auth-compatible adapter from the database config.
 *
 * Synchronous — instantiation is sync (new PrismaClient, new Pool, etc.),
 * database connection happens lazily on first query.
 */
export type CreateAdapter = (config: DatabaseConfig) => unknown;
