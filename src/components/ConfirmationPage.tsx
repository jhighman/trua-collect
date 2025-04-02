import React, { useEffect, useState } from 'react';
import { PdfService } from '../services/PdfService';
// Import jsPDF
import { jsPDF } from 'jspdf';
import Footer from './Footer'; // Import the Footer component

// Extend the jsPDF type to include methods we need
declare module 'jspdf' {
  interface jsPDF {
    getY: () => number;
    setY: (y: number) => jsPDF;
    getNumberOfPages: () => number;
    setPage: (pageNumber: number) => jsPDF;
  }
}
import './ConfirmationPage.css';

interface ConfirmationPageProps {
  trackingId: string;
}

/**
 * ConfirmationPage component
 *
 * This component implements step M in the data flow diagram.
 * It displays a success message, shows the claimant name,
 * and provides a PDF download link.
 */
const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ trackingId }) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [claimantName, setClaimantName] = useState<string>('Applicant');
  
  // Generate PDF on component mount
  useEffect(() => {
    const generatePdf = async () => {
      try {
        setIsLoading(true);
        
        // Try to get form data from localStorage
        const formDataStr = localStorage.getItem('formState');
        let formData = null;
        
        if (formDataStr) {
          try {
            formData = JSON.parse(formDataStr);
            // Get claimant name if available
            if (formData && formData.steps && formData.steps['personal-info']) {
              setClaimantName(formData.steps['personal-info'].values.fullName || 'Applicant');
            }
          } catch (e) {
            console.error('Error parsing form data from localStorage:', e);
          }
        }
        // Create a simplified PDF document
        const doc = new jsPDF();
        
        // Add header
        doc.setFontSize(24);
        doc.setTextColor(49, 130, 206); // Primary blue color
        doc.text('TRUA VERIFY', 20, 20);
        
        doc.setFontSize(16);
        doc.setTextColor(74, 85, 104); // Secondary gray color
        doc.text('Employment Verification Report', 20, 30);
        
        // Add tracking ID and date
        doc.setFontSize(10);
        doc.text(`Tracking ID: ${trackingId}`, 20, 40);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 45);
        
        // Create data for the main table
        const tableData = [
          ['Full Name', claimantName]
        ];
        
        // Add personal info if available
        if (formData && formData.steps && formData.steps['personal-info']) {
          const personalInfo = formData.steps['personal-info'].values;
          if (personalInfo.email) {
            tableData.push(['Email', personalInfo.email]);
          }
          if (personalInfo.phone) {
            tableData.push(['Phone', personalInfo.phone]);
          }
        }
        
        // Add signature info if available
        if (formData && formData.steps && formData.steps.signature) {
          tableData.push(['Signature Date', new Date().toLocaleDateString()]);
        }
        
        // Add attestation
        tableData.push(['Attestation', 'I hereby certify that the information provided is true and accurate.']);
        
        // Create a simple table manually
        doc.setFontSize(12);
        doc.text('Verification Information:', 20, 50);
        
        let yPos = 60;
        
        // Draw header
        doc.setFillColor(49, 130, 206);
        doc.setTextColor(255, 255, 255);
        doc.rect(20, yPos, 80, 10, 'F');
        doc.rect(100, yPos, 80, 10, 'F');
        doc.text('Field', 25, yPos + 7);
        doc.text('Value', 105, yPos + 7);
        
        yPos += 10;
        doc.setTextColor(0, 0, 0);
        
        // Draw rows
        tableData.forEach(([field, value], index) => {
          // Set background color for alternating rows
          if (index % 2 === 0) {
            doc.setFillColor(240, 240, 240);
            doc.rect(20, yPos, 80, 10, 'F');
            doc.rect(100, yPos, 80, 10, 'F');
          }
          
          doc.text(field, 25, yPos + 7);
          // Handle long values by truncating or wrapping
          const valueStr = String(value);
          const truncatedValue = valueStr.length > 40 ? valueStr.substring(0, 37) + '...' : valueStr;
          doc.text(truncatedValue, 105, yPos + 7);
          
          yPos += 10;
        });
        
        // Add footer
        const pageCount = doc.getNumberOfPages();
        
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          
          // Add page number
          doc.setFontSize(8);
          doc.setTextColor(74, 85, 104);
          doc.text(
            `Page ${i} of ${pageCount}`,
            105,
            285,
            { align: 'center' }
          );
          
          // Add tracking ID
          doc.text(
            `Tracking ID: ${trackingId}`,
            190,
            285,
            { align: 'right' }
          );
          
          // Add copyright
          doc.text(
            `© ${new Date().getFullYear()} Trua Verify. All rights reserved.`,
            20,
            285
          );
        }
        
        // Get data URL for download
        const dataUrl = doc.output('datauristring');
        setPdfUrl(dataUrl);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating PDF:', error);
        setError('There was an error generating your PDF. Please try again later.');
        setIsLoading(false);
      }
    };
    
    generatePdf();
  }, [trackingId, claimantName]);
  
  // Handle PDF download
  const handleDownload = () => {
    if (!pdfUrl) return;
    
    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = PdfService.generateFilename(trackingId);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-container">
          <h2>Preparing Your Verification Document</h2>
          <div className="loading-spinner"></div>
          <p>Please wait while we prepare your document...</p>
          <Footer />
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-container error">
          <h2>Something Went Wrong</h2>
          <p>{error}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
          <Footer />
        </div>
      </div>
    );
  }
  
  // Render success state
  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <div className="success-icon">✓</div>
        
        <h1>Verification Submitted Successfully!</h1>
        
        <div className="confirmation-details">
          <p>Thank you, <strong>{claimantName}</strong>!</p>
          <p>Your verification information has been submitted successfully.</p>
          <p>Tracking ID: <strong>{trackingId}</strong></p>
          <p>Submission Date: <strong>{new Date().toLocaleDateString()}</strong></p>
        </div>
        
        <div className="download-section">
          <h2>Your Verification Document</h2>
          <p>
            Please download a copy of your verification document for your records.
            This document contains all the information you&apos;ve provided.
          </p>
          
          {pdfUrl ? (
            <button 
              className="download-button"
              onClick={handleDownload}
            >
              Download PDF
            </button>
          ) : (
            <p className="error-message">
              PDF document is not available for download.
            </p>
          )}
        </div>
        
        <div className="next-steps">
          <h2>Next Steps</h2>
          <p>
            Your verification information will be reviewed by our team.
            You may be contacted if additional information is needed.
          </p>
          <p>
            If you have any questions, please contact our support team
            and reference your tracking ID.
          </p>
        </div>
        
        {/* Add the Footer component */}
        <Footer />
      </div>
    </div>
  );
};

export default ConfirmationPage;