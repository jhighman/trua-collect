/* eslint-disable no-console */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  
  // Format: en000111100100
  // Language: en
  // Bits 1-3: No consents enabled (000) - for testing skipping consents
  // Bits 4-6: All verification steps enabled (111)
  //   Bit 4: Education enabled (1)
  //   Bit 5: Professional licenses enabled (1)
  //   Bit 6: Residence history enabled (1)
  // Bits 7-9: Residence history years (100 = 10 years)
  // Bit 10: Employment history enabled (1)
  // Bits 11-13: Employment history years (100 = 10 years)
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
  
  // Custom step change handler that also logs the form state
  const handleStepChange = (step: FormStepId) => {
    console.log('VerificationEntry: handleStepChange called with step:', step);
    console.log('VerificationEntry: Current step before change:', currentStep);
    
    // Update the current step state
    setCurrentStep(step);
    
    console.log('VerificationEntry: Current step after change:', step);
    
    // Force a re-render to ensure the UI reflects the new step
    setTimeout(() => {
      console.log('VerificationEntry: Verifying current step after timeout:', step);
    }, 0);
    
    // We'll log the form state in the FormProvider's onStepChange callback
    // since we need access to the form state
  };
  
  // Add a function to force sync the current step with the form state
  const syncCurrentStep = useCallback((formState: FormState) => {
    if (formState.currentStep !== currentStep) {
      console.log('VerificationEntry: Syncing current step - UI:', currentStep, 'Form state:', formState.currentStep);
      setCurrentStep(formState.currentStep);
    }
  }, [currentStep]);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get the URL directly from the window object
  const directUrlSearch = window.location.search;
  const directUrlParams = new URLSearchParams(directUrlSearch);
  const directKeyParam = directUrlParams.get('key');
  
  // Log the raw URL at the component level
  console.log('VerificationEntry - Direct window.location.href:', window.location.href);
  console.log('VerificationEntry - Direct window.location.search:', directUrlSearch);
  console.log('VerificationEntry - Direct key param:', directKeyParam);

  useEffect(() => {
    // Use the URL parameters from props if available, otherwise try to get them from the URL
    console.log('VerificationEntry - Using URL parameters from props in effect');
    
    // Get token from props or URL or generate a default
    const token = urlToken || directUrlParams.get('token');
    
    // Use the key from props or URL
    const key = urlKey || directKeyParam;

    // Log the URL parameters for debugging
    console.log('VerificationEntry - URL parameters from props or direct access:', { token, key });
    
    // Generate default reference token if missing
    const defaultToken = token || generateReferenceToken();
    
    // Use the URL key if provided, otherwise use the default
    const collectionKeyToUse = key || generateDefaultCollectionKey();
    const keyIsDefault = !key;
    
    try {
      // Validate the collection key
      parseCollectionKey(collectionKeyToUse);
      
      // Store token, key, and isDefaultKey flag
      setReferenceToken(defaultToken);
      setCollectionKey(collectionKeyToUse);
      setIsDefaultKey(keyIsDefault);
      setLoading(false);
      
      // Log the values for debugging
      console.log('VerificationEntry - Using collection key:', collectionKeyToUse);
      console.log('VerificationEntry - Key from URL:', !!key);
      console.log('VerificationEntry - Is default key:', keyIsDefault);
    } catch (error) {
      setError('Invalid collection key format.');
      setLoading(false);
    }
  }, [urlKey, urlToken]); // Re-run when URL parameters from props change

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
        initialStep={!initialStepSet ? currentStep : undefined}
        isDefaultKey={isDefaultKey}
        onStepChange={(step, formState) => {
          // Mark that we've set the initial step
          if (!initialStepSet) {
            setInitialStepSet(true);
            console.log('VerificationEntry: Initial step set, will not reset on future renders');
          }
          // Log the step change with full form state
          console.log('VerificationEntry: onStepChange called with step:', step, 'Previous step:', currentStep);
          console.log('VerificationEntry: Form state to log:', formState);
          console.log('VerificationEntry: Current step in form state:', formState.currentStep);
          console.log('VerificationEntry: Current steps in form state:', Object.keys(formState.steps));
          
          // Verify the step change is reflected in the form state
          if (formState.currentStep !== step) {
            console.warn('VerificationEntry: Step mismatch! Callback step:', step, 'Form state step:', formState.currentStep);
            
            // Force sync the current step with the form state
            syncCurrentStep(formState);
          }
          
          // Check if the professional-licenses step is in the form state
          if (formState.steps['professional-licenses']) {
            console.log('VerificationEntry: professional-licenses step found in form state');
          } else {
            console.log('VerificationEntry: professional-licenses step NOT found in form state');
          }
          
          FormLogger.logFormState(
            formState,
            collectionKey || 'unknown',
            { event: 'step_change', previousStep: currentStep, newStep: step }
          );
          
          // Update the current step
          handleStepChange(step);
          
          // Log after the step change
          console.log('VerificationEntry: After handleStepChange, current step is now:', step);
          
          // Force a re-render to ensure the UI reflects the new step
          setTimeout(() => {
            console.log('VerificationEntry: Verifying current step after timeout:', step);
            console.log('VerificationEntry: Form state currentStep after timeout:', formState.currentStep);
            
            // Double-check that the UI and form state are in sync
            if (formState.currentStep !== step) {
              console.warn('VerificationEntry: Step still mismatched after timeout! UI step:', step, 'Form state step:', formState.currentStep);
              syncCurrentStep(formState);
            }
          }, 50);
        }}
      >
        <FormStepRenderer
          currentStep={currentStep}
          consentsRequired={
            requirements.consents_required.driver_license ||
            requirements.consents_required.drug_test ||
            requirements.consents_required.biometric
          }
        />
      </FormProvider>
    </div>
  );
};

export default VerificationEntry;