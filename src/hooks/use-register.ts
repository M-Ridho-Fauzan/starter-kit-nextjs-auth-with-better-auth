import { useActionState } from "react";
import { signUpWithEmailPassword } from "@/lib/auth/actions/email-password";
import type { AuthActionResult } from "@/lib/auth/actions/types";

/**
 * Hook for registration form state management.
 * Wraps `signUpWithEmailPassword` Server Action with `useActionState`.
 *
 * @returns A tuple of `[state, formAction, pending]` compatible with React 19
 *          `useActionState` — suitable for passing directly to a `<form>`.
 *
 * @example
 * ```tsx
 * function RegisterPage() {
 *   const [state, formAction, pending] = useRegisterForm();
 *   return (
 *     <form action={formAction}>
 *       <input name="name" />
 *       <input name="email" />
 *       <input name="password" type="password" />
 *       <button disabled={pending}>Create account</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useRegisterForm() {
  return useActionState<AuthActionResult | null, FormData>(
    signUpWithEmailPassword,
    null,
  );
}
