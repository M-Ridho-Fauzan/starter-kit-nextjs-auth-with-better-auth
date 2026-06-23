/**
 * Auth configuration entry point.
 *
 * Customize this file to match your application's needs.
 * All values flow from here — zero hardcoding in the source.
 *
 * @see https://opencode.ai/docs/auth-config
 */
import { defineAuthConfig } from "@/auth/config";

export default defineAuthConfig({
  database: {
    adapter: "prisma",
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
    strategy: "jwt",
    cookieName: "auth_session",
  },
  ui: {
    theme: "shadcn",
    redirectAfterLogin: "/dashboard",
    redirectAfterLogout: "/",
  },
});
