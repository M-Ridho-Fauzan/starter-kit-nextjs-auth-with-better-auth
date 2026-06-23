# React Hooks

## Overview

Client-side React hooks for accessing authentication state and managing auth
form actions. These hooks subscribe to the Better Auth client session store
(Nanostores) and reactively update when the session changes.

---

## Session & Auth State

### `useAuth()`

Returns the full authentication state including loading and status flags.

```typescript
import { useAuth } from "@/hooks/use-auth";

function UserMenu() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <a href="/login">Sign in</a>;

  return <span>Welcome, {user?.name}</span>;
}
```

| Property | Type | Description |
|---|---|---|
| `user` | `Session["user"] \| null` | The authenticated user, or `null` |
| `session` | `Session["session"] \| null` | The session object, or `null` |
| `isLoading` | `boolean` | `true` during the initial session fetch |
| `isAuthenticated` | `boolean` | `true` when a valid session exists |

### `useSession()`

Thin wrapper that returns the raw session object. Useful when you only need
the session or user data without the extra flags.

```typescript
import { useSession } from "@/hooks/use-session";

function ProfileSummary() {
  const session = useSession();
  if (!session) return <p>Not signed in</p>;

  return (
    <div>
      <p>Email: {session.user.email}</p>
      <p>ID: {session.session.id}</p>
    </div>
  );
}
```

| Type | Description |
|------|-------------|
| `Session \| null` | The full session object (`{ user, session }`) or `null` |

---

## Auth Form Hooks

All form hooks wrap a Server Action with React 19's `useActionState`. They
return a `[state, formAction, pending]` tuple suitable for passing directly
to a `<form>`.

### `useLoginForm()`

Wraps `signInWithEmailPassword` Server Action.

```tsx
import { useLoginForm } from "@/hooks/use-login";

function LoginPage() {
  const [state, formAction, pending] = useLoginForm();
  return (
    <form action={formAction}>
      <input name="email" />
      <input name="password" type="password" />
      {state?.error?.message && <p>{state.error.message}</p>}
      <button disabled={pending}>Sign in</button>
    </form>
  );
}
```

### `useRegisterForm()`

Wraps `signUpWithEmailPassword` Server Action.

```tsx
import { useRegisterForm } from "@/hooks/use-register";

function RegisterPage() {
  const [state, formAction, pending] = useRegisterForm();
  return (
    <form action={formAction}>
      <input name="name" />
      <input name="email" />
      <input name="password" type="password" />
      <button disabled={pending}>Create account</button>
    </form>
  );
}
```

### `useForgotPasswordForm()`

Wraps `requestPasswordResetAction` Server Action.

```tsx
import { useForgotPasswordForm } from "@/hooks/use-forgot-password";

function ForgotPasswordPage() {
  const [state, formAction, pending] = useForgotPasswordForm();
  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={pending}>Send reset link</button>
    </form>
  );
}
```

### `useResetPasswordForm()`

Wraps `resetPasswordAction` Server Action. The reset token is passed as a
hidden form field.

```tsx
import { useResetPasswordForm } from "@/hooks/use-reset-password";

function ResetPasswordPage({ token }: { token: string }) {
  const [state, formAction, pending] = useResetPasswordForm();
  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />
      <input name="password" type="password" />
      <button disabled={pending}>Reset password</button>
    </form>
  );
}
```

### `useResendVerificationForm()`

Wraps `resendVerificationEmail` Server Action.

```tsx
import { useResendVerificationForm } from "@/hooks/use-resend-verification";

function ResendVerificationPage() {
  const [state, formAction, pending] = useResendVerificationForm();
  return (
    <form action={formAction}>
      <input name="email" />
      <button disabled={pending}>Resend verification</button>
    </form>
  );
}
```

### `useTwoFactorSetupForm()`

Wraps `enableTwoFactorAction` Server Action. On success, `state.data`
contains `totpURI` (for QR code display) and `backupCodes`.

```tsx
import { useTwoFactorSetupForm } from "@/hooks/use-two-factor-setup-form";

function SetupPage() {
  const [state, formAction, pending] = useTwoFactorSetupForm();
  return (
    <form action={formAction}>
      <input name="password" type="password" />
      <button disabled={pending}>Enable 2FA</button>
    </form>
  );
}
```

### `useVerifyTotpForm()`

Wraps `verifyTotpAction` Server Action for 2FA verification during login.

```tsx
import { useVerifyTotpForm } from "@/hooks/use-verify-totp-form";

function VerifyTotpPage() {
  const [state, formAction, pending] = useVerifyTotpForm();
  return (
    <form action={formAction}>
      <input name="code" inputMode="numeric" />
      <button disabled={pending}>Verify</button>
    </form>
  );
}
```

---

## Social Login & OAuth

### `useSocialLogin()`

Initiates OAuth social login flows. Navigates away to the provider's
authorization page.

```typescript
import { useSocialLogin } from "@/hooks/use-social-login";

function GitHubButton() {
  const { signIn } = useSocialLogin();
  return <button onClick={() => signIn("github")}>Sign in with GitHub</button>;
}
```

| Return | Type | Description |
|--------|------|-------------|
| `signIn` | `(providerId: string, redirectTo?: string) => void` | Navigates to the OAuth provider's authorization page |

---

## Role & Permissions

### `useRole()`

Returns the current user's role from the session. Returns `undefined` when
not logged in.

```typescript
import { useRole } from "@/hooks/use-role";

function ProfileBadge() {
  const role = useRole();
  return <span>Role: {role ?? "guest"}</span>;
}
```

| Return | Description |
|--------|-------------|
| `string \| undefined` | The user's role, or `undefined` if not authenticated |

### `useHasRole(role)`

Checks if the current user has a given role. Accepts a single role string
or an array of accepted roles.

```typescript
import { useHasRole } from "@/hooks/use-has-role";

function AdminPanel() {
  const isAdmin = useHasRole("admin");
  if (!isAdmin) return null;
  return <div>Admin panel content</div>;
}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `role` | `string \| string[]` | Single role or array of accepted roles |
| **Return** | `boolean` | `true` if the user has one of the specified roles |

---

## Utilities

### `useBackupCodes()`

Manages backup codes display state. Tracks an array of codes and a
`generated` flag for conditional rendering.

```typescript
import { useBackupCodes } from "@/hooks/use-backup-codes";
import { BackupCodesDisplay } from "@/components/auth/backup-codes-display";

function BackupCodesSection() {
  const { backupCodes, setCodes, generated } = useBackupCodes();
  return generated ? <BackupCodesDisplay codes={backupCodes} /> : null;
}
```

| Return | Type | Description |
|--------|------|-------------|
| `backupCodes` | `string[]` | Current backup code array |
| `setCodes` | `(codes: string[]) => void` | Populates codes and marks as generated |
| `generated` | `boolean` | `true` after codes have been generated |

---

## Usage Notes

- All hooks work in **client components only** (they use `useActionState`
  or `useStore` from `@nanostores/react`).
- The session store is populated by the `authClient` (Better Auth client)
  which fetches `/api/auth/get-session` on the client side.
- Session updates are reactive: signing out, signing in, or updating the
  user will automatically re-render consuming components.
- For **server-side** session access, use `getServerSession()` from
  `@/lib/auth/server-utils`.
- Form hooks return the `useActionState` tuple `[state, formAction, pending]`
  which is compatible with React 19 and can be passed directly to `<form>`.
