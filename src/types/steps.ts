import { ResidenceHistoryEntry, EmploymentHistoryEntry, EducationEntry, ProfessionalLicenseEntry } from './documents';

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

export type StepValues =
  | PersonalInfoStepValues
  | ResidenceHistoryStepValues
  | EmploymentHistoryStepValues
  | EducationStepValues
  | ProfessionalLicensesStepValues
  | SignatureStepValues; 