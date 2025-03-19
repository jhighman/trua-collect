import React, { createContext, useContext, useCallback, useMemo, useState } from 'react';
import { FormStateManager } from '../utils/FormStateManager';
import { FormConfigGenerator } from '../utils/FormConfigGenerator';
import type { 
  FormState, 
  FormStepId, 
  TimelineEntry,
  ValidationResult,
  NavigationState
} from '../utils/FormStateManager';
import type { Requirements } from '../utils/collectionKeyParser';

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
  setValue: (stepId: FormStepId, fieldId: string, value: any) => void;
  getValue: (stepId: FormStepId, fieldId: string) => any;
  getStepErrors: (stepId: FormStepId) => Record<string, string>;
  isStepValid: (stepId: FormStepId) => boolean;
  
  // Timeline entries
  addTimelineEntry: (stepId: FormStepId, entry: TimelineEntry) => void;
  updateTimelineEntry: (stepId: FormStepId, index: number, entry: TimelineEntry) => void;
  removeTimelineEntry: (stepId: FormStepId, index: number) => void;
  getTimelineEntries: (stepId: FormStepId) => TimelineEntry[];
  
  // Form submission
  isSubmitting: boolean;
  submitForm: () => Promise<void>;
  formErrors: Record<string, string>;
}

// Create Context
const FormContext = createContext<FormContextType | undefined>(undefined);

// Provider Props Interface
interface FormProviderProps {
  children: React.ReactNode;
  requirements: Requirements;
  onSubmit: (formData: FormState) => Promise<void>;
}

// Provider Component
export const FormProvider: React.FC<FormProviderProps> = ({ 
  children, 
  requirements,
  onSubmit 
}) => {
  // Initialize form manager with configuration
  const formManager = useMemo(() => {
    const config = FormConfigGenerator.generateFormConfig(requirements);
    return new FormStateManager(config);
  }, [requirements]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Get current form state
  const formState = useMemo(() => formManager.getState(), [formManager]);
  const navigationState = useMemo(() => formManager.getNavigationState(), [formManager]);

  // Navigation methods
  const moveToNextStep = useCallback(() => {
    if (!navigationState.canMoveNext) return;
    
    const nextStepId = navigationState.availableSteps[
      navigationState.availableSteps.indexOf(formState.currentStep) + 1
    ];
    formManager.moveToStep(nextStepId);
  }, [formState.currentStep, navigationState]);

  const moveToPreviousStep = useCallback(() => {
    if (!navigationState.canMovePrevious) return;
    
    const previousStepId = navigationState.availableSteps[
      navigationState.availableSteps.indexOf(formState.currentStep) - 1
    ];
    formManager.moveToStep(previousStepId);
  }, [formState.currentStep, navigationState]);

  const moveToStep = useCallback((stepId: FormStepId) => {
    try {
      formManager.moveToStep(stepId);
    } catch (error) {
      console.error('Navigation error:', error);
    }
  }, []);

  // Form value methods
  const setValue = useCallback((stepId: FormStepId, fieldId: string, value: any) => {
    formManager.setValue(stepId, fieldId, value);
  }, []);

  const getValue = useCallback((stepId: FormStepId, fieldId: string) => {
    const step = formManager.getState().steps[stepId];
    return step?.values[fieldId];
  }, []);

  const getStepErrors = useCallback((stepId: FormStepId) => {
    const step = formManager.getState().steps[stepId];
    return step?.errors || {};
  }, []);

  const isStepValid = useCallback((stepId: FormStepId) => {
    const step = formManager.getState().steps[stepId];
    return step?.isValid || false;
  }, []);

  // Timeline entry methods
  const addTimelineEntry = useCallback((stepId: FormStepId, entry: TimelineEntry) => {
    const currentEntries = formManager.getState().steps[stepId]?.values.entries || [];
    setValue(stepId, 'entries', [...currentEntries, entry]);
  }, [setValue]);

  const updateTimelineEntry = useCallback((
    stepId: FormStepId, 
    index: number, 
    entry: TimelineEntry
  ) => {
    const currentEntries = formManager.getState().steps[stepId]?.values.entries || [];
    const newEntries = [...currentEntries];
    newEntries[index] = entry;
    setValue(stepId, 'entries', newEntries);
  }, [setValue]);

  const removeTimelineEntry = useCallback((stepId: FormStepId, index: number) => {
    const currentEntries = formManager.getState().steps[stepId]?.values.entries || [];
    const newEntries = currentEntries.filter((_, i) => i !== index);
    setValue(stepId, 'entries', newEntries);
  }, [setValue]);

  const getTimelineEntries = useCallback((stepId: FormStepId): TimelineEntry[] => {
    return formManager.getState().steps[stepId]?.values.entries || [];
  }, []);

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
  }, [navigationState.availableSteps, isStepValid, onSubmit]);

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
  FormStepId,
  TimelineEntry,
  ValidationResult,
  NavigationState
}; 