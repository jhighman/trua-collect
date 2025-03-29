import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EducationStep } from './EducationStep';
import { useForm } from '../context/FormContext';
import type { FormContextType, FormStepId } from '../context/FormContext';
import { EducationLevel } from '../types/EducationLevel';
import type { EducationEntryData } from './EducationEntry';
import { useTranslation } from '../context/TranslationContext';

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

// Mock education entries
const mockEducationEntries = [
  {
    id: 'education-1',
    institution: 'Test University',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    startDate: '2018-09-01',
    endDate: '2022-05-01',
    isCurrent: false,
    description: 'Major in Software Engineering',
    location: 'New York, NY'
  },
  {
    id: 'education-2',
    institution: 'Test College',
    degree: 'Associate of Arts',
    fieldOfStudy: 'General Studies',
    startDate: '2016-09-01',
    endDate: '2018-05-01',
    isCurrent: false,
    description: 'General Studies Program',
    location: 'Boston, MA'
  }
];

// Complete mock form context with all required properties
const createMockFormContext = (overrides = {}): FormContextType => ({
  // Form state
  formState: {
    currentStep: 'education',
    isSubmitting: false,
    isComplete: false,
    steps: {
      'personal-info': {
        id: 'personal-info',
        values: {},
        errors: {},
        isValid: true,
        isComplete: true,
        touched: new Set(['name', 'email'])
      },
      education: {
        id: 'education',
        values: {
          highestLevel: EducationLevel.Bachelors,
          timelineEntries: []
        },
        errors: {},
        isValid: true,
        isComplete: true,
        touched: new Set(['highestLevel', 'timelineEntries'])
      }
    }
  },

  // Navigation state
  currentStep: 'education',
  currentContextStep: 'education',
  availableSteps: [
    'personal-info',
    'education',
    'professional-licenses',
    'employment-history',
    'residence-history',
    'consents',
    'signature'
  ] as FormStepId[],
  
  // Navigation controls
  canMoveNext: true,
  canMovePrevious: true,
  moveToNextStep: jest.fn(),
  moveToPreviousStep: jest.fn(),
  moveToStep: jest.fn(),
  forceNextStep: jest.fn(),

  // Form operations
  getValue: jest.fn((stepId: FormStepId, fieldId: string) => {
    if (stepId === 'education' && fieldId === 'highestLevel') {
      return EducationLevel.Bachelors;
    }
    if (stepId === 'education' && fieldId === 'timelineEntries') {
      return [];
    }
    return '';
  }),
  setValue: jest.fn(),
  getStepErrors: jest.fn(() => ({})),
  isStepValid: jest.fn(() => true),
  isSubmitting: false,
  formErrors: {},
  submitForm: jest.fn(),
  completedSteps: ['personal-info'] as FormStepId[],
  
  // Timeline operations
  addTimelineEntry: jest.fn(),
  updateTimelineEntry: jest.fn(),
  removeTimelineEntry: jest.fn(),
  getTimelineEntries: jest.fn(() => []),

  // Navigation state
  navigationState: {
    canMoveNext: true,
    canMovePrevious: true,
    availableSteps: [
      'personal-info',
      'education',
      'professional-licenses',
      'employment-history',
      'residence-history',
      'consents',
      'signature'
    ] as FormStepId[],
    completedSteps: ['personal-info'] as FormStepId[]
  },

  ...overrides
});

// Complete mock requirements
const mockRequirements = {
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
      enabled: true,
      requiredVerifications: []
    },
    professionalLicense: {
      enabled: true,
      requiredVerifications: []
    },
    residenceHistory: {
      enabled: true,
      requiredYears: 7
    },
    employmentHistory: {
      enabled: true,
      mode: 'years' as const,
      modes: {
        years: 7,
        employers: 0
      }
    }
  },
  consentsRequired: {
    driverLicense: false,
    drugTest: false,
    biometric: false
  },
  signature: {
    enabled: true,
    required: true,
    mode: 'wet' as const
  }
};

