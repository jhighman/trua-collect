# Signature Component Specification

## Overview

The Signature component is a critical part of the SignR application that allows users to provide their legal signature to complete the form submission process. It provides an interactive canvas where users can draw their signature using mouse, touch, or stylus input.

## Libraries Used

### Primary Libraries

1. **react-signature-canvas (v1.1.0-alpha.1)**
   - A React wrapper around the signature_pad library
   - GitHub: https://github.com/agilgur5/react-signature-canvas

2. **signature_pad (v4.1.5)**
   - The underlying JavaScript library that powers the signature functionality
   - GitHub: https://github.com/szimek/signature_pad
   - Author: Szymon Nowak
   - License: MIT

## Implementation Details

The SignR application has two implementations of the signature functionality:

1. **React Implementation** - Used in the React client application
2. **Vanilla JS Implementation** - Used in the legacy/non-React version of the application

### React Implementation

The React implementation uses the `react-signature-canvas` component within a styled container and provides functionality for:
- Drawing signatures
- Clearing signatures
- Validating that a signature exists
- Converting signatures to data URLs for submission
- Error handling and validation

### Vanilla JS Implementation

The vanilla JavaScript implementation directly uses the `signature_pad` library and provides:
- Canvas initialization
- Accessibility enhancements
- Keyboard support
- Clear functionality
- Integration with form validation

## Visual Design

### Layout & Dimensions

- **Container**: Full width with responsive sizing
- **Canvas Height**: 200px (desktop), 150px (mobile)
- **Border**: 1px solid border (#ced4da, or #dc3545 when in error state)
- **Border Radius**: 4px
- **Background**: White (#fff)

### Colors

- **Pen Color**: Black (#000)
- **Background Color**: White (#fff)
- **Border Color**: #ced4da (default), #dc3545 (error)
- **Clear Button**: Background #f8f9fa, Border #ced4da, Text #495057
- **Clear Button Hover**: Background #e2e6ea

### Typography

- **Section Title**: 24px, color #333
- **Error Message**: 14px, color #dc3545
- **Button Text**: 14px

## Interaction Design

### Drawing Behavior

- **Pen Width**: Varies based on drawing velocity (thinner when moving quickly, thicker when moving slowly)
- **Min Width**: 0.5px
- **Max Width**: 2.5px
- **Smoothing**: Applied to drawn lines for a natural appearance

### States

- **Empty State**: Just the canvas border is visible
- **Error State**: Red border and error message when form is submitted without a signature
- **Filled State**: Shows the user's signature

### Actions

- **Clear Button**: Allows users to erase their signature and start over
- **Submit**: The signature is converted to a PNG image and included in the form submission

## Technical Implementation

### React Component Props

```jsx
SignatureCanvas.propTypes = {
  // Canvas properties
  canvasProps: PropTypes.object,
  // Pen properties
  penColor: PropTypes.string,
  // Callbacks
  onBegin: PropTypes.func,
  onEnd: PropTypes.func,
};
```

### Data Structure

The signature is stored as a base64-encoded PNG image in the form state:

```javascript
{
  signature: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### Key Methods

#### React Implementation

- **sigCanvas.current.clear()**: Clears the signature canvas
- **sigCanvas.current.isEmpty()**: Checks if the canvas is empty
- **sigCanvas.current.toDataURL('image/png')**: Converts the signature to a data URL
- **sigCanvas.current.fromDataURL(dataURL)**: Loads a signature from a data URL

#### Vanilla JS Implementation

- **signaturePad.clear()**: Clears the signature canvas
- **signaturePad.isEmpty()**: Checks if the canvas is empty
- **signaturePad.toDataURL()**: Converts the signature to a data URL

### Form Submission Process

1. When the form is submitted, the component checks if the signature canvas is empty
2. If empty, it displays an error message
3. If not empty, it converts the signature to a data URL
4. The data URL is then converted to a Blob for form submission
5. The Blob is appended to the FormData object with the name 'signature'

```javascript
// Convert base64 to blob
const byteString = atob(signatureData.split(',')[1]);
const mimeString = signatureData.split(',')[0].split(':')[1].split(';')[0];
const ab = new ArrayBuffer(byteString.length);
const ia = new Uint8Array(ab);

for (let i = 0; i < byteString.length; i++) {
  ia[i] = byteString.charCodeAt(i);
}

const blob = new Blob([ab], { type: mimeString });
formData.append('signature', blob, 'signature.png');
```

## Accessibility Considerations

### Keyboard Navigation

- **Focus Indicators**: The canvas has a visible focus state
- **Keyboard Support**: The vanilla JS implementation includes keyboard support for drawing

### Screen Reader Support

- **ARIA Attributes**:
  - `role="application"` for the canvas
  - `aria-label` describing the purpose of the canvas
  - `aria-live` announcements for actions like clearing the signature

### Instructions

- Keyboard instructions are displayed when the canvas receives focus
- Clear instructions are provided for how to use the signature pad

## Responsive Behavior

### Mobile Adjustments (< 768px)

- **Canvas Height**: Reduced to 150px
- **Clear Button**: Full width

### Touch Optimization

- The signature pad is optimized for touch input with appropriate smoothing
- Pressure sensitivity is supported on devices that provide it

## Edge Cases

### Browser Compatibility

- The component works across all modern browsers
- For older browsers without canvas support, a fallback message should be displayed

### Data Persistence

- If the user navigates away from the signature step and returns, their signature is preserved
- This is handled by storing the signature in the form state

### Validation

- The form cannot be submitted without a signature
- A clear error message is displayed if the user attempts to submit without signing

## Integration Guidelines

### Parent Component Responsibilities

- Provide the form state and dispatch function
- Handle form submission
- Provide translation function for error messages

### Required CSS

The Signature component relies on these styled components:

```jsx
const StepContainer = styled.div`...`;
const StepTitle = styled.h2`...`;
const SignatureSection = styled.div`...`;
const SignatureBox = styled.div`...`;
const SignatureActions = styled.div`...`;
const ClearButton = styled(Button)`...`;
const ErrorMessage = styled.div`...`;
```

## Usage Example

```jsx
import React from 'react';
import Signature from './components/steps/Signature';

function SignatureStep() {
  return (
    <div className="form-step">
      <h1>Complete Your Application</h1>
      <Signature />
    </div>
  );
}
```

## Performance Considerations

- The signature canvas uses the HTML5 Canvas API, which is hardware-accelerated in most browsers
- The signature data is only converted to a data URL when needed (on form submission)
- The canvas size is kept reasonable to avoid performance issues on mobile devices

## Security Considerations

- The signature is transmitted securely as part of the form submission
- The signature is stored as a PNG image, which cannot contain executable code
- The signature should be validated server-side to ensure it's not empty

## Attestation Section

The signature component is paired with an attestation section that includes:

### Visual Design

- **Container**: Background #f8f9fa, Border-radius 4px, Padding 20px
- **Text**: Line-height 1.6, Margin-bottom 20px
- **Name Highlight**: Font-weight 600

### Content

- Legal attestation text
- Checkbox for acknowledging terms
- Error message if checkbox is not checked

### Validation

- Both the signature and the attestation checkbox must be completed before submission
- Separate error messages for each requirement