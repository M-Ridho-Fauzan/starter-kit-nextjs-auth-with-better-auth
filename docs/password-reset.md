# Password Reset

Password reset flow using Better Auth. Two-steps: request a reset link, then set a new password.

## Config

### Enable password reset

```typescript
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  features: {
    emailPassword: {
      enabled: true,
    },
    passwordReset: true, // or { expiresIn: "2h" }
  },
});
```

Defaults to `false`. Set to `true` to enable with default token expiry, or pass `{ expiresIn: "1h" }` to customise.

### Provide email sending callback

```typescript
export default defineAuthConfig({
  email: {
    sendPasswordResetEmail: async ({ email, url, token }) => {
      // Send the email using your preferred provider
      console.log(`Password reset URL for ${email}: ${url}`);
    },
  },
  features: {
    emailPassword: { enabled: true },
    passwordReset: true,
  },
});
```

If no `sendPasswordResetEmail` callback is provided, the starter kit logs a warning in development and an error in production.

### Token expiry

Configure via `passwordReset.expiresIn` (defaults to Better Auth's default):

```typescript
passwordReset: {
  expiresIn: "1h", // "30m", "2h", "1d"
}
```

## Server Actions

### `requestPasswordResetAction`

Form action to request a password reset email.

```typescript
import { requestPasswordResetAction } from "@/lib/auth/actions/password-reset";

<form action={requestPasswordResetAction}>
  <input name="email" type="email" required />
  <button type="submit">Send reset link</button>
</form>
```

### `resetPasswordAction`

Form action that processes a reset token and new password.

```typescript
import { resetPasswordAction } from "@/lib/auth/actions/password-reset";

<form action={resetPasswordAction}>
  <input name="token" type="hidden" value={token} />
  <input name="password" type="password" required />
  <button type="submit">Reset password</button>
</form>
```

## Pages

| Page              | Route                 | Description                                 |
|-------------------|-----------------------|---------------------------------------------|
| Forgot Password   | `/forgot-password`    | Form to request a password reset link       |
| Reset Password    | `/reset-password`     | Form to set a new password using a token     |

## Hooks

### `useForgotPasswordForm`

```tsx
import { useForgotPasswordForm } from "@/hooks/use-forgot-password";

function ForgotPasswordPage() {
  const [state, formAction, pending] = useForgotPasswordForm();
}
```

### `useResetPasswordForm`

```tsx
import { useResetPasswordForm } from "@/hooks/use-reset-password";

function ResetPasswordPage() {
  const [state, formAction, pending] = useResetPasswordForm();
}
```

## Related

- [Server Actions](../src/lib/auth/actions/password-reset.ts)
- [Forgot Password Page](../src/app/(auth)/forgot-password/page.tsx)
- [Reset Password Page](../src/app/(auth)/reset-password/page.tsx)
- [Email & Password](./email-password.md)
