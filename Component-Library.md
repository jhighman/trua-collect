# SignR Component Library

This document provides visual examples and code snippets for the components used in the SignR application.

## Table of Contents
1. [Buttons](#buttons)
2. [Form Elements](#form-elements)
3. [Navigation](#navigation)
4. [Progress Indicators](#progress-indicators)
5. [Timeline Visualization](#timeline-visualization)
6. [Layout Components](#layout-components)
7. [Validation Messages](#validation-messages)

## Buttons

### Primary Button
```jsx
<Button variant="primary">Next</Button>
```

Primary buttons are used for the main action on a page, such as proceeding to the next step in a form.

**Styling:**
- Background: `var(--primary-color)` (#1a2b5a)
- Text: White
- Hover: `var(--primary-hover)` (#152348)
- Box Shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- Hover Effect: Slight elevation (translateY(-1px))

### Secondary Button
```jsx
<Button variant="secondary">Previous</Button>
```

Secondary buttons are used for alternative actions, such as going back to a previous step.

**Styling:**
- Background: `var(--secondary-color)` (#64748b)
- Text: White
- Hover: `var(--secondary-hover)` (#475569)
- Box Shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- Hover Effect: Slight elevation (translateY(-1px))

### Accent Button
```jsx
<Button variant="accent">Save Draft</Button>
```

Accent buttons are used for actions that should stand out but aren't the primary action.

**Styling:**
- Background: `var(--accent-color)` (#5a8eff)
- Text: White
- Hover: Opacity 0.9
- Box Shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- Hover Effect: Slight elevation (translateY(-1px))

### Disabled Button
```jsx
<Button variant="primary" disabled>Next</Button>
```

**Styling:**
- Background: `var(--border-color)` (#e2e8f0)
- Text: `var(--light-text)` (#64748b)
- Cursor: not-allowed
- No hover effects

## Form Elements

### Text Input
```jsx
<FormGroup>
  <Label htmlFor="fullName">Full Name</Label>
  <Input id="fullName" name="fullName" />
</FormGroup>
```

**Styling:**
- Width: 100%
- Padding: 0.75rem
- Border: 1px solid `var(--border-color)` (#e2e8f0)
- Border Radius: 4px
- Focus: Border color `var(--primary-color)`, Box shadow `0 0 0 3px rgba(26, 43, 90, 0.1)`

### Select Dropdown
```jsx
<FormGroup>
  <Label htmlFor="state">State</Label>
  <Select id="state" name="state">
    <option value="">Select a state</option>
    <option value="CA">California</option>
    <option value="NY">New York</option>
    <option value="TX">Texas</option>
  </Select>
</FormGroup>
```

**Styling:**
- Width: 100%
- Padding: 0.75rem
- Border: 1px solid `var(--border-color)` (#e2e8f0)
- Border Radius: 4px
- Background: White
- Focus: Border color `var(--primary-color)`, Box shadow `0 0 0 3px rgba(26, 43, 90, 0.1)`

### Date Input Group
```jsx
<FormGroup>
  <Label htmlFor="startDate">Start Date</Label>
  <DateInputGroup>
    <Select id="startMonth" name="startMonth">
      <option value="">Month</option>
      {/* Month options */}
    </Select>
    <Select id="startYear" name="startYear">
      <option value="">Year</option>
      {/* Year options */}
    </Select>
  </DateInputGroup>
</FormGroup>
```

**Styling:**
- Display: flex
- Gap: 1rem
- Each select: 50% width

### Checkbox
```jsx
<div className="checkbox">
  <input type="checkbox" id="agree" name="agree" />
  <label htmlFor="agree">I agree to the terms and conditions</label>
</div>
```

**Styling:**
- Display: flex
- Align Items: center
- Input margin-right: 0.5rem
- Label margin-bottom: 0

### Form Group
```jsx
<FormGroup>
  <Label htmlFor="email">Email Address</Label>
  <Input id="email" name="email" type="email" />
  <ErrorMessage>Please enter a valid email address</ErrorMessage>
</FormGroup>
```

**Styling:**
- Margin Bottom: 1.5rem

## Navigation

### Form Navigation
```jsx
<NavigationContainer>
  <PreviousButton type="button" onClick={handlePrevious}>
    Previous
  </PreviousButton>
  <NextButton type="button" onClick={handleNext} disabled={!canProceed}>
    Next
  </NextButton>
</NavigationContainer>
```

**Styling:**
- Display: flex
- Justify Content: space-between
- Margin Top: 2rem
- Padding Top: 1rem
- Border Top: 1px solid `var(--border-color)`

### Language Switcher
```jsx
<div className="language-switcher">
  <select onChange={handleLanguageChange} value={currentLanguage}>
    <option value="en">English</option>
    <option value="es">Español</option>
  </select>
</div>
```

**Styling:**
- Position: absolute
- Top/Right: 10px
- Select: padding 5px 10px, border 1px solid `var(--border-color)`, border-radius 4px
- Focus: Border color `var(--primary-color)`, Box shadow `0 0 0 3px rgba(26, 43, 90, 0.1)`

## Progress Indicators

### Step Indicator
```jsx
<StepIndicator currentStep={2} totalSteps={4} />
```

**Styling:**
- Container: Display flex, align-items center, justify-content center, padding 1.5rem, background white, border-radius 8px, box-shadow small
- Step Number: Width/Height 40px, border-radius 50%, background `var(--primary-color)`, color white, font-weight bold
- Step Info: Display flex, flex-direction column
- Step Count: Color `var(--secondary-color)`, font-size small
- Step Name: Color `var(--text-color)`, font-size large, font-weight 600

### Progress Bar
```jsx
<div className="progress-bar">
  <div 
    className="progress-bar-fill" 
    style={{ width: `${(currentStep / totalSteps) * 100}%` }}
    role="progressbar"
    aria-valuenow={currentStep}
    aria-valuemin="0"
    aria-valuemax={totalSteps}
  />
</div>
```

**Styling:**
- Container: Width 100%, height 8px, background `var(--border-color)`, border-radius 4px, margin 1rem 0
- Fill: Height 100%, background `var(--primary-color)`, transition width 0.3s ease

## Timeline Visualization

### Timeline Component
```jsx
<Timeline 
  entries={residenceEntries}
  type="residence"
  requiredYears={7}
  onEntryClick={handleEntryClick}
/>
```

**Styling:**
- Container: Position relative, height 100px, margin 1.5rem 0
- Ruler: Position absolute, height 4px, background rgba(26, 43, 90, 0.1), border-radius 2px
- Segments: Position absolute, height 100%, border-radius 4px, cursor pointer
- Segment Types:
  - Residence: Background `var(--primary-color)`
  - Gap: Background rgba(220, 53, 69, 0.2), border 1px dashed rgba(220, 53, 69, 0.5)
- Tooltip: Position absolute, background rgba(0, 0, 0, 0.8), color white, padding 4px 8px, border-radius 4px, font-size 12px
- Year Markers: Position absolute, height 10px, border-left 1px solid rgba(26, 43, 90, 0.2)
- Year Labels: Position absolute, font-size 10px, color `var(--text-color)`

### Time Accounted Indicator
```jsx
<div className="time-accounted">
  <div className="progress">
    <div
      className="progress-bar"
      role="progressbar"
      style={{ width: `${(yearsAccounted / requiredYears) * 100}%` }}
      aria-valuenow={yearsAccounted}
      aria-valuemin="0"
      aria-valuemax={requiredYears}
    />
  </div>
  <div className="time-text">
    {yearsAccounted} / {requiredYears} years accounted for
  </div>
</div>
```

**Styling:**
- Container: Margin 1.5rem 0, padding 0.75rem, background rgba(26, 43, 90, 0.05), border-radius 4px, font-weight 500, border-left 4px solid `var(--primary-color)`

## Layout Components

### Container
```jsx
<Container>
  <Header>
    {/* Header content */}
  </Header>
  <Main>
    {/* Main content */}
  </Main>
</Container>
```

**Styling:**
- Max Width: 1200px
- Margin: 0 auto
- Padding: 1.5rem
- Min Height: 100vh
- Display: flex
- Flex Direction: column

### Header
```jsx
<Header>
  <TopBar>
    <LogoContainer>
      <Logo>SignR</Logo>
      <Tagline>Truth, Trust & Ownership</Tagline>
    </LogoContainer>
    <LanguageSwitcher />
  </TopBar>
  <StepIndicator 
    currentStep={currentStep}
    totalSteps={totalSteps}
  />
</Header>
```

**Styling:**
- Display: flex
- Flex Direction: column
- Gap: 1.5rem
- Margin Bottom: 2rem
- Padding Bottom: 1.5rem

### Main Content
```jsx
<Main>
  <form id="employmentForm" onSubmit={handleSubmit}>
    {/* Form content */}
  </form>
</Main>
```

**Styling:**
- Background: white
- Border Radius: 8px
- Box Shadow: medium
- Padding: 2rem
- Flex: 1
- Max Width: 800px
- Margin: 0 auto
- Width: 100%

### Form Section
```jsx
<div className="form-section">
  <h2>Personal Information</h2>
  {/* Form fields */}
</div>
```

**Styling:**
- Background: `var(--card-background)`
- Border Radius: 0.5rem
- Padding: 1.5rem
- Margin Bottom: 1.5rem
- Box Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)

## Validation Messages

### Error Message
```jsx
<ErrorMessage>Please enter a valid email address</ErrorMessage>
```

**Styling:**
- Color: `var(--error-color)` (#ef4444)
- Font Size: 0.875rem
- Margin Top: 0.25rem

### Success Message
```jsx
<div className="validation-message success">
  All required information has been provided
</div>
```

**Styling:**
- Color: `var(--success-color)` (#10b981)
- Margin Top: 0.5rem

### Form Validation
```jsx
<FormGroup>
  <Label htmlFor="email">Email Address</Label>
  <Input 
    id="email" 
    name="email" 
    type="email"
    aria-invalid={errors.email ? "true" : "false"}
  />
  {errors.email && (
    <ErrorMessage>{errors.email.message}</ErrorMessage>
  )}
</FormGroup>
```

**Styling:**
- Input with error: Border color `var(--error-color)`
- Error message: Color `var(--error-color)`, font-size 0.875rem, margin-top 0.25rem