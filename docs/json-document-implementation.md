# JSON Document Implementation

This document describes the implementation of the JSON document generation process in the Trua Verify system, corresponding to steps J → K in the data flow diagram.

## Overview

The JSON document generation process is a critical part of the data flow, where validated form data is transformed into a structured JSON document that can be stored and used for verification purposes. This implementation follows these steps:

1. Form data is validated and submitted
2. System generates a structured JSON document
3. JSON document is saved to the claims directory
4. Document path is returned for further processing

## Implementation Components

### JsonDocumentGenerator

The `JsonDocumentGenerator` class (`src/utils/JsonDocumentGenerator.ts`) is responsible for transforming form data into a structured JSON document. It:

- Extracts personal information, consents, timeline entries, and signature data
- Validates required fields
- Structures the data according to the defined JSON schema
- Generates appropriate filenames
- Formats the JSON for storage

```typescript
// Key generation logic from JsonDocumentGenerator.ts
public static generateJsonDocument(formState: FormState, trackingId: string): JsonDocument {
  const now = new Date();
  const submissionDate = now.toISOString();
  
  // Create the base document structure
  const document: JsonDocument = {
    metadata: {
      trackingId,
      submissionDate,
      version: '1.0.0'
    },
    personalInfo: this.extractPersonalInfo(formState),
    timeline: this.extractTimeline(formState),
    signature: this.extractSignature(formState)
  };
  
  // Add consents if available
  const consents = this.extractConsents(formState);
  if (Object.keys(consents).length > 0) {
    document.consents = consents;
  }
  
  return document;
}
```

### DocumentService

The `DocumentService` class (`src/services/DocumentService.ts`) provides a higher-level interface for document generation and storage. It:

- Uses the JsonDocumentGenerator to create JSON documents
- Handles the storage of documents in the claims directory
- Provides methods for retrieving and checking documents
- Abstracts the file system operations from the rest of the application

```typescript
// Key method from DocumentService.ts
public static async generateAndSaveJsonDocument(
  formState: FormState, 
  trackingId: string
): Promise<string> {
  const document = this.generateJsonDocument(formState, trackingId);
  return this.saveJsonDocument(document, trackingId);
}
```

## JSON Document Structure

The JSON document follows a structured format that includes:

1. **Metadata**:
   - Tracking ID: Unique identifier for the verification request
   - Submission Date: Timestamp of when the document was created
   - Version: Document schema version

2. **Personal Information**:
   - Full Name (required)
   - Email (required)
   - Phone (optional)
   - Other personal details

3. **Consents** (if applicable):
   - Driver License Consent
   - Drug Test Consent
   - Biometric Consent

4. **Timeline**:
   - Employment History: Job details with dates and contact information
   - Residence History: Address details with dates
   - Education: Institution and degree details with dates
   - Professional Licenses: License details with dates

5. **Signature**:
   - Signature Image: Base64-encoded image of the signature
   - Signature Date: Timestamp of when the signature was captured

## File Storage

JSON documents are stored in the `claims/` directory with the following naming convention:

```
truaverify_<tracking_id>_<date>.json
```

For example: `truaverify_abc123_20250319.json`

## Integration with Data Flow Diagram

This implementation directly corresponds to steps J → K in the data flow diagram:

- **Step J: Generate Artifacts** - Implemented by the DocumentService and JsonDocumentGenerator
- **Step K: Create JSON Document** - Implemented by the JsonDocumentGenerator.generateJsonDocument method

## Usage Example

To generate and save a JSON document:

```typescript
import { DocumentService } from '../services/DocumentService';

// After form submission is validated
const handleFormSuccess = async (formData) => {
  try {
    // Generate and save JSON document
    const trackingId = getTrackingIdFromUrl(); // Get from URL parameters
    const jsonFilePath = await DocumentService.generateAndSaveJsonDocument(
      formData,
      trackingId
    );
    
    console.log(`JSON document saved to: ${jsonFilePath}`);
    
    // Proceed to PDF generation or confirmation page
  } catch (error) {
    console.error('Error generating JSON document:', error);
    // Handle error
  }
};
```

## Error Handling

The implementation includes robust error handling:

1. **Missing Required Fields**: Throws specific errors if required fields like full name, email, or signature are missing
2. **Missing Steps**: Validates that all required form steps are present
3. **Storage Errors**: In a production implementation, would handle file system errors

## Future Enhancements

Potential improvements to the JSON document generation process:

1. **Database Storage**: Replace file-based storage with a database for better querying and management
2. **Encryption**: Add encryption for sensitive data
3. **Versioning**: Implement document versioning to track changes
4. **Compression**: Add compression for large documents
5. **Validation Schema**: Implement JSON Schema validation for stricter type checking