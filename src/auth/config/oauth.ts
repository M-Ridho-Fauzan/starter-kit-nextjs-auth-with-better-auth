import type { AuthConfig } from "./types";

/**
 * Extract the list of enabled OAuth provider IDs from the auth config.
 *
 * @returns An array of provider IDs (e.g. `["github", "google"]`).
 */
export function getEnabledOAuthProviders(config: AuthConfig): string[] {
  const providers: string[] = [];
  const oauth = config.features.oauth;

  if (oauth.github?.enabled) {
    providers.push("github");
  }

  if (oauth.google?.enabled) {
    providers.push("google");
  }

  for (const provider of oauth.custom ?? []) {
    if (provider.enabled) {
      providers.push(provider.id);
    }
  }

  return providers;
}
