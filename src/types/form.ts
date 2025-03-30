export type FormStepId = 
  | 'personal-info'
  | 'education'
  | 'residence-history'
  | 'employment-history'
  | 'professional-licenses'
  | 'consents'
  | 'signature';

export interface StepState {
  isValid: boolean;
  isComplete: boolean;
  errors: Record<string, string>;
  values: Record<string, unknown>;
  touched: Set<string>;
  _initialized: boolean;
  _complete: boolean;
  _config?: Record<string, unknown>;
}

export interface FormState {
  steps: Record<FormStepId, StepState>;
  currentStepId: FormStepId;
  isSubmitting: boolean;
  isComplete: boolean;
  completedSteps: FormStepId[];
} 