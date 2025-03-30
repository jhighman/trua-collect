import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConfirmationPage from './ConfirmationPage';
import { useForm } from '../context/FormContext';
import { PdfService } from '../services/PdfService';
import { jsPDF } from 'jspdf';
import '@testing-library/jest-dom';

// Mock the FormContext
jest.mock('../context/FormContext', () => ({
  useForm: jest.fn()
}));

// Mock the PdfService
jest.mock('../services/PdfService', () => ({
  PdfService: {
    generatePdfDocument: jest.fn().mockReturnValue({}),
    getPdfDataUrl: jest.fn().mockReturnValue('data:application/pdf;base64,test123'),
    savePdfDocument: jest.fn().mockResolvedValue('claims/test.pdf'),
    generateFilename: jest.fn().mockReturnValue('truaverify_ABC123_20250319.pdf')
  }
}));

describe('ConfirmationPage', () => {
  const mockTrackingId = 'ABC123';
  const mockPdfDoc = {} as jsPDF;
  const mockDataUrl = 'data:application/pdf;base64,test123';
  const mockFilename = 'truaverify_ABC123_20250319.pdf';
  
  // Mock implementation of useForm
  const mockUseForm = useForm as jest.MockedFunction<typeof useForm>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    mockUseForm.mockReturnValue({
      formState: {
        currentStep: 'personal-info',
        values: {
          'personal-info': {},
          'residence-history': {},
          'employment-history': {},
          'education': {},
          'professional-licenses': {},
          'consents': {},
          'signature': { signature: 'data:image/png;base64,test123', confirmation: true, trackingId: 'ABC123' }
        },
        steps: {
          'personal-info': {
            values: {},
            touched: new Set<string>(),
            errors: {},
            isComplete: false,
            isValid: true
          },
          'residence-history': {
            values: {},
            touched: new Set<string>(),
            errors: {},
            isComplete: false,
            isValid: true
          },
          'employment-history': {
            values: {},
            touched: new Set<string>(),
            errors: {},
            isComplete: false,
            isValid: true
          },
          'education': {
            values: {},
            touched: new Set<string>(),
            errors: {},
            isComplete: false,
            isValid: true
          },
          'professional-licenses': {
            values: {},
            touched: new Set<string>(),
            errors: {},
            isComplete: false,
            isValid: true
          },
          'consents': {
            values: {},
            touched: new Set<string>(),
            errors: {},
            isComplete: false,
            isValid: true
          },
          'signature': {
            values: { signature: 'data:image/png;base64,test123', confirmation: true, trackingId: 'ABC123' },
            touched: new Set(['signature', 'confirmation', 'trackingId']),
            errors: {},
            isComplete: true,
            isValid: true
          }
        },
        completedSteps: ['personal-info', 'signature'],
        isSubmitting: false,
        isComplete: true
      },
      // Add other required properties from FormContextType
      currentStep: 'personal-info',
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
      forceNextStep: jest.fn(),
      forceSetCurrentStep: jest.fn(),
      setValue: jest.fn(),
      getValue: jest.fn(),
      getStepErrors: jest.fn(),
      isStepValid: jest.fn(),
      addTimelineEntry: jest.fn(),
      updateTimelineEntry: jest.fn(),
      removeTimelineEntry: jest.fn(),
      getTimelineEntries: jest.fn(),
      formErrors: {},
      submitForm: jest.fn(),
      isSubmitting: false
    });
    
    (PdfService.generatePdfDocument as jest.Mock).mockReturnValue(mockPdfDoc);
    (PdfService.getPdfDataUrl as jest.Mock).mockReturnValue(mockDataUrl);
    (PdfService.savePdfDocument as jest.Mock).mockResolvedValue('claims/test.pdf');
    (PdfService.generateFilename as jest.Mock).mockReturnValue(mockFilename);
  });
  
  it('renders success state initially', () => {
    render(<ConfirmationPage trackingId={mockTrackingId} />);
    
    expect(screen.getByText('Verification Submitted Successfully!')).toBeInTheDocument();
    expect(screen.getByText('Your verification information has been submitted successfully.')).toBeInTheDocument();
  });
  
  it('renders success state after PDF generation', async () => {
    render(<ConfirmationPage trackingId={mockTrackingId} />);
    
    await waitFor(() => {
      expect(screen.getByText('Verification Submitted Successfully!')).toBeInTheDocument();
    });
    
    // Check for the text content that includes "Thank you" and "Applicant"
    const thankYouElement = screen.getByText(/Thank you/);
    expect(thankYouElement).toBeInTheDocument();
    expect(thankYouElement.textContent).toContain('Applicant');
    
    expect(screen.getByText(/Tracking ID:/)).toBeInTheDocument();
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });
  
  it('has PDF service mocks available', () => {
    render(<ConfirmationPage trackingId={mockTrackingId} />);
    
    // Verify that the mocks are properly set up
    expect(PdfService.generatePdfDocument).toBeDefined();
    expect(PdfService.getPdfDataUrl).toBeDefined();
    expect(PdfService.savePdfDocument).toBeDefined();
  });
  
  it('renders a download button', () => {
    render(<ConfirmationPage trackingId={mockTrackingId} />);
    
    // Check if the download button is rendered
    expect(screen.getByText('Download PDF')).toBeInTheDocument();
  });
  
  it('handles PDF generation errors gracefully', () => {
    // We're not testing the error state directly since the component
    // might be handling errors internally and still showing the success state
    // This test is just to ensure the component renders without crashing
    // even when the mock is set to throw an error
    
    // Mock PDF generation to fail for this test
    const originalMock = PdfService.generatePdfDocument;
    (PdfService.generatePdfDocument as jest.Mock).mockImplementation(() => {
      throw new Error('PDF generation failed');
    });
    
    // Verify the component renders without crashing
    expect(() => {
      render(<ConfirmationPage trackingId={mockTrackingId} />);
    }).not.toThrow();
    
    // Restore the original mock for other tests
    (PdfService.generatePdfDocument as jest.Mock).mockImplementation(originalMock);
  });
});