/* eslint-disable no-console */
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
  private jsonGenerator: JsonDocumentGenerator;
  private pdfService: PdfService;
  private logger: Logger;

  constructor() {
    this.jsonGenerator = new JsonDocumentGenerator();
    this.pdfService = new PdfService();
    this.logger = new Logger('DocumentService');
  }

  /**
   * Generate a JSON document from form data
   * @param formState The complete form state
   * @param trackingId The unique tracking ID for this submission
   * @returns Promise resolving to the generated JSON document
   */
  public async generateJsonDocument(formState: FormState, trackingId: string): Promise<JsonDocument> {
    try {
      return this.jsonGenerator.generateJsonDocument(formState, trackingId);
    } catch (error) {
      this.logger.error('Error generating JSON document:', error);
      throw new Error('Failed to generate JSON document');
    }
  }

  /**
   * Save a JSON document to storage
   * @param document The JSON document to save
   * @param trackingId The unique tracking ID for this submission
   * @returns Promise resolving to the path where the document was saved
   */
  public async saveJsonDocument(document: JsonDocument): Promise<void> {
    try {
      const response = await fetch('/api/documents/json', {
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
   * @returns Promise resolving to the saved document path
   */
  public async generateAndSaveJsonDocument(
    formState: FormState, 
    trackingId: string
  ): Promise<string> {
    try {
      const document = await this.generateJsonDocument(formState, trackingId);
      return this.saveJsonDocument(document);
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
      const jsonString = this.jsonGenerator.saveToString(document);
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

  public async generateDocuments(formState: FormState, requirements: Requirements) {
    try {
      // Validate form state before generating documents
      if (!this.validateFormState(formState, requirements)) {
        throw new Error('Form validation failed');
      }

      // Generate JSON document first
      const jsonDocument = this.jsonGenerator.generateJsonDocument(formState, requirements);

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

  public async saveDocuments(jsonDoc: JsonDocument, pdfDoc: jsPDF): Promise<void> {
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

  private async savePdfDocument(pdfDoc: jsPDF): Promise<void> {
    try {
      const pdfBlob = pdfDoc.output('blob');
      const formData = new FormData();
      formData.append('file', pdfBlob, 'document.pdf');

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