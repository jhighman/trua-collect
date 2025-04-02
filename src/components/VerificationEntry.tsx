/* eslint-disable no-console */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseCollectionKey, getRequirements } from '../utils/collectionKeyParser';
import { v4 as uuidv4 } from 'uuid';
import { FormProvider, FormState } from '../context/FormContext';
import { FormStepId } from '../utils/FormConfigGenerator';
import FormStepRenderer from './FormStepRenderer';
import { FormLogger } from '../utils/FormLogger';
import { getConfig } from '../utils/EnvironmentConfig';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'; // shadcn Card component
import Footer from './Footer'; // Import the Footer component
import { AlertTriangle } from 'lucide-react'; // Lucide icon for warning
import './VerificationEntry.css';

interface VerificationEntryProps {
  onSubmit: (formData: FormState & { referenceToken?: string }) => Promise<void>;
  urlKey?: string;
  urlToken?: string;
}

const generateDefaultCollectionKey = (): string => {
  const config = getConfig();
  const defaultKey = config.defaultCollectionKey;
  console.log('VerificationEntry - Using default collection key from environment:', defaultKey);
  return defaultKey;
};

const generateReferenceToken = (): string => {
  return uuidv4();
};

const VerificationEntry: React.FC<VerificationEntryProps> = ({ onSubmit, urlKey, urlToken }) => {
  console.log('VerificationEntry - URL parameters from props:', { urlKey, urlToken });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [referenceToken, setReferenceToken] = useState<string | null>(null);
  const [collectionKey, setCollectionKey] = useState<string | null>(null);
  const [isDefaultKey, setIsDefaultKey] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<FormStepId>('personal-info');

  const navigate = useNavigate();

  const directUrlSearch = useMemo(() => window.location.search, []);
  const directUrlParams = useMemo(() => new URLSearchParams(directUrlSearch), [directUrlSearch]);
  const directKeyParam = useMemo(() => directUrlParams.get('key'), [directUrlParams]);

  console.log('VerificationEntry - Direct window.location.href:', window.location.href);
  console.log('VerificationEntry - Direct window.location.search:', directUrlSearch);
  console.log('VerificationEntry - Direct key param:', directKeyParam);

  useEffect(() => {
    console.log('VerificationEntry - Using URL parameters from props in effect');
    const token = urlToken || directUrlParams.get('token');
    const key = urlKey || directKeyParam;
    console.log('VerificationEntry - URL parameters from props or direct access:', { token, key });

    const defaultToken = token || generateReferenceToken();
    const collectionKeyToUse = key || generateDefaultCollectionKey();
    const keyIsDefault = !key;

    try {
      parseCollectionKey(collectionKeyToUse);
      setReferenceToken(defaultToken);
      setCollectionKey(collectionKeyToUse);
      setIsDefaultKey(keyIsDefault);
      setLoading(false);
      console.log('VerificationEntry - Using collection key:', collectionKeyToUse);
      console.log('VerificationEntry - Key from URL:', !!key);
      console.log('VerificationEntry - Is default key:', keyIsDefault);
    } catch (error) {
      setError('Invalid collection key format.');
      setLoading(false);
    }
  }, [urlKey, urlToken, directKeyParam]);

  const requirements = useMemo(() => {
    if (!collectionKey) return null;
    return getRequirements(collectionKey);
  }, [collectionKey]);

  // Set the current step to the initial step when requirements change
  useEffect(() => {
    if (requirements) {
      const initialStep = determineInitialStep();
      console.log('VerificationEntry - Setting current step to initial step:', initialStep);
      setCurrentStep(initialStep);
    }
  }, [requirements]);

  const handleSubmit = useCallback(async (formData: FormState) => {
    try {
      const formDataWithToken = { ...formData, referenceToken: referenceToken || undefined };
      FormLogger.logFormState(formData, collectionKey || 'unknown', { event: 'form_submission' });
      await onSubmit(formDataWithToken);
      navigate('/confirmation');
    } catch (error) {
      console.error('Form submission error:', error);
      setError('An error occurred while submitting the form. Please try again.');
    }
  }, [onSubmit, referenceToken, collectionKey, navigate]);

  const handleStepChange = useCallback((step: FormStepId, formState: FormState) => {
    console.log('VerificationEntry: onStepChange called with step:', step, 'Previous step:', currentStep);
    console.log('VerificationEntry: Form state to log:', formState);
    setCurrentStep(step);
    FormLogger.logFormState(formState, collectionKey || 'unknown', {
      event: 'step_change',
      previousStep: currentStep,
      newStep: step,
    });
    console.log('VerificationEntry: After handleStepChange, current step is now:', step);
  }, [currentStep, collectionKey]);

  if (loading) {
    return <div className="loading">Loading verification form...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error" role="alert">
        <strong>Error: </strong>
        <span>{error}</span>
      </div>
    );
  }

  if (!collectionKey || !requirements) {
    return null;
  }

  // Get environment configuration to check if dev mode is enabled
  const config = getConfig();
  console.log('VerificationEntry - Environment config:', {
    devMode: config.devMode,
    defaultCollectionKey: config.defaultCollectionKey,
    logLevel: config.logLevel
  });
  
  // Only use config.devMode to determine if development mode is enabled
  // This ensures the development mode banner is only shown when DEV_MODE=true in .env
  const isDevelopmentMode = config.devMode;
  
  console.log('VerificationEntry - isDevelopmentMode:', isDevelopmentMode, 'config.devMode:', config.devMode);
  const anyConsentsRequired =
    requirements.consentsRequired.driverLicense ||
    requirements.consentsRequired.drugTest ||
    requirements.consentsRequired.biometric;

  // Determine the initial step based on requirements
  const determineInitialStep = (): FormStepId => {
    const stepOrder: FormStepId[] = [
      'personal-info',
      'consents',
      'residence-history',
      'employment-history',
      'education',
      'professional-licenses',
      'signature',
    ];

    // Find the first enabled step
    for (const step of stepOrder) {
      switch (step) {
        case 'personal-info':
          if (requirements.verificationSteps.personalInfo?.enabled) return step;
          break;
        case 'consents':
          if (anyConsentsRequired) return step;
          break;
        case 'residence-history':
          if (requirements.verificationSteps.residenceHistory?.enabled) return step;
          break;
        case 'employment-history':
          if (requirements.verificationSteps.employmentHistory?.enabled) return step;
          break;
        case 'education':
          if (requirements.verificationSteps.education?.enabled) return step;
          break;
        case 'professional-licenses':
          if (requirements.verificationSteps.professionalLicense?.enabled) return step;
          break;
        case 'signature':
          if (requirements.signature?.required) return step;
          break;
      }
    }

    // Default to signature if no steps are enabled
    return 'signature';
  };
