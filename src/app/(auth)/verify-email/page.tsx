import { ResendVerificationForm } from "@/components/auth/resend-verification-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function VerifyEmailPage() {
  return (
    <AuthLayout
      title="Verify your email"
      description="Enter your email to receive a verification link."
    >
      <ResendVerificationForm />
    </AuthLayout>
  );
}
