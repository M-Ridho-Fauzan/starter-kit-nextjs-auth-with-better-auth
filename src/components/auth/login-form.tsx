"use client";

import { useLoginForm } from "@/hooks/use-login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * Email + password login form.
 *
 * Uses `useLoginForm` hook which wraps the `signInWithEmailPassword` Server
 * Action. Displays validation errors inline.
 */
export function LoginForm() {
  const [state, formAction, pending] = useLoginForm();

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required />
      </div>
      {state && !state.success && (
        <p className="text-destructive text-sm">{state.error.message}</p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
