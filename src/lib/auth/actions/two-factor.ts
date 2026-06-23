"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth/server";
import type { AuthActionResult } from "./types";

/**
 * Typed wrapper for two-factor API methods.
 * These methods exist on auth.api at runtime only when the twoFactor
 * plugin is enabled in auth.config.ts.
 */
function twoFactorAPI() {
  return auth.api as unknown as {
    verifyTOTP: (opts: {
      body: { code: string; trustDevice?: boolean };
      headers: Headers;
    }) => Promise<{ token: string; user: unknown }>;
    getTOTPURI: (opts: {
      body: { password: string; issuer?: string };
      headers: Headers;
    }) => Promise<{ totpURI: string }>;
    enableTwoFactor: (opts: {
      body: { password?: string; issuer?: string };
      headers: Headers;
    }) => Promise<{ totpURI: string; backupCodes: string[] }>;
    disableTwoFactor: (opts: {
      body: { password?: string };
      headers: Headers;
    }) => Promise<{ status: boolean }>;
    generateBackupCodes: (opts: {
      body: { password?: string };
      headers: Headers;
    }) => Promise<{ status: boolean; backupCodes: string[] }>;
  };
}

/**
 * Verify a TOTP code during a 2FA-protected login attempt.
 * Called from the 2FA verification page after signInEmail returned
 * `{ twoFactorRedirect: true }`.
 */
export async function verifyTotpAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const code = formData.get("code") as string;

  if (!code) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "TOTP code is required." },
    };
  }

  try {
    await twoFactorAPI().verifyTOTP({
      body: { code },
      headers: await headers(),
    });
  } catch (err) {
    const error = err as {
      status?: number;
      message?: string;
      digest?: string;
    };
    if (error.digest) {
      throw err;
    }
    return {
      success: false,
      error: {
        code: String(error.status ?? 500),
        message: error.message ?? "Invalid or expired TOTP code.",
      },
    };
  }

  redirect("/dashboard");
}

/**
 * Get the TOTP URI for QR code display.
 */
export async function getTOTPURIAction(
  _prevState: AuthActionResult<{ totpURI: string }> | null,
  formData: FormData,
): Promise<AuthActionResult<{ totpURI: string }>> {
  const password = formData.get("password") as string;

  if (!password) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Password is required." },
    };
  }

  try {
    const result = await twoFactorAPI().getTOTPURI({
      body: { password },
      headers: await headers(),
    });

    return {
      success: true,
      data: { totpURI: result.totpURI },
    };
  } catch (err) {
    const error = err as { status?: number; message?: string };
    return {
      success: false,
      error: {
        code: String(error.status ?? 500),
        message: error.message ?? "Failed to get TOTP URI.",
      },
    };
  }
}

/**
 * Enable two-factor authentication for the current user.
 * Returns the TOTP URI (for QR code) and backup codes.
 */
export async function enableTwoFactorAction(
  _prevState: AuthActionResult<{ totpURI: string; backupCodes: string[] }> | null,
  formData: FormData,
): Promise<AuthActionResult<{ totpURI: string; backupCodes: string[] }>> {
  const password = formData.get("password") as string;

  if (!password) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Password is required." },
    };
  }

  try {
    const result = await twoFactorAPI().enableTwoFactor({
      body: { password },
      headers: await headers(),
    });

    return {
      success: true,
      data: {
        totpURI: result.totpURI,
        backupCodes: result.backupCodes,
      },
    };
  } catch (err) {
    const error = err as { status?: number; message?: string };
    return {
      success: false,
      error: {
        code: String(error.status ?? 500),
        message: error.message ?? "Failed to enable two-factor authentication.",
      },
    };
  }
}

/**
 * Disable two-factor authentication for the current user.
 */
export async function disableTwoFactorAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const password = formData.get("password") as string;

  if (!password) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Password is required." },
    };
  }

  try {
    await twoFactorAPI().disableTwoFactor({
      body: { password },
      headers: await headers(),
    });

    return {
      success: true,
      message: "Two-factor authentication disabled.",
    };
  } catch (err) {
    const error = err as { status?: number; message?: string };
    return {
      success: false,
      error: {
        code: String(error.status ?? 500),
        message: error.message ?? "Failed to disable two-factor authentication.",
      },
    };
  }
}

/**
 * Generate new backup codes for the current user.
 * Returns the new backup codes.
 */
export async function generateBackupCodesAction(
  _prevState: AuthActionResult<{ backupCodes: string[] }> | null,
  formData: FormData,
): Promise<AuthActionResult<{ backupCodes: string[] }>> {
  const password = formData.get("password") as string;

  if (!password) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Password is required." },
    };
  }

  try {
    const result = await twoFactorAPI().generateBackupCodes({
      body: { password },
      headers: await headers(),
    });

    return {
      success: true,
      data: { backupCodes: result.backupCodes },
    };
  } catch (err) {
    const error = err as { status?: number; message?: string };
    return {
      success: false,
      error: {
        code: String(error.status ?? 500),
        message: error.message ?? "Failed to generate backup codes.",
      },
    };
  }
}
