import { DocumentMetadata, EducationEntry, EmploymentHistoryEntry, JsonDocument, PersonalInfo, ProfessionalLicenseEntry, ResidenceHistoryEntry, Signature, Timeline } from '../types/documents';
import { FormState } from '../types/form';
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
        personalInfo: this.formState.personalInfo?.entries[0],
        residenceHistory: this.formState.residenceHistory?.entries,
        employmentHistory: this.formState.employmentHistory?.entries,
        education: this.formState.education?.entries,
        professionalLicenses: this.formState.professionalLicenses?.entries,
        signature: this.formState.signature?.entries[0]
      };
    } catch (error) {
      this.logger.error('Error generating JSON document:', error);
      throw error;
    }
  }

  private generateTimeline(formState: FormState): Timeline {
    const entries: (ResidenceHistoryEntry | EmploymentHistoryEntry | EducationEntry | ProfessionalLicenseEntry)[] = [];

    // Add residence history entries
    if (formState.residenceHistory?.entries) {
      entries.push(...formState.residenceHistory.entries);
    }

    // Add employment history entries
    if (formState.employmentHistory?.entries) {
      entries.push(...formState.employmentHistory.entries);
    }

    // Add education entries
    if (formState.education?.entries) {
      entries.push(...formState.education.entries.map((entry: EducationEntry) => ({
        ...entry,
        startDate: entry.completionDate,
        endDate: entry.completionDate
      })));
    }

    // Add professional license entries
    if (formState.professionalLicenses?.entries) {
      entries.push(...formState.professionalLicenses.entries.map((entry: ProfessionalLicenseEntry) => ({
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