import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import { PdfService } from '../services/PdfService';
import { DocumentService } from '../services/DocumentService';
import { JsonDocument } from '../types/documents';
import { Requirements } from '../types/requirements';
import { formatDisplayDate } from '../utils/dateUtils';
import { getCountryByCode } from '../utils/countries';
import { getStateByCode } from '../utils/states';
import { jsPDF } from 'jspdf';
import Footer from './Footer';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Button } from './ui/button';
import { Download, Check } from 'lucide-react';
import './ConfirmationPage.css';
import {
  PersonalInfoStepValues,
  ResidenceHistoryStepValues,
  EmploymentHistoryStepValues,
  EducationStepValues,
  ProfessionalLicensesStepValues
} from '../types/steps';
import { JsonDocumentGenerator } from '../services/JsonDocumentGenerator';
import { FormState } from '../types/form';
import { 
  PersonalInfo, 
  ResidenceHistoryEntry, 
  EmploymentHistoryEntry,
  EducationEntry,
  ProfessionalLicenseEntry,
  Signature
} from '../types/documents';

// Extend the jsPDF type to include methods we need
declare module 'jspdf' {
  interface jsPDF {
    getY: () => number;
    setY: (y: number) => jsPDF;
    getNumberOfPages: () => number;
    setPage: (pageNumber: number) => jsPDF;
  }
}

