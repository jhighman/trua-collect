import { FormState } from '../context/FormContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable'; // For table support
import { JsonDocument } from './JsonDocumentGenerator';

// Define interfaces for timeline entries
interface EmploymentEntry {
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
  [key: string]: any;
}

interface ResidenceEntry {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  [key: string]: any;
}

interface EducationEntry {
  institution: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  [key: string]: any;
}

interface ProfessionalLicenseEntry {
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expirationDate: string | null;
  isActive: boolean;
  [key: string]: any;
}

/**
 * Class for generating PDF documents from form data
 */
export class PdfDocumentGenerator {
  // PDF styling constants
  private static readonly PAGE_WIDTH = 210; // A4 width in mm
  private static readonly PAGE_MARGIN = 20; // Margin in mm
  private static readonly CONTENT_WIDTH = PdfDocumentGenerator.PAGE_WIDTH - (2 * PdfDocumentGenerator.PAGE_MARGIN);
  private static readonly PRIMARY_COLOR = '#3182ce'; // Blue color for headings
  private static readonly SECONDARY_COLOR = '#4a5568'; // Gray for text
  
  /**
   * Generate a PDF document from form state
   * 
   * @param formState The complete form state
   * @param trackingId The unique tracking ID for this submission
   * @returns A jsPDF document instance
   */
  public static generatePdfDocument(formState: FormState, trackingId: string): jsPDF {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set default font
    doc.setFont('helvetica');
    
    // Add document metadata
    doc.setProperties({
      title: `Trua Verify - ${trackingId}`,
      subject: 'Employment Verification',
      author: 'Trua Verify System',
      keywords: 'verification, employment, background check',
      creator: 'Trua Verify PDF Generator'
    });
    
    // Generate document content
    this.addHeader(doc, trackingId);
    this.addPersonalInfo(doc, formState);
    this.addConsents(doc, formState);
    this.addTimeline(doc, formState);
    this.addSignature(doc, formState);
    this.addAttestation(doc);
    this.addFooter(doc, trackingId);
    
    return doc;
  }
  
  /**
   * Generate a PDF document from a JSON document
   * 
   * @param jsonDocument The JSON document
   * @returns A jsPDF document instance
   */
  public static generatePdfFromJson(jsonDocument: JsonDocument): jsPDF {
    // Create new PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set default font
    doc.setFont('helvetica');
    
    // Add document metadata
    doc.setProperties({
      title: `Trua Verify - ${jsonDocument.metadata.trackingId}`,
      subject: 'Employment Verification',
      author: 'Trua Verify System',
      keywords: 'verification, employment, background check',
      creator: 'Trua Verify PDF Generator'
    });
    
    // Generate document content from JSON
    this.addHeaderFromJson(doc, jsonDocument);
    this.addPersonalInfoFromJson(doc, jsonDocument);
    this.addConsentsFromJson(doc, jsonDocument);
    this.addTimelineFromJson(doc, jsonDocument);
    this.addSignatureFromJson(doc, jsonDocument);
    this.addAttestation(doc);
    this.addFooterFromJson(doc, jsonDocument);
    
    return doc;
  }
  
