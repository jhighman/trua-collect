export interface DocumentMetadata {
  trackingId: string;
  submissionDate: string;
  version: string;
  referenceToken?: string;
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone?: string;
  [key: string]: string | undefined;
}

export interface ResidenceHistoryEntry {
  address: string;
  startDate: string;
  endDate: string;
  city: string;
  state_province: string;
  country: string;
  zip_postal: string;
}

export interface EmploymentHistoryEntry {
  employer: string;
  position: string;
  startDate: string;
  endDate: string;
  city: string;
  state_province: string;
  country: string;
  description?: string;
  contact_name?: string;
  contact_type?: string;
  no_contact_attestation?: boolean;
}

export interface EducationEntry {
  institution: string;
  degree: string;
  completionDate: string;
  startDate: string;
  endDate: string;
  fieldOfStudy?: string;
  location?: string;
}

export interface ProfessionalLicenseEntry {
  licenseType: string;
  licenseNumber: string;
  expirationDate: string;
  startDate: string;
  endDate: string;
  issuingAuthority: string;
  state: string;
  country: string;
  isActive: boolean;
  description?: string;
  issueDate: string;
}

export interface Signature {
  signatureImage: string;
  signatureDate: string;
  confirmation: boolean;
}

export interface Timeline {
  startDate: string;
  endDate: string;
  entries: (ResidenceHistoryEntry | EmploymentHistoryEntry | EducationEntry | ProfessionalLicenseEntry)[];
}

export interface JsonDocument {
  metadata: DocumentMetadata;
  timeline: Timeline;
  personalInfo?: PersonalInfo;
  residenceHistory?: ResidenceHistoryEntry[];
  employmentHistory?: EmploymentHistoryEntry[];
  education?: EducationEntry[];
  professionalLicenses?: ProfessionalLicenseEntry[];
  signature?: Signature;
} 