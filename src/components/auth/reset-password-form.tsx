"use client";

import { useResetPasswordForm } from "@/hooks/use-reset-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Reset password form.
 *
 * Accepts a new password and a hidden reset token.
 * Uses `useResetPasswordForm` hook wrapping the `resetPasswordAction` Server
 * Action. Displays validation errors inline.
 *
 * @example
 * ```tsx
 * <ResetPasswordForm token="reset-token-from-url" />
 * ```
 */
export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useResetPasswordForm();

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {state && !state.success && (
        <p className="text-destructive text-sm">{state.error.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Resetting..." : "Reset password"}
      </Button>
    </form>
  );
}
