import { FormState } from '../context/FormContext';
import type { ProfessionalLicenseEntry } from './FormStateManager';

/**
 * Interface for the JSON document structure
 */
export interface JsonDocument {
  metadata: {
    trackingId: string;
    referenceToken?: string;
    submissionDate: string;
    version: string;
  };
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    [key: string]: string | number | boolean | undefined;
  };
  consents?: {
    [key: string]: boolean;
  };
  timeline: {
    employmentHistory?: Array<{
      company: string;
      position: string;
      startDate: string;
      endDate: string | null;
      isCurrent: boolean;
      description?: string;
      contactInfo?: {
        name: string;
        email?: string;
        phone?: string;
      };
      [key: string]: string | number | boolean | null | undefined | object;
    }>;
    residenceHistory?: Array<{
      address: string;
      city: string;
      state: string;
      zipCode: string;
      startDate: string;
      endDate: string | null;
      isCurrent: boolean;
      [key: string]: string | number | boolean | null | undefined | object;
    }>;
    education?: Array<{
      institution: string;
      degree: string;
      field?: string;
      startDate: string;
      endDate: string | null;
      isCurrent: boolean;
      [key: string]: string | number | boolean | null | undefined | object;
    }>;
    professionalLicenses?: Array<{
      licenseType: string;
      licenseNumber: string;
      issuingAuthority: string;
      issueDate: string;
      expirationDate: string | null;
      isActive: boolean;
      [key: string]: string | number | boolean | null | undefined | object;
    }>;
  };
  signature: {
    signatureImage: string; // Base64 encoded image
    signatureDate: string;
  };
}

/**
 * Class for generating JSON documents from form data
 */
export class JsonDocumentGenerator {
  /**
   * Generate a JSON document from form state
   * 
   * @param formState The complete form state
   * @param trackingId The unique tracking ID for this submission
   * @returns A structured JSON document
   */
  public static generateJsonDocument(formState: FormState, trackingId: string): JsonDocument {
    const now = new Date();
    const submissionDate = now.toISOString();
    
    // Check for signature first to ensure it exists
    const signature = this.extractSignature(formState);
    
    // Get reference token if available
    const referenceToken = (formState as FormState & { referenceToken?: string }).referenceToken;
    
    // Create the base document structure
    const document: JsonDocument = {
      metadata: {
        trackingId,
        submissionDate,
        version: '1.0.0'
      },
      personalInfo: this.extractPersonalInfo(formState),
      timeline: this.extractTimeline(formState),
      signature: signature
    };
    
    // Add reference token if available
    if (referenceToken) {
      document.metadata.referenceToken = referenceToken;
    }
    
    // Add consents if available
    const consents = this.extractConsents(formState);
    if (Object.keys(consents).length > 0) {
      document.consents = consents;
    }
    
    return document;
  }
  
  /**
   * Extract personal information from form state
   */
  private static extractPersonalInfo(formState: FormState): JsonDocument['personalInfo'] {
    const personalInfoStep = formState.steps['personal-info'];
    if (!personalInfoStep) {
      throw new Error('Personal information step is missing');
    }
    
    const values = personalInfoStep.values;
    
    // Ensure required fields are present and have correct types
    if (!values.fullName || typeof values.fullName !== 'string') {
      throw new Error('Full name is required in personal information and must be a string');
    }
    
    if (!values.email || typeof values.email !== 'string') {
      throw new Error('Email is required in personal information and must be a string');
    }
    
    // Extract all values from the personal info step
    const personalInfo: JsonDocument['personalInfo'] = {
      fullName: values.fullName,
      email: values.email
    };

    // Add any additional fields that are strings
    Object.entries(values).forEach(([key, value]) => {
      if (key !== 'fullName' && key !== 'email' && typeof value === 'string') {
        personalInfo[key] = value;
      }
    });

    return personalInfo;
  }
  
  /**
   * Extract consents from form state
   */
  private static extractConsents(formState: FormState): Record<string, boolean> {
    const consentsStep = formState.steps['consents'];
    if (!consentsStep) {
      return {};
    }
    
    // Filter out non-boolean values
    return Object.entries(consentsStep.values)
      .filter(([_, value]) => typeof value === 'boolean')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  }
  
  /**
   * Extract timeline entries from form state
   */
  private static extractTimeline(formState: FormState): JsonDocument['timeline'] {
    const timeline: JsonDocument['timeline'] = {};
    
    // Extract employment history
    const employmentStep = formState.steps['employment-history'];
    if (employmentStep?.values.entries && Array.isArray(employmentStep.values.entries)) {
      timeline.employmentHistory = employmentStep.values.entries as JsonDocument['timeline']['employmentHistory'];
    }
    
    // Extract residence history
    const residenceStep = formState.steps['residence-history'];
    if (residenceStep?.values.entries && Array.isArray(residenceStep.values.entries)) {
      timeline.residenceHistory = residenceStep.values.entries as JsonDocument['timeline']['residenceHistory'];
    }
    
    // Extract education
    const educationStep = formState.steps['education'];
    if (educationStep?.values.entries && Array.isArray(educationStep.values.entries)) {
      timeline.education = educationStep.values.entries as JsonDocument['timeline']['education'];
    }
    
    // Extract professional licenses
    const licensesStep = formState.steps['professional-licenses'];
    if (licensesStep?.values.entries && Array.isArray(licensesStep.values.entries)) {
      const licenseEntries = (licensesStep.values.entries as ProfessionalLicenseEntry[]).map(entry => ({
        licenseType: entry.licenseType,
        licenseNumber: entry.licenseNumber,
        issuingAuthority: entry.issuingAuthority,
        issueDate: entry.startDate,
        expirationDate: entry.endDate,
        isActive: entry.isCurrent,
        // Preserve any additional fields from the entry
        ...Object.entries(entry)
          .filter(([key]) => !['startDate', 'endDate', 'isCurrent', 'licenseType', 'licenseNumber', 'issuingAuthority'].includes(key))
          .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
      }));
      timeline.professionalLicenses = licenseEntries;
    }
    
    return timeline;
  }
  
  /**
   * Extract signature from form state
   */
  private static extractSignature(formState: FormState): JsonDocument['signature'] {
    const signatureStep = formState.steps['signature'];
    if (!signatureStep?.values.signature || typeof signatureStep.values.signature !== 'string') {
      throw new Error('Signature is required and must be a string');
    }
    
    return {
      signatureImage: signatureStep.values.signature,
      signatureDate: new Date().toISOString()
    };
  }
  
  /**
   * Generate a filename for the JSON document
   * 
   * @param trackingId The unique tracking ID for this submission
   * @returns A filename in the format truaverify_<tracking_id>_<date>.json
   */
  public static generateFilename(trackingId: string): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    return `truaverify_${trackingId}_${dateStr}.json`;
  }
  
  /**
   * Save the JSON document to a string
   * 
   * @param document The JSON document to save
   * @returns A formatted JSON string
   */
  public static saveToString(document: JsonDocument): string {
    return JSON.stringify(document, null, 2);
  }
}