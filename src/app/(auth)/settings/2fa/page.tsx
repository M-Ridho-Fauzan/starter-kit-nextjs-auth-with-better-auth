import config from "../../../../../auth.config";
import { TwoFactorSetupForm } from "@/components/auth/two-factor-setup-form";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function SettingsTwoFactorPage() {
  const twoFactorEnabled = config.features.twoFactor.enabled;

  if (!twoFactorEnabled) {
    return (
      <AuthLayout
        title="Two-factor authentication"
        description="Two-factor authentication is not enabled in the configuration."
      />
    );
  }

  return (
    <AuthLayout title="Two-factor authentication">
      <TwoFactorSetupForm />
    </AuthLayout>
  );
}
