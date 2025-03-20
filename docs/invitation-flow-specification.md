# Invitation Flow Specification

## Overview

This document outlines the specification for the invitation flow in the Trua Verify application. The invitation flow is the process by which users are invited to complete the verification process.

## Invitation Process

1. An invitation is sent to a user via email or SMS.
2. The invitation contains a QR code that, when scanned, directs the user to the Trua Verify application.
3. The QR code encodes a URL that contains two key pieces of information:
   - A reference token that uniquely identifies the invitation
   - A collection key that determines the verification requirements

## URL Structure

The URL structure for the invitation will be as follows:

```
https://[domain]/verify?token=[reference_token]&key=[collection_key]
```

Where:
- `[domain]` is the domain where the Trua Verify application is hosted
- `[reference_token]` is a unique identifier for the invitation
- `[collection_key]` is the collection key that determines the verification requirements

Example:
```
https://verify.trua.com/verify?token=abc123def456&key=en101110101110
```

## Reference Token

The reference token is a unique identifier for the invitation. It will be:
- Generated when the invitation is created
- Included in the URL when the QR code is scanned
- Stored with the claim data
- Included in the PDF and JSON output

The reference token will be used to:
- Track the invitation
- Link the claim to the invitation
- Allow the verifier to identify the claim

## Collection Key

The collection key determines the verification requirements for the claim. It is a string that encodes:
- The language for the verification process
- The consents required
- The verification steps required
- The number of years required for timeline verification

The collection key is parsed by the `collectionKeyParser.ts` utility to determine the requirements for the verification process.

## Implementation Details

### Entry Point Component

We will create a new component called `VerificationEntry` that will:
1. Parse the URL parameters to extract the reference token and collection key
2. Validate the reference token and collection key
3. Initialize the form with the appropriate requirements
4. Store the reference token with the form data

### URL Parameter Parsing

We will use the browser's URL API to parse the URL parameters:

```typescript
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const key = urlParams.get('key');
```

### Form Context Updates

We will update the `FormContext` to include the reference token:

```typescript
interface FormContextType {
  // ... existing properties
  referenceToken: string | null;
}
```

### Form State Manager Updates

We will update the `FormStateManager` to store the reference token:

```typescript
interface FormState {
  // ... existing properties
  referenceToken: string | null;
}
```

### Document Generation Updates

We will update the document generation services to include the reference token in the output:

1. Update `PdfService` to include the reference token in the PDF
2. Update `JsonDocumentGenerator` to include the reference token in the JSON

## User Experience

1. User receives an email or SMS with a QR code
2. User scans the QR code with their mobile device
3. User is directed to the Trua Verify application
4. The application automatically loads with the appropriate verification requirements
5. User completes the verification process
6. The reference token is included in the generated documents

## Security Considerations

1. The reference token should be a secure, random string that cannot be guessed
2. The collection key should be validated to ensure it is properly formatted
3. The application should check that the reference token is valid and has not been used before
4. All communication should be over HTTPS to ensure the security of the data

## Testing

1. Test that the URL parameters are correctly parsed
2. Test that the reference token is stored with the form data
3. Test that the reference token is included in the generated documents
4. Test the QR code generation and scanning process
5. Test the security of the reference token

## Future Enhancements

1. Add expiration to the reference token
2. Add the ability to revoke a reference token
3. Add the ability to track the status of an invitation
4. Add the ability to send reminders for incomplete verifications