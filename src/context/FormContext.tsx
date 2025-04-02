/* eslint-disable no-console */
import React, { createContext, useContext, useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { FormStateManager } from '../utils/FormStateManager';
import { FormConfigGenerator, FormStepId } from '../utils/FormConfigGenerator';
import type { FormState, TimelineEntry, NavigationState, FormValue } from '../utils/FormStateManager';
import type { Requirements } from '../utils/collectionKeyParser';
import { getConfig } from '../utils/EnvironmentConfig';

// Helper function to check if a step is enabled (unchanged)
const isStepEnabled = (stepId: FormStepId, reqs: Requirements): boolean => {
  let hasRequiredConsents = false;

  switch (stepId) {
    case 'consents':
      hasRequiredConsents = Object.values(reqs.consentsRequired).some(required => required);
      console.log('Checking consents required:', reqs.consentsRequired, 'Has required consents:', hasRequiredConsents);
      return hasRequiredConsents;
    case 'signature':
      return reqs.signature.required;
    case 'personal-info':
      console.log('isStepEnabled - personal-info:', reqs.verificationSteps.personalInfo?.enabled || false);
      return reqs.verificationSteps.personalInfo?.enabled || false;
    case 'residence-history':
      console.log('isStepEnabled - residence-history:', reqs.verificationSteps.residenceHistory?.enabled || false);
      console.log('isStepEnabled - residence-history requirements:', reqs.verificationSteps.residenceHistory);
      return reqs.verificationSteps.residenceHistory?.enabled || false;
    case 'employment-history':
      return reqs.verificationSteps.employmentHistory?.enabled || false;
    case 'education':
      return reqs.verificationSteps.education?.enabled || false;
    case 'professional-licenses':
      return reqs.verificationSteps.professionalLicense?.enabled || false;
    default:
      return false;
  }
};

export interface TimelineEntryType extends TimelineEntry {
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  [key: string]: FormValue | null;
}

export interface FormContextType {
  currentStep: FormStepId;
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
  forceSetCurrentStep: (stepId: FormStepId) => void;
  setValue: (stepId: FormStepId, fieldId: string, value: FormValue) => void;
  getValue: (stepId: FormStepId, fieldId: string) => FormValue;
  getStepErrors: (stepId: FormStepId) => Record<string, string>;
  isStepValid: (stepId: FormStepId) => boolean;
  addTimelineEntry: (stepId: FormStepId, entry: TimelineEntry) => void;
  updateTimelineEntry: (stepId: FormStepId, index: number, entry: TimelineEntry) => void;
  removeTimelineEntry: (stepId: FormStepId, index: number) => void;
  getTimelineEntries: (stepId: FormStepId) => TimelineEntry[];
  formErrors: Record<string, string>;
  submitForm: () => Promise<void>;
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

let formManagerInstance: FormStateManager | null = null;

const _stepIdToRequirementKey = (stepId: FormStepId): keyof Requirements['verificationSteps'] | null => {
  switch (stepId) {
    case 'personal-info': return 'personalInfo';
    case 'residence-history': return 'residenceHistory';
    case 'employment-history': return 'employmentHistory';
    case 'education': return 'education';
    case 'professional-licenses': return 'professionalLicense';
    default: return null;
  }
};

export interface FormProviderProps {
  children: React.ReactNode;
  requirements: Requirements;
  onSubmit: (formData: FormState) => Promise<void>;
  initialStep?: FormStepId;
  isDefaultKey?: boolean;
  onStepChange?: (step: FormStepId, formState: FormState) => void;
  collectionKey?: string;
}

export const FormProvider: React.FC<FormProviderProps> = ({
  children,
  requirements,
  onSubmit,
  initialStep = 'personal-info',
  isDefaultKey = true,
  onStepChange,
  collectionKey,
}) => {
  console.log('FormContext: Rendering with props:', { initialStep, isDefaultKey, collectionKey });

  const safeRequirements: Requirements = {
    ...requirements,
    consentsRequired: requirements.consentsRequired || {
      driverLicense: false,
      drugTest: false,
      biometric: false,
    },
  };
  console.log('FormProvider safeRequirements.consentsRequired:', safeRequirements.consentsRequired);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const initializedRef = useRef(false);
  const [stateVersion, setStateVersion] = useState(0);

  const formLogger = useCallback((message: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message);
    }
  }, []);

  const formManager = useMemo(() => {
    const effectiveCollectionKey = collectionKey || (isDefaultKey ? getConfig().defaultCollectionKey : 'default-key');
    const config = FormConfigGenerator.generateFormConfig(effectiveCollectionKey);

    if (!formManagerInstance) {
      console.log('FormContext: Creating new FormStateManager instance');
      formManagerInstance = new FormStateManager(config, formLogger);
    }

    if (initializedRef.current) {
      console.log('FormContext: Updating FormStateManager config');
      formManagerInstance.updateConfig(config);
    } else {
      const stepOrder: FormStepId[] = [
        'personal-info',
        'consents',
        'residence-history',
        'employment-history',
        'education',
        'professional-licenses',
        'signature',
      ];

      stepOrder.forEach(stepId => {
        if (isStepEnabled(stepId, safeRequirements)) {
          console.log(`FormContext: Initializing step ${stepId}`);
          formManagerInstance!.setValue(stepId, '_initialized', true);
          formManagerInstance!.setValue(stepId, '_complete', false);
          formManagerInstance!.setValue(stepId, 'isValid', false);
          formManagerInstance!.setValue(stepId, 'isComplete', false);

          switch (stepId) {
            case 'personal-info':
              formManagerInstance!.setValue(stepId, 'fullName', '');
              formManagerInstance!.setValue(stepId, 'email', '');
              break;
            case 'residence-history':
              formManagerInstance!.setValue(stepId, 'entries', []);
              formManagerInstance!.setValue(stepId, 'total_years', '0');
              break;
            case 'employment-history':
            case 'education':
            case 'professional-licenses':
              formManagerInstance!.setValue(stepId, 'entries', []);
              break;
            case 'consents':
              formManagerInstance!.setValue(stepId, '_config', { consentsRequired: safeRequirements.consentsRequired });
              formManagerInstance!.setValue(stepId, 'driverLicenseConsent', false);
              formManagerInstance!.setValue(stepId, 'drugTestConsent', false);
              formManagerInstance!.setValue(stepId, 'biometricConsent', false);
              break;
          }
        }
      });

      const firstEnabledStep = initialStep || stepOrder.find(stepId => isStepEnabled(stepId, safeRequirements)) || 'personal-info';
      formManagerInstance!.forceSetCurrentStep(firstEnabledStep);
      initializedRef.current = true;
    }

    return formManagerInstance!;
  }, [collectionKey, isDefaultKey, safeRequirements, initialStep, formLogger]);

  useEffect(() => {
    if (isStepEnabled('consents', safeRequirements)) {
      console.log('Reinitializing consents step with new requirements:', safeRequirements.consentsRequired);
      formManager.setValue('consents', '_config', { consentsRequired: safeRequirements.consentsRequired });
    }
  }, [formManager, safeRequirements]);

  const formState = useMemo(() => {
    const state = formManager.getState();
    console.log('FormContext: Computed formState:', state);
    return state;
  }, [formManager, stateVersion]);

  const navigationState = useMemo(() => {
    const navState = formManager.getNavigationState();
    console.log('FormContext: Computed navigationState:', navState);
    return navState;
  }, [formManager, stateVersion]);

  const moveToNextStep = useCallback(() => {
    // Force move to the next step without checking if it's enabled
    // This is needed because the canMoveNext flag in the navigation state
    // might not be updated correctly
    const currentIndex = navigationState.availableSteps.indexOf(formState.currentStepId);
    if (currentIndex < navigationState.availableSteps.length - 1) {
      const nextStep = navigationState.availableSteps[currentIndex + 1];
      formManager.forceSetCurrentStep(nextStep);
      if (onStepChange) onStepChange(nextStep, formManager.getState());
      setStateVersion(v => v + 1);
    }
  }, [formManager, navigationState, formState.currentStepId, onStepChange]);

  const moveToPreviousStep = useCallback(() => {
    const currentIndex = navigationState.availableSteps.indexOf(formState.currentStepId);
    if (currentIndex > 0) {
      const prevStep = navigationState.availableSteps[currentIndex - 1];
      formManager.forceSetCurrentStep(prevStep);
      if (onStepChange) onStepChange(prevStep, formManager.getState());
      setStateVersion(v => v + 1);
    }
  }, [formManager, navigationState, formState.currentStepId, onStepChange]);

  const moveToStep = useCallback((stepId: FormStepId) => {
    formManager.forceSetCurrentStep(stepId);
    if (onStepChange) onStepChange(stepId, formManager.getState());
    setStateVersion(v => v + 1);
  }, [formManager, onStepChange]);

  const forceNextStep = useCallback(() => {
    const currentIndex = navigationState.availableSteps.indexOf(formState.currentStepId);
    if (currentIndex < navigationState.availableSteps.length - 1) {
      const nextStep = navigationState.availableSteps[currentIndex + 1];
      formManager.forceSetCurrentStep(nextStep);
      if (onStepChange) onStepChange(nextStep, formManager.getState());
      setStateVersion(v => v + 1);
    }
  }, [formManager, navigationState, formState.currentStepId, onStepChange]);

  const forceSetCurrentStep = useCallback((stepId: FormStepId) => {
    formManager.forceSetCurrentStep(stepId);
    setStateVersion(v => v + 1);
  }, [formManager]);

  const setValue = useCallback((stepId: FormStepId, fieldId: string, value: FormValue) => {
    console.log(`Setting value for ${stepId}.${fieldId}:`, value);
    formManager.setValue(stepId, fieldId, value);
    setStateVersion(v => v + 1);
  }, [formManager]);

  // Fixed getValue to handle _config correctly
  const getValue = useCallback((stepId: FormStepId, fieldId: string): FormValue => {
    const step = formManager.getState().steps[stepId];
    if (!step) return null;
    let value: FormValue;
    if (fieldId === '_config') {
      value = step._config ?? null;
    } else {
      value = step.values[fieldId] ?? null;
    }
    console.log(`Getting value for ${stepId}.${fieldId}:`, value);
    return value;
  }, [formManager]);

  const getStepErrors = useCallback((stepId: FormStepId) => {
    return formManager.getState().steps[stepId]?.errors || {};
  }, [formManager]);

  const isStepValid = useCallback((stepId: FormStepId) => {
    return formManager.getState().steps[stepId]?.isValid || false;
  }, [formManager]);

  const addTimelineEntry = useCallback((stepId: FormStepId, entry: TimelineEntry) => {
    const step = formManager.getState().steps[stepId];
    if (!step) return;
    const values = step.values;
    if (values && typeof values === 'object' && 'entries' in values && Array.isArray(values.entries)) {
      setValue(stepId, 'entries', [...values.entries, entry]);
    } else {
      setValue(stepId, 'entries', [entry]);
    }
  }, [formManager, setValue]);

  const updateTimelineEntry = useCallback((stepId: FormStepId, index: number, entry: TimelineEntry) => {
    const step = formManager.getState().steps[stepId];
    if (!step) return;
    const values = step.values;
    if (values && typeof values === 'object' && 'entries' in values && Array.isArray(values.entries)) {
      const newEntries = [...values.entries];
      newEntries[index] = entry;
      setValue(stepId, 'entries', newEntries);
    } else {
      setValue(stepId, 'entries', [entry]);
    }
  }, [formManager, setValue]);

  const removeTimelineEntry = useCallback((stepId: FormStepId, index: number) => {
    const step = formManager.getState().steps[stepId];
    if (!step) return;
    const values = step.values;
    if (values && typeof values === 'object' && 'entries' in values && Array.isArray(values.entries)) {
      const newEntries = values.entries.filter((_, i) => i !== index);
      setValue(stepId, 'entries', newEntries);
    }
  }, [formManager, setValue]);

  const getTimelineEntries = useCallback((stepId: FormStepId): TimelineEntry[] => {
    const step = formManager.getState().steps[stepId];
    if (!step) return [];
    const values = step.values;
    if (values && typeof values === 'object' && 'entries' in values && Array.isArray(values.entries)) {
      return values.entries;
    }
    return [];
  }, [formManager]);

  const submitForm = useCallback(async () => {
    setIsSubmitting(true);
    setFormErrors({});
    try {
      const allStepsValid = navigationState.availableSteps.every(stepId => isStepValid(stepId));
      if (!allStepsValid) throw new Error('Please complete all required fields');
      await onSubmit(formManager.getState());
    } catch (error) {
      setFormErrors({ submit: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  }, [formManager, navigationState.availableSteps, isStepValid, onSubmit]);

  const contextValue = useMemo(() => ({
    currentStep: formState.currentStepId,
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
    forceSetCurrentStep,
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
  }), [
    formState,
    navigationState,
    moveToNextStep,
    moveToPreviousStep,
    moveToStep,
    forceNextStep,
    forceSetCurrentStep,
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

  return <FormContext.Provider value={contextValue}>{children}</FormContext.Provider>;
};

export const useForm = (): FormContextType => {
  const context = useContext(FormContext);
  if (!context) throw new Error('useForm must be used within a FormProvider');
  return context;
};

export type { FormState, TimelineEntry, NavigationState, FormStepId };