import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import { PdfService } from '../services/PdfService';
import { DocumentService } from '../services/DocumentService';
import { JsonDocument } from '../types/documents';
import { Requirements } from '../types/requirements';
import { formatDisplayDate } from '../utils/dateUtils';
import { getCountryByCode, getCountryNameByCode } from '../utils/countries';
import { getStateByCode } from '../utils/states';
import { jsPDF } from 'jspdf';
import Footer from './Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { ArrowUp } from 'lucide-react';
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
  // State for accordion expanded sections
  const [expandedSections, setExpandedSections] = useState<string[]>(['employment', 'residence', 'education', 'licenses']);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [jsonDocument, setJsonDocument] = useState<JsonDocument | null>(null);
  
  // Handle scroll for back to top button
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Set default expanded sections based on screen size
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setExpandedSections(isMobile ? [] : ['employment', 'residence', 'education', 'licenses']);
    };
    
    // Set initial state
    handleResize();
    
    // Add event listener for window resize
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Toggle all sections expanded/collapsed
  const toggleAllSections = () => {
    if (expandedSections.length === 4) {
      setExpandedSections([]);
    } else {
      setExpandedSections(['employment', 'residence', 'education', 'licenses']);
    }
  };
  
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
            setError(t('display.error_title'));
          }
        } else {
          setError(t('display.missing_form_data'));
        }
      } catch (error) {
        console.error('Error retrieving form state from localStorage:', error);
        setError(t('display.error_title'));
      }
    }
  }, [formState, t]);
  
  // Use the prop formState if available, otherwise use the one from localStorage
  const effectiveFormState = (formState && Object.keys(formState).length > 0) ? formState : localFormState;

  const getDisplayEntries = useCallback((jsonDocument: JsonDocument | null) => {
    if (!jsonDocument) {
      return {
        employmentEntries: [],
        residenceEntries: [],
        educationEntries: [],
        professionalLicenseEntries: []
      };
    }

    const timeline = jsonDocument.timeline;
    if (!timeline) {
      return {
        employmentEntries: [],
        residenceEntries: [],
        educationEntries: [],
        professionalLicenseEntries: []
      };
    }

    // Helper functions to safely get timeline entries with type checking
    const getEmploymentEntries = (timeline: { entries: EmploymentHistoryEntry[] } | undefined): EmploymentHistoryEntry[] => {
      if (!timeline || !Array.isArray(timeline.entries)) return [];
      return timeline.entries.filter((entry): entry is EmploymentHistoryEntry => 
        entry && typeof entry === 'object' && 'company' in entry
      );
    };

    const getResidenceEntries = (timeline: { entries: ResidenceHistoryEntry[] } | undefined): ResidenceHistoryEntry[] => {
      if (!timeline || !Array.isArray(timeline.entries)) return [];
      return timeline.entries.filter((entry): entry is ResidenceHistoryEntry => 
        entry && typeof entry === 'object' && 'address' in entry
      );
    };

    const getEducationEntries = (timeline: { entries: EducationEntry[] } | undefined): EducationEntry[] => {
      if (!timeline || !Array.isArray(timeline.entries)) return [];
      return timeline.entries.filter((entry): entry is EducationEntry => 
        entry && typeof entry === 'object' && 'institution' in entry
      );
    };

    const getLicenseEntries = (timeline: { entries: ProfessionalLicenseEntry[] } | undefined): ProfessionalLicenseEntry[] => {
      if (!timeline || !Array.isArray(timeline.entries)) return [];
      return timeline.entries.filter((entry): entry is ProfessionalLicenseEntry => 
        entry && typeof entry === 'object' && 'licenseType' in entry
      );
    };

    // Helper function to get location display string
    const getLocationDisplay = (city: string, stateCode: string, countryCode: string): string => {
      const state = getStateByCode(stateCode, countryCode)?.name || stateCode;
      const country = getCountryNameByCode(countryCode);
      return [city, state, country].filter(Boolean).join(', ');
    };

    const employmentEntries = getEmploymentEntries(timeline.employmentTimeline).map(entry => ({
      ...entry,
      company: entry.employer || '',
      type: 'employment',
      isCurrent: !entry.endDate,
      position: entry.position || '',
      city: entry.city || '',
      state_province: entry.state_province ? getStateByCode(entry.state_province, entry.country || 'US')?.name || entry.state_province : '',
      country: entry.country ? getCountryNameByCode(entry.country) : '',
      description: entry.description,
      contact_name: entry.contact_name,
      contact_type: entry.contact_type,
      no_contact_attestation: entry.no_contact_attestation
    })) as DisplayEmploymentEntry[];

    const residenceEntries = getResidenceEntries(timeline.residenceTimeline).map(entry => ({
      ...entry,
      isCurrent: !entry.endDate,
      address: entry.address || '',
      city: entry.city || '',
      state_province: entry.state_province ? getStateByCode(entry.state_province, entry.country || 'US')?.name || entry.state_province : '',
      country: entry.country ? getCountryNameByCode(entry.country) : '',
      zip_postal: entry.zip_postal || ''
    })) as DisplayResidenceEntry[];

    const educationEntries = getEducationEntries(timeline.educationTimeline).map(entry => ({
      ...entry,
      isCurrent: false,
      institution: entry.institution || '',
      degree: entry.degree || '',
      fieldOfStudy: entry.fieldOfStudy,
      location: entry.location || ''
    })) as DisplayEducationEntry[];

    const professionalLicenseEntries = getLicenseEntries(timeline.licensesTimeline).map(entry => ({
      ...entry,
      isCurrent: entry.isActive || false,
      licenseType: entry.licenseType || '',
      licenseNumber: entry.licenseNumber || '',
      issuingAuthority: entry.issuingAuthority || '',
      state: entry.state ? getStateByCode(entry.state, entry.country || 'US')?.name || entry.state : '',
      country: entry.country ? getCountryNameByCode(entry.country) : '',
      issueDate: entry.issueDate || '',
      expirationDate: entry.expirationDate,
      isActive: entry.isActive || false,
      description: entry.description
    })) as DisplayLicenseEntry[];

    return {
      employmentEntries,
      residenceEntries,
      educationEntries,
      professionalLicenseEntries
    };
  }, []);

  const handleGenerateDocument = useCallback(async () => {
    if (!effectiveFormState) {
      console.error('Form state is undefined and not available in localStorage');
      setError(t('display.error_title'));
      onError(t('display.missing_form_data'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Generate JSON document
      const generator = new JsonDocumentGenerator(effectiveFormState);
      const document = generator.generateJsonDocument(trackingId);
      setJsonDocument(document);

      // Generate PDF document from JSON
      const pdfService = new PdfService();
      const pdfDoc = await pdfService.generatePdfFromJson(document);
      const pdfBlob = new Blob([pdfDoc.output('blob')], { type: 'application/pdf' });
      const pdfObjectUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfObjectUrl);

      // Save documents
      const documentService = new DocumentService();
      try {
        await documentService.saveDocuments(document, pdfBlob);
      } catch (saveError) {
        console.warn('Failed to save documents, but generation was successful:', saveError);
        // Don't fail the whole process if just the save failed
      }

      setIsLoading(false);
      onSuccess();
    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate document';
      console.error('Document generation failed:', error); // Log full error for debugging
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
          <h2>{t('display.error_title')}</h2>
          <p>{t('display.missing_form_data')}</p>
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

  // Render loading state
  if (isLoading) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-container">
          <h2>{t('display.preparing_document')}</h2>
          <div className="loading-spinner"></div>
          <p>{t('display.please_wait')}</p>
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
          <h2>{t('display.error_title')}</h2>
          <p>{error}</p>
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

  // Check for missing document
  if (!jsonDocument) {
    console.error('JSON document is missing after generation');
    return (
      <div className="confirmation-page">
        <div className="confirmation-container error">
          <h2>{t('display.invalid_document')}</h2>
          <p>{t('display.missing_document_data')}</p>
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
  
  // Get display entries from jsonDocument
  const {
    employmentEntries,
    residenceEntries,
    educationEntries,
    professionalLicenseEntries
  } = getDisplayEntries(jsonDocument);

  const claimantName = jsonDocument.personalInfo?.fullName || t('common.applicant');
  
  // Check if this is a minimal data submission
  const hasMinimalData = !employmentEntries.length && !residenceEntries.length &&
                        !educationEntries.length && !professionalLicenseEntries.length;

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
  
  // Render success state with detailed summary
  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <div className="header">
          <h1>{t('display.verification_submitted')}</h1>
          <p>{t('display.tracking_id')}: {trackingId}</p>
          <p>{t('display.submission_date')}: {formatDate(new Date().toISOString())}</p>
        </div>

        <div className="content">
          {hasMinimalData ? (
            <div className="minimal-data">
              <p>{t('display.minimal_data_notice')}</p>
            </div>
          ) : (
            <>
              <h2>{t('display.personal_info')}</h2>
              {jsonDocument.personalInfo && (
                <>
                  <p><strong>{t('display.full_name')}</strong>: {jsonDocument.personalInfo.fullName}</p>
                  {jsonDocument.personalInfo.email && (
                    <p><strong>{t('display.email')}</strong>: {jsonDocument.personalInfo.email}</p>
                  )}
                  {jsonDocument.personalInfo.phone && (
                    <p><strong>{t('display.phone')}</strong>: {jsonDocument.personalInfo.phone}</p>
                  )}
                </>
              )}
              
              <Button
                variant="outline"
                onClick={toggleAllSections}
                className="toggle-sections-button"
              >
                {expandedSections.length === 4 ? t('display.collapse_all') : t('display.expand_all')}
              </Button>
              
              <Accordion type="multiple" value={expandedSections} onValueChange={setExpandedSections}>
                <AccordionItem value="employment">
                  <AccordionTrigger>{t('display.employment_history')}</AccordionTrigger>
                  <AccordionContent>
                    {employmentEntries.length > 0 ? (
                      employmentEntries.map((entry, index) => (
                        <div key={index} className="timeline-entry">
                          <div className="date-range">
                            {formatDate(entry.startDate)} - {entry.isCurrent ? t('common.present') : formatDate(entry.endDate)}
                          </div>
                          <div className="entry-details">
                            <div>{t('display.employer')}: {entry.company}</div>
                            <div>{t('display.position')}: {entry.position}</div>
                            <div>{t('display.employment_location')}: {entry.city}, {entry.state_province}, {entry.country}</div>
                            {entry.description && <div>{t('display.job_description')}: {entry.description}</div>}
                            {entry.contact_name && (
                              <div>
                                {t('display.contact_info')}: {entry.contact_name} (
                                {entry.contact_type === 'contact_type_manager' && t('employment.contact_type_manager')}
                                {entry.contact_type === 'contact_type_hr' && t('employment.contact_type_hr')}
                                {entry.contact_type === 'contact_type_colleague' && t('employment.contact_type_colleague')}
                                {entry.contact_type === 'contact_type_other' && t('employment.contact_type_other')}
                                )
                                {entry.no_contact_attestation && ` - ${t('display.no_contact_reason')}`}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">{t('display.no_employment_history')}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="residence">
                  <AccordionTrigger>{t('display.residence_history')}</AccordionTrigger>
                  <AccordionContent>
                    {residenceEntries.length > 0 ? (
                      residenceEntries.map((entry, index) => (
                        <div key={index} className="timeline-entry">
                          <div className="date-range">
                            {formatDate(entry.startDate)} - {entry.isCurrent ? t('common.present') : formatDate(entry.endDate)}
                          </div>
                          <div className="entry-details">
                            <div>{t('display.address')}: {entry.address}</div>
                            <div>{t('display.residence_location')}: {entry.city}, {entry.state_province}, {entry.country}</div>
                            <div>{t('display.zip_postal')}: {entry.zip_postal}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">{t('display.no_residence_history')}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="education">
                  <AccordionTrigger>{t('display.education')}</AccordionTrigger>
                  <AccordionContent>
                    {educationEntries.length > 0 ? (
                      educationEntries.map((entry, index) => (
                        <div key={index} className="timeline-entry">
                          <div className="date-range">
                            {formatDate(entry.startDate)} - {entry.isCurrent ? t('common.present') : formatDate(entry.endDate)}
                          </div>
                          <div className="entry-details">
                            <div>{t('display.institution')}: {entry.institution}</div>
                            <div>{t('display.degree')}: {entry.degree}</div>
                            {entry.fieldOfStudy && <div>{t('display.field_of_study')}: {entry.fieldOfStudy}</div>}
                            {entry.location && <div>{t('display.location')}: {entry.location}</div>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">{t('display.no_education_history')}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="licenses">
                  <AccordionTrigger>{t('display.professional_licenses')}</AccordionTrigger>
                  <AccordionContent>
                    {professionalLicenseEntries.length > 0 ? (
                      professionalLicenseEntries.map((entry, index) => (
                        <div key={index} className="timeline-entry">
                          <div className="date-range">
                            {formatDate(entry.startDate)} - {entry.isCurrent ? t('common.present') : formatDate(entry.endDate)}
                          </div>
                          <div className="entry-details">
                            <div>{t('display.license_type')}: {entry.licenseType}</div>
                            <div>{t('display.license_number')}: {entry.licenseNumber}</div>
                            <div>{t('display.issuing_authority')}: {entry.issuingAuthority}</div>
                            <div>{t('display.state')}: {entry.state}</div>
                            <div>{t('display.country')}: {entry.country}</div>
                            <div>{t('display.status')}: {entry.isActive ? t('display.active') : t('display.inactive')}</div>
                            {entry.description && <div>{t('display.license_description')}: {entry.description}</div>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="no-data">{t('display.no_licenses')}</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </>
          )}
        </div>
        
        <div className="download-section">
          <Button onClick={handleDownload} disabled={!pdfUrl}>
            <Download className="mr-2 h-4 w-4" />
            {t('display.download_pdf')}
          </Button>
          <Button onClick={handleJsonDownload} disabled={!jsonDocument} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t('display.download_json')}
          </Button>
        </div>
        
        <Footer />
        
        {showBackToTop && (
          <Button
            className="back-to-top"
            variant="outline"
            size="icon"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ArrowUp size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConfirmationPage;