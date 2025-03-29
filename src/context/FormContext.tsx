/* eslint-disable no-console */
import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { FormStateManager } from '../utils/FormStateManager';
import { FormConfigGenerator, FormConfig, FormStepId } from '../utils/FormConfigGenerator';
import type {
  FormState,
  TimelineEntry,
  ValidationResult,
  NavigationState,
} from '../utils/FormStateManager';
import type { Requirements } from '../utils/collectionKeyParser';
import { isCollegeOrHigher } from '../types/EducationLevel';
import { getConfig } from '../utils/EnvironmentConfig';

// Define StepId type explicitly for clarity
export type StepId =
  | 'personal-info'
  | 'residence-history'
  | 'employment-history'
  | 'education'
  | 'professional-licenses'
  | 'consents'
  | 'signature';

// Define FormValue type to cover all possible form field values
type FormValue = string | number | boolean | TimelineEntry[] | Record<string, unknown> | undefined;
// Use the exact TimelineEntry type from FormStateManager instead of a generic substitute
export interface TimelineEntryType extends TimelineEntry {
  startDate: string;
  endDate: string | null;
  isCurrent: boolean; // Remove optional to match TimelineEntry interface
  [key: string]: FormValue | null; // Allow additional dynamic properties
}

// Context Interface with all methods and properties
export interface FormContextType {
  currentStep: FormStepId;
  currentContextStep: FormStepId | null;
  formState: FormState;
  navigationState: NavigationState;
  canMoveNext: boolean;
  canMovePrevious: boolean;
  availableSteps: FormStepId[];
  completedSteps: FormStepId[];
  moveToNextStep: () => void;
  moveToPreviousStep: () => void;
  moveToStep: (stepId: FormStepId) => void;
  forceNextStep: () => void;
  setValue: (stepId: FormStepId, fieldId: string, value: FormValue) => void;
  getValue: (stepId: FormStepId, fieldId: string) => FormValue;
  getStepErrors: (stepId: FormStepId) => Record<string, string>;
  isStepValid: (stepId: FormStepId) => boolean;
  addTimelineEntry: (stepId: FormStepId, entry: TimelineEntryType) => void;
  updateTimelineEntry: (stepId: FormStepId, index: number, entry: TimelineEntryType) => void;
  removeTimelineEntry: (stepId: FormStepId, index: number) => void;
  getTimelineEntries: (stepId: FormStepId) => TimelineEntryType[];
  formErrors: Record<string, string>;
  submitForm: () => Promise<void>;
  isSubmitting: boolean;
}

// Create Context
const FormContext = createContext<FormContextType | undefined>(undefined);

// Singleton FormStateManager instance
let formManagerInstance: FormStateManager | null = null;

// Provider Props Interface
interface FormProviderProps {
  children: React.ReactNode;
  requirements: Requirements;
  onSubmit: (formData: FormState) => Promise<void>;
  initialStep?: FormStepId;
  isDefaultKey?: boolean;
  onStepChange?: (step: FormStepId, formState: FormState) => void;
  collectionKey?: string;
}

