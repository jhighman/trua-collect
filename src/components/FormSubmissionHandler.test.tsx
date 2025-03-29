import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormSubmissionHandler from './FormSubmissionHandler';
import '@testing-library/jest-dom';

// Mock the FormContext
jest.mock('../context/FormContext', () => ({
  ...jest.requireActual('../context/FormContext'),
  useForm: jest.fn()
}));

// Import the mocked useForm
import { useForm } from '../context/FormContext';

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
    
    // Default mock implementation
    mockUseForm.mockReturnValue({
      submitForm: mockSubmitForm,
      formErrors: {},
      formState: {
        currentStep: 'personal-info',
        steps: {},
        isSubmitting: false,
        isComplete: false
      },
      availableSteps: ['personal-info', 'employment-history', 'signature'],
      isStepValid: mockIsStepValid,
      moveToStep: mockMoveToStep,
      currentStep: 'personal-info',
      navigationState: {
        canMoveNext: true,
        canMovePrevious: false,
        availableSteps: ['personal-info', 'employment-history', 'signature'],
        completedSteps: []
      },
      canMoveNext: true,
      canMovePrevious: false,
      completedSteps: [],
      moveToNextStep: jest.fn(),
      moveToPreviousStep: jest.fn(),
      setValue: jest.fn(),
      getValue: jest.fn(),
      getStepErrors: jest.fn(),
      addTimelineEntry: jest.fn(),
      updateTimelineEntry: jest.fn(),
      removeTimelineEntry: jest.fn(),
      getTimelineEntries: jest.fn(),
      currentContextStep: null,
      forceNextStep: jest.fn(),
      isSubmitting: false // Add missing required property
    });
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