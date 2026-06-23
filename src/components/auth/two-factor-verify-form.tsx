"use client";

import { useVerifyTotpForm } from "@/hooks/use-verify-totp-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * TOTP verification form displayed during login when 2FA is enabled.
 *
 * Accepts a 6-digit TOTP code from the user's authenticator app.
 * Uses `useVerifyTotpForm` hook wrapping the `verifyTotpAction` Server Action.
 */
export function TwoFactorVerifyForm() {
  const [state, formAction, pending] = useVerifyTotpForm();

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="code">TOTP Code</Label>
        <Input id="code" name="code" type="text" inputMode="numeric" required />
      </div>
      {state && !state.success && (
        <p className="text-destructive text-sm">{state.error.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Verifying..." : "Verify"}
      </Button>
    </form>
  );
}
