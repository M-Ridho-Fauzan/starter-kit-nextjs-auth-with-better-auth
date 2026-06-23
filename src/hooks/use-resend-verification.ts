import { useActionState } from "react";
import { resendVerificationEmail } from "@/lib/auth/actions/email-verification";
import type { AuthActionResult } from "@/lib/auth/actions/types";

/**
 * Hook for resend verification email form state management.
 * Wraps `resendVerificationEmail` Server Action with `useActionState`.
 *
 * @returns A tuple of `[state, formAction, pending]` compatible with React 19
 *          `useActionState` — suitable for passing directly to a `<form>`.
 *
 * @example
 * ```tsx
 * function ResendVerificationPage() {
 *   const [state, formAction, pending] = useResendVerificationForm();
 *   return (
 *     <form action={formAction}>
 *       <input name="email" />
 *       <button disabled={pending}>Resend verification</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useResendVerificationForm() {
  return useActionState<AuthActionResult | null, FormData>(
    resendVerificationEmail,
    null,
  );
}
