import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

const baseField =
  "w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed";

const stateClasses = (error?: string) =>
  error
    ? "border-red-400 dark:border-red-600 focus:border-red-500 focus:ring-red-500/20"
    : "border-gray-200 dark:border-gray-700 focus:border-primary-500";

interface FieldWrapperProps {
  id: string;
  label?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function FieldWrapper({
  id,
  label,
  error,
  required,
  children,
  className,
}: FieldWrapperProps) {
  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  wrapperClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, icon, wrapperClassName, className, id, required, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id || props.name || autoId;
    return (
      <FieldWrapper
        id={fieldId}
        label={label}
        error={error}
        required={required}
        className={wrapperClassName}
      >
        <div className="relative">
          {icon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${fieldId}-error` : undefined}
            className={cn(baseField, stateClasses(error), icon && "pl-12", className)}
            {...props}
          />
        </div>
      </FieldWrapper>
    );
  }
);

InputField.displayName = "InputField";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, wrapperClassName, className, id, required, ...props }, ref) => {
    const autoId = useId();
    const fieldId = id || props.name || autoId;
    return (
      <FieldWrapper
        id={fieldId}
        label={label}
        error={error}
        required={required}
        className={wrapperClassName}
      >
        <textarea
          ref={ref}
          id={fieldId}
          aria-invalid={error ? true : undefined}
          className={cn(baseField, stateClasses(error), className)}
          {...props}
        />
      </FieldWrapper>
    );
  }
);

TextareaField.displayName = "TextareaField";
