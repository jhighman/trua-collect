/// <reference types="vite/client" />
import { FormState } from '../types/form';
import { Requirements } from '../types/requirements';
import { JsonDocument } from '../types/documents';
import { JsonDocumentGenerator } from './JsonDocumentGenerator';
import { PdfService } from './PdfService';
import { Logger } from '../utils/logger';
import {
  PersonalInfoStepValues,
  ResidenceHistoryStepValues,
  EmploymentHistoryStepValues,
  EducationStepValues,
  ProfessionalLicensesStepValues,
  SignatureStepValues
} from '../types/steps';
import jsPDF from 'jspdf';

/**
 * Service for handling document generation and storage
 */
export class DocumentService {
  private readonly CLAIMS_DIRECTORY = 'claims';
  private readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
  private jsonGenerator!: JsonDocumentGenerator;
  private pdfService: PdfService;
  private logger: Logger;

  constructor(logger?: Logger) {
    this.pdfService = new PdfService();
    this.logger = logger || new Logger('DocumentService');
  }

  /**
   * Generate a JSON document from form data
   * @param formState The complete form state
   * @param trackingId The unique tracking ID for this submission
   * @returns Promise resolving to the generated JSON document
   */
  public async generateJsonDocument(formState: FormState, trackingId: string): Promise<JsonDocument> {
    try {
      this.jsonGenerator = new JsonDocumentGenerator(formState);
      return this.jsonGenerator.generateJsonDocument(trackingId);
    } catch (error) {
      this.logger.error('Error generating JSON document:', error);
      throw new Error('Failed to generate JSON document');
    }
  }

