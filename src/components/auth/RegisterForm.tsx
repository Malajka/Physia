import { AuthForm } from "@/components/auth/AuthForm";
import { PasswordField } from "@/components/auth/PasswordField";
import { InputField, LinkButton } from "@/components/ui";
import { useRegister } from "@/hooks/useRegister";

interface RegisterFormProps {
  initialError?: string | null;
}

export const RegisterForm = function RegisterForm({ initialError = null }: RegisterFormProps) {
  const { registrationSuccess, error, submitRegistration } = useRegister();

  if (registrationSuccess) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Registration Successful!</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <p className="text-green-800 mb-4 text-xl">
            <strong>Thank you for registering!</strong>
          </p>
          <p className="text-green-700 mb-4 text-lg">Now you can start creating your own sessions and muscle tests!</p>
          <LinkButton href="/body-parts" variant="nav-primary" className="text-lg block w-full" data-testid="create-new-session-link">
            Create First Session
          </LinkButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <AuthForm
        title="Create Account"
        onSubmit={submitRegistration}
        submitText="Register"
        errors={error || initialError}
        submitTestId="register-submit"
      >
        <InputField id="email" name="email" label="Email" type="email" placeholder="your@email.com" required data-testid="register-email" />
        <PasswordField id="password" name="password" label="Password" placeholder="Min. 8 characters" required data-testid="register-password" />
        <PasswordField
          id="passwordConfirm"
          name="passwordConfirm"
          label="Confirm Password"
          placeholder="Confirm your password"
          required
          data-testid="register-passwordConfirm"
        />
        <p className="text-sm text-gray-600 mt-2">Password must be at least 8 characters long.</p>
      </AuthForm>
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <LinkButton href="/login" variant="text" className="text-gray-600 underline">
            Log in here
          </LinkButton>
        </p>
      </div>
    </>
  );
};
