import React, { useEffect, useState } from 'react';
import { useForm } from '../context/FormContext';
import { PdfService } from '../services/PdfService';
import { jsPDF } from 'jspdf';
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
  const { formState } = useForm();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get claimant name from form state
  const claimantName = formState.steps['personal-info']?.values.fullName || 'Applicant';
  
  // Generate PDF on component mount
  useEffect(() => {
    const generatePdf = async () => {
      try {
        setIsLoading(true);
        
        // Generate PDF document
        const pdfDoc = PdfService.generatePdfDocument(formState, trackingId);
        
        // Get data URL for download
        const dataUrl = PdfService.getPdfDataUrl(pdfDoc);
        setPdfUrl(dataUrl);
        
        // Simulate saving the PDF to the server
        await PdfService.savePdfDocument(pdfDoc, trackingId);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error generating PDF:', error);
        setError('There was an error generating your PDF. Please try again later.');
        setIsLoading(false);
      }
    };
    
    generatePdf();
  }, [formState, trackingId]);
  
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
            This document contains all the information you've provided.
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
      </div>
    </div>
  );
};

export default ConfirmationPage;