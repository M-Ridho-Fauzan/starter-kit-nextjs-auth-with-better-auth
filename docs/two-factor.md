# Two-Factor Authentication (TOTP)

Time-based one-time password (TOTP) two-factor authentication using Better Auth.

## Config

### Enable two-factor authentication

```typescript
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  features: {
    twoFactor: {
      enabled: true, // enables TOTP support
    },
  },
});
```

### Configuration options

| Option    | Type        | Default    | Description                     |
|-----------|-------------|------------|---------------------------------|
| `enabled` | `boolean`   | `false`    | Enable or disable 2FA support   |
| `methods` | `"totp"[]`  | `["totp"]` | Allowed 2FA methods (TOTP only) |

## How it works

### Login flow with 2FA

1. User submits email/password via the login form.
2. If the user has 2FA enabled, `auth.api.signInEmail()` returns
   `{ twoFactorRedirect: true, twoFactorMethods: ["totp"] }` instead of
   a session token.
3. The Server Action catches this and redirects to `/2fa/verify`.
4. User enters their TOTP code from an authenticator app.
5. `auth.api.verifyTOTP()` validates the code and completes the session.
6. User is redirected to `/dashboard`.

### Setup flow (enabling 2FA)

1. Logged-in user navigates to `/settings/2fa`.
2. User enters their password for security confirmation.
3. `auth.api.enableTwoFactor()` generates a TOTP secret and backup codes.
4. QR code is displayed for scanning with an authenticator app.
5. Backup codes are shown — user must save them securely.

## Server Actions

All TOTP actions are in `src/lib/auth/actions/two-factor.ts`.

| Action                      | Description                                      |
|-----------------------------|--------------------------------------------------|
| `verifyTotpAction`          | Verify TOTP code during login (redirects on success) |
| `getTOTPURIAction`          | Get TOTP URI for QR code display                 |
| `enableTwoFactorAction`     | Enable 2FA, returns URI and backup codes         |
| `disableTwoFactorAction`    | Disable 2FA for the current user                 |
| `generateBackupCodesAction` | Generate new backup codes                        |

## Pages

| Page                    | Route              | Description                        |
|-------------------------|--------------------|------------------------------------|
| 2FA Verify              | `/2fa/verify`      | Enter TOTP code during login       |
| Settings - 2FA          | `/settings/2fa`    | Enable/disable 2FA, manage backups |

## Related

- [Server Actions](../src/lib/auth/actions/two-factor.ts)
- [2FA Verify Page](../src/app/(auth)/2fa/verify/page.tsx)
- [2FA Settings Page](../src/app/(auth)/settings/2fa/page.tsx)
- [TwoFactorVerifyForm](../src/components/auth/two-factor-verify-form.tsx)
- [TwoFactorSetupForm](../src/components/auth/two-factor-setup-form.tsx)
- [BackupCodesDisplay](../src/components/auth/backup-codes-display.tsx)
