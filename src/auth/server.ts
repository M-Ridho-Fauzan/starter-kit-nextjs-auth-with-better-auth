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

export const auth = betterAuth(mapConfig(config));

/** Inferred session type — use for type-safe session access. */
export type Session = typeof auth.$Infer.Session;
