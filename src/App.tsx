/* eslint-disable no-console */
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import VerificationEntry from './components/VerificationEntry';
import { FormState } from './context/FormContext';
import { TranslationProvider } from './context/TranslationContext';
import FormStateViewer from './components/FormStateViewer';
import './App.css';

const ConfirmationPage: React.FC = () => (
  <div className="max-w-4xl mx-auto p-4">
    <h1 className="text-2xl font-bold mb-6">Trua Verify</h1>
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
      <strong className="font-bold">Success! </strong>
      <span className="block sm:inline">Your verification information has been submitted successfully.</span>
    </div>
  </div>
);

const App: React.FC = () => {
  // Get URL parameters
  const urlSearch = window.location.search;
  const urlParams = new URLSearchParams(urlSearch);
  const keyParam = urlParams.get('key');
  const tokenParam = urlParams.get('token');
  
  // Debug raw URL and parameters
  console.log('App - Raw window.location.href:', window.location.href);
  console.log('App - Raw window.location.search:', urlSearch);
  console.log('App - URL parameters:', { key: keyParam, token: tokenParam });
  
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

  return (
    <TranslationProvider initialLanguage="en">
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/verify" replace={false} />} />
          <Route path="/verify" element={<VerificationEntry onSubmit={handleSubmit} urlKey={keyParam || undefined} urlToken={tokenParam || undefined} />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
          <Route path="/logs" element={<FormStateViewer />} />
        </Routes>
      </Router>
    </TranslationProvider>
  );
};

export default App;