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

interface PersonalInfoStepValues {
  fullName: string;
  email: string;
}

interface ResidenceHistoryStepValues {
  entries: ResidenceHistoryEntry[];
}

interface EmploymentHistoryStepValues {
  entries: EmploymentHistoryEntry[];
}

interface EducationStepValues {
  entries: EducationEntry[];
}

interface ProfessionalLicensesStepValues {
  entries: ProfessionalLicenseEntry[];
}

interface SignatureStepValues {
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