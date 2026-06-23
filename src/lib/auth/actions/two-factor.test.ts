import { describe, it, expect, vi, beforeEach } from "vitest";

const mockVerifyTOTP = vi.fn();
const mockEnableTwoFactor = vi.fn();
const mockDisableTwoFactor = vi.fn();
const mockGenerateBackupCodes = vi.fn();
const mockGetTOTPURI = vi.fn();

vi.mock("@/auth/server", () => ({
  auth: {
    api: {
      verifyTOTP: mockVerifyTOTP,
      enableTwoFactor: mockEnableTwoFactor,
      disableTwoFactor: mockDisableTwoFactor,
      generateBackupCodes: mockGenerateBackupCodes,
      getTOTPURI: mockGetTOTPURI,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

const redirectError = { digest: "NEXT_REDIRECT" };
const mockRedirect = vi.fn(() => { throw redirectError; });
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
}));

const {
  verifyTotpAction,
  getTOTPURIAction,
  enableTwoFactorAction,
  disableTwoFactorAction,
  generateBackupCodesAction,
} = await import("./two-factor");

function makeForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  if (overrides.code !== undefined) form.set("code", overrides.code);
  if (overrides.password !== undefined) form.set("password", overrides.password);
  return form;
}

describe("verifyTotpAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when code is missing", async () => {
    const form = makeForm({ code: "" });
    const result = await verifyTotpAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("calls verifyTOTP with correct body on success and redirects", async () => {
    mockVerifyTOTP.mockResolvedValue({ token: "abc", user: { id: "1" } });

    const form = makeForm({ code: "123456" });
    const resultPromise = verifyTotpAction(null, form);

    await expect(resultPromise).rejects.toThrow();
    expect(mockVerifyTOTP).toHaveBeenCalledWith({
      body: { code: "123456" },
      headers: expect.any(Headers),
    });
  });

  it("returns error on verification failure", async () => {
    mockVerifyTOTP.mockRejectedValue({ status: 400, message: "Invalid code" });

    const form = makeForm({ code: "000000" });
    const result = await verifyTotpAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("400");
    }
  });
});

describe("getTOTPURIAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when password is missing", async () => {
    const form = makeForm({ password: "" });
    const result = await getTOTPURIAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("returns TOTP URI on success", async () => {
    mockGetTOTPURI.mockResolvedValue({
      totpURI: "otpauth://totp/App:user?secret=ABC123&issuer=App",
    });

    const form = makeForm({ password: "correct-password" });
    const result = await getTOTPURIAction(null, form);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.totpURI).toContain("otpauth://");
    }
  });

  it("returns error on failure", async () => {
    mockGetTOTPURI.mockRejectedValue({ status: 401, message: "Invalid password" });

    const form = makeForm({ password: "wrong-password" });
    const result = await getTOTPURIAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("401");
    }
  });
});

describe("enableTwoFactorAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when password is missing", async () => {
    const form = makeForm({ password: "" });
    const result = await enableTwoFactorAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("enables 2FA and returns TOTP URI and backup codes on success", async () => {
    mockEnableTwoFactor.mockResolvedValue({
      totpURI: "otpauth://totp/App:user?secret=ABC123",
      backupCodes: ["AAAA-BBBB", "CCCC-DDDD"],
    });

    const form = makeForm({ password: "correct-password" });
    const result = await enableTwoFactorAction(null, form);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.totpURI).toContain("otpauth://");
      expect(result.data?.backupCodes).toHaveLength(2);
    }
  });

  it("returns error on failure", async () => {
    mockEnableTwoFactor.mockRejectedValue({ status: 401, message: "Invalid password" });

    const form = makeForm({ password: "wrong-password" });
    const result = await enableTwoFactorAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("401");
    }
  });
});

describe("disableTwoFactorAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when password is missing", async () => {
    const form = makeForm({ password: "" });
    const result = await disableTwoFactorAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("disables 2FA on success", async () => {
    mockDisableTwoFactor.mockResolvedValue({ status: true });

    const form = makeForm({ password: "correct-password" });
    const result = await disableTwoFactorAction(null, form);
    expect(result.success).toBe(true);
  });

  it("returns error on failure", async () => {
    mockDisableTwoFactor.mockRejectedValue({ status: 401, message: "Invalid password" });

    const form = makeForm({ password: "wrong-password" });
    const result = await disableTwoFactorAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("401");
    }
  });
});

describe("generateBackupCodesAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when password is missing", async () => {
    const form = makeForm({ password: "" });
    const result = await generateBackupCodesAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("generates new backup codes on success", async () => {
    mockGenerateBackupCodes.mockResolvedValue({
      status: true,
      backupCodes: ["NEW1-AAAA", "NEW2-BBBB"],
    });

    const form = makeForm({ password: "correct-password" });
    const result = await generateBackupCodesAction(null, form);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data?.backupCodes).toHaveLength(2);
    }
  });

  it("returns error on failure", async () => {
    mockGenerateBackupCodes.mockRejectedValue({ status: 401, message: "Invalid password" });

    const form = makeForm({ password: "wrong-password" });
    const result = await generateBackupCodesAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("401");
    }
  });
});
