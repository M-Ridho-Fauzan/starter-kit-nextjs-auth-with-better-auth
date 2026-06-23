import type { DatabaseConfig } from "../config/types";
import type { CreateAdapter } from "./types";

const registry = new Map<string, CreateAdapter>();

/**
 * Register a database adapter factory.
 *
 * Adapters are registered globally at import time. Call this at the module
 * level of each adapter file to make it available via {@link resolveAdapter}.
 *
 * @param name - Adapter identifier (matches `DatabaseConfig.adapter`).
 * @param factory - Factory function that accepts {@link DatabaseConfig} and
 *                  returns a better-auth-compatible adapter.
 *
 * @example
 * ```ts
 * import { registerAdapter } from "./adapters";
 * import { createPrismaAdapter } from "./adapters/prisma.adapter";
 * registerAdapter("prisma", createPrismaAdapter);
 * ```
 */
export function registerAdapter(name: string, factory: CreateAdapter): void {
  registry.set(name, factory);
}

/**
 * Resolve a database adapter for the given configuration.
 *
 * Looks up the registered adapter factory by name and invokes it with the
 * full database config.
 *
 * @param config - Database configuration specifying the adapter name and
 *                 connection details.
 * @returns A better-auth-compatible adapter instance.
 *
 * @throws If no adapter is registered for `config.adapter`.
 */
export function resolveAdapter(config: DatabaseConfig): unknown {
  const factory = registry.get(config.adapter);
  if (!factory) {
    throw new Error(
      `Unknown database adapter: "${config.adapter}". ` +
        `Available adapters: ${[...registry.keys()].join(", ") || "none registered yet"}. ` +
        `Import and call registerAdapter() from the adapter module.`,
    );
  }
  return factory(config);
}

/**
 * Check whether a database adapter has been registered.
 *
 * @param name - Adapter identifier to look up.
 * @returns `true` if the adapter is registered, `false` otherwise.
 */
export function hasAdapter(name: string): boolean {
  return registry.has(name);
}
