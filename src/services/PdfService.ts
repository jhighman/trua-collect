import { FormState } from '../context/FormContext';
import {
  generatePdfDocument,
  generatePdfFromJson,
  generateFilename,
  saveToBlob,
  saveToDataUrl
} from '../utils/PdfDocumentGenerator';
import { JsonDocument } from '../types/documents';
import jsPDF from 'jspdf';
import { Logger } from '../utils/logger';
import { 
  ResidenceHistoryEntry, 
  EmploymentHistoryEntry,
  EducationEntry,
  ProfessionalLicenseEntry 
} from '../types/documents';

/**
 * Service for handling PDF document generation and storage
 */
export class PdfService {
  private readonly CLAIMS_DIRECTORY = 'claims';
  private logger: Logger;

  constructor() {
    this.logger = new Logger('PdfService');
  }

  /**
   * Generate a verification PDF from form state
   * @param formState The current form state
   * @returns Promise resolving to the generated PDF document
   */
  public async generateVerificationPdf(formState: FormState): Promise<jsPDF> {
    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text('Verification Document', 20, 20);

      // Add personal information
      if (formState.personalInfo?.entries[0]) {
        const personalInfo = formState.personalInfo.entries[0];
        doc.setFontSize(14);
        doc.text('Personal Information', 20, 40);
        doc.setFontSize(12);
        doc.text(`Full Name: ${personalInfo.fullName}`, 30, 50);
        doc.text(`Email: ${personalInfo.email}`, 30, 60);
      }

      // Add residence history
      if (formState.residenceHistory?.entries) {
        doc.setFontSize(14);
        doc.text('Residence History', 20, 80);
        doc.setFontSize(12);
        formState.residenceHistory.entries.forEach((entry, index) => {
          const y = 90 + (index * 20);
          doc.text(`${entry.address}`, 30, y);
          doc.text(`${entry.startDate} - ${entry.endDate}`, 30, y + 10);
        });
      }

      // Add employment history
      if (formState.employmentHistory?.entries) {
        doc.setFontSize(14);
        doc.text('Employment History', 20, 140);
        doc.setFontSize(12);
        formState.employmentHistory.entries.forEach((entry, index) => {
          const y = 150 + (index * 30);
          doc.text(`${entry.employer}`, 30, y);
          doc.text(`Position: ${entry.position}`, 30, y + 10);
          doc.text(`${entry.startDate} - ${entry.endDate}`, 30, y + 20);
        });
      }

      // Add education
      if (formState.education?.entries) {
        doc.setFontSize(14);
        doc.text('Education', 20, 200);
        doc.setFontSize(12);
        formState.education.entries.forEach((entry, index) => {
          const y = 210 + (index * 30);
          doc.text(`${entry.institution}`, 30, y);
          doc.text(`Degree: ${entry.degree}`, 30, y + 10);
          doc.text(`Completion Date: ${entry.completionDate}`, 30, y + 20);
        });
      }

      // Add professional licenses
      if (formState.professionalLicenses?.entries) {
        doc.setFontSize(14);
        doc.text('Professional Licenses', 20, 260);
        doc.setFontSize(12);
        formState.professionalLicenses.entries.forEach((entry, index) => {
          const y = 270 + (index * 40);
          doc.text(`${entry.licenseType}`, 30, y);
          doc.text(`License Number: ${entry.licenseNumber}`, 30, y + 10);
          doc.text(`Expiration Date: ${entry.expirationDate}`, 30, y + 20);
          doc.text(`Issuing Authority: ${entry.issuingAuthority}`, 30, y + 30);
        });
      }

      // Add signature
      if (formState.signature?.entries[0]) {
        const signature = formState.signature.entries[0];
        doc.setFontSize(14);
        doc.text('Signature', 20, 320);
        doc.setFontSize(12);
        doc.text(`Date: ${signature.signatureDate}`, 30, 330);
        // Add signature image if available
        if (signature.signatureImage) {
          doc.addImage(signature.signatureImage, 'PNG', 30, 340, 50, 20);
        }
      }

      return doc;
    } catch (error) {
      this.logger.error('Error generating PDF:', error);
      throw error;
    }
  }

  /**
   * Generate a PDF document from a JSON document
   */
  public async generatePdfFromJson(jsonDocument: JsonDocument): Promise<jsPDF> {
    try {
      return generatePdfFromJson(jsonDocument);
    } catch (error) {
      console.error('Error generating PDF from JSON:', error);
      throw new Error('Failed to generate PDF from JSON document');
    }
  }

  /**
   * Save a PDF document to storage
   */
  public async savePdfDocument(doc: jsPDF, trackingId: string): Promise<string> {
    try {
      const filename = generateFilename(trackingId);
      const blob = saveToBlob(doc);
      
      // In a real implementation, this would save to a file or database
      const filePath = `${this.CLAIMS_DIRECTORY}/${filename}`;
      
      console.log(`PDF document would be saved to: ${filePath}`);
      console.log(`Document size: ${Math.round(blob.size / 1024)} KB`);
      
      return filePath;
    } catch (error) {
      console.error('Error saving PDF:', error);
      throw new Error('Failed to save PDF document');
    }
  }

  /**
   * Get a data URL for the PDF document
   */
  public getPdfDataUrl(doc: jsPDF): string {
    try {
      return saveToDataUrl(doc);
    } catch (error) {
      console.error('Error generating PDF data URL:', error);
      throw new Error('Failed to generate PDF data URL');
    }
  }

  /**
   * Generate a tracking ID for the document
   * @returns A unique tracking ID
   */
  private generateTrackingId(): string {
    return `TV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if a PDF document exists
   */
  public async documentExists(trackingId: string): Promise<boolean> {
    try {
      // In a real implementation, this would check storage
      console.log(`Would check if PDF document exists for tracking ID: ${trackingId}`);
      return false;
    } catch (error) {
      console.error('Error checking document existence:', error);
      throw new Error('Failed to check document existence');
    }
  }

  public async generatePdf(jsonDocument: JsonDocument): Promise<Blob> {
    try {
      // In a real implementation, this would use a PDF generation library
      // For now, we'll create a simple PDF blob
      const pdfContent = this.generatePdfContent(jsonDocument);
      return new Blob([pdfContent], { type: 'application/pdf' });
    } catch (error) {
      this.logger.error('Error generating PDF:', error);
      throw error;
    }
  }

  private generatePdfContent(jsonDocument: JsonDocument): string {
    // This is a placeholder implementation
    // In a real application, you would use a proper PDF generation library
    return `
      Document ID: ${jsonDocument.metadata.trackingId}
      Generated: ${jsonDocument.metadata.submissionDate}
      Version: ${jsonDocument.metadata.version}
      ${jsonDocument.metadata.referenceToken ? `Reference: ${jsonDocument.metadata.referenceToken}` : ''}
      
      Timeline:
      From: ${jsonDocument.timeline.startDate}
      To: ${jsonDocument.timeline.endDate}
      
      ${jsonDocument.personalInfo ? `
      Personal Information:
      Full Name: ${jsonDocument.personalInfo.fullName}
      Email: ${jsonDocument.personalInfo.email}
      ${jsonDocument.personalInfo.phone ? `Phone: ${jsonDocument.personalInfo.phone}` : ''}
      ` : ''}
      
      ${jsonDocument.residenceHistory ? `
      Residence History:
      ${jsonDocument.residenceHistory.map((entry: ResidenceHistoryEntry) => `
        Address: ${entry.address}
        From: ${entry.startDate}
        To: ${entry.endDate}
      `).join('\n')}
      ` : ''}
      
      ${jsonDocument.employmentHistory ? `
      Employment History:
      ${jsonDocument.employmentHistory.map((entry: EmploymentHistoryEntry) => `
        Employer: ${entry.employer}
        Position: ${entry.position}
        From: ${entry.startDate}
        To: ${entry.endDate}
      `).join('\n')}
      ` : ''}
      
      ${jsonDocument.education ? `
      Education:
      ${jsonDocument.education.map((entry: EducationEntry) => `
        Institution: ${entry.institution}
        Degree: ${entry.degree}
        Completion Date: ${entry.completionDate}
      `).join('\n')}
      ` : ''}
      
      ${jsonDocument.professionalLicenses ? `
      Professional Licenses:
      ${jsonDocument.professionalLicenses.map((entry: ProfessionalLicenseEntry) => `
        License Type: ${entry.licenseType}
        License Number: ${entry.licenseNumber}
        Expiration Date: ${entry.expirationDate}
      `).join('\n')}
      ` : ''}
      
      ${jsonDocument.signature ? `
      Signature:
      Date: ${jsonDocument.signature.signatureDate}
      Confirmation: ${jsonDocument.signature.confirmation ? 'Yes' : 'No'}
      ` : ''}
    `;
  }
}