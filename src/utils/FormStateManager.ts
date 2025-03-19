import { FormConfig, FormStepId, FormStep, FormField, ValidationRule } from './FormConfigGenerator';

// Types
export interface FormValue {
  [key: string]: any;
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

  constructor(config: FormConfig) {
    this.config = config;
    this.state = this.initializeState();
  }

  private initializeState(): FormState {
    const steps = this.config.steps.reduce((acc, step) => ({
      ...acc,
      [step.id]: {
        id: step.id,
        values: {},
        touched: new Set<string>(),
        errors: {},
        isComplete: false,
        isValid: false
      }
    }), {});

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

  public setValue(stepId: FormStepId, fieldId: string, value: any): FormState {
    const step = this.state.steps[stepId]!;
    const newValues = { ...step.values, [fieldId]: value };
    const newTouched = new Set(step.touched).add(fieldId);
    const validationResult = this.validateStep(stepId, newValues);

    const newStep: FormStepState = {
      ...step,
      values: newValues,
      touched: newTouched,
      errors: validationResult.errors,
      isValid: validationResult.isValid,
      isComplete: this.checkStepCompletion(stepId, newValues, validationResult.isValid)
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

  public moveToStep(stepId: FormStepId): FormState {
    if (!this.canNavigateToStep(stepId)) {
      throw new Error(`Cannot navigate to step: ${stepId}`);
    }

    this.state = {
      ...this.state,
      currentStep: stepId
    };

    return this.getState();
  }

  // Validation Methods
  private validateStep(stepId: FormStepId, values: FormValue): ValidationResult {
    const step = this.config.steps.find(s => s.id === stepId)!;
    const errors: { [key: string]: string } = {};

    step.fields.forEach(field => {
      const fieldError = this.validateField(field, values[field.id]);
      if (fieldError) {
        errors[field.id] = fieldError;
      }
    });

    // Additional step-specific validation
    if (step.validationRules) {
      const { requiredYears } = step.validationRules;
      if (requiredYears && ['residence-history', 'employment-history'].includes(stepId)) {
        const timelineCoverage = this.calculateTimelineCoverage(values.entries || []);
        if (timelineCoverage < requiredYears) {
          errors._timeline = `Must account for ${requiredYears} years`;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  private validateField(field: FormField, value: any): string | null {
    for (const rule of field.validation) {
      const error = this.applyValidationRule(rule, value);
      if (error) return error;
    }
    return null;
  }

  private applyValidationRule(rule: ValidationRule, value: any): string | null {
    switch (rule.type) {
      case 'required':
        return !value ? rule.message : null;
      case 'pattern':
        return value && !rule.value.test(value) ? rule.message : null;
      case 'minLength':
        return value && value.length < rule.value ? rule.message : null;
      case 'maxLength':
        return value && value.length > rule.value ? rule.message : null;
      default:
        return null;
    }
  }

  // Timeline Methods
  private calculateTimelineCoverage(entries: TimelineEntry[]): number {
    if (!entries.length) return 0;

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    let totalYears = 0;
    let latestEnd: Date | null = null;

    sortedEntries.forEach(entry => {
      const start = new Date(entry.startDate);
      const end = entry.isCurrent ? new Date() : new Date(entry.endDate!);

      if (!latestEnd || start > latestEnd) {
        // No overlap, add full duration
        totalYears += (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      } else if (end > latestEnd) {
        // Partial overlap, add only the non-overlapping part
        totalYears += (end.getTime() - latestEnd.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      }

      if (!latestEnd || end > latestEnd) {
        latestEnd = end;
      }
    });

    return totalYears;
  }

  // Helper Methods
  private canMoveNext(): boolean {
    const currentStepIndex = this.config.steps.findIndex(s => s.id === this.state.currentStep);
    if (currentStepIndex === this.config.steps.length - 1) return false;

    const currentStep = this.state.steps[this.state.currentStep]!;
    return currentStep.isValid && currentStep.isComplete;
  }

  private canNavigateToStep(stepId: FormStepId): boolean {
    const targetStep = this.config.steps.find(s => s.id === stepId)!;
    const currentStepIndex = this.config.steps.findIndex(s => s.id === this.state.currentStep);
    const targetStepIndex = this.config.steps.findIndex(s => s.id === stepId);

    // Can always move backwards
    if (targetStepIndex < currentStepIndex) return true;

    // Can't skip required steps
    for (let i = 0; i < targetStepIndex; i++) {
      const stepId = this.config.steps[i].id;
      const step = this.state.steps[stepId]!;
      if (!step.isComplete && this.config.navigation.requiredSteps.includes(stepId)) {
        return false;
      }
    }

    return true;
  }

  private getAvailableSteps(): FormStepId[] {
    return this.config.steps
      .filter(step => step.enabled)
      .map(step => step.id);
  }

  private getCompletedSteps(): FormStepId[] {
    return Object.entries(this.state.steps)
      .filter(([_, step]) => step.isComplete)
      .map(([id]) => id as FormStepId);
  }

  private checkStepCompletion(
    stepId: FormStepId,
    values: FormValue,
    isValid: boolean
  ): boolean {
    if (!isValid) return false;

    const step = this.config.steps.find(s => s.id === stepId)!;
    
    // Check if all required fields have values
    const hasAllRequiredFields = step.fields
      .filter(field => field.required)
      .every(field => values[field.id]);

    // Check timeline coverage if applicable
    if (step.validationRules?.requiredYears) {
      const coverage = this.calculateTimelineCoverage(values.entries || []);
      return hasAllRequiredFields && coverage >= step.validationRules.requiredYears;
    }

    return hasAllRequiredFields;
  }
} 