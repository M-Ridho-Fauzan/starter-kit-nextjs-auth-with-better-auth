import { describe, it, expect, vi, beforeEach } from "vitest";

const mockWriteFile = vi.fn();
vi.mock("node:fs/promises", () => ({
  writeFile: (...args: unknown[]) => mockWriteFile(...args),
}));

const mockIntro = vi.fn();
const mockOutro = vi.fn();
const mockSelect = vi.fn();
const mockConfirm = vi.fn();
const mockText = vi.fn();
const mockPassword = vi.fn();
const mockIsCancel = vi.fn();
const mockCancel = vi.fn();

vi.mock("@clack/prompts", () => ({
  intro: (...args: unknown[]) => mockIntro(...args),
  outro: (...args: unknown[]) => mockOutro(...args),
  select: (...args: unknown[]) => mockSelect(...args),
  confirm: (...args: unknown[]) => mockConfirm(...args),
  text: (...args: unknown[]) => mockText(...args),
  password: (...args: unknown[]) => mockPassword(...args),
  isCancel: (...args: unknown[]) => mockIsCancel(...args),
  cancel: (...args: unknown[]) => mockCancel(...args),
}));

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.resetModules();
});

describe("setup wizard", () => {
  it("generates minimal config with emailPassword disabled", async () => {
    mockIsCancel.mockReturnValue(false);
    mockSelect
      .mockResolvedValueOnce("prisma")
      .mockResolvedValueOnce("jwt");
    mockText
      .mockResolvedValueOnce("postgresql://localhost/mydb")
      .mockResolvedValueOnce("7d")
      .mockResolvedValueOnce("/dashboard")
      .mockResolvedValueOnce("/");
    mockConfirm
      .mockResolvedValueOnce(false)  // email/password
      .mockResolvedValueOnce(true)   // password reset
      .mockResolvedValueOnce(false)  // GitHub OAuth
      .mockResolvedValueOnce(false)  // Google OAuth
      .mockResolvedValueOnce(false)  // custom OAuth loop
      .mockResolvedValueOnce(false)  // 2FA
      .mockResolvedValueOnce(false)  // roles
      .mockResolvedValueOnce(true);  // confirm generate

    await import("./setup");
    await delay(100);

    expect(mockWriteFile).toHaveBeenCalledTimes(2);

    const authConfigContent = mockWriteFile.mock.calls[0]![1] as string;
    const envContent = mockWriteFile.mock.calls[1]![1] as string;

    expect(authConfigContent).toContain('adapter: "prisma"');
    expect(authConfigContent).toContain("process.env.DATABASE_URL!");
    expect(authConfigContent).toContain('strategy: "jwt"');
    expect(authConfigContent).not.toContain("emailPassword:");
    expect(authConfigContent).not.toContain("github:");

    expect(envContent).toContain("DATABASE_URL=");
    expect(envContent).toContain("BETTER_AUTH_SECRET=");
    expect(envContent).toContain("BETTER_AUTH_URL=");
    expect(mockOutro).toHaveBeenCalled();
  });

  it("generates full featured config when all options enabled", async () => {
    mockIsCancel.mockReturnValue(false);
    mockSelect
      .mockResolvedValueOnce("prisma")
      .mockResolvedValueOnce("jwt");
    mockText
      .mockResolvedValueOnce("postgresql://localhost/mydb")
      .mockResolvedValueOnce("10")
      .mockResolvedValueOnce("gh_client_id")
      .mockResolvedValueOnce("google_client_id")
      .mockResolvedValueOnce("microsoft")
      .mockResolvedValueOnce("ms_client_id")
      .mockResolvedValueOnce("admin")
      .mockResolvedValueOnce("user,admin,moderator")
      .mockResolvedValueOnce("24h")
      .mockResolvedValueOnce("/app")
      .mockResolvedValueOnce("/welcome");
    mockConfirm
      .mockResolvedValueOnce(true)   // email/password
      .mockResolvedValueOnce(true)   // email verification
      .mockResolvedValueOnce(true)   // password reset
      .mockResolvedValueOnce(true)   // GitHub OAuth
      .mockResolvedValueOnce(true)   // Google OAuth
      .mockResolvedValueOnce(true)   // custom OAuth (first iteration)
      .mockResolvedValueOnce(false)  // custom OAuth (no more)
      .mockResolvedValueOnce(true)   // 2FA
      .mockResolvedValueOnce(true)   // roles
      .mockResolvedValueOnce(true);  // confirm generate
    mockPassword
      .mockResolvedValueOnce("gh_secret")
      .mockResolvedValueOnce("google_secret")
      .mockResolvedValueOnce("ms_secret");

    await import("./setup");
    await delay(100);

    expect(mockWriteFile).toHaveBeenCalledTimes(2);

    const authConfigContent = mockWriteFile.mock.calls[0]![1] as string;

    expect(authConfigContent).toContain("emailPassword: {");
    expect(authConfigContent).toContain("requireEmailVerification: true,");
    expect(authConfigContent).toContain("passwordMinLength: 10,");
    expect(authConfigContent).toContain("passwordReset: true,");
    expect(authConfigContent).toContain("github: {");
    expect(authConfigContent).toContain("process.env.GITHUB_CLIENT_ID!");
    expect(authConfigContent).toContain("process.env.GOOGLE_CLIENT_ID!");
    expect(authConfigContent).toContain('id: "microsoft"');
    expect(authConfigContent).toContain("process.env.MICROSOFT_CLIENT_ID!");
    expect(authConfigContent).toContain("twoFactor: {");
    expect(authConfigContent).toContain('methods: ["totp"]');
    expect(authConfigContent).toContain('defaultRole: "admin"');
    expect(authConfigContent).toContain('roles: ["user","admin","moderator"]');
    expect(authConfigContent).toContain('expiresIn: "24h"');
    expect(authConfigContent).toContain('redirectAfterLogin: "/app"');
  });

  it("handles cancellation gracefully", async () => {
    mockIsCancel.mockReturnValue(true);
    mockSelect.mockResolvedValue("prisma");
    mockText.mockResolvedValue("postgresql://localhost/mydb");

    await import("./setup");
    await delay(100);

    expect(mockCancel).toHaveBeenCalled();
    expect(mockWriteFile).not.toHaveBeenCalled();
  });

  it("generates config with partial features enabled", async () => {
    mockIsCancel.mockReturnValue(false);
    mockSelect
      .mockResolvedValueOnce("drizzle")
      .mockResolvedValueOnce("database");
    mockText
      .mockResolvedValueOnce("postgresql://localhost/mydb")
      .mockResolvedValueOnce("12")
      .mockResolvedValueOnce("admin")
      .mockResolvedValueOnce("user,admin,moderator")
      .mockResolvedValueOnce("7d")
      .mockResolvedValueOnce("/dashboard")
      .mockResolvedValueOnce("/");
    mockConfirm
      .mockResolvedValueOnce(true)   // email/password
      .mockResolvedValueOnce(true)   // email verification
      .mockResolvedValueOnce(true)   // password reset
      .mockResolvedValueOnce(false)  // GitHub OAuth
      .mockResolvedValueOnce(false)  // Google OAuth
      .mockResolvedValueOnce(false)  // custom OAuth
      .mockResolvedValueOnce(false)  // 2FA
      .mockResolvedValueOnce(true)   // roles
      .mockResolvedValueOnce(true);  // confirm generate

    await import("./setup");
    await delay(100);

    expect(mockWriteFile).toHaveBeenCalledTimes(2);

    const authConfigContent = mockWriteFile.mock.calls[0]![1] as string;

    expect(authConfigContent).toContain('adapter: "drizzle"');
    expect(authConfigContent).toContain("emailPassword: {");
    expect(authConfigContent).toContain("requireEmailVerification: true,");
    expect(authConfigContent).toContain("passwordMinLength: 12,");
    expect(authConfigContent).toContain("passwordReset: true,");
    expect(authConfigContent).toContain("roles: {");
    expect(authConfigContent).toContain('defaultRole: "admin"');
    expect(authConfigContent).toContain('roles: ["user","admin","moderator"]');
    expect(authConfigContent).not.toContain("oauth:");
    expect(authConfigContent).not.toContain("twoFactor:");
    expect(authConfigContent).toContain('strategy: "database"');
  });
});
