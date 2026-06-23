import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth/server", () => ({
  auth: {
    api: {
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
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

const { requestPasswordResetAction, resetPasswordAction } = await import(
  "./password-reset"
);

function makeForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  if (overrides.email !== undefined) form.set("email", overrides.email);
  if (overrides.token !== undefined) form.set("token", overrides.token);
  if (overrides.password !== undefined) form.set("password", overrides.password);
  return form;
}

describe("requestPasswordResetAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when email is missing", async () => {
    const form = makeForm({ email: "" });
    const result = await requestPasswordResetAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("returns success on successful request", async () => {
    const { auth } = await import("@/auth/server");
    const mockRequest = auth.api.requestPasswordReset as unknown as ReturnType<typeof vi.fn>;
    mockRequest.mockResolvedValue({});

    const form = makeForm({ email: "user@example.com" });
    const result = await requestPasswordResetAction(null, form);
    expect(result.success).toBe(true);
    expect(mockRequest).toHaveBeenCalledWith({
      body: { email: "user@example.com" },
      headers: expect.any(Headers),
    });
  });

  it("returns error on failure", async () => {
    const { auth } = await import("@/auth/server");
    const mockRequest = auth.api.requestPasswordReset as unknown as ReturnType<typeof vi.fn>;
    mockRequest.mockRejectedValue({ status: 429, message: "Too many requests" });

    const form = makeForm({ email: "user@example.com" });
    const result = await requestPasswordResetAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("429");
    }
  });
});

describe("resetPasswordAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when token is missing", async () => {
    const form = makeForm({ token: "", password: "NewPass123" });
    const result = await resetPasswordAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("returns validation error when password is missing", async () => {
    const form = makeForm({ token: "valid-token", password: "" });
    const result = await resetPasswordAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("calls resetPassword with correct body on success and redirects", async () => {
    const { auth } = await import("@/auth/server");
    const mockReset = auth.api.resetPassword as unknown as ReturnType<typeof vi.fn>;
    mockReset.mockResolvedValue({});

    const form = makeForm({ token: "valid-token", password: "NewPass123" });
    const resultPromise = resetPasswordAction(null, form);

    await expect(resultPromise).rejects.toThrow();
    expect(mockReset).toHaveBeenCalledWith({
      body: { newPassword: "NewPass123", token: "valid-token" },
      headers: expect.any(Headers),
    });
  });

  it("returns error on reset failure", async () => {
    const { auth } = await import("@/auth/server");
    const mockReset = auth.api.resetPassword as unknown as ReturnType<typeof vi.fn>;
    mockReset.mockRejectedValue({ status: 400, message: "Invalid or expired token" });

    const form = makeForm({ token: "bad-token", password: "NewPass123" });
    const result = await resetPasswordAction(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("400");
      expect(result.error.message).toBe("Invalid or expired token");
    }
  });

  it("re-throws redirect error", async () => {
    const { auth } = await import("@/auth/server");
    const mockReset = auth.api.resetPassword as unknown as ReturnType<typeof vi.fn>;
    mockReset.mockRejectedValue(redirectError);

    const form = makeForm({ token: "valid-token", password: "NewPass123" });
    await expect(resetPasswordAction(null, form)).rejects.toThrow();
  });
});
