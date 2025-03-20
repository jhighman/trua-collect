import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FormStep } from './FormStep';
import { FormProvider } from '../context/FormContext';
import { ResidenceHistoryStep } from './ResidenceHistoryStep';
import type { FormContextType, FormStepId } from '../context/FormContext';
import { FormStepId as FormStepIdUtils } from '../utils/FormConfigGenerator';

// Add type declaration for jest-dom
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeDisabled(): R;
    }
  }
}

// Mock the ResidenceHistoryStep component
jest.mock('./ResidenceHistoryStep', () => ({
  ResidenceHistoryStep: jest.fn(() => <div data-testid="residence-history-step">Mocked Residence History Step</div>)
}));

// Create a mock form context value
const createMockFormContext = (currentStep: FormStepId): FormContextType => ({
  currentStep,
  moveToStep: jest.fn(),
  setValue: jest.fn(),
  getValue: jest.fn(),
  getStepErrors: jest.fn().mockReturnValue({}),
  canMoveNext: true,
  moveToNextStep: jest.fn(),
  moveToPreviousStep: jest.fn(),
  canMovePrevious: true,
  formState: {
    currentStep,
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
});

// Mock the FormContext
jest.mock('../context/FormContext', () => ({
  ...jest.requireActual('../context/FormContext'),
  useForm: () => createMockFormContext('personal-info')
}));

describe('FormStep Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders generic step for non-specialized steps', () => {
    render(<FormStep />);
    
    // Check if the generic step is rendered
    expect(screen.getByText('Step: personal-info')).toBeInTheDocument();
    expect(screen.getByText('This step is not yet implemented with a custom component.')).toBeInTheDocument();
    
    // Check if navigation buttons are displayed
    expect(screen.getByRole('button', { name: 'Previous' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
  });

  test('renders ResidenceHistoryStep for residence-history step', () => {
    // Override the mock to return a different current step
    jest.spyOn(require('../context/FormContext'), 'useForm')
      .mockImplementation(() => createMockFormContext('residence-history'));

    render(<FormStep />);
    
    // Check if the ResidenceHistoryStep is rendered
    expect(screen.getByTestId('residence-history-step')).toBeInTheDocument();
    expect(screen.getByText('Mocked Residence History Step')).toBeInTheDocument();
  });

  test('respects stepId prop when provided', () => {
    // Even though context has personal-info as current step,
    // component should render residence-history when specified
    render(<FormStep stepId="residence-history" />);
    
    // Check if the ResidenceHistoryStep is rendered regardless of current step in context
    expect(screen.getByTestId('residence-history-step')).toBeInTheDocument();
    expect(screen.getByText('Mocked Residence History Step')).toBeInTheDocument();
  });

  test('handles invalid step IDs gracefully', () => {
    // @ts-expect-error Testing invalid step ID
    render(<FormStep stepId="invalid-step" />);
    
    expect(screen.getByText('Invalid step ID')).toBeInTheDocument();
  });

  test('navigation buttons are disabled when appropriate', () => {
    jest.spyOn(require('../context/FormContext'), 'useForm')
      .mockImplementation(() => ({
        ...createMockFormContext('personal-info'),
        canMoveNext: false,
        canMovePrevious: false
      }));

    render(<FormStep />);
    
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});