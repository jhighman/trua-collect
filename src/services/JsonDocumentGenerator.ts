import { DocumentMetadata, EducationEntry, EmploymentHistoryEntry, JsonDocument, PersonalInfo, ProfessionalLicenseEntry, ResidenceHistoryEntry, Signature, Timeline } from '../types/documents';
import { FormState, ProfessionalLicensesStepValues, EmploymentHistoryStepValues, ResidenceHistoryStepValues, EducationStepValues, PersonalInfoStepValues, SignatureStepValues } from '../types/form';
import { Logger } from '../utils/logger';

export class JsonDocumentGenerator {
  private logger: Logger;

  constructor(private readonly formState: FormState) {
    this.logger = new Logger('JsonDocumentGenerator');
  }

  public generateJsonDocument(trackingId: string): JsonDocument {
    try {
      const metadata: DocumentMetadata = {
        trackingId,
        submissionDate: new Date().toISOString(),
        version: '1.0'
      };

      const timeline = this.generateTimeline(this.formState);

      return {
        metadata,
        timeline,
        personalInfo: (this.formState.steps['personal-info']?.values as PersonalInfoStepValues),
        residenceHistory: (this.formState.steps['residence-history']?.values as ResidenceHistoryStepValues)?.entries,
        employmentHistory: (this.formState.steps['employment-history']?.values as EmploymentHistoryStepValues)?.entries,
        education: (this.formState.steps['education']?.values as EducationStepValues)?.entries,
        professionalLicenses: (this.formState.steps['professional-licenses']?.values as ProfessionalLicensesStepValues)?.entries,
        signature: (this.formState.steps['signature']?.values as SignatureStepValues)?.signature
      };
    } catch (error) {
      this.logger.error('Error generating JSON document:', error);
      throw error;
    }
  }

  private generateTimeline(formState: FormState): Timeline {
    const entries: (ResidenceHistoryEntry | EmploymentHistoryEntry | EducationEntry | ProfessionalLicenseEntry)[] = [];

    // Add residence history entries
    const residenceHistory = (formState.steps['residence-history']?.values as ResidenceHistoryStepValues)?.entries;
    if (residenceHistory) {
      entries.push(...residenceHistory);
    }

    // Add employment history entries
    const employmentHistory = (formState.steps['employment-history']?.values as EmploymentHistoryStepValues)?.entries;
    if (employmentHistory) {
      entries.push(...employmentHistory);
    }

    // Add education entries
    const education = (formState.steps['education']?.values as EducationStepValues)?.entries;
    if (education) {
      entries.push(...education.map((entry: EducationEntry) => ({
        ...entry,
        startDate: entry.completionDate,
        endDate: entry.completionDate
      })));
    }

    // Add professional license entries
    const professionalLicenses = (formState.steps['professional-licenses']?.values as ProfessionalLicensesStepValues)?.entries;
    if (professionalLicenses) {
      entries.push(...professionalLicenses.map((entry: ProfessionalLicenseEntry) => ({
        ...entry,
        startDate: entry.startDate || entry.expirationDate,
        endDate: entry.endDate || entry.expirationDate,
        isActive: entry.isActive || true
      })));
    }

    // Sort entries by date
    entries.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return {
      startDate: entries.length > 0 ? entries[entries.length - 1].startDate : new Date().toISOString(),
      endDate: entries.length > 0 ? entries[0].endDate : new Date().toISOString(),
      entries
    };
  }
} 