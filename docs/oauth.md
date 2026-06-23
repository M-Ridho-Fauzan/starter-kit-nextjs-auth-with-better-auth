# OAuth / Social Login

OAuth authentication using Better Auth. Supports GitHub, Google, and any other
provider supported by Better Auth via the `custom` array.

## Config

### Enable GitHub / Google

```typescript
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  features: {
    oauth: {
      github: {
        enabled: true,
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
      google: {
        enabled: false,
        clientId: "",
        clientSecret: "",
      },
    },
  },
});
```

### Add a custom provider

For any provider Better Auth supports (e.g. Discord, Twitter, Apple), use the
`custom` array:

```typescript
export default defineAuthConfig({
  features: {
    oauth: {
      custom: [
        {
          id: "discord",
          enabled: true,
          clientId: process.env.DISCORD_CLIENT_ID!,
          clientSecret: process.env.DISCORD_CLIENT_SECRET!,
        },
      ],
    },
  },
});
```

The `id` must match a provider ID supported by Better Auth.

## UI

Social login buttons are rendered by the `SocialLoginButtons` component.
They appear on both the login and register pages when at least one OAuth
provider is enabled.

### `SocialLoginButtons`

```tsx
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";

<SocialLoginButtons providers={["github", "google"]} redirectTo="/dashboard" />
```

| Prop         | Type       | Required | Description                              |
|--------------|------------|----------|------------------------------------------|
| `providers`  | `string[]` | yes      | List of enabled OAuth provider IDs       |
| `redirectTo` | `string`   | no       | URL to redirect to after successful login |

## Hook

### `useSocialLogin`

```tsx
import { useSocialLogin } from "@/hooks/use-social-login";

function MyComponent() {
  const { signIn } = useSocialLogin();

  return (
    <button onClick={() => signIn("github", "/dashboard")}>
      Sign in with GitHub
    </button>
  );
}
```

## Adding a new built-in provider

If Better Auth adds a new provider (e.g. `"twitter"`), add an entry in the
`custom` array — no code changes to the starter kit are needed.

## Related

- [Social Login Buttons](../src/components/auth/social-login-buttons.tsx)
- [OAuth Helper](../src/auth/config/oauth.ts)
- [useSocialLogin hook](../src/hooks/use-social-login.ts)
- [Login Page](../src/app/(auth)/login/page.tsx)
- [Register Page](../src/app/(auth)/register/page.tsx)
- [Mapper (socialProviders)](../src/auth/mapper.ts)
