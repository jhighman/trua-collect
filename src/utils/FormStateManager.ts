import { FormConfig, FormStepId, FormField } from './FormConfigGenerator';
import type { ValidationRule } from './FormConfigGenerator';
import { EducationLevel, isCollegeOrHigher } from '../types/EducationLevel';
import { FormState, StepState } from '../types/form';

// Types
export interface TimelineEntry {
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
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

export type FormStepValues = Record<string, unknown>;

export interface EducationStepValues {
  school?: string;
  degree?: string;
  major?: string;
  highestLevel?: EducationLevel;
  entries?: TimelineEntry[];
}

export interface PersonalInfoValues {
  name?: string;
  email?: string;
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

export type FormValue = string | number | boolean | EducationStepValues | PersonalInfoValues | TimelineEntry[] | Record<string, unknown> | null;

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

// Type guards
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isTimelineEntryArray(value: unknown): value is TimelineEntry[] {
  return Array.isArray(value) && value.every(entry =>
    typeof entry === 'object' &&
    entry !== null &&
    'startDate' in entry &&
    'endDate' in entry &&
    'isCurrent' in entry
  );
}

function isFormValue(value: unknown): value is FormValue {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return true;
  if (isTimelineEntryArray(value)) return true;
  if (typeof value === 'object' && value !== null) {
    return true;
  }
  return false;
}

// FormStateManager Class
export class FormStateManager {
  private config: FormConfig;
  private state: FormState;
  private isInitialized: boolean;
  private readonly listeners: Array<() => void>;
  private readonly logger: (message: string) => void;

  constructor(config: FormConfig, logger?: (message: string) => void) {
    this.config = config;
    this.listeners = [];
    this.isInitialized = false;
    
    // Initialize logger first, before any other operations that might use it
    this.logger = typeof logger === 'function' ? logger : () => {};
    
    // Now initialize state
    this.state = this.initializeState();
    this.isInitialized = true;
  }

  public updateConfig(config: FormConfig): void {
    this.logger('FormStateManager: Updating config with new initialStep: ' + config.initialStep);

    const currentState = this.state;
    this.config = config;
    const newState = this.initializeState();

    if (currentState && currentState.steps) {
      this.logger('FormStateManager: Preserving state from previous state');
      Object.keys(currentState.steps).forEach(stepId => {
        const step = stepId as FormStepId;
        if (currentState.steps[step]) {
          this.logger(`FormStateManager: Preserving step: ${step}`);
          newState.steps[step] = {
            ...currentState.steps[step],
            isValid: currentState.steps[step]!.isValid,
            isComplete: currentState.steps[step]!.isComplete,
            errors: { ...currentState.steps[step]!.errors },
            values: isFormValue(currentState.steps[step]!.values) && typeof currentState.steps[step]!.values === 'object' && currentState.steps[step]!.values !== null
              ? { ...currentState.steps[step]!.values }
              : currentState.steps[step]!.values,
            touched: new Set(currentState.steps[step]!.touched),
            _initialized: currentState.steps[step]!._initialized,
            _complete: currentState.steps[step]!._complete,
            _config: currentState.steps[step]!._config ? { ...currentState.steps[step]!._config } : undefined,
          };
        }
      });
    }

    newState.currentStepId = currentState?.currentStepId || config.initialStep;
    this.logger('FormStateManager: Setting current step to: ' + newState.currentStepId);
    this.state = newState;
    this.notifyListeners();
  }

  private initializeState(): FormState {
    this.logger('FormStateManager: Initializing state');

    if (this.isInitialized && this.state) {
      this.logger('FormStateManager: Already initialized, preserving current state');
      return this.state;
    }

    const initialSteps: Record<FormStepId, StepState> = {
      'personal-info': this.createStepState(),
      'education': this.createStepState(),
      'residence-history': this.createStepState(),
      'employment-history': this.createStepState(),
      'professional-licenses': this.createStepState(),
      'consents': this.createStepState(),
      'signature': this.createStepState()
    };

    return {
      currentStepId: this.config.initialStep,
      steps: initialSteps,
      completedSteps: [],
      isSubmitting: false,
      isComplete: false
    };
  }

  public getState(): FormState {
    return { ...this.state };
  }

  public getCurrentStep(): StepState {
    return this.state.steps[this.state.currentStepId];
  }

  private initializeStepState(stepId: FormStepId): StepState {
    if (!this.state.steps[stepId]) {
      this.state.steps[stepId] = this.createStepState();
    }
    return this.state.steps[stepId];
  }

  setValue(stepId: FormStepId, fieldId: string, value: FormValue): void {
    const step = this.initializeStepState(stepId);

    if (fieldId === '_config') {
      step._config = value as Record<string, unknown>;
    } else if (fieldId.startsWith('_')) {
      switch (fieldId) {
        case '_initialized':
        case '_complete':
          step[fieldId] = Boolean(value);
          break;
        default:
          throw new Error(`Invalid special field: ${fieldId}`);
      }
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      step.values = { ...(step.values as Record<string, unknown>), ...(value as Record<string, unknown>) };
    } else {
      (step.values as Record<string, unknown>)[fieldId] = value;
    }

    const result = this.validateStep(stepId, step.values as FormStepValues);
    step.isValid = result.isValid;
    step.errors = result.errors;

    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  public getNavigationState(): NavigationState {
    const currentStepIndex = this.config.steps.findIndex(s => s.id === this.state.currentStepId);
    const completedSteps = this.getCompletedSteps();

    return {
      canMoveNext: this.canMoveNext(),
      canMovePrevious: currentStepIndex > 0,
      availableSteps: this.getAvailableSteps(),
      completedSteps,
    };
  }

  public forceSetCurrentStep(stepId: FormStepId): FormState {
    this.logger('FormStateManager: Force setting current step to: ' + stepId);
    return this.moveToStep(stepId);
  }

  public moveToStep(stepId: FormStepId): FormState {
    this.logger('FormStateManager: Moving to step: ' + stepId);

    this.config.steps.forEach(step => {
      if (!this.state.steps[step.id]) {
        this.state.steps[step.id] = this.createStepState();
      }
    });

    this.state = {
      ...this.state,
      currentStepId: stepId,
    };

    this.notifyListeners();
    return this.getState();
  }

  public canNavigateToStep(_stepId: FormStepId): boolean {
    return true;
  }

  // Overloaded validateStep
  public validateStep(stepId: FormStepId, values: FormStepValues): ValidationResult;
  public validateStep(stepId: FormStepId): boolean;
  public validateStep(stepId: FormStepId, values?: FormStepValues): ValidationResult | boolean {
    if (values) {
      // Logic from the original private validateStep
      const stepConfig = this.config.steps.find(step => step.id === stepId);
      if (!stepConfig) {
        return { isValid: false, errors: {} };
      }

      const errors: Record<string, string> = {};
      let isValid = true;

      if (stepId === 'consents') {
        const config = values._config as ConsentsConfig | undefined;
        if (config?.consentsRequired) {
          const hasAllRequiredConsents = Object.entries(config.consentsRequired).every(([key, required]) => {
            if (!required) return true;
            const consentField = `${key}Consent` as keyof ConsentsStepValues;
            return (values as ConsentsStepValues)[consentField] === true;
          });
          isValid = hasAllRequiredConsents;
          if (!hasAllRequiredConsents) {
            errors['consents'] = 'All required consents must be provided';
          }
        }
      }

      if (stepId === 'residence-history' || stepId === 'employment-history' || stepId === 'education') {
        const entries = values.entries as TimelineEntry[] | undefined;
        if (entries) {
          const { hasContinuousCoverage } = this.calculateTimelineCoverage(entries);
          isValid = isValid && hasContinuousCoverage;
          if (!hasContinuousCoverage) {
            errors['timeline'] = 'Timeline must have continuous coverage';
          }
        }
      }

      for (const field of stepConfig.fields) {
        const value = (values as Record<string, unknown>)[field.id] as FormValue;
        const error = this.validateField(field, value);
        if (error) {
          errors[field.id] = error;
          isValid = false;
        }
      }

      return { isValid, errors };
    } else {
      // Logic from the original public validateStep
      const step = this.state.steps[stepId];
      if (!step) return false;
      const result = this.validateStep(stepId, step.values as FormStepValues); // Recursive call with values
      step.isValid = result.isValid;
      step.errors = result.errors;
      step._initialized = true;
      return result.isValid;
    }
  }

  private validateField(field: FormField, value: FormValue): string {
    if (!field.required && (value === undefined || value === null || (isString(value) && value === ''))) {
      return '';
    }

    if (field.required && (value === undefined || value === null || (isString(value) && value === ''))) {
      return `${field.label} is required`;
    }

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

  private calculateTimelineCoverage(entries: TimelineEntry[]): { totalYears: number; hasContinuousCoverage: boolean } {
    if (!entries || entries.length === 0) return { totalYears: 0, hasContinuousCoverage: false };

    const today = new Date();
    const requiredStartDate = new Date();
    requiredStartDate.setFullYear(today.getFullYear() - 5);

    const sortedEntries = [...entries].sort((a, b) =>
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    const mostRecentEntry = sortedEntries[0];
    const mostRecentEnd = mostRecentEntry.isCurrent ? today : new Date(mostRecentEntry.endDate!);
    if (mostRecentEnd < today) {
      return { totalYears: 0, hasContinuousCoverage: false };
    }

    let currentDate = today;
    let totalYears = 0;

    for (const entry of sortedEntries) {
      const start = new Date(entry.startDate);
      const end = entry.isCurrent ? today : new Date(entry.endDate!);

      if (start > currentDate) {
        return { totalYears, hasContinuousCoverage: false };
      }

      const entryYears = (Math.min(end.getTime(), currentDate.getTime()) - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      totalYears += entryYears;
      currentDate = start;

      if (start <= requiredStartDate) {
        return { totalYears, hasContinuousCoverage: true };
      }
    }

    return { totalYears, hasContinuousCoverage: false };
  }

  private canMoveNext(): boolean {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return false;

    if (this.state.currentStepId === 'education') {
      const educationValues = currentStep.values as EducationStepValues;
      if (!educationValues.highestLevel) {
        this.logger('No highest education level set');
        return false;
      }

      const collegeOrHigher = isCollegeOrHigher(educationValues.highestLevel);
      if (collegeOrHigher) {
        const entries = educationValues.entries;
        const hasEntries = isTimelineEntryArray(entries) && entries.length > 0;
        return hasEntries;
      }

      return true;
    }

    return currentStep.isValid && currentStep.isComplete;
  }

  private getAvailableSteps(): FormStepId[] {
    return this.config.steps.filter(step => step.enabled).map(step => step.id);
  }

  private getCompletedSteps(): FormStepId[] {
    return Object.entries(this.state.steps)
      .filter(([_, step]) => step.isComplete)
      .map(([id]) => id as FormStepId);
  }

  private checkStepCompletion(stepId: FormStepId, stepValues: FormStepValues, isValid: boolean): boolean {
    if (stepId === 'consents') {
      const values = stepValues as ConsentsStepValues;
      const config = values._config;
      if (config?.consentsRequired) {
        const hasAllRequiredConsents = Object.entries(config.consentsRequired).every(([key, required]) => {
          if (!required) return true;
          const consentField = `${key}Consent` as keyof ConsentsStepValues;
          return values[consentField] === true;
        });
        return hasAllRequiredConsents && isValid;
      }
    }

    const stepConfig = this.config.steps.find(s => s.id === stepId);
    const requiredFields = stepConfig?.fields
      .filter(field => field.required)
      .map(field => field.id) || [];

    const hasAllRequiredFields = requiredFields.every(fieldId => {
      const value = (stepValues as Record<string, unknown>)[fieldId];
      if (typeof value === 'boolean') return value === true;
      return value !== undefined && value !== null && (isString(value) ? value !== '' : true);
    });

    return hasAllRequiredFields && isValid;
  }

  getStepState(stepId: FormStepId): StepState {
    return this.initializeStepState(stepId);
  }

  getStepValue(stepId: FormStepId, fieldId: string): unknown {
    const step = this.state.steps[stepId];
    if (!step) return undefined;
    return (step.values as Record<string, unknown>)[fieldId];
  }

  isStepComplete(stepId: FormStepId): boolean {
    const step = this.state.steps[stepId];
    return Boolean(step?.isComplete);
  }

  getNextStepId(currentStepId: FormStepId): FormStepId | null {
    const currentStep = this.state.steps[currentStepId];
    if (!currentStep.isComplete) return null;

    const stepOrder: FormStepId[] = [
      'personal-info',
      'education',
      'residence-history',
      'employment-history',
    ];

    const currentIndex = stepOrder.indexOf(currentStepId);
    return currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : null;
  }

  public processStep(stepId: FormStepId, processor: (step: StepState) => void): void {
    this.processStepData(stepId, processor);
  }

  private processStepData(stepId: FormStepId, processor: (step: StepState) => void): void {
    const step = this.state.steps[stepId];
    if (step) {
      processor(step);
    }
  }

  updateStepState(stepId: FormStepId, updates: Partial<StepState>): void {
    const step = this.initializeStepState(stepId);
    Object.assign(step, updates);
    this.notifyListeners();
  }

  isStepValid(stepId: FormStepId): boolean {
    const step = this.state.steps[stepId];
    return Boolean(step?.isValid);
  }

  addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: () => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private createStepState(): StepState {
    return {
      isValid: false,
      isComplete: false,
      errors: {},
      values: {},
      touched: new Set<string>(),
      _initialized: false,
      _complete: false,
    };
  }
}