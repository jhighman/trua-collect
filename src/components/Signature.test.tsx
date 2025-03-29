import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Signature } from './Signature';
import { TranslationProvider } from '../context/TranslationContext';
import { FormProvider } from '../context/FormContext';
import { MemoryRouter } from 'react-router-dom';

// Mock the react-signature-canvas component
jest.mock('react-signature-canvas', () => {
  return jest.fn().mockImplementation(({ canvasProps }) => {
    return (
      <canvas
        data-testid="signature-canvas"
        className={canvasProps.className}
        width={canvasProps.width}
        height={canvasProps.height}
        role={canvasProps.role}
        aria-label={canvasProps['aria-label']}
      />
    );
  });
});

// Mock the FormContext
const mockFormContext = {
  setValue: jest.fn(),
  getValue: jest.fn(),
  getStepErrors: jest.fn().mockReturnValue({}),
  currentStep: 'signature',
  formState: {
    steps: {
      signature: {
        values: {},
        errors: {},
        isValid: true
      }
    },
    currentStep: 'signature'
  },
  navigationState: {
    canMoveNext: true,
    canMovePrevious: true,
    availableSteps: ['personal-info', 'signature'],
    completedSteps: ['personal-info']
  },
  moveToNextStep: jest.fn(),
  moveToPreviousStep: jest.fn(),
  moveToStep: jest.fn(),
  canMoveNext: true,
  canMovePrevious: true,
  availableSteps: ['personal-info', 'signature'],
  completedSteps: ['personal-info'],
  addTimelineEntry: jest.fn(),
  updateTimelineEntry: jest.fn(),
  removeTimelineEntry: jest.fn(),
  getTimelineEntries: jest.fn(),
  isStepValid: jest.fn(),
  submitForm: jest.fn(),
  formErrors: {}
};

// Mock useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Mock the useForm hook
jest.mock('../context/FormContext', () => ({
  ...jest.requireActual('../context/FormContext'),
  useForm: () => mockFormContext,
  FormProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

describe('Signature Component', () => {
  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <TranslationProvider initialLanguage="en">
          <Signature {...props} />
        </TranslationProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the signature component', () => {
    renderComponent();
    
    // Check if the component renders correctly
    expect(screen.getByRole('application')).toBeInTheDocument();
    expect(screen.getByText(/your signature/i)).toBeInTheDocument();
    expect(screen.getByText(/please sign using your mouse or touch screen below/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    expect(screen.getByText(/by signing above/i)).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('handles clear button click', () => {
    // Set up mocks
    const onSignatureChangeMock = jest.fn();
    
    // Mock the SignatureCanvas methods
    const mockClear = jest.fn();
    const mockIsEmpty = jest.fn().mockReturnValue(false);
    const mockToDataURL = jest.fn().mockReturnValue('data:image/png;base64,test');
    const mockFromDataURL = jest.fn();
    const mockOn = jest.fn();
    const mockOff = jest.fn();
    
    // Override the useRef hook to return our mocked canvas
    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        clear: mockClear,
        isEmpty: mockIsEmpty,
        toDataURL: mockToDataURL,
        fromDataURL: mockFromDataURL,
        on: mockOn,
        off: mockOff
      }
    });
    
    renderComponent({ onSignatureChange: onSignatureChangeMock });
    
    // Click the clear button
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    
    // Check if clear was called
    expect(mockClear).toHaveBeenCalled();
    
    // Check if onSignatureChange was called with null
    expect(onSignatureChangeMock).toHaveBeenCalledWith(null);
    
    // Restore the original useRef implementation
    jest.spyOn(React, 'useRef').mockRestore();
  });

  it('handles checkbox change', () => {
    // Mock the SignatureCanvas methods
    const mockClear = jest.fn();
    const mockIsEmpty = jest.fn().mockReturnValue(false);
    const mockToDataURL = jest.fn().mockReturnValue('data:image/png;base64,test');
    const mockFromDataURL = jest.fn();
    const mockOn = jest.fn();
    const mockOff = jest.fn();
    
    // Override the useRef hook to return our mocked canvas
    jest.spyOn(React, 'useRef').mockReturnValue({
      current: {
        clear: mockClear,
        isEmpty: mockIsEmpty,
        toDataURL: mockToDataURL,
        fromDataURL: mockFromDataURL,
        on: mockOn,
        off: mockOff
      }
    });
    
    renderComponent();
    
    // Check the checkbox
    fireEvent.click(screen.getByRole('checkbox'));
    
    // Check if setValue was called with true
    expect(mockFormContext.setValue).toHaveBeenCalledWith('signature', 'confirmation', true);
    
    // Restore the original useRef implementation
    jest.spyOn(React, 'useRef').mockRestore();
  });
});