import { JsonDocumentGenerator, JsonDocument } from './JsonDocumentGenerator';
import { FormState } from '../context/FormContext';

describe('JsonDocumentGenerator', () => {
  // Mock form state for testing
  const mockFormState: FormState = {
    currentStep: 'signature',
    steps: {
      'personal-info': {
        id: 'personal-info',
        values: {
          fullName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567'
        },
        touched: new Set(['fullName', 'email', 'phone']),
        errors: {},
        isComplete: true,
        isValid: true
      },
      'consents': {
        id: 'consents',
        values: {
          driverLicenseConsent: true,
          drugTestConsent: false,
          biometricConsent: true,
          nonBooleanValue: 'should be ignored'
        },
        touched: new Set(['driverLicenseConsent', 'drugTestConsent', 'biometricConsent']),
        errors: {},
        isComplete: true,
        isValid: true
      },
      'employment-history': {
        id: 'employment-history',
        values: {
          entries: [
            {
              company: 'Acme Inc',
              position: 'Software Engineer',
              startDate: '2020-01-01',
              endDate: '2022-12-31',
              isCurrent: false,
              description: 'Developed web applications',
              contactInfo: {
                name: 'Jane Smith',
                email: 'jane.smith@acme.com',
                phone: '555-987-6543'
              }
            },
            {
              company: 'Tech Corp',
              position: 'Senior Developer',
              startDate: '2023-01-15',
              endDate: null,
              isCurrent: true,
              contactInfo: {
                name: 'Bob Johnson',
                email: 'bob.johnson@techcorp.com'
              }
            }
          ]
        },
        touched: new Set(['entries']),
        errors: {},
        isComplete: true,
        isValid: true
      },
      'residence-history': {
        id: 'residence-history',
        values: {
          entries: [
            {
              address: '123 Main St',
              city: 'Anytown',
              state: 'CA',
              zipCode: '12345',
              startDate: '2019-01-01',
              endDate: '2022-12-31',
              isCurrent: false
            },
            {
              address: '456 Oak Ave',
              city: 'Somewhere',
              state: 'NY',
              zipCode: '67890',
              startDate: '2023-01-01',
              endDate: null,
              isCurrent: true
            }
          ]
        },
        touched: new Set(['entries']),
        errors: {},
        isComplete: true,
        isValid: true
      },
      'education': {
        id: 'education',
        values: {
          entries: [
            {
              institution: 'State University',
              degree: 'Bachelor of Science',
              field: 'Computer Science',
              startDate: '2015-09-01',
              endDate: '2019-05-30',
              isCurrent: false
            }
          ]
        },
        touched: new Set(['entries']),
        errors: {},
        isComplete: true,
        isValid: true
      },
      'professional-licenses': {
        id: 'professional-licenses',
        values: {
          entries: [
            {
              licenseType: 'Professional Engineer',
              licenseNumber: 'PE12345',
              issuingAuthority: 'State Board',
              issueDate: '2020-06-15',
              expirationDate: '2025-06-14',
              isActive: true
            }
          ]
        },
        touched: new Set(['entries']),
        errors: {},
        isComplete: true,
        isValid: true
      },
      'signature': {
        id: 'signature',
        values: {
          signature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAA...'
        },
        touched: new Set(['signature']),
        errors: {},
        isComplete: true,
        isValid: true
      }
    },
    isSubmitting: false,
    isComplete: true
  };

  const trackingId = 'ABC123';

  it('generates a valid JSON document from form state', () => {
    const jsonDocument = JsonDocumentGenerator.generateJsonDocument(mockFormState, trackingId);
    
    // Check metadata
    expect(jsonDocument.metadata.trackingId).toBe(trackingId);
    expect(jsonDocument.metadata.version).toBe('1.0.0');
    expect(jsonDocument.metadata.submissionDate).toBeDefined();
    
    // Check personal info
    expect(jsonDocument.personalInfo.fullName).toBe('John Doe');
    expect(jsonDocument.personalInfo.email).toBe('john.doe@example.com');
    expect(jsonDocument.personalInfo.phone).toBe('555-123-4567');
    
    // Check consents
    expect(jsonDocument.consents).toBeDefined();
    expect(jsonDocument.consents?.driverLicenseConsent).toBe(true);
    expect(jsonDocument.consents?.drugTestConsent).toBe(false);
    expect(jsonDocument.consents?.biometricConsent).toBe(true);
    expect(jsonDocument.consents?.nonBooleanValue).toBeUndefined();
    
    // Check timeline entries
    expect(jsonDocument.timeline.employmentHistory).toHaveLength(2);
    expect(jsonDocument.timeline.employmentHistory?.[0].company).toBe('Acme Inc');
    expect(jsonDocument.timeline.employmentHistory?.[1].isCurrent).toBe(true);
    
    expect(jsonDocument.timeline.residenceHistory).toHaveLength(2);
    expect(jsonDocument.timeline.residenceHistory?.[0].address).toBe('123 Main St');
    
    expect(jsonDocument.timeline.education).toHaveLength(1);
    expect(jsonDocument.timeline.education?.[0].institution).toBe('State University');
    
    expect(jsonDocument.timeline.professionalLicenses).toHaveLength(1);
    expect(jsonDocument.timeline.professionalLicenses?.[0].licenseNumber).toBe('PE12345');
    
    // Check signature
    expect(jsonDocument.signature.signatureImage).toBe(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAA...'
    );
    expect(jsonDocument.signature.signatureDate).toBeDefined();
  });

  it('generates a valid filename', () => {
    const filename = JsonDocumentGenerator.generateFilename(trackingId);
    
    // Should match pattern: truaverify_ABC123_YYYYMMDD.json
    expect(filename).toMatch(/^truaverify_ABC123_\d{8}\.json$/);
  });

  it('saves document to a formatted JSON string', () => {
    const jsonDocument = JsonDocumentGenerator.generateJsonDocument(mockFormState, trackingId);
    const jsonString = JsonDocumentGenerator.saveToString(jsonDocument);
    
    // Should be a valid JSON string
    expect(() => JSON.parse(jsonString)).not.toThrow();
    
    // Should be formatted with indentation
    expect(jsonString).toContain('  "metadata": {');
  });

  it('throws an error if personal info is missing', () => {
    const invalidFormState = { ...mockFormState };
    delete invalidFormState.steps['personal-info'];
    
    expect(() => {
      JsonDocumentGenerator.generateJsonDocument(invalidFormState, trackingId);
    }).toThrow('Personal information step is missing');
  });

  it('throws an error if signature is missing', () => {
    const invalidFormState = { ...mockFormState };
    delete invalidFormState.steps['signature'];
    
    expect(() => {
      JsonDocumentGenerator.generateJsonDocument(invalidFormState, trackingId);
    }).toThrow('Signature is missing');
  });

  it('throws an error if required personal info fields are missing', () => {
    const invalidFormState = JSON.parse(JSON.stringify(mockFormState)) as FormState;
    const personalInfoStep = invalidFormState.steps['personal-info'];
    
    if (personalInfoStep) {
      delete personalInfoStep.values.fullName;
      
      expect(() => {
        JsonDocumentGenerator.generateJsonDocument(invalidFormState, trackingId);
      }).toThrow('Full name is required in personal information');
    } else {
      fail('personal-info step should exist in the test form state');
    }
  });
});