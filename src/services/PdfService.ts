import { FormState } from '../context/FormContext';
import { PdfDocumentGenerator } from '../utils/PdfDocumentGenerator';
import { JsonDocument } from '../utils/JsonDocumentGenerator';
import { jsPDF } from 'jspdf';

/**
 * Service for handling PDF document generation and storage
 */
export class PdfService {
  private static CLAIMS_DIRECTORY = 'claims';

  /**
   * Generate a PDF document from form data
   * 
   * @param formState The complete form state
   * @param trackingId The unique tracking ID for this submission
   * @returns The generated PDF document
   */
  public static generatePdfDocument(formState: FormState, trackingId: string): jsPDF {
    return PdfDocumentGenerator.generatePdfDocument(formState, trackingId);
  }

  /**
   * Generate a PDF document from a JSON document
   * 
   * @param jsonDocument The JSON document
   * @returns The generated PDF document
   */
  public static generatePdfFromJson(jsonDocument: JsonDocument): jsPDF {
    return PdfDocumentGenerator.generatePdfFromJson(jsonDocument);
  }

  /**
   * Save a PDF document to the claims directory
   * 
   * @param doc The jsPDF document instance
   * @param trackingId The unique tracking ID for this submission
   * @returns The path to the saved file
   */
  public static async savePdfDocument(doc: jsPDF, trackingId: string): Promise<string> {
    const filename = PdfDocumentGenerator.generateFilename(trackingId);
    const blob = PdfDocumentGenerator.saveToBlob(doc);
    
    // In a real implementation, this would save to a file or database
    // For now, we'll simulate saving by returning the path
    const filePath = `${this.CLAIMS_DIRECTORY}/${filename}`;
    
    // In a real implementation, we would use something like:
    // await fs.promises.mkdir(this.CLAIMS_DIRECTORY, { recursive: true });
    // await fs.promises.writeFile(filePath, await blob.arrayBuffer());
    
    console.log(`PDF document would be saved to: ${filePath}`);
    console.log(`Document size: ${Math.round(blob.size / 1024)} KB`);
    
    return filePath;
  }

  /**
   * Generate and save a PDF document from form data
   * 
   * @param formState The complete form state
   * @param trackingId The unique tracking ID for this submission
   * @returns The path to the saved file
   */
  public static async generateAndSavePdfDocument(
    formState: FormState, 
    trackingId: string
  ): Promise<string> {
    const document = this.generatePdfDocument(formState, trackingId);
    return this.savePdfDocument(document, trackingId);
  }

  /**
   * Generate and save a PDF document from a JSON document
   * 
   * @param jsonDocument The JSON document
   * @returns The path to the saved file
   */
  public static async generateAndSavePdfFromJson(
    jsonDocument: JsonDocument
  ): Promise<string> {
    const document = this.generatePdfFromJson(jsonDocument);
    return this.savePdfDocument(document, jsonDocument.metadata.trackingId);
  }

  /**
   * Get a data URL for the PDF document
   * 
   * @param doc The jsPDF document instance
   * @returns A data URL containing the PDF data
   */
  public static getPdfDataUrl(doc: jsPDF): string {
    return PdfDocumentGenerator.saveToDataUrl(doc);
  }

  /**
   * Check if a PDF document exists for a tracking ID
   *
   * @param trackingId The unique tracking ID for the submission
   * @returns True if the document exists, false otherwise
   */
  public static async documentExists(trackingId: string): Promise<boolean> {
    // In a real implementation, this would check if the file exists
    // For now, we'll simulate not finding the document
    console.log(`Would check if PDF document exists for tracking ID: ${trackingId}`);
    return false;
  }

  /**
   * Generate a filename for the PDF document
   *
   * @param trackingId The unique tracking ID for this submission
   * @returns A filename in the format truaverify_<tracking_id>_<date>.pdf
   */
  public static generateFilename(trackingId: string): string {
    return PdfDocumentGenerator.generateFilename(trackingId);
  }
}