const initialStep = determineInitialStep();
console.log('VerificationEntry - Determined initial step:', initialStep);

  return (
    <FormProvider
      requirements={requirements || {
        language: 'en',
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        verificationSteps: {
          personalInfo: { enabled: true },
          residenceHistory: { enabled: true, years: 3 },
          employmentHistory: { enabled: false, mode: 'years', modes: { years: 0 } },
          education: { enabled: false },
          professionalLicense: { enabled: false },
        },
        signature: { required: false, mode: 'wet' },
      }}
      onSubmit={handleSubmit}
      initialStep={initialStep}
      isDefaultKey={isDefaultKey}
      collectionKey={collectionKey || undefined}
      onStepChange={handleStepChange}
    >
      <div className="verification-entry">
        {isDevelopmentMode && (
          <Card className="dev-mode-card">
            <CardHeader className="flex flex-row items-center gap-2 p-2">
              <AlertTriangle className="h-4 w-4 text-[var(--warning-color)]" />
              <CardTitle className="text-[var(--font-size-small)] font-[var(--font-weight-medium)] text-[var(--warning-color)]">
                Development Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-0">
              <p className="text-[var(--font-size-small)] text-[var(--warning-color)]">
                Using {!directUrlParams.get('token') ? 'generated reference token' : 'provided token'} and
                {!directKeyParam ? ' default collection key with maximum scope' : ' provided collection key'}.{' '}
                <a
                  href="/logs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="header-link"
                >
                  View Logs
                </a>
              </p>
            </CardContent>
          </Card>
        )}

        <FormStepRenderer currentStep={currentStep} consentsRequired={anyConsentsRequired} />
        
        {/* Add the Footer component at the bottom */}
        <Footer />
      </div>
    </FormProvider>
  );
};

export default VerificationEntry;