  /**
   * Generate a filename for the PDF document
   * 
   * @param trackingId The unique tracking ID for this submission
   * @returns A filename in the format truaverify_<tracking_id>_<date>.pdf
   */
  public static generateFilename(trackingId: string): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
    return `truaverify_${trackingId}_${dateStr}.pdf`;
  }
  
  /**
   * Save the PDF document to a Blob
   * 
   * @param doc The jsPDF document instance
   * @returns A Blob containing the PDF data
   */
  public static saveToBlob(doc: jsPDF): Blob {
    return doc.output('blob');
  }
  
  /**
   * Save the PDF document to a data URL
   * 
   * @param doc The jsPDF document instance
   * @returns A data URL containing the PDF data
   */
  public static saveToDataUrl(doc: jsPDF): string {
    return doc.output('datauristring');
  }
  
  // Private helper methods for document generation
  
  /**
   * Add document header
   */
  private static addHeader(doc: jsPDF, trackingId: string): void {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    
    // Add logo (would be an image in a real implementation)
    doc.setFontSize(24);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('TRUA VERIFY', this.PAGE_MARGIN, 20);
    
    // Add document title
    doc.setFontSize(16);
    doc.setTextColor(this.SECONDARY_COLOR);
    doc.text('Employment Verification Report', this.PAGE_MARGIN, 30);
    
    // Add tracking ID and date
    doc.setFontSize(10);
    doc.text(`Tracking ID: ${trackingId}`, this.PAGE_MARGIN, 40);
    doc.text(`Date: ${dateStr}`, this.PAGE_MARGIN, 45);
    
    // Add horizontal line
    doc.setDrawColor(this.PRIMARY_COLOR);
    doc.setLineWidth(0.5);
    doc.line(this.PAGE_MARGIN, 50, this.PAGE_WIDTH - this.PAGE_MARGIN, 50);
    
    // Reset position for next section
    doc.setY(60);
  }
  
  /**
   * Add personal information section
   */
  private static addPersonalInfo(doc: jsPDF, formState: FormState): void {
    const personalInfoStep = formState.steps['personal-info'];
    if (!personalInfoStep) {
      return;
    }
    
    const values = personalInfoStep.values;
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Personal Information', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 10);
    
    // Personal info table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = [
      ['Full Name', values.fullName || ''],
      ['Email', values.email || ''],
      ['Phone', values.phone || '']
    ];
    
    // Add any additional fields that might be present
    Object.entries(values)
      .filter(([key]) => !['fullName', 'email', 'phone'].includes(key))
      .forEach(([key, value]) => {
        // Format key from camelCase to Title Case
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        
        tableData.push([formattedKey, value?.toString() || '']);
      });
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: doc.getY(),
      head: [['Field', 'Value']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.PRIMARY_COLOR },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });
    
    // Reset position for next section
    doc.setY(doc.autoTable.previous.finalY + 10);
  }
  
  /**
   * Add consents section
   */
  private static addConsents(doc: jsPDF, formState: FormState): void {
    const consentsStep = formState.steps['consents'];
    if (!consentsStep) {
      return;
    }
    
    const values = consentsStep.values;
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Consents', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 10);
    
    // Consents table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = Object.entries(values)
      .filter(([_, value]) => typeof value === 'boolean')
      .map(([key, value]) => {
        // Format key from camelCase to Title Case
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        
        return [formattedKey, value ? 'Yes' : 'No'];
      });
    
    if (tableData.length > 0) {
      // @ts-ignore - jspdf-autotable adds this method
      doc.autoTable({
        startY: doc.getY(),
        head: [['Consent Type', 'Provided']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: this.PRIMARY_COLOR },
        margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
      });
      
      // Reset position for next section
      doc.setY(doc.autoTable.previous.finalY + 10);
    } else {
      doc.text('No consents provided.', this.PAGE_MARGIN, doc.getY());
      doc.setY(doc.getY() + 10);
    }
  }
  
  /**
   * Add timeline section
   */
  private static addTimeline(doc: jsPDF, formState: FormState): void {
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Timeline', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 10);
    
    // Add employment history
    this.addEmploymentHistory(doc, formState);
    
    // Add residence history
    this.addResidenceHistory(doc, formState);
    
    // Add education history
    this.addEducationHistory(doc, formState);
    
    // Add professional licenses
    this.addProfessionalLicenses(doc, formState);
  }
  
  /**
   * Add employment history section
   */
  private static addEmploymentHistory(doc: jsPDF, formState: FormState): void {
    const employmentStep = formState.steps['employment-history'];
    if (!employmentStep || !employmentStep.values.entries || employmentStep.values.entries.length === 0) {
      return;
    }
    
    const entries = employmentStep.values.entries;
    
    // Subsection title
    doc.setFontSize(12);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Employment History', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 5);
    
    // Employment history table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = entries.map((entry: EmploymentEntry) => {
      const endDate = entry.isCurrent ? 'Present' : entry.endDate;
      return [
        entry.company,
        entry.position,
        `${entry.startDate} - ${endDate}`,
        entry.contactInfo?.name || ''
      ];
    });
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: doc.getY(),
      head: [['Company', 'Position', 'Period', 'Contact']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.PRIMARY_COLOR },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });
    
    // Reset position for next section
    doc.setY(doc.autoTable.previous.finalY + 10);
  }
  
  /**
   * Add residence history section
   */
  private static addResidenceHistory(doc: jsPDF, formState: FormState): void {
    const residenceStep = formState.steps['residence-history'];
    if (!residenceStep || !residenceStep.values.entries || residenceStep.values.entries.length === 0) {
      return;
    }
    
    const entries = residenceStep.values.entries;
    
    // Subsection title
    doc.setFontSize(12);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Residence History', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 5);
    
    // Residence history table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = entries.map((entry: ResidenceEntry) => {
      const endDate = entry.isCurrent ? 'Present' : entry.endDate;
      return [
        `${entry.address}, ${entry.city}, ${entry.state} ${entry.zipCode}`,
        `${entry.startDate} - ${endDate}`
      ];
    });
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: doc.getY(),
      head: [['Address', 'Period']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.PRIMARY_COLOR },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });
    
    // Reset position for next section
    doc.setY(doc.autoTable.previous.finalY + 10);
  }
  
  /**
   * Add education history section
   */
  private static addEducationHistory(doc: jsPDF, formState: FormState): void {
    const educationStep = formState.steps['education'];
    if (!educationStep || !educationStep.values.entries || educationStep.values.entries.length === 0) {
      return;
    }
    
    const entries = educationStep.values.entries;
    
    // Subsection title
    doc.setFontSize(12);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Education', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 5);
    
    // Education table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = entries.map((entry: EducationEntry) => {
      const endDate = entry.isCurrent ? 'Present' : entry.endDate;
      return [
        entry.institution,
        entry.degree,
        entry.field || '',
        `${entry.startDate} - ${endDate}`
      ];
    });
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: doc.getY(),
      head: [['Institution', 'Degree', 'Field', 'Period']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.PRIMARY_COLOR },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });
    
    // Reset position for next section
    doc.setY(doc.autoTable.previous.finalY + 10);
  }
  
  /**
   * Add professional licenses section
   */
  private static addProfessionalLicenses(doc: jsPDF, formState: FormState): void {
    const licensesStep = formState.steps['professional-licenses'];
    if (!licensesStep || !licensesStep.values.entries || licensesStep.values.entries.length === 0) {
      return;
    }
    
    const entries = licensesStep.values.entries;
    
    // Subsection title
    doc.setFontSize(12);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Professional Licenses', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 5);
    
    // Licenses table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = entries.map((entry: ProfessionalLicenseEntry) => {
      const expirationDate = entry.isActive ? entry.expirationDate : 'Inactive';
      return [
        entry.licenseType,
        entry.licenseNumber,
        entry.issuingAuthority,
        entry.issueDate,
        expirationDate
      ];
    });
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: doc.getY(),
      head: [['Type', 'Number', 'Authority', 'Issue Date', 'Expiration']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.PRIMARY_COLOR },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });
    
    // Reset position for next section
    doc.setY(doc.autoTable.previous.finalY + 10);
  }
  
  /**
   * Add signature section
   */
  private static addSignature(doc: jsPDF, formState: FormState): void {
    const signatureStep = formState.steps['signature'];
    if (!signatureStep || !signatureStep.values.signature) {
      return;
    }
    
    // Check if we need to add a new page
    if (doc.getY() > 240) {
      doc.addPage();
      doc.setY(20);
    }
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Signature', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 10);
    
    // Add signature image
    try {
      const signatureData = signatureStep.values.signature;
      
      // For base64 data URLs, extract the base64 part
      const base64Match = signatureData.match(/^data:image\/(png|jpg|jpeg);base64,(.*)$/);
      if (base64Match) {
        const imageData = base64Match[2];
        const imageFormat = base64Match[1];
        
        // Add the image to the PDF
        doc.addImage(
          imageData, 
          imageFormat.toUpperCase(), 
          this.PAGE_MARGIN, 
          doc.getY(), 
          100, // width in mm
          30   // height in mm
        );
      }
    } catch (error) {
      console.error('Error adding signature image:', error);
      doc.text('Signature image could not be displayed', this.PAGE_MARGIN, doc.getY());
    }
    
    // Add signature date
    doc.setY(doc.getY() + 40);
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, this.PAGE_MARGIN, doc.getY());
    
    // Reset position for next section
    doc.setY(doc.getY() + 10);
  }
  
  /**
   * Add attestation section
   */
  private static addAttestation(doc: jsPDF): void {
    // Check if we need to add a new page
    if (doc.getY() > 240) {
      doc.addPage();
      doc.setY(20);
    }
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Attestation', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 10);
    
    // Attestation text
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const attestationText = 
      'I hereby certify that the information provided in this document is true and accurate ' +
      'to the best of my knowledge. I understand that providing false information may result ' +
      'in legal consequences. I authorize the verification of the information provided above.';
    
    const textLines = doc.splitTextToSize(attestationText, this.CONTENT_WIDTH);
    doc.text(textLines, this.PAGE_MARGIN, doc.getY());
    
    // Reset position for next section
    doc.setY(doc.getY() + textLines.length * 5 + 10);
  }
  
  /**
   * Add footer
   */
  private static addFooter(doc: jsPDF, trackingId: string): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Add page number
      doc.setFontSize(8);
      doc.setTextColor(this.SECONDARY_COLOR);
      doc.text(
        `Page ${i} of ${pageCount}`, 
        this.PAGE_WIDTH / 2, 
        285, 
        { align: 'center' }
      );
      
      // Add tracking ID
      doc.text(
        `Tracking ID: ${trackingId}`, 
        this.PAGE_WIDTH - this.PAGE_MARGIN, 
        285, 
        { align: 'right' }
      );
      
      // Add copyright
      doc.text(
        `© ${new Date().getFullYear()} Trua Verify. All rights reserved.`, 
        this.PAGE_MARGIN, 
        285
      );
    }
  }
  
  // Methods for generating PDF from JSON document
  
  private static addHeaderFromJson(doc: jsPDF, jsonDocument: JsonDocument): void {
    const dateStr = new Date(jsonDocument.metadata.submissionDate).toLocaleDateString();
    
    // Add logo (would be an image in a real implementation)
    doc.setFontSize(24);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('TRUA VERIFY', this.PAGE_MARGIN, 20);
    
    // Add document title
    doc.setFontSize(16);
    doc.setTextColor(this.SECONDARY_COLOR);
    doc.text('Employment Verification Report', this.PAGE_MARGIN, 30);
    
    // Add tracking ID and date
    doc.setFontSize(10);
    doc.text(`Tracking ID: ${jsonDocument.metadata.trackingId}`, this.PAGE_MARGIN, 40);
    doc.text(`Date: ${dateStr}`, this.PAGE_MARGIN, 45);
    
    // Add horizontal line
    doc.setDrawColor(this.PRIMARY_COLOR);
    doc.setLineWidth(0.5);
    doc.line(this.PAGE_MARGIN, 50, this.PAGE_WIDTH - this.PAGE_MARGIN, 50);
    
    // Reset position for next section
    doc.setY(60);
  }
  
  private static addPersonalInfoFromJson(doc: jsPDF, jsonDocument: JsonDocument): void {
    const personalInfo = jsonDocument.personalInfo;
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Personal Information', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 10);
    
    // Personal info table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = [
      ['Full Name', personalInfo.fullName || ''],
      ['Email', personalInfo.email || ''],
      ['Phone', personalInfo.phone || '']
    ];
    
    // Add any additional fields that might be present
    Object.entries(personalInfo)
      .filter(([key]) => !['fullName', 'email', 'phone'].includes(key))
      .forEach(([key, value]) => {
        // Format key from camelCase to Title Case
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        
        tableData.push([formattedKey, value?.toString() || '']);
      });
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: doc.getY(),
      head: [['Field', 'Value']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.PRIMARY_COLOR },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });
    
    // Reset position for next section
    doc.setY(doc.autoTable.previous.finalY + 10);
  }
  
  private static addConsentsFromJson(doc: jsPDF, jsonDocument: JsonDocument): void {
    if (!jsonDocument.consents || Object.keys(jsonDocument.consents).length === 0) {
      return;
    }
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Consents', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 10);
    
    // Consents table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = Object.entries(jsonDocument.consents)
      .map(([key, value]) => {
        // Format key from camelCase to Title Case
        const formattedKey = key
          .replace(/([A-Z])/g, ' $1')
          .replace(/^./, str => str.toUpperCase());
        
        return [formattedKey, value ? 'Yes' : 'No'];
      });
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: doc.getY(),
      head: [['Consent Type', 'Provided']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.PRIMARY_COLOR },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });
    
    // Reset position for next section
    doc.setY(doc.autoTable.previous.finalY + 10);
  }
  
  private static addTimelineFromJson(doc: jsPDF, jsonDocument: JsonDocument): void {
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Timeline', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 10);
    
    // Add employment history
    this.addEmploymentHistoryFromJson(doc, jsonDocument);
    
    // Add residence history
    this.addResidenceHistoryFromJson(doc, jsonDocument);
    
    // Add education history
    this.addEducationHistoryFromJson(doc, jsonDocument);
    
    // Add professional licenses
    this.addProfessionalLicensesFromJson(doc, jsonDocument);
  }
  
  private static addEmploymentHistoryFromJson(doc: jsPDF, jsonDocument: JsonDocument): void {
    const entries = jsonDocument.timeline.employmentHistory;
    if (!entries || entries.length === 0) {
      return;
    }
    
    // Subsection title
    doc.setFontSize(12);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Employment History', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 5);
    
    // Employment history table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = entries.map((entry: EmploymentEntry) => {
      const endDate = entry.isCurrent ? 'Present' : entry.endDate;
      return [
        entry.company,
        entry.position,
        `${entry.startDate} - ${endDate}`,
        entry.contactInfo?.name || ''
      ];
    });
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: doc.getY(),
      head: [['Company', 'Position', 'Period', 'Contact']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.PRIMARY_COLOR },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });
    
    // Reset position for next section
    doc.setY(doc.autoTable.previous.finalY + 10);
  }
  
  private static addResidenceHistoryFromJson(doc: jsPDF, jsonDocument: JsonDocument): void {
    const entries = jsonDocument.timeline.residenceHistory;
    if (!entries || entries.length === 0) {
      return;
    }
    
    // Subsection title
    doc.setFontSize(12);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Residence History', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 5);
    
    // Residence history table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = entries.map((entry: ResidenceEntry) => {
      const endDate = entry.isCurrent ? 'Present' : entry.endDate;
      return [
        `${entry.address}, ${entry.city}, ${entry.state} ${entry.zipCode}`,
        `${entry.startDate} - ${endDate}`
      ];
    });
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: doc.getY(),
      head: [['Address', 'Period']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.PRIMARY_COLOR },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });
    
    // Reset position for next section
    doc.setY(doc.autoTable.previous.finalY + 10);
  }
  
  private static addEducationHistoryFromJson(doc: jsPDF, jsonDocument: JsonDocument): void {
    const entries = jsonDocument.timeline.education;
    if (!entries || entries.length === 0) {
      return;
    }
    
    // Subsection title
    doc.setFontSize(12);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Education', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 5);
    
    // Education table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = entries.map((entry: EducationEntry) => {
      const endDate = entry.isCurrent ? 'Present' : entry.endDate;
      return [
        entry.institution,
        entry.degree,
        entry.field || '',
        `${entry.startDate} - ${endDate}`
      ];
    });
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: doc.getY(),
      head: [['Institution', 'Degree', 'Field', 'Period']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.PRIMARY_COLOR },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });
    
    // Reset position for next section
    doc.setY(doc.autoTable.previous.finalY + 10);
  }
  
  private static addProfessionalLicensesFromJson(doc: jsPDF, jsonDocument: JsonDocument): void {
    const entries = jsonDocument.timeline.professionalLicenses;
    if (!entries || entries.length === 0) {
      return;
    }
    
    // Subsection title
    doc.setFontSize(12);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Professional Licenses', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 5);
    
    // Licenses table
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const tableData = entries.map((entry: ProfessionalLicenseEntry) => {
      const expirationDate = entry.isActive ? entry.expirationDate : 'Inactive';
      return [
        entry.licenseType,
        entry.licenseNumber,
        entry.issuingAuthority,
        entry.issueDate,
        expirationDate
      ];
    });
    
    // @ts-ignore - jspdf-autotable adds this method
    doc.autoTable({
      startY: doc.getY(),
      head: [['Type', 'Number', 'Authority', 'Issue Date', 'Expiration']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.PRIMARY_COLOR },
      margin: { left: this.PAGE_MARGIN, right: this.PAGE_MARGIN }
    });
    
    // Reset position for next section
    doc.setY(doc.autoTable.previous.finalY + 10);
  }
  
  private static addSignatureFromJson(doc: jsPDF, jsonDocument: JsonDocument): void {
    // Check if we need to add a new page
    if (doc.getY() > 240) {
      doc.addPage();
      doc.setY(20);
    }
    
    // Section title
    doc.setFontSize(14);
    doc.setTextColor(this.PRIMARY_COLOR);
    doc.text('Signature', this.PAGE_MARGIN, doc.getY());
    doc.setY(doc.getY() + 10);
    
    // Add signature image
    try {
      const signatureData = jsonDocument.signature.signatureImage;
      
      // For base64 data URLs, extract the base64 part
      const base64Match = signatureData.match(/^data:image\/(png|jpg|jpeg);base64,(.*)$/);
      if (base64Match) {
        const imageData = base64Match[2];
        const imageFormat = base64Match[1];
        
        // Add the image to the PDF
        doc.addImage(
          imageData, 
          imageFormat.toUpperCase(), 
          this.PAGE_MARGIN, 
          doc.getY(), 
          100, // width in mm
          30   // height in mm
        );
      }
    } catch (error) {
      console.error('Error adding signature image:', error);
      doc.text('Signature image could not be displayed', this.PAGE_MARGIN, doc.getY());
    }
    
    // Add signature date
    doc.setY(doc.getY() + 40);
    doc.setFontSize(10);
    doc.setTextColor(this.SECONDARY_COLOR);
    
    const signatureDate = new Date(jsonDocument.signature.signatureDate).toLocaleDateString();
    doc.text(`Date: ${signatureDate}`, this.PAGE_MARGIN, doc.getY());
    
    // Reset position for next section
    doc.setY(doc.getY() + 10);
  }
  
  private static addFooterFromJson(doc: jsPDF, jsonDocument: JsonDocument): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Add page number
      doc.setFontSize(8);
      doc.setTextColor(this.SECONDARY_COLOR);
      doc.text(
        `Page ${i} of ${pageCount}`, 
        this.PAGE_WIDTH / 2, 
        285, 
        { align: 'center' }
      );
      
      // Add tracking ID
      doc.text(
        `Tracking ID: ${jsonDocument.metadata.trackingId}`, 
        this.PAGE_WIDTH - this.PAGE_MARGIN, 
        285, 
        { align: 'right' }
      );
      
      // Add copyright
      doc.text(
        `© ${new Date().getFullYear()} Trua Verify. All rights reserved.`, 
        this.PAGE_MARGIN, 
        285
      );
    }
  }
}