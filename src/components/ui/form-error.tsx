import React from 'react';

interface FormErrorProps {
  message: string;
  className?: string;
}

/**
 * FormError component for displaying field-level validation errors
 * This component provides consistent styling for form field errors
 */
export function FormError({ message, className = '' }: FormErrorProps) {
  if (!message) return null;
  
  return (
    <p className={`text-destructive text-sm mt-1 font-medium ${className}`}>
      {message}
    </p>
  );
}

interface FormErrorSummaryProps {
  errors: Array<{ id: string; message: string }>;
  title?: string;
  className?: string;
}

/**
 * FormErrorSummary component for displaying a summary of validation errors
 * This component provides consistent styling for form error summaries
 */
export function FormErrorSummary({ 
  errors, 
  title = 'Please fix the following errors:', 
  className = '' 
}: FormErrorSummaryProps) {
  if (!errors || errors.length === 0) return null;
  
  return (
    <div className={`bg-destructive/10 border border-destructive rounded-md p-4 mt-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-destructive">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-destructive">
            {title}
          </h3>
          <div className="mt-2">
            <ul className="list-disc pl-5 space-y-1">
              {errors.map(error => (
                <li key={error.id} className="text-sm text-destructive">{error.message}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  children: React.ReactNode;
  error?: string;
  className?: string;
}

/**
 * FormField component for wrapping form fields with consistent styling
 * This component provides consistent styling for form fields and their error messages
 */
export function FormField({ children, error, className = '' }: FormFieldProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
      {error && <FormError message={error} />}
    </div>
  );
}