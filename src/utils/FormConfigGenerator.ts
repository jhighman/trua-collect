import type { Requirements } from './collectionKeyParser';
import { parseCollectionKey } from './collectionKeyParser';
import { getConfig } from './EnvironmentConfig';

// Input/Output Types
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
export function generateFormConfig(requirements: Requirements, isDefaultKey: boolean = true): FormConfig {
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
          id: 'highestLevel',
          type: 'select',
          label: 'Highest Education Level',
          required: true,
          validation: [
            { type: 'required', message: 'Highest education level is required' }
          ]
        },
        {
          id: 'institution',
          type: 'text',
          label: 'Institution Name',
          required: false,
          validation: []
        },
        {
          id: 'degree',
          type: 'text',
          label: 'Degree',
          required: false,
          validation: []
        }
      ],
      validationRules: {
        requiredVerifications: verification_steps.education.required_verifications
      }
    });
    requiredSteps.push('education');
  }

  if (verification_steps.professional_license.enabled) {
    steps.push({
      id: 'professional-licenses',
      title: 'Professional Licenses',
      enabled: true,
      required: true,
      order: steps.length + 1,
      fields: [
        {
          id: 'licenseType',
          type: 'text',
          label: 'License Type',
          required: false,
          validation: []
        },
        {
          id: 'licenseNumber',
          type: 'text',
          label: 'License Number',
          required: false,
          validation: []
        }
      ],
      validationRules: {
        requiredVerifications: verification_steps.professional_license.required_verifications
      }
    });
    requiredSteps.push('professional-licenses');
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

  // Get the actual collection key from the requirements
  const collectionKey = requirements.language + requirements.verification_steps.education.enabled +
                       requirements.verification_steps.professional_license.enabled +
                       requirements.verification_steps.residence_history.enabled;
  
  console.log('FormConfigGenerator: Raw requirements:', JSON.stringify(requirements));
  console.log('FormConfigGenerator: Verification steps:', {
    education: requirements.verification_steps.education.enabled,
    professional_license: requirements.verification_steps.professional_license.enabled,
    residence_history: requirements.verification_steps.residence_history.enabled,
    employment_history: requirements.verification_steps.employment_history.enabled
  });
  
  // Get the default collection key from environment configuration
  const config = getConfig();
  const defaultCollectionKey = config.defaultCollectionKey;
  
  // Use the default collection key from environment configuration
  // The collection key format is: en + 12 bits
  const { bits } = parseCollectionKey(defaultCollectionKey);
  console.log('FormConfigGenerator: Using default collection key from environment:', defaultCollectionKey);
  
  // Map bits to steps
  const stepMap: FormStepId[] = [
    'personal-info',       // Always enabled
    'consents',            // Bit 0-2 (consents)
    'education',           // Bit 3
    'professional-licenses', // Bit 4
    'residence-history',   // Bit 5
    'employment-history',  // Bit 9
    'signature'            // Always last
  ];
  
  // Log whether we're using the default collection key
  console.log('FormConfigGenerator: Using default collection key (from parameter):', isDefaultKey);
  
  // Find the first enabled step based on the bits
  let firstEnabledStep: FormStepId = 'personal-info';
  
  // Only override the first step if we're not using the default key
  if (!isDefaultKey) {
    console.log('FormConfigGenerator: Using custom collection key, determining first enabled step');
    // Check bits 3, 4, 5, 9 for enabled steps
    if (requirements.verification_steps.residence_history.enabled) {
      firstEnabledStep = 'residence-history';
    } else if (requirements.verification_steps.professional_license.enabled) {
      firstEnabledStep = 'professional-licenses';
    } else if (requirements.verification_steps.education.enabled) {
      firstEnabledStep = 'education';
    }
  } else {
    console.log('FormConfigGenerator: Using default collection key, starting at personal-info');
  }
  
  // Sort steps by order
  const sortedSteps = steps.sort((a, b) => a.order - b.order);
  
  console.log('FormConfigGenerator: Collection key bits:', bits);
  console.log('FormConfigGenerator: Education enabled:', requirements.verification_steps.education.enabled);
  console.log('FormConfigGenerator: Professional licenses enabled:', requirements.verification_steps.professional_license.enabled);
  console.log('FormConfigGenerator: Residence history enabled:', requirements.verification_steps.residence_history.enabled);
  console.log('FormConfigGenerator: Employment history enabled:', requirements.verification_steps.employment_history.enabled);
  console.log('FormConfigGenerator: First enabled step:', firstEnabledStep);
  console.log('FormConfigGenerator: All steps:', sortedSteps.map(s => s.id));
  console.log('FormConfigGenerator: Required steps:', requiredSteps);
  
  return {
    steps: sortedSteps,
    initialStep: firstEnabledStep,
    navigation: {
      allowSkip: false,
      allowPrevious: true,
      requiredSteps
    }
  };
}

// Export the class
export class FormConfigGenerator {
  static generateFormConfig(requirements: Requirements, isDefaultKey: boolean = true): FormConfig {
    // Use the standalone function implementation
    return generateFormConfig(requirements, isDefaultKey);
  }
}