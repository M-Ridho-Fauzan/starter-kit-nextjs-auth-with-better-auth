import { useActionState } from "react";
import { requestPasswordResetAction } from "@/lib/auth/actions/password-reset";
import type { AuthActionResult } from "@/lib/auth/actions/types";

/**
 * Hook for forgot password form state management.
 * Wraps `requestPasswordResetAction` Server Action with `useActionState`.
 *
 * @returns A tuple of `[state, formAction, pending]` compatible with React 19
 *          `useActionState` — suitable for passing directly to a `<form>`.
 *
 * @example
 * ```tsx
 * function ForgotPasswordPage() {
 *   const [state, formAction, pending] = useForgotPasswordForm();
 *   return (
 *     <form action={formAction}>
 *       <input name="email" />
 *       <button disabled={pending}>Send reset link</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useForgotPasswordForm() {
  return useActionState<AuthActionResult | null, FormData>(
    requestPasswordResetAction,
    null,
  );
}
