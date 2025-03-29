/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseCollectionKey, getRequirements } from '../utils/collectionKeyParser';
import { v4 as uuidv4 } from 'uuid';
import { FormProvider, FormState } from '../context/FormContext';
import { FormStepId } from '../utils/FormConfigGenerator';
import FormStepRenderer from './FormStepRenderer';
import { FormLogger } from '../utils/FormLogger';
import { getConfig } from '../utils/EnvironmentConfig';

interface VerificationEntryProps {
  onSubmit: (formData: FormState & { referenceToken?: string }) => Promise<void>;
  urlKey?: string;
  urlToken?: string;
}

/**
 * Generates a default collection key with maximum scope
 * This includes all verification steps and maximum years for history
 */
const generateDefaultCollectionKey = (): string => {
  // Get the default collection key from environment configuration
  const config = getConfig();
  const defaultKey = config.defaultCollectionKey;
  
  console.log('VerificationEntry - Using default collection key from environment:', defaultKey);
  
  // Format: en000111100100100
  // Language: en
  // Bits 0-2: No consents enabled (000) - for testing skipping consents
  // Bit 3: Education enabled (1)
  // Bit 4: Professional licenses enabled (1)
  // Bit 5: Residence history enabled (1)
  // Bits 6-8: Residence history years (100 = 10 years)
  // Bit 9: Employment history enabled (1)
  // Bits 10-12: Employment history years (00 = 1 year)
  // Bit 13: Personal info enabled (1)
  // Bits 14-15: Personal info mode (00 = email)
  return defaultKey;
};

/**
 * Generates a random reference token for development/testing
 */
const generateReferenceToken = (): string => {
  return uuidv4();
};

const VerificationEntry: React.FC<VerificationEntryProps> = ({ onSubmit, urlKey, urlToken }) => {
  // Log URL parameters from props
  console.log('VerificationEntry - URL parameters from props:', { urlKey, urlToken });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [referenceToken, setReferenceToken] = useState<string | null>(null);
  const [collectionKey, setCollectionKey] = useState<string | null>(null);
  const [isDefaultKey, setIsDefaultKey] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<FormStepId>('personal-info');
  const [initialStepSet, setInitialStepSet] = useState<boolean>(false);
  
  const navigate = useNavigate();

  // Get the URL directly from the window object
  const directUrlSearch = window.location.search;
  const directUrlParams = new URLSearchParams(directUrlSearch);
  const directKeyParam = directUrlParams.get('key');
  
  // Log the raw URL at the component level
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
  }, [urlKey, urlToken, directKeyParam, directUrlParams]); // Add missing dependencies

  // Handle form submission with reference token
  const handleSubmit = async (formData: FormState) => {
    try {
      // Add reference token to form data
      const formDataWithToken = {
        ...formData,
        referenceToken: referenceToken || undefined
      };
      
      // Log the final form state
      FormLogger.logFormState(
        formData,
        collectionKey || 'unknown',
        { event: 'form_submission' }
      );
      
      await onSubmit(formDataWithToken);
      
      // Navigate to confirmation page
      navigate('/confirmation');
    } catch (error) {
      console.error('Form submission error:', error);
      setError('An error occurred while submitting the form. Please try again.');
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading verification form...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!collectionKey) {
    return null; // This should never happen due to the error handling above
  }

  // Get requirements from collection key
  const requirements = getRequirements(collectionKey);

  // Check if we're using default values (development mode)
  const isDevelopmentMode = !directUrlParams.get('token') || !directKeyParam;

  // Fix the consentsRequired access using camelCase
  const anyConsentsRequired = 
    requirements.consentsRequired.driverLicense ||
    requirements.consentsRequired.drugTest ||
    requirements.consentsRequired.biometric;

  // Render the form with the appropriate requirements
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Trua Verify</h1>
        <a
          href="/logs"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          View Logs
        </a>
      </div>
      
      {isDevelopmentMode && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Development Mode: </strong>
          <span className="block sm:inline">
            Using {!directUrlParams.get('token') ? 'generated reference token' : 'provided token'} and
            {!directKeyParam ? ' default collection key with maximum scope' : ' provided collection key'}.
          </span>
        </div>
      )}
      
      <FormProvider
        requirements={requirements}
        onSubmit={handleSubmit}
        initialStep={!initialStepSet ? 'personal-info' : undefined}
        isDefaultKey={isDefaultKey}
        collectionKey={collectionKey}
        onStepChange={(step, formState) => {
          if (!initialStepSet) {
            setInitialStepSet(true);
            console.log('VerificationEntry: Initial step set, will not reset on future renders');
          }
          
          console.log('VerificationEntry: onStepChange called with step:', step, 'Previous step:', currentStep);
          console.log('VerificationEntry: Form state to log:', formState);
          
          setCurrentStep(formState.currentStep);
          
          FormLogger.logFormState(
            formState,
            collectionKey || 'unknown',
            { event: 'step_change', previousStep: currentStep, newStep: formState.currentStep }
          );
          
          console.log('VerificationEntry: After handleStepChange, current step is now:', formState.currentStep);
        }}
      >
        <FormStepRenderer
          currentStep={currentStep}
          consentsRequired={anyConsentsRequired}
        />
      </FormProvider>
    </div>
  );
};

export default VerificationEntry;