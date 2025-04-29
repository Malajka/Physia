import { useState } from "react";
import { ErrorAlert } from "./ErrorAlert";

interface AuthFormProps {
  title: string;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error: string } | undefined>;
  children: React.ReactNode;
  submitText: string;
  errors?: string[] | string | null;
}

export const AuthForm = ({ title, onSubmit, children, submitText, errors: initialErrors = null }: AuthFormProps) => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[] | string | null>(initialErrors);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors(null);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await onSubmit(formData);

      if (result && !result.success) {
        setErrors(result.error);
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrors(error.message);
      } else {
        setErrors("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>

      {errors && <ErrorAlert errors={errors} />}

      <form onSubmit={handleSubmit}>
        {children}

        <div className="mt-6">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Processing..." : submitText}
          </button>
        </div>
      </form>
    </div>
  );
};
