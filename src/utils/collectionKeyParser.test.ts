// src/utils/collectionKeyParser.test.ts
import {
  parseCollectionKey,
  getTimelineYears,
  getEmployerCount,
  getRequirements,
  Requirements,
  PersonalInfoStep,
  TimelineStep,
  EmploymentHistoryStep,
  SimpleStep,
  ConsentsRequired,
  SignatureRequirement,
  VerificationSteps
} from './collectionKeyParser';

describe('Collection Key Parser', () => {
  describe('parseCollectionKey', () => {
    it('should correctly parse a full valid collection key', () => {
      const result = parseCollectionKey('en-EPA-DTB-R3-EN2-E-P-W');
      expect(result).toEqual({
        language: 'en',
        facets: ['EPA', 'DTB', 'R3', 'EN2', 'E', 'P', 'W']
      });
    });

    it('should throw error for too few facets', () => {
      expect(() => parseCollectionKey('en-EPA-DTB-R3')).toThrow('Invalid collection key: must have 8 facets separated by -');
    });

    it('should throw error for too many facets', () => {
      expect(() => parseCollectionKey('en-EPA-DTB-R3-E3-E-P-W-X')).toThrow('Invalid collection key: must have 8 facets separated by -');
    });

    it('should throw error for invalid language length', () => {
      expect(() => parseCollectionKey('e-EPA-DTB-R3-E3-E-P-W')).toThrow('Invalid language code: must be 2 characters');
      expect(() => parseCollectionKey('eng-EPA-DTB-R3-E3-E-P-W')).toThrow('Invalid language code: must be 2 characters');
    });

    it('should handle minimal key with all N', () => {
      const result = parseCollectionKey('en-N-N-N-N-N-N-N');
      expect(result).toEqual({
        language: 'en',
        facets: ['N', 'N', 'N', 'N', 'N', 'N', 'N']
      });
    });

    it('should throw error for invalid employment code', () => {
      expect(() => parseCollectionKey('en-EPA-DTB-R3-E2-E-P-W')).toThrow(
        'Invalid employment code: must be N, E followed by 1, 3, 5, or EN followed by 1, 2, 3'
      );
    });
  });

  describe('getTimelineYears', () => {
    it('should return correct years for residence and employment codes', () => {
      expect(getTimelineYears('R1')).toBe(1);
      expect(getTimelineYears('E3')).toBe(3);
      expect(getTimelineYears('R5')).toBe(5);
      expect(getTimelineYears('E5')).toBe(5);
    });

    it('should default to 1 for invalid codes', () => {
      expect(getTimelineYears('N')).toBe(1);
      expect(getTimelineYears('RX')).toBe(1);
      expect(getTimelineYears('E4')).toBe(1);
      expect(getTimelineYears('R2')).toBe(1);
    });
  });

  describe('getEmployerCount', () => {
    it('should return correct employer counts', () => {
      expect(getEmployerCount('EN1')).toBe(1);
      expect(getEmployerCount('EN2')).toBe(2);
      expect(getEmployerCount('EN3')).toBe(3);
    });

    it('should default to 1 for invalid codes', () => {
      expect(getEmployerCount('N')).toBe(1);
      expect(getEmployerCount('EN4')).toBe(1);
      expect(getEmployerCount('E3')).toBe(1);
    });
  });

  describe('getRequirements', () => {
    // 1. Full Verification (All Steps, Maximum Years)
    it('should handle full verification with all steps and 5 years', () => {
      const requirements: Requirements = getRequirements('en-EPA-DTB-R5-E5-E-P-W');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: true, phone: true, fullName: false, nameAlias: true } },
          residenceHistory: { enabled: true, years: 5 },
          employmentHistory: { enabled: true, mode: 'years', modes: { years: 5 } },
          education: { enabled: true },
          professionalLicense: { enabled: true }
        },
        consentsRequired: { driverLicense: true, drugTest: true, biometric: true },
        signature: { required: true, mode: 'wet' }
      });
    });

    // 2. Standard Verification (All Steps, 3 Years)
    it('should handle standard verification with 3 years', () => {
      const requirements: Requirements = getRequirements('en-EP-N-R3-E3-E-P-C');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: true, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: true, years: 3 },
          employmentHistory: { enabled: true, mode: 'years', modes: { years: 3 } },
          education: { enabled: true },
          professionalLicense: { enabled: true }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'checkbox' }
      });
    });

    // 3. Minimal Verification (Personal Info and Signature Only)
    it('should handle minimal verification with personal info and signature', () => {
      const requirements: Requirements = getRequirements('en-P-N-N-N-N-N-C');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: false, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: false, years: 1 },
          employmentHistory: { enabled: false, mode: 'years', modes: { years: 1 } },
          education: { enabled: false },
          professionalLicense: { enabled: false }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'checkbox' }
      });
    });

    // 4. Education Verification Only
    it('should handle education verification only', () => {
      const requirements: Requirements = getRequirements('en-P-N-N-N-E-N-W');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: false, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: false, years: 1 },
          employmentHistory: { enabled: false, mode: 'years', modes: { years: 1 } },
          education: { enabled: true },
          professionalLicense: { enabled: false }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'wet' }
      });
    });

    // 5. Professional Licenses Verification Only
    it('should handle professional licenses verification only', () => {
      const requirements: Requirements = getRequirements('en-P-N-N-N-N-P-C');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: false, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: false, years: 1 },
          employmentHistory: { enabled: false, mode: 'years', modes: { years: 1 } },
          education: { enabled: false },
          professionalLicense: { enabled: true }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'checkbox' }
      });
    });

    // 6. Residence History Verification Only (3 Years)
    it('should handle residence history verification only with 3 years', () => {
      const requirements: Requirements = getRequirements('en-P-N-R3-N-N-N-W');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: false, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: true, years: 3 },
          employmentHistory: { enabled: false, mode: 'years', modes: { years: 1 } },
          education: { enabled: false },
          professionalLicense: { enabled: false }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'wet' }
      });
    });

    // 7. Employment History Verification Only (3 Years)
    it('should handle employment history verification only with 3 years', () => {
      const requirements: Requirements = getRequirements('en-P-N-N-E3-N-N-C');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: false, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: false, years: 1 },
          employmentHistory: { enabled: true, mode: 'years', modes: { years: 3 } },
          education: { enabled: false },
          professionalLicense: { enabled: false }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'checkbox' }
      });
    });

    // 8. All Consents Required
    it('should handle all consents required with standard steps', () => {
      const requirements: Requirements = getRequirements('en-EP-DTB-R3-E3-E-P-W');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: true, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: true, years: 3 },
          employmentHistory: { enabled: true, mode: 'years', modes: { years: 3 } },
          education: { enabled: true },
          professionalLicense: { enabled: true }
        },
        consentsRequired: { driverLicense: true, drugTest: true, biometric: true },
        signature: { required: true, mode: 'wet' }
      });
    });

    // 9. Spanish Language, Standard Verification
    it('should handle standard verification in Spanish', () => {
      const requirements: Requirements = getRequirements('es-EP-N-R3-E3-E-P-C');
      expect(requirements).toEqual({
        language: 'es',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: true, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: true, years: 3 },
          employmentHistory: { enabled: true, mode: 'years', modes: { years: 3 } },
          education: { enabled: true },
          professionalLicense: { enabled: true }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'checkbox' }
      });
    });

    // 10. French Language, Standard Verification
    it('should handle standard verification in French', () => {
      const requirements: Requirements = getRequirements('fr-EP-N-R3-E3-E-P-C');
      expect(requirements.language).toBe('fr');
    });

    // 11. Italian Language, Standard Verification
    it('should handle standard verification in Italian', () => {
      const requirements: Requirements = getRequirements('it-EP-N-R3-E3-E-P-C');
      expect(requirements.language).toBe('it');
    });

    // 12. Start at Residence History Step
    it('should handle residence history only, skipping personal info', () => {
      const requirements: Requirements = getRequirements('en-N-N-R3-N-N-N-W');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: false, modes: { email: false, phone: false, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: true, years: 3 },
          employmentHistory: { enabled: false, mode: 'years', modes: { years: 1 } },
          education: { enabled: false },
          professionalLicense: { enabled: false }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'wet' }
      });
    });

    // 13. Start at Professional Licenses Step
    it('should handle professional licenses only, skipping personal info', () => {
      const requirements: Requirements = getRequirements('en-N-N-N-N-N-P-C');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: false, modes: { email: false, phone: false, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: false, years: 1 },
          employmentHistory: { enabled: false, mode: 'years', modes: { years: 1 } },
          education: { enabled: false },
          professionalLicense: { enabled: true }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'checkbox' }
      });
    });

    // 14. Start at Education Step
    it('should handle education only, skipping personal info', () => {
      const requirements: Requirements = getRequirements('en-N-N-N-N-E-N-W');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: false, modes: { email: false, phone: false, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: false, years: 1 },
          employmentHistory: { enabled: false, mode: 'years', modes: { years: 1 } },
          education: { enabled: true },
          professionalLicense: { enabled: false }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'wet' }
      });
    });

    // 15. Short Residence History (1 Year)
    it('should handle short residence history with 1 year', () => {
      const requirements: Requirements = getRequirements('en-P-N-R1-N-N-N-C');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: false, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: true, years: 1 },
          employmentHistory: { enabled: false, mode: 'years', modes: { years: 1 } },
          education: { enabled: false },
          professionalLicense: { enabled: false }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'checkbox' }
      });
    });

    // 16. Long Employment History (5 Years)
    it('should handle long employment history with 5 years', () => {
      const requirements: Requirements = getRequirements('en-P-N-N-E5-N-N-W');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: false, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: false, years: 1 },
          employmentHistory: { enabled: true, mode: 'years', modes: { years: 5 } },
          education: { enabled: false },
          professionalLicense: { enabled: false }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'wet' }
      });
    });

    // 17. Education and Employment History Only (5 Years)
    it('should handle education and employment history with 5 years', () => {
      const requirements: Requirements = getRequirements('en-P-N-N-E5-E-N-C');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: false, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: false, years: 1 },
          employmentHistory: { enabled: true, mode: 'years', modes: { years: 5 } },
          education: { enabled: true },
          professionalLicense: { enabled: false }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'checkbox' }
      });
    });

    // 18. Professional Licenses and Residence History Only (3 Years)
    it('should handle professional licenses and residence history with 3 years', () => {
      const requirements: Requirements = getRequirements('en-P-N-R3-N-N-P-W');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: false, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: true, years: 3 },
          employmentHistory: { enabled: false, mode: 'years', modes: { years: 1 } },
          education: { enabled: false },
          professionalLicense: { enabled: true }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'wet' }
      });
    });

    // 19. All Personal Info Options
    it('should handle all personal info options combined', () => {
      const requirements: Requirements = getRequirements('en-EPMA-N-N-N-N-N-N');
      expect(requirements.verificationSteps.personalInfo).toEqual({
        enabled: true,
        modes: { email: true, phone: true, fullName: true, nameAlias: true }
      });
      expect(requirements.signature).toEqual({ required: false, mode: 'none' });
    });

    // 20. Partial Consents (Driver License Only)
    it('should handle partial consents with driver license only', () => {
      const requirements: Requirements = getRequirements('en-P-D-N-N-N-N-W');
      expect(requirements.consentsRequired).toEqual({
        driverLicense: true,
        drugTest: false,
        biometric: false
      });
    });

    // 21. Invalid Signature Mode
    it('should default to none for invalid signature mode', () => {
      const requirements: Requirements = getRequirements('en-P-N-N-N-N-N-X');
      expect(requirements.signature).toEqual({ required: false, mode: 'none' });
    });

    // 22. No Signature Required
    it('should handle no signature required', () => {
      const requirements: Requirements = getRequirements('en-EP-DT-R1-E1-E-P-N');
      expect(requirements.signature).toEqual({ required: false, mode: 'none' });
    });

    // 23. Empty Facets
    it('should handle empty facets gracefully', () => {
      const requirements: Requirements = getRequirements('en---N-N-N-N-N');
      expect(requirements.verificationSteps.personalInfo.enabled).toBe(false);
      expect(requirements.consentsRequired).toEqual({ driverLicense: false, drugTest: false, biometric: false });
    });

    // 24. Employment History with 1 Employer
    it('should handle employment history with 1 employer', () => {
      const requirements: Requirements = getRequirements('en-P-N-N-EN1-N-N-C');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: false, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: false, years: 1 },
          employmentHistory: { enabled: true, mode: 'employers', modes: { employers: 1 } },
          education: { enabled: false },
          professionalLicense: { enabled: false }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'checkbox' }
      });
    });

    // 25. Employment History with 2 Employers
    it('should handle employment history with 2 employers', () => {
      const requirements: Requirements = getRequirements('en-P-N-N-EN2-N-N-W');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: false, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: false, years: 1 },
          employmentHistory: { enabled: true, mode: 'employers', modes: { employers: 2 } },
          education: { enabled: false },
          professionalLicense: { enabled: false }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'wet' }
      });
    });

    // 26. Employment History with 3 Employers
    it('should handle employment history with 3 employers', () => {
      const requirements: Requirements = getRequirements('en-EP-DTB-R3-EN3-E-P-C');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: true, phone: true, fullName: false, nameAlias: false } },
          residenceHistory: { enabled: true, years: 3 },
          employmentHistory: { enabled: true, mode: 'employers', modes: { employers: 3 } },
          education: { enabled: true },
          professionalLicense: { enabled: true }
        },
        consentsRequired: { driverLicense: true, drugTest: true, biometric: true },
        signature: { required: true, mode: 'checkbox' }
      });
    });

    // 27. Mixed Residence (5 Years) and Employment (2 Employers)
    it('should handle mixed residence with 5 years and employment with 2 employers', () => {
      const requirements: Requirements = getRequirements('en-EPMA-N-R5-EN2-E-P-W');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: true, phone: true, fullName: true, nameAlias: true } },
          residenceHistory: { enabled: true, years: 5 },
          employmentHistory: { enabled: true, mode: 'employers', modes: { employers: 2 } },
          education: { enabled: true },
          professionalLicense: { enabled: true }
        },
        consentsRequired: { driverLicense: false, drugTest: false, biometric: false },
        signature: { required: true, mode: 'wet' }
      });
    });

    // 28. Personal Info (Email Only)
    it('should handle personal info with email only', () => {
      const requirements: Requirements = getRequirements('en-E-N-N-N-N-N-N');
      expect(requirements.verificationSteps.personalInfo).toEqual({
        enabled: true,
        modes: { email: true, phone: false, fullName: false, nameAlias: false }
      });
    });

    // 29. Consents (Drug Test Only)
    it('should handle consents with drug test only', () => {
      const requirements: Requirements = getRequirements('en-P-T-N-N-N-N-W');
      expect(requirements.consentsRequired).toEqual({
        driverLicense: false,
        drugTest: true,
        biometric: false
      });
    });

    // 30. Residence History (5 Years) Only
    it('should handle residence history with 5 years only', () => {
      const requirements: Requirements = getRequirements('en-N-N-R5-N-N-N-C');
      expect(requirements.verificationSteps.residenceHistory).toEqual({
        enabled: true,
        years: 5
      });
    });

    // 31. Employment History (1 Year) Only
    it('should handle employment history with 1 year only', () => {
      const requirements: Requirements = getRequirements('en-N-N-N-E1-N-N-W');
      expect(requirements.verificationSteps.employmentHistory).toEqual({
        enabled: true,
        mode: 'years',
        modes: { years: 1 }
      });
    });

    // 32. Education and Professional Licenses Only
    it('should handle education and professional licenses only', () => {
      const requirements: Requirements = getRequirements('en-N-N-N-N-E-P-C');
      expect(requirements.verificationSteps.education).toEqual({ enabled: true });
      expect(requirements.verificationSteps.professionalLicense).toEqual({ enabled: true });
    });

    // 33. All Disabled Except Signature
    it('should handle all steps disabled except signature', () => {
      const requirements: Requirements = getRequirements('en-N-N-N-N-N-N-W');
      expect(requirements.verificationSteps.personalInfo.enabled).toBe(false);
      expect(requirements.verificationSteps.residenceHistory.enabled).toBe(false);
      expect(requirements.verificationSteps.employmentHistory.enabled).toBe(false);
      expect(requirements.verificationSteps.education.enabled).toBe(false);
      expect(requirements.verificationSteps.professionalLicense.enabled).toBe(false);
      expect(requirements.signature).toEqual({ required: true, mode: 'wet' });
    });

    // 34. Mixed Personal Info and Consents
    it('should handle mixed personal info and consents', () => {
      const requirements: Requirements = getRequirements('en-EPM-DB-N-N-N-N-N');
      expect(requirements.verificationSteps.personalInfo.modes).toEqual({
        email: true,
        phone: true,
        fullName: true,
        nameAlias: false
      });
      expect(requirements.consentsRequired).toEqual({
        driverLicense: true,
        drugTest: false,
        biometric: true
      });
    });

    // 35. Full Verification with Employers
    it('should handle full verification with 3 employers', () => {
      const requirements: Requirements = getRequirements('en-EPMA-DTB-R5-EN3-E-P-C');
      expect(requirements).toEqual({
        language: 'en',
        verificationSteps: {
          personalInfo: { enabled: true, modes: { email: true, phone: true, fullName: true, nameAlias: true } },
          residenceHistory: { enabled: true, years: 5 },
          employmentHistory: { enabled: true, mode: 'employers', modes: { employers: 3 } },
          education: { enabled: true },
          professionalLicense: { enabled: true }
        },
        consentsRequired: { driverLicense: true, drugTest: true, biometric: true },
        signature: { required: true, mode: 'checkbox' }
      });
    });
  });
});