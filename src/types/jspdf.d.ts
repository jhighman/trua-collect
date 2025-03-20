declare module 'jspdf' {
  export class jsPDF {
    constructor(options?: {
      orientation?: 'portrait' | 'landscape';
      unit?: 'pt' | 'mm' | 'cm' | 'in';
      format?: string | [number, number];
    });
    
    // Document properties
    setProperties(properties: {
      title?: string;
      subject?: string;
      author?: string;
      keywords?: string;
      creator?: string;
    }): jsPDF;
    
    // Text methods
    setFont(fontName: string, fontStyle?: string): jsPDF;
    setFontSize(size: number): jsPDF;
    setTextColor(r: number | string, g?: number, b?: number): jsPDF;
    text(text: string | string[], x: number, y: number, options?: {
      align?: 'left' | 'center' | 'right' | 'justify';
      baseline?: 'alphabetic' | 'ideographic' | 'bottom' | 'top' | 'middle' | 'hanging';
      angle?: number;
      rotationDirection?: 0 | 1;
      isInputVisual?: boolean;
      isOutputVisual?: boolean;
      isInputRtl?: boolean;
      isOutputRtl?: boolean;
      isSymmetricSwapping?: boolean;
    }): jsPDF;
    splitTextToSize(text: string, maxWidth: number): string[];
    
    // Graphics methods
    setDrawColor(r: number | string, g?: number, b?: number): jsPDF;
    setLineWidth(width: number): jsPDF;
    line(x1: number, y1: number, x2: number, y2: number): jsPDF;
    
    // Image methods
    addImage(
      imageData: string | Uint8Array,
      format: string,
      x: number,
      y: number,
      width: number,
      height: number,
      alias?: string,
      compression?: 'NONE' | 'FAST' | 'MEDIUM' | 'SLOW',
      rotation?: number
    ): jsPDF;
    
    // Page methods
    addPage(format?: string | [number, number], orientation?: 'portrait' | 'landscape'): jsPDF;
    getNumberOfPages(): number;
    setPage(pageNumber: number): jsPDF;
    getPage(): number;
    
    // Position methods
    getY(): number;
    setY(y: number): jsPDF;
    
    // Output methods
    output(type: 'arraybuffer' | 'blob' | 'bloburi' | 'bloburl' | 'datauristring' | 'dataurlstring' | 'datauri' | 'dataurl' | 'raw' | 'string', options?: any): any;
    
    // AutoTable extension (added by jspdf-autotable)
    autoTable: any;
  }
}

declare module 'jspdf-autotable' {
  // This is just a placeholder to make TypeScript happy
  // The actual implementation is added to the jsPDF prototype
}