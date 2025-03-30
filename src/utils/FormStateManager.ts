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

export interface ProfessionalLicenseEntry extends TimelineEntry {
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
}

export type ConsentsConfig = {
  consentsRequired?: {
    driverLicense: boolean;
    drugTest: boolean;
    biometric: boolean;
  };
};

export type FormValue = string | number | boolean | TimelineEntry[] | ConsentsConfig | undefined | null;

// Base interface for form step values with string indexing
export interface BaseFormStepValues {
  [key: string]: FormValue;
}

// Extended interface that includes the _config property
export interface FormStepValues extends BaseFormStepValues {
  _config?: ConsentsConfig;
}

// Step-specific values
export type StepValues = FormStepValues | EducationStepValues | ConsentsStepValues | SignatureStepValues | ProfessionalLicensesStepValues;

export interface FormStepState {
  isValid: boolean;
  isComplete: boolean;
  touched: Set<string>;
  errors: Record<string, string>;
  values: StepValues;
}

export interface TimelineEntry {
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface FormState {
  currentStep: FormStepId;
  values: { [key in FormStepId]: FormStepValues };
  steps: Partial<{ [key in FormStepId]: FormStepState }>;
  completedSteps: FormStepId[];
  isSubmitting: boolean;
  isComplete: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export interface NavigationState {
  canMoveNext: boolean;
  canMovePrevious: boolean;
  availableSteps: FormStepId[];
  completedSteps: FormStepId[];
}

export interface EducationStepValues extends FormStepValues {
  highestLevel?: EducationLevel;
  entries?: TimelineEntry[];
}

export interface ProfessionalLicensesStepValues extends FormStepValues {
  entries?: ProfessionalLicenseEntry[];
}

export interface ConsentsStepValues extends FormStepValues {
  _config?: ConsentsConfig;
  driverLicenseConsent?: boolean;
  drugTestConsent?: boolean;
  biometricConsent?: boolean;
}

export interface SignatureStepValues extends FormStepValues {
  signature: string;
  confirmation?: boolean;
  trackingId?: string;
}

// Helper type guards
function isString(value: FormValue): value is string {
  return typeof value === 'string';
}

function isTimelineEntryArray(value: FormValue): value is TimelineEntry[] {
  return Array.isArray(value) && value.every(entry => 
    typeof entry === 'object' && 
    entry !== null && 
    'startDate' in entry && 
    'endDate' in entry && 
    'isCurrent' in entry
  );
}

// Type guard for FormValue
function isFormValue(value: unknown): value is FormValue {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return true;
  if (isTimelineEntryArray(value)) return true;
  if (typeof value === 'object' && value !== null && '_config' in value) {
    // Check if it's a ConsentsConfig
    const config = value as ConsentsConfig;
    return typeof config.consentsRequired === 'undefined' || (
      typeof config.consentsRequired === 'object' &&
      typeof config.consentsRequired.driverLicense === 'boolean' &&
      typeof config.consentsRequired.drugTest === 'boolean' &&
      typeof config.consentsRequired.biometric === 'boolean'
    );
  }
  return false;
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
    
    // Initialize all steps with their required properties
    const initialValues = {
      'personal-info': {},
      'residence-history': {},
      'employment-history': {},
      'education': {},
      'professional-licenses': {},
      'consents': {},
      'signature': {}
    } as { [key in FormStepId]: FormStepValues };

    const initialSteps = {
      'personal-info': {
        isValid: false,
        isComplete: false,
        touched: new Set<string>(),
        errors: {},
        values: {}
      },
      'residence-history': {
        isValid: false,
        isComplete: false,
        touched: new Set<string>(),
        errors: {},
        values: {}
      },
      'employment-history': {
        isValid: false,
        isComplete: false,
        touched: new Set<string>(),
        errors: {},
        values: {}
      },
      'education': {
        isValid: false,
        isComplete: false,
        touched: new Set<string>(),
        errors: {},
        values: {}
      },
      'professional-licenses': {
        isValid: false,
        isComplete: false,
        touched: new Set<string>(),
        errors: {},
        values: {}
      },
      'consents': {
        isValid: false,
        isComplete: false,
        touched: new Set<string>(),
        errors: {},
        values: {}
      },
      'signature': {
        isValid: false,
        isComplete: false,
        touched: new Set<string>(),
        errors: {},
        values: {}
      }
    } as { [key in FormStepId]: FormStepState };
    
    return {
      currentStep: this.config.initialStep,
      values: initialValues,
      steps: initialSteps,
      completedSteps: [],
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
    value: unknown
  ): FormState {
    console.log(`Setting value for ${stepId}.${fieldId}:`, value);
    
    // Type check the value
    if (!isFormValue(value)) {
      console.error(`Invalid value type for ${stepId}.${fieldId}:`, value);
      throw new Error(`Invalid value type for ${stepId}.${fieldId}`);
    }
    
    // Check if the step exists in the state
    if (!this.state.steps[stepId]) {
      console.log(`Step ${stepId} not found in state, initializing it`);
      
      // Initialize the step if it's enabled but not in the state
      this.state.steps[stepId] = {
        isValid: false,
        isComplete: false,
        touched: new Set<string>(),
        errors: {},
        values: {}
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

      return this.state;
    }

    // Validate the step with the new value
    const validationResult = this.validateStep(stepId, newValues);
    
    // Update the step state
    const newStep: FormStepState = {
      ...step,
      values: newValues,
      touched: newTouched,
      errors: validationResult.errors,
      isValid: validationResult.isValid,
      isComplete: this.checkStepCompletion(stepId, newValues, validationResult.isValid)
    };

    // Update the state
    this.state = {
      ...this.state,
      steps: {
        ...this.state.steps,
        [stepId]: newStep
      }
    };

    return this.state;
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
          isValid: false,
          isComplete: false,
          touched: new Set<string>(),
          errors: {},
          values: {}
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
  private validateStep(stepId: FormStepId, values: FormStepValues): ValidationResult {
    const stepConfig = this.config.steps.find(step => step.id === stepId);
    if (!stepConfig) {
      return { isValid: false, errors: {} };
    }

    const errors: Record<string, string> = {};
    let isValid = true;

    // For consents step, check if all required consents are provided
    if (stepId === 'consents') {
      const config = values._config as { consentsRequired: { driverLicense: boolean; drugTest: boolean; biometric: boolean } } | undefined;
      if (config) {
        const hasAllRequiredConsents = Object.entries(config.consentsRequired).every(([key, required]) => {
          if (!required) return true;
          const consentField = `${key}Consent`;
          return values[consentField] === true;
        });
        isValid = hasAllRequiredConsents;
        if (!hasAllRequiredConsents) {
          errors['consents'] = 'All required consents must be provided';
        }
      }
    }

    // For timeline steps, validate entries
    if (stepId === 'residence-history' || stepId === 'employment-history' || stepId === 'education') {
      const entries = values.entries as TimelineEntry[] | undefined;
      if (entries) {
        const { hasContinuousCoverage } = this.calculateTimelineCoverage(entries);
        isValid = hasContinuousCoverage;
        if (!hasContinuousCoverage) {
          errors['timeline'] = 'Timeline must have continuous coverage';
        }
      }
    }

    // For each field in the step config, validate the value
    for (const field of stepConfig.fields) {
      const value = values[field.id];
      const error = this.validateField(field, value);
      if (error) {
        errors[field.id] = error;
        isValid = false;
      }
    }

    return { isValid, errors };
  }

  private validateField(field: FormField, value: FormValue): string {
    // Skip validation for optional fields that are empty
    if (!field.required && (value === undefined || value === null || value === '')) {
      return '';
    }

    // Required field validation
    if (field.required && (value === undefined || value === null || value === '')) {
      return `${field.label} is required`;
    }

    // Apply validation rules if any
    if (field.validation) {
      for (const rule of field.validation) {
        const error = this.applyValidationRule(rule, value);
        if (error) {
          return error;
        }
      }
    }

    return '';
  }

  private applyValidationRule(rule: ValidationRule, value: FormValue): string {
    switch (rule.type) {
      case 'required':
        return !value ? rule.message : '';
      case 'pattern':
        if (!rule.value || !(rule.value instanceof RegExp) || !isString(value)) return '';
        return value && !rule.value.test(value) ? rule.message : '';
      case 'minLength':
        if (typeof rule.value !== 'number' || !isString(value)) return '';
        return value.length < rule.value ? rule.message : '';
      case 'maxLength':
        if (typeof rule.value !== 'number' || !isString(value)) return '';
        return value.length > rule.value ? rule.message : '';
      default:
        return '';
    }
  }

  // Timeline Methods
  private calculateTimelineCoverage(entries: TimelineEntry[]): { totalYears: number; hasContinuousCoverage: boolean } {
    if (!entries || entries.length === 0) return { totalYears: 0, hasContinuousCoverage: false };

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
    const currentStep = this.getCurrentStep();
    if (!currentStep) return false;

    // Special case for education step
    if (this.state.currentStep === 'education') {
      const stepValues = this.state.values.education;
      const educationValues = stepValues as EducationStepValues;
      
      // Must have highest education level
      if (!educationValues.highestLevel) {
        console.log('No highest education level set');
        return false;
      }

      // If college or higher, must have at least one entry
      const collegeOrHigher = isCollegeOrHigher(educationValues.highestLevel);
      
      if (collegeOrHigher) {
        const entries = educationValues.entries;
        const hasEntries = isTimelineEntryArray(entries) && entries.length > 0;
        
        if (entries && isTimelineEntryArray(entries)) {
          console.log('Entries array:', entries);
          console.log('Entries length:', entries.length);
        } else {
          console.log('Entries is not a valid TimelineEntry array');
        }
        
        return hasEntries;
      }
      
      return true;
    }
    
    return currentStep.isValid && currentStep.isComplete;
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

  private checkStepCompletion(stepId: FormStepId, stepValues: FormStepValues, isValid: boolean): boolean {
    console.log('Checking step completion for:', stepId);
    console.log('Values:', stepValues);
    console.log('Is valid:', isValid);
    
    // For consents step, completion is based on having all required consents
    if (stepId === 'consents') {
      const values = stepValues as ConsentsStepValues;
      const config = values._config;
      if (config?.consentsRequired) {
        const hasAllRequiredConsents = Object.entries(config.consentsRequired).every(([key, required]) => {
          if (!required) return true;
          const consentField = `${key}Consent` as keyof ConsentsStepValues;
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
      const value = stepValues[fieldId];
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