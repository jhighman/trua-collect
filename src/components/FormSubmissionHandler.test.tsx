import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FormSubmissionHandler from './FormSubmissionHandler';
import { useForm } from '../context/FormContext';
import type { FormContextType } from '../context/FormContext';

// Mock the FormContext
jest.mock('../context/FormContext', () => ({
  ...jest.requireActual('../context/FormContext'),
  useForm: jest.fn()
}));

describe('FormSubmissionHandler', () => {
  // Add console.error mock
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
  });

  // Mock implementation of useForm
  const mockUseForm = useForm as jest.MockedFunction<typeof useForm>;
  
  const mockSubmitForm = jest.fn();
  const mockMoveToStep = jest.fn();
  const mockIsStepValid = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockFormContext: FormContextType = {
      formState: {
        currentStep: 'signature',
        steps: {
          'personal-info': {
            isValid: true,
            isComplete: true,
            touched: new Set(),
            errors: {},
            values: {}
          },
          'residence-history': {
            isValid: true,
            isComplete: true,
            touched: new Set(),
            errors: {},
            values: {}
          },
          'employment-history': {
            isValid: true,
            isComplete: true,
            touched: new Set(),
            errors: {},
            values: {}
          },
          'education': {
            isValid: true,
            isComplete: true,
            touched: new Set(),
            errors: {},
            values: {}
          },
          'professional-licenses': {
            isValid: true,
            isComplete: true,
            touched: new Set(),
            errors: {},
            values: {}
          },
          'consents': {
            isValid: true,
            isComplete: true,
            touched: new Set(),
            errors: {},
            values: {}
          },
          'signature': {
            isValid: true,
            isComplete: true,
            touched: new Set(),
            errors: {},
            values: {}
          }
        },
        isSubmitting: false,
        isComplete: true,
        values: {
          'personal-info': {},
          'residence-history': {},
          'employment-history': {},
          'education': {},
          'professional-licenses': {},
          'consents': {},
          'signature': {}
        },
        completedSteps: ['personal-info', 'education', 'signature']
      },
      currentStep: 'signature',
      navigationState: {
        canMoveNext: true,
        canMovePrevious: true,
        availableSteps: ['personal-info', 'employment-history', 'signature'],
        completedSteps: ['personal-info', 'education', 'signature']
      },
      canMoveNext: true,
      canMovePrevious: true,
      availableSteps: ['personal-info', 'employment-history', 'signature'],
      completedSteps: ['personal-info', 'education', 'signature'],
      moveToNextStep: jest.fn(),
      moveToPreviousStep: jest.fn(),
      moveToStep: mockMoveToStep,
      forceNextStep: jest.fn(),
      forceSetCurrentStep: jest.fn(),
      setValue: jest.fn(),
      getValue: jest.fn(),
      getStepErrors: jest.fn(),
      isStepValid: mockIsStepValid,
      addTimelineEntry: jest.fn(),
      updateTimelineEntry: jest.fn(),
      removeTimelineEntry: jest.fn(),
      getTimelineEntries: jest.fn(),
      formErrors: {},
      submitForm: mockSubmitForm,
      isSubmitting: false
    };
    
    mockUseForm.mockReturnValue(mockFormContext);
  });

  it('renders the submit button', () => {
    render(<FormSubmissionHandler onSuccess={jest.fn()} />);
    expect(screen.getByText('Submit Form')).toBeInTheDocument();
  });

  it('validates all steps and submits when all steps are valid', async () => {
    mockIsStepValid.mockReturnValue(true);
    
    const mockOnSuccess = jest.fn();
    render(<FormSubmissionHandler onSuccess={mockOnSuccess} />);
    
    fireEvent.click(screen.getByText('Submit Form'));
    
    await waitFor(() => {
      expect(mockSubmitForm).toHaveBeenCalled();
    });
  });

  it('shows validation errors and navigates to invalid step', async () => {
    // Mock that 'employment-history' step is invalid
    mockIsStepValid.mockImplementation((stepId) => stepId !== 'employment-history');
    
    render(<FormSubmissionHandler onSuccess={jest.fn()} />);
    
    fireEvent.click(screen.getByText('Submit Form'));
    
    await waitFor(() => {
      expect(screen.getByText(/Please correct the following errors/i)).toBeInTheDocument();
      expect(screen.getByText(/employment-history:/i)).toBeInTheDocument();
    });
    
    // Click on the error to navigate to that step
    fireEvent.click(screen.getByText(/employment-history:/i));
    expect(mockMoveToStep).toHaveBeenCalledWith('employment-history');
  });

  it('handles form submission errors', async () => {
    mockIsStepValid.mockReturnValue(true);
    mockSubmitForm.mockRejectedValue(new Error('Submission failed'));
    
    mockUseForm.mockReturnValue({
      ...mockUseForm(),
      formErrors: { submit: 'Submission failed' }
    });
    
    render(<FormSubmissionHandler onSuccess={jest.fn()} />);
    
    fireEvent.click(screen.getByText('Submit Form'));
    
    await waitFor(() => {
      expect(screen.getByText('Submission failed')).toBeInTheDocument();
      expect(console.error).toHaveBeenCalledWith(
        'Form submission error:',
        expect.any(Error)
      );
    });
  });
});