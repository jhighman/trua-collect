import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfessionalLicensesStep } from './ProfessionalLicensesStep';
import { TranslationProvider } from '../context/TranslationContext';
import { ProfessionalLicenseEntryData } from './ProfessionalLicenseEntry';

// Mock the FormContext
const mockEntries: ProfessionalLicenseEntryData[] = [
  {
    id: 'license-1',
    licenseType: 'Certified Public Accountant',
    licenseNumber: 'CPA-12345',
    issuingAuthority: 'State Board of Accountancy',
    issueDate: '2020-01-15',
    expirationDate: '2025-01-14',
    isActive: true,
    state: 'California',
    country: 'USA',
    description: 'Licensed to practice public accounting in California',
    startDate: '2020-01-15',  // Same as issueDate
    endDate: '2025-01-14',    // Same as expirationDate
    isCurrent: true           // Same as isActive
  },
  {
    id: 'license-2',
    licenseType: 'Project Management Professional',
    licenseNumber: 'PMP-67890',
    issuingAuthority: 'Project Management Institute',
    issueDate: '2019-05-20',
    expirationDate: '2022-05-19',
    isActive: false,
    state: 'N/A',
    country: 'USA',
    description: 'Certified project management professional',
    startDate: '2019-05-20',  // Same as issueDate
    endDate: '2022-05-19',    // Same as expirationDate
    isCurrent: false          // Same as isActive
  }
];

const mockFormContext = {
  setValue: jest.fn(),
  getValue: jest.fn().mockImplementation((stepId: string, fieldId: string) => {
    if (stepId === 'professional-licenses' && fieldId === 'entries') {
      return mockEntries;
    }
    return null;
  }),
  getStepErrors: jest.fn().mockReturnValue({}),
  isStepValid: jest.fn().mockReturnValue(true),
  currentStep: 'professional-licenses',
  formState: {
    steps: {
      'professional-licenses': {
        values: {
          entries: mockEntries
        },
        errors: {},
        isValid: true
      }
    },
    currentStep: 'professional-licenses'
  },
  navigationState: {
    canMoveNext: true,
    canMovePrevious: true,
    availableSteps: ['personal-info', 'professional-licenses', 'signature'],
    completedSteps: ['personal-info']
  },
  moveToNextStep: jest.fn(),
  moveToPreviousStep: jest.fn(),
  moveToStep: jest.fn(),
  canMoveNext: true,
  canMovePrevious: true,
  availableSteps: ['personal-info', 'professional-licenses', 'signature'],
  completedSteps: ['personal-info'],
  addTimelineEntry: jest.fn(),
  updateTimelineEntry: jest.fn(),
  removeTimelineEntry: jest.fn(),
  getTimelineEntries: jest.fn().mockReturnValue(mockEntries),
  submitForm: jest.fn(),
  formErrors: {}
};

// Mock the useForm hook
jest.mock('../context/FormContext', () => ({
  ...jest.requireActual('../context/FormContext'),
  useForm: () => mockFormContext
}));

// Mock the ProfessionalLicenseEntry component
jest.mock('./ProfessionalLicenseEntry', () => ({
  ...jest.requireActual('./ProfessionalLicenseEntry'),
  ProfessionalLicenseEntry: jest.fn().mockImplementation(({ entry, onSave, onCancel }) => (
    <div data-testid="license-entry-mock">
      <div>License Type: {entry.licenseType}</div>
      <div>License Number: {entry.licenseNumber}</div>
      <button onClick={() => onSave(entry)}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ))
}));

describe('ProfessionalLicensesStep Component', () => {
  const renderComponent = () => {
    return render(
      <TranslationProvider initialLanguage="en">
        <ProfessionalLicensesStep />
      </TranslationProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the licenses step with entries', () => {
    renderComponent();
    
    // Check if the component renders correctly
    expect(screen.getByRole('heading', { name: /professional licenses/i })).toBeInTheDocument();
    
    // Check if entries are displayed
    expect(screen.getByText('Certified Public Accountant')).toBeInTheDocument();
    expect(screen.getByText('Project Management Professional')).toBeInTheDocument();
    
    // Check if add button is displayed
    expect(screen.getByRole('button', { name: /add professional license/i })).toBeInTheDocument();
  });

  it('handles adding a new entry', () => {
    renderComponent();
    
    // Click the add button
    const addButton = screen.getByRole('button', { name: /add professional license/i });
    fireEvent.click(addButton);
    
    // Check if the ProfessionalLicenseEntry component is rendered
    expect(screen.getByTestId('license-entry-mock')).toBeInTheDocument();
  });

  it('handles editing an existing entry', () => {
    renderComponent();
    
    // Click the edit button for the first entry
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    // Check if the ProfessionalLicenseEntry component is rendered with the correct entry
    const entryMock = screen.getByTestId('license-entry-mock');
    expect(entryMock).toBeInTheDocument();
    expect(screen.getByText('License Type: Certified Public Accountant')).toBeInTheDocument();
  });

  it('handles removing an entry', () => {
    renderComponent();
    
    // Click the remove button for the first entry
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    
    // Check if setValue was called with the updated entries
    expect(mockFormContext.setValue).toHaveBeenCalledWith('professional-licenses', 'entries', [mockEntries[1]]);
  });

  it('shows valid status when form is valid', () => {
    mockFormContext.isStepValid.mockReturnValue(true);
    renderComponent();
    
    // Check if valid status is displayed
    expect(screen.getByText(/professional license information is complete/i)).toBeInTheDocument();
  });

  it('shows invalid status when form is invalid', () => {
    mockFormContext.isStepValid.mockReturnValue(false);
    renderComponent();
    
    // Check if invalid status is displayed
    expect(screen.getByText(/please complete all required professional license information/i)).toBeInTheDocument();
  });
});