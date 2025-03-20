import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PersonalInfoStep } from './PersonalInfoStep';
import { TranslationProvider } from '../context/TranslationContext';

// Mock the FormContext
const mockFormContext = {
  setValue: jest.fn(),
  getValue: jest.fn(),
  getStepErrors: jest.fn().mockReturnValue({}),
  isStepValid: jest.fn().mockReturnValue(false),
  currentStep: 'personal-info',
  formState: {
    steps: {
      'personal-info': {
        values: {},
        errors: {},
        isValid: false
      }
    },
    currentStep: 'personal-info'
  },
  navigationState: {
    canMoveNext: true,
    canMovePrevious: false,
    availableSteps: ['personal-info', 'signature'],
    completedSteps: []
  },
  moveToNextStep: jest.fn(),
  moveToPreviousStep: jest.fn(),
  moveToStep: jest.fn(),
  canMoveNext: true,
  canMovePrevious: false,
  availableSteps: ['personal-info', 'signature'],
  completedSteps: [],
  addTimelineEntry: jest.fn(),
  updateTimelineEntry: jest.fn(),
  removeTimelineEntry: jest.fn(),
  getTimelineEntries: jest.fn(),
  submitForm: jest.fn(),
  formErrors: {}
};

// Mock the useForm hook
jest.mock('../context/FormContext', () => ({
  ...jest.requireActual('../context/FormContext'),
  useForm: () => mockFormContext
}));

describe('PersonalInfoStep Component', () => {
  const renderComponent = () => {
    return render(
      <TranslationProvider initialLanguage="en">
        <PersonalInfoStep />
      </TranslationProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormContext.getValue.mockImplementation((stepId, fieldId) => {
      if (stepId === 'personal-info' && fieldId === 'fullName') return '';
      if (stepId === 'personal-info' && fieldId === 'email') return '';
      return '';
    });
  });

  it('renders the personal info form', () => {
    renderComponent();
    
    // Check if the component renders correctly
    expect(screen.getByRole('heading', { name: /personal information/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByText(/please complete all required fields/i)).toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderComponent();
    
    // Simulate input changes
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john.doe@example.com' } });
    
    // Check if setValue was called with the correct values
    expect(mockFormContext.setValue).toHaveBeenCalledWith('personal-info', 'fullName', 'John Doe');
    expect(mockFormContext.setValue).toHaveBeenCalledWith('personal-info', 'email', 'john.doe@example.com');
  });

  it('displays validation errors', () => {
    // Mock getStepErrors to return errors
    mockFormContext.getStepErrors.mockReturnValue({
      fullName: 'Full name is required',
      email: 'Invalid email format'
    });
    
    renderComponent();
    
    // Check if error messages are displayed
    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    
    // Check if inputs have error class
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    
    expect(nameInput).toHaveClass('has-error');
    expect(emailInput).toHaveClass('has-error');
  });

  it('shows valid status when form is valid', () => {
    // Mock isStepValid to return true
    mockFormContext.isStepValid.mockReturnValue(true);
    
    renderComponent();
    
    // Check if valid status is displayed
    expect(screen.getByText(/all information is valid/i)).toBeInTheDocument();
  });
});