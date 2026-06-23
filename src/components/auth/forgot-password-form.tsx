"use client";

import { useForgotPasswordForm } from "@/hooks/use-forgot-password";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Forgot password form.
 *
 * Accepts an email address and sends a password reset link.
 * Uses `useForgotPasswordForm` hook wrapping the `requestPasswordResetAction`
 * Server Action. Displays success and error messages inline.
 */
export function ForgotPasswordForm() {
  const [state, formAction, pending] = useForgotPasswordForm();

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      {state && !state.success && (
        <p className="text-destructive text-sm">{state.error.message}</p>
      )}
      {state && state.success && (
        <p className="text-emerald-600 text-sm">{state.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending..." : "Send reset link"}
      </Button>
    </form>
  );
}
