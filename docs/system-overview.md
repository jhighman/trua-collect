# Trua Verify System Overview

## Introduction

Trua Verify is a web-based system designed to facilitate comprehensive background verification. It allows candidates to submit detailed employment and residence history, education credentials, professional licenses, and consent to various verification processes, which can then be verified by employers, recruiters, or background check services.

## System Purpose

The primary purpose of Trua Verify is to:

1. Provide a structured way for candidates to submit their verification information
2. Ensure the submitted history covers the required timeframes (configurable per verification type)
3. Collect necessary consents for various verification processes
4. Capture a legally binding digital signature to certify the accuracy of the information
5. Generate standardized documents (PDF and JSON) for verification purposes
6. Enable verifiers to efficiently check the candidate's claims

## Key Actors

The system involves two primary actors:

1. **Candidate**: The individual invited to submit their verification information. They provide personal information, consents, employment history, residence history, education credentials, professional licenses, and certify the information with a digital signature.

2. **Verifier**: The relying party (employer, recruiter, or background checker) who initiates the process via an invitation and uses the claim to verify the candidate's information.

## Core Functionality

Trua Verify provides the following core functionality:

1. **Invitation-based Access**: Candidates access the system via a unique URL containing a tracking ID and configuration parameters that determine which verification steps are required.

2. **Multi-language Support**: The system supports multiple languages (English, Spanish, French, and Italian) with a language switcher, allowing candidates to complete the process in their preferred language.

3. **Consent Collection**: The system collects necessary consents based on the verification requirements:
   - Driver's license record check
   - Drug testing
   - Biometric data collection
   - Other configurable consent types

4. **Employment Timeline Creation**: Candidates can add multiple types of timeline entries:
   - Jobs (with company, position, dates, and contact information)
   - Education periods
   - Unemployment gaps
   - Other relevant periods

5. **Residence History Collection**: When required, candidates can add their residence history:
   - Current and previous addresses
   - Dates of residence for each address
   - Duration calculation for each residence

6. **Education Verification**: When required, the system collects detailed information about the candidate's educational background:
   - School name
   - Degree level
   - Degree title
   - Major
   - Award date
   - GPA

7. **Professional License Verification**: When required, the system collects information about professional licenses and certifications:
   - License type
   - License identifier
   - Issuing organization
   - Issue and expiration dates
   - Current status

8. **Timeline Visualization**: The system provides an interactive visual representation of the timeline, showing coverage and gaps, helping candidates understand their progress toward meeting the timeframe requirement.

9. **Timeframe Validation**: The system calculates the total time accounted for and ensures it meets the required timeframe, with real-time feedback to the candidate.

10. **Digital Signature**: Candidates sign their submission using a canvas-based signature capture powered by the signature_pad.js library.

11. **Document Generation**: The system generates both PDF and JSON versions of the claim for different verification needs.

12. **Claim Storage**: All submissions are stored with a unique tracking ID for future reference.

## Current Implementation

The current implementation is a React-based web application with TypeScript:

- A multi-step user flow based on configured verification requirements
- Interactive timeline visualization with real-time validation
- Comprehensive client-side validation for data completeness and timeframe coverage
- Server-side processing and document generation
- TypeScript for type safety and improved developer experience
- Internationalization (i18n) with support for multiple languages
- Responsive design for various device sizes
- File-based storage in the claims directory

## Implementation Status

All core functionality is fully implemented and operational. The system successfully:
- Guides candidates through the submission process
- Collects required consents
- Validates timeline completeness
- Captures digital signatures
- Generates both PDF and JSON documents
- Provides a confirmation page with download capability
- Supports multiple languages (English, Spanish, French, Italian)
- Collects and verifies education credentials when required
- Collects and verifies professional licenses when required
- Collects residence history when required
- Tracks completion timestamps for each section

For a detailed breakdown of implementation status, see [Implementation Status](./implementation-status.md).

## TypeScript Implementation

The application is built using TypeScript, providing several benefits:

1. **Type Safety**: Strong typing helps catch errors during development
2. **Improved Developer Experience**: Better IDE support with autocompletion and type checking
3. **Self-Documenting Code**: Types serve as documentation for data structures
4. **Easier Refactoring**: Type checking makes large-scale changes safer
5. **Better Scalability**: Types help maintain consistency as the codebase grows

The TypeScript implementation includes:
- Comprehensive interfaces for all data structures
- Type-safe React components
- Typed API calls and responses
- Typed form state management
- Type guards for runtime validation

## Data Structure

The system uses a comprehensive data structure to store verification information:

1. **Claim**: The central data structure containing all verification information
2. **Requirements**: Configuration for required verifications and consents
3. **Claimant**: Personal information about the candidate
4. **Consents**: Records of granted consents
5. **ResidenceHistory**: Collection of residence entries
6. **EmploymentHistory**: Collection of employment entries
7. **Education**: Education verification information
8. **ProfessionalLicenses**: Collection of professional license entries
9. **Signature**: Digital signature information

For a detailed description of the data model, see [Data Model](./data-model.md).

## System Boundaries

The current system focuses on the claim submission process. It does not include:

1. A dedicated verifier portal for claim management
2. Automated verification processes
3. Integration with background check systems
4. User account management
5. Database storage (currently uses file-based storage)
6. Advanced security features beyond basic protection

These areas represent potential future enhancements to the system, as outlined in the [Recommendations](./recommendations.md) document.