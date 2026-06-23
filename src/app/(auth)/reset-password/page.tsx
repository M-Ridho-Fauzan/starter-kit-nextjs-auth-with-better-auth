import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <AuthLayout
        title="Invalid reset link"
        description="This password reset link is invalid or missing a token."
      />
    );
  }

  return (
    <AuthLayout title="Reset your password">
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}
