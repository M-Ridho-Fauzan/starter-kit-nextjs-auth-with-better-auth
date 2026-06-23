"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth/server";
import config from "../../../../auth.config";
import type { AuthActionResult } from "./types";

export async function resendVerificationEmail(
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
    await auth.api.sendVerificationEmail({
      body: { email },
      headers: await headers(),
    });

    return {
      success: true,
      message: "Verification email sent. Check your inbox.",
    };
  } catch (err) {
    const error = err as { status?: number; message?: string };
    return {
      success: false,
      error: {
        code: String(error.status ?? 500),
        message: error.message ?? "Failed to send verification email.",
      },
    };
  }
}

export async function verifyEmail(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const token = formData.get("token") as string;

  if (!token) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Verification token is required." },
    };
  }

  try {
    await auth.api.verifyEmail({
      query: { token },
    });
  } catch (err) {
    const error = err as { status?: number; message?: string; digest?: string };
    if (error.digest) {
      throw err;
    }
    return {
      success: false,
      error: {
        code: String(error.status ?? 500),
        message: error.message ?? "Invalid or expired verification token.",
      },
    };
  }

  redirect(config.ui.redirectAfterLogin);
}
