/* eslint-disable no-console */
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseCollectionKey, getRequirements } from '../utils/collectionKeyParser';
import { v4 as uuidv4 } from 'uuid';
import { FormProvider, FormState } from '../context/FormContext';
import { FormStepId } from '../utils/FormConfigGenerator';
import FormStepRenderer from './FormStepRenderer';
import { FormLogger } from '../utils/FormLogger';

interface VerificationEntryProps {
  onSubmit: (formData: FormState & { referenceToken?: string }) => Promise<void>;
}

/**
 * Generates a default collection key with maximum scope
 * This includes all verification steps and maximum years for history
 */
const generateDefaultCollectionKey = (): string => {
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
  return 'en000111100100';
};

/**
 * Generates a random reference token for development/testing
 */
const generateReferenceToken = (): string => {
  return uuidv4();
};

const VerificationEntry: React.FC<VerificationEntryProps> = ({ onSubmit }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [referenceToken, setReferenceToken] = useState<string | null>(null);
  const [collectionKey, setCollectionKey] = useState<string | null>(null);
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

  useEffect(() => {
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const key = urlParams.get('key');

    // Development mode - use default values if URL parameters are missing
    if (!token || !key) {
      // eslint-disable-next-line no-console
      console.log('Development mode: Using default values for missing URL parameters');
      
      // Generate default reference token if missing
      const defaultToken = token || generateReferenceToken();
      
      // Generate default collection key if missing
      const defaultKey = key || generateDefaultCollectionKey();
      
      try {
        // Validate the collection key (even if it's the default one)
        parseCollectionKey(defaultKey);
        
        // Store token and key
        setReferenceToken(defaultToken);
        setCollectionKey(defaultKey);
        setLoading(false);
        
        // Log the default values for debugging
        if (!token) console.log('Using default reference token:', defaultToken);
        if (!key) console.log('Using default collection key:', defaultKey);
        
        return;
      } catch (error) {
        setError('Invalid collection key format.');
        setLoading(false);
        return;
      }
    }

    // Normal mode - validate the provided URL parameters
    try {
      parseCollectionKey(key);
      setReferenceToken(token);
      setCollectionKey(key);
      setLoading(false);
    } catch (error) {
      setError('Invalid collection key. Please use a valid invitation link.');
      setLoading(false);
    }
  }, []);

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
  const isDevelopmentMode = !window.location.search.includes('token=') || !window.location.search.includes('key=');

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
            Using {!window.location.search.includes('token=') ? 'generated reference token' : 'provided token'} and
            {!window.location.search.includes('key=') ? ' default collection key with maximum scope' : ' provided collection key'}.
          </span>
        </div>
      )}
      
      <FormProvider
        requirements={requirements}
        onSubmit={handleSubmit}
        initialStep={!initialStepSet ? currentStep : undefined}
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