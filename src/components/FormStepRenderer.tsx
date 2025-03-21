import React from 'react';
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
  consentsRequired
}) => {
  const { moveToNextStep, navigationState, formState } = useForm();
  const { availableSteps } = navigationState;

  // Skip steps that are not required based on the collection key
  React.useEffect(() => {
    // Log available steps and current step for debugging
    console.log('Available steps:', availableSteps);
    console.log('Current step:', currentStep);
    console.log('Consents required:', consentsRequired);
    
    // If the current step is not in the available steps, move to the next step
    if (!availableSteps.includes(currentStep)) {
      console.log('Current step not in available steps, finding next step...');
      
      // Find the next available step
      const currentStepIndex = availableSteps.indexOf(currentStep);
      console.log('Current step index:', currentStepIndex);
      
      if (currentStepIndex === -1) {
        // If the current step is not in the available steps at all,
        // find the first available step after the current step in the step order
        const stepOrder: FormStepId[] = [
          'personal-info',
          'consents',
          'residence-history',
          'employment-history',
          'education',
          'professional-licenses',
          'signature'
        ];
        
        const currentStepOrderIndex = stepOrder.indexOf(currentStep);
        console.log('Current step order index:', currentStepOrderIndex);
        
        // Find the first available step that comes after the current step in the order
        const nextAvailableStep = availableSteps.find(step =>
          stepOrder.indexOf(step) > currentStepOrderIndex
        );
        
        console.log('Next available step:', nextAvailableStep);
        
        if (nextAvailableStep) {
          console.log('Moving to next available step:', nextAvailableStep);
          moveToNextStep();
        }
      } else {
        // This shouldn't happen, but just in case
        console.log('Moving to next step in available steps');
        moveToNextStep();
      }
      return;
    }

    // Special case for consents step
    if (currentStep === 'consents' && !consentsRequired) {
      console.log('Consents step not required, moving to next step');
      moveToNextStep();
    }
    
    // Special case for education step when professional-licenses is not available
    if (currentStep === 'education' && !availableSteps.includes('professional-licenses')) {
      console.log('VERBOSE: Education step with professional-licenses not available');
      console.log('VERBOSE: Available steps:', availableSteps);
      console.log('VERBOSE: Current step:', currentStep);
      console.log('VERBOSE: Form state:', formState);
      console.log('VERBOSE: Navigation state:', navigationState);
      
      // We need to make sure we don't get stuck in an infinite loop
      // Only move to the next step if the education step is complete
      const educationStep = formState.steps.education;
      console.log('VERBOSE: Education step:', educationStep);
      
      if (educationStep) {
        console.log('VERBOSE: Education step values:', educationStep.values);
        console.log('VERBOSE: Education step isValid:', educationStep.isValid);
        console.log('VERBOSE: Education step isComplete:', educationStep.isComplete);
      }
      
      if (educationStep && educationStep.isComplete) {
        console.log('VERBOSE: Education step is complete, moving to next step (skipping professional-licenses)');
        // Find the next available step after education
        const stepOrder: FormStepId[] = [
          'personal-info',
          'consents',
          'residence-history',
          'employment-history',
          'education',
          'professional-licenses',
          'signature'
        ];
        
        const educationIndex = stepOrder.indexOf('education');
        console.log('VERBOSE: Education index in step order:', educationIndex);
        
        // Find the first available step that comes after education in the order
        const nextAvailableStep = availableSteps.find(step => {
          const stepIndex = stepOrder.indexOf(step);
          const isAfterEducation = stepIndex > educationIndex;
          const isNotProfessionalLicenses = step !== 'professional-licenses';
          console.log(`VERBOSE: Step ${step} - Index: ${stepIndex}, After Education: ${isAfterEducation}, Not Professional Licenses: ${isNotProfessionalLicenses}`);
          return isAfterEducation && isNotProfessionalLicenses;
        });
        
        console.log('VERBOSE: Next available step after education:', nextAvailableStep);
        
        if (nextAvailableStep) {
          console.log('VERBOSE: Moving to next available step:', nextAvailableStep);
          moveToNextStep();
        } else {
          console.log('VERBOSE: No next available step found after education');
        }
      } else {
        console.log('VERBOSE: Education step is not complete, not moving to next step');
      }
    }
  }, [currentStep, consentsRequired, availableSteps, moveToNextStep, formState]);

  // Log the current step for debugging
  console.log('VERBOSE: FormStepRenderer: Rendering step:', currentStep);
  console.log('VERBOSE: FormStepRenderer: Available steps:', availableSteps);
  console.log('VERBOSE: FormStepRenderer: Is professional-licenses in available steps?', availableSteps.includes('professional-licenses'));
  
  // Render the appropriate step component based on the current step
  switch (currentStep) {
    case 'personal-info':
      console.log('VERBOSE: FormStepRenderer: Rendering PersonalInfoStep');
      console.log('VERBOSE: FormStepRenderer: Next step should be:', availableSteps[availableSteps.indexOf('personal-info') + 1]);
      return <PersonalInfoStep />;
    case 'residence-history':
      console.log('VERBOSE: FormStepRenderer: Rendering ResidenceHistoryStep');
      console.log('VERBOSE: FormStepRenderer: Next step should be:', availableSteps[availableSteps.indexOf('residence-history') + 1]);
      return <ResidenceHistoryStep />;
    case 'employment-history':
      console.log('VERBOSE: FormStepRenderer: Rendering EmploymentHistoryStep');
      console.log('VERBOSE: FormStepRenderer: Next step should be:', availableSteps[availableSteps.indexOf('employment-history') + 1]);
      return <EmploymentHistoryStep />;
    case 'education':
      console.log('VERBOSE: FormStepRenderer: Rendering EducationStep');
      console.log('VERBOSE: FormStepRenderer: Next step should be:', availableSteps[availableSteps.indexOf('education') + 1]);
      console.log('VERBOSE: FormStepRenderer: Is professional-licenses the next step?', availableSteps[availableSteps.indexOf('education') + 1] === 'professional-licenses');
      return <EducationStep />;
    case 'professional-licenses':
      console.log('VERBOSE: FormStepRenderer: Rendering ProfessionalLicensesStep');
      console.log('VERBOSE: FormStepRenderer: Next step should be:', availableSteps[availableSteps.indexOf('professional-licenses') + 1]);
      return <ProfessionalLicensesStep />;
    case 'consents':
      console.log('VERBOSE: FormStepRenderer: Rendering ConsentsStep, required:', consentsRequired);
      console.log('VERBOSE: FormStepRenderer: Next step should be:', availableSteps[availableSteps.indexOf('consents') + 1]);
      // If no consents are required, this will briefly render before the useEffect moves to the next step
      return consentsRequired ? <ConsentsStep /> : null;
    case 'signature':
      console.log('VERBOSE: FormStepRenderer: Rendering Signature');
      console.log('VERBOSE: FormStepRenderer: This is the last step');
      return <Signature />;
    default:
      console.log('VERBOSE: FormStepRenderer: No matching step for:', currentStep);
      return null;
  }
};

export default FormStepRenderer;