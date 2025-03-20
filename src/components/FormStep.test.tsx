import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormStep } from './FormStep';
import { FormProvider } from '../context/FormContext';
import { ResidenceHistoryStep } from './ResidenceHistoryStep';
import type { FormContextType, FormStepId } from '../context/FormContext';
import { TranslationProvider } from '../context/TranslationContext';

// Mock the ResidenceHistoryStep component
jest.mock('./ResidenceHistoryStep', () => ({
  ResidenceHistoryStep: jest.fn(() => <div data-testid="residence-history-step">Mocked Residence History Step</div>)
}));

// Create a mock form context value
const mockFormContext = {
  currentStep: 'personal-info' as FormStepId,
  moveToStep: jest.fn(),
  setValue: jest.fn(),
  getValue: jest.fn(),
  getStepErrors: jest.fn().mockReturnValue({}),
  canMoveNext: true,
  moveToNextStep: jest.fn(),
  moveToPreviousStep: jest.fn(),
  canMovePrevious: true,
  formState: {
    currentStep: 'personal-info',
    steps: {
      'personal-info': {
        id: 'personal-info',
        values: {},
        touched: new Set<string>(),
        errors: {},
        isComplete: false,
        isValid: true
      },
      'residence-history': {
        id: 'residence-history',
        values: {},
        touched: new Set<string>(),
        errors: {},
        isComplete: false,
        isValid: true
      }
    },
    isSubmitting: false,
    isComplete: false
  },
  navigationState: {
    canMoveNext: true,
    canMovePrevious: true,
    availableSteps: ['personal-info', 'residence-history'],
    completedSteps: []
  },
  availableSteps: ['personal-info', 'residence-history'],
  completedSteps: [],
  submitForm: jest.fn().mockResolvedValue(undefined),
  formErrors: {},
  addTimelineEntry: jest.fn(),
  updateTimelineEntry: jest.fn(),
  removeTimelineEntry: jest.fn(),
  getTimelineEntries: jest.fn().mockReturnValue([]),
  isStepValid: jest.fn().mockReturnValue(true)
};

// Mock the FormContext
jest.mock('../context/FormContext', () => ({
  ...jest.requireActual('../context/FormContext'),
  useForm: () => mockFormContext
}));

describe('FormStep Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders PersonalInfoStep for personal-info step', () => {
    render(
      <TranslationProvider initialLanguage="en">
        <FormStep stepId="personal-info" />
      </TranslationProvider>
    );
    
    // Check for PersonalInfoStep content instead of generic step
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
    expect(screen.getByText('Please provide your personal information below.')).toBeInTheDocument();
  });

  it('renders ResidenceHistoryStep for residence-history step', () => {
    render(
      <TranslationProvider initialLanguage="en">
        <FormStep stepId="residence-history" />
      </TranslationProvider>
    );
    
    expect(screen.getByTestId('residence-history-step')).toBeInTheDocument();
  });

  it('uses context step when stepId is undefined', () => {
    render(
      <TranslationProvider initialLanguage="en">
        <FormStep stepId={undefined} />
      </TranslationProvider>
    );
    
    // Check for PersonalInfoStep content since that's the default in context
    expect(screen.getByText('Personal Information')).toBeInTheDocument();
  });

  it('navigation buttons are disabled when appropriate', () => {
    const disabledContext = {
      ...mockFormContext,
      canMoveNext: false,
      canMovePrevious: false
    };
    
    jest.spyOn(require('../context/FormContext'), 'useForm')
      .mockImplementation(() => disabledContext);

    render(
      <TranslationProvider initialLanguage="en">
        <FormStep stepId="personal-info" />
      </TranslationProvider>
    );
    
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});