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
  
  // Log the collection key and bits for debugging
  console.log('Collection Key:', collectionKey);
  console.log('Language:', language);
  console.log('Bits:', bits);
  console.log('Bit 0:', bits.charAt(0));
  console.log('Bit 1:', bits.charAt(1));
  console.log('Bit 2:', bits.charAt(2));
  
  return {
    language,
    consents_required: {
      driver_license: isBitEnabled(bits, 0),
      drug_test: isBitEnabled(bits, 1),
      biometric: isBitEnabled(bits, 2)
    },
    verification_steps: {
      education: {
        enabled: isBitEnabled(bits, 3),
        required_verifications: ["degree", "institution", "graduation_date"]
      },
      professional_license: {
        enabled: isBitEnabled(bits, 4),
        required_verifications: ["status", "expiration_date"]
      },
      residence_history: {
        enabled: isBitEnabled(bits, 5),
        years: getTimelineYears(bits, 6),
        required_verifications: ["address", "duration"]
      },
      employment_history: {
        enabled: isBitEnabled(bits, 9),
        years: getTimelineYears(bits, 10),
        required_verifications: ["employment", "duration", "position"]
      }
    }
  };
}