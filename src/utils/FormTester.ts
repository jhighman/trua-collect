import { FormConfigGenerator } from './FormConfigGenerator';
import { FormStateManager } from './FormStateManager';
import { parseCollectionKey, getRequirements } from './collectionKeyParser';
import { FormLogger } from './FormLogger';

/**
 * Utility to test the form flow without using the browser
 * This simulates the form flow and logs the state at each step
 */
export class FormTester {
  private formManager: FormStateManager;
  private collectionKey: string;
  private requirements: ReturnType<typeof getRequirements>;

  /**
   * Create a new FormTester instance
   * @param collectionKey The collection key to use for testing
   */
  constructor(collectionKey: string) {
    this.collectionKey = collectionKey;
    this.requirements = getRequirements(collectionKey);
    
    // Generate form config based on requirements
    const config = FormConfigGenerator.generateFormConfig(this.requirements);
    
    // Create form manager
    this.formManager = new FormStateManager(config);
    
    // Log initial state
    this.logState('Initial state');
  }

  /**
   * Get the current form state
   * @returns The current form state
   */
  public getState() {
    return this.formManager.getState();
  }

  /**
   * Get the navigation state
   * @returns The navigation state
   */
  public getNavigationState() {
    return this.formManager.getNavigationState();
  }

  /**
   * Move to the next step in the form
   * @returns The updated form state
   */
  public moveToNextStep() {
    const navigationState = this.formManager.getNavigationState();
    const currentStepIndex = navigationState.availableSteps.indexOf(this.formManager.getState().currentStep);
    
    if (currentStepIndex < navigationState.availableSteps.length - 1) {
      const nextStep = navigationState.availableSteps[currentStepIndex + 1];
      this.formManager.moveToStep(nextStep);
      this.logState(`Moved to step: ${nextStep}`);
    } else {
      console.log('Already at the last step');
    }
    
    return this.formManager.getState();
  }

  /**
   * Move to the previous step in the form
   * @returns The updated form state
   */
  public moveToPreviousStep() {
    const navigationState = this.formManager.getNavigationState();
    const currentStepIndex = navigationState.availableSteps.indexOf(this.formManager.getState().currentStep);
    
    if (currentStepIndex > 0) {
      const previousStep = navigationState.availableSteps[currentStepIndex - 1];
      this.formManager.moveToStep(previousStep);
      this.logState(`Moved to step: ${previousStep}`);
    } else {
      console.log('Already at the first step');
    }
    
    return this.formManager.getState();
  }

  /**
   * Set a value in the current step
   * @param fieldId The field ID to set
   * @param value The value to set
   * @returns The updated form state
   */
  public setValue(fieldId: string, value: unknown) {
    const currentStep = this.formManager.getState().currentStep;
    this.formManager.setValue(currentStep, fieldId, value);
    this.logState(`Set value for ${currentStep}.${fieldId}: ${JSON.stringify(value)}`);
    return this.formManager.getState();
  }

  /**
   * Add a timeline entry to the current step
   * @param entry The timeline entry to add
   * @returns The updated form state
   */
  public addTimelineEntry(entry: Record<string, unknown>) {
    const currentStep = this.formManager.getState().currentStep;
    const currentEntries = this.formManager.getState().steps[currentStep]?.values.entries || [];
    this.formManager.setValue(currentStep, 'entries', [...currentEntries, entry]);
    this.logState(`Added timeline entry to ${currentStep}`);
    return this.formManager.getState();
  }

  /**
   * Run through the entire form flow automatically
   * This simulates a user filling out the form and navigating through all steps
   * @param formData Optional form data to use for filling out the form
   */
  public runFormFlow(formData?: Record<string, unknown>) {
    console.log('Running form flow with collection key:', this.collectionKey);
    console.log('Requirements:', JSON.stringify(this.requirements, null, 2));
    
    const navigationState = this.formManager.getNavigationState();
    console.log('Available steps:', navigationState.availableSteps);
    
    // Fill out personal info step
    this.setValue('fullName', formData?.fullName || 'Test User');
    this.setValue('email', formData?.email || 'test@example.com');
    
    // Move through all steps
    while (this.formManager.getNavigationState().canMoveNext) {
      this.moveToNextStep();
      
      // Fill out step-specific data
      const currentStep = this.formManager.getState().currentStep;
      
      if (currentStep === 'consents') {
        if (this.requirements.consents_required.driver_license) {
          this.setValue('driverLicenseConsent', true);
        }
        if (this.requirements.consents_required.drug_test) {
          this.setValue('drugTestConsent', true);
        }
        if (this.requirements.consents_required.biometric) {
          this.setValue('biometricConsent', true);
        }
      }
      
      // Add more step-specific data handling as needed
    }
    
    console.log('Form flow completed');
    return this.formManager.getState();
  }

  /**
   * Log the current state to the console and localStorage
   * @param message Optional message to include in the log
   */
  private logState(message?: string) {
    if (message) {
      console.log(message);
    }
    
    FormLogger.logFormState(
      this.formManager.getState(),
      this.collectionKey,
      { message }
    );
  }
}

// Example usage:
// const tester = new FormTester('en000111100100');
// tester.runFormFlow();