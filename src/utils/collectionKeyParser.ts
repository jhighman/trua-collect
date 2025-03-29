// src/utils/collectionKeyParser.ts

/**
 * Interface for personal info verification modes.
 */
export interface PersonalInfoModes {
  email: boolean;
  phone: boolean;
  fullName: boolean;
  nameAlias: boolean;
}

/**
 * Interface for personal info verification step.
 */
export interface PersonalInfoStep {
  enabled: boolean;
  modes: PersonalInfoModes;
}

/**
 * Interface for timeline-based verification steps (residence/employment years).
 */
export interface TimelineStep {
  enabled: boolean;
  years: number;
}

/**
 * Interface for employment history modes (years or employers).
 */
export interface EmploymentHistoryModes {
  years?: number;
  employers?: number;
}

/**
 * Interface for employment history verification step.
 */
export interface EmploymentHistoryStep {
  enabled: boolean;
  mode: 'years' | 'employers';
  modes: EmploymentHistoryModes;
}

/**
 * Interface for simple enabled/disabled verification steps (education/pro licenses).
 */
export interface SimpleStep {
  enabled: boolean;
}

/**
 * Interface for consents required.
 */
export interface ConsentsRequired {
  driverLicense: boolean;
  drugTest: boolean;
  biometric: boolean;
}

/**
 * Interface for signature requirements.
 */
export interface SignatureRequirement {
  required: boolean;
  mode: 'wet' | 'checkbox' | 'none';
}

/**
 * Interface for all verification steps.
 */
export interface VerificationSteps {
  personalInfo: PersonalInfoStep;
  residenceHistory: TimelineStep;
  employmentHistory: EmploymentHistoryStep;
  education: SimpleStep;
  professionalLicense: SimpleStep;
}

/**
 * Top-level interface for verification requirements.
 */
export interface Requirements {
  language: string;
  verificationSteps: VerificationSteps;
  consentsRequired: ConsentsRequired;
  signature: SignatureRequirement;
}

/**
 * Extracts the number of years from a residence or employment history code.
 * @param code The two-character code (e.g., 'R1', 'E3', 'E5')
 * @returns Number of years (1, 3, or 5), defaults to 1 if invalid or 'N'
 */
export function getTimelineYears(code: string): number {
  if (code === 'N' || !code || code.length < 2) return 1;
  const years = parseInt(code[1], 10);
  return [1, 3, 5].includes(years) ? years : 1;
}

/**
 * Extracts the number of employers from an employment history code.
 * @param code The three-character code (e.g., 'EN1', 'EN2', 'EN3')
 * @returns Number of employers (1, 2, or 3), defaults to 1 if invalid
 */
export function getEmployerCount(code: string): number {
  if (!code.startsWith('EN') || code.length !== 3) return 1;
  const count = parseInt(code[2], 10);
  return [1, 2, 3].includes(count) ? count : 1;
}

/**
 * Parses a collection key into language and facet array.
 * @param key The collection key string (e.g., 'en-EPA-DTB-R3-EN2-E-P-W')
 * @returns Object with language and array of facet codes
 * @throws Error if key format is invalid
 */
export function parseCollectionKey(key: string): { language: string; facets: string[] } {
  if (typeof key !== 'string' || key.length < 13) {
    throw new Error('Invalid collection key: must be a string with at least 8 facets');
  }

  const parts = key.split('-');
  if (parts.length !== 8) {
    throw new Error('Invalid collection key: must have 8 facets separated by -');
  }

  const [language, personal, consents, residence, employment, education, proLicense, signature] = parts;

  if (language.length !== 2) {
    throw new Error('Invalid language code: must be 2 characters');
  }

  const facets = [
    personal || 'N',
    consents || 'N',
    residence || 'N',
    employment || 'N',
    education || 'N',
    proLicense || 'N',
    signature || 'N'
  ];

  if (facets[2] !== 'N' && !/^R[135]$/.test(facets[2])) {
    throw new Error('Invalid residence code: must be N or R followed by 1, 3, or 5');
  }
  if (facets[3] !== 'N' && !/^E[135]$/.test(facets[3]) && !/^EN[123]$/.test(facets[3])) {
    throw new Error('Invalid employment code: must be N, E followed by 1, 3, 5, or EN followed by 1, 2, 3');
  }
  if (facets[4] !== 'E' && facets[4] !== 'N') {
    throw new Error('Invalid education code: must be E or N');
  }
  if (facets[5] !== 'P' && facets[5] !== 'N') {
    throw new Error('Invalid professional license code: must be P or N');
  }

  return { language, facets };
}

/**
 * Generates verification requirements from a collection key.
 * @param key The collection key string
 * @returns Requirements object detailing language, verification steps, consents, and signature
 * @throws Error if key is invalid
 */
export function getRequirements(key: string): Requirements {
  const { language, facets } = parseCollectionKey(key);
  const [personal, consents, residence, employment, education, proLicense, signature] = facets;

  const isEmployerMode = employment.startsWith('EN');
  const employmentModes: EmploymentHistoryModes = isEmployerMode
    ? { employers: getEmployerCount(employment) }
    : { years: getTimelineYears(employment) };

  return {
    language,
    verificationSteps: {
      personalInfo: {
        enabled: personal !== 'N',
        modes: {
          email: personal.includes('E'),
          phone: personal.includes('P'),
          fullName: personal.includes('M'),
          nameAlias: personal.includes('A')
        }
      },
      residenceHistory: {
        enabled: residence !== 'N',
        years: getTimelineYears(residence)
      },
      employmentHistory: {
        enabled: employment !== 'N',
        mode: isEmployerMode ? 'employers' : 'years',
        modes: employmentModes
      },
      education: { enabled: education === 'E' },
      professionalLicense: { enabled: proLicense === 'P' }
    },
    consentsRequired: {
      driverLicense: consents.includes('D'),
      drugTest: consents.includes('T'),
      biometric: consents.includes('B')
    },
    signature: {
      required: signature !== 'N' && (signature === 'W' || signature === 'C'),
      mode: signature === 'W' ? 'wet' : signature === 'C' ? 'checkbox' : 'none'
    }
  };
}