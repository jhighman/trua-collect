import { DocumentService } from './DocumentService';
import { JsonDocumentGenerator } from '../utils/JsonDocumentGenerator';
import { FormState } from '../context/FormContext';

// Mock JsonDocumentGenerator
jest.mock('../utils/JsonDocumentGenerator', () => ({
  JsonDocumentGenerator: {
    generateJsonDocument: jest.fn(),
    generateFilename: jest.fn(),
    saveToString: jest.fn()
  }
}));

describe('DocumentService', () => {
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
  };

  const mockFilename = 'truaverify_ABC123_20250319.json';
  const mockJsonString = JSON.stringify(mockJsonDocument, null, 2);

  // Spy on console.log
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mocks
    (JsonDocumentGenerator.generateJsonDocument as jest.Mock).mockReturnValue(mockJsonDocument);
    (JsonDocumentGenerator.generateFilename as jest.Mock).mockReturnValue(mockFilename);
    (JsonDocumentGenerator.saveToString as jest.Mock).mockReturnValue(mockJsonString);
    
    // Setup console spy
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('generates a JSON document using JsonDocumentGenerator', () => {
    const result = DocumentService.generateJsonDocument(mockFormState, mockTrackingId);
    
    expect(JsonDocumentGenerator.generateJsonDocument).toHaveBeenCalledWith(
      mockFormState, 
      mockTrackingId
    );
    expect(result).toBe(mockJsonDocument);
  });

  it('saves a JSON document and returns the file path', async () => {
    const result = await DocumentService.saveJsonDocument(mockJsonDocument, mockTrackingId);
    
    expect(JsonDocumentGenerator.generateFilename).toHaveBeenCalledWith(mockTrackingId);
    expect(JsonDocumentGenerator.saveToString).toHaveBeenCalledWith(mockJsonDocument);
    
    expect(result).toBe(`claims/${mockFilename}`);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`JSON document would be saved to: claims/${mockFilename}`)
    );
  });

  it('generates and saves a JSON document in one step', async () => {
    const result = await DocumentService.generateAndSaveJsonDocument(
      mockFormState, 
      mockTrackingId
    );
    
    expect(JsonDocumentGenerator.generateJsonDocument).toHaveBeenCalledWith(
      mockFormState, 
      mockTrackingId
    );
    expect(JsonDocumentGenerator.generateFilename).toHaveBeenCalledWith(mockTrackingId);
    expect(JsonDocumentGenerator.saveToString).toHaveBeenCalledWith(mockJsonDocument);
    
    expect(result).toBe(`claims/${mockFilename}`);
  });

  it('simulates checking if a document exists', async () => {
    const result = await DocumentService.documentExists(mockTrackingId);
    
    expect(result).toBe(false);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Would check if JSON document exists for tracking ID: ${mockTrackingId}`)
    );
  });

  it('simulates getting a document by tracking ID', async () => {
    const result = await DocumentService.getJsonDocument(mockTrackingId);
    
    expect(result).toBeNull();
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining(`Would attempt to load JSON document for tracking ID: ${mockTrackingId}`)
    );
  });
});