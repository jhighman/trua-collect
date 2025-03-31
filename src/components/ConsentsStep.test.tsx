/* eslint-disable no-console */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ConsentsStep } from './ConsentsStep';
import { TranslationProvider } from '../context/TranslationContext';

// Mock the FormContext
const mockFormContext = {
  setValue: jest.fn(),
  getValue: jest.fn(),
  getStepErrors: jest.fn().mockReturnValue({
    driverLicenseConsent: 'Driver license consent is required',
    drugTestConsent: 'Drug test consent is required',
    biometricConsent: 'Biometric consent is required',
  }),
  isStepValid: jest.fn().mockReturnValue(false),
  moveToNextStep: jest.fn(),
  moveToPreviousStep: jest.fn(),
  canMoveNext: false,
  canMovePrevious: true,
  formState: {
    steps: {
      consents: {
        values: {
          driverLicenseConsent: false,
          drugTestConsent: false,
          biometricConsent: false,
          _config: {
            consentsRequired: {
              driverLicense: true,
              drugTest: true,
              biometric: true,
            },
          },
        },
        errors: {
          driverLicenseConsent: 'Driver license consent is required',
          drugTestConsent: 'Drug test consent is required',
          biometricConsent: 'Biometric consent is required',
        },
        isValid: false,
        isComplete: false,
        touched: new Set(),
        _initialized: true,
        _complete: false,
      },
    },
    currentStepId: 'consents', // Updated to currentStepId
    isSubmitting: false,
    isComplete: false,
    completedSteps: ['personal-info'],
  },
  navigationState: {
    canMoveNext: false,
    canMovePrevious: true,
    availableSteps: ['personal-info', 'consents', 'signature'],
    completedSteps: ['personal-info'],
  },
};

// Mock the useForm hook
jest.mock('../context/FormContext', () => ({
  ...jest.requireActual('../context/FormContext'),
  useForm: () => mockFormContext,
}));

describe('ConsentsStep Component', () => {
  const renderComponent = () => {
    return render(
      <TranslationProvider initialLanguage="en">
        <ConsentsStep />
      </TranslationProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormContext.getValue.mockImplementation((stepId, fieldId) => {
      if (stepId !== 'consents') return undefined;
      switch (fieldId) {
        case 'driverLicenseConsent':
          return false;
        case 'drugTestConsent':
          return false;
        case 'biometricConsent':
          return false;
        case '_config':
          return {
            consentsRequired: {
              driverLicense: true,
              drugTest: true,
              biometric: true,
            },
          };
        default:
          return undefined;
      }
    });
  });

  it('renders the consents form with all required consents', () => {
    renderComponent();

    // Check if the component renders correctly
    expect(screen.getByRole('heading', { name: /required consents/i })).toBeInTheDocument();
    expect(
      screen.getByText(/please review and provide the following required consents/i)
    ).toBeInTheDocument();

    // Check if all consent sections are rendered
    expect(screen.getByRole('heading', { name: /driver license verification consent/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /drug test consent/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /biometric data consent/i })).toBeInTheDocument();

    // Check if checkboxes are rendered
    expect(screen.getByLabelText(/i consent to driver license verification/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i consent to drug testing/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/i consent to biometric data collection and use/i)).toBeInTheDocument();

    // Check if error messages are displayed
    expect(screen.getByText('Driver license consent is required')).toBeInTheDocument();
    expect(screen.getByText('Drug test consent is required')).toBeInTheDocument();
    expect(screen.getByText('Biometric consent is required')).toBeInTheDocument();

    // Check if form status is displayed
    expect(screen.getByText(/please provide all required consents to proceed/i)).toBeInTheDocument();
  });

  it('handles checkbox changes', () => {
    renderComponent();

    // Get checkboxes
    const driverLicenseCheckbox = screen.getByLabelText(/i consent to driver license verification/i);
    const drugTestCheckbox = screen.getByLabelText(/i consent to drug testing/i);
    const biometricCheckbox = screen.getByLabelText(/i consent to biometric data collection and use/i);

    // Check the checkboxes
    fireEvent.click(driverLicenseCheckbox);
    fireEvent.click(drugTestCheckbox);
    fireEvent.click(biometricCheckbox);

    // Check if setValue was called with the correct values
    expect(mockFormContext.setValue).toHaveBeenCalledWith('consents', 'driverLicenseConsent', true);
    expect(mockFormContext.setValue).toHaveBeenCalledWith('consents', 'drugTestConsent', true);
    expect(mockFormContext.setValue).toHaveBeenCalledWith('consents', 'biometricConsent', true);
  });

  it('shows valid status when form is valid', () => {
    // Mock isStepValid to return true
    mockFormContext.isStepValid.mockReturnValue(true);

    renderComponent();

    // Check if valid status is displayed
    expect(screen.getByText(/all required consents have been provided/i)).toBeInTheDocument();
  });

  it('shows no consents message when no consents are required', () => {
    // Mock getValue to return a config with no required consents
    mockFormContext.getValue.mockImplementation((stepId, fieldId) => {
      if (stepId === 'consents' && fieldId === '_config') {
        return {
          consentsRequired: {
            driverLicense: false,
            drugTest: false,
            biometric: false,
          },
        };
      }
      return false;
    });
    // Mock getStepErrors to return empty object
    mockFormContext.getStepErrors.mockReturnValue({});

    renderComponent();

    // Check if no consents message is displayed
    expect(screen.getByText(/no consents are required for this verification process/i)).toBeInTheDocument();
  });
});