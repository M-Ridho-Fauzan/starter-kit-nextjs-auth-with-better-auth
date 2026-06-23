import { useActionState } from "react";
import { enableTwoFactorAction } from "@/lib/auth/actions/two-factor";
import type { AuthActionResult } from "@/lib/auth/actions/types";

/**
 * Hook for two-factor setup form state management.
 * Wraps `enableTwoFactorAction` Server Action with `useActionState`.
 *
 * @returns A tuple of `[state, formAction, pending]` compatible with React 19
 *          `useActionState`. On success, `state.data` contains `totpURI`
 *          (for QR code display) and `backupCodes`.
 *
 * @example
 * ```tsx
 * function SetupPage() {
 *   const [state, formAction, pending] = useTwoFactorSetupForm();
 *   return (
 *     <form action={formAction}>
 *       <input name="password" type="password" />
 *       <button disabled={pending}>Enable 2FA</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useTwoFactorSetupForm() {
  return useActionState<
    AuthActionResult<{ totpURI: string; backupCodes: string[] }> | null,
    FormData
  >(enableTwoFactorAction, null);
}
