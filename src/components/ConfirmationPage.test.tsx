import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConfirmationPage from './ConfirmationPage';
import { useForm } from '../context/FormContext';
import { PdfService } from '../services/PdfService';
import '@testing-library/jest-dom';

// Mock the FormContext
jest.mock('../context/FormContext', () => ({
  useForm: jest.fn()
}));

// Mock the PdfService
jest.mock('../services/PdfService', () => ({
  PdfService: {
    generatePdfDocument: jest.fn(),
    getPdfDataUrl: jest.fn(),
    savePdfDocument: jest.fn(),
    generateFilename: jest.fn()
  }
}));

describe('ConfirmationPage', () => {
  const mockTrackingId = 'ABC123';
  const mockPdfDoc = {} as any;
  const mockDataUrl = 'data:application/pdf;base64,test123';
  const mockFilename = 'truaverify_ABC123_20250319.pdf';
  
  // Mock implementation of useForm
  const mockUseForm = useForm as jest.MockedFunction<typeof useForm>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockUseForm.mockReturnValue({
      formState: {
        currentStep: 'signature',
        steps: {
          'personal-info': {
            id: 'personal-info',
            values: { fullName: 'John Doe', email: 'john@example.com' },
            touched: new Set(),
            errors: {},
            isComplete: true,
            isValid: true
          }
        },
        isSubmitting: false,
        isComplete: true
      },
      // Add other required properties from FormContextType
      currentStep: 'signature',
      navigationState: {
        canMoveNext: false,
        canMovePrevious: true,
        availableSteps: ['personal-info', 'signature'],
        completedSteps: ['personal-info', 'signature']
      },
      canMoveNext: false,
      canMovePrevious: true,
      availableSteps: ['personal-info', 'signature'],
      completedSteps: ['personal-info', 'signature'],
      moveToNextStep: jest.fn(),
      moveToPreviousStep: jest.fn(),
      moveToStep: jest.fn(),
      setValue: jest.fn(),
      getValue: jest.fn(),
      getStepErrors: jest.fn(),
      isStepValid: jest.fn(),
      addTimelineEntry: jest.fn(),
      updateTimelineEntry: jest.fn(),
      removeTimelineEntry: jest.fn(),
      getTimelineEntries: jest.fn(),
      formErrors: {},
      submitForm: jest.fn()
    });
    
    (PdfService.generatePdfDocument as jest.Mock).mockReturnValue(mockPdfDoc);
    (PdfService.getPdfDataUrl as jest.Mock).mockReturnValue(mockDataUrl);
    (PdfService.savePdfDocument as jest.Mock).mockResolvedValue('claims/test.pdf');
    (PdfService.generateFilename as jest.Mock).mockReturnValue(mockFilename);
  });
  
  it('renders loading state initially', () => {
    render(<ConfirmationPage trackingId={mockTrackingId} />);
    
    expect(screen.getByText('Preparing Your Verification Document')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we prepare your document...')).toBeInTheDocument();
  });
  
  it('renders success state after PDF generation', async () => {
    render(<ConfirmationPage trackingId={mockTrackingId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Verification Submitted Successfully!')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Thank you, John Doe!/)).toBeInTheDocument();
    expect(screen.getByText(/Tracking ID: ABC123/)).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });
  
  it('calls PDF generation services on mount', async () => {
    render(<ConfirmationPage trackingId={mockTrackingId} />);
    
    await waitFor(() => {
      expect(PdfService.generatePdfDocument).toHaveBeenCalled();
      expect(PdfService.getPdfDataUrl).toHaveBeenCalled();
      expect(PdfService.savePdfDocument).toHaveBeenCalled();
    });
  });
  
  it('handles PDF download when button is clicked', async () => {
    // Mock document.createElement and other DOM methods
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn()
    };
    
    jest.spyOn(document, 'createElement').mockImplementation((tag) => {
      if (tag === 'a') return mockLink as unknown as HTMLElement;
      return document.createElement(tag);
    });
    
    const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation(() => document.body);
    const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation(() => document.body);
    
    render(<ConfirmationPage trackingId={mockTrackingId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Download PDF')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Download PDF'));
    
    expect(mockLink.href).toBe(mockDataUrl);
    expect(mockLink.download).toBe(mockFilename);
    expect(mockLink.click).toHaveBeenCalled();
  });
  
  it('renders error state when PDF generation fails', async () => {
    // Mock PDF generation to fail
    (PdfService.generatePdfDocument as jest.Mock).mockImplementation(() => {
      throw new Error('PDF generation failed');
    });
    
    render(<ConfirmationPage trackingId={mockTrackingId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/There was an error generating your PDF/)).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });
});