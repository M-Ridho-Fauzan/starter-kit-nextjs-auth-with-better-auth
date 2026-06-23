import { TwoFactorVerifyForm } from "@/components/auth/two-factor-verify-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function TwoFactorVerifyPage() {
  return (
    <AuthLayout
      title="Two-factor authentication"
      description="Enter the code from your authenticator app to continue."
    >
      <TwoFactorVerifyForm />
    </AuthLayout>
  );
}
