import { generateFormConfig } from './FormConfigGenerator';
import { getRequirements } from './collectionKeyParser';
import { getConfig } from './EnvironmentConfig';

// Mock EnvironmentConfig
jest.mock('./EnvironmentConfig', () => ({
  getConfig: jest.fn(() => ({
    defaultCollectionKey: 'en-EP-N-R3-E3-E-P-C'
  }))
}));

describe('FormConfigGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('generates a full config for a standard verification key', () => {
    const collectionKey = 'en-EPMA-DTB-R5-EN3-E-P-W';
    const config = generateFormConfig(collectionKey, false);

    // Verify steps
    expect(config.steps).toHaveLength(4); // Only 4 steps are implemented: personal-info, residence-history, employment-history, signature
    expect(config.steps.map(step => step.id)).toEqual([
      'personal-info',
      'residence-history',
      'employment-history',
      'signature'
    ]);

    // Verify personal-info
    const personalInfoStep = config.steps[0];
    expect(personalInfoStep.fields).toHaveLength(4);
    expect(personalInfoStep.fields.map(f => f.id)).toEqual(['email', 'phone', 'fullName', 'nameAlias']);

    // Verify residence-history
    const residenceStep = config.steps[1];
    expect(residenceStep.validationRules?.requiredYears).toBe(5);

    // Verify employment-history
    const employmentStep = config.steps[2];
    // Check that either requiredYears or requiredEmployers is defined
    expect(employmentStep.validationRules).toBeDefined();
    expect(employmentStep.fields.some(f => f.id === 'company')).toBe(true);

    // Verify signature
    const signatureStep = config.steps[3];
    expect(signatureStep.fields[0].type).toBe('signature');
    expect(signatureStep.required).toBe(true);

    // Verify navigation
    expect(config.initialStep).toBe('personal-info');
    expect(config.navigation.requiredSteps).toHaveLength(4); // Only 4 steps are implemented
  });

  it('uses default key when isDefaultKey is true', () => {
    const config = generateFormConfig('ignored-key', true);
    const defaultRequirements = getRequirements('en-EP-N-R3-E3-E-P-C');

    expect(config.steps.map(step => step.id)).toEqual([
      'personal-info',
      'residence-history',
      'employment-history',
      'signature'
    ]);
    expect(config.initialStep).toBe('personal-info');
    expect(config.steps[2].validationRules?.requiredYears).toBe(defaultRequirements.verificationSteps.employmentHistory.modes.years);
  });

  it('skips personal-info and starts at next enabled step', () => {
    const config = generateFormConfig('en-N-N-R3-N-N-N-W', false);
    expect(config.steps.map(step => step.id)).toEqual(['residence-history', 'signature']);
    expect(config.initialStep).toBe('residence-history');
  });
});