interface ConfirmationPageProps {
  formState: FormState;
  trackingId: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface DisplayEntry {
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

interface DisplayEmploymentEntry extends DisplayEntry {
  company: string;
  position: string;
  type: string;
  city: string;
  state_province: string;
  country: string;
  description?: string;
  contact_name?: string;
  contact_type?: string;
  no_contact_attestation?: boolean;
}

interface DisplayResidenceEntry extends DisplayEntry {
  address: string;
  city: string;
  state_province: string;
  country: string;
  zip_postal: string;
}

interface DisplayEducationEntry extends DisplayEntry {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  location?: string;
  description?: string;
}

interface DisplayLicenseEntry extends DisplayEntry {
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
  state: string;
  country: string;
  issueDate: string;
  expirationDate?: string;
  isActive: boolean;
  description?: string;
}

interface DocumentGenerationResult {
  success: boolean;
  error?: string;
  url?: string;
}

const formatDate = (date: string | null | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

export const ConfirmationPage: React.FC<ConfirmationPageProps> = ({
  formState,
  trackingId,
  onSuccess,
  onError
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [jsonDocument, setJsonDocument] = useState<JsonDocument | null>(null);
  
  // Validate formState - try to get it from localStorage if it's not provided as a prop
  const [localFormState, setLocalFormState] = useState<FormState | null>(null);
  
  useEffect(() => {
    if (!formState || Object.keys(formState).length === 0) {
      try {
        const storedFormState = localStorage.getItem('formState');
        if (storedFormState) {
          const parsedState = JSON.parse(storedFormState);
          // Validate the parsed state has required properties
          if (parsedState && 
              parsedState.steps && 
              parsedState.steps['personal-info'] &&
              parsedState.steps['residence-history'] &&
              parsedState.steps['employment-history']) {
            setLocalFormState(parsedState);
          } else {
            setError(t('error.invalid_form_state'));
          }
        } else {
          setError(t('error.missing_form_data'));
        }
      } catch (error) {
        console.error('Error retrieving form state from localStorage:', error);
        setError(t('error.invalid_form_state'));
      }
    }
  }, [formState, t]);
  
  // Use the prop formState if available, otherwise use the one from localStorage
  const effectiveFormState = (formState && Object.keys(formState).length > 0) ? formState : localFormState;

  const handleGenerateDocument = useCallback(async () => {
    if (!effectiveFormState) {
      setError(t('error.missing_form_data'));
      onError(t('error.missing_form_data'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Generate JSON document
      const generator = new JsonDocumentGenerator(effectiveFormState);
      const document = generator.generateJsonDocument(trackingId);
      setJsonDocument(document);

      // Generate PDF document
      const pdfService = new PdfService();
      const pdfDoc = await pdfService.generateVerificationPdf(effectiveFormState);
      const pdfBlob = new Blob([pdfDoc.output('blob')], { type: 'application/pdf' });
      const pdfObjectUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfObjectUrl);

      // Save documents
      const documentService = new DocumentService();
      try {
        await documentService.saveDocuments(document, pdfDoc);
      } catch (saveError) {
        console.warn('Failed to save documents, but generation was successful:', saveError);
        // Don't fail the whole process if just the save failed
      }

      setIsLoading(false);
      onSuccess();
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate document';
      setError(errorMessage);
      onError(errorMessage);
    }
  }, [effectiveFormState, trackingId, onSuccess, onError, t]);

  // Call handleGenerateDocument when component mounts
  React.useEffect(() => {
    handleGenerateDocument();
  }, [handleGenerateDocument]);
  
  // If we still don't have a valid form state, show an error
  if (!effectiveFormState) {
    console.error('Form state is undefined and not available in localStorage');
    return (
      <div className="confirmation-page">
        <div className="confirmation-container error">
          <h2>{t('error.invalid_form_state')}</h2>
          <p>{t('error.missing_form_data')}</p>
          <button
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            {t('common.try_again')}
          </button>
          <Footer />
        </div>
      </div>
    );
  }

  // Map entries from form state with proper validation and default values
  const employmentEntries = ((effectiveFormState?.steps['employment-history']?.values as EmploymentHistoryStepValues)?.entries || []).map((entry: EmploymentHistoryEntry) => ({
    ...entry,
    company: entry?.employer || '',
    type: 'employment',
    isCurrent: !entry?.endDate,
    position: entry?.position || '',
    city: entry?.city || '',
    state_province: entry?.state_province || '',
    country: entry?.country || '',
    description: entry?.description,
    contact_name: entry?.contact_name,
    contact_type: entry?.contact_type,
    no_contact_attestation: entry?.no_contact_attestation
  })) as DisplayEmploymentEntry[];

  const residenceEntries = ((effectiveFormState?.steps['residence-history']?.values as ResidenceHistoryStepValues)?.entries || []).map((entry: ResidenceHistoryEntry) => ({
    ...entry,
    isCurrent: !entry?.endDate,
    address: entry?.address || '',
    city: entry?.city || '',
    state_province: entry?.state_province || '',
    country: entry?.country || '',
    zip_postal: entry?.zip_postal || ''
  })) as DisplayResidenceEntry[];

  const educationEntries = ((effectiveFormState?.steps['education']?.values as EducationStepValues)?.entries || []).map((entry: EducationEntry) => ({
    ...entry,
    startDate: entry?.completionDate || '',
    endDate: entry?.completionDate || '',
    isCurrent: false,
    institution: entry?.institution || '',
    degree: entry?.degree || '',
    fieldOfStudy: entry?.fieldOfStudy,
    location: entry?.location
  })) as DisplayEducationEntry[];

  const professionalLicenseEntries = ((effectiveFormState?.steps['professional-licenses']?.values as ProfessionalLicensesStepValues)?.entries || []).map((entry: ProfessionalLicenseEntry) => ({
    ...entry,
    startDate: entry?.issueDate || '',
    endDate: entry?.expirationDate || '',
    isCurrent: entry?.isActive || false,
    licenseType: entry?.licenseType || '',
    licenseNumber: entry?.licenseNumber || '',
    issuingAuthority: entry?.issuingAuthority || '',
    state: entry?.state || '',
    country: entry?.country || '',
    issueDate: entry?.issueDate || '',
    expirationDate: entry?.expirationDate,
    isActive: entry?.isActive || false,
    description: entry?.description
  })) as DisplayLicenseEntry[];

  const personalInfo = ((effectiveFormState?.steps['personal-info']?.values as PersonalInfoStepValues) || { fullName: '', email: '' });
  const claimantName = personalInfo?.fullName || t('common.applicant');

  const handleJsonDownload = () => {
    if (!jsonDocument) return;
    
    const jsonString = JSON.stringify(jsonDocument, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `verification-${trackingId}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle PDF download
  const handleDownload = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `verification-${trackingId}.pdf`;
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
  
  // Render success state with detailed summary
  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <div className="success-header">
          <div className="success-icon">
            <Check size={32} />
          </div>
          <h1>Verification Submitted Successfully!</h1>
        </div>
        <div className="confirmation-details">
          <p>{t('confirmation.thank_you', { name: claimantName })}</p>
          <p>{t('confirmation.success_message')}</p>
          <p>{t('confirmation.tracking_id', { id: trackingId })}</p>
          <p>{t('confirmation.submission_date', { date: new Date().toLocaleDateString() })}</p>
          <div className="timeline-section">
            <h3>{t('employment_history')}</h3>
            {employmentEntries.length > 0 ? (
              employmentEntries.map((entry, index) => (
                <div key={index} className="timeline-entry">
                  <div className="date-range">
                    {formatDate(entry.startDate)} - {entry.isCurrent ? t('present') : formatDate(entry.endDate)}
                  </div>
                  <div className="entry-details">
                    <div>{entry.company}</div>
                    <div>{entry.position}</div>
                    <div>{entry.city}, {entry.state_province}, {entry.country}</div>
                  </div>
                </div>
              ))
            ) : (
              <p>{t('no_employment_history')}</p>
            )}
          </div>

          <div className="timeline-section">
            <h3>{t('residence_history')}</h3>
            {residenceEntries.length > 0 ? (
              residenceEntries.map((entry, index) => (
                <div key={index} className="timeline-entry">
                  <div className="date-range">
                    {formatDate(entry.startDate)} - {entry.isCurrent ? t('present') : formatDate(entry.endDate)}
                  </div>
                  <div className="entry-details">
                    <div>{entry.address}</div>
                    <div>{entry.city}, {entry.state_province}, {entry.country}</div>
                    <div>{entry.zip_postal}</div>
                  </div>
                </div>
              ))
            ) : (
              <p>{t('no_residence_history')}</p>
            )}
          </div>

          <div className="timeline-section">
            <h3>{t('education')}</h3>
            {educationEntries.length > 0 ? (
              educationEntries.map((entry, index) => (
                <div key={index} className="timeline-entry">
                  <div className="date-range">
                    {formatDate(entry.startDate)} - {entry.isCurrent ? t('present') : formatDate(entry.endDate)}
                  </div>
                  <div className="entry-details">
                    <div>{entry.institution}</div>
                    <div>{entry.degree}</div>
                    {entry.fieldOfStudy && <div>{entry.fieldOfStudy}</div>}
                    {entry.location && <div>{entry.location}</div>}
                  </div>
                </div>
              ))
            ) : (
              <p>{t('no_education_history')}</p>
            )}
          </div>

          <div className="timeline-section">
            <h3>{t('professional_licenses')}</h3>
            {professionalLicenseEntries.length > 0 ? (
              professionalLicenseEntries.map((entry, index) => (
                <div key={index} className="timeline-entry">
                  <div className="date-range">
                    {formatDate(entry.startDate)} - {entry.isCurrent ? t('present') : formatDate(entry.endDate)}
                  </div>
                  <div className="entry-details">
                    <div>{entry.licenseType}</div>
                    <div>{t('license_number')}: {entry.licenseNumber}</div>
                    <div>{t('issuing_authority')}: {entry.issuingAuthority}</div>
                    <div>{entry.state}, {entry.country}</div>
                    <div>{t('status')}: {entry.isActive ? t('active') : t('inactive')}</div>
                  </div>
                </div>
              ))
            ) : (
              <p>{t('no_licenses')}</p>
            )}
          </div>
        </div>
        
        <div className="download-section">
          <Button onClick={handleDownload} disabled={!pdfUrl}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handleJsonDownload} disabled={!jsonDocument} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download JSON
          </Button>
        </div>
        
        <Footer />
      </div>
    </div>
  );
};

export default ConfirmationPage;