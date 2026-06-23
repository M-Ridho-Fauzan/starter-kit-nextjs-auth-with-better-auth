# NextJS Auth Starter Kit

A production-grade [Next.js](https://nextjs.org) 16 authentication starter kit built on [Better Auth](https://better-auth.com) with a single `auth.config.ts` entry point. Config-driven, type-safe, and fully extensible.

## Features

- **Email & Password** — Registration and login with configurable password policies
- **Email Verification** — Optional email verification flow
- **Password Reset** — Forgot password and reset password flow
- **OAuth / Social Login** — GitHub, Google, and custom OAuth providers
- **Two-Factor Authentication** — TOTP-based 2FA
- **Role-Based Access Control** — Role and permission system
- **Session Management** — JWT (stateless) and database strategies
- **Auth Middleware** — Route protection with auth and role checks
- **React Hooks** — `useAuth`, `useSession`, `useRole`, `useHasRole`
- **shadcn/ui Components** — Pre-built auth forms and user profile
- **Database Adapters** — Prisma, Drizzle, Kysely

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org) 20+
- [pnpm](https://pnpm.io) 9+
- PostgreSQL (or your chosen database)

### Installation

```bash
git clone <repo-url>
cd starterkit-auth-nextjs
pnpm install
```

### Configuration

**Option A — Setup Wizard (recommended):**

```bash
pnpm setup
```

This interactive wizard will guide you through configuring your database adapter, authentication features, OAuth providers, session settings, and more. It generates both `auth.config.ts` and `.env.example`.

**Option B — Manual configuration:**

1. Edit `auth.config.ts` to match your requirements
2. Generate the environment file:

```bash
pnpm generate-env
cp .env.example .env
```

3. Set up your database:

```bash
# For Prisma:
npx prisma migrate dev

# For Drizzle:
npx drizzle-kit push

# For Kysely:
# Run your migration tool
```

4. Fill in your `.env` file with real values

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The login page is available at `/login`.

## Configuration

All auth configuration lives in a single file — `auth.config.ts`:

```typescript
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  database: {
    adapter: "prisma", // "prisma" | "drizzle" | "kysely" | "mongoose"
    url: process.env.DATABASE_URL!,
  },
  features: {
    emailPassword: {
      enabled: true,
      requireEmailVerification: true,
      passwordMinLength: 8,
    },
    passwordReset: true,
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
    twoFactor: {
      enabled: false,
      methods: ["totp"],
    },
    roles: {
      enabled: false,
      defaultRole: "user",
      roles: ["user", "admin"],
    },
  },
  session: {
    expiresIn: "7d",
    strategy: "jwt", // "jwt" | "database"
    cookieName: "auth_session",
  },
  ui: {
    theme: "shadcn",
    redirectAfterLogin: "/dashboard",
    redirectAfterLogout: "/",
  },
});
```

Each section has Zod-backed validation and sensible defaults. The full configuration reference is in the [documentation](docs/index.md).

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── (auth)/            # Auth pages (login, register, 2fa, etc.)
│   │   ├── api/auth/          # Better Auth API route handler
│   │   └── layout.tsx         # Root layout
│   ├── auth/
│   │   ├── config/            # Auth config schema, types, and mapper
│   │   ├── adapters/          # Database adapter factories (Prisma, Drizzle, Kysely)
│   │   ├── server.ts          # Better Auth server instance
│   │   └── auth-client.ts     # Client-side auth instance
│   ├── components/
│   │   ├── auth/              # Auth form components
│   │   ├── user/              # User profile component
│   │   └── ui/                # shadcn/ui components
│   ├── hooks/                 # React hooks (useAuth, useSession, etc.)
│   ├── lib/auth/actions/      # Server Actions
│   └── middleware.ts          # Route protection middleware
├── scripts/
│   ├── setup.ts               # Interactive setup wizard
│   ├── generate-env.example.ts # .env.example generator
│   └── lib/                   # Shared utilities
├── docs/                      # Full documentation
├── auth.config.ts             # Your auth configuration
├── .env.example               # Environment variable template
└── package.json
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Build for production |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run all tests |
| `pnpm generate-env` | Generate `.env.example` from current `auth.config.ts` |
| `pnpm setup` | Interactive setup wizard |

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | Database connection URL |
| `BETTER_AUTH_SECRET` | Yes | Secret for JWT signing (min 32 characters) |
| `BETTER_AUTH_URL` | Yes | Public URL of your application (e.g., `http://localhost:3000`) |
| `GITHUB_CLIENT_ID` | If GitHub OAuth | GitHub OAuth App client ID |
| `GITHUB_CLIENT_SECRET` | If GitHub OAuth | GitHub OAuth App client secret |
| `GOOGLE_CLIENT_ID` | If Google OAuth | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | If Google OAuth | Google OAuth client secret |
| `{ID}_CLIENT_ID` | Per custom provider | Custom OAuth provider client ID |
| `{ID}_CLIENT_SECRET` | Per custom provider | Custom OAuth provider client secret |

Generate a `BETTER_AUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Documentation

Full documentation is available in the [docs](docs/index.md) directory:

- [Email & Password](docs/email-password.md)
- [Email Verification](docs/email-verification.md)
- [Password Reset](docs/password-reset.md)
- [OAuth / Social Login](docs/oauth.md)
- [Two-Factor Authentication](docs/two-factor.md)
- [Role & Permission System](docs/roles.md)
- [Session Management](docs/session-management.md)
- [Middleware](docs/middleware.md)
- [React Hooks](docs/react-hooks.md)
- [UI Components](docs/ui-components.md)

## Contributing

Contributions are welcome! Please submit a pull request or open an issue.

## License

MIT
