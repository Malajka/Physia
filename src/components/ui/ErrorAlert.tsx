import { errorAlertBase } from "@/lib/constants/uiClasses";
import React, { type ReactNode } from "react";

export interface ErrorAlertProps<T> {
  /** Single error or array of errors of type T */
  errors: T | T[] | null;
  /** Optional custom renderer for each error item */
  render?: (error: T) => ReactNode;
}

/**
 * A generic error alert component for displaying one or more errors.
 * Uses a role="alert" and aria-live for accessibility.
 */
export function ErrorAlert<T extends string | ReactNode = string>({ errors, render }: ErrorAlertProps<T>) {
  if (!errors || (Array.isArray(errors) && errors.length === 0)) {
    // Always render the alert region, but hide it if there are no errors
    return <div role="alert" aria-live="assertive" style={{ display: "none" }} />;
  }
  const list: T[] = Array.isArray(errors) ? errors : [errors];

  return (
    <div role="alert" aria-live="assertive" className={errorAlertBase}>
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
          <h3 className="text-sm font-medium text-red-800">Error{list.length > 1 ? "s" : ""}</h3>
          <div className="mt-2 text-sm">
            <ul className="list-disc pl-5 space-y-1">
              {list.map((err, i) => (
                <li key={i}>
                  {render ? render(err) : typeof err === "string" ? <span dangerouslySetInnerHTML={{ __html: err }} /> : (err as ReactNode)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export const MemoizedErrorAlert = React.memo(ErrorAlert);
MemoizedErrorAlert.displayName = "ErrorAlert";
