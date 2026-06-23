"use client";

import { useResendVerificationForm } from "@/hooks/use-resend-verification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Resend verification email form.
 *
 * Accepts an email address and sends a new verification link.
 * Uses `useResendVerificationForm` hook wrapping the `resendVerificationEmail`
 * Server Action. Displays success and error messages inline.
 */
export function ResendVerificationForm() {
  const [state, formAction, pending] = useResendVerificationForm();

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
        {pending ? "Sending..." : "Resend verification email"}
      </Button>
    </form>
  );
}