  /**
   * Save a JSON document to storage
   * @param document The JSON document to save
   * @returns Promise resolving when the document is saved
   */
  public async saveJsonDocument(document: JsonDocument): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/documents/json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      });

      if (!response.ok) {
        throw new Error(`Failed to save JSON document: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Error saving JSON document:', error);
      throw error;
    }
  }

  /**
   * Generate and save a JSON document from form data
   * @param formState The complete form state
   * @param trackingId The unique tracking ID for this submission
   * @returns Promise resolving when the document is saved
   */
  public async generateAndSaveJsonDocument(formState: FormState, trackingId: string): Promise<void> {
    try {
      const document = await this.generateJsonDocument(formState, trackingId);
      await this.saveJsonDocument(document);
    } catch (error) {
      this.logger.error('Error generating and saving JSON document:', error);
      throw new Error('Failed to generate and save JSON document');
    }
  }

  /**
   * Get a JSON document by tracking ID
   * @param trackingId The unique tracking ID for the submission
   * @returns Promise resolving to the JSON document if found, null otherwise
   */
  public async getJsonDocument(trackingId: string): Promise<JsonDocument | null> {
    try {
      // In a real implementation, this would load from storage
      this.logger.info(`Would attempt to load JSON document for tracking ID: ${trackingId}`);
      return null;
    } catch (error) {
      this.logger.error('Error retrieving JSON document:', error);
      throw new Error('Failed to retrieve JSON document');
    }
  }

  /**
   * Check if a JSON document exists
   * @param trackingId The unique tracking ID for the submission
   * @returns Promise resolving to true if the document exists, false otherwise
   */
  public async documentExists(trackingId: string): Promise<boolean> {
    try {
      // In a real implementation, this would check storage
      this.logger.info(`Would check if JSON document exists for tracking ID: ${trackingId}`);
      return false;
    } catch (error) {
      this.logger.error('Error checking document existence:', error);
      throw new Error('Failed to check document existence');
    }
  }

  /**
   * Get a downloadable blob from a JSON document
   * @param document The JSON document to convert
   * @returns Blob containing the JSON data
   */
  public getJsonBlob(document: JsonDocument): Blob {
    try {
      const jsonString = JSON.stringify(document, null, 2);
      return new Blob([jsonString], { type: 'application/json' });
    } catch (error) {
      this.logger.error('Error creating JSON blob:', error);
      throw new Error('Failed to create JSON blob');
    }
  }

  /**
   * Validate a JSON document against the expected schema
   * @param document The JSON document to validate
   * @returns True if valid, throws error if invalid
   */
  public validateJsonDocument(document: JsonDocument): boolean {
    try {
      // Basic validation of required metadata fields
      if (!document.metadata?.trackingId) {
        throw new Error('Missing tracking ID in document metadata');
      }
      if (!document.metadata?.submissionDate) {
        throw new Error('Missing submission date in document metadata');
      }

      // Only validate personal info if that step was enabled
      if (document.personalInfo) {
        // Validate any provided personal info fields
        if (document.personalInfo.fullName && typeof document.personalInfo.fullName !== 'string') {
          throw new Error('Full name must be a string if provided');
        }
        if (document.personalInfo.email && typeof document.personalInfo.email !== 'string') {
          throw new Error('Email must be a string if provided');
        }
      }

      // Only validate signature if required
      if (document.signature) {
        if (!document.signature.signatureImage || !document.signature.signatureDate) {
          throw new Error('Missing required signature information');
        }
      }
      
      return true;
    } catch (error: unknown) {
      this.logger.error('Error validating JSON document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown validation error';
      throw new Error(`Invalid JSON document: ${errorMessage}`);
    }
  }

  /**
   * Generate documents from form state
   * @param formState The complete form state
   * @returns Promise resolving to the generated documents
   */
  public async generateDocuments(formState: FormState): Promise<{ json: JsonDocument; pdf: Blob }> {
    try {
      const signatureValues = formState.steps.signature?.values as { trackingId?: string } | undefined;
      const trackingId = signatureValues?.trackingId;
      
      if (!trackingId) {
        throw new Error('Missing tracking ID in form state');
      }

      // Generate JSON document first
      const jsonDocument = await this.generateJsonDocument(formState, trackingId);

      // Generate PDF document using the JSON document
      const pdfDocument = await this.pdfService.generatePdf(jsonDocument);

      return {
        json: jsonDocument,
        pdf: pdfDocument
      };
    } catch (error) {
      this.logger.error('Error generating documents:', error);
      throw error;
    }
  }

  public validateFormState(formState: FormState, requirements: Requirements): boolean {
    try {
      // Only validate required steps based on requirements
      if (requirements.personalInfo && !this.validatePersonalInfo(formState)) {
        return false;
      }

      if (requirements.residenceHistory && !this.validateResidenceHistory(formState)) {
        return false;
      }

      if (requirements.employmentHistory && !this.validateEmploymentHistory(formState)) {
        return false;
      }

      if (requirements.education && !this.validateEducation(formState)) {
        return false;
      }

      if (requirements.professionalLicenses && !this.validateProfessionalLicenses(formState)) {
        return false;
      }

      if (requirements.signature && !this.validateSignature(formState)) {
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error validating form state:', error);
      return false;
    }
  }

  private validatePersonalInfo(formState: FormState): boolean {
    const values = formState.steps['personal-info']?.values as PersonalInfoStepValues | undefined;
    return !!(values?.fullName && values?.email);
  }

  private validateResidenceHistory(formState: FormState): boolean {
    const values = formState.steps['residence-history']?.values as ResidenceHistoryStepValues | undefined;
    return !!(values?.entries && values.entries.length > 0);
  }

  private validateEmploymentHistory(formState: FormState): boolean {
    const values = formState.steps['employment-history']?.values as EmploymentHistoryStepValues | undefined;
    return !!(values?.entries && values.entries.length > 0);
  }

  private validateEducation(formState: FormState): boolean {
    const values = formState.steps.education?.values as EducationStepValues | undefined;
    return !!(values?.entries && values.entries.length > 0);
  }

  private validateProfessionalLicenses(formState: FormState): boolean {
    const values = formState.steps['professional-licenses']?.values as ProfessionalLicensesStepValues | undefined;
    return !!(values?.entries && values.entries.length > 0);
  }

  private validateSignature(formState: FormState): boolean {
    const values = formState.steps.signature?.values as SignatureStepValues | undefined;
    return !!(values?.signature && values?.confirmation);
  }

  public async saveDocuments(jsonDoc: JsonDocument, pdfDoc: Blob): Promise<void> {
    try {
      // Save JSON document
      await this.saveJsonDocument(jsonDoc);

      // Save PDF document
      await this.savePdfDocument(pdfDoc);
    } catch (error) {
      this.logger.error('Error saving documents:', error);
      throw error;
    }
  }

  private async savePdfDocument(pdfDoc: Blob): Promise<void> {
    try {
      const formData = new FormData();
      formData.append('file', pdfDoc, 'document.pdf');

      const response = await fetch('/api/documents/pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to save PDF document: ${response.statusText}`);
      }
    } catch (error) {
      this.logger.error('Error saving PDF document:', error);
      throw error;
    }
  }
}