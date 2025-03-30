import { PdfService } from './PdfService';
import { FormState } from '../context/FormContext';
import { JsonDocument } from '../utils/JsonDocumentGenerator';
import { jsPDF } from 'jspdf';

// Mock the individual functions from PdfDocumentGenerator
jest.mock('../utils/PdfDocumentGenerator', () => ({
  generatePdfDocument: jest.fn(),
  generatePdfFromJson: jest.fn(),
  generateFilename: jest.fn(),
  saveToBlob: jest.fn(),
  saveToDataUrl: jest.fn()
}));

// Import the mocked functions
import {
  generatePdfDocument,
  generatePdfFromJson,
  generateFilename,
  saveToBlob,
  saveToDataUrl
} from '../utils/PdfDocumentGenerator';

describe('PdfService', () => {
  // Mock data
  const mockFormState = {
    currentStep: 'signature',
    steps: {
      'personal-info': {
        id: 'personal-info',
        values: { fullName: 'John Doe', email: 'john@example.com' },
        touched: new Set(),
        errors: {},
        isComplete: true,
        isValid: true
      },
      'signature': {
        id: 'signature',
        values: { signature: 'base64-data' },
        touched: new Set(),
        errors: {},
        isComplete: true,
        isValid: true
      }
    },
    values: {
      'personal-info': { fullName: 'John Doe', email: 'john@example.com' },
      'residence-history': {},
      'employment-history': {},
      'education': {},
      'professional-licenses': {},
      'consents': {},
      'signature': { signature: 'base64-data' }
    },
    completedSteps: ['personal-info', 'signature'],
    isSubmitting: false,
    isComplete: true
  } as FormState;

  const mockTrackingId = 'ABC123';
  const mockJsonDocument = {
    metadata: {
      trackingId: mockTrackingId,
      submissionDate: '2025-03-19T12:00:00Z',
      version: '1.0.0'
    },
    personalInfo: {
      fullName: 'John Doe',
      email: 'john@example.com'
    },
    timeline: {},
    signature: {
      signatureImage: 'base64-data',
      signatureDate: '2025-03-19T12:00:00Z'
    }
  } as JsonDocument;

  const mockPdfDocument = {} as jsPDF;
  const mockFilename = 'truaverify_ABC123_20250319.pdf';
  const mockBlob = new Blob(['mock pdf content'], { type: 'application/pdf' });
  const mockDataUrl = 'data:application/pdf;base64,bW9jayBwZGYgY29udGVudA==';

  // Spy on console.log
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (generatePdfDocument as jest.Mock).mockReturnValue(mockPdfDocument);
    (generatePdfFromJson as jest.Mock).mockReturnValue(mockPdfDocument);
    (generateFilename as jest.Mock).mockReturnValue(mockFilename);
    (saveToBlob as jest.Mock).mockReturnValue(mockBlob);
    (saveToDataUrl as jest.Mock).mockReturnValue(mockDataUrl);
    
    // Setup console spy
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('generates a PDF document using generatePdfDocument', () => {
    const result = PdfService.generatePdfDocument(mockFormState, mockTrackingId);
    
    expect(generatePdfDocument).toHaveBeenCalledWith(
      mockFormState,
      mockTrackingId
    );
    expect(result).toBe(mockPdfDocument);
  });

  it('generates a PDF document from JSON using generatePdfFromJson', () => {
    const result = PdfService.generatePdfFromJson(mockJsonDocument);
    
    expect(generatePdfFromJson).toHaveBeenCalledWith(
      mockJsonDocument
    );
    expect(result).toBe(mockPdfDocument);
  });

  it('saves a PDF document and returns the file path', async () => {
    const result = await PdfService.savePdfDocument(mockPdfDocument, mockTrackingId);
    
    expect(generateFilename).toHaveBeenCalledWith(mockTrackingId);
    expect(saveToBlob).toHaveBeenCalledWith(mockPdfDocument);
    
    expect(result).toBe(`claims/${mockFilename}`);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`PDF document would be saved to: claims/${mockFilename}`)
    );
  });

  it('generates and saves a PDF document in one step', async () => {
    const result = await PdfService.generateAndSavePdfDocument(
      mockFormState,
      mockTrackingId
    );
    
    expect(generatePdfDocument).toHaveBeenCalledWith(
      mockFormState,
      mockTrackingId
    );
    expect(generateFilename).toHaveBeenCalledWith(mockTrackingId);
    expect(saveToBlob).toHaveBeenCalledWith(mockPdfDocument);
    
    expect(result).toBe(`claims/${mockFilename}`);
  });

  it('generates and saves a PDF document from JSON in one step', async () => {
    const result = await PdfService.generateAndSavePdfFromJson(mockJsonDocument);
    
    expect(generatePdfFromJson).toHaveBeenCalledWith(
      mockJsonDocument
    );
    expect(generateFilename).toHaveBeenCalledWith(mockTrackingId);
    expect(saveToBlob).toHaveBeenCalledWith(mockPdfDocument);
    
    expect(result).toBe(`claims/${mockFilename}`);
  });

  it('gets a data URL for the PDF document', () => {
    const result = PdfService.getPdfDataUrl(mockPdfDocument);
    
    expect(saveToDataUrl).toHaveBeenCalledWith(mockPdfDocument);
    expect(result).toBe(mockDataUrl);
  });

  it('simulates checking if a document exists', async () => {
    const result = await PdfService.documentExists(mockTrackingId);
    
    expect(result).toBe(false);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Would check if PDF document exists for tracking ID: ${mockTrackingId}`)
    );
  });
});