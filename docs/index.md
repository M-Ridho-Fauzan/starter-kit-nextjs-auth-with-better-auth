# Documentation

## Auth Features

- [Email & Password](./email-password.md) — Email/password registration and login
- [Email Verification](./email-verification.md) — Email verification flow
- [Password Reset](./password-reset.md) — Password reset flow
- [OAuth / Social Login](./oauth.md) — OAuth with GitHub, Google, and custom providers
- [Two-Factor Authentication](./two-factor.md) — TOTP two-factor authentication
- [Role & Permission System](./roles.md) — Role-based access control
- [Session Management](./session-management.md) — JWT vs database strategies, `getServerSession()`
- [Middleware](./middleware.md) — Route protection with auth and role checks
- [React Hooks](./react-hooks.md) — `useAuth` and `useSession` client hooks
- [UI Components](./ui-components.md) — shadcn/ui auth forms and user profile

## DX Tools

- [Setup Wizard](../scripts/setup.ts) — Interactive CLI to configure your project
- [Env Generator](../scripts/generate-env.example.ts) — Generate `.env.example` from `auth.config.ts`

## Database Adapters

- [Prisma Adapter](./prisma.adapter.md) — Connect Better Auth to Prisma
- [Drizzle Adapter](./drizzle.adapter.md) — Connect Better Auth to Drizzle ORM
- [Kysely Adapter](./kysely.adapter.md) — Connect Better Auth to Kysely
