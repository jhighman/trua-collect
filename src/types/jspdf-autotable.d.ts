import 'jspdf';
import { jsPDF } from 'jspdf';

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
      [key: string]: unknown;
    };
  }
}

// Add this for ESM import
declare function autoTable(doc: jsPDF, options: unknown): void;
export default autoTable;