import React from 'react';
import { useForm, FormStepId } from '../context/FormContext';
import { PersonalInfoStep } from './PersonalInfoStep';
import { ConsentsStep } from './ConsentsStep';
import { ResidenceHistoryStep } from './ResidenceHistoryStep';
import { EmploymentHistoryStep } from './EmploymentHistoryStep';
import { EducationStep } from './EducationStep';
import { ProfessionalLicensesStep } from './ProfessionalLicensesStep';
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
    forceSetCurrentStep,
    navigationState,
    formState
  } = useForm();

  // Use provided stepId or fall back to currentStep from context
  const activeStepId = stepId || currentStep;

  // Type guard to check if a step exists in formState
  const stepExists = (stepId: FormStepId): boolean => {
    return Boolean(formState.steps[stepId]);
  };

  // Handle navigation
  const handlePreviousStep = () => {
    const currentStepIndex = navigationState.availableSteps.indexOf(currentStep);
    if (currentStepIndex > 0) {
      const previousStep = navigationState.availableSteps[currentStepIndex - 1];
      forceSetCurrentStep(previousStep);
    }
  };

  const handleNextStep = () => {
    const currentStepIndex = navigationState.availableSteps.indexOf(currentStep);
    if (currentStepIndex < navigationState.availableSteps.length - 1) {
      const nextStep = navigationState.availableSteps[currentStepIndex + 1];
      forceSetCurrentStep(nextStep);
    }
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
      case 'education':
        return <EducationStep />;
      case 'professional-licenses':
        return <ProfessionalLicensesStep />;
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
          onClick={handlePreviousStep}
          disabled={navigationState.availableSteps.indexOf(currentStep) <= 0}
        >
          Previous
        </button>
        <button
          type="button"
          onClick={handleNextStep}
          disabled={navigationState.availableSteps.indexOf(currentStep) >= navigationState.availableSteps.length - 1}
        >
          Next
        </button>
      </div>
    </div>
  );
};