import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { FormStateManager } from '../utils/FormStateManager';
import { FormConfigGenerator, FormConfig, FormStepId } from '../utils/FormConfigGenerator';
import type {
  FormState,
  TimelineEntry,
  ValidationResult,
  NavigationState
} from '../utils/FormStateManager';
import type { Requirements } from '../utils/collectionKeyParser';
import { isCollegeOrHigher } from '../types/EducationLevel';

// Define the StepId type
export type StepId = 
  | 'personal-info'
  | 'residence-history'
  | 'employment-history'
  | 'education'
  | 'professional-licenses'
  | 'consents';

// Context Interface
export interface FormContextType {
  // Current state
  currentStep: FormStepId;
  currentContextStep: FormStepId | null; // Add currentContextStep to the interface
  formState: FormState;
  navigationState: NavigationState;
  
  // Form navigation
  canMoveNext: boolean;
  canMovePrevious: boolean;
  availableSteps: FormStepId[];
  completedSteps: FormStepId[];
  moveToNextStep: () => void;
  moveToPreviousStep: () => void;
  moveToStep: (stepId: FormStepId) => void;
  forceNextStep: () => void; // Force navigation to next step regardless of canMoveNext
  
  // Form values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: (stepId: FormStepId, fieldId: string, value: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getValue: (stepId: FormStepId, fieldId: string) => any;
  getStepErrors: (stepId: FormStepId) => Record<string, string>;
  isStepValid: (stepId: FormStepId) => boolean;
  
