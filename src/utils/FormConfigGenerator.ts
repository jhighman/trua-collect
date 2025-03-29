import type { Requirements } from './collectionKeyParser';
import { getRequirements } from './collectionKeyParser';
import { getConfig } from './EnvironmentConfig';

// Input/Output Types (unchanged from original)
export type FormStepId = 
  | 'personal-info'
  | 'residence-history'
  | 'employment-history'
  | 'education'
  | 'professional-licenses'
  | 'consents'
  | 'signature';

export interface ValidationRule {
  type: 'required' | 'pattern' | 'minLength' | 'maxLength';
  message: string;
  value?: RegExp | number;
}

export interface FormField {
  id: string;
  type: string;
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
    requiredEmployers?: number;
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
function generatePersonalInfoStep(requirements: Requirements): FormStep | null {
  const personalInfo = requirements.verificationSteps.personalInfo;
  if (!personalInfo.enabled) return null;

  const { modes } = personalInfo;
  const fields: FormField[] = [];

  if (modes.email) {
    fields.push({
      id: 'email',
      type: 'email',
      label: 'Email Address',
      required: true,
      validation: [
        { type: 'required', message: 'Email is required' },
        { type: 'pattern', value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
      ]
    });
  }

  if (modes.phone) {
    fields.push({
      id: 'phone',
      type: 'tel',
      label: 'Phone Number',
      required: true,
      validation: [
        { type: 'required', message: 'Phone number is required' },
        { type: 'pattern', value: /^\d{10}$/, message: 'Phone number must be 10 digits' }
      ]
    });
  }

  if (modes.fullName) {
    fields.push({
      id: 'fullName',
      type: 'text',
      label: 'Full Name',
      required: true,
      validation: [
        { type: 'required', message: 'Full name is required' },
        { type: 'minLength', value: 2, message: 'Name must be at least 2 characters' }
      ]
    });
  }

  if (modes.nameAlias) {
    fields.push({
      id: 'nameAlias',
      type: 'text',
      label: 'Name Alias',
      required: false,
      validation: []
    });
  }

  return {
    id: 'personal-info',
    title: 'Personal Information',
    enabled: true,
    required: true,
    order: 1,
    fields
  };
}

function generateConsentsStep(requirements: Requirements): FormStep | null {
  const { driverLicense, drugTest, biometric } = requirements.consentsRequired;
  if (!driverLicense && !drugTest && !biometric) return null;

  const fields: FormField[] = [];

  if (driverLicense) {
    fields.push({
      id: 'driverLicenseConsent',
      type: 'checkbox',
      label: 'Driver License Consent',
      required: true,
      validation: [{ type: 'required', message: 'Driver license consent is required' }]
    });
  }

  if (drugTest) {
    fields.push({
      id: 'drugTestConsent',
      type: 'checkbox',
      label: 'Drug Test Consent',
      required: true,
      validation: [{ type: 'required', message: 'Drug test consent is required' }]
    });
  }

  if (biometric) {
    fields.push({
      id: 'biometricConsent',
      type: 'checkbox',
      label: 'Biometric Consent',
      required: true,
      validation: [{ type: 'required', message: 'Biometric consent is required' }]
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

function generateSignatureStep(requirements: Requirements): FormStep {
  const { signature } = requirements;
  const fields: FormField[] = [];

  if (signature.required) {
    fields.push({
      id: 'signature',
      type: signature.mode === 'wet' ? 'signature' : 'checkbox',
      label: signature.mode === 'wet' ? 'Digital Signature' : 'Signature Acknowledgment',
      required: true,
      validation: [{ type: 'required', message: 'Signature is required' }]
    });
  }

  return {
    id: 'signature',
    title: 'Review & Sign',
    enabled: true,
    required: signature.required,
    order: 100, // Always last
    fields
  };
}

// Add a guaranteed default config
const DEFAULT_CONFIG: FormConfig = {
  steps: [
    {
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
        }
      ]
    }
  ],
  initialStep: 'personal-info' as FormStepId,
  navigation: {
    allowSkip: false,
    allowPrevious: true,
    requiredSteps: ['personal-info']
  }
};

// Update main generator function with better error handling
export function generateFormConfig(collectionKey: string, isDefaultKey: boolean = true): FormConfig {
  try {
    const requirements = getRequirements(isDefaultKey ? getConfig().defaultCollectionKey : collectionKey);
    const steps: FormStep[] = [];
    const requiredSteps: FormStepId[] = [];
    let order = 1;

    // Personal Info (always include as fallback)
    const personalInfoStep = generatePersonalInfoStep(requirements);
    if (personalInfoStep) {
      personalInfoStep.order = order++;
      steps.push(personalInfoStep);
      requiredSteps.push('personal-info');
    }

    // Add other steps...
    if (requirements.verificationSteps.residenceHistory?.enabled) {
      steps.push({
        id: 'residence-history',
        title: 'Residence History',
        enabled: true,
        required: true,
        order: order++,
        fields: [
          {
            id: 'address',
            type: 'text',
            label: 'Address',
            required: true,
            validation: [{ type: 'required', message: 'Address is required' }]
          }
        ],
        validationRules: {
          requiredYears: requirements.verificationSteps.residenceHistory.years
        }
      });
      requiredSteps.push('residence-history');
    }

    // Employment History (with corrected naming)
    if (requirements.verificationSteps.employmentHistory?.enabled) {
      steps.push({
        id: 'employment-history',
        title: 'Employment History',
        enabled: true,
        required: true,
        order: order++,
        fields: [
          {
            id: 'company',
            type: 'text',
            label: 'Company Name',
            required: true,
            validation: [{ type: 'required', message: 'Company name is required' }]
          }
        ],
        validationRules: {
          requiredYears: requirements.verificationSteps.employmentHistory.modes.years
        }
      });
      requiredSteps.push('employment-history');
    }

    // Always include signature step
    const signatureStep = generateSignatureStep(requirements);
    steps.push(signatureStep);
    if (signatureStep.required) {
      requiredSteps.push('signature');
    }

    // Ensure we have at least one step
    if (steps.length === 0) {
      console.warn('No steps generated, using default config');
      return DEFAULT_CONFIG;
    }

    // Determine initial step with fallback
    const initialStep = steps.find(step => step.enabled)?.id || 'personal-info';

    return {
      steps,
      initialStep,
      navigation: {
        allowSkip: false,
        allowPrevious: true,
        requiredSteps
      }
    };
  } catch (error) {
    console.error('Error generating form config:', error);
    return DEFAULT_CONFIG;
  }
}

// Update the class implementation
export class FormConfigGenerator {
  public static generateFormConfig(collectionKey: string): FormConfig {
    console.log('FormConfigGenerator: Generating config for key:', collectionKey);
    
    // Generate all steps with minimal configuration
    const steps: FormStep[] = [
      {
        id: 'personal-info',
        title: 'Personal Information',
        enabled: true,
        required: false,
        order: 1,
        fields: [
          {
            id: 'fullName',
            type: 'text',
            label: 'Full Name',
            required: false,
            validation: []
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email',
            required: false,
            validation: []
          }
        ]
      },
      {
        id: 'consents',
        title: 'Required Consents',
        enabled: true,
        required: false,
        order: 2,
        fields: [
          {
            id: 'agreed',
            type: 'checkbox',
            label: 'I agree',
            required: false,
            validation: []
          }
        ]
      },
      {
        id: 'residence-history',
        title: 'Residence History',
        enabled: true,
        required: false,
        order: 3,
        fields: [
          {
            id: 'entries',
            type: 'array',
            label: 'Entries',
            required: false,
            validation: []
          }
        ]
      },
      {
        id: 'employment-history',
        title: 'Employment History',
        enabled: true,
        required: false,
        order: 4,
        fields: [
          {
            id: 'entries',
            type: 'array',
            label: 'Entries',
            required: false,
            validation: []
          }
        ]
      },
      {
        id: 'education',
        title: 'Education',
        enabled: true,
        required: false,
        order: 5,
        fields: [
          {
            id: 'entries',
            type: 'array',
            label: 'Entries',
            required: false,
            validation: []
          }
        ]
      },
      {
        id: 'professional-licenses',
        title: 'Professional Licenses',
        enabled: true,
        required: false,
        order: 6,
        fields: [
          {
            id: 'entries',
            type: 'array',
            label: 'Entries',
            required: false,
            validation: []
          }
        ]
      },
      {
        id: 'signature',
        title: 'Review & Sign',
        enabled: true,
        required: false,
        order: 7,
        fields: [
          {
            id: 'signature',
            type: 'text',
            label: 'Signature',
            required: false,
            validation: []
          }
        ]
      }
    ];

    return {
      steps,
      initialStep: 'personal-info',
      navigation: {
        allowSkip: true,
        allowPrevious: true,
        requiredSteps: []
      }
    };
  }
}

// Update type definitions to ensure consistency
export interface EmploymentEntryData {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export interface ConsentsData {
  driverLicense: boolean;  // Note: consistent naming
  drugTest: boolean;
  biometric: boolean;
}