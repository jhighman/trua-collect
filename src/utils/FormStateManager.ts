import { FormConfig, FormStepId, FormField } from './FormConfigGenerator';
import type { ValidationRule } from './FormConfigGenerator';
import { EducationLevel, isCollegeOrHigher } from '../types/EducationLevel';

// Types
export interface TimelineEntry {
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow additional properties
}

export interface FormValue {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Using any here is necessary due to the complex nature of form values
}

export interface FormStepState {
  id: FormStepId;
  values: FormValue;
  touched: Set<string>;
  errors: { [key: string]: string };
  isComplete: boolean;
  isValid: boolean;
}

export interface TimelineEntry {
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface FormState {
  currentStep: FormStepId;
  steps: { [key in FormStepId]?: FormStepState };
  isSubmitting: boolean;
  isComplete: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string };
}

export interface NavigationState {
  canMoveNext: boolean;
  canMovePrevious: boolean;
  availableSteps: FormStepId[];
  completedSteps: FormStepId[];
}

// FormStateManager Class
export class FormStateManager {
  private config: FormConfig;
  private state: FormState;
  private isInitialized: boolean = false;

  constructor(config: FormConfig) {
    this.config = config;
    this.state = this.initializeState();
    this.isInitialized = true;
  }
  
  // Update the config and reinitialize the state
  public updateConfig(config: FormConfig): void {
    console.log('FormStateManager: Updating config with new initialStep:', config.initialStep);
    
    // Save the current state before updating
    const currentState = this.state;
    console.log('FormStateManager: Current state before update:', currentState);
    
    // Update the config
    this.config = config;
    
    // Initialize new state but preserve existing values
    const newState = this.initializeState();
    
    // If we had a previous state, preserve all values and validation state
    if (currentState && currentState.steps) {
      console.log('FormStateManager: Preserving state from previous state');
      
      Object.keys(currentState.steps).forEach(stepId => {
        const step = stepId as FormStepId;
        if (currentState.steps[step]) {
          console.log(`FormStateManager: Preserving step: ${step}`);
          newState.steps[step] = {
            ...currentState.steps[step],
            // Preserve validation state
            isValid: currentState.steps[step]!.isValid,
            isComplete: currentState.steps[step]!.isComplete,
            errors: { ...currentState.steps[step]!.errors },
            // Preserve values and touched state
            values: { ...currentState.steps[step]!.values },
            touched: new Set(currentState.steps[step]!.touched)
          };
        }
      });
    }
    
    // Keep the current step
    newState.currentStep = currentState?.currentStep || config.initialStep;
    console.log('FormStateManager: Setting current step to:', newState.currentStep);
    
    // Update the state
    this.state = newState;
  }

  private initializeState(): FormState {
    console.log('FormStateManager: Initializing state');
    
    // If already initialized, return the current state to prevent resetting
    if (this.isInitialized && this.state) {
      console.log('FormStateManager: Already initialized, preserving current state');
      return this.state;
    }
    
    // Initialize all steps, not just enabled ones
    const steps: { [key in FormStepId]?: FormStepState } = this.config.steps.reduce((acc, step) => {
      return {
        ...acc,
        [step.id]: {
          id: step.id,
          values: {},
          touched: new Set<string>(),
          errors: {},
          isComplete: false,
          isValid: false
        }
      };
    }, {} as { [key in FormStepId]?: FormStepState });
    
    return {
      currentStep: this.config.initialStep,
      steps,
      isSubmitting: false,
      isComplete: false
    };
  }

  // State Management Methods
  public getState(): FormState {
    return { ...this.state };
  }

  public getCurrentStep(): FormStepState {
    return { ...this.state.steps[this.state.currentStep]! };
  }

