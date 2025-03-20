import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EducationStep } from './EducationStep';
import { TranslationProvider } from '../context/TranslationContext';
import { EducationEntryData } from './EducationEntry';

// Mock the FormContext
const mockEntries: EducationEntryData[] = [
  {
    id: 'education-1',
    institution: 'Test University',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    startDate: '2018-09-01',
    endDate: '2022-06-30',
    isCurrent: false,
    description: 'Studied computer science with focus on software engineering',
    location: 'New York, NY'
  },
  {
    id: 'education-2',
    institution: 'Test College',
    degree: 'Associate Degree',
    fieldOfStudy: 'Information Technology',
    startDate: '2016-09-01',
    endDate: '2018-05-30',
    isCurrent: false,
    description: 'Studied IT fundamentals',
    location: 'Boston, MA'
  }
];

const mockFormContext = {
  setValue: jest.fn(),
  getValue: jest.fn().mockImplementation((stepId: string, fieldId: string) => {
    if (stepId === 'education' && fieldId === 'entries') {
      return mockEntries;
    }
    return null;
  }),
  getStepErrors: jest.fn().mockReturnValue({}),
  isStepValid: jest.fn().mockReturnValue(true),
  currentStep: 'education',
  formState: {
    steps: {
      'education': {
        values: {
          entries: mockEntries
        },
        errors: {},
        isValid: true
      }
    },
    currentStep: 'education'
  },
  navigationState: {
    canMoveNext: true,
    canMovePrevious: true,
    availableSteps: ['personal-info', 'education', 'signature'],
    completedSteps: ['personal-info']
  },
  moveToNextStep: jest.fn(),
  moveToPreviousStep: jest.fn(),
  moveToStep: jest.fn(),
  canMoveNext: true,
  canMovePrevious: true,
  availableSteps: ['personal-info', 'education', 'signature'],
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

// Mock the EducationEntry component
jest.mock('./EducationEntry', () => ({
  ...jest.requireActual('./EducationEntry'),
  EducationEntry: jest.fn().mockImplementation(({ entry, onSave, onCancel }) => (
    <div data-testid="education-entry-mock">
      <div>Institution: {entry.institution}</div>
      <div>Degree: {entry.degree}</div>
      <button onClick={() => onSave(entry)}>Save</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ))
}));

describe('EducationStep Component', () => {
  const renderComponent = () => {
    return render(
      <TranslationProvider initialLanguage="en">
        <EducationStep />
      </TranslationProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the education step with entries', () => {
    renderComponent();
    
    // Check if the component renders correctly
    expect(screen.getByRole('heading', { name: /education history/i })).toBeInTheDocument();
    
    // Check if entries are displayed
    expect(screen.getByText('Test University')).toBeInTheDocument();
    expect(screen.getByText('Test College')).toBeInTheDocument();
    
    // Check if add button is displayed
    expect(screen.getByRole('button', { name: /add education/i })).toBeInTheDocument();
  });

  it('handles adding a new entry', () => {
    renderComponent();
    
    // Click the add button
    const addButton = screen.getByRole('button', { name: /add education/i });
    fireEvent.click(addButton);
    
    // Check if the EducationEntry component is rendered
    expect(screen.getByTestId('education-entry-mock')).toBeInTheDocument();
  });

  it('handles editing an existing entry', () => {
    renderComponent();
    
    // Click the edit button for the first entry
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    // Check if the EducationEntry component is rendered with the correct entry
    const entryMock = screen.getByTestId('education-entry-mock');
    expect(entryMock).toBeInTheDocument();
    expect(screen.getByText('Institution: Test University')).toBeInTheDocument();
  });

  it('handles removing an entry', () => {
    renderComponent();
    
    // Click the remove button for the first entry
    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    
    // Check if setValue was called with the updated entries
    expect(mockFormContext.setValue).toHaveBeenCalledWith('education', 'entries', [mockEntries[1]]);
  });

  it('shows valid status when form is valid', () => {
    mockFormContext.isStepValid.mockReturnValue(true);
    renderComponent();
    
    // Check if valid status is displayed
    expect(screen.getByText(/education information is complete/i)).toBeInTheDocument();
  });

  it('shows invalid status when form is invalid', () => {
    mockFormContext.isStepValid.mockReturnValue(false);
    renderComponent();
    
    // Check if invalid status is displayed
    expect(screen.getByText(/please complete all required education information/i)).toBeInTheDocument();
  });
});