import React from 'react';
import { useForm, FormStepId } from '../context/FormContext';
import { PersonalInfoStep } from './PersonalInfoStep';
import { ConsentsStep } from './ConsentsStep';
import { ResidenceHistoryStep } from './ResidenceHistoryStep';
import { EmploymentHistoryStep } from './EmploymentHistoryStep';
import { Signature } from './Signature';

// Define valid step IDs
export type StepId =
  | 'personal-info'
  | 'residence-history'
  | 'employment-history'
  | 'education'
  | 'professional-licenses'
  | 'consents'
  | 'signature';

interface FormStepProps {
  stepId?: FormStepId;
}

export const FormStep: React.FC<FormStepProps> = ({ stepId }) => {
  const {
    currentStep,
    moveToNextStep,
    moveToPreviousStep,
    canMoveNext,
    canMovePrevious,
    formState
  } = useForm();

  // Use provided stepId or fall back to currentStep from context
  const activeStepId = stepId || currentStep;

  // Type guard to check if a step exists in formState
  const stepExists = (stepId: FormStepId): boolean => {
    return Boolean(formState.steps[stepId]);
  };

  // Render specialized step components based on step ID
  const renderStepContent = () => {
    if (!stepExists(activeStepId)) {
      return <div>Invalid step ID</div>;
    }

    switch (activeStepId) {
      case 'personal-info':
        return <PersonalInfoStep />;
      case 'consents':
        return <ConsentsStep />;
      case 'residence-history':
        return <ResidenceHistoryStep />;
      case 'employment-history':
        return <EmploymentHistoryStep />;
      case 'signature':
        return <Signature />;
      default:
        return (
          <div>
            <h2>Step: {activeStepId}</h2>
            <p>This step is not yet implemented with a custom component.</p>
          </div>
        );
    }
  };

  return (
    <div>
      {renderStepContent()}
      
      <div>
        <button
          type="button"
          onClick={moveToPreviousStep}
          disabled={!canMovePrevious}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={moveToNextStep}
          disabled={!canMoveNext}
        >
          Next
        </button>
      </div>
    </div>
  );
};