  public setValue(
    stepId: FormStepId,
    fieldId: string,
    value: string | number | boolean | TimelineEntry[] | Record<string, unknown> | undefined
  ): FormState {
    console.log(`Setting value for ${stepId}.${fieldId}:`, value);
    
    // Check if the step exists in the state
    if (!this.state.steps[stepId]) {
      console.log(`Step ${stepId} not found in state, initializing it`);
      
      // Initialize the step if it's enabled but not in the state
      this.state.steps[stepId] = {
        id: stepId,
        values: {},
        touched: new Set<string>(),
        errors: {},
        isComplete: false,
        isValid: false
      };
    }
    
    const step = this.state.steps[stepId]!;
    
    // Create new values object with the updated field
    const newValues = {
      ...step.values,
      [fieldId]: value
    };
    
    // Add field to touched set
    const newTouched = new Set(step.touched).add(fieldId);
    
    // Special case for initialization fields
    if (fieldId === '_initialized' || fieldId === '_complete' || fieldId === 'isValid' || fieldId === 'isComplete') {
      const newStep: FormStepState = {
        ...step,
        values: newValues,
        touched: newTouched,
        errors: {},
        isValid: value === true,
        isComplete: value === true
      };

      this.state = {
        ...this.state,
        steps: {
          ...this.state.steps,
          [stepId]: newStep
        }
      };

      return this.getState();
    }
    
    // Validate the step with new values
    const validationResult = this.validateStep(stepId, newValues);
    console.log(`Validation result for ${stepId}:`, validationResult);

    // For consents step, check if all required consents are provided
    if (stepId === 'consents') {
      const config = newValues._config as { consentsRequired: { driverLicense: boolean; drugTest: boolean; biometric: boolean } } | undefined;
      if (config) {
        const hasAllRequiredConsents = Object.entries(config.consentsRequired).every(([key, required]) => {
          if (!required) return true;
          const consentField = `${key}Consent`;
          return newValues[consentField] === true;
        });
        console.log('Has all required consents:', hasAllRequiredConsents);
        validationResult.isValid = hasAllRequiredConsents;
      }
    }

    // Check step completion
    const isComplete = this.checkStepCompletion(stepId, newValues, validationResult.isValid);
    console.log(`Step ${stepId} is complete:`, isComplete);

    // Create a new step state
    const newStep: FormStepState = {
      ...step,
      values: newValues,
      touched: newTouched,
      errors: validationResult.errors,
      isValid: validationResult.isValid,
      isComplete: isComplete
    };

    // Update the state immutably
    this.state = {
      ...this.state,
      steps: {
        ...this.state.steps,
        [stepId]: newStep
      }
    };

    console.log(`Updated state for ${stepId}:`, this.state.steps[stepId]);
    console.log(`Updated values:`, this.state.steps[stepId]?.values);
    console.log(`Updated touched:`, this.state.steps[stepId]?.touched);
    console.log(`Updated isValid:`, this.state.steps[stepId]?.isValid);
    console.log(`Updated isComplete:`, this.state.steps[stepId]?.isComplete);
    
    return this.getState();
  }

  // Navigation Methods
  public getNavigationState(): NavigationState {
    const currentStepIndex = this.config.steps.findIndex(s => s.id === this.state.currentStep);
    const completedSteps = this.getCompletedSteps();
    
    return {
      canMoveNext: this.canMoveNext(),
      canMovePrevious: currentStepIndex > 0,
      availableSteps: this.getAvailableSteps(),
      completedSteps
    };
  }
  
  // Force set the current step without validation
  // This is useful for fixing state inconsistencies
  public forceSetCurrentStep(stepId: FormStepId): FormState {
    console.log('FormStateManager: Force setting current step to:', stepId);
    return this.moveToStep(stepId); // Use internal moveToStep instead of context
  }

  public moveToStep(stepId: FormStepId): FormState {
    console.log('FormStateManager: Moving to step:', stepId);

    // Initialize all steps if they don't exist
    this.config.steps.forEach(step => {
      if (!this.state.steps[step.id]) {
        this.state.steps[step.id] = {
          id: step.id,
          values: {},
          touched: new Set<string>(),
          errors: {},
          isComplete: false,
          isValid: false
        };
      }
    });

    // Update the current step without validation
    this.state = {
      ...this.state,
      currentStep: stepId
    };

    return this.getState();
  }

  public canNavigateToStep(stepId: FormStepId): boolean {
    return true;
  }

