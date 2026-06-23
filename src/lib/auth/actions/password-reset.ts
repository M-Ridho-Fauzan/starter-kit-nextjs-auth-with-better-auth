"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth/server";
import config from "../../../../auth.config";
import type { AuthActionResult } from "./types";

export async function requestPasswordResetAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Email is required." },
    };
  }

  try {
    await auth.api.requestPasswordReset({
      body: { email },
      headers: await headers(),
    });

    return {
      success: true,
      message: "Password reset link sent. Check your inbox.",
    };
  } catch (err) {
    const error = err as { status?: number; message?: string };
    return {
      success: false,
      error: {
        code: String(error.status ?? 500),
        message: error.message ?? "Failed to send password reset email.",
      },
    };
  }
}

export async function resetPasswordAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;

  if (!token || !password) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Token and new password are required.",
      },
    };
  }

  try {
    await auth.api.resetPassword({
      body: { newPassword: password, token },
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
        message: error.message ?? "Invalid or expired reset token.",
      },
    };
  }

  redirect(config.ui.redirectAfterLogout);
}
