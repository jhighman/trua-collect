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
    
    // Save the current step before updating
    const currentStep = this.state.currentStep;
    console.log('FormStateManager: Current step before update:', currentStep);
    
    // Update the config
    this.config = config;
    
    // Preserve the current state if possible
    const currentState = this.state;
    
    // Reinitialize with the new config
    this.state = this.initializeState();
    
    // If we had a previous state, try to preserve completed steps
    if (currentState && currentState.steps) {
      console.log('FormStateManager: Preserving completed steps from previous state');
      
      // Copy completed steps from the previous state
      Object.keys(currentState.steps).forEach(stepId => {
        const step = stepId as FormStepId;
        if (currentState.steps[step] && currentState.steps[step].isComplete) {
          console.log(`FormStateManager: Preserving completed step: ${step}`);
          this.state.steps[step] = { ...currentState.steps[step] };
        }
      });
    }
    
    // IMPORTANT: Keep the current step instead of resetting to the initialStep
    // Only use the initialStep if we don't have a current step
    if (currentStep) {
      this.state.currentStep = currentStep;
      console.log('FormStateManager: Preserved current step:', currentStep);
    } else {
      this.state.currentStep = config.initialStep;
      console.log('FormStateManager: Set to initial step:', config.initialStep);
    }
  }

  private initializeState(): FormState {
    console.log('VERBOSE: FormStateManager: Initializing state');
    
    // If already initialized, return the current state to prevent resetting
    if (this.isInitialized && this.state) {
      console.log('VERBOSE: FormStateManager: Already initialized, preserving current state');
      console.log('VERBOSE: FormStateManager: Current step:', this.state.currentStep);
      
      // Mark as initialized to prevent future re-initializations
      this.isInitialized = true;
      
      return this.state;
    }
    
    // Mark as initialized to prevent future re-initializations
    this.isInitialized = true;
    
    console.log('VERBOSE: FormStateManager: Config steps:', this.config.steps);
    
    // Check if we already have state to preserve
    const existingState = this.state;
    const hasExistingState = existingState && existingState.steps && Object.keys(existingState.steps).length > 0;
    
    if (hasExistingState) {
      console.log('VERBOSE: FormStateManager: Existing state found, preserving completed steps');
      console.log('VERBOSE: FormStateManager: Current step in existing state:', existingState.currentStep);
      console.log('VERBOSE: FormStateManager: Completed steps in existing state:',
        Object.entries(existingState.steps)
          .filter(([_, step]) => step && step.isComplete)
          .map(([id]) => id)
      );
    }
    
    // Only initialize steps that are enabled
    const enabledSteps = this.config.steps.filter(step => step.enabled);
    console.log('VERBOSE: FormStateManager: Enabled steps:', enabledSteps);
    
    const steps = enabledSteps.reduce((acc, step) => {
      // If we have existing state for this step and it's complete, preserve it
      const existingStepData = hasExistingState && existingState.steps ? existingState.steps[step.id] : undefined;
      if (existingStepData && existingStepData.isComplete) {
        console.log(`VERBOSE: FormStateManager: Preserving completed step ${step.id}`);
        return {
          ...acc,
          [step.id]: existingState.steps[step.id]
        };
      }
      
      // Otherwise initialize a new step
      console.log(`VERBOSE: FormStateManager: Initializing step ${step.id}`);
      
      // Safely get existing step values if they exist
      const existingStep = hasExistingState && existingState.steps ? existingState.steps[step.id] : null;
      
      return {
        ...acc,
        [step.id]: {
          id: step.id,
          values: existingStep ? existingStep.values : {},
          touched: existingStep ? existingStep.touched : new Set<string>(),
          errors: existingStep ? existingStep.errors : {},
          isComplete: existingStep ? existingStep.isComplete : false,
          isValid: existingStep ? existingStep.isValid : false
        }
      };
    }, {});
    
    console.log('VERBOSE: FormStateManager: Initialized steps:', Object.keys(steps));
    
    // Check if professional-licenses is in the initialized steps
    const isProfessionalLicensesInitialized = 'professional-licenses' in steps;
    console.log('VERBOSE: FormStateManager: Is professional-licenses initialized?', isProfessionalLicensesInitialized);

    // Preserve the current step if we have existing state
    const currentStep = hasExistingState ? existingState.currentStep : this.config.initialStep;
    console.log('VERBOSE: FormStateManager: Using current step:', currentStep);

    return {
      currentStep,
      steps,
      isSubmitting: hasExistingState ? existingState.isSubmitting : false,
      isComplete: hasExistingState ? existingState.isComplete : false
    };
  }

  // State Management Methods
  public getState(): FormState {
    return { ...this.state };
  }

  public getCurrentStep(): FormStepState {
    return { ...this.state.steps[this.state.currentStep]! };
  }

  public setValue(stepId: FormStepId, fieldId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any
  ): FormState {
    console.log(`Setting value for ${stepId}.${fieldId}:`, value);
    
    // Check if the step exists in the state
    if (!this.state.steps[stepId]) {
      console.log(`VERBOSE: FormStateManager: Step ${stepId} not found in state, checking if it's enabled`);
      
      // Check if the step is enabled in the config
      const stepConfig = this.config.steps.find(s => s.id === stepId);
      if (!stepConfig || !stepConfig.enabled) {
        console.log(`VERBOSE: FormStateManager: Step ${stepId} is not enabled, skipping setValue`);
        return this.getState();
      }
      
      // Initialize the step if it's enabled but not in the state
      console.log(`VERBOSE: FormStateManager: Initializing step ${stepId}`);
      this.state.steps[stepId] = {
        id: stepId,
        values: {},
        touched: new Set<string>(),
        errors: {},
        isComplete: false,
        isValid: false
      };
    }
    
    console.log(`Current step values before update:`, this.state.steps[stepId]?.values);
    console.log(`Current step touched before update:`, this.state.steps[stepId]?.touched);
    
    const step = this.state.steps[stepId]!;
    const newValues = { ...step.values, [fieldId]: value };
    const newTouched = new Set(step.touched).add(fieldId);
    
    console.log(`New values after update:`, newValues);
    console.log(`New touched after update:`, Array.from(newTouched));
    
    const validationResult = this.validateStep(stepId, newValues);
    console.log(`Validation result for ${stepId}:`, validationResult);

    const isComplete = this.checkStepCompletion(stepId, newValues, validationResult.isValid);
    console.log(`Step ${stepId} is complete:`, isComplete);

    const newStep: FormStepState = {
      ...step,
      values: newValues,
      touched: newTouched,
      errors: validationResult.errors,
      isValid: validationResult.isValid,
      isComplete: isComplete
    };

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
    console.log(`ForceSetCurrentStep: Changing current step from ${this.state.currentStep} to ${stepId}`);
    
    // Update the current step directly
    this.state = {
      ...this.state,
      currentStep: stepId
    };
    
    return this.getState();
  }

  public moveToStep(stepId: FormStepId): FormState {
    // Check if the step is in the available steps
    const availableSteps = this.getAvailableSteps();
    if (!availableSteps.includes(stepId)) {
      console.error(`Step ${stepId} is not in available steps:`, availableSteps);
      throw new Error(`Cannot navigate to step ${stepId}: Step is not in available steps`);
    }

    // Check if we can navigate to this step
    if (!this.canNavigateToStep(stepId)) {
      console.error(`Cannot navigate to step ${stepId} due to navigation rules - required steps not completed`);
      throw new Error(`Cannot navigate to step ${stepId}: Required previous steps are not complete`);
    }

    // Update the current step
    console.log(`Moving from step ${this.state.currentStep} to ${stepId}`);
    
    // Initialize the step if it doesn't exist in the state
    if (!this.state.steps[stepId]) {
      console.log(`Initializing step ${stepId} during navigation`);
      // Create a new steps object with the new step
      const updatedSteps = {
        ...this.state.steps,
        [stepId]: {
          id: stepId,
          values: {},
          touched: new Set<string>(),
          errors: {},
          isComplete: false,
          isValid: false
        }
      };
      
      // Update the entire state at once to ensure proper propagation
      this.state = {
        ...this.state,
        currentStep: stepId,
        steps: updatedSteps
      };
    } else {
      // Just update the current step if the step already exists
      this.state = {
        ...this.state,
        currentStep: stepId
      };
    }
    
    console.log(`Successfully moved to step ${stepId}`);

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
    
    // Special case for education step
    if (stepId === 'education') {
      console.log('Validating education step with values:', values);
      
      // Check if highest education level is set
      if (!values.highestLevel) {
        errors._education_level = 'Please select your highest level of education';
        console.log('Education validation failed: No highest level set');
      } else {
        console.log('Education level is set:', values.highestLevel);
        
        // Check if it's college or higher and requires entries
        const collegeOrHigher = isCollegeOrHigher(values.highestLevel as EducationLevel);
        console.log('Is college or higher:', collegeOrHigher);
        console.log('Entries:', values.entries);
        
        if (collegeOrHigher && (!values.entries || values.entries.length === 0)) {
          errors._education_entries = 'Please add at least one degree';
          console.log('Education validation failed: College education requires entries');
        } else {
          console.log('Education validation passed');
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
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

  private canNavigateToStep(stepId: FormStepId): boolean {
    // Find the indices of current and target steps
    const currentStepIndex = this.config.steps.findIndex(s => s.id === this.state.currentStep);
    const targetStepIndex = this.config.steps.findIndex(s => s.id === stepId);

    console.log(`Checking if can navigate from ${this.state.currentStep} (index ${currentStepIndex}) to ${stepId} (index ${targetStepIndex})`);

    // Can always move backwards
    if (targetStepIndex < currentStepIndex) {
      console.log('Moving backwards, navigation allowed');
      return true;
    }

    // For forward navigation, only check if the current step is complete
    // This is a key change - we're no longer checking all previous steps
    const currentStepState = this.state.steps[this.state.currentStep];
    
    if (!currentStepState) {
      console.log(`Current step ${this.state.currentStep} not found in state, cannot navigate`);
      return false;
    }
    
    if (!currentStepState.isComplete) {
      console.log(`Current step ${this.state.currentStep} is not complete, cannot navigate to ${stepId}`);
      return false;
    }
    
    // If the current step is complete, allow navigation to the next step
    console.log(`Current step ${this.state.currentStep} is complete, navigation to ${stepId} is allowed`);
    return true;
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

  private checkStepCompletion(
    stepId: FormStepId,
    values: FormValue,
    isValid: boolean
  ): boolean {
    console.log('Checking step completion for:', stepId);
    console.log('Values:', values);
    console.log('Is valid:', isValid);
    
    if (!isValid) {
      console.log('Step is not valid, returning false');
      return false;
    }

    const step = this.config.steps.find(s => s.id === stepId)!;
    console.log('Step config:', step);
    
    // Check if all required fields have values
    const requiredFields = step.fields.filter(field => field.required);
    console.log('Required fields:', requiredFields);
    
    const hasAllRequiredFields = requiredFields.every(field => {
      const hasValue = !!values[field.id];
      console.log(`Field ${field.id} has value: ${hasValue}`);
      return hasValue;
    });
    
    console.log('Has all required fields:', hasAllRequiredFields);

    // Check timeline coverage if applicable
    if (step.validationRules?.requiredYears) {
      const coverage = this.calculateTimelineCoverage(values.entries || []);
      const result = hasAllRequiredFields && coverage >= step.validationRules.requiredYears;
      console.log('Timeline coverage:', coverage, 'Required years:', step.validationRules.requiredYears);
      console.log('Step completion result:', result);
      return result;
    }
    
    // Special case for education step
    if (stepId === 'education') {
      console.log('Checking education step completion');
      console.log('Full values object:', values);
      
      // Must have highest education level
      if (!values.highestLevel) {
        console.log('No highest education level set, step not complete');
        return false;
      }
      
      console.log('Education level:', values.highestLevel);
      
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
        
        // Force the step to be complete if we have a highest level and it's not college or higher
        // or if it is college or higher and we have entries
        const isComplete = hasAllRequiredFields && hasEntries;
        console.log('Education step complete:', isComplete);
        
        // If not complete, log the reasons
        if (!isComplete) {
          console.log('Education step not complete because:');
          if (!hasAllRequiredFields) console.log('- Not all required fields are filled');
          if (!hasEntries) console.log('- No entries for college education');
        }
        
        return isComplete;
      }
      
      // For non-college, just need the education level
      console.log('Non-college education, step complete');
      const result = hasAllRequiredFields;
      console.log('Step completion result:', result);
      
      // If not complete, log the reasons
      if (!result) {
        console.log('Education step not complete because:');
        if (!hasAllRequiredFields) console.log('- Not all required fields are filled');
      }
      
      return result;
    }

    console.log('Default step completion result:', hasAllRequiredFields);
    return hasAllRequiredFields;
  }
} 