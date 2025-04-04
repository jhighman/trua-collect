import { DocumentMetadata, EducationEntry, EmploymentHistoryEntry, JsonDocument, PersonalInfo, ProfessionalLicenseEntry, ResidenceHistoryEntry, Signature, Timeline, Consents } from '../types/documents';
import { FormState, ProfessionalLicensesStepValues, EmploymentHistoryStepValues, ResidenceHistoryStepValues, EducationStepValues, PersonalInfoStepValues, SignatureStepValues, ConsentsStepValues } from '../types/form';
import { Logger } from '../utils/logger';

export class JsonDocumentGenerator {
  private logger: Logger;

  constructor(private readonly formState: FormState) {
    this.logger = new Logger('JsonDocumentGenerator');
  }

  private transformPersonalInfo(values: PersonalInfoStepValues): PersonalInfo {
    return {
      ...values
    };
  }

  private transformSignature(values: SignatureStepValues): Signature {
    return {
      signatureImage: values.signature,
      signatureDate: new Date().toISOString(),
      confirmation: values.confirmation,
    };
  }

  private transformConsents(values: ConsentsStepValues): Consents {
    return {
      driverLicense: values.driverLicenseConsent,
      drugTest: values.drugTestConsent,
      biometric: values.biometricConsent,
      consentDate: new Date().toISOString(),
    };
  }

  private getTimelineDates(entries: { startDate: string; endDate: string }[]): { startDate: string; endDate: string } {
    if (!entries || entries.length === 0) {
      const now = new Date().toISOString();
      return { startDate: now, endDate: now };
    }

    const sortedEntries = [...entries].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    return {
      startDate: sortedEntries[0].startDate,
      endDate: sortedEntries[sortedEntries.length - 1].endDate
    };
  }

  public generateJsonDocument(trackingId: string): JsonDocument {
    try {
      const metadata: DocumentMetadata = {
        trackingId,
        submissionDate: new Date().toISOString(),
        version: '1.0'
      };

      // Get education entries and transform them
      const educationValues = (this.formState.steps['education']?.values as EducationStepValues)?.entries || [];
      const educationEntries = educationValues.map((entry: EducationEntry) => ({
        ...entry,
        startDate: entry.startDate || entry.completionDate,
        endDate: entry.endDate || entry.completionDate
      }));

      const timeline = this.generateTimeline(this.formState);
      const personalInfoValues = this.formState.steps['personal-info']?.values as PersonalInfoStepValues;
      const signatureValues = this.formState.steps['signature']?.values as SignatureStepValues;
      const consentsValues = this.formState.steps['consents']?.values as ConsentsStepValues;

      return {
        metadata,
        timeline,
        personalInfo: personalInfoValues ? this.transformPersonalInfo(personalInfoValues) : undefined,
        residenceHistory: (this.formState.steps['residence-history']?.values as ResidenceHistoryStepValues)?.entries,
        employmentHistory: (this.formState.steps['employment-history']?.values as EmploymentHistoryStepValues)?.entries,
        education: educationEntries,
        professionalLicenses: (this.formState.steps['professional-licenses']?.values as ProfessionalLicensesStepValues)?.entries,
        consents: consentsValues ? this.transformConsents(consentsValues) : undefined,
        signature: signatureValues ? this.transformSignature(signatureValues) : undefined
      };
    } catch (error) {
      this.logger.error('Error generating JSON document:', error);
      throw error;
    }
  }

  private generateTimeline(formState: FormState): Timeline {
    // Get residence history timeline
    const residenceHistory = (formState.steps['residence-history']?.values as ResidenceHistoryStepValues)?.entries || [];
    const residenceTimeline = {
      entries: residenceHistory,
      ...this.getTimelineDates(residenceHistory)
    };

    // Get employment history timeline
    const employmentHistory = (formState.steps['employment-history']?.values as EmploymentHistoryStepValues)?.entries || [];
    const employmentTimeline = {
      entries: employmentHistory,
      ...this.getTimelineDates(employmentHistory)
    };

    // Get education timeline
    const education = (formState.steps['education']?.values as EducationStepValues)?.entries || [];
    const educationEntries = education.map((entry: EducationEntry) => ({
      ...entry,
      startDate: entry.startDate || entry.completionDate,
      endDate: entry.endDate || entry.completionDate
    }));
    const educationTimeline = {
      entries: educationEntries,
      ...this.getTimelineDates(educationEntries)
    };

    // Get professional licenses timeline
    const professionalLicenses = (formState.steps['professional-licenses']?.values as ProfessionalLicensesStepValues)?.entries || [];
    const licensesEntries = professionalLicenses.map((entry: ProfessionalLicenseEntry) => ({
      ...entry,
      startDate: entry.startDate || entry.issueDate || entry.expirationDate,
      endDate: entry.endDate || entry.expirationDate,
      isActive: entry.isActive || true
    }));
    const licensesTimeline = {
      entries: licensesEntries,
      ...this.getTimelineDates(licensesEntries)
    };

    // Calculate overall timeline dates
    const allDates = [
      ...residenceHistory,
      ...employmentHistory,
      ...educationEntries,
      ...licensesEntries
    ];
    const { startDate, endDate } = this.getTimelineDates(allDates);

    return {
      startDate,
      endDate,
      residenceTimeline,
      employmentTimeline,
      educationTimeline,
      licensesTimeline
    };
  }
} 