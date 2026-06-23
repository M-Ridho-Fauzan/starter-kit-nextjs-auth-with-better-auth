import { useActionState } from "react";
import { verifyTotpAction } from "@/lib/auth/actions/two-factor";
import type { AuthActionResult } from "@/lib/auth/actions/types";

/**
 * Hook for TOTP verification form state management during login.
 * Wraps `verifyTotpAction` Server Action with `useActionState`.
 *
 * @returns A tuple of `[state, formAction, pending]` compatible with React 19
 *          `useActionState` — suitable for passing directly to a `<form>`.
 *
 * @example
 * ```tsx
 * function VerifyTotpPage() {
 *   const [state, formAction, pending] = useVerifyTotpForm();
 *   return (
 *     <form action={formAction}>
 *       <input name="code" inputMode="numeric" />
 *       <button disabled={pending}>Verify</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useVerifyTotpForm() {
  return useActionState<AuthActionResult | null, FormData>(
    verifyTotpAction,
    null,
  );
}
