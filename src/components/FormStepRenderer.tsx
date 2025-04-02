import React, { useEffect, useMemo, useCallback } from 'react';
import { FormStepId } from '../utils/FormConfigGenerator';
import PersonalInfoStep from './PersonalInfoStep';
import { ResidenceHistoryStep } from './ResidenceHistoryStep';
import { EmploymentHistoryStep } from './EmploymentHistoryStep';
import EducationStep from './EducationStep';
import ProfessionalLicensesStep from './ProfessionalLicensesStep';
import ConsentsStep from './ConsentsStep';
import Signature from './Signature';
import { useForm } from '../context/FormContext';

interface FormStepRendererProps {
  currentStep: FormStepId;
  consentsRequired: boolean;
}

export const FormStepRenderer: React.FC<FormStepRendererProps> = ({
  currentStep,
  consentsRequired,
}) => {
  const {
    formState,
    forceSetCurrentStep,
    currentStep: contextCurrentStep,
    moveToNextStep
  } = useForm();

  // Memoize the step order to prevent unnecessary re-renders
  const stepOrder = useMemo<FormStepId[]>(() => [
    'personal-info',
    'consents',
    'residence-history',
    'employment-history',
    'education',
    'professional-licenses',
    'signature',
  ], []);

  // Helper function to check if a step is enabled
  const isStepEnabled = useCallback((stepId: FormStepId) => {
    // First check if the step exists in formState
    if (!formState.steps[stepId]) {
      console.log(`FormStepRenderer - Step ${stepId} does not exist in formState`);
      return false;
    }
    
    // Then check if it's initialized
    const isInitialized = !!formState.steps[stepId]._initialized;
    console.log(`FormStepRenderer - Step ${stepId} initialized: ${isInitialized}`);
    return isInitialized;
  }, [formState.steps]);

  // Find the first enabled step
  const findFirstEnabledStep = useCallback(() => {
    return stepOrder.find(step => isStepEnabled(step)) || 'signature' as FormStepId;
  }, [isStepEnabled, stepOrder]);
  useEffect(() => {
    // Only set the step if it differs from the context's current step
    const isCurrentStepAvailable = stepOrder.includes(currentStep);
    const isCurrentStepEnabled = isStepEnabled(currentStep);
    const shouldUpdateStep = !isCurrentStepAvailable || !isCurrentStepEnabled || contextCurrentStep !== currentStep;
    
    if (shouldUpdateStep) {
      const firstAvailableStep = findFirstEnabledStep();
      const targetStep = (isCurrentStepAvailable && isCurrentStepEnabled) ? currentStep : firstAvailableStep;
      console.log('FormStepRenderer - Adjusting current step to:', targetStep);
      forceSetCurrentStep(targetStep);
    }
  }, [currentStep, contextCurrentStep, formState.steps, forceSetCurrentStep, stepOrder, isStepEnabled, findFirstEnabledStep]);

  // Add a new effect to log when the context's current step changes
  useEffect(() => {
    console.log('FormStepRenderer - Context current step changed to:', contextCurrentStep);
  }, [contextCurrentStep]);

  // If we're on the consents step but no consents are required, automatically move to the next step
  useEffect(() => {
    if (currentStep === 'consents' && !consentsRequired) {
      console.log('No consents required, moving to next step');
      moveToNextStep();
    }
  }, [currentStep, consentsRequired, moveToNextStep]);

  // Memoize the rendered component to prevent unnecessary re-renders
  const StepComponent = useMemo(() => {
    switch (currentStep) {
      case 'personal-info':
        return isStepEnabled('personal-info') ? <PersonalInfoStep /> : null;
      case 'residence-history': {
        const isResidenceEnabled = isStepEnabled('residence-history');
        if (isResidenceEnabled) {
          return <ResidenceHistoryStep />;
        } else {
          return null;
        }
      }
      case 'employment-history':
        return isStepEnabled('employment-history') ? <EmploymentHistoryStep /> : null;
      case 'education':
        return isStepEnabled('education') ? <EducationStep /> : null;
      case 'professional-licenses':
        return isStepEnabled('professional-licenses') ? <ProfessionalLicensesStep /> : null;
      case 'consents':
        // Only render the ConsentsStep if there are required consents and the step is enabled
        return isStepEnabled('consents') && consentsRequired ? <ConsentsStep /> : null;
      case 'signature':
        return isStepEnabled('signature') ? <Signature /> : null;
      default:
        return null;
    }
  }, [currentStep, consentsRequired, isStepEnabled]);

  return (
    <div className="form-step-renderer">
      {StepComponent}
    </div>
  );
};

export default FormStepRenderer;