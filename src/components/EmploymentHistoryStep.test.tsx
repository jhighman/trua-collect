import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmploymentHistoryStep } from './EmploymentHistoryStep';
import { TranslationProvider } from '../context/TranslationContext';
import { FormProvider } from '../context/FormContext';
import type { Requirements } from '../utils/collectionKeyParser';

// Mock translations
jest.mock('../utils/translations', () => ({
  translations: {
    en: {
      'employment.title': 'Employment History',
      'employment.intro': 'Please provide your employment history',
      'employment.add_entry': 'Add Employment Entry',
      'employment.progress': 'Progress',
      'employment.progress_label': '{{years}} / {{required}} years',
      'navigation.previous': 'Previous',
      'navigation.next': 'Next'
    },
    es: {
      'employment.title': 'Historial de Empleo',
      'employment.intro': 'Por favor proporcione su historial de empleo',
      'employment.add_entry': 'Añadir Empleo',
      'employment.progress': 'Progreso',
      'employment.progress_label': '{{years}} / {{required}} años',
      'navigation.previous': 'Anterior',
      'navigation.next': 'Siguiente'
    }
  }
}));

const mockRequirements: Requirements = {
  language: 'en',
  consents_required: {
    driver_license: false,
    drug_test: false,
    biometric: false
  },
  verification_steps: {
    education: {
      enabled: false,
      required_verifications: []
    },
    professional_license: {
      enabled: false,
      required_verifications: []
    },
    residence_history: {
      enabled: true,
      years: 7,
      required_verifications: []
    },
    employment_history: {
      enabled: true,
      years: 7,
      required_verifications: []
    }
  }
};

// Mock form context with proper values
const mockFormContextValue = {
  currentStep: 'employment-history',
  getValue: jest.fn().mockReturnValue([]),
  setValue: jest.fn(),
  getStepErrors: jest.fn().mockReturnValue({}),
  canMoveNext: true,
  moveToNextStep: jest.fn(),
  moveToPreviousStep: jest.fn(),
  canMovePrevious: true,
  formState: {
    currentStep: 'employment-history',
    steps: {
      'employment-history': {
        id: 'employment-history',
        values: { entries: [], totalYears: 0 },
        touched: new Set(),
        errors: {},
        isComplete: false,
        isValid: true
      }
    },
    isSubmitting: false,
    isComplete: false
  }
};

// Mock the form context
jest.mock('../context/FormContext', () => ({
  ...jest.requireActual('../context/FormContext'),
  useForm: () => mockFormContextValue
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <TranslationProvider initialLanguage="en">
      <FormProvider 
        requirements={mockRequirements}
        onSubmit={async () => {}}
      >
        {ui}
      </FormProvider>
    </TranslationProvider>
  );
};

describe('EmploymentHistoryStep Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders employment history step', () => {
    renderWithProviders(<EmploymentHistoryStep />);
    expect(screen.getByText('Employment History')).toBeInTheDocument();
    expect(screen.getByText('Add Employment Entry')).toBeInTheDocument();
  });

  test('shows progress', () => {
    renderWithProviders(<EmploymentHistoryStep />);
    expect(screen.getByText('Progress')).toBeInTheDocument();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '0');
    expect(progressBar).toHaveAttribute('aria-valuemax', '7');
  });

  test('renders with Spanish language', () => {
    render(
      <TranslationProvider initialLanguage="es">
        <FormProvider 
          requirements={{ ...mockRequirements, language: 'es' }}
          onSubmit={async () => {}}
        >
          <EmploymentHistoryStep />
        </FormProvider>
      </TranslationProvider>
    );
    
    expect(screen.getByText('Historial de Empleo')).toBeInTheDocument();
  });
});