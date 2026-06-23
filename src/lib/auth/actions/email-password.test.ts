import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth/server", () => ({
  auth: {
    api: {
      signInEmail: vi.fn(),
      signUpEmail: vi.fn(),
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

const { signInWithEmailPassword, signUpWithEmailPassword } = await import(
  "./email-password"
);

function makeForm(overrides: Record<string, string> = {}): FormData {
  const form = new FormData();
  form.set("email", overrides.email ?? "user@example.com");
  form.set("password", overrides.password ?? "Password123");
  if (overrides.name) form.set("name", overrides.name);
  return form;
}

describe("signInWithEmailPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when email is missing", async () => {
    const form = makeForm({ email: "" });
    const result = await signInWithEmailPassword(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("returns validation error when password is missing", async () => {
    const form = makeForm({ password: "" });
    const result = await signInWithEmailPassword(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("calls signInEmail with correct body and headers on success", async () => {
    const { auth } = await import("@/auth/server");
    const mockSignIn = auth.api.signInEmail as unknown as ReturnType<typeof vi.fn>;
    mockSignIn.mockResolvedValue({ user: { id: "1" }, token: "abc" });

    const form = makeForm();
    const resultPromise = signInWithEmailPassword(null, form);

    await expect(resultPromise).rejects.toThrow();
    expect(mockSignIn).toHaveBeenCalledWith({
      body: { email: "user@example.com", password: "Password123" },
      headers: expect.any(Headers),
    });
  });

  it("redirects to 2fa verify when twoFactorRedirect is true", async () => {
    const { auth } = await import("@/auth/server");
    const { redirect } = await import("next/navigation");
    const mockSignIn = auth.api.signInEmail as unknown as ReturnType<typeof vi.fn>;
    mockSignIn.mockResolvedValue({ twoFactorRedirect: true, twoFactorMethods: ["totp"] });

    const form = makeForm();
    await expect(signInWithEmailPassword(null, form)).rejects.toThrow();
    expect(redirect).toHaveBeenCalledWith("/2fa/verify");
  });

  it("returns error when signInEmail throws", async () => {
    const { auth } = await import("@/auth/server");
    const mockSignIn = auth.api.signInEmail as unknown as ReturnType<typeof vi.fn>;
    mockSignIn.mockRejectedValue({ status: 401, message: "Invalid credentials" });

    const form = makeForm();
    const result = await signInWithEmailPassword(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("401");
      expect(result.error.message).toBe("Invalid credentials");
    }
  });
});

describe("signUpWithEmailPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns validation error when name is missing", async () => {
    const form = makeForm({ name: "" });
    const result = await signUpWithEmailPassword(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("returns validation error when email is missing", async () => {
    const form = makeForm({ email: "", name: "Test" });
    const result = await signUpWithEmailPassword(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("returns validation error when password is missing", async () => {
    const form = makeForm({ password: "", name: "Test" });
    const result = await signUpWithEmailPassword(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("VALIDATION_ERROR");
    }
  });

  it("calls signUpEmail with correct body and headers on success", async () => {
    const { auth } = await import("@/auth/server");
    const mockSignUp = auth.api.signUpEmail as unknown as ReturnType<typeof vi.fn>;
    mockSignUp.mockResolvedValue({ user: { id: "1" }, token: "abc" });

    const form = makeForm({ name: "Test User" });
    const resultPromise = signUpWithEmailPassword(null, form);

    await expect(resultPromise).rejects.toThrow();
    expect(mockSignUp).toHaveBeenCalledWith({
      body: {
        email: "user@example.com",
        password: "Password123",
        name: "Test User",
      },
      headers: expect.any(Headers),
    });
  });

  it("returns error when signUpEmail throws", async () => {
    const { auth } = await import("@/auth/server");
    const mockSignUp = auth.api.signUpEmail as unknown as ReturnType<typeof vi.fn>;
    mockSignUp.mockRejectedValue({ status: 422, message: "Email already exists" });

    const form = makeForm({ name: "Test User" });
    const result = await signUpWithEmailPassword(null, form);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe("422");
      expect(result.error.message).toBe("Email already exists");
    }
  });
});
