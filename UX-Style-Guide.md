# SignR UX Style Guide

This document outlines the design system and UX patterns used in the SignR application.

## Table of Contents
1. [Brand Identity](#brand-identity)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Borders & Radius](#borders--radius)
6. [Shadows & Elevation](#shadows--elevation)
7. [Components](#components)
8. [Layout Patterns](#layout-patterns)
9. [Responsive Design](#responsive-design)
10. [Accessibility](#accessibility)

## Brand Identity

### Logo
- Primary logo: "SignR" displayed in the primary color
- Tagline: "Truth, Trust & Ownership"

## Color Palette

### Primary Colors
- Primary: `#0066cc` / `#1a2b5a` (CSS variables use the darker shade)
- Primary Light: `#3385d6` / `#152348`
- Background: `#f8f9fa` / `#1a2b5a` (CSS variables use the darker shade)

### Secondary Colors
- Secondary: `#6c757d` / `#64748b`
- Secondary Light: `#868e96` / `#475569`

### Accent Colors
- Accent: `#28a745` / `#5a8eff` (CSS variables use the blue shade)
- Accent Light: `#34ce57`

### Feedback Colors
- Success: `#10b981`
- Error: `#dc3545` / `#ef4444`

### Neutral Colors
- Text: `#212529` / `#1a2b5a`
- Light Text: `#6c757d` / `#64748b`
- Border: `#dee2e6` / `#e2e8f0`
- Card Background: `#ffffff`

### CSS Variables
```css
:root {
    --primary-color: #1a2b5a;
    --primary-hover: #152348;
    --secondary-color: #64748b;
    --secondary-hover: #475569;
    --accent-color: #5a8eff;
    --success-color: #10b981;
    --error-color: #ef4444;
    --text-color: #1a2b5a;
    --light-text: #64748b;
    --border-color: #e2e8f0;
    --background-color: #1a2b5a;
    --card-background: #ffffff;
}
```

## Typography

### Font Families
- Body: `'Segoe UI', 'Arial', sans-serif`
- Headings: `'Segoe UI', 'Arial', sans-serif`

### Font Sizes
- Small: `0.875rem` (14px)
- Medium: `1rem` (16px)
- Large: `1.25rem` (20px)
- XLarge: `1.5rem` (24px)
- XXLarge: `32px`

### Heading Sizes
- H1: `2rem` (32px)
- H2: `1.5rem` (24px)
- H3: `1.25rem` (20px)

### Font Weights
- Regular: `400`
- Medium: `500`
- Bold: `600` or `700`

### Line Heights
- Default: `1.6`

## Spacing

### Scale
- XS: `0.25rem` (4px)
- SM: `0.5rem` (8px)
- MD: `1rem` (16px)
- LG: `1.5rem` (24px)
- XL: `2rem` (32px)

### Usage
- Margins between components: MD to XL
- Padding within components: SM to LG
- Spacing between related elements: XS to MD
- Section spacing: LG to XL

## Borders & Radius

### Border Widths
- Default: `1px`
- Emphasized: `2px`
- Focus: `2px`

### Border Radius
- Small: `4px` (buttons, inputs, small elements)
- Medium: `8px` (cards, containers)
- Large: `12px` (modal dialogs, larger containers)
- Circle: `50%` (avatars, circular buttons)

## Shadows & Elevation

### Shadow Levels
- Small: `0 2px 5px rgba(0, 0, 0, 0.1)` (subtle elevation, buttons)
- Medium: `0 4px 8px rgba(0, 0, 0, 0.1)` (cards, containers)
- Large: `0 8px 16px rgba(0, 0, 0, 0.1)` (modals, dropdowns)

### Focus Shadows
- Focus Ring: `0 0 0 3px rgba(26, 43, 90, 0.1)` (for focused elements)

## Components

### Buttons

#### Base Button
- Padding: `0.75rem 1.5rem`
- Border Radius: `4px`
- Font Size: `1rem`
- Font Weight: `500`
- Min Width: `120px`
- Transition: `background-color 0.2s, transform 0.1s, box-shadow 0.2s`
- Box Shadow: `0 2px 4px rgba(0, 0, 0, 0.1)`
- White Space: `nowrap`

#### Button Variants
- Primary:
  - Background: `var(--primary-color)`
  - Color: `white`
  - Hover: `var(--primary-hover)`

- Secondary:
  - Background: `var(--secondary-color)`
  - Color: `white`
  - Hover: `var(--secondary-hover)`

- Accent:
  - Background: `var(--accent-color)`
  - Color: `white`
  - Hover: Opacity `0.9`

#### Button States
- Hover:
  - Transform: `translateY(-1px)`
  - Box Shadow: `0 4px 8px rgba(0, 0, 0, 0.1)`

- Active:
  - Transform: `translateY(0)`
  - Box Shadow: `0 1px 2px rgba(0, 0, 0, 0.1)`

- Disabled:
  - Background: `var(--border-color)`
  - Color: `var(--light-text)`
  - Cursor: `not-allowed`
  - No hover effects

### Form Elements

#### Input Fields
- Width: `100%`
- Padding: `0.75rem`
- Border: `1px solid var(--border-color)`
- Border Radius: `4px`
- Font Size: `1rem`
- Transition: `border-color 0.2s, box-shadow 0.2s`

#### Input Focus State
- Outline: `none`
- Border Color: `var(--primary-color)`
- Box Shadow: `0 0 0 3px rgba(26, 43, 90, 0.1)`

#### Form Groups
- Margin Bottom: `1.5rem`

#### Labels
- Display: `block`
- Margin Bottom: `0.5rem`
- Font Weight: `500`
- Color: `var(--text-color)`

#### Checkboxes
- Display: `flex`
- Align Items: `center`
- Margin Right (input): `0.5rem`

#### Static Fields
- Padding: `0.75rem`
- Background: `rgba(26, 43, 90, 0.05)`
- Border: `1px solid var(--border-color)`
- Border Radius: `4px`
- Color: `var(--text-color)`

### Cards & Containers

#### Main Container
- Max Width: `800px` to `1200px`
- Margin: `0 auto`
- Padding: `1.5rem` to `2rem`

#### Card
- Background: `white`
- Border Radius: `8px`
- Box Shadow: `0 4px 12px rgba(0, 0, 0, 0.1)`
- Padding: `1.5rem` to `2rem`

#### Form Section
- Background: `var(--card-background)`
- Border Radius: `0.5rem`
- Padding: `1.5rem`
- Margin Bottom: `1.5rem`
- Box Shadow: `0 1px 3px rgba(0, 0, 0, 0.1)`

### Navigation

#### Form Navigation
- Display: `flex`
- Justify Content: `space-between`
- Margin Top: `2rem`
- Padding Top: `1rem`
- Border Top: `1px solid var(--border-color)`

#### Previous Button
- Background: `white`
- Border: `2px solid var(--border-color)`
- Color: `var(--text-color)`
- Hover: Background `var(--background-color)`, Border `var(--primary-color)`, Color `var(--primary-color)`

#### Next Button
- Background: `var(--primary-color)`
- Border: `2px solid var(--primary-color)`
- Color: `white`
- Hover: Background `var(--primary-hover)`, Border `var(--primary-hover)`

### Progress Indicators

#### Step Indicator
- Display: `flex`
- Align Items: `center`
- Justify Content: `center`
- Padding: `1.5rem`
- Background: `white`
- Border Radius: `8px`
- Box Shadow: `0 2px 5px rgba(0, 0, 0, 0.1)`
- Max Width: `600px`
- Margin: `0 auto`

#### Step Number
- Width/Height: `40px`
- Border Radius: `50%`
- Background: `var(--primary-color)`
- Color: `white`
- Font Weight: `bold`
- Font Size: `1.25rem`
- Box Shadow: `0 2px 4px rgba(0, 102, 204, 0.2)`

#### Progress Bar
- Height: `8px`
- Background: `var(--border-color)`
- Border Radius: `4px`
- Margin: `1rem 0`

#### Progress Bar Fill
- Height: `100%`
- Background: `var(--primary-color)`
- Transition: `width 0.3s ease`

### Timeline Visualization

#### Timeline Container
- Position: `relative`
- Height: `100px`
- Margin: `1.5rem 0`

#### Timeline Ruler
- Position: `absolute`
- Height: `4px`
- Background: `rgba(26, 43, 90, 0.1)`
- Border Radius: `2px`

#### Timeline Segment
- Position: `absolute`
- Border Radius: `4px`
- Cursor: `pointer`
- Transition: `all 0.2s ease`
- Hover: Transform `translateY(-2px)`

#### Timeline Segment Types
- Residence: Background `var(--primary-color)`
- Gap: Background `rgba(220, 53, 69, 0.2)`, Border `1px dashed rgba(220, 53, 69, 0.5)`

#### Timeline Tooltip
- Position: `absolute`
- Background: `rgba(0, 0, 0, 0.8)`
- Color: `white`
- Padding: `4px 8px`
- Border Radius: `4px`
- Font Size: `12px`
- White Space: `nowrap`
- Opacity: `0` (default), `1` (hover)
- Transition: `opacity 0.2s`

### Validation Messages

#### Error Message
- Color: `var(--error-color)`
- Font Size: `0.875rem`
- Margin Top: `0.25rem`

#### Success Message
- Color: `var(--success-color)`

## Layout Patterns

### Page Structure
- Container with max-width
- Header with logo and language switcher
- Step indicator
- Main content area
- Form navigation at bottom

### Header
- Display: `flex`
- Flex Direction: `column`
- Gap: `1.5rem`
- Margin Bottom: `2rem`
- Padding Bottom: `1.5rem`

### Top Bar
- Display: `flex`
- Justify Content: `space-between`
- Align Items: `center`

### Logo Container
- Display: `flex`
- Align Items: `center`
- Gap: `0.5rem`

### Main Content
- Background: `white`
- Border Radius: `8px`
- Box Shadow: Medium
- Padding: `2rem`
- Max Width: `800px`
- Margin: `0 auto`

### Form Layout
- Single column for most forms
- Two columns for date inputs and some related fields
- Clear section grouping with headings

## Responsive Design

### Breakpoints
- Mobile: `576px`
- Tablet: `768px`
- Desktop: `992px`
- Widescreen: `1200px`

### Mobile Adjustments (< 768px)
- Container: Reduced padding (`15px`), margin (`10px`), width (`calc(100% - 20px)`)
- Header: Column layout, centered
- Form Section: Reduced padding (`1rem`)
- Form Navigation: Column layout, full-width buttons
- Timeline: Increased height (`120px`)
- Buttons: Reduced padding (`0.75rem 1rem`), smaller font (`0.95rem`)

### Small Mobile Adjustments (< 480px)
- Font Size: Reduced base size (`0.95rem`)
- Headings: Smaller sizes (H1: `1.75rem`, H2: `1.35rem`, H3: `1.15rem`)
- Container: Minimal padding (`10px`)
- Form Section: Minimal padding (`0.75rem`)
- Logo: Smaller size (`50px`)

## Accessibility

### Focus Styles
- Outline: `2px solid #4d90fe`
- Outline Offset: `2px`

### Screen Reader Support
- `.sr-only` class for screen-reader-only content
- Skip links for keyboard navigation

### High Contrast Mode Support
- Forced-colors media query
- Border fallbacks for buttons

### Keyboard Navigation
- Tab focus for all interactive elements
- Skip link to bypass navigation

### ARIA Attributes
- Used for progress bars and interactive elements
- Role attributes for non-standard controls

### Color Contrast
- Text colors meet WCAG AA standards against their backgrounds
- Interactive elements have sufficient contrast