# Email & Password Authentication

Email and password registration and login via `better-auth`.

## Config

Configure in `auth.config.ts`:

```typescript
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  features: {
    emailPassword: {
      enabled: true,
      requireEmailVerification: false,
      passwordMinLength: 8,
      passwordMaxLength: 128,
      disableSignUp: false,
      autoSignIn: true,
    },
  },
});
```

| Option                    | Type      | Default | Description                                  |
|---------------------------|-----------|---------|----------------------------------------------|
| `enabled`                 | `boolean` | `false` | Enable email/password auth.                   |
| `requireEmailVerification`| `boolean` | `false` | Require email verification before sign-in.    |
| `passwordMinLength`       | `number`  | `8`     | Minimum password length.                      |
| `passwordMaxLength`       | `number`  | `128`   | Maximum password length.                      |
| `disableSignUp`           | `boolean` | `false` | Disable new user registration.                |
| `autoSignIn`              | `boolean` | `true`  | Auto sign-in after registration.              |

## Server Actions

### `signInWithEmailPassword`

Form action for login. Validates input, calls `auth.api.signInEmail()`, and redirects on success.

```typescript
import { signInWithEmailPassword } from "@/lib/auth/actions/email-password";

<form action={signInWithEmailPassword}>
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Sign in</button>
</form>
```

### `signUpWithEmailPassword`

Form action for registration. Validates input, calls `auth.api.signUpEmail()`, and redirects on success.

```typescript
import { signUpWithEmailPassword } from "@/lib/auth/actions/email-password";

<form action={signUpWithEmailPassword}>
  <input name="name" type="text" required />
  <input name="email" type="email" required />
  <input name="password" type="password" required />
  <button type="submit">Create account</button>
</form>
```

## Hooks

### `useLoginForm`

```tsx
import { useLoginForm } from "@/hooks/use-login";

function LoginPage() {
  const [state, formAction, pending] = useLoginForm();
  // state: AuthActionResult | null
}
```

### `useRegisterForm`

```tsx
import { useRegisterForm } from "@/hooks/use-register";

function RegisterPage() {
  const [state, formAction, pending] = useRegisterForm();
  // state: AuthActionResult | null
}
```

## Return Types

```typescript
interface AuthSuccessResult {
  success: true;
  message?: string;
}

interface AuthErrorResult {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type AuthActionResult = AuthSuccessResult | AuthErrorResult;
```

## Related

- [Server Actions](../src/lib/auth/actions/email-password.ts)
- [Login Page](../src/app/(auth)/login/page.tsx)
- [Register Page](../src/app/(auth)/register/page.tsx)
