import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth/server", () => ({
  auth: {
    api: {
      sendVerificationEmail: vi.fn(),
      verifyEmail: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock("../../../../auth.config", () => ({
  default: {
    ui: {
      redirectAfterLogin: "/dashboard",
      redirectAfterLogout: "/login",
    },
  },
}));

const redirectError = { digest: "NEXT_REDIRECT" };
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => { throw redirectError; }),
}));

const { resendVerificationEmail, verifyEmail } = await import(
  "./email-verification"
);

function makeForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  form.set("email", overrides.email ?? "user@example.com");
  if (overrides.token) form.set("token", overrides.token);
  return form;
}

describe("resendVerificationEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when email is missing", async () => {
    const form = makeForm({ email: "" });
    const result = await resendVerificationEmail(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("returns success on successful resend", async () => {
    const { auth } = await import("@/auth/server");
    const mockSend = auth.api.sendVerificationEmail as unknown as ReturnType<typeof vi.fn>;
    mockSend.mockResolvedValue({});

    const form = makeForm();
    const result = await resendVerificationEmail(null, form);
    expect(result.success).toBe(true);
    expect(mockSend).toHaveBeenCalledWith({
      body: { email: "user@example.com" },
      headers: expect.any(Headers),
    });
  });

  it("returns error on failure", async () => {
    const { auth } = await import("@/auth/server");
    const mockSend = auth.api.sendVerificationEmail as unknown as ReturnType<typeof vi.fn>;
    mockSend.mockRejectedValue({ status: 429, message: "Too many requests" });

    const form = makeForm();
    const result = await resendVerificationEmail(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("429");
    }
  });
});

describe("verifyEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when token is missing", async () => {
    const form = makeForm({ token: "" });
    const result = await verifyEmail(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("calls verifyEmail with correct query on success and redirects", async () => {
    const { auth } = await import("@/auth/server");
    const mockVerify = auth.api.verifyEmail as unknown as ReturnType<typeof vi.fn>;
    mockVerify.mockResolvedValue({});

    const form = makeForm({ token: "valid-token" });
    const resultPromise = verifyEmail(null, form);

    await expect(resultPromise).rejects.toThrow();
    expect(mockVerify).toHaveBeenCalledWith({
      query: { token: "valid-token" },
    });
  });

  it("returns error on verification failure", async () => {
    const { auth } = await import("@/auth/server");
    const mockVerify = auth.api.verifyEmail as unknown as ReturnType<typeof vi.fn>;
    mockVerify.mockRejectedValue({ status: 400, message: "Invalid token" });

    const form = makeForm({ token: "bad-token" });
    const result = await verifyEmail(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("400");
    }
  });
});
