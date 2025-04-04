import { FormState } from '../context/FormContext';
import { jsPDF } from 'jspdf';
import { JsonDocument, EmploymentHistoryEntry, ResidenceHistoryEntry, EducationEntry, ProfessionalLicenseEntry } from '../types/documents';
import { SignatureStepValues } from '../utils/FormStateManager';

/**
 * Generate a PDF document from form data
 * 
 * @param formState The complete form state
 * @param trackingId The unique tracking ID for this submission
 * @returns The generated PDF document
 */
export const generatePdfDocument = (formState: FormState, trackingId: string): jsPDF => {
  const doc = new jsPDF();
  let yPos = 20;
  
  // Add title
  doc.setFontSize(20);
  doc.text('TruaVerify Submission', 105, yPos, { align: 'center' });
  
  // Add tracking ID
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Tracking ID: ${trackingId}`, 105, yPos, { align: 'center' });
  yPos += 8;
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });
  
  // Add personal information
  if (formState.steps['personal-info']?.values) {
    const personalInfo = formState.steps['personal-info'].values;
    
    yPos += 12;
    doc.setFontSize(16);
    doc.text('Personal Information', 14, yPos);
    
    yPos += 5;
    
    // Create a simple table manually
    // Draw header
    doc.setFillColor(66, 139, 202);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, yPos, 80, 10, 'F');
    doc.rect(94, yPos, 100, 10, 'F');
    doc.setFontSize(12);
    doc.text('Field', 16, yPos + 7);
    doc.text('Value', 96, yPos + 7);
    
    // Draw rows
    yPos += 10;
    doc.setTextColor(0, 0, 0);
    
    Object.entries(personalInfo).forEach(([key, value], index) => {
      if (value !== undefined) {
        // Format key from camelCase to Title Case
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());
        
        // Set background color for alternating rows
        if (index % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(14, yPos, 80, 10, 'F');
          doc.rect(94, yPos, 100, 10, 'F');
        }
        
        doc.text(formattedKey, 16, yPos + 7);
        doc.text(String(value), 96, yPos + 7);
        
        yPos += 10;
      }
    });
  }
  
  // Add signature if available
  const signatureStep = formState.steps['signature'];
  if (signatureStep?.values && (signatureStep.values as SignatureStepValues).signature) {
    const signatureData = (signatureStep.values as SignatureStepValues).signature;
    
    // Add some space after the table
    yPos += 20;
    
    doc.setFontSize(16);
    doc.text('Signature', 14, yPos);
    
    // Add signature image if it's a data URL
    if (typeof signatureData === 'string' && signatureData.startsWith('data:image')) {
      doc.addImage(signatureData, 'PNG', 14, yPos + 5, 80, 40);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, yPos + 50);
    }
  }
  
  return doc;
};

/**
 * Generate a PDF document from a JSON document
 * 
 * @param jsonDocument The JSON document
 * @returns The generated PDF document
 */
export const generatePdfFromJson = (jsonDocument: JsonDocument): jsPDF => {
  const doc = new jsPDF();
  let yPos = 20;
  
  // Add title
  doc.setFontSize(20);
  doc.text('TruaVerify Submission', 105, yPos, { align: 'center' });
  
  // Add tracking ID and date from metadata
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Tracking ID: ${jsonDocument.metadata.trackingId}`, 105, yPos, { align: 'center' });
  yPos += 8;
  doc.text(`Date: ${new Date(jsonDocument.metadata.submissionDate).toLocaleDateString()}`, 105, yPos, { align: 'center' });
  
  // Add personal information
  if (jsonDocument.personalInfo) {
    yPos += 12;
    doc.setFontSize(16);
    doc.text('Personal Information', 14, yPos);
    
    yPos += 5;
    
    // Create a simple table manually
    // Draw header
    doc.setFillColor(66, 139, 202);
    doc.setTextColor(255, 255, 255);
    doc.rect(14, yPos, 80, 10, 'F');
    doc.rect(94, yPos, 100, 10, 'F');
    doc.setFontSize(12);
    doc.text('Field', 16, yPos + 7);
    doc.text('Value', 96, yPos + 7);
    
    // Draw rows
    yPos += 10;
    doc.setTextColor(0, 0, 0);
    
    Object.entries(jsonDocument.personalInfo).forEach(([key, value], index) => {
      if (value !== undefined) {
        // Format key from camelCase to Title Case
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, (str) => str.toUpperCase());
        
        // Set background color for alternating rows
        if (index % 2 === 0) {
          doc.setFillColor(240, 240, 240);
          doc.rect(14, yPos, 80, 10, 'F');
          doc.rect(94, yPos, 100, 10, 'F');
        }
        
        doc.text(formattedKey, 16, yPos + 7);
        doc.text(String(value), 96, yPos + 7);
        
        yPos += 10;
      }
    });
  }

  // Add timeline sections
  if (jsonDocument.timeline) {
    // Employment History
    if (jsonDocument.timeline.employmentTimeline?.entries.length) {
      yPos += 20;
      doc.setFontSize(16);
      doc.text('Employment History', 14, yPos);
      yPos += 10;
      
      jsonDocument.timeline.employmentTimeline.entries.forEach((entry: EmploymentHistoryEntry) => {
        doc.setFontSize(14);
        doc.text(`${entry.employer} - ${entry.position}`, 14, yPos);
        yPos += 7;
        doc.setFontSize(12);
        doc.text(`${entry.startDate} - ${entry.endDate}`, 14, yPos);
        if (entry.description) {
          yPos += 7;
          doc.text(entry.description, 14, yPos);
        }
        yPos += 10;
      });
    }

    // Residence History
    if (jsonDocument.timeline.residenceTimeline?.entries.length) {
      yPos += 20;
      doc.setFontSize(16);
      doc.text('Residence History', 14, yPos);
      yPos += 10;
      
      jsonDocument.timeline.residenceTimeline.entries.forEach((entry: ResidenceHistoryEntry) => {
        doc.setFontSize(14);
        doc.text(`${entry.address}, ${entry.city}, ${entry.state_province} ${entry.zip_postal}`, 14, yPos);
        yPos += 7;
        doc.setFontSize(12);
        doc.text(`${entry.startDate} - ${entry.endDate}`, 14, yPos);
        yPos += 10;
      });
    }

    // Education
    if (jsonDocument.timeline.educationTimeline?.entries.length) {
      yPos += 20;
      doc.setFontSize(16);
      doc.text('Education', 14, yPos);
      yPos += 10;
      
      jsonDocument.timeline.educationTimeline.entries.forEach((entry: EducationEntry) => {
        doc.setFontSize(14);
        doc.text(`${entry.institution} - ${entry.degree}`, 14, yPos);
        yPos += 7;
        doc.setFontSize(12);
        doc.text(`${entry.startDate} - ${entry.endDate}`, 14, yPos);
        if (entry.fieldOfStudy) {
          yPos += 7;
          doc.text(`Field: ${entry.fieldOfStudy}`, 14, yPos);
        }
        yPos += 10;
      });
    }

    // Professional Licenses
    if (jsonDocument.timeline.licensesTimeline?.entries.length) {
      yPos += 20;
      doc.setFontSize(16);
      doc.text('Professional Licenses', 14, yPos);
      yPos += 10;
      
      jsonDocument.timeline.licensesTimeline.entries.forEach((entry: ProfessionalLicenseEntry) => {
        doc.setFontSize(14);
        doc.text(`${entry.licenseType} - ${entry.licenseNumber}`, 14, yPos);
        yPos += 7;
        doc.setFontSize(12);
        doc.text(`Issued by: ${entry.issuingAuthority}`, 14, yPos);
        yPos += 7;
        doc.text(`Issue Date: ${entry.issueDate}`, 14, yPos);
        yPos += 7;
        doc.text(`Expiration: ${entry.isActive ? entry.expirationDate : 'Inactive'}`, 14, yPos);
        yPos += 10;
      });
    }
  }
  
  // Add signature if available
  if (jsonDocument.signature) {
    // Add some space after the table
    yPos += 20;
    
    doc.setFontSize(16);
    doc.text('Signature', 14, yPos);
    
    // Add signature image if it's a data URL
    if (jsonDocument.signature.signatureImage.startsWith('data:image')) {
      doc.addImage(jsonDocument.signature.signatureImage, 'PNG', 14, yPos + 5, 80, 40);
      doc.text(`Date: ${new Date(jsonDocument.signature.signatureDate).toLocaleDateString()}`, 14, yPos + 50);
    }
  }
  
  return doc;
};

/**
 * Generate a filename for the PDF document
 *
 * @param trackingId The unique tracking ID for this submission
 * @returns A filename in the format truaverify_<tracking_id>_<date>.pdf
 */
export const generateFilename = (trackingId: string): string => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `truaverify_${trackingId}_${date}.pdf`;
};

/**
 * Save a PDF document to a Blob
 *
 * @param doc The jsPDF document instance
 * @returns A Blob containing the PDF data
 */
export const saveToBlob = (doc: jsPDF): Blob => {
  const pdfOutput = doc.output('blob');
  return pdfOutput;
};

/**
 * Save a PDF document to a data URL
 *
 * @param doc The jsPDF document instance
 * @returns A data URL containing the PDF data
 */
export const saveToDataUrl = (doc: jsPDF): string => {
  const pdfOutput = doc.output('datauristring');
  return pdfOutput;
};