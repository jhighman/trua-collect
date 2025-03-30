import { FormState } from '../context/FormContext';
import { jsPDF } from 'jspdf';
import { JsonDocument } from './JsonDocumentGenerator';

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
  if (formState.steps['personal-info']) {
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
    });
  }
  
  // Add signature if available
  if (formState.steps['signature'] && formState.steps['signature'].values.signature) {
    const signatureData = formState.steps['signature'].values.signature;
    
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
    });
  }
  
  // Add signature if available
  if (jsonDocument.signature && jsonDocument.signature.signatureImage) {
    const signatureData = jsonDocument.signature.signatureImage;
    
    // Add some space after the table
    yPos += 20;
    
    doc.setFontSize(16);
    doc.text('Signature', 14, yPos);
    
    // Add signature image if it's a data URL
    if (signatureData.startsWith('data:image')) {
      doc.addImage(signatureData, 'PNG', 14, yPos + 5, 80, 40);
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
  const dataUrl = doc.output('datauristring');
  return dataUrl;
};