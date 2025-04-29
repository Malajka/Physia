
interface ErrorAlertProps {
  errors: string[] | string | null;
}

export const ErrorAlert = ({ errors }: ErrorAlertProps) => {
  if (!errors) return null;

  const errorMessages = Array.isArray(errors) ? errors : [errors];

  return (
    <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Error{errorMessages.length > 1 ? "s" : ""}</h3>
          <div className="mt-2 text-sm">
            <ul className="list-disc pl-5 space-y-1">
              {errorMessages.map((message, index) => (
                <li key={index} dangerouslySetInnerHTML={{ __html: message }} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}; 