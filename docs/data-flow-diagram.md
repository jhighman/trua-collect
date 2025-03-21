# Trua Verify Data Flow Diagram

This document illustrates how data flows through the Trua Verify system, from initial access to final verification.

## Main Data Flow

```mermaid
flowchart TD
    A[Candidate] -->|Accesses| B[Invitation URL with Collection Key]
    B -->|Loads| C[Landing Page]
    C -->|Parses Collection Key| C1{Determine Initial Step}
    
    C1 -->|Default Key| D1[Personal Info Form]
    C1 -->|Custom Key & Residence History Enabled| D2[Residence History Form]
    C1 -->|Custom Key & Professional Licenses Enabled| D3[Professional Licenses Form]
    C1 -->|Custom Key & Education Enabled| D4[Education Form]
    
    D1 -->|Completes| E1[Next Step]
    D2 -->|Completes| E2[Next Step]
    D3 -->|Completes| E3[Next Step]
    D4 -->|Completes| E4[Next Step]
    
    E1 --> F[Form Steps]
    E2 --> F
    E3 --> F
    E4 --> F
    
    F -->|Enters| G1[Personal Information]
    F -->|Adds| G2[Timeline Entries]
    F -->|Provides| G3[Education Details]
    F -->|Provides| G4[Professional Licenses]
    F -->|Signs| G5[Digital Signature]
    
    G1 --> H[Form Submission]
    G2 --> H
    G3 --> H
    G4 --> H
    G5 --> H
    
    H -->|Validates| I{Valid?}
    I -->|No| F
    I -->|Yes| J[Generate Artifacts]
    
    J -->|Create| K[JSON Document]
    J -->|Create| L[PDF Document]
    J -->|Render| M[Confirmation Page]
    
    M -->|Downloads| L
    L -->|Sent to| N[Verifier]
    
    N -->|Contacts| O[References]
    N -->|Confirms| P[Employment Details]
```

## Data Elements and Transformations

### 1. Initial Data Input

- **Invitation URL Parameters**:
  - `tracking_id`: Unique identifier for the verification request
  - `key`: Collection key that determines form configuration and initial step
  - `token`: Reference token for tracking the submission

### 2. Collection Key Processing

- **Collection Key Parsing**:
  - Language prefix (2 characters): Sets UI language (e.g., "en" for English)
  - Configuration bits (12 bits): Determines enabled steps and requirements
  - Bits 1-3: Consents required (driver's license, drug test, biometric)
  - Bits 4-6: Steps enabled (education, professional licenses, residence history)
  - Bits 7-9: Residence history years required
  - Bits 10-13: Employment history years required

- **Initial Step Determination**:
  - Default collection key: Always starts at personal-info step
  - Custom collection key: Determines initial step based on enabled steps
  - Priority order: residence-history, professional-licenses, education, consents
  - URL parameters preserved during routing to maintain consistent behavior

### 3. Form Data Collection

- **Personal Information**:
  - Full Name (required)
  - Email (required)
  - Phone (optional)

- **Timeline Entries** (multiple):
  - Entry Type (Job, Education, Unemployed, Other)
  - Company/Organization (required for Job/Education)
  - Position/Title (required for Job/Education)
  - Start Date (required)
  - End Date (required unless current)
  - Is Current Flag (boolean)
  - Description (optional)
  - Contact Information (required for Job):
    - Contact Name
    - Contact Email/Phone

- **Digital Signature**:
  - Canvas-based signature capture
  - Converted to Base64-encoded PNG image

### 4. Data Validation

- **Client-side Validation**:
  - Required field checks
  - Date consistency (start before end)
  - Timeframe coverage calculation
  - Signature presence check
  - Step validation based on current entry point

- **Server-side Validation**:
  - Form data completeness
  - Data type verification
  - Validation of all required steps regardless of entry point

### 5. Data Transformation

- **JSON Document Creation**:
  - Structured representation of all form data
  - Includes metadata (submission date, tracking ID)
  - Stored as `truaverify_<tracking_id>_<date>.json`

- **PDF Document Creation**:
  - Formatted presentation of form data
  - Embedded signature image
  - Attestation statement
  - Stored as `truaverify_<tracking_id>_<date>.pdf`

### 6. Data Output

- **Confirmation Page Data**:
  - Success message
  - Claimant name
  - PDF download link

- **PDF Download**:
  - Complete claim document for candidate and verifier

## Data Storage

All data is stored in the `claims/` directory with the following structure:

```
claims/
  ├── truaverify_abc123_20250317.json  # JSON data file
  └── truaverify_abc123_20250317.pdf   # PDF document
```

## External Data Flow

The system does not directly interact with external systems. The PDF document is manually shared with the verifier, who then uses the contact information to verify employment details outside the system.

## Data Security Considerations

1. **Data in Transit**: The current implementation does not specify HTTPS, which should be implemented for production.

2. **Data at Rest**: Files are stored without encryption in the claims directory.

3. **Data Access Control**: No authentication mechanism exists to restrict access to stored claims.

4. **Data Retention**: No automatic data retention or deletion policy is implemented.

These security considerations should be addressed in future enhancements to the system.