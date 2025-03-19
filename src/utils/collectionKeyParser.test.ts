import {
  parseCollectionKey,
  isBitEnabled,
  getTimelineYears,
  getRequirements
} from './collectionKeyParser';

describe('Collection Key Parser', () => {
  describe('slice sanity', () => {
    it('should correctly slice from index 7', () => {
      const str = '101000101100';
      console.log(`Testing slice: ${str.slice(7)}`);
      expect(str.slice(7)).toBe('01100');
    });
  });

  describe('parseCollectionKey', () => {
    it('should correctly parse a valid collection key', () => {
      const result = parseCollectionKey('en101110101110');
      expect(result).toEqual({
        language: 'en',
        bits: '101110101110'
      });
    });

    it('should throw error for invalid key length', () => {
      expect(() => parseCollectionKey('en1011')).toThrow('Invalid collection key');
    });

    it('should throw error for empty string', () => {
      expect(() => parseCollectionKey('')).toThrow('Invalid collection key');
    });
  });

  describe('isBitEnabled', () => {
    const bits = '101110101110';

    it('should correctly identify enabled bits', () => {
      expect(isBitEnabled(bits, 0)).toBe(true);
      expect(isBitEnabled(bits, 2)).toBe(true);
      expect(isBitEnabled(bits, 10)).toBe(true);
    });

    it('should correctly identify disabled bits', () => {
      expect(isBitEnabled(bits, 1)).toBe(false);
      expect(isBitEnabled(bits, 11)).toBe(false);
    });

    it('should throw error for invalid position', () => {
      expect(() => isBitEnabled(bits, -1)).toThrow('Invalid bit position');
      expect(() => isBitEnabled(bits, 12)).toThrow('Invalid bit position');
    });

    it('should handle boundary position', () => {
      expect(isBitEnabled('10', 1)).toBe(false);
    });
  });

  describe('getTimelineYears', () => {
    it('should return correct years for KeyMaker patterns at position 7', () => {
      expect(getTimelineYears('101110100010', 7)).toBe(1);  // '000'
      expect(getTimelineYears('101110100110', 7)).toBe(3);  // '001'
      expect(getTimelineYears('101110101010', 7)).toBe(5);  // '010'
      expect(getTimelineYears('101110101110', 7)).toBe(7);  // '011'
      expect(getTimelineYears('101110110010', 7)).toBe(10); // '100'
    });

    it('should return correct years for KeyMaker patterns at position 11', () => {
      expect(getTimelineYears('101110101100', 11)).toBe(1);  // '0' -> '000'
      expect(getTimelineYears('101110101101', 11)).toBe(10); // '1' -> '100'
    });

    it('should return default 1 year for invalid patterns', () => {
      expect(getTimelineYears('101110110110', 7)).toBe(1);  // '101'
      expect(getTimelineYears('101110111110', 7)).toBe(1);  // '111'
    });

    it('should throw error for invalid position', () => {
      expect(() => getTimelineYears('101110101110', -1)).toThrow('Invalid start position');
      expect(() => getTimelineYears('101110101110', 12)).toThrow('Invalid start position');
    });

    it('should handle short strings with padding', () => {
      expect(getTimelineYears('10', 1)).toBe(1); // '0' -> '000'
    });
  });

  describe('getRequirements', () => {
    it('should handle full collection key with all features enabled', () => {
      const requirements = getRequirements('en111111110010');
      expect(requirements.language).toBe('en');
      expect(requirements.consents_required).toEqual({
        driver_license: true,
        drug_test: true,
        biometric: true
      });
      expect(requirements.verification_steps.education.enabled).toBe(true);
      expect(requirements.verification_steps.professional_license.enabled).toBe(true);
      expect(requirements.verification_steps.residence_history.enabled).toBe(true);
      expect(requirements.verification_steps.residence_history.years).toBe(10); // '100' at 7-9
      expect(requirements.verification_steps.employment_history.enabled).toBe(true);
      expect(requirements.verification_steps.employment_history.years).toBe(1); // '0' -> '000' at 11
    });

    it('should handle minimal key with no steps enabled', () => {
      const requirements = getRequirements('en100000000000');
      expect(requirements.consents_required).toEqual({
        driver_license: false,
        drug_test: false,
        biometric: false
      });
      expect(requirements.verification_steps.education.enabled).toBe(false);
      expect(requirements.verification_steps.professional_license.enabled).toBe(false);
      expect(requirements.verification_steps.residence_history.enabled).toBe(false);
      expect(requirements.verification_steps.residence_history.years).toBe(1); // '000' at 7-9
      expect(requirements.verification_steps.employment_history.enabled).toBe(false);
      expect(requirements.verification_steps.employment_history.years).toBe(1); // '0' -> '000' at 11
    });

    it('should handle mixed consents and steps', () => {
      const requirements = getRequirements('en101010000110');
      expect(requirements.consents_required).toEqual({
        driver_license: false,
        drug_test: true,
        biometric: false
      });
      expect(requirements.verification_steps.education.enabled).toBe(true);
      expect(requirements.verification_steps.professional_license.enabled).toBe(false);
      expect(requirements.verification_steps.residence_history.enabled).toBe(false);
      expect(requirements.verification_steps.residence_history.years).toBe(3); // '001' at 7-9
      expect(requirements.verification_steps.employment_history.enabled).toBe(true);
      expect(requirements.verification_steps.employment_history.years).toBe(1); // '0' -> '000' at 11
    });

    it('should throw error for invalid collection key', () => {
      expect(() => getRequirements('invalid')).toThrow('Invalid collection key');
    });
  });
});