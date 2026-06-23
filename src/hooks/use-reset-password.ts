import { useActionState } from "react";
import { resetPasswordAction } from "@/lib/auth/actions/password-reset";
import type { AuthActionResult } from "@/lib/auth/actions/types";

/**
 * Hook for reset password form state management.
 * Wraps `resetPasswordAction` Server Action with `useActionState`.
 *
 * @returns A tuple of `[state, formAction, pending]` compatible with React 19
 *          `useActionState` — suitable for passing directly to a `<form>`.
 *
 * @example
 * ```tsx
 * function ResetPasswordPage({ token }: { token: string }) {
 *   const [state, formAction, pending] = useResetPasswordForm();
 *   return (
 *     <form action={formAction}>
 *       <input type="hidden" name="token" value={token} />
 *       <input name="password" type="password" />
 *       <button disabled={pending}>Reset password</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useResetPasswordForm() {
  return useActionState<AuthActionResult | null, FormData>(
    resetPasswordAction,
    null,
  );
}
