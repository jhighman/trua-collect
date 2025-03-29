import React, { useEffect, useMemo } from 'react';
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

  useEffect(() => {
    // Only set the step if it differs from the context's current step
    const isCurrentStepAvailable = stepOrder.includes(currentStep);
    const shouldUpdateStep = !isCurrentStepAvailable || contextCurrentStep !== currentStep;
    
    if (shouldUpdateStep) {
      const firstAvailableStep = stepOrder.find(step => formState.steps[step]) || 'personal-info' as FormStepId;
      const targetStep = isCurrentStepAvailable ? currentStep : firstAvailableStep;
      
      console.log('FormStepRenderer: Adjusting current step to:', targetStep);
      forceSetCurrentStep(targetStep);
    }
  }, [currentStep, contextCurrentStep, formState.steps, forceSetCurrentStep, stepOrder]);

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
        return <PersonalInfoStep />;
      case 'residence-history':
        return <ResidenceHistoryStep />;
      case 'employment-history':
        return <EmploymentHistoryStep />;
      case 'education':
        return <EducationStep />;
      case 'professional-licenses':
        return <ProfessionalLicensesStep />;
      case 'consents':
        // Only render the ConsentsStep if there are required consents
        return consentsRequired ? <ConsentsStep /> : null;
      case 'signature':
        return <Signature />;
      default:
        return null;
    }
  }, [currentStep, consentsRequired]);

  return StepComponent;
};

export default FormStepRenderer;