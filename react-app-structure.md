# React Application Structure for SignR (TypeScript)

## Component Structure

1. **App Structure**
   - App.tsx - Main component with routing
   - FormProvider.tsx - Context provider for form state

2. **Form Components**
   - FormContainer.tsx - Main form wrapper
   - StepIndicator.tsx - Shows current step progress
   - FormNavigation.tsx - Next/Previous buttons
   - CollectionWizard.tsx - Main wizard component that handles the collection flow

3. **Form Steps**
   - PersonalInfo.tsx - Step 1: Personal information
   - ConsentsForm.tsx - Step 2: Required consents
   - ResidenceHistory.tsx - Step 3: Residence history overview
   - ResidenceEntry.tsx - Step 3.1: Add/edit residence
   - EmploymentHistory.tsx - Step 4: Employment timeline
   - EmploymentEntry.tsx - Step 4.1: Add/edit employment
   - EducationForm.tsx - Step 5: Education verification
   - ProfessionalLicenses.tsx - Step 6: Professional licenses overview
   - ProfessionalLicenseEntry.tsx - Step 6.1: Add/edit professional license
   - Signature.tsx - Step 7: Signature and submission

4. **Shared Components**
   - Timeline.tsx - Visual timeline component
   - LanguageSwitcher.tsx - Language dropdown
   - ConfirmDialog.tsx - Reusable confirmation dialog
   - ValidationMessage.tsx - Error message display
   - ConsentCheckbox.tsx - Consent checkbox with explanation
   - DatePicker.tsx - Month/year date picker

5. **Utilities**
   - api.ts - API service functions
   - translations.ts - Translation utilities
   - validation.ts - Form validation functions
   - dateUtils.ts - Date formatting and calculations
   - collectionKeyParser.ts - Collection key parsing and requirements generation
   - types.ts - TypeScript interfaces and types

6. **Context**
   - FormContext.tsx - Form state management
   - TranslationContext.tsx - Translation state
   - RequirementsContext.tsx - Requirements configuration based on collection key

## Collection Key Concept

The application uses a Collection Key to drive the dynamic form behavior. The Collection Key is a 14-character hybrid string (e.g., "en101110101100") where:

1. **Language Prefix** (2 characters)
   - Sets the UI language (e.g., "en" for English, "es" for Spanish)

2. **Configuration Bits** (12 bits)
   - Bit 0: Personal Information (always 1)
   - Bits 1-3: Consents
     - Bit 1: Driver's License Consent (0=not required, 1=required)
     - Bit 2: Drug Test Consent (0=not required, 1=required)
     - Bit 3: Biometric Consent (0=not required, 1=required)
   - Bits 4-9: Steps
     - Bit 4: Education (0=not required, 1=required)
     - Bit 5: Professional Licenses (0=not required, 1=required)
     - Bit 6: Residence History (0=not required, 1=required)
     - Bits 7-9: Residence Timeline Years (000=1yr, 011=3yrs, 101=5yrs, 111=7yrs, 101=10yrs)
   - Bits 10-13: Employment Timeline
     - Bit 10: Employment History (0=not required, 1=required)
     - Bits 11-13: Employment Timeline Years (000=1yr, 011=3yrs, 101=5yrs, 111=7yrs, 101=10yrs)

### Collection Key Parser

The `collectionKeyParser.ts` utility provides functions for parsing the collection key and generating requirements:

