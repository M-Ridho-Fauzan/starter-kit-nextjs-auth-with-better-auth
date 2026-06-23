import config from "../../../../auth.config";
import { RegisterForm } from "@/components/auth/register-form";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { getEnabledOAuthProviders } from "@/auth/config/oauth";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function RegisterPage() {
  const providers = getEnabledOAuthProviders(config);

  return (
    <AuthLayout title="Create an account">
      <RegisterForm />
      {providers.length > 0 && (
        <SocialLoginButtons providers={providers} />
      )}
    </AuthLayout>
  );
}
