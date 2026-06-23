"use client";

import { useRegisterForm } from "@/hooks/use-register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * User registration form.
 *
 * Uses `useRegisterForm` hook which wraps the `signUpWithEmailPassword` Server
 * Action. Collects name, email, and password. Displays validation errors
 * inline.
 */
export function RegisterForm() {
  const [state, formAction, pending] = useRegisterForm();

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" type="text" required />
      </div>
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
        {pending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
