import { 
  PersonalInfo, 
  ResidenceHistoryEntry, 
  EmploymentHistoryEntry,
  EducationEntry,
  ProfessionalLicenseEntry,
  Signature
} from './documents';

export type FormStepId = 
  | 'personal-info'
  | 'residence-history'
  | 'employment-history'
  | 'education'
  | 'professional-licenses'
  | 'signature';

export interface PersonalInfoStepValues {
  fullName: string;
  email: string;
}

export interface ResidenceHistoryStepValues {
  entries: ResidenceHistoryEntry[];
}

export interface EmploymentHistoryStepValues {
  entries: EmploymentHistoryEntry[];
}

export interface EducationStepValues {
  entries: EducationEntry[];
}

export interface ProfessionalLicensesStepValues {
  entries: ProfessionalLicenseEntry[];
}

export interface SignatureStepValues {
  signature: string;
  confirmation: boolean;
  trackingId?: string;
}

type StepValues = 
  | PersonalInfoStepValues 
  | ResidenceHistoryStepValues
  | EmploymentHistoryStepValues
  | EducationStepValues
  | ProfessionalLicensesStepValues
  | SignatureStepValues;

export interface StepState {
  values?: StepValues;
  isValid: boolean;
  isDirty: boolean;
  isSubmitted: boolean;
}

export interface FormState {
  currentStepId: FormStepId;
  steps: {
    [key in FormStepId]: StepState;
  };
  completedSteps: FormStepId[];
  isSubmitting: boolean;
  isComplete: boolean;
  personalInfo?: {
    entries: PersonalInfo[];
  };
  residenceHistory?: {
    entries: ResidenceHistoryEntry[];
  };
  employmentHistory?: {
    entries: EmploymentHistoryEntry[];
  };
  education?: {
    entries: EducationEntry[];
  };
  professionalLicenses?: {
    entries: ProfessionalLicenseEntry[];
  };
  signature?: {
    entries: Signature[];
  };
} 