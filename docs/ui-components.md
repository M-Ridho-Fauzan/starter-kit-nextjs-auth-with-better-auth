# UI Components

## Overview

Auth forms and UI components built with **shadcn/ui** (Radix UI primitives +
Tailwind CSS v4). All components use CSS variables for theming — dark mode is
structurally supported via the `.dark` class, but no toggle is included.

---

## Installation

shadcn/ui components were installed with:

```bash
npx shadcn@latest add button input card label badge separator
```

The following shadcn components are available:

| Component | File | Used By |
|-----------|------|---------|
| `Button` | `src/components/ui/button.tsx` | All forms, profile |
| `Input` | `src/components/ui/input.tsx` | All forms |
| `Card` | `src/components/ui/card.tsx` | AuthLayout, profile, 2FA setup |
| `Label` | `src/components/ui/label.tsx` | All forms |
| `Badge` | `src/components/ui/badge.tsx` | UserProfile role display |
| `Separator` | `src/components/ui/separator.tsx` | Social login, profile |

---

## Auth Components

All in `src/components/auth/`:

| Component | Description |
|-----------|-------------|
| `AuthLayout` | Centered card layout (400px max-width) with title and description slots |
| `LoginForm` | Email/password sign-in form |
| `RegisterForm` | Name/email/password registration form |
| `ForgotPasswordForm` | Email input for password reset request |
| `ResetPasswordForm` | New password form with hidden token |
| `ResendVerificationForm` | Email input for resending verification |
| `TwoFactorVerifyForm` | TOTP code input for 2FA verification |
| `TwoFactorSetupForm` | Password confirmation + QR code display + backup codes |
| `BackupCodesDisplay` | Monospace backup code list with copy-to-clipboard |
| `SocialLoginButtons` | OAuth provider buttons |

### AuthLayout

```tsx
import { AuthLayout } from "@/components/auth/auth-layout";

<AuthLayout title="Sign in" description="Welcome back">
  <LoginForm />
</AuthLayout>
```

### SocialLoginButtons

Provider names are passed as props from the server page:

```tsx
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";

<SocialLoginButtons providers={["github", "google"]} />
```

---

## User Components

In `src/components/user/`:

| Component | Description |
|-----------|-------------|
| `UserProfile` | Avatar (initials fallback), name, email, role badge, sign-out, 2FA link |

```tsx
import { UserProfile } from "@/components/user/user-profile";

<UserProfile />
```

---

## Theme / Dark Mode

All components use CSS variables defined in `src/app/globals.css`. The `.dark`
class variant is structurally ready:

```css
:root { /* light tokens */ }
.dark { /* dark tokens */ }
```

To enable dark mode, add the `dark` class to `<html>`. No dark-mode toggle is
included — add one via `next-themes` or manually toggle the class.

---

## Configuration

The `ui.theme` field in `auth.config.ts` is reserved for future theming options.
Currently only `"shadcn"` is supported.
