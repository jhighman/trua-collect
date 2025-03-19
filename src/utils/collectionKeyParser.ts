export interface CollectionKey {
  language: string;
  bits: string;
}

export interface Requirements {
  language: string;
  consents_required: {
    driver_license: boolean;
    drug_test: boolean;
    biometric: boolean;
  };
  verification_steps: {
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

export function parseCollectionKey(key: string): CollectionKey {
  if (!key || key.length !== 14) {
    throw new Error('Invalid collection key: must be 14 characters');
  }
  return {
    language: key.slice(0, 2),
    bits: key.slice(2)
  };
}

export function isBitEnabled(bits: string, position: number): boolean {
  if (position < 0 || position >= bits.length) {
    throw new Error('Invalid bit position');
  }
  return bits.charAt(position) === '1';
}

export function getTimelineYears(bits: string, startPosition: number): number {
  if (startPosition < 0 || startPosition >= bits.length) {
    throw new Error('Invalid start position for timeline years');
  }

  const availableBits = bits.slice(startPosition, startPosition + 3);
  const timelineBits = availableBits.length < 3 ? availableBits.padEnd(3, '0') : availableBits;
  console.log(`Bits: ${bits}, Length: ${bits.length}, Start: ${startPosition}`);
  console.log(`Direct: ${'101000101100'.slice(7)}`);
  console.log(`Input: ${bits}, Start: ${startPosition}, Available: ${availableBits}, Extracted: ${timelineBits}`);

  switch (timelineBits) {
    case '000': return 1;
    case '001': return 3;
    case '010': return 5;
    case '011': return 7;
    case '100': return 10;
    default: return 1;
  }
}

export function getRequirements(collectionKey: string): Requirements {
  const { language, bits } = parseCollectionKey(collectionKey);
  return {
    language,
    consents_required: {
      driver_license: isBitEnabled(bits, 1),
      drug_test: isBitEnabled(bits, 2),
      biometric: isBitEnabled(bits, 3)
    },
    verification_steps: {
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
        years: getTimelineYears(bits, 7), // Changed to 7 from 8
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