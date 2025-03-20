import React, { useState } from 'react';
import { useForm } from '../context/FormContext';
import { FormStepId } from '../utils/FormConfigGenerator';
import './FormSubmissionHandler.css';

interface FormSubmissionHandlerProps {
  onSuccess: (formData: any) => void;
}

/**
 * FormSubmissionHandler component
 *
 * This component handles the form submission process as described in the data flow diagram (steps H → I).
 * It validates the form data, and either redirects back to the form if invalid,
 * or proceeds to generate artifacts if valid.
 */
const FormSubmissionHandler: React.FC<FormSubmissionHandlerProps> = ({ onSuccess }) => {
  const {
    submitForm,
    formErrors,
    formState,
    availableSteps,
    isStepValid,
    moveToStep
  } = useForm();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<FormStepId, string>>({} as Record<FormStepId, string>);

  // Validate all steps and identify which ones have errors
  const validateAllSteps = (): boolean => {
    const stepErrors: Record<FormStepId, string> = {} as Record<FormStepId, string>;
    
    let allValid = true;
    for (const stepId of availableSteps) {
      if (!isStepValid(stepId)) {
        stepErrors[stepId] = `Please complete all required fields in this section`;
        allValid = false;
      }
    }
    
    setValidationErrors(stepErrors);
    return allValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Step H: Form Submission - Validate all steps
      const isValid = validateAllSteps();
      
      // Step I: Valid? - Check validation result
      if (!isValid) {
        // If not valid, find the first step with errors and navigate to it
        const firstInvalidStep = availableSteps.find(stepId => !isStepValid(stepId));
        if (firstInvalidStep) {
          moveToStep(firstInvalidStep);
        }
        return;
      }
      
      // If valid, submit the form
      await submitForm();
      
      // If submission is successful, call onSuccess to proceed to artifact generation
      onSuccess(formState);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render validation errors if any
  const renderValidationErrors = () => {
    if (Object.keys(validationErrors).length === 0 && Object.keys(formErrors).length === 0) {
      return null;
    }

    return (
      <div className="form-submission-errors">
        <h3>Please correct the following errors:</h3>
        <ul>
          {Object.entries(validationErrors).map(([stepId, error]) => (
            <li key={stepId}>
              <button
                onClick={() => moveToStep(stepId as FormStepId)}
                className="error-navigation-button"
              >
                {stepId}: {error}
              </button>
            </li>
          ))}
          {Object.entries(formErrors).map(([key, error]) => (
            <li key={key} className="form-error">
              {error}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="form-submission-handler">
      {renderValidationErrors()}
      
      <div className="form-submission-actions">
        <button 
          className="submit-button"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Form'}
        </button>
      </div>
    </div>
  );
};

export default FormSubmissionHandler;