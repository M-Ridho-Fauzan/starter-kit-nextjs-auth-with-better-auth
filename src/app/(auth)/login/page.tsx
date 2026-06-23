import config from "../../../../auth.config";
import { LoginForm } from "@/components/auth/login-form";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { getEnabledOAuthProviders } from "@/auth/config/oauth";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function LoginPage() {
  const providers = getEnabledOAuthProviders(config);

  return (
    <AuthLayout title="Sign in">
      <LoginForm />
      {providers.length > 0 && (
        <SocialLoginButtons providers={providers} />
      )}
    </AuthLayout>
  );
}
