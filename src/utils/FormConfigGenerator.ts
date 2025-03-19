import { Requirements } from './collectionKeyParser';

// Input/Output Types
export type FormStepId = 
  | 'personal-info'
  | 'consents'
  | 'education'
  | 'professional-license'
  | 'residence-history'
  | 'employment-history'
  | 'signature';

export interface ValidationRule {
  type: 'required' | 'pattern' | 'minLength' | 'maxLength' | 'custom';
  value?: any;
  message: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'email' | 'tel' | 'date' | 'select' | 'checkbox' | 'textarea';
  label: string;
  required: boolean;
  validation: ValidationRule[];
}

export interface FormStep {
  id: FormStepId;
  title: string;
  enabled: boolean;
  required: boolean;
  order: number;
  fields: FormField[];
  validationRules?: {
    requiredYears?: number;
    requiredVerifications?: string[];
  };
}

export interface FormConfig {
  steps: FormStep[];
  initialStep: FormStepId;
  navigation: {
    allowSkip: boolean;
    allowPrevious: boolean;
    requiredSteps: FormStepId[];
  };
}

// Helper Functions
function generatePersonalInfoStep(): FormStep {
  return {
    id: 'personal-info',
    title: 'Personal Information',
    enabled: true,
    required: true,
    order: 1,
    fields: [
      {
        id: 'fullName',
        type: 'text',
        label: 'Full Name',
        required: true,
        validation: [
          { type: 'required', message: 'Full name is required' },
          { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
        ]
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email Address',
        required: true,
        validation: [
          { type: 'required', message: 'Email is required' },
          { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
        ]
      }
    ]
  };
}

function generateConsentsStep(requirements: Requirements): FormStep | null {
  const { driver_license, drug_test, biometric } = requirements.consents_required;
  
  if (!driver_license && !drug_test && !biometric) {
    return null;
  }

  const fields: FormField[] = [];

  if (driver_license) {
    fields.push({
      id: 'driverLicenseConsent',
      type: 'checkbox',
      label: 'Driver License Consent',
      required: true,
      validation: [
        { type: 'required', message: 'Driver license consent is required' }
      ]
    });
  }

  if (drug_test) {
    fields.push({
      id: 'drugTestConsent',
      type: 'checkbox',
      label: 'Drug Test Consent',
      required: true,
      validation: [
        { type: 'required', message: 'Drug test consent is required' }
      ]
    });
  }

  if (biometric) {
    fields.push({
      id: 'biometricConsent',
      type: 'checkbox',
      label: 'Biometric Consent',
      required: true,
      validation: [
        { type: 'required', message: 'Biometric consent is required' }
      ]
    });
  }

  return {
    id: 'consents',
    title: 'Required Consents',
    enabled: true,
    required: true,
    order: 2,
    fields
  };
}

// Main Generator Function
export function generateFormConfig(requirements: Requirements): FormConfig {
  const steps: FormStep[] = [];
  const requiredSteps: FormStepId[] = ['personal-info'];

  // Always add personal info step
  steps.push(generatePersonalInfoStep());

  // Add consents if required
  const consentsStep = generateConsentsStep(requirements);
  if (consentsStep) {
    steps.push(consentsStep);
    requiredSteps.push('consents');
  }

  // Add verification steps based on requirements
  const { verification_steps } = requirements;

  if (verification_steps.education.enabled) {
    steps.push({
      id: 'education',
      title: 'Education History',
      enabled: true,
      required: true,
      order: steps.length + 1,
      fields: [
        {
          id: 'institution',
          type: 'text',
          label: 'Institution Name',
          required: true,
          validation: [
            { type: 'required', message: 'Institution name is required' }
          ]
        },
        {
          id: 'degree',
          type: 'text',
          label: 'Degree',
          required: true,
          validation: [
            { type: 'required', message: 'Degree is required' }
          ]
        }
      ],
      validationRules: {
        requiredVerifications: verification_steps.education.required_verifications
      }
    });
    requiredSteps.push('education');
  }

  if (verification_steps.residence_history.enabled) {
    steps.push({
      id: 'residence-history',
      title: 'Residence History',
      enabled: true,
      required: true,
      order: steps.length + 1,
      fields: [],
      validationRules: {
        requiredYears: verification_steps.residence_history.years,
        requiredVerifications: verification_steps.residence_history.required_verifications
      }
    });
    requiredSteps.push('residence-history');
  }

  if (verification_steps.employment_history.enabled) {
    steps.push({
      id: 'employment-history',
      title: 'Employment History',
      enabled: true,
      required: true,
      order: steps.length + 1,
      fields: [],
      validationRules: {
        requiredYears: verification_steps.employment_history.years,
        requiredVerifications: verification_steps.employment_history.required_verifications
      }
    });
    requiredSteps.push('employment-history');
  }

  // Always add signature step last
  steps.push({
    id: 'signature',
    title: 'Review & Sign',
    enabled: true,
    required: true,
    order: steps.length + 1,
    fields: [
      {
        id: 'signature',
        type: 'text',
        label: 'Digital Signature',
        required: true,
        validation: [
          { type: 'required', message: 'Signature is required' }
        ]
      }
    ]
  });
  requiredSteps.push('signature');

  return {
    steps: steps.sort((a, b) => a.order - b.order),
    initialStep: 'personal-info',
    navigation: {
      allowSkip: false,
      allowPrevious: true,
      requiredSteps
    }
  };
} 