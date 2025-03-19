import { generateFormConfig } from './FormConfigGenerator';
import { Requirements } from './collectionKeyParser';

describe('FormConfigGenerator', () => {
  const baseRequirements: Requirements = {
    language: 'en',
    consents_required: {
      driver_license: false,
      drug_test: false,
      biometric: false
    },
    verification_steps: {
      education: {
        enabled: false,
        required_verifications: []
      },
      professional_license: {
        enabled: false,
        required_verifications: []
      },
      residence_history: {
        enabled: false,
        years: 0,
        required_verifications: []
      },
      employment_history: {
        enabled: false,
        years: 0,
        required_verifications: []
      }
    }
  };

  it('should generate minimal config with only required steps', () => {
    const config = generateFormConfig(baseRequirements);

    expect(config.steps).toHaveLength(2); // Personal info and signature
    expect(config.steps[0].id).toBe('personal-info');
    expect(config.steps[1].id).toBe('signature');
    expect(config.initialStep).toBe('personal-info');
    expect(config.navigation.requiredSteps).toEqual(['personal-info', 'signature']);
  });

  it('should include consent step when any consent is required', () => {
    const requirements = {
      ...baseRequirements,
      consents_required: {
        driver_license: true,
        drug_test: false,
        biometric: true
      }
    };

    const config = generateFormConfig(requirements);
    const consentStep = config.steps.find(step => step.id === 'consents');

    expect(consentStep).toBeDefined();
    expect(consentStep?.fields).toHaveLength(2);
    expect(consentStep?.fields[0].id).toBe('driverLicenseConsent');
    expect(consentStep?.fields[1].id).toBe('biometricConsent');
  });

  it('should configure residence history with correct years requirement', () => {
    const requirements = {
      ...baseRequirements,
      verification_steps: {
        ...baseRequirements.verification_steps,
        residence_history: {
          enabled: true,
          years: 7,
          required_verifications: ['address', 'duration']
        }
      }
    };

    const config = generateFormConfig(requirements);
    const residenceStep = config.steps.find(step => step.id === 'residence-history');

    expect(residenceStep).toBeDefined();
    expect(residenceStep?.validationRules?.requiredYears).toBe(7);
    expect(residenceStep?.validationRules?.requiredVerifications).toEqual(['address', 'duration']);
  });

  it('should maintain correct step order', () => {
    const requirements = {
      ...baseRequirements,
      consents_required: {
        driver_license: true,
        drug_test: false,
        biometric: false
      },
      verification_steps: {
        ...baseRequirements.verification_steps,
        education: {
          enabled: true,
          required_verifications: ['degree', 'institution']
        }
      }
    };

    const config = generateFormConfig(requirements);
    const stepIds = config.steps.map(step => step.id);

    expect(stepIds).toEqual([
      'personal-info',
      'consents',
      'education',
      'signature'
    ]);
  });
}); 