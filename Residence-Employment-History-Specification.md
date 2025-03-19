# Residence and Employment History Specification

## Overview

The Residence and Employment History components are critical parts of the SignR application that allow users to provide their complete residence and employment history as part of the verification process. These components enable users to add, edit, and manage multiple entries with appropriate validation and user-friendly interfaces.

## Data Model

### ResidenceEntry

The `ResidenceEntry` represents a single address in the candidate's residence history:

```javascript
{
  address: String,         // Street address
  city: String,            // City
  stateProvince: String,   // State, province, or region
  zipPostal: String,       // ZIP or postal code
  country: String,         // Country
  startDate: Date,         // When the candidate began residing at this address
  endDate: Date | null,    // When the candidate stopped residing at this address (null if current)
  isCurrent: Boolean       // Whether this is the current residence
}
```

### EmploymentEntry

The `EmploymentEntry` represents a single period in the candidate's employment history:

```javascript
{
  employerName: String,      // Company or organization name
  position: String,          // Position or title
  address: String,           // Street address
  city: String,              // City
  stateProvince: String,     // State, province, or region
  zipPostal: String,         // ZIP or postal code
  country: String,           // Country
  phone: String,             // Employer phone number
  supervisorName: String,    // Name of supervisor or reference
  startDate: Date,           // When employment began
  endDate: Date | null,      // When employment ended (null if current)
  isCurrent: Boolean,        // Whether this is the current employment
  salary: String | null,     // Salary information (optional)
  canContact: Boolean        // Whether the employer can be contacted
}
```

## Implementation Details

The SignR application has two implementations for both residence and employment history:

1. **React Implementation** - Used in the React client application
2. **Vanilla JS Implementation** - Used in the legacy/non-React version of the application

### React Implementation

The React implementation uses React Hook Form for form management and consists of the following components:

#### Residence History Components

- **ResidenceHistory**: Main component that manages the list of residences
- **ResidenceForm**: Form component for adding/editing a residence entry
- **ResidenceEntry**: Individual residence entry component (legacy)

#### Employment History Components

- **EmploymentHistory**: Main component that manages the list of employments
- **EmploymentForm**: Form component for adding/editing an employment entry
- **EmploymentEntry**: Individual employment entry component (legacy)

### Vanilla JS Implementation

The vanilla JavaScript implementation provides:

- Entry management (add, edit, delete)
- Form validation
- Date handling
- Integration with the main form submission process

## Configuration

Both residence and employment history components are configurable through the `formConfig` object:

### Residence Configuration

```javascript
{
  required: true,              // Whether residence history is required
  yearsRequired: 7,            // Number of years that must be accounted for
  maxResidences: 10,           // Maximum number of residences allowed
  minResidences: 1,            // Minimum number of residences required
  dateRange: {
    maxYearsBack: 20,          // Maximum years in the past for dates
    allowFutureDates: false    // Whether future dates are allowed
  },
  validation: {
    requireEndDate: true,      // Whether end date is required for non-current residences
    requireCountry: true,      // Whether country is required
    requireStateProvince: true, // Whether state/province is required
    requireZipPostal: true     // Whether ZIP/postal code is required
  }
}
```

### Employment Configuration

```javascript
{
  required: true,              // Whether employment history is required
  yearsRequired: 5,            // Number of years that must be accounted for
  maxEmployments: 10,          // Maximum number of employments allowed
  minEmployments: 1,           // Minimum number of employments required
  dateRange: {
    maxYearsBack: 20,          // Maximum years in the past for dates
    allowFutureDates: false    // Whether future dates are allowed
  },
  validation: {
    requireEndDate: true,      // Whether end date is required for non-current employments
    requireCountry: true,      // Whether country is required
    requireStateProvince: true, // Whether state/province is required
    requireZipPostal: true,    // Whether ZIP/postal code is required
    requireEmployerPhone: true, // Whether employer phone is required
    requireSupervisorName: true, // Whether supervisor name is required
    requirePosition: true,     // Whether position is required
    requireSalary: false,      // Whether salary is required
    allowContactEmployer: true // Whether "can contact employer" option is shown
  }
}
```

