# Collection Key Scenarios

This document provides a comprehensive list of collection key combinations, their corresponding scenarios, and direct URLs for testing.

## Collection Key Format

The collection key follows this format: `[language][12 bits for configuration]`

For example: `en000111100100`

- First 2 characters: Language code (`en`, `es`, `fr`, `it`)
- Next 12 characters: Configuration bits (0 or 1)

## Configuration Bits Breakdown

1. **Bits 1-3 (positions 3-5)**: Consents required
   - `000`: No consents required
   - `001`: Driver license consent required
   - `010`: Drug test consent required
   - `100`: Biometric consent required
   - `011`: Driver license and drug test consents required
   - `101`: Driver license and biometric consents required
   - `110`: Drug test and biometric consents required
   - `111`: All consents required

2. **Bit 4 (position 6)**: Education step
   - `0`: Education step disabled
   - `1`: Education step enabled

3. **Bit 5 (position 7)**: Professional licenses step
   - `0`: Professional licenses step disabled
   - `1`: Professional licenses step enabled

4. **Bit 6 (position 8)**: Residence history step
   - `0`: Residence history step disabled
   - `1`: Residence history step enabled

5. **Bits 7-9 (positions 9-11)**: Residence history years
   - `001`: 1 year
   - `010`: 3 years
   - `100`: 5 years
   - `101`: 7 years
   - `111`: 10 years

6. **Bit 10 (position 12)**: Employment history step
   - `0`: Employment history step disabled
   - `1`: Employment history step enabled

7. **Bits 11-13 (positions 13-15)**: Employment history years
   - `001`: 1 year
   - `010`: 3 years
   - `100`: 5 years
   - `101`: 7 years
   - `111`: 10 years

## Common Scenarios

Below is a list of common scenarios with their corresponding collection keys and direct URLs:

### 1. Full Verification (All Steps, Maximum Years)

**Scenario**: Complete verification with all steps enabled and maximum history requirements (10 years for both residence and employment).

**Collection Key**: `en000111111111`