  // Validation Methods
  private validateStep(stepId: FormStepId, values: FormValue): ValidationResult {
    console.log(`Validating step ${stepId}`);
    console.log('Values:', values);
    
    const stepConfig = this.config.steps.find(s => s.id === stepId);
    if (!stepConfig) {
      console.log(`No config found for step ${stepId}`);
      return { isValid: true, errors: {} };
    }
    
    console.log('Step config:', stepConfig);
    
    // Special validation for employment history step
    if (stepId === 'employment-history') {
      const entries = values.entries as TimelineEntry[] | undefined;
      const requiredYears = stepConfig.validationRules?.requiredYears || 5;
      
      if (!entries?.length) {
        return { 
          isValid: false, 
          errors: { entries: `At least one employment entry is required for the past ${requiredYears} years` }
        };
      }
      
      const { totalYears, hasContinuousCoverage } = this.calculateTimelineCoverage(entries);
      const isValid = hasContinuousCoverage;
      
      let errorMessage = '';
      if (!hasContinuousCoverage) {
        errorMessage = `Your employment history must be continuous from today back ${requiredYears} years. Please ensure there are no gaps between entries and that your most recent entry includes today's date.`;
      }
      
      return {
        isValid,
        errors: isValid ? {} : { entries: errorMessage }
      };
    }
    
    // Special validation for residence history step
    if (stepId === 'residence-history') {
      const entries = values.entries as TimelineEntry[] | undefined;
      const requiredYears = stepConfig.validationRules?.requiredYears || 5;
      
      if (!entries?.length) {
        return { 
          isValid: false, 
          errors: { entries: `At least one residence entry is required for the past ${requiredYears} years` }
        };
      }
      
      const { totalYears, hasContinuousCoverage } = this.calculateTimelineCoverage(entries);
      const isValid = hasContinuousCoverage;
      
      let errorMessage = '';
      if (!hasContinuousCoverage) {
        errorMessage = `Your residence history must be continuous from today back ${requiredYears} years. Please ensure there are no gaps between entries and that your most recent entry includes today's date.`;
      }
      
      return {
        isValid,
        errors: isValid ? {} : { entries: errorMessage }
      };
    }
    
    // Special validation for consents step
    if (stepId === 'consents') {
      const config = values._config as { consentsRequired: { driverLicense: boolean; drugTest: boolean; biometric: boolean } } | undefined;
      if (!config) {
        return { isValid: true, errors: {} };
      }
      
      const errors: { [key: string]: string } = {};
      let isValid = true;
      
      // Check each required consent
      if (config.consentsRequired.driverLicense && values.driverLicenseConsent !== true) {
        errors.driverLicenseConsent = 'Driver license consent is required';
        isValid = false;
      }
      
      if (config.consentsRequired.drugTest && values.drugTestConsent !== true) {
        errors.drugTestConsent = 'Drug test consent is required';
        isValid = false;
      }
      
      if (config.consentsRequired.biometric && values.biometricConsent !== true) {
        errors.biometricConsent = 'Biometric consent is required';
        isValid = false;
      }
      
      console.log('Consent validation result:', { isValid, errors });
      return { isValid, errors };
    }
    
    // Default validation for other steps
    const requiredFields = stepConfig.fields
      .filter(field => field.required)
      .map(field => field.id);
    
    console.log('Required fields:', requiredFields);
    
    // Check if all required fields have values
    const hasAllRequiredFields = requiredFields.every(fieldId => {
      const value = values[fieldId];
      if (typeof value === 'boolean') {
        return value === true;
      }
      return value !== undefined && value !== null && value !== '';
    });
    
    console.log('Has all required fields:', hasAllRequiredFields);
    
    return { isValid: hasAllRequiredFields, errors: {} };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private validateField(field: FormField, value: any): string | null {
    for (const rule of field.validation) {
      const error = this.applyValidationRule(rule, value);
      if (error) return error;
    }
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyValidationRule(rule: ValidationRule, value: any): string | null {
    switch (rule.type) {
      case 'required':
        return !value ? rule.message : null;
      case 'pattern':
        if (!rule.value || !(rule.value instanceof RegExp)) return null;
        return value && !rule.value.test(value) ? rule.message : null;
      case 'minLength':
        if (typeof rule.value !== 'number') return null;
        return value && value.length < rule.value ? rule.message : null;
      case 'maxLength':
        if (typeof rule.value !== 'number') return null;
        return value && value.length > rule.value ? rule.message : null;
      default:
        return null;
    }
  }

  // Timeline Methods
  private calculateTimelineCoverage(entries: TimelineEntry[]): { totalYears: number; hasContinuousCoverage: boolean } {
    if (!entries.length) return { totalYears: 0, hasContinuousCoverage: false };

    const today = new Date();
    const requiredStartDate = new Date();
    requiredStartDate.setFullYear(today.getFullYear() - 5); // 5 years ago

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime() // Sort in reverse chronological order
    );

    // First check if we have an entry that includes today
    const mostRecentEntry = sortedEntries[0];
    const mostRecentEnd = mostRecentEntry.isCurrent ? today : new Date(mostRecentEntry.endDate!);
    if (mostRecentEnd < today) {
      return { totalYears: 0, hasContinuousCoverage: false }; // No current coverage
    }

    let currentDate = today;
    let totalYears = 0;

    for (const entry of sortedEntries) {
      const start = new Date(entry.startDate);
      const end = entry.isCurrent ? today : new Date(entry.endDate!);

      // Check for gap with previous date
      if (start > currentDate) {
        return { totalYears, hasContinuousCoverage: false }; // Found a gap
      }

      // Calculate coverage for this entry
      const entryYears = (Math.min(end.getTime(), currentDate.getTime()) - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      totalYears += entryYears;

      // Update the current date for next iteration
      currentDate = start;

      // If we've gone back far enough, we can stop
      if (start <= requiredStartDate) {
        return { totalYears, hasContinuousCoverage: true };
      }
    }

    // If we get here, we haven't gone back far enough
    return { totalYears, hasContinuousCoverage: false };
  }

  // Helper Methods
  private canMoveNext(): boolean {
    // Log the current step to help with debugging
    console.log('canMoveNext: Current step in state:', this.state.currentStep);
    
    const currentStepIndex = this.config.steps.findIndex(s => s.id === this.state.currentStep);
    if (currentStepIndex === this.config.steps.length - 1) return false;

    // Make sure we have a valid step
    if (!this.state.steps[this.state.currentStep]) {
      console.log('canMoveNext: Current step not found in state:', this.state.currentStep);
      return false;
    }

    const currentStep = this.state.steps[this.state.currentStep]!;
    
    console.log('canMoveNext for step:', this.state.currentStep);
    console.log('Step state:', currentStep);
    
    // Special case for education step
    if (this.state.currentStep === 'education') {
      const values = currentStep.values;
      
      console.log('canMoveNext for education step');
      console.log('Education step values:', values);
      console.log('Education step touched:', currentStep.touched);
      console.log('Education step errors:', currentStep.errors);
      console.log('Education step isValid:', currentStep.isValid);
      console.log('Education step isComplete:', currentStep.isComplete);
      
      // Must have highest education level
      if (!values.highestLevel) {
        console.log('No highest education level set');
        return false;
      }
      
      console.log('Highest education level:', values.highestLevel);
      
      // If college or higher, must have at least one entry
      const collegeOrHigher = isCollegeOrHigher(values.highestLevel as EducationLevel);
      console.log('Is college or higher:', collegeOrHigher);
      
      if (collegeOrHigher) {
        const hasEntries = values.entries && values.entries.length > 0;
        console.log('Has entries:', hasEntries);
        if (values.entries) {
          console.log('Entries array:', values.entries);
          console.log('Entries length:', values.entries.length);
        } else {
          console.log('Entries is undefined or null');
        }
        
        // Force the result to be true if we have entries
        const result = hasEntries;
        console.log('Can move next result:', result);
        
        // If we can't move next, log the reasons
        if (!result) {
          console.log('Cannot move next because:');
          if (!hasEntries) console.log('- No entries for college education');
        }
        
        return result;
      }
      
      // For non-college, just need the education level
      console.log('Non-college education, can move next');
      return true;
    }
    
    const result = currentStep.isValid && currentStep.isComplete;
    console.log('Can move next result:', result);
    return result;
  }

  private getAvailableSteps(): FormStepId[] {
    console.log('VERBOSE: FormStateManager: Getting available steps');
    console.log('VERBOSE: FormStateManager: Config steps:', this.config.steps);
    
    const enabledSteps = this.config.steps.filter(step => step.enabled);
    console.log('VERBOSE: FormStateManager: Enabled steps:', enabledSteps);
    
    const availableStepIds = enabledSteps.map(step => step.id);
    console.log('VERBOSE: FormStateManager: Available step IDs:', availableStepIds);
    
    // Check if professional-licenses is in the available steps
    const isProfessionalLicensesAvailable = availableStepIds.includes('professional-licenses');
    console.log('VERBOSE: FormStateManager: Is professional-licenses in available steps?', isProfessionalLicensesAvailable);
    
    return availableStepIds;
  }

  private getCompletedSteps(): FormStepId[] {
    return Object.entries(this.state.steps)
      .filter(([_, step]) => step.isComplete)
      .map(([id]) => id as FormStepId);
  }

  private checkStepCompletion(stepId: FormStepId, values: FormValue, isValid: boolean): boolean {
    console.log('Checking step completion for:', stepId);
    console.log('Values:', values);
    console.log('Is valid:', isValid);
    
    // For consents step, completion is based on having all required consents
    if (stepId === 'consents') {
      const config = values._config as { consentsRequired: { driverLicense: boolean; drugTest: boolean; biometric: boolean } } | undefined;
      if (config) {
        const hasAllRequiredConsents = Object.entries(config.consentsRequired).every(([key, required]) => {
          if (!required) return true;
          const consentField = `${key}Consent`;
          return values[consentField] === true;
        });
        console.log('Has all required consents:', hasAllRequiredConsents);
        return hasAllRequiredConsents && isValid;
      }
    }
    
    const stepConfig = this.config.steps.find(s => s.id === stepId);
    console.log('Step config:', stepConfig);
    
    // Get required fields from step config
    const requiredFields = stepConfig?.fields
      .filter(field => field.required)
      .map(field => field.id) || [];
    
    console.log('Required fields:', requiredFields);
    
    // Check if all required fields have values
    const hasAllRequiredFields = requiredFields.every(fieldId => {
      const value = values[fieldId];
      if (typeof value === 'boolean') {
        return value === true;
      }
      return value !== undefined && value !== null && value !== '';
    });
    
    console.log('Has all required fields:', hasAllRequiredFields);
    
    // Default step completion result
    const defaultResult = hasAllRequiredFields && isValid;
    console.log('Default step completion result:', defaultResult);
    
    return defaultResult;
  }
} 