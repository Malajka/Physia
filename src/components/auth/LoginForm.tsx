import { InputField } from "@/components/ui/InputField";
import { handleLoginSubmit } from "@/lib/services/loginForm";
import { AuthForm } from "./AuthForm";
import { PasswordField } from "./PasswordField";

interface LoginFormProps {
  initialError?: string | null;
}

export const LoginForm = function LoginForm({ initialError = null }: LoginFormProps) {
  return (
    <AuthForm 
      title="Log In" 
      onSubmit={handleLoginSubmit} 
      submitText="Log In" 
      submitTestId="login-submit" 
      errors={initialError}
    >
      <InputField
        id="email"
        name="email"
        label="Email"
        type="email"
        placeholder="your@email.com"
        required
        data-testid="email"
      />
      <PasswordField
        id="password"
        name="password"
        label="Password"
        placeholder="Your password"
        required
        data-testid="password"
      />
    </AuthForm>
  );
};