  // Timeline entries
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addTimelineEntry: (stepId: FormStepId, entry: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateTimelineEntry: (stepId: FormStepId, index: number, entry: any) => void;
  removeTimelineEntry: (stepId: FormStepId, index: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTimelineEntries: (stepId: FormStepId) => any[];
  
  // Form submission
  formErrors: Record<string, string>;
  submitForm: () => Promise<void>;
}

// Create Context
const FormContext = createContext<FormContextType | undefined>(undefined);

// Create a singleton FormStateManager instance
// We'll use let because we need to assign it once
// eslint-disable-next-line prefer-const
let formManagerInstance: FormStateManager | null = null;

// Provider Props Interface
interface FormProviderProps {
  children: React.ReactNode;
  requirements: Requirements;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (formData: any) => Promise<void>;
  initialStep?: FormStepId;
  isDefaultKey?: boolean; // Add isDefaultKey property
  onStepChange?: (step: FormStepId, formState: FormState) => void;
}

// Provider Component
export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  requirements,
  onSubmit,
  initialStep,
  isDefaultKey = true, // Default to true if not provided
  onStepChange
}) => {
  console.log('FormProvider: Rendering with initialStep:', initialStep, 'isDefaultKey:', isDefaultKey);
  // Initialize form manager with configuration
  const formManager = useMemo(() => {
    console.log('FormContext: Creating or updating FormStateManager with requirements:', requirements);
    console.log('FormContext: isDefaultKey:', isDefaultKey);
    
    // Create a new config with the current requirements and isDefaultKey
    const config: FormConfig = FormConfigGenerator.generateFormConfig(requirements, isDefaultKey);
    console.log('FormContext: Generated config with initialStep:', config.initialStep);
    
    // Only create a new instance if it doesn't exist
    if (!formManagerInstance) {
      console.log('FormContext: Creating new FormStateManager (singleton)');
      formManagerInstance = new FormStateManager(config);
    } else {
      console.log('FormContext: Updating existing FormStateManager with new config');
      // Update the existing instance with the new config
      formManagerInstance.updateConfig(config);
    }
    
    // Set the current step based on the config's initialStep if no initialStep is provided
    if (!initialStep) {
      console.log('FormContext: Setting currentStep from config:', config.initialStep);
      setCurrentContextStep(config.initialStep);
    }
    
    return formManagerInstance;
  }, [requirements]); // Recreate when requirements change

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Add state to track form state changes
  const [stateVersion, setStateVersion] = useState(0);

  // Track the current step separately from the form state
  const [currentContextStep, setCurrentContextStep] = useState<FormStepId | null>(null);
  
  // Get current form state - now depends on stateVersion to trigger re-renders
  // Note: stateVersion is needed here to trigger re-renders when state changes
  const formState = useMemo(() => {
    const state = formManager.getState();
    console.log('FormContext: Getting form state, currentStep:', state.currentStep);
    
    // If we have a current context step and it doesn't match the form state,
    // force the form state to use our step
    if (currentContextStep && currentContextStep !== state.currentStep) {
      console.log('FormContext: Detected step mismatch! Context:', currentContextStep, 'State:', state.currentStep);
      console.log('FormContext: Forcing state to use context step');
      
      // Force the state to use the correct step
      try {
        formManager.forceSetCurrentStep(currentContextStep);
        // Get the updated state
        const updatedState = formManager.getState();
        console.log('FormContext: After force set, currentStep:', updatedState.currentStep);
        return updatedState;
      } catch (error) {
        console.error('FormContext: Error forcing step:', error);
      }
    }
    
    // If we don't have a current context step yet, initialize it from the state
    if (!currentContextStep) {
      console.log('FormContext: Initializing context step from state:', state.currentStep);
      setCurrentContextStep(state.currentStep);
    }
    
    return state;
  }, [formManager, stateVersion, currentContextStep]);
  
  const navigationState = useMemo(() => {
    const navState = formManager.getNavigationState();
    console.log('FormContext: Getting navigation state, availableSteps:', navState.availableSteps);
    return navState;
  }, [formManager, stateVersion]);

  // Use initialStep if provided
  useEffect(() => {
    if (initialStep) {
      try {
        // Try to use moveToStep first
        try {
          formManager.moveToStep(initialStep);
        } catch (error) {
          // If moveToStep fails, force set the current step
          console.log('FormContext: moveToStep failed, using forceSetCurrentStep instead');
          formManager.forceSetCurrentStep(initialStep);
        }
        setStateVersion(v => v + 1);
      } catch (error) {
        console.error('Error setting initial step:', error);
      }
    }
  }, [formManager, initialStep]);

  // Navigation methods
  const moveToNextStep = useCallback(() => {
    try {
      console.log('FormContext: moveToNextStep called');
      console.log('FormContext: Current step:', formState.currentStep);
      console.log('FormContext: Can move next:', navigationState.canMoveNext);
      console.log('FormContext: Available steps:', navigationState.availableSteps);
      
      // Special case for education step
      if (formState.currentStep === 'education') {
        console.log('FormContext: Special handling for education step navigation');
        
        // Check if the education step is complete according to our own logic
        const educationStep = formState.steps.education;
        if (educationStep) {
          console.log('FormContext: Education step values:', educationStep.values);
          console.log('FormContext: Education step touched:', educationStep.touched);
          console.log('FormContext: Education step isValid:', educationStep.isValid);
          console.log('FormContext: Education step isComplete:', educationStep.isComplete);
          
          const highestLevel = educationStep.values.highestLevel;
          const entries = educationStep.values.entries || [];
          
          console.log('FormContext: Highest education level:', highestLevel);
          console.log('FormContext: Entries:', entries);
          
          if (highestLevel) {
            const collegeOrHigher = isCollegeOrHigher(highestLevel as string);
            console.log('FormContext: Is college or higher:', collegeOrHigher);
            
            const isEducationComplete = highestLevel &&
              (!collegeOrHigher || (collegeOrHigher && entries.length > 0));
            
            console.log('FormContext: Is education complete by our logic:', isEducationComplete);
            
            if (isEducationComplete) {
              // Force the step to be valid and complete
              console.log('FormContext: Forcing education step to be valid and complete');
              
              // Find the next available step
              const currentStepIndex = navigationState.availableSteps.indexOf(formState.currentStep);
              
              if (currentStepIndex !== -1 && currentStepIndex < navigationState.availableSteps.length - 1) {
                // Get the next step from available steps
                const nextStepId = navigationState.availableSteps[currentStepIndex + 1];
                console.log('FormContext: Next available step:', nextStepId);
                
                if (nextStepId) {
                  console.log('FormContext: Moving to next step:', nextStepId);
                  try {
                    // Update our context step first
                    setCurrentContextStep(nextStepId);
                    
                    // Try to move to the step
                    try {
                      formManager.moveToStep(nextStepId);
                    } catch (error) {
                      console.log('FormContext: moveToStep failed, using forceSetCurrentStep instead');
                      formManager.forceSetCurrentStep(nextStepId);
                    }
                    
                    setStateVersion(v => v + 1);
                    
                    // Notify parent component of step change
                    if (onStepChange) {
                      onStepChange(nextStepId, formManager.getState());
                    }
                    
                    return;
                  } catch (error) {
                    console.error('FormContext: Error moving to next step:', error);
                  }
                }
              } else {
                console.log('FormContext: Current step not in available steps or already at last step');
              }
            }
          }
        }
      }
      
      // Standard navigation logic
      if (!navigationState.canMoveNext) {
        console.log('FormContext: Cannot move next, returning');
        return;
      }
      
      // Find the current step index in the available steps
      const currentStepIndex = navigationState.availableSteps.indexOf(formState.currentStep);
      console.log('FormContext: Current step index:', currentStepIndex);
      
      // If the current step is not in the available steps, we need to find the next available step
      if (currentStepIndex === -1) {
        console.log('FormContext: Current step not in available steps');
        
        // Define the step order
        const stepOrder: FormStepId[] = [
          'personal-info',
          'consents',
          'residence-history',
          'employment-history',
          'education',
          'professional-licenses',
          'signature'
        ];
        
        // Find the current step's position in the step order
        const currentStepOrderIndex = stepOrder.indexOf(formState.currentStep);
        console.log('FormContext: Current step order index:', currentStepOrderIndex);
        
        // Find the first available step that comes after the current step in the order
        const nextStepId = navigationState.availableSteps.find(step =>
          stepOrder.indexOf(step) > currentStepOrderIndex
        );
        
        console.log('FormContext: Next step ID:', nextStepId);
        
        if (nextStepId) {
          console.log('FormContext: Moving to next step:', nextStepId);
          try {
            // Update our context step first
            setCurrentContextStep(nextStepId);
            
            // Try to move to the step
            try {
              formManager.moveToStep(nextStepId);
            } catch (error) {
              console.log('FormContext: moveToStep failed, using forceSetCurrentStep instead');
              formManager.forceSetCurrentStep(nextStepId);
            }
            
            setStateVersion(v => v + 1);
            
            // Notify parent component of step change
            if (onStepChange) {
              onStepChange(nextStepId, formManager.getState());
            }
          } catch (error) {
            console.error('FormContext: Error moving to next step:', error);
          }
        } else {
          console.error('FormContext: No next step found after', formState.currentStep);
        }
      } else {
        // Normal case: current step is in available steps
        let nextStepId = navigationState.availableSteps[currentStepIndex + 1];
        console.log('FormContext: Next step ID (normal case):', nextStepId);
        
        // Only initialize professional-licenses if it's the next step and it's in the available steps
        if (formState.currentStep === 'education' && nextStepId === 'professional-licenses') {
          console.log('VERBOSE: FormContext: Navigating from education to professional-licenses');
          console.log('VERBOSE: FormContext: Current step:', formState.currentStep);
          console.log('VERBOSE: FormContext: Next step ID:', nextStepId);
          console.log('VERBOSE: FormContext: Available steps:', navigationState.availableSteps);
          
          // Check if professional-licenses is in the available steps
          const isProfessionalLicensesAvailable = navigationState.availableSteps.includes('professional-licenses');
          console.log('VERBOSE: FormContext: Is professional-licenses in available steps?', isProfessionalLicensesAvailable);
          
          if (isProfessionalLicensesAvailable) {
            // Initialize the professional-licenses step if needed
            const hasProfessionalLicensesStep = !!formState.steps['professional-licenses'];
            console.log('VERBOSE: FormContext: Does form state have professional-licenses step?', hasProfessionalLicensesStep);
            
            if (!hasProfessionalLicensesStep) {
              console.log('VERBOSE: FormContext: Initializing professional-licenses step');
              formManager.setValue('professional-licenses', 'entries', []);
              formManager.setValue('professional-licenses', '_initialized', true);
            }
          } else {
            console.log('VERBOSE: FormContext: professional-licenses step is not in available steps, skipping initialization');
            
            // Find the next available step after education that is not professional-licenses
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
            console.log('VERBOSE: FormContext: Education index in step order:', educationIndex);
            
            // Find the first available step that comes after education in the order
            const nextAvailableStep = navigationState.availableSteps.find(step => {
              const stepIndex = stepOrder.indexOf(step);
              const isAfterEducation = stepIndex > educationIndex;
              const isNotProfessionalLicenses = step !== 'professional-licenses';
              console.log(`VERBOSE: FormContext: Step ${step} - Index: ${stepIndex}, After Education: ${isAfterEducation}, Not Professional Licenses: ${isNotProfessionalLicenses}`);
              return isAfterEducation && isNotProfessionalLicenses;
            });
            
            console.log('VERBOSE: FormContext: Next available step after education:', nextAvailableStep);
            
            if (nextAvailableStep && nextAvailableStep !== nextStepId) {
              console.log('VERBOSE: FormContext: Overriding next step ID from', nextStepId, 'to', nextAvailableStep);
              nextStepId = nextAvailableStep;
            }
          }
        }
        
        try {
          console.log('FormContext: Attempting to move to step:', nextStepId);
          
          // Update our context step first
          setCurrentContextStep(nextStepId);
          
          // Try to move to the step
          try {
            formManager.moveToStep(nextStepId);
          } catch (error) {
            console.log('FormContext: moveToStep failed, using forceSetCurrentStep instead');
            formManager.forceSetCurrentStep(nextStepId);
          }
          
          // Force a state update by incrementing the version
          setStateVersion(v => v + 1);
          
          // Get the updated state after navigation
          const updatedState = formManager.getState();
          console.log('FormContext: State after navigation:', updatedState);
          console.log('FormContext: Current step after navigation (from state):', updatedState.currentStep);
          
          // Notify parent component of step change
          if (onStepChange) {
            onStepChange(nextStepId, updatedState);
          }
        } catch (error) {
          console.error('FormContext: Error moving to next step:', error);
        }
      }
    } catch (error) {
      console.error('FormContext: Unexpected error in moveToNextStep:', error);
    }
  }, [formState, navigationState, onStepChange, formManager]);
  
  // Force next step - ignores canMoveNext check
  const forceNextStep = useCallback(() => {
    try {
      console.log('Forcing navigation to next step');
      
      // Find the current step index in the available steps
      const currentStepIndex = navigationState.availableSteps.indexOf(formState.currentStep);
      
      // Define the step order
      const stepOrder: FormStepId[] = [
        'personal-info',
        'consents',
        'residence-history',
        'employment-history',
        'education',
        'professional-licenses',
        'signature'
      ];
      
      // If the current step is not in the available steps, we need to find the next available step
      if (currentStepIndex === -1) {
        console.log('Current step not in available steps:', formState.currentStep);
        console.log('Available steps:', navigationState.availableSteps);
        
        // Find the current step's position in the step order
        const currentStepOrderIndex = stepOrder.indexOf(formState.currentStep);
        
        // Find the first available step that comes after the current step in the order
        const nextStepId = navigationState.availableSteps.find(step =>
          stepOrder.indexOf(step) > currentStepOrderIndex
        );
        
        if (nextStepId) {
          formManager.moveToStep(nextStepId);
          setStateVersion(v => v + 1);
          
          // Notify parent component of step change
          if (onStepChange) {
            onStepChange(nextStepId, formManager.getState());
          }
        } else {
          console.error('No next step found after', formState.currentStep);
        }
      } else {
        // Normal case: current step is in available steps
        const nextStepId = navigationState.availableSteps[currentStepIndex + 1];
        
        if (nextStepId) {
          formManager.moveToStep(nextStepId);
          setStateVersion(v => v + 1);
          
          // Notify parent component of step change
          if (onStepChange) {
            onStepChange(nextStepId, formManager.getState());
          }
        } else {
          console.log('Already at the last step');
        }
      }
    } catch (error) {
      console.error('FormContext: Error in forceNextStep:', error);
    }
  }, [formState.currentStep, navigationState, onStepChange, formManager]);

  const moveToPreviousStep = useCallback(() => {
    try {
      if (!navigationState.canMovePrevious) return;
      
      // Find the current step index in the available steps
      const currentStepIndex = navigationState.availableSteps.indexOf(formState.currentStep);
      
      // If the current step is not in the available steps, we need to find the previous available step
      if (currentStepIndex === -1) {
        console.log('Current step not in available steps:', formState.currentStep);
        console.log('Available steps:', navigationState.availableSteps);
        
        // Define the step order
        const stepOrder: FormStepId[] = [
          'personal-info',
          'consents',
          'residence-history',
          'employment-history',
          'education',
          'professional-licenses',
          'signature'
        ];
        
        // Find the current step's position in the step order
        const currentStepOrderIndex = stepOrder.indexOf(formState.currentStep);
        
        // Find the first available step that comes before the current step in the order
        const previousStepId = [...navigationState.availableSteps]
          .reverse()
          .find(step => stepOrder.indexOf(step) < currentStepOrderIndex);
        
        if (previousStepId) {
          formManager.moveToStep(previousStepId);
          setStateVersion(v => v + 1);
          
          // Notify parent component of step change
          if (onStepChange) {
            onStepChange(previousStepId, formManager.getState());
          }
        } else {
          console.error('No previous step found before', formState.currentStep);
        }
      } else {
        // Normal case: current step is in available steps
        const previousStepId = navigationState.availableSteps[currentStepIndex - 1];
        formManager.moveToStep(previousStepId);
        setStateVersion(v => v + 1);
        
        // Notify parent component of step change
        if (onStepChange) {
          onStepChange(previousStepId, formManager.getState());
        }
      }
    } catch (error) {
      console.error('FormContext: Error in moveToPreviousStep:', error);
    }
  }, [formState.currentStep, navigationState, onStepChange, formManager]);

  const moveToStep = useCallback((stepId: FormStepId) => {
    try {
      console.log('FormContext: moveToStep called with stepId:', stepId);
      console.log('FormContext: Current step before move:', formState.currentStep);
      
      // Update our context step first
      setCurrentContextStep(stepId);
      
      // Try to move to the step
      try {
        formManager.moveToStep(stepId);
      } catch (error) {
        console.log('FormContext: moveToStep failed, using forceSetCurrentStep instead');
        formManager.forceSetCurrentStep(stepId);
      }
      
      // Force a state update by incrementing the version
      setStateVersion(v => v + 1);
      
      // Get the updated state after navigation
      const updatedState = formManager.getState();
      console.log('FormContext: State after moveToStep:', updatedState);
      console.log('FormContext: Current step after moveToStep (from state):', updatedState.currentStep);
      
      // Notify parent component of step change
      if (onStepChange) {
        onStepChange(stepId, updatedState);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [onStepChange, formManager, formState.currentStep]);

  // Form value methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setValue = useCallback((stepId: FormStepId, fieldId: string, value: any) => {
    console.log(`FormContext: Setting value for ${stepId}.${fieldId}:`, value);
    
    // Special case for education step
    if (stepId === 'education') {
      console.log('FormContext: Special handling for education step');
      console.log('FormContext: Current form state:', formManager.getState());
      
      // Get the current step state
      const currentState = formManager.getState();
      const educationStep = currentState.steps.education;
      
      if (educationStep) {
        console.log('FormContext: Current education step values:', educationStep.values);
        console.log('FormContext: Current education step touched:', educationStep.touched);
      } else {
        console.log('FormContext: Education step not found in form state');
      }
    }
    
    formManager.setValue(stepId, fieldId, value);
    
    // Special case for education step - verify the value was set
    if (stepId === 'education') {
      // Get the updated state
      const updatedState = formManager.getState();
      const educationStep = updatedState.steps.education;
      
      if (educationStep) {
        console.log('FormContext: Updated education step values:', educationStep.values);
        console.log('FormContext: Updated education step touched:', educationStep.touched);
        console.log('FormContext: Field was set:', fieldId in educationStep.values);
        console.log('FormContext: Field value:', educationStep.values[fieldId]);
      } else {
        console.log('FormContext: Education step not found in updated form state');
      }
    }
    
    // Increment state version to trigger re-renders
    setStateVersion(v => v + 1);
  }, [formManager]);

  const getValue = useCallback((stepId: FormStepId, fieldId: string) => {
    const step = formManager.getState().steps[stepId];
    return step?.values[fieldId];
  }, [formManager]);

  const getStepErrors = useCallback((stepId: FormStepId) => {
    const step = formManager.getState().steps[stepId];
    return step?.errors || {};
  }, [formManager]);

  const isStepValid = useCallback((stepId: FormStepId) => {
    const step = formManager.getState().steps[stepId];
    return step?.isValid || false;
  }, [formManager]);

  // Timeline entry methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addTimelineEntry = useCallback((stepId: FormStepId, entry: any) => {
    const currentEntries = formManager.getState().steps[stepId]?.values.entries || [];
    setValue(stepId, 'entries', [...currentEntries, entry]);
  }, [setValue, formManager]);

  const updateTimelineEntry = useCallback((
    stepId: FormStepId,
    index: number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entry: any
  ) => {
    const currentEntries = formManager.getState().steps[stepId]?.values.entries || [];
    const newEntries = [...currentEntries];
    newEntries[index] = entry;
    setValue(stepId, 'entries', newEntries);
  }, [setValue, formManager]);

  const removeTimelineEntry = useCallback((stepId: FormStepId, index: number) => {
    const currentEntries = formManager.getState().steps[stepId]?.values.entries || [];
    const newEntries = currentEntries.filter((_: unknown, i: number) => i !== index);
    setValue(stepId, 'entries', newEntries);
  }, [setValue, formManager]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTimelineEntries = useCallback((stepId: FormStepId): any[] => {
    return formManager.getState().steps[stepId]?.values.entries || [];
  }, [formManager]);

  // Form submission
  const submitForm = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setFormErrors({});
      
      // Validate all steps before submission
      const allStepsValid = navigationState.availableSteps.every(
        stepId => isStepValid(stepId)
      );

      if (!allStepsValid) {
        throw new Error('Please complete all required fields');
      }

      await onSubmit(formManager.getState());
    } catch (error) {
      setFormErrors({
        submit: error instanceof Error ? error.message : 'An error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [navigationState.availableSteps, isStepValid, onSubmit, formManager]);

  const contextValue = useMemo(() => ({
    currentStep: formState.currentStep,
    currentContextStep, // Add currentContextStep to the context
    formState,
    navigationState,
    canMoveNext: navigationState.canMoveNext,
    canMovePrevious: navigationState.canMovePrevious,
    availableSteps: navigationState.availableSteps,
    completedSteps: navigationState.completedSteps,
    moveToNextStep,
    moveToPreviousStep,
    moveToStep,
    forceNextStep,
    setValue,
    getValue,
    getStepErrors,
    isStepValid,
    addTimelineEntry,
    updateTimelineEntry,
    removeTimelineEntry,
    getTimelineEntries,
    isSubmitting,
    submitForm,
    formErrors
  }), [
    formState,
    currentContextStep, // Add currentContextStep to the dependency array
    navigationState,
    moveToNextStep,
    moveToPreviousStep,
    moveToStep,
    forceNextStep,
    setValue,
    getValue,
    getStepErrors,
    isStepValid,
    addTimelineEntry,
    updateTimelineEntry,
    removeTimelineEntry,
    getTimelineEntries,
    isSubmitting,
    submitForm,
    formErrors
  ]);

  return (
    <FormContext.Provider value={contextValue}>
      {children}
    </FormContext.Provider>
  );
};

// Custom hook for using the form context
export const useForm = () => {
  const context = useContext(FormContext);
  if (context === undefined) {
    throw new Error('useForm must be used within a FormProvider');
  }
  return context;
};

// Export types
export type { 
  FormState,
  TimelineEntry,
  ValidationResult,
  NavigationState
};

export type { FormStepId };