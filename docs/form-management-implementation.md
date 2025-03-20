# Form Management System Implementation

This document outlines the implementation of the Form Management system, which provides the core functionality for managing form state, validation, navigation, and configuration in the Trua Collect application.

## Overview

The Form Management system is a comprehensive solution for handling complex multi-step forms with dynamic configuration, validation, and state management. It provides a centralized way to manage form data, validate inputs, control navigation between steps, and configure the form based on requirements.

The system is designed to be flexible and extensible, allowing for different form configurations based on the specific requirements of each form instance. It supports features like conditional step visibility, dynamic validation rules, and timeline-based validation for history entries.

## Implementation Details

### Architecture

The Form Management system follows a context-based architecture with the following key components:

1. **FormContext**: React context provider that exposes form state and methods to components
2. **FormStateManager**: Core class that manages form state, validation, and navigation
3. **FormConfigGenerator**: Utility for generating form configuration based on requirements
4. **collectionKeyParser**: Utility for parsing collection keys to determine requirements

These components work together to provide a complete form management solution:

- **FormContext** provides the interface for components to interact with the form state
- **FormStateManager** handles the internal state management and business logic
- **FormConfigGenerator** creates the initial configuration based on requirements
- **collectionKeyParser** determines the requirements based on collection keys

### Files Created/Modified

- `src/context/FormContext.tsx`: React context provider for form state
- `src/utils/FormStateManager.ts`: Core form state management class
- `src/utils/FormConfigGenerator.ts`: Form configuration generator
- `src/utils/collectionKeyParser.ts`: Collection key parser for determining requirements

### Component API

#### FormContext

```typescript
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
  addTimelineEntry: (stepId: FormStepId, entry: any) => void;
  updateTimelineEntry: (stepId: FormStepId, index: number, entry: any) => void;
  removeTimelineEntry: (stepId: FormStepId, index: number) => void;
  getTimelineEntries: (stepId: FormStepId) => any[];
  
  // Form submission
  formErrors: Record<string, string>;
  submitForm: () => Promise<void>;
}
```

#### FormStateManager

```typescript
export class FormStateManager {
  constructor(config: FormConfig);
  
  // State management
  getState(): FormState;
  getCurrentStep(): FormStepState;
  setValue(stepId: FormStepId, fieldId: string, value: any): FormState;
  
  // Navigation
  getNavigationState(): NavigationState;
  moveToStep(stepId: FormStepId): FormState;
  
  // Validation
  validateStep(stepId: FormStepId, values: FormValue): ValidationResult;
  validateField(field: FormField, value: any): string | null;
}
```

#### FormConfigGenerator

```typescript
export class FormConfigGenerator {
  static generateFormConfig(requirements: Requirements): FormConfig;
}
```

#### collectionKeyParser

```typescript
export function getRequirements(collectionKey: string): Requirements;
```

### Key Features

1. **Dynamic Form Configuration**:
   - Form steps are dynamically configured based on requirements
   - Steps can be enabled or disabled based on configuration
   - Validation rules are defined in the configuration
   - Required fields are specified in the configuration

2. **Form State Management**:
   - Centralized state management for all form data
   - Step-based organization of form values
   - Tracking of touched fields for validation
   - Error tracking for each field and step

3. **Form Navigation**:
   - Control of navigation between steps
   - Prevention of navigation to invalid steps
   - Tracking of completed steps
   - Support for non-linear navigation when allowed

4. **Validation System**:
   - Field-level validation based on rules
   - Step-level validation for complex validations
   - Timeline validation for history entries
   - Real-time validation as values change

5. **Timeline Entry Management**:
   - Support for adding, updating, and removing timeline entries
   - Calculation of timeline coverage
   - Detection of gaps in timeline
   - Validation of timeline coverage against requirements

6. **Form Submission**:
   - Validation of all steps before submission
   - Collection of all form data for submission
   - Error handling for submission failures
   - Support for asynchronous submission

### Integration with Components

The Form Management system integrates with the application's components through the FormContext:

1. **Form Steps**: Each step component (e.g., PersonalInfoStep, ResidenceHistoryStep) uses the FormContext to:
   - Get and set values
   - Check validation status
   - Control navigation
   - Manage timeline entries

2. **Timeline Component**: The Timeline component uses the FormContext to:
   - Display timeline entries
   - Calculate coverage
   - Show gaps in history
   - Validate against requirements

3. **Entry Components**: Entry components (e.g., ResidenceEntry, EmploymentEntry) use the FormContext indirectly through their parent step components to:
   - Update entry data
   - Validate entry data
   - Calculate duration

### Form Configuration

The form is configured based on requirements parsed from collection keys. The configuration includes:

1. **Steps Configuration**:
   - Which steps are enabled
   - Order of steps
   - Required fields in each step
   - Validation rules for each step

2. **Timeline Requirements**:
   - Required years of history
   - Required verifications for each type of history

3. **Consent Requirements**:
   - Which consents are required
   - Validation rules for consents

### Validation System

The validation system is a key part of the Form Management system and includes:

1. **Field Validation**:
   - Required field validation
   - Pattern validation (regex)
   - Min/max length validation
   - Custom validation rules

2. **Step Validation**:
   - Validation of all required fields
   - Complex validations across multiple fields
   - Timeline coverage validation

3. **Form Validation**:
   - Validation of all steps
   - Cross-step validations
   - Overall form validity check

### Error Handling

The Form Management system includes comprehensive error handling:

1. **Field Errors**:
   - Tracking of errors for each field
   - Display of error messages
   - Visual indication of errors

2. **Step Errors**:
   - Tracking of errors for each step
   - Prevention of navigation when steps are invalid
   - Visual indication of step validity

3. **Submission Errors**:
   - Handling of submission failures
   - Display of submission error messages
   - Prevention of submission when form is invalid

## Testing

The Form Management system is tested through:

1. **Unit Tests**:
   - Tests for FormStateManager
   - Tests for FormConfigGenerator
   - Tests for collectionKeyParser

2. **Integration Tests**:
   - Tests for FormContext with components
   - Tests for form navigation
   - Tests for form validation

3. **Component Tests**:
   - Tests for each form step component
   - Tests for timeline component
   - Tests for entry components

## Future Enhancements

Potential future enhancements for the Form Management system:

1. **Form State Persistence**: Save form state to local storage or server for resuming later
2. **Form Versioning**: Support for different versions of the form configuration
3. **Conditional Fields**: Support for fields that appear based on other field values
4. **Advanced Validation**: More sophisticated validation rules and cross-field validations
5. **Form Analytics**: Tracking of form completion metrics and user behavior
6. **Multi-page Steps**: Support for steps that span multiple pages
7. **Wizard-style Navigation**: Alternative navigation styles for different use cases
8. **Form Templates**: Support for saving and loading form templates

## Conclusion

The Form Management system provides a robust foundation for the Trua Collect application's form functionality. It handles the complexity of multi-step forms with dynamic configuration, validation, and state management, allowing the application to collect comprehensive information in a user-friendly way.

The system's modular design and clear separation of concerns make it maintainable and extensible, allowing for future enhancements and adaptations to changing requirements.