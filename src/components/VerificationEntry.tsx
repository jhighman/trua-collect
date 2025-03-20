/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { parseCollectionKey, getRequirements } from '../utils/collectionKeyParser';
import { v4 as uuidv4 } from 'uuid';
import { FormProvider, FormState } from '../context/FormContext';
import PersonalInfoStep from './PersonalInfoStep';
import { ResidenceHistoryStep } from './ResidenceHistoryStep';
import { EmploymentHistoryStep } from './EmploymentHistoryStep';
import EducationStep from './EducationStep';
import ProfessionalLicensesStep from './ProfessionalLicensesStep';
import ConsentsStep from './ConsentsStep';
import Signature from './Signature';
import { FormStepId } from '../utils/FormConfigGenerator';

interface VerificationEntryProps {
  onSubmit: (formData: FormState & { referenceToken?: string }) => Promise<void>;
}

/**
 * Generates a default collection key with maximum scope
 * This includes all verification steps and maximum years for history
 */
const generateDefaultCollectionKey = (): string => {
  // Format: en111111100100
  // Language: en
  // Bits 1-3: All consents enabled (111)
  // Bits 4-6: All verification steps enabled (111)
  // Bits 7-9: Residence history years (100 = 10 years)
  // Bit 10: Employment history enabled (1)
  // Bits 11-13: Employment history years (100 = 10 years)
  return 'en111111100100';
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
      <h1 className="text-2xl font-bold mb-6">Trua Verify</h1>
      
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
        initialStep={currentStep}
        onStepChange={setCurrentStep}
      >
        {currentStep === 'personal-info' && <PersonalInfoStep />}
        {currentStep === 'residence-history' && <ResidenceHistoryStep />}
        {currentStep === 'employment-history' && <EmploymentHistoryStep />}
        {currentStep === 'education' && <EducationStep />}
        {currentStep === 'professional-licenses' && <ProfessionalLicensesStep />}
        {currentStep === 'consents' && <ConsentsStep />}
        {currentStep === 'signature' && <Signature />}
      </FormProvider>
    </div>
  );
};

export default VerificationEntry;