// Mock the form context hook
jest.mock('../context/FormContext', () => ({
  useForm: jest.fn()
}));

// Mock translation context
const mockTranslationContext = {
  t: (key: string) => {
    const translations: { [key: string]: string } = {
      'education.title': 'Education History',
      'education.intro': 'Please provide your education history',
      'education.level_title': 'Highest Level of Education',
      'education.valid': 'Education information is complete',
      'education.college_required': 'Please add at least one degree',
      'education.level_required': 'Please select your highest level of education',
      'common.edit': 'Edit',
      'common.remove': 'Remove',
      'common.present': 'Present',
      'common.previous': 'Previous',
      'common.next': 'Next'
    };
    return translations[key] || key;
  }
};

// Mock the hooks
jest.mock('../context/FormContext', () => ({
  useForm: jest.fn(() => createMockFormContext())
}));

jest.mock('../context/TranslationContext', () => ({
  useTranslation: () => mockTranslationContext
}));

const renderEducationStep = (contextOverrides = {}) => {
  const mockContext = createMockFormContext(contextOverrides);
  (useForm as jest.MockedFunction<typeof useForm>).mockImplementation(() => mockContext);
  return render(<EducationStep />);
};

describe('EducationStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with complete context', () => {
    renderEducationStep();
    expect(screen.getByText('Education History')).toBeInTheDocument();
  });

  it('renders education level selection', () => {
    renderEducationStep();

    // Check if the education level selection is displayed
    expect(screen.getByText('Highest Level of Education')).toBeInTheDocument();
    expect(screen.getByLabelText(/education.level_label/)).toBeInTheDocument();
  });

  it('renders add button', () => {
    renderEducationStep();

    // Check if the add button is displayed
    const addButton = screen.getByRole('button', { name: /education.add_button/i });
    expect(addButton).toBeInTheDocument();
  });

  it('renders the education step component', () => {
    renderEducationStep();

    // Check if the component renders correctly
    expect(screen.getByText('Education History')).toBeInTheDocument();
    expect(screen.getByText('Highest Level of Education')).toBeInTheDocument();
  });

  it('shows validation messages', () => {
    renderEducationStep({
      getValue: jest.fn((stepId: FormStepId, fieldId: string) => {
        if (stepId === 'education' && fieldId === 'highestLevel') {
          return '';
        }
        if (stepId === 'education' && fieldId === 'timelineEntries') {
          return [];
        }
        return '';
      }),
      formState: {
        currentStep: 'education',
        steps: {
          education: {
            values: {
              highestLevel: '',
              timelineEntries: []
            },
            isValid: false,
            isComplete: false,
            touched: new Set(['highestLevel', 'timelineEntries'])
          }
        }
      }
    });

    // Use getAllByText to handle multiple elements with the same text
    const validationMessages = screen.getAllByText('Please select your highest level of education');
    expect(validationMessages.length).toBeGreaterThan(0);
  });

  it('shows incomplete status when college level selected but no entries', () => {
    renderEducationStep({
      getValue: jest.fn((stepId: FormStepId, fieldId: string) => {
        if (stepId === 'education' && fieldId === 'highestLevel') {
          return EducationLevel.Bachelors;
        }
        if (stepId === 'education' && fieldId === 'timelineEntries') {
          return [];
        }
        return '';
      }),
      formState: {
        currentStep: 'education',
        steps: {
          education: {
            values: {
              highestLevel: EducationLevel.Bachelors,
              timelineEntries: []
            },
            isValid: false,
            isComplete: false,
            touched: new Set(['highestLevel', 'timelineEntries'])
          }
        }
      }
    });

    expect(screen.getByText('Please add at least one degree')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    renderEducationStep();

    const previousButton = screen.getByText('Previous');
    expect(previousButton).toBeInTheDocument();
    
    const nextButton = screen.getByText('Next');
    expect(nextButton).toBeInTheDocument();
  });
});