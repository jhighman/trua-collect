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

// Provider Props Interface
interface FormProviderProps {
  children: React.ReactNode;
  requirements: Requirements;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (formData: any) => Promise<void>;
  initialStep?: FormStepId;
  onStepChange?: (step: FormStepId) => void;
}

// Provider Component
export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  requirements,
  onSubmit,
  initialStep,
  onStepChange
}) => {
  // Initialize form manager with configuration
  const formManager = useMemo(() => {
    const config: FormConfig = FormConfigGenerator.generateFormConfig(requirements);
    return new FormStateManager(config);
  }, [requirements]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Add state to track form state changes
  const [stateVersion, setStateVersion] = useState(0);

  // Get current form state - now depends on stateVersion to trigger re-renders
  // Note: stateVersion is needed here to trigger re-renders when state changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formState = useMemo(() => formManager.getState(), [formManager, stateVersion]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const navigationState = useMemo(() => formManager.getNavigationState(), [formManager, stateVersion]);

  // Use initialStep if provided
  useEffect(() => {
    if (initialStep) {
      try {
        formManager.moveToStep(initialStep);
        setStateVersion(v => v + 1);
      } catch (error) {
        console.error('Error setting initial step:', error);
      }
    }
  }, [formManager, initialStep]);

  // Navigation methods
  const moveToNextStep = useCallback(() => {
    if (!navigationState.canMoveNext) return;
    
    const nextStepId = navigationState.availableSteps[
      navigationState.availableSteps.indexOf(formState.currentStep) + 1
    ];
    formManager.moveToStep(nextStepId);
    setStateVersion(v => v + 1);
    
    // Notify parent component of step change
    if (onStepChange) {
      onStepChange(nextStepId);
    }
  }, [formState.currentStep, navigationState, onStepChange, formManager]);

  const moveToPreviousStep = useCallback(() => {
    if (!navigationState.canMovePrevious) return;
    
    const previousStepId = navigationState.availableSteps[
      navigationState.availableSteps.indexOf(formState.currentStep) - 1
    ];
    formManager.moveToStep(previousStepId);
    setStateVersion(v => v + 1);
    
    // Notify parent component of step change
    if (onStepChange) {
      onStepChange(previousStepId);
    }
  }, [formState.currentStep, navigationState, onStepChange, formManager]);

  const moveToStep = useCallback((stepId: FormStepId) => {
    try {
      formManager.moveToStep(stepId);
      setStateVersion(v => v + 1);
      
      // Notify parent component of step change
      if (onStepChange) {
        onStepChange(stepId);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, [onStepChange, formManager]);

  // Form value methods
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const setValue = useCallback((stepId: FormStepId, fieldId: string, value: any) => {
    formManager.setValue(stepId, fieldId, value);
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
    formState,
    navigationState,
    canMoveNext: navigationState.canMoveNext,
    canMovePrevious: navigationState.canMovePrevious,
    availableSteps: navigationState.availableSteps,
    completedSteps: navigationState.completedSteps,
    moveToNextStep,
    moveToPreviousStep,
    moveToStep,
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
    navigationState,
    moveToNextStep,
    moveToPreviousStep,
    moveToStep,
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