// FormProvider Component
export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  requirements,
  onSubmit,
  initialStep,
  isDefaultKey = true,
  onStepChange,
  collectionKey,
}) => {
  console.log('FormProvider: Initializing with props:');
  console.log('FormProvider: initialStep:', initialStep);
  console.log('FormProvider: isDefaultKey:', isDefaultKey);
  console.log('FormProvider: collectionKey:', collectionKey);
  console.log('FormProvider: Requirements:', JSON.stringify(requirements, null, 2));

  // State declarations
  const [currentContextStep, setCurrentContextStep] = useState<FormStepId | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [, setStateVersion] = useState(0);

  // FormManager initialization with detailed logging
  const formManager = useMemo(() => {
    console.log('FormContext: Initializing or updating FormStateManager');
    console.log('FormContext: Requirements:', JSON.stringify(requirements, null, 2));
    console.log('FormContext: isDefaultKey:', isDefaultKey);
    console.log('FormContext: collectionKey:', collectionKey);

    const effectiveCollectionKey = collectionKey || (isDefaultKey ? getConfig().defaultCollectionKey : 'default-key');
    console.log('FormContext: Using effective collection key:', effectiveCollectionKey);

    // Get config with validation
    const config = FormConfigGenerator.generateFormConfig(effectiveCollectionKey);
    
    // Config is guaranteed to have initialStep due to DEFAULT_CONFIG fallback
    console.log('FormContext: Generated config with initial step:', config.initialStep);

    if (!formManagerInstance) {
      console.log('FormContext: Creating new FormStateManager instance');
      formManagerInstance = new FormStateManager(config);
    } else {
      console.log('FormContext: Updating existing FormStateManager with new config');
      formManagerInstance.updateConfig(config);
    }

    if (!currentContextStep) {
      console.log('FormContext: Setting initial currentContextStep from config:', config.initialStep);
      setCurrentContextStep(config.initialStep);
    }

    console.log('FormContext: FormManager initialized');
    return formManagerInstance;
  }, [requirements, isDefaultKey, collectionKey, currentContextStep]);

  // Form state computation
  const formState = useMemo(() => {
    console.log('FormContext: Computing formState');
    const state = formManager.getState();
    console.log('FormContext: Current step from state:', state.currentStep);
    console.log('FormContext: Form state steps:', Object.keys(state.steps));

    if (!currentContextStep) {
      console.log('FormContext: Setting currentContextStep from state (initial):', state.currentStep);
      setCurrentContextStep(state.currentStep);
    }

    return state;
  }, [formManager, currentContextStep]);

  // Navigation state computation
  const navigationState = useMemo(() => {
    console.log('FormContext: Computing navigationState');
    const navState = formManager.getNavigationState();
    console.log('FormContext: Navigation state - canMoveNext:', navState.canMoveNext);
    console.log('FormContext: Navigation state - canMovePrevious:', navState.canMovePrevious);
    console.log('FormContext: Navigation state - availableSteps:', navState.availableSteps);
    console.log('FormContext: Navigation state - completedSteps:', navState.completedSteps);
    return navState;
  }, [formManager]);

  // Handle initial step setup
  useEffect(() => {
    if (initialStep && initialStep !== formState.currentStep) {
      console.log('FormContext: Applying initialStep:', initialStep);
      console.log('FormContext: Current step before move:', formState.currentStep);
      try {
        formManager.moveToStep(initialStep);
        console.log('FormContext: Successfully moved to initial step:', initialStep);
      } catch (error) {
        console.log('FormContext: moveToStep failed, forcing step:', initialStep);
        formManager.forceSetCurrentStep(initialStep);
      }
      setCurrentContextStep(initialStep);
      setStateVersion(v => v + 1);
      console.log('FormContext: State version updated after initial step set');
    }
  }, [initialStep, formManager, formState.currentStep]);

  // Navigation: Move to Next Step
  const moveToNextStep = useCallback(() => {
    console.log('FormContext: moveToNextStep invoked');
    console.log('FormContext: Current step:', formState.currentStep);
    console.log('FormContext: Can move next:', navigationState.canMoveNext);
    console.log('FormContext: Available steps:', navigationState.availableSteps);

    if (!navigationState.canMoveNext) {
      console.log('FormContext: Navigation blocked - cannot move next');
      return;
    }

    const currentStep = formState.currentStep;
    const currentIndex = navigationState.availableSteps.indexOf(currentStep);
    console.log('FormContext: Current step index:', currentIndex);

    if (currentStep === 'education') {
      console.log('FormContext: Handling education step navigation');
      const educationStep = formState.steps.education;
      if (educationStep) {
        console.log('FormContext: Education step values:', educationStep.values);
        console.log('FormContext: Education step touched:', educationStep.touched);
        console.log('FormContext: Education step isValid:', educationStep.isValid);
        console.log('FormContext: Education step isComplete:', educationStep.isComplete);

        const highestLevel = educationStep.values.highestLevel as string | undefined;
        const entries = (educationStep.values.entries as TimelineEntryType[]) || [];
        console.log('FormContext: Highest education level:', highestLevel);
        console.log('FormContext: Education entries:', entries);

        if (highestLevel) {
          const collegeOrHigher = isCollegeOrHigher(highestLevel);
          console.log('FormContext: College or higher education:', collegeOrHigher);

          const isEducationComplete = collegeOrHigher ? entries.length > 0 : true;
          console.log('FormContext: Is education complete:', isEducationComplete);

          if (isEducationComplete && currentIndex !== -1 && currentIndex < navigationState.availableSteps.length - 1) {
            const nextStepId = navigationState.availableSteps[currentIndex + 1];
            console.log('FormContext: Next step for education:', nextStepId);

            setCurrentContextStep(nextStepId);
            try {
              formManager.moveToStep(nextStepId);
              console.log('FormContext: Moved to next step:', nextStepId);
            } catch (error) {
              console.log('FormContext: moveToStep failed, forcing:', nextStepId);
              formManager.forceSetCurrentStep(nextStepId);
            }
            setStateVersion(v => v + 1);
            if (onStepChange) {
              console.log('FormContext: Triggering onStepChange for:', nextStepId);
              onStepChange(nextStepId, formManager.getState());
            }
            return;
          }
        }
      }
    }

    if (currentIndex === -1) {
      console.log('FormContext: Current step not found in available steps');
      const stepOrder: FormStepId[] = [
        'personal-info',
        'consents',
        'residence-history',
        'employment-history',
        'education',
        'professional-licenses',
        'signature',
      ];
      const currentOrderIndex = stepOrder.indexOf(currentStep);
      console.log('FormContext: Current step order index:', currentOrderIndex);

      const nextStepId = navigationState.availableSteps.find(step => stepOrder.indexOf(step) > currentOrderIndex);
      console.log('FormContext: Fallback next step:', nextStepId);

      if (nextStepId) {
        setCurrentContextStep(nextStepId);
        try {
          formManager.moveToStep(nextStepId);
          console.log('FormContext: Moved to fallback step:', nextStepId);
        } catch (error) {
          console.log('FormContext: moveToStep failed, forcing:', nextStepId);
          formManager.forceSetCurrentStep(nextStepId);
        }
        setStateVersion(v => v + 1);
        if (onStepChange) {
          console.log('FormContext: Triggering onStepChange for:', nextStepId);
          onStepChange(nextStepId, formManager.getState());
        }
      }
    } else {
      const nextStepId = navigationState.availableSteps[currentIndex + 1];
      console.log('FormContext: Standard next step:', nextStepId);

      if (currentStep === 'education' && nextStepId === 'professional-licenses') {
        console.log('VERBOSE: Transitioning from education to professional-licenses');
        console.log('VERBOSE: Current step:', currentStep);
        console.log('VERBOSE: Next step:', nextStepId);

        const hasLicensesStep = !!formState.steps['professional-licenses'];
        console.log('VERBOSE: Professional licenses step exists:', hasLicensesStep);

        if (!hasLicensesStep) {
          console.log('VERBOSE: Initializing professional-licenses step');
          formManager.setValue('professional-licenses', 'entries', []);
          formManager.setValue('professional-licenses', '_initialized', true);
        }
      }

      setCurrentContextStep(nextStepId);
      try {
        formManager.moveToStep(nextStepId);
        console.log('FormContext: Successfully moved to:', nextStepId);
      } catch (error) {
        console.log('FormContext: moveToStep failed, forcing:', nextStepId);
        formManager.forceSetCurrentStep(nextStepId);
      }
      setStateVersion(v => v + 1);
      if (onStepChange) {
        console.log('FormContext: Triggering onStepChange for:', nextStepId);
        onStepChange(nextStepId, formManager.getState());
      }
    }
  }, [formState, navigationState, onStepChange, formManager]);

  // Navigation: Move to Previous Step
  const moveToPreviousStep = useCallback(() => {
    console.log('FormContext: moveToPreviousStep invoked');
    console.log('FormContext: Current step:', formState.currentStep);
    console.log('FormContext: Can move previous:', navigationState.canMovePrevious);

    if (!navigationState.canMovePrevious) {
      console.log('FormContext: Navigation blocked - cannot move previous');
      return;
    }

    const currentIndex = navigationState.availableSteps.indexOf(formState.currentStep);
    console.log('FormContext: Current step index:', currentIndex);

    if (currentIndex === -1) {
      console.log('FormContext: Current step not in available steps');
      const stepOrder: FormStepId[] = [
        'personal-info',
        'consents',
        'residence-history',
        'employment-history',
        'education',
        'professional-licenses',
        'signature',
      ];
      const currentOrderIndex = stepOrder.indexOf(formState.currentStep);
      console.log('FormContext: Current step order index:', currentOrderIndex);

      const prevStepId = [...navigationState.availableSteps]
        .reverse()
        .find(step => stepOrder.indexOf(step) < currentOrderIndex);
      console.log('FormContext: Previous step:', prevStepId);

      if (prevStepId) {
        setCurrentContextStep(prevStepId);
        formManager.moveToStep(prevStepId);
        setStateVersion(v => v + 1);
        if (onStepChange) {
          console.log('FormContext: Triggering onStepChange for:', prevStepId);
          onStepChange(prevStepId, formManager.getState());
        }
      }
    } else {
      const prevStepId = navigationState.availableSteps[currentIndex - 1];
      console.log('FormContext: Previous step:', prevStepId);

      setCurrentContextStep(prevStepId);
      formManager.moveToStep(prevStepId);
      setStateVersion(v => v + 1);
      if (onStepChange) {
        console.log('FormContext: Triggering onStepChange for:', prevStepId);
        onStepChange(prevStepId, formManager.getState());
      }
    }
  }, [formState, navigationState, onStepChange, formManager]);

  // Navigation: Move to Specific Step
  const moveToStep = useCallback(
    (stepId: FormStepId) => {
      console.log('FormContext: moveToStep invoked with:', stepId);
      console.log('FormContext: Current step before move:', formState.currentStep);

      setCurrentContextStep(stepId);
      try {
        formManager.moveToStep(stepId);
        console.log('FormContext: Successfully moved to:', stepId);
      } catch (error) {
        console.log('FormContext: moveToStep failed, forcing:', stepId);
        formManager.forceSetCurrentStep(stepId);
      }
      setStateVersion(v => v + 1);
      if (onStepChange) {
        console.log('FormContext: Triggering onStepChange for:', stepId);
        onStepChange(stepId, formManager.getState());
      }
    },
    [formState, onStepChange, formManager]
  );

  // Navigation: Force Next Step
  const forceNextStep = useCallback(() => {
    console.log('FormContext: forceNextStep invoked');
    console.log('FormContext: Current step:', formState.currentStep);

    const currentIndex = navigationState.availableSteps.indexOf(formState.currentStep);
    console.log('FormContext: Current step index:', currentIndex);

    if (currentIndex === -1) {
      console.log('FormContext: Current step not in available steps');
      const stepOrder: FormStepId[] = [
        'personal-info',
        'consents',
        'residence-history',
        'employment-history',
        'education',
        'professional-licenses',
        'signature',
      ];
      const currentOrderIndex = stepOrder.indexOf(formState.currentStep);
      console.log('FormContext: Current step order index:', currentOrderIndex);

      const nextStepId = navigationState.availableSteps.find(step => stepOrder.indexOf(step) > currentOrderIndex);
      console.log('FormContext: Forced next step:', nextStepId);

      if (nextStepId) {
        setCurrentContextStep(nextStepId);
        formManager.moveToStep(nextStepId);
        setStateVersion(v => v + 1);
        if (onStepChange) {
          console.log('FormContext: Triggering onStepChange for:', nextStepId);
          onStepChange(nextStepId, formManager.getState());
        }
      }
    } else {
      const nextStepId = navigationState.availableSteps[currentIndex + 1];
      console.log('FormContext: Forced next step:', nextStepId);

      if (nextStepId) {
        setCurrentContextStep(nextStepId);
        formManager.moveToStep(nextStepId);
        setStateVersion(v => v + 1);
        if (onStepChange) {
          console.log('FormContext: Triggering onStepChange for:', nextStepId);
          onStepChange(nextStepId, formManager.getState());
        }
      }
    }
  }, [formState, navigationState, onStepChange, formManager]);

  // Form Value Management
  const setValue = useCallback(
    (stepId: FormStepId, fieldId: string, value: FormValue) => {
      console.log('FormContext: setValue invoked');
      console.log('FormContext: Step:', stepId);
      console.log('FormContext: Field:', fieldId);
      console.log('FormContext: Value:', value);

      formManager.setValue(stepId, fieldId, value);
      setStateVersion(v => v + 1);
      console.log('FormContext: State updated after setValue');
    },
    [formManager]
  );

  const getValue = useCallback(
    (stepId: FormStepId, fieldId: string): FormValue => {
      console.log('FormContext: getValue invoked');
      console.log('FormContext: Step:', stepId);
      console.log('FormContext: Field:', fieldId);

      const value = formManager.getState().steps[stepId]?.values[fieldId];
      console.log('FormContext: Retrieved value:', value);
      return value;
    },
    [formManager]
  );

  const getStepErrors = useCallback(
    (stepId: FormStepId) => {
      console.log('FormContext: getStepErrors invoked for:', stepId);
      const errors = formManager.getState().steps[stepId]?.errors || {};
      console.log('FormContext: Step errors:', errors);
      return errors;
    },
    [formManager]
  );

  const isStepValid = useCallback(
    (stepId: FormStepId) => {
      console.log('FormContext: isStepValid invoked for:', stepId);
      const isValid = formManager.getState().steps[stepId]?.isValid || false;
      console.log('FormContext: Step validity:', isValid);
      return isValid;
    },
    [formManager]
  );

  // Timeline Entry Management
  const addTimelineEntry = useCallback(
    (stepId: FormStepId, entry: TimelineEntryType) => {
      console.log('FormContext: addTimelineEntry invoked');
      console.log('FormContext: Step:', stepId);
      console.log('FormContext: Entry:', entry);

      const currentEntries = (formManager.getState().steps[stepId]?.values.entries as TimelineEntryType[]) || [];
      console.log('FormContext: Current entries:', currentEntries);

      const newEntries = [...currentEntries, entry];
      setValue(stepId, 'entries', newEntries);
      console.log('FormContext: Added entry, new entries:', newEntries);
    },
    [setValue, formManager]
  );

  const updateTimelineEntry = useCallback(
    (stepId: FormStepId, index: number, entry: TimelineEntryType) => {
      console.log('FormContext: updateTimelineEntry invoked');
      console.log('FormContext: Step:', stepId);
      console.log('FormContext: Index:', index);
      console.log('FormContext: Entry:', entry);

      const currentEntries = (formManager.getState().steps[stepId]?.values.entries as TimelineEntryType[]) || [];
      console.log('FormContext: Current entries:', currentEntries);

      const newEntries = [...currentEntries];
      newEntries[index] = entry;
      setValue(stepId, 'entries', newEntries);
      console.log('FormContext: Updated entry, new entries:', newEntries);
    },
    [setValue, formManager]
  );

  const removeTimelineEntry = useCallback(
    (stepId: FormStepId, index: number) => {
      console.log('FormContext: removeTimelineEntry invoked');
      console.log('FormContext: Step:', stepId);
      console.log('FormContext: Index:', index);

      const currentEntries = (formManager.getState().steps[stepId]?.values.entries as TimelineEntryType[]) || [];
      console.log('FormContext: Current entries:', currentEntries);

      const newEntries = currentEntries.filter((_, i) => i !== index);
      setValue(stepId, 'entries', newEntries);
      console.log('FormContext: Removed entry, new entries:', newEntries);
    },
    [setValue, formManager]
  );

  const getTimelineEntries = useCallback(
    (stepId: FormStepId): TimelineEntryType[] => {
      console.log('FormContext: getTimelineEntries invoked for:', stepId);
      const entries = (formManager.getState().steps[stepId]?.values.entries as TimelineEntryType[]) || [];
      console.log('FormContext: Retrieved entries:', entries);
      return entries;
    },
    [formManager]
  );

  // Form Submission
  const submitForm = useCallback(async () => {
    console.log('FormContext: submitForm invoked');
    setIsSubmitting(true);
    setFormErrors({});
    console.log('FormContext: Starting submission process');

    try {
      console.log('FormContext: Validating all steps');
      const allStepsValid = navigationState.availableSteps.every(stepId => {
        const valid = isStepValid(stepId);
        console.log(`FormContext: Step ${stepId} valid:`, valid);
        return valid;
      });
      console.log('FormContext: All steps valid:', allStepsValid);

      if (!allStepsValid) {
        console.log('FormContext: Validation failed');
        throw new Error('Please complete all required fields');
      }

      console.log('FormContext: Submitting form data:', formManager.getState());
      await onSubmit(formManager.getState());
      console.log('FormContext: Submission successful');
    } catch (error) {
      console.log('FormContext: Submission error:', error);
      setFormErrors({
        submit: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsSubmitting(false);
      console.log('FormContext: Submission complete, isSubmitting:', false);
    }
  }, [navigationState.availableSteps, isStepValid, onSubmit, formManager]);

  // Context Value
  const contextValue = useMemo(() => {
    console.log('FormContext: Building context value');
    console.log('FormContext: Current step:', formState.currentStep);
    console.log('FormContext: Current context step:', currentContextStep);
    console.log('FormContext: Form state keys:', Object.keys(formState.steps));
    console.log('FormContext: Navigation state:', navigationState);

    return {
      currentStep: formState.currentStep,
      currentContextStep,
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
      formErrors,
      submitForm,
      isSubmitting,
    };
  }, [
    formState,
    currentContextStep,
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
    formErrors,
    submitForm,
    isSubmitting,
  ]);

  console.log('FormContext: Rendering provider with children');
  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>;
};

// Custom Hook
export const useForm = (): FormContextType => {
  console.log('FormContext: useForm hook invoked');
  const context = useContext(FormContext);
  if (!context) {
    console.log('FormContext: Error - useForm called outside FormProvider');
    throw new Error('useForm must be used within a FormProvider');
  }
  console.log('FormContext: Returning context from useForm');
  return context;
};

// Export Types
export type { FormState, TimelineEntry, ValidationResult, NavigationState, FormStepId };