/**
 * Better Auth client instance.
 *
 * Singleton — configures the client-side auth client.
 * Plugins are added here based on enabled features in `auth.config.ts`.
 *
 * @example
 * ```tsx
 * import { authClient } from "@/auth/auth-client";
 *
 * function SignInButton() {
 *   return <button onClick={() => authClient.signIn.social({ provider: "github" })}>
 *     Sign in with GitHub
 *   </button>;
 * }
 * ```
 */
import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  /**
   * CLI-generated plugin list.
   * During `create-next-auth-starter` setup, plugins are added
   * based on the user's feature selections.
   *
   * Example generated output:
   * ```ts
   * plugins: [
   *   twoFactorClient(),
   *   organizationClient(),
   * ]
   * ```
   */
  plugins: [],
});

export type Session = typeof authClient.$Infer.Session;
