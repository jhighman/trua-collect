import { FormState } from '../context/FormContext';

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
    
    // Ensure required fields are present
    if (!values.fullName) {
      throw new Error('Full name is required in personal information');
    }
    
    if (!values.email) {
      throw new Error('Email is required in personal information');
    }
    
    // Extract all values from the personal info step
    return {
      fullName: values.fullName,
      email: values.email,
      ...values
    };
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
    if (employmentStep && employmentStep.values.entries) {
      timeline.employmentHistory = employmentStep.values.entries;
    }
    
    // Extract residence history
    const residenceStep = formState.steps['residence-history'];
    if (residenceStep && residenceStep.values.entries) {
      timeline.residenceHistory = residenceStep.values.entries;
    }
    
    // Extract education
    const educationStep = formState.steps['education'];
    if (educationStep && educationStep.values.entries) {
      timeline.education = educationStep.values.entries;
    }
    
    // Extract professional licenses
    const licensesStep = formState.steps['professional-licenses'];
    if (licensesStep && licensesStep.values.entries) {
      timeline.professionalLicenses = licensesStep.values.entries;
    }
    
    return timeline;
  }
  
  /**
   * Extract signature from form state
   */
  private static extractSignature(formState: FormState): JsonDocument['signature'] {
    const signatureStep = formState.steps['signature'];
    if (!signatureStep || !signatureStep.values.signature) {
      throw new Error('Signature is missing');
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