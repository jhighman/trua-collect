import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VerificationEntry from './VerificationEntry';
import * as EnvironmentConfig from '../utils/EnvironmentConfig';
import * as CollectionKeyParser from '../utils/collectionKeyParser';
import type { Requirements } from '../utils/collectionKeyParser';
import type { FormStepId } from '../utils/FormConfigGenerator';

// Mock UUID
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-1234'
}));

// Mock FormLogger
jest.mock('../utils/FormLogger', () => ({
  FormLogger: {
    logFormState: jest.fn()
  }
}));

// Mock environment config
jest.spyOn(EnvironmentConfig, 'getConfig').mockReturnValue({
  defaultCollectionKey: 'en-EPMA-DTB-R5-E5-E-P-W',
  port: 3000,
  devMode: true,
  logLevel: 'debug',
  apiBaseUrl: 'http://localhost:3000',
  documentStoragePath: '/tmp/docs'
});

// Mock requirements
const mockRequirements: Requirements = {
  language: 'en',
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
    education: {
      enabled: true
    },
    professionalLicense: {
      enabled: true
    },
    residenceHistory: {
      enabled: true,
      years: 3
    },
    employmentHistory: {
      enabled: true,
      mode: 'years' as const,
      modes: {
        years: 3
      }
    }
  },
  consentsRequired: {
    driverLicense: true,
    drugTest: true,
    biometric: true
  },
  signature: {
    required: true,
    mode: 'checkbox' as const
  }
};

// Mock collection key parser
jest.spyOn(CollectionKeyParser, 'parseCollectionKey').mockImplementation(() => ({
  language: 'en',
  facets: ['E', 'PMA', 'DTB', 'R5', 'E5', 'E', 'P', 'W']
}));

jest.spyOn(CollectionKeyParser, 'getRequirements').mockImplementation(
  () => mockRequirements
);

// Mock FormProvider and FormStepRenderer
jest.mock('../context/FormContext', () => ({
  FormProvider: ({ children, onSubmit }: { children: React.ReactNode; onSubmit: (data: any) => Promise<void> }) => (
    <div data-testid="form-provider" onClick={() => onSubmit({ currentStep: 'personal-info' })}>
      {children}
    </div>
  )
}));

jest.mock('./FormStepRenderer', () => ({
  __esModule: true,
  default: ({ currentStep, consentsRequired }: { currentStep: string; consentsRequired: boolean }) => (
    <div data-testid="form-step-renderer">
      Step: {currentStep}
      Consents: {consentsRequired ? 'Required' : 'Not Required'}
    </div>
  )
}));

describe('VerificationEntry', () => {
  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    window.history.pushState({}, '', '/');
    jest.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <MemoryRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              <VerificationEntry 
                onSubmit={mockOnSubmit}
                {...props}
              />
            } 
          />
          <Route path="/confirmation" element={<div>Confirmation</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders development mode message and form', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByText(/Trua Verify/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Development Mode/i)).toBeInTheDocument();
    expect(screen.getByTestId('form-step-renderer')).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId('form-provider')).toBeInTheDocument();
    });

    screen.getByTestId('form-provider').click();

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          currentStep: 'personal-info',
          referenceToken: expect.any(String)
        })
      );
    });
  });

  it('handles invalid collection key', async () => {
    jest.spyOn(CollectionKeyParser, 'parseCollectionKey')
      .mockImplementationOnce(() => {
        throw new Error('Invalid collection key format.');
      });

    renderComponent({ urlKey: 'invalid-key' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Invalid collection key format/i)).toBeInTheDocument();
    });
  });
}); 