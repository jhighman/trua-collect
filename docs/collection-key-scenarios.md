# Collection Key Scenarios

This document provides a comprehensive list of collection key combinations, their corresponding scenarios, and direct URLs for testing. It reflects the current implementation as of March 23, 2025, based on the collectionKeyParser.ts utility.

## Collection Key Format

The collection key follows this format: [language]-[personal]-[consents]-[residence]-[employment]-[education]-[proLicense]-[signature]

For example: en-EPA-DTB-R3-EN2-E-P-W

- Language: 2-character code (e.g., en, es, fr, it)
- Facets: 7 hyphen-separated components defining verification requirements:
  - personal: Personal info modes
  - consents: Consents required
  - residence: Residence history years
  - employment: Employment history (years or employers)
  - education: Education step
  - proLicense: Professional licenses step
  - signature: Signature requirement

Total length: 8 parts, separated by 7 hyphens.

## Facet Breakdown

### Personal Info

- N: Disabled (skips to next enabled step)
- E: Email only
- P: Phone only
- M: Full name only
- A: Name alias only
- Combinations: EP, EPA, EPM, EPMA, etc.
- Invalid: Defaults to P (phone only)

### Consents Required

- N: No consents
- D: Driver license consent
- T: Drug test consent
- B: Biometric consent
- Combinations: DT, DB, TB, DTB
- Invalid: Defaults to N

### Residence History

- N: Disabled
- R1: 1 year
- R3: 3 years
- R5: 5 years
- Invalid: Defaults to R1 if enabled

### Employment History

- N: Disabled
- Years mode: E1 (1 year), E3 (3 years), E5 (5 years)
- Employers mode: EN1 (1 employer), EN2 (2 employers), EN3 (3 employers)
- Invalid: Defaults to E1 if enabled

### Education

- N: Disabled
- E: Enabled
- Invalid: Defaults to N

### Professional Licenses

- N: Disabled
- P: Enabled
- Invalid: Defaults to N

### Signature

- N: Not required
- C: Checkbox
- W: Wet signature
- Invalid: Defaults to N

## Common Scenarios

Below are common scenarios with their corresponding collection keys and direct URLs. All assume a local development environment at http://localhost:3000/.

### 1. Full Verification (All Steps, Maximum Years)

**Scenario**: Complete verification with all steps and 5-year history.

**Collection Key**: en-EPMA-DTB-R5-E5-E-P-W

**URL**: [http://localhost:3000/?key=en-EPMA-DTB-R5-E5-E-P-W](http://localhost:3000/?key=en-EPMA-DTB-R5-E5-E-P-W)

**Description**: Email/phone/full name/alias, all consents, 5-year residence/employment history, education, professional licenses, wet signature. Starts at personal-info step.

**Expected Output**: A complete claim with all components:

```json
{
  "tracking_id": "generated-uuid",
  "submission_date": "2025-03-23",
  "collection_key": "en-EPMA-DTB-R5-E5-E-P-W",
  "language": "en",
  "requirements": {
    "consents_required": {
      "driverLicense": true,
      "drugTest": true,
      "biometric": true
    },
    "verification_steps": {
      "personalInfo": {
        "enabled": true,
        "modes": { "email": true, "phone": true, "fullName": true, "nameAlias": true }
      },
      "education": { "enabled": true },
      "professionalLicense": { "enabled": true },
      "residenceHistory": { "enabled": true, "years": 5 },
      "employmentHistory": { "enabled": true, "mode": "years", "modes": { "years": 5 } }
    },
    "signature": { "required": true, "mode": "wet" }
  },
  "claimant": {
    "full_name": "John Michael Smith",
    "email": "john.smith@example.com",
    "phone": "555-987-6543",
    "name_alias": "Johnny Smith",
    "completed_at": "2025-03-23T10:15:00Z"
  },
  "residence_history": { "entries": [/* 5 years */], "total_years": 5, "completed_at": "2025-03-23T10:20:00Z" },
  "employment_history": { "entries": [/* 5 years */], "total_years": 5, "completed_at": "2025-03-23T10:25:00Z" },
  "education": { "degree": {/* details */}, "completed_at": "2025-03-23T10:18:00Z" },
  "professional_licenses": { "entries": [/* licenses */], "completed_at": "2025-03-23T10:19:00Z" },
  "signature": { "data": "data:image/png;base64,iVBORw...", "date": "2025-03-23T10:30:00Z" }
}
```

The PDF includes all sections with an embedded wet signature and attestation: "I certify the above is true, [date]."

### 2. Standard Verification (All Steps, 3 Years)

**Scenario**: Standard verification with 3-year history.

**Collection Key**: en-EP-N-R3-E3-E-P-C

**URL**: [http://localhost:3000/?key=en-EP-N-R3-E3-E-P-C](http://localhost:3000/?key=en-EP-N-R3-E3-E-P-C)

**Description**: Email/phone, no consents, 3-year residence/employment history, education, professional licenses, checkbox signature.

**Expected Output**: JSON with all steps, 3-year history; PDF with checkbox attestation.

### 3. Minimal Verification (Personal Info and Signature Only)

**Scenario**: Minimal verification with phone and signature.

**Collection Key**: en-P-N-N-N-N-N-C

**URL**: [http://localhost:3000/?key=en-P-N-N-N-N-N-C](http://localhost:3000/?key=en-P-N-N-N-N-N-C)

**Description**: Phone only, no additional steps, checkbox signature.

**Expected Output**: JSON with personal info and signature; PDF with minimal data.

### 4. Education Verification Only

**Scenario**: Education-focused verification.

**Collection Key**: en-P-N-N-N-E-N-W

**URL**: [http://localhost:3000/?key=en-P-N-N-N-E-N-W](http://localhost:3000/?key=en-P-N-N-N-E-N-W)

**Description**: Phone only, education enabled, wet signature.

**Expected Output**: JSON with personal info, education, signature; PDF with education details.

### 5. Professional Licenses Verification Only

**Scenario**: Professional licenses-focused verification.

**Collection Key**: en-P-N-N-N-N-P-C

**URL**: [http://localhost:3000/?key=en-P-N-N-N-N-P-C](http://localhost:3000/?key=en-P-N-N-N-N-P-C)

**Description**: Phone only, professional licenses enabled, checkbox signature.

**Expected Output**: JSON with personal info, licenses, signature; PDF with license details.

### 6. Residence History Verification Only (3 Years)

**Scenario**: Residence history with 3 years.

**Collection Key**: en-P-N-R3-N-N-N-W

**URL**: [http://localhost:3000/?key=en-P-N-R3-N-N-N-W](http://localhost:3000/?key=en-P-N-R3-N-N-N-W)

**Description**: Phone only, 3-year residence history, wet signature.

**Expected Output**: JSON with personal info, residence history, signature.

### 7. Employment History Verification Only (3 Employers)

**Scenario**: Employment history with 3 employers.

**Collection Key**: en-P-N-N-EN3-N-N-C

**URL**: [http://localhost:3000/?key=en-P-N-N-EN3-N-N-C](http://localhost:3000/?key=en-P-N-N-EN3-N-N-C)

**Description**: Phone only, 3 employers, checkbox signature.

**Expected Output**: JSON with personal info, employment history (up to 3 employers), signature.

### 8. All Consents Required

**Scenario**: All consents with standard steps.

**Collection Key**: en-EP-DTB-R3-E3-E-P-W

**URL**: [http://localhost:3000/?key=en-EP-DTB-R3-E3-E-P-W](http://localhost:3000/?key=en-EP-DTB-R3-E3-E-P-W)

**Description**: Email/phone, all consents, 3-year history, education, professional licenses, wet signature.

### 9. Spanish Language, Standard Verification

**Scenario**: Standard verification in Spanish.

**Collection Key**: es-EP-N-R3-E3-E-P-C

**URL**: [http://localhost:3000/?key=es-EP-N-R3-E3-E-P-C](http://localhost:3000/?key=es-EP-N-R3-E3-E-P-C)

**Description**: Same as scenario 2, in Spanish.

### 10. Start at Residence History Step

**Scenario**: Skip personal info, start at residence history.

**Collection Key**: en-N-N-R3-N-N-N-W

**URL**: [http://localhost:3000/?key=en-N-N-R3-N-N-N-W](http://localhost:3000/?key=en-N-N-R3-N-N-N-W)

**Description**: No personal info, 3-year residence history, wet signature.

### 11. Partial Consents (Driver License Only)

**Scenario**: Driver license consent only.

**Collection Key**: en-P-D-N-N-N-N-W

**URL**: [http://localhost:3000/?key=en-P-D-N-N-N-N-W](http://localhost:3000/?key=en-P-D-N-N-N-N-W)

**Description**: Phone, driver license consent, wet signature.

### 12. Mixed Residence and Employment (5 Years, 2 Employers)

**Scenario**: Residence (5 years) and employment (2 employers).

**Collection Key**: en-EP-N-R5-EN2-N-N-W

**URL**: [http://localhost:3000/?key=en-EP-N-R5-EN2-N-N-W](http://localhost:3000/?key=en-EP-N-R5-EN2-N-N-W)

**Description**: Email/phone, 5-year residence, 2 employers, wet signature.

## Custom Scenarios

### Education and Employment History Only (3 Years)

**Scenario**: Education and employment history with 3 years.

**Collection Key**: en-P-N-N-E3-E-N-C

**URL**: [http://localhost:3000/?key=en-P-N-N-E3-E-N-C](http://localhost:3000/?key=en-P-N-N-E3-E-N-C)

**Description**: Phone, education, 3-year employment history, checkbox signature.

### Professional Licenses and Residence History Only (1 Year)

**Scenario**: Professional licenses and residence history with 1 year.

**Collection Key**: en-P-N-R1-N-N-P-W

**URL**: [http://localhost:3000/?key=en-P-N-R1-N-N-P-W](http://localhost:3000/?key=en-P-N-R1-N-N-P-W)

**Description**: Phone, professional licenses, 1-year residence history, wet signature.

## Testing with Reference Tokens

Add a reference token:

http://localhost:3000/?key=en-EP-N-R3-E3-E-P-C&token=test-token-123

## Development Mode

**URL**: [http://localhost:3000/](http://localhost:3000/)

**Description**: Uses en-EP-N-R3-E3-E-P-C (standard verification), displays a debug banner, allows step skipping.

## Error Handling

- Invalid Format: Throws "Invalid collection key: must have 8 facets separated by -" if not 8 parts.
- Invalid Language: Throws "Invalid language code: must be 2 characters" if not 2 letters.
- Invalid Facets:
  - Residence: Throws "Invalid residence code: must be N or R followed by 1, 3, or 5" if invalid.
  - Employment: Throws "Invalid employment code: must be N, E followed by 1, 3, 5, or EN followed by 1, 2, 3" if invalid.
  - Education: Throws "Invalid education code: must be E or N" if invalid.
  - Professional License: Throws "Invalid professional license code: must be P or N" if invalid.
- Defaults: Falls back to minimal settings (e.g., P, N, R1, E1) for invalid values.

## PDF Output

- Structure: Header (tracking ID, date), sections per enabled step, signature (if required).
- Signature: Embedded image (wet) or text (checkbox).
- Attestation: "I certify the above information is true" with date, omitted if signature not required.