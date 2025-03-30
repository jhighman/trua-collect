# Trua Collect CSS Style Guide


This document outlines the CSS organization and styling guidelines for the Trua Collect application.


## CSS Organization


The CSS in this project is organized in a centralized, hierarchical structure to ensure consistency and maintainability:


### 1. CSS Variables (`variables.css`)


Contains all design tokens as CSS variables:
- Colors
- Typography
- Spacing
- Borders & Radius
- Shadows
- Transitions


These variables should be used throughout the application instead of hardcoded values.


### 2. Common Styles (`common.css`)


Contains reusable component styles that are used across multiple components:
- Form elements
- Buttons
- Headers and sections
- Status messages
- Navigation
- Responsive adjustments


### 3. Base Styles (`index.css`)


Contains:
- Tailwind imports
- Imports for variables.css and common.css
- Base element styles (body, #root)
- App container styles
- Responsive adjustments


### 4. Component-Specific Styles (`components/*.css`)


Each component can have its own CSS file for styles that are specific to that component. These files should:
- Use the CSS variables defined in variables.css
- Leverage the common styles from common.css
- Only include styles that are unique to that component


### 5. Tailwind Configuration (`tailwind.config.js`)


The Tailwind configuration extends the default theme with our custom design tokens, allowing us to use Tailwind classes with our custom design system.


## Styling Guidelines


### Using CSS Variables


Always use CSS variables for design tokens instead of hardcoded values:


```css
/* ❌ Don't do this */
.element {
 color: #1a2b5a;
 margin-bottom: 1rem;
}


/* ✅ Do this instead */
.element {
 color: var(--primary-color);
 margin-bottom: var(--spacing-md);
}
```


### Using Tailwind Classes


For simple styling needs, prefer Tailwind utility classes in your JSX:


```jsx
// ❌ Don't do this
<div className="custom-container">...</div>


// ✅ Do this instead
<div className="flex flex-col gap-4 p-4 bg-white rounded-md shadow-md">...</div>
```


### Component-Specific Styles


When you need component-specific styles that can't be achieved with Tailwind:


1. Create a CSS file with the same name as your component
2. Import it in your component file
3. Use CSS variables and common styles
4. Only include styles that are unique to that component


```css
/* ComponentName.css */
.component-name {
 /* Component-specific styles using CSS variables */
 display: grid;
 grid-template-columns: 1fr 2fr;
 gap: var(--spacing-md);
}
```


### Responsive Design


- Use the responsive breakpoints defined in the common styles
- Test your components at different screen sizes
- Use Tailwind's responsive prefixes when possible (`sm:`, `md:`, `lg:`)


### Adding New Design Tokens


If you need to add new design tokens:


1. Add them to `variables.css` as CSS variables
2. Add them to the Tailwind configuration in `tailwind.config.js`
3. Document them in this README


## Color Palette


The color palette is based on the Trua design system:


- **Primary**: `#1a2b5a` (dark blue)
- **Secondary**: `#64748b` (slate)
- **Accent**: `#5a8eff` (bright blue)
- **Success**: `#10b981` (green)
- **Error**: `#ef4444` (red)


## Typography


- **Font Family**: 'Segoe UI', 'Arial', sans-serif
- **Base Font Size**: 16px (1rem)
- **Line Height**: 1.6


## Maintaining Consistency


To maintain consistency across the application:


1. Always use the centralized CSS variables
2. Follow the component styling patterns established in this guide
3. When adding new components, reference existing ones for styling patterns
4. Update this documentation when making significant changes to the styling system

