import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
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
      'timeline.progress': '{{current}} / {{required}} years',
      'timeline.progress_label': '{{current}} / {{required}} years',
      'navigation.form_controls': 'Form Controls',
      'navigation.previous_step': 'Previous Step',
      'navigation.next_step': 'Next Step',
      'common.previous': 'Previous',
      'common.next': 'Next'
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

const mockRequirements = {
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

// Mock form context with initial state
const mockFormContextValue = {
  currentStep: 'employment-history',
  getValue: jest.fn().mockReturnValue([{
    type: 'Job',
    company: 'Test Company',
    start_date: '2020-01-01',
    end_date: '2022-01-01',
    duration_years: 2.0
  }]),
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
        values: { entries: [], totalYears: 2.0 },
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
    
    // Look for the time-text element with the exact text that's rendered
    const timeText = screen.getByText('2 / 7 years');
    expect(timeText).toBeInTheDocument();
    
    // Check if the progress bar exists with correct values
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '2');
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