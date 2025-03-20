import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ResidenceHistoryStep } from './ResidenceHistoryStep';
import { TranslationProvider } from '../context/TranslationContext';
import { FormProvider } from '../context/FormContext';

// Mock translations
jest.mock('../utils/translations', () => ({
  translations: {
    en: {
      'residence.title': 'Residence History',
      'residence.add_entry': 'Add Residence',
      'residence.progress': 'Progress',
      'timeline.progress': '{{current}} / {{required}} years',
      'common.previous': 'Previous',
      'common.next': 'Next'
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

// Mock the FormContext
jest.mock('../context/FormContext', () => ({
  ...jest.requireActual('../context/FormContext'),
  useForm: () => ({
    currentStep: 'residence-history',
    setValue: jest.fn(),
    getValue: jest.fn().mockImplementation((stepId, fieldId) => {
      if (stepId === 'residence-history' && fieldId === 'entries') {
        return [
          {
            address: '123 Test St',
            city: 'Test City',
            state_province: 'Test State',
            zip_postal: '12345',
            country: 'Test Country',
            start_date: '2020-01-01',
            end_date: '2022-01-01',
            is_current: false,
            duration_years: 2
          }
        ];
      }
      return null;
    }),
    getStepErrors: jest.fn().mockReturnValue({}),
    canMoveNext: true,
    moveToNextStep: jest.fn(),
    moveToPreviousStep: jest.fn(),
    canMovePrevious: true,
    formState: {
      currentStep: 'residence-history',
      steps: {
        'residence-history': {
          id: 'residence-history',
          values: {},
          touched: new Set(),
          errors: {},
          isComplete: false,
          isValid: true
        }
      },
      isSubmitting: false,
      isComplete: false
    }
  })
}));

describe('ResidenceHistoryStep Component', () => {
  test('renders residence history step with existing entries', () => {
    renderWithProviders(<ResidenceHistoryStep />);
    
    // Check if the title is displayed
    expect(screen.getByText('Residence History')).toBeInTheDocument();
    
    // Check if the progress indicator is displayed
    expect(screen.getByText('2 / 7 years')).toBeInTheDocument();
    
    // Check if the existing entry is displayed
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    
    // Check if the "Add Residence" button is displayed
    expect(screen.getByText('Add Residence')).toBeInTheDocument();
    
    // Check if navigation buttons are displayed
    expect(screen.getByText('Previous')).toBeInTheDocument();
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  test('shows add form when "Add Residence" button is clicked', () => {
    renderWithProviders(<ResidenceHistoryStep />);
    
    // Click the "Add Residence" button
    fireEvent.click(screen.getByText('Add Residence'));
    
    // Check if the add form is displayed
    expect(screen.getByText('Add Residence', { selector: 'h3' })).toBeInTheDocument();
    
    // Check if form fields are displayed
    expect(screen.getByLabelText('Street Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('State/Province')).toBeInTheDocument();
    expect(screen.getByLabelText('ZIP/Postal Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('I currently live at this address')).toBeInTheDocument();
    
    // Check if form buttons are displayed
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Residence')).toBeInTheDocument();
  });

  test('hides add form when "Cancel" button is clicked', () => {
    renderWithProviders(<ResidenceHistoryStep />);
    
    // Click the "Add Residence" button
    fireEvent.click(screen.getByText('Add Residence'));
    
    // Click the "Cancel" button
    fireEvent.click(screen.getByText('Cancel'));
    
    // Check if the add form is hidden
    expect(screen.queryByText('Add Residence', { selector: 'h3' })).not.toBeInTheDocument();
    
    // Check if the "Add Residence" button is displayed again
    expect(screen.getByText('Add Residence', { selector: 'button' })).toBeInTheDocument();
  });

  test('disables "Save Residence" button when required fields are empty', () => {
    renderWithProviders(<ResidenceHistoryStep />);
    
    // Click the "Add Residence" button
    fireEvent.click(screen.getByText('Add Residence'));
    
    // Check if the "Save Residence" button is disabled
    expect(screen.getByText('Save Residence')).toBeDisabled();
    
    // Fill in some fields but not all required ones
    fireEvent.change(screen.getByLabelText('Street Address'), {
      target: { value: '456 New St' }
    });
    
    // Check if the "Save Residence" button is still disabled
    expect(screen.getByText('Save Residence')).toBeDisabled();
  });

  test('enables "Save Residence" button when all required fields are filled', () => {
    renderWithProviders(<ResidenceHistoryStep />);
    
    // Click the "Add Residence" button
    fireEvent.click(screen.getByText('Add Residence'));
    
    // Fill in all required fields
    fireEvent.change(screen.getByLabelText('Street Address'), {
      target: { value: '456 New St' }
    });
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'New City' }
    });
    fireEvent.change(screen.getByLabelText('State/Province'), {
      target: { value: 'New State' }
    });
    fireEvent.change(screen.getByLabelText('ZIP/Postal Code'), {
      target: { value: '54321' }
    });
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'New Country' }
    });
    fireEvent.change(screen.getByLabelText('Start Date'), {
      target: { value: '2022-01-01' }
    });
    
    // Check the "current residence" checkbox
    fireEvent.click(screen.getByLabelText('I currently live at this address'));
    
    // Check if the "Save Residence" button is enabled
    expect(screen.getByText('Save Residence')).not.toBeDisabled();
  });

  test('shows end date field when "current residence" is unchecked', () => {
    renderWithProviders(<ResidenceHistoryStep />);
    
    // Click the "Add Residence" button
    fireEvent.click(screen.getByText('Add Residence'));
    
    // End date field should not be visible initially (default is unchecked)
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
    
    // Check the "current residence" checkbox
    fireEvent.click(screen.getByLabelText('I currently live at this address'));
    
    // End date field should be hidden
    expect(screen.queryByLabelText('End Date')).not.toBeInTheDocument();
    
    // Uncheck the "current residence" checkbox
    fireEvent.click(screen.getByLabelText('I currently live at this address'));
    
    // End date field should be visible again
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });
});