## Visual Design

### Layout & Dimensions

- **Container**: Full width with responsive sizing
- **List Items**: Card-like appearance with padding and border
- **Form Fields**: Full width with appropriate spacing
- **Buttons**: Consistent with application button styling

### Colors

- **Container Background**: White (#fff)
- **List Item Background**: Light gray (#f8f9fa)
- **List Item Border**: Light gray (#ced4da)
- **Form Field Border**: #ced4da (default), #dc3545 (error)
- **Primary Button**: Background #007bff, Text white
- **Secondary Button**: Background #f8f9fa, Border #ced4da, Text #495057
- **Accent Button (Delete)**: Background #dc3545, Text white

### Typography

- **Section Title**: 24px, color #333
- **List Item Title**: 18px, font-weight 600, color #333
- **List Item Text**: 16px, color #495057
- **Form Labels**: 16px, font-weight 500, color #333
- **Error Message**: 14px, color #dc3545

## Interaction Design

### States

- **Empty State**: Shows message prompting user to add entries
- **List State**: Shows list of entries with edit/delete options
- **Form State**: Shows form for adding/editing entries
- **Error State**: Shows validation errors on form fields

### Actions

- **Add Entry**: Opens form for adding a new entry
- **Edit Entry**: Opens form pre-populated with entry data
- **Delete Entry**: Removes entry after confirmation
- **Save Entry**: Validates and saves entry data
- **Cancel**: Returns to list view without saving

## Technical Implementation

### Key Methods

#### ResidenceHistory Component

- **handleSaveResidence**: Saves a residence entry to the list
- **handleEditResidence**: Prepares a residence entry for editing
- **handleDeleteResidence**: Removes a residence entry from the list
- **calculateYearsAccounted**: Calculates total years covered by residence entries

#### EmploymentHistory Component

- **handleSaveEmployment**: Saves an employment entry to the list
- **handleEditEmployment**: Prepares an employment entry for editing
- **handleDeleteEmployment**: Removes an employment entry from the list
- **calculateYearsAccounted**: Calculates total years covered by employment entries

### Form Validation

#### Residence Validation

- Address is required
- City is required
- State/Province is required (if configured)
- ZIP/Postal Code is required (if configured)
- Country is required (if configured)
- Start Date is required
- End Date is required unless "Current Residence" is checked
- Start Date must be before End Date
- Residence entries should not have overlapping dates

#### Employment Validation

- Employer Name is required
- Position is required (if configured)
- Address is required
- City is required
- State/Province is required (if configured)
- ZIP/Postal Code is required (if configured)
- Country is required (if configured)
- Phone is required (if configured)
- Supervisor Name is required (if configured)
- Start Date is required
- End Date is required unless "Current Employment" is checked
- Start Date must be before End Date
- Employment entries should not have overlapping dates

### Date Handling

Both components handle dates in a consistent manner:

- Dates are stored as ISO strings in the data model
- Dates are displayed in a user-friendly format in the UI
- Date inputs use month/year selectors for better UX
- Current entries have null end dates and isCurrent flag set to true

## Accessibility Considerations

### Keyboard Navigation

- All form fields are properly labeled and focusable
- Tab order follows a logical sequence
- Form actions are accessible via keyboard

### Screen Reader Support

- ARIA attributes are used where appropriate
- Error messages are associated with their respective form fields
- Dynamic content changes are announced appropriately

### Instructions

- Clear instructions are provided for both residence and employment history sections
- Error messages are specific and helpful

## Responsive Behavior

### Mobile Adjustments (< 768px)

- Form fields stack vertically on small screens
- Date selectors adjust to full width
- Buttons adjust to appropriate sizing for touch targets

### Touch Optimization

- Form controls are sized appropriately for touch input
- List items have sufficient spacing for touch interaction

## Edge Cases

### Browser Compatibility

- Components work across all modern browsers
- Appropriate polyfills are included for older browsers

### Data Persistence

- If the user navigates away from a step and returns, their entries are preserved
- This is handled by storing the entries in the form state

### Validation

- The form cannot proceed without meeting minimum requirements
- Clear error messages are displayed for validation failures
- Years required validation ensures complete history coverage

## Integration Guidelines

### Parent Component Responsibilities

- Provide the form state and dispatch function
- Handle form navigation
- Provide translation function for text and error messages

### Required CSS

The components rely on these styled components:

```jsx
const StepContainer = styled.div`...`;
const StepTitle = styled.h2`...`;
const List = styled.ul`...`;
const ListItem = styled.li`...`;
const FormGroup = styled.div`...`;
const Label = styled.label`...`;
const Input = styled.input`...`;
const Select = styled.select`...`;
const ErrorMessage = styled.div`...`;
const ButtonGroup = styled.div`...`;
```

## Usage Example

```jsx
import React from 'react';
import ResidenceHistory from './components/steps/ResidenceHistory';
import EmploymentHistory from './components/steps/EmploymentHistory';

function HistorySteps() {
  return (
    <div className="form-steps">
      <ResidenceHistory />
      <EmploymentHistory />
    </div>
  );
}
```

## Performance Considerations

- List rendering uses React's key prop for efficient updates
- Form state is managed efficiently with React Hook Form
- Date calculations are optimized to avoid unnecessary recalculations
- Large lists are handled efficiently with appropriate rendering optimizations

## Security Considerations

- Input validation is performed on both client and server
- Date inputs are properly sanitized and validated
- Personal information is transmitted securely as part of the form submission
- Address and employment information is validated for consistency

## Timeline Visualization

Both residence and employment history can be visualized on a timeline to help users understand gaps and overlaps:

### Visual Design

- **Timeline Container**: Full width, padding 20px
- **Timeline Entries**: Color-coded by type (residence vs. employment)
- **Timeline Gaps**: Highlighted in a different color
- **Current Period**: Extends to the right edge of the timeline

### Interaction

- Clicking on a timeline entry can navigate to edit that entry
- Hovering over a timeline entry shows details in a tooltip
- Timeline can be zoomed in/out to focus on specific periods

## Form Submission Process

1. When the form is submitted, both residence and employment entries are validated
2. If validation passes, the entries are formatted for submission
3. The formatted data is included in the form submission
4. The data is stored in both JSON and PDF formats

## Translations

Both components support multiple languages through the translation system:

```javascript
// Example English translations
const residenceTranslations = {
  title: "Residence History",
  form: {
    title: {
      add: "Add Residence",
      edit: "Edit Residence"
    },
    address: "Street Address",
    city: "City",
    stateProvince: "State/Province/Region",
    zipPostal: "ZIP / Postal Code",
    country: "Country",
    startDate: "Start Date",
    endDate: "End Date",
    currentResidence: "I currently live at this address",
    selectMonth: "Select Month",
    selectYear: "Select Year",
    selectCountry: "Select Country"
  },
  empty: "Please provide your residence history for the past {{years}} years.",
  needMoreYears: "You need to account for {{required}} years. Currently: {{current}} years."
};

const employmentTranslations = {
  title: "Employment History",
  form: {
    title: {
      add: "Add Employment",
      edit: "Edit Employment"
    },
    employerName: "Employer Name",
    position: "Position/Title",
    address: "Street Address",
    city: "City",
    stateProvince: "State/Province/Region",
    zipPostal: "ZIP / Postal Code",
    country: "Country",
    phone: "Employer Phone",
    supervisorName: "Supervisor Name",
    startDate: "Start Date",
    endDate: "End Date",
    currentEmployment: "I currently work here",
    salary: "Salary",
    canContact: "You may contact this employer",
    selectMonth: "Select Month",
    selectYear: "Select Year",
    selectCountry: "Select Country"
  },
  empty: "Please provide your employment history for the past {{years}} years.",
  needMoreYears: "You need to account for {{required}} years. Currently: {{current}} years."
};
```

## Testing Strategy

### Unit Tests

- Test validation logic for both residence and employment entries
- Test date calculations and formatting
- Test form submission and error handling

### Integration Tests

- Test the interaction between residence/employment components and the main form
- Test navigation between steps
- Test data persistence between steps

### End-to-End Tests

- Test the complete form flow including residence and employment history
- Test validation error scenarios
- Test different configuration options