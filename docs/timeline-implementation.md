# Timeline Component Implementation

This document outlines the implementation of the Timeline component, which provides a visual representation of chronological data (residence or employment history) in the Trua Collect application.

## Overview

The Timeline component is a critical visualization tool that displays chronological data in an interactive, visual format. It helps users understand gaps in their history and ensures they've accounted for the required time period.

## Implementation Details

### Component Structure

The Timeline component has been implemented as a reusable React component with the following key features:

1. **Visual Timeline**: Displays entries as segments on a horizontal timeline
2. **Progress Indicator**: Shows progress toward the required years of history
3. **Gap Detection**: Automatically identifies and highlights gaps in the timeline
4. **Interactive Segments**: Clickable segments that open the corresponding entry for editing
5. **Tooltips**: Hover tooltips showing date ranges for each segment
6. **Year Markers**: Visual indicators for each year in the timeline span
7. **Accessibility Support**: Keyboard navigation and ARIA attributes

### Files Created/Modified

- `src/components/Timeline.tsx`: Main component implementation
- `src/components/Timeline.css`: Styling for the Timeline component
- `src/components/Timeline.test.tsx`: Unit tests for the Timeline component
- `src/components/ResidenceHistoryStep.tsx`: Updated to use the Timeline component
- `src/components/EmploymentHistoryStep.tsx`: Updated to use the Timeline component
- `src/utils/translations.ts`: Added translations for Timeline-related text

### Component API

The Timeline component accepts the following props:

```typescript
interface TimelineProps {
  entries: TimelineEntry[];
  type: 'residence' | 'employment';
  requiredYears: number;
  onEntryClick: (entry: TimelineEntry) => void;
}

interface TimelineEntry {
  startDate: string; // ISO date string
  endDate: string | null; // ISO date string or null for current
  id?: string | number; // Optional identifier for the entry
  [key: string]: any; // Additional entry properties
}
```

### Key Algorithms

1. **Timeline Span Calculation**:
   - Sort entries by start date
   - Find earliest and latest dates
   - Calculate total span in years
   - Ensure the span covers at least the required years

2. **Segment Positioning**:
   - For each entry, calculate:
     - startOffset: (entryStartDate - earliestDate) / totalTimespan * 100
     - width: (entryEndDate - entryStartDate) / totalTimespan * 100

3. **Years Accounted Calculation**:
   - Create a sorted array of all date events (start or end)
   - Process events chronologically to calculate covered time
   - Account for overlapping periods to avoid double-counting

4. **Gap Detection**:
   - Sort segments by start offset
   - Identify gaps between consecutive segments
   - Create gap segments with appropriate styling

### Integration with Existing Components

The Timeline component has been integrated into both the ResidenceHistoryStep and EmploymentHistoryStep components:

1. **ResidenceHistoryStep Integration**:
   - Replaced the simple progress bar with the Timeline component
   - Mapped residence entries to the Timeline's entry format
   - Implemented click handling to open the edit form for the clicked entry

2. **EmploymentHistoryStep Integration**:
   - Similar integration as with ResidenceHistoryStep
   - Adapted for employment-specific data structure

### Styling

The Timeline component uses a dedicated CSS file with responsive design considerations:

- **Desktop**: Standard layout with 100px height
- **Mobile**: Adjusted layout with 120px height and repositioned labels
- **Small Mobile**: Further adjustments for very small screens

### Accessibility Features (Section 508 Compliance)

The Timeline component is designed to be fully Section 508 compliant with the following accessibility features:

1. **Keyboard Navigation**:
   - Segments can be focused and activated with keyboard (Tab, Enter, Space)
   - All interactive elements are reachable via keyboard

2. **ARIA Attributes**:
   - Appropriate ARIA roles: role="region", role="progressbar", role="button"
   - Descriptive aria-labels for non-visual description
   - aria-valuenow, aria-valuemin, and aria-valuemax for the progress bar

3. **Focus Indicators**:
   - Visible focus states with high-contrast outlines
   - No removal of focus indicators (outline: none avoided)

4. **Semantic HTML**:
   - Proper HTML structure for assistive technologies
   - Logical tab order

5. **Color and Contrast**:
   - Sufficient color contrast ratios (WCAG 2.1 AA compliant)
   - Information not conveyed by color alone (patterns used in addition to color)

6. **Text Size and Readability**:
   - Minimum font size of 12px for all text
   - Increased font weight for better readability

### Internationalization

The Timeline component supports internationalization through the TranslationContext:

- Added translation keys for all user-facing text
- Supports date formatting based on the current language
- Includes translations for all supported languages (English, Spanish, French, Italian)

## Testing

The Timeline component includes comprehensive unit tests covering:

1. Rendering with different types of entries
2. Interaction testing (clicks and keyboard navigation)
3. Progress calculation
4. Empty state handling
5. Segment and year marker rendering

## Future Enhancements

Potential future enhancements for the Timeline component:

1. **Zoom Functionality**: Allow users to zoom in/out on specific time periods
2. **Filtering**: Add ability to filter by entry type or date range
3. **Animation**: Add subtle animations for improved user experience
4. **Print Optimization**: Ensure the timeline renders well when printed
5. **Touch Gestures**: Add pinch-to-zoom and swipe gestures for mobile users

## Conclusion

The Timeline component provides a powerful visualization tool that enhances the user experience when entering chronological data. It helps users understand their progress toward meeting the required years of history and identifies gaps that need to be addressed.