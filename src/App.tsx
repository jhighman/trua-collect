/* eslint-disable no-console */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VerificationEntry from './components/VerificationEntry';
import { FormState, FormProvider } from './context/FormContext';
import { TranslationProvider } from './context/TranslationContext';
import FormStateViewer from './components/FormStateViewer';
import { getConfig } from './utils/EnvironmentConfig';
import { Requirements } from './utils/collectionKeyParser';
import './App.css';

// Import the ConfirmationPage component
import ConfirmationPage from './components/ConfirmationPage';

const App: React.FC = () => {
  // Get environment configuration
  const config = getConfig();
  
  // Get URL parameters
  const urlSearch = window.location.search;
  const urlParams = new URLSearchParams(urlSearch);
  const keyParam = urlParams.get('key');
  const tokenParam = urlParams.get('token');
  
  // Debug raw URL and parameters
  console.log('App - Raw window.location.href:', window.location.href);
  console.log('App - Raw window.location.search:', urlSearch);
  console.log('App - URL parameters:', { key: keyParam, token: tokenParam });
  console.log('App - Environment configuration:', {
    defaultCollectionKey: config.defaultCollectionKey,
    devMode: config.devMode,
    logLevel: config.logLevel
  });
  
  // Mock submission handler
  const handleSubmit = async (formData: FormState & { referenceToken?: string }) => {
    // eslint-disable-next-line no-console
    console.log('Form submitted:', formData);
    // In a real application, this would send the data to a server
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Form processed successfully');
        resolve();
      }, 1000);
    });
  };

  // Default form requirements
  const defaultRequirements: Requirements = {
    language: 'en',
    consentsRequired: { 
      driverLicense: false, 
      drugTest: false, 
      biometric: false 
    },
    verificationSteps: {
      personalInfo: { 
        enabled: true,
        modes: {
          email: true,
          phone: true,
          fullName: true,
          nameAlias: false
        }
      },
      residenceHistory: { 
        enabled: true,
        years: 3
      },
      employmentHistory: { 
        enabled: true,
        mode: 'years',
        modes: { years: 3 }
      },
      education: { enabled: true },
      professionalLicense: { enabled: true }
    },
    signature: { 
      required: true,
      mode: 'wet'
    }
  };

  // Ensure English language is used
  console.log('Initializing TranslationProvider with language: en');
  
  return (
    <TranslationProvider initialLanguage="en">
      <Router>
        <FormProvider requirements={defaultRequirements} onSubmit={handleSubmit}>
          <Routes>
            <Route path="/" element={<VerificationEntry onSubmit={handleSubmit} urlKey={keyParam || undefined} urlToken={tokenParam || undefined} />} />
            <Route path="/verify" element={<VerificationEntry onSubmit={handleSubmit} urlKey={keyParam || undefined} urlToken={tokenParam || undefined} />} />
            <Route path="/confirmation" element={
              <ConfirmationPage
                trackingId={new URLSearchParams(window.location.search).get('trackingId') || 'unknown'}
              />
            } />
            <Route path="/logs" element={<FormStateViewer />} />
          </Routes>
        </FormProvider>
      </Router>
    </TranslationProvider>
  );
};

export default App;