```typescript
// Collection Key Types
export interface CollectionKey {
  language: string;
  bits: string;
}

// Parse Collection Key
export function parseCollectionKey(key: string): CollectionKey {
  return {
    language: key.substring(0, 2),
    bits: key.substring(2)
  };
}

// Check if a specific bit is enabled
export function isBitEnabled(bits: string, position: number): boolean {
  return bits.charAt(position) === '1';
}

// Get timeline years from bits
export function getTimelineYears(bits: string, startPosition: number): number {
  const timelineBits = bits.substring(startPosition, startPosition + 3);
  switch (timelineBits) {
    case '000': return 1;
    case '011': return 3;
    case '101': return 5;
    case '111': return 7;
    case '101': return 10;
    default: return 1;
  }
}

// Get form requirements from collection key
export function getRequirements(collectionKey: string): Requirements {
  const { language, bits } = parseCollectionKey(collectionKey);
  
  return {
    language,
    consents_required: {
      driver_license: isBitEnabled(bits, 1),
      drug_test: isBitEnabled(bits, 2),
      biometric: isBitEnabled(bits, 3)
    },
    verificationSteps: {
      education: {
        enabled: isBitEnabled(bits, 4),
        required_verifications: ["degree", "institution", "graduation_date"]
      },
      professional_license: {
        enabled: isBitEnabled(bits, 5),
        required_verifications: ["status", "expiration_date"]
      },
      residence_history: {
        enabled: isBitEnabled(bits, 6),
        years: getTimelineYears(bits, 7),
        required_verifications: ["address", "duration"]
      },
      employment_history: {
        enabled: isBitEnabled(bits, 10),
        years: getTimelineYears(bits, 11),
        required_verifications: ["employment", "duration", "position"]
      }
    }
  };
}
```

## Collection Flow

The application follows a dynamic flow based on the collection key:

1. **Initial Access**
   - User accesses the application with a tracking_id and collection_key
   - The collection key is parsed to determine the language and requirements

2. **Personal Information** (Always Required)
   - Collects basic personal information
   - Validates required fields

3. **Consents** (Based on Bits 1-3)
   - Conditionally shown based on the collection key
   - Collects required consents

4. **Education** (Based on Bit 4)
   - Conditionally shown based on the collection key
   - Collects education credentials

5. **Professional Licenses** (Based on Bit 5)
   - Conditionally shown based on the collection key
   - Collects professional license information

6. **Residence History** (Based on Bit 6)
   - Conditionally shown based on the collection key
   - Years required determined by Bits 7-9
   - Collects residence history entries

7. **Employment History** (Based on Bit 10)
   - Conditionally shown based on the collection key
   - Years required determined by Bits 11-13
   - Collects employment history entries

8. **Signature**
   - Always shown as the final step
   - Collects digital signature

## TypeScript Types

The application uses TypeScript interfaces to define the data structures:

```typescript
// types.ts
export interface Claim {
  tracking_id: string;
  submission_date: string;
  collection_key: string;
  language: string;
  requirements: Requirements;
  claimant: Claimant;
  consents: Consents;
  residence_history: ResidenceHistory;
  employment_history: EmploymentHistory;
  education: Education;
  professional_licenses: ProfessionalLicenses;
  signature: Signature;
}

export interface Requirements {
  consents_required: {
    driver_license: boolean;
    drug_test: boolean;
    biometric: boolean;
  };
  verificationSteps: {
    education: {
      enabled: boolean;
      required_verifications: string[];
    };
    professional_license: {
      enabled: boolean;
      required_verifications: string[];
    };
    residence_history: {
      enabled: boolean;
      years: number;
      required_verifications: string[];
    };
    employment_history: {
      enabled: boolean;
      years: number;
      required_verifications: string[];
    };
  };
}

export interface Claimant {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  ssn: string;
  completed_at: string;
}

export interface Consent {
  granted: boolean;
  date?: string;
  notes?: string;
}

export interface Consents {
  driver_license: Consent;
  drug_test: Consent;
  biometric: Consent;
  completed_at: string;
}

export interface ResidenceEntry {
  address: string;
  city: string;
  state_province: string;
  zip_postal: string;
  country: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  duration_years: number;
}

export interface ResidenceHistory {
  entries: ResidenceEntry[];
  total_years: number;
  completed_at: string;
}

export interface EmploymentEntry {
  type: string;
  company: string;
  position: string;
  city: string;
  state_province: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  description: string;
  contact_name: string;
  contact_info: string;
  duration_years: number;
}

export interface EmploymentHistory {
  entries: EmploymentEntry[];
  total_years: number;
  completed_at: string;
}

export interface Degree {
  school_name: string;
  degree_level: string;
  degree_title: string;
  major: string;
  award_date: string;
  gpa: string;
}

export interface Education {
  highest_level: string;
  degree: Degree;
  completed_at: string;
}

export interface ProfessionalLicense {
  category: string;
  type: string;
  class: string;
  identifier: string;
  identifier_descriptor: string;
  issuer: string;
  issue_date: string;
  expiration_date: string;
  status: string;
  notes: string;
}

export interface ProfessionalLicenses {
  entries: ProfessionalLicense[];
  completed_at: string;
}

export interface Signature {
  data: string;
  date: string;
}

export type FormStep = 
  | 'personal-info'
  | 'consents'
  | 'residence-history'
  | 'residence-entry'
  | 'employment-history'
  | 'employment-entry'
  | 'education'
  | 'professional-licenses'
  | 'professional-license-entry'
  | 'signature';

export interface FormState {
  currentStep: FormStep;
  requirements: Requirements;
  claimant: Claimant;
  consents: Consents;
  residence_history: ResidenceHistory;
  employment_history: EmploymentHistory;
  education: Education;
  professional_licenses: ProfessionalLicenses;
  signature: Signature;
  formErrors: Record<string, string>;
  editingEntryIndex: number | null;
}
```

## State Management

The application uses React Context API with TypeScript for state management:

1. **FormContext** - Manages the form state:
   - Current step
   - Form data (claimant, consents, residence history, employment history, education, professional licenses)
   - Form validation state
   - Form submission state

2. **RequirementsContext** - Manages the requirements configuration:
   - Parsed from the collection key
   - Determines which steps are required
   - Determines the years required for timeline steps

3. **TranslationContext** - Manages translations:
   - Current language (from collection key prefix)
   - Translation strings
   - Language switching function

## Form Navigation Flow

The form navigation is determined by the requirements configuration:

```typescript
// Example of dynamic step navigation based on requirements
function getNextStep(currentStep: FormStep, requirements: Requirements): FormStep {
  switch (currentStep) {
    case 'personal-info':
      return hasAnyConsentsRequired(requirements) ? 'consents' : getNextStepAfterConsents(requirements);
    case 'consents':
      return getNextStepAfterConsents(requirements);
    case 'education':
      return requirements.verificationSteps.professional_license.enabled ? 'professional-licenses' : getNextStepAfterProfessionalLicenses(requirements);
    case 'professional-licenses':
      return getNextStepAfterProfessionalLicenses(requirements);
    case 'residence-history':
      return requirements.verificationSteps.employment_history.enabled ? 'employment-history' : 'signature';
    case 'employment-history':
      return 'signature';
    default:
      return 'personal-info';
  }
}

function hasAnyConsentsRequired(requirements: Requirements): boolean {
  const { driver_license, drug_test, biometric } = requirements.consents_required;
  return driver_license || drug_test || biometric;
}

function getNextStepAfterConsents(requirements: Requirements): FormStep {
  if (requirements.verificationSteps.education.enabled) {
    return 'education';
  }
  return getNextStepAfterEducation(requirements);
}

function getNextStepAfterEducation(requirements: Requirements): FormStep {
  if (requirements.verificationSteps.professional_license.enabled) {
    return 'professional-licenses';
  }
  return getNextStepAfterProfessionalLicenses(requirements);
}

function getNextStepAfterProfessionalLicenses(requirements: Requirements): FormStep {
  if (requirements.verificationSteps.residence_history.enabled) {
    return 'residence-history';
  }
  return getNextStepAfterResidenceHistory(requirements);
}

function getNextStepAfterResidenceHistory(requirements: Requirements): FormStep {
  if (requirements.verificationSteps.employment_history.enabled) {
    return 'employment-history';
  }
  return 'signature';
}
```

## API Integration

1. `/api/translations/:lang` - Get translations for a specific language
2. `/api/submit` - Submit the form data
3. `/api/requirements/:tracking_id` - Get requirements configuration for a tracking ID

## Styling

The application uses CSS modules with TypeScript for component-specific styling:

```typescript
// Example of CSS module usage with TypeScript
import styles from './FormContainer.module.css';

const FormContainer: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Component content */}
    </div>
  );
};
```

## TypeScript Configuration

The project uses a tsconfig.json file with the following key settings:

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}