**URL**: [http://localhost:3000/?key=en000111111111](http://localhost:3000/?key=en000111111111)

**Description**: This scenario enables all verification steps (education, professional licenses, residence history, employment history) with 10-year history requirements for both residence and employment. No consents are required. The form starts at the personal-info step.

### 2. Standard Verification (All Steps, 5 Years)

**Scenario**: Standard verification with all steps enabled and 5-year history requirements.

**Collection Key**: `en000111100100`

**URL**: [http://localhost:3000/?key=en000111100100](http://localhost:3000/?key=en000111100100)

**Description**: This is the default collection key. It enables all verification steps with 5-year history requirements for both residence and employment. No consents are required. The form starts at the personal-info step.

### 3. Minimal Verification (Personal Info and Signature Only)

**Scenario**: Minimal verification with only personal information and signature.

**Collection Key**: `en000000000000`

**URL**: [http://localhost:3000/?key=en000000000000](http://localhost:3000/?key=en000000000000)

**Description**: This scenario disables all optional steps, requiring only personal information and signature. The form starts at the personal-info step and then jumps directly to the signature step.

### 4. Education Verification Only

**Scenario**: Verification focused only on education credentials.

**Collection Key**: `en000100000000`

**URL**: [http://localhost:3000/?key=en000100000000](http://localhost:3000/?key=en000100000000)

**Description**: This scenario enables only the education step, disabling professional licenses, residence history, and employment history. The form starts at the personal-info step, proceeds to education, and then to signature.

### 5. Professional Licenses Verification Only

**Scenario**: Verification focused only on professional licenses.

**Collection Key**: `en000010000000`

**URL**: [http://localhost:3000/?key=en000010000000](http://localhost:3000/?key=en000010000000)

**Description**: This scenario enables only the professional licenses step, disabling education, residence history, and employment history. The form starts at the personal-info step, proceeds to professional licenses, and then to signature.

### 6. Residence History Verification Only (5 Years)

**Scenario**: Verification focused only on residence history with 5-year requirement.

**Collection Key**: `en000001100000`

**URL**: [http://localhost:3000/?key=en000001100000](http://localhost:3000/?key=en000001100000)

**Description**: This scenario enables only the residence history step with a 5-year history requirement. The form starts at the personal-info step, proceeds to residence history, and then to signature.

### 7. Employment History Verification Only (5 Years)

**Scenario**: Verification focused only on employment history with 5-year requirement.

**Collection Key**: `en000000000100`

**URL**: [http://localhost:3000/?key=en000000000100](http://localhost:3000/?key=en000000000100)

**Description**: This scenario enables only the employment history step with a 5-year history requirement. The form starts at the personal-info step, proceeds to employment history, and then to signature.

### 8. All Consents Required

**Scenario**: All consents required with standard verification steps.

**Collection Key**: `en111111100100`

**URL**: [http://localhost:3000/?key=en111111100100](http://localhost:3000/?key=en111111100100)

**Description**: This scenario requires all consents (driver license, drug test, biometric) and enables all verification steps with 5-year history requirements. The form starts at the personal-info step, proceeds to consents, and then continues with the verification steps.

### 9. Spanish Language, Standard Verification

**Scenario**: Standard verification in Spanish.

**Collection Key**: `es000111100100`

**URL**: [http://localhost:3000/?key=es000111100100](http://localhost:3000/?key=es000111100100)

**Description**: This scenario is identical to the standard verification but with the interface in Spanish. It enables all verification steps with 5-year history requirements.

### 10. French Language, Standard Verification

**Scenario**: Standard verification in French.

**Collection Key**: `fr000111100100`

**URL**: [http://localhost:3000/?key=fr000111100100](http://localhost:3000/?key=fr000111100100)

**Description**: This scenario is identical to the standard verification but with the interface in French. It enables all verification steps with 5-year history requirements.

### 11. Italian Language, Standard Verification

**Scenario**: Standard verification in Italian.

**Collection Key**: `it000111100100`

**URL**: [http://localhost:3000/?key=it000111100100](http://localhost:3000/?key=it000111100100)

**Description**: This scenario is identical to the standard verification but with the interface in Italian. It enables all verification steps with 5-year history requirements.

### 12. Start at Residence History Step

**Scenario**: Start the form at the residence history step.

**Collection Key**: `en000001100000`

**URL**: [http://localhost:3000/?key=en000001100000](http://localhost:3000/?key=en000001100000)

**Description**: This scenario enables only the residence history step and starts the form directly at that step, skipping personal information. This is useful for testing specific steps in isolation.

### 13. Start at Professional Licenses Step

**Scenario**: Start the form at the professional licenses step.

**Collection Key**: `en000010000000`

**URL**: [http://localhost:3000/?key=en000010000000](http://localhost:3000/?key=en000010000000)

**Description**: This scenario enables only the professional licenses step and starts the form directly at that step, skipping personal information. This is useful for testing specific steps in isolation.

### 14. Start at Education Step

**Scenario**: Start the form at the education step.

**Collection Key**: `en000100000000`

**URL**: [http://localhost:3000/?key=en000100000000](http://localhost:3000/?key=en000100000000)

**Description**: This scenario enables only the education step and starts the form directly at that step, skipping personal information. This is useful for testing specific steps in isolation.

### 15. Short Residence History (1 Year)

**Scenario**: Verification with 1-year residence history requirement.

**Collection Key**: `en000001001000`

**URL**: [http://localhost:3000/?key=en000001001000](http://localhost:3000/?key=en000001001000)

**Description**: This scenario enables the residence history step with a 1-year history requirement. The form starts at the personal-info step, proceeds to residence history, and then to signature.

### 16. Long Employment History (10 Years)

**Scenario**: Verification with 10-year employment history requirement.

**Collection Key**: `en000000000111`

**URL**: [http://localhost:3000/?key=en000000000111](http://localhost:3000/?key=en000000000111)

**Description**: This scenario enables the employment history step with a 10-year history requirement. The form starts at the personal-info step, proceeds to employment history, and then to signature.

## Custom Scenarios

You can create custom scenarios by combining different configuration bits according to your specific requirements. For example:

### Education and Employment History Only (3 Years)

**Scenario**: Verification focused on education and employment history with 3-year requirement.

**Collection Key**: `en000100000010`

**URL**: [http://localhost:3000/?key=en000100000010](http://localhost:3000/?key=en000100000010)

**Description**: This scenario enables only the education and employment history steps with a 3-year employment history requirement. The form starts at the personal-info step, proceeds to education, then employment history, and finally signature.

### Professional Licenses and Residence History Only (7 Years)

**Scenario**: Verification focused on professional licenses and residence history with 7-year requirement.

**Collection Key**: `en000011101000`

**URL**: [http://localhost:3000/?key=en000011101000](http://localhost:3000/?key=en000011101000)

**Description**: This scenario enables only the professional licenses and residence history steps with a 7-year residence history requirement. The form starts at the personal-info step, proceeds to professional licenses, then residence history, and finally signature.

## Testing with Reference Tokens

You can add a reference token to any URL for testing purposes:

```
http://localhost:3000/?key=en000111100100&token=test-token-123
```

This allows you to simulate a real verification request with a specific reference token.

## Development Mode

When accessing the application without a collection key or token, it automatically enters development mode with the default collection key (`en000111100100`).

**URL**: [http://localhost:3000/](http://localhost:3000/)

**Description**: This mode enables all verification steps with 5-year history requirements and displays a development mode banner at the top of the page.