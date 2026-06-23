"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/auth/server";
import config from "../../../../auth.config";
import type { AuthActionResult } from "./types";

export async function signInWithEmailPassword(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Email and password are required." },
    };
  }

  try {
    const result = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
    });

    const resultAny = result as Record<string, unknown>;
    if (resultAny.twoFactorRedirect === true) {
      redirect("/2fa/verify");
    }
  } catch (err) {
    const error = err as { status?: number; message?: string; statusText?: string; digest?: string };
    if (error.digest) {
      throw err;
    }
    return {
      success: false,
      error: {
        code: String(error.status ?? 500),
        message: error.message ?? "Invalid email or password.",
      },
    };
  }

  redirect(config.ui.redirectAfterLogin);
}

export async function signUpWithEmailPassword(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password || !name) {
    return {
      success: false,
      error: { code: "VALIDATION_ERROR", message: "Name, email, and password are required." },
    };
  }

  try {
    await auth.api.signUpEmail({
      body: { email, password, name },
      headers: await headers(),
    });
  } catch (err) {
    const error = err as { status?: number; message?: string; statusText?: string; digest?: string };
    if (error.digest) {
      throw err;
    }
    return {
      success: false,
      error: {
        code: String(error.status ?? 500),
        message: error.message ?? "Registration failed.",
      },
    };
  }

  redirect(config.ui.redirectAfterLogin);
}
