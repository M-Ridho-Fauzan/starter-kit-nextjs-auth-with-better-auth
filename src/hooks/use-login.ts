import { useActionState } from "react";
import { signInWithEmailPassword } from "@/lib/auth/actions/email-password";
import type { AuthActionResult } from "@/lib/auth/actions/types";

/**
 * Hook for login form state management.
 * Wraps `signInWithEmailPassword` Server Action with `useActionState`.
 *
 * @returns A tuple of `[state, formAction, pending]` compatible with React 19
 *          `useActionState` — suitable for passing directly to a `<form>`.
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const [state, formAction, pending] = useLoginForm();
 *   return (
 *     <form action={formAction}>
 *       <input name="email" />
 *       <input name="password" type="password" />
 *       {state?.error?.message && <p>{state.error.message}</p>}
 *       <button disabled={pending}>Sign in</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useLoginForm() {
  return useActionState<AuthActionResult | null, FormData>(
    signInWithEmailPassword,
    null,
  );
}
