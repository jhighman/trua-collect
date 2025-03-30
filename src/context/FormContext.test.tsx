/* eslint-disable no-console */
import React from 'react';
import { render } from '@testing-library/react';
import { FormProvider, useForm, FormContextType, FormStepId } from './FormContext';
import type { FormState, NavigationState } from '../utils/FormStateManager';
import { FormConfigGenerator } from '../utils/FormConfigGenerator';
import type { Requirements } from '../utils/collectionKeyParser';

// Create mock touched set
const mockTouched = new Set<string>();

// Define mock states
const mockFormState: FormState = {
  currentStepId: 'signature', // Changed from currentStep to currentStepId
  steps: {
    'personal-info': {
      isValid: true,
      isComplete: true,
      touched: new Set(),
      errors: {},
      values: {},
      _initialized: true,
      _complete: false,
    },
    'residence-history': {
      isValid: true,
      isComplete: true,
      touched: new Set(),
      errors: {},
      values: {},
      _initialized: true,
      _complete: false,
    },
    'employment-history': {
      isValid: true,
      isComplete: true,
      touched: new Set(),
      errors: {},
      values: {},
      _initialized: true,
      _complete: false,
    },
    'education': {
      isValid: true,
      isComplete: true,
      touched: new Set(),
      errors: {},
      values: {},
      _initialized: true,
      _complete: false,
    },
    'professional-licenses': {
      isValid: true,
      isComplete: true,
      touched: new Set(),
      errors: {},
      values: {},
      _initialized: true,
      _complete: false,
    },
    'consents': {
      isValid: true,
      isComplete: true,
      touched: new Set(),
      errors: {},
      values: {},
      _initialized: true,
      _complete: false,
    },
    'signature': {
      isValid: true,
      isComplete: true,
      touched: new Set(),
      errors: {},
      values: {},
      _initialized: true,
      _complete: false,
    },
  },
  isSubmitting: false,
  isComplete: true,
  completedSteps: [
    'personal-info',
    'residence-history',
    'employment-history',
    'education',
    'professional-licenses',
    'consents',
    'signature',
  ],
};

const mockNavigationState: NavigationState = {
  canMoveNext: true,
  canMovePrevious: false,
  availableSteps: ['personal-info', 'education', 'professional-licenses', 'signature'] as FormStepId[],
  completedSteps: ['personal-info'] as FormStepId[],
};

const mockFormConfig = {
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
          validation: [{ type: 'required', message: 'Full name is required' }],
        },
      ],
    },
  ],
  initialStep: 'personal-info' as FormStepId,
  navigation: {
    allowSkip: false,
    allowPrevious: true,
    requiredSteps: ['personal-info'],
  },
};

// Mock implementations
jest.mock('../utils/FormStateManager', () => ({
  FormStateManager: jest.fn(() => ({
    getState: jest.fn().mockReturnValue(mockFormState),
    getNavigationState: jest.fn().mockReturnValue(mockNavigationState),
    moveToStep: jest.fn(),
    forceSetCurrentStep: jest.fn(),
    updateConfig: jest.fn(),
    setValue: jest.fn(),
  })),
}));

jest.mock('../utils/FormConfigGenerator', () => ({
  FormConfigGenerator: {
    DEFAULT_COLLECTION_KEY: 'en-EPMA-DTB-R5-E5-E-P-W',
    generateFormConfig: jest.fn((key?: string) => {
      if (key === 'invalid-key') {
        return {
          steps: [],
          initialStep: 'personal-info',
          navigation: {
            allowSkip: false,
            allowPrevious: true,
            requiredSteps: [],
          },
        };
      }
      return mockFormConfig;
    }),
  },
}));

jest.mock('../utils/EnvironmentConfig', () => ({
  getConfig: jest.fn().mockReturnValue({ defaultCollectionKey: 'default-key' }),
}));

// Mock requirements - updated to match the Requirements type structure
const mockRequirements: Requirements = {
  language: 'en',
  consentsRequired: {
    driverLicense: false,
    drugTest: false,
    biometric: false,
  },
  verificationSteps: {
    personalInfo: {
      enabled: true,
      modes: {
        email: true,
        phone: true,
        fullName: true,
        nameAlias: false,
      },
    },
    education: {
      enabled: true,
    },
    professionalLicense: {
      enabled: true,
    },
    residenceHistory: {
      enabled: true,
      years: 3,
    },
    employmentHistory: {
      enabled: true,
      mode: 'years',
      modes: {
        years: 3,
      },
    },
  },
  signature: {
    required: true,
    mode: 'checkbox',
  },
};

// Ensure mockFormConfig has initialStep explicitly set
console.log('mockFormConfig initialStep:', mockFormConfig.initialStep);

const TestConsumer: React.FC<{ onContext?: (context: FormContextType) => void }> = ({ onContext }) => {
  const context = useForm();
  if (onContext) onContext(context);
  return <div data-testid="consumer">Current Step: {context.currentStep}</div>;
};

describe('FormProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default step and provides context', async () => {
    let capturedContext: FormContextType | undefined;

    console.log('Starting test with mockFormConfig:', mockFormConfig);

    render(
      <FormProvider
        requirements={mockRequirements}
        collectionKey="en-EPMA-DTB-R5-E5-E-P-W"
        onSubmit={jest.fn()}
      >
        <TestConsumer
          onContext={ctx => {
            console.log('Context received:', ctx);
            capturedContext = ctx;
          }}
        />
      </FormProvider>
    );

    // Wait for next tick to ensure context is populated
    await Promise.resolve();

    expect(FormConfigGenerator.generateFormConfig).toHaveBeenCalled();
    expect(capturedContext).toBeDefined();
    expect(capturedContext?.currentStep).toBe('personal-info'); // Still valid, as FormProvider sets initialStep
    expect(capturedContext?.formState.currentStepId).toBe('signature'); // Matches mockFormState
    expect(capturedContext?.navigationState.availableSteps).toContain('personal-info');
  });

  it('handles invalid collection key gracefully', async () => {
    const generateFormConfigMock = FormConfigGenerator.generateFormConfig as jest.Mock;

    let capturedContext: FormContextType | undefined;

    console.log('Starting invalid key test');

    render(
      <FormProvider
        requirements={mockRequirements}
        collectionKey="invalid-key"
        onSubmit={jest.fn()}
      >
        <TestConsumer
          onContext={ctx => {
            console.log('Invalid key test context received:', ctx);
            capturedContext = ctx;
          }}
        />
      </FormProvider>
    );

    // Wait for next tick to ensure context is populated
    await Promise.resolve();

    expect(capturedContext).toBeDefined();
    expect(capturedContext?.currentStep).toBe('personal-info'); // FormProvider sets initialStep
    expect(generateFormConfigMock).toHaveBeenCalledWith('invalid-key');
    expect(capturedContext?.formState.currentStepId).toBe('signature'); // From mockFormState
  });
});