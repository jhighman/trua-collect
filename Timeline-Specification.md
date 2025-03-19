# Timeline Component Specification

## Overview

The Timeline component is a critical visualization tool in the SignR application that displays chronological data (residence or employment history) in an interactive, visual format. It helps users understand gaps in their history and ensures they've accounted for the required time period.

## Visual Design

### Layout & Dimensions

- **Container Height**: 100px (desktop), 120px (mobile)
- **Timeline Ruler**: 4px height, positioned horizontally across the center
- **Timeline Ruler Color**: rgba(26, 43, 90, 0.1) - semi-transparent primary color
- **Timeline Ruler Border Radius**: 2px
- **Segment Height**: 24px
- **Segment Border Radius**: 4px
- **Year Markers**: 10px height, 1px width, positioned vertically along the timeline

### Colors

- **Residence Segments**: var(--primary-color) (#1a2b5a)
- **Employment Segments**: var(--primary-color) (#1a2b5a)
- **Gap Segments**: rgba(220, 53, 69, 0.2) with 1px dashed rgba(220, 53, 69, 0.5) border
- **Year Markers**: rgba(26, 43, 90, 0.2) - semi-transparent primary color
- **Tooltip Background**: rgba(0, 0, 0, 0.8) - semi-transparent black
- **Tooltip Text**: white

### Typography

- **Year Labels**: 10px font size, var(--text-color)
- **Tooltip Text**: 12px font size, white, no-wrap
- **Time Accounted Text**: Default body font, var(--text-color)

### Progress Indicator

- **Progress Bar Height**: Standard progress bar height (8px)
- **Progress Bar Background**: var(--border-color)
- **Progress Bar Fill**: var(--primary-color)
- **Progress Bar Border Radius**: 4px

## Interaction Design

### Hover States

- **Segment Hover**:
  - Transform: translateY(-2px) - slight upward movement
  - Tooltip visibility: Visible (opacity 1)
  - Transition: all 0.2s ease

### Click Behavior

- **Segment Click**: Opens the edit form for the corresponding entry
- **Cursor**: pointer on segments

### Tooltips

- **Content**: Date range in format "MMM yyyy - MMM yyyy" (e.g., "Jan 2020 - Mar 2023")
- **Position**: Centered above the segment
- **Appearance**: Only visible on hover
- **Transition**: opacity 0.2s

## Technical Implementation

### Data Structure

The Timeline component accepts the following props:

```jsx
Timeline.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      startDate: PropTypes.string.isRequired, // ISO date string
      endDate: PropTypes.string,              // ISO date string or null for current
      // Additional entry properties
    })
  ).isRequired,
  type: PropTypes.oneOf(['residence', 'employment']).isRequired,
  requiredYears: PropTypes.number.isRequired,
  onEntryClick: PropTypes.func.isRequired,
};
```

### Calculations

1. **Timeline Span**:
   - Sort entries by start date
   - Find earliest and latest dates
   - Calculate total span in years

2. **Segment Positioning**:
   - For each entry, calculate:
     - startOffset: (entryStartDate - earliestDate) / totalTimespan * 100
     - width: (entryEndDate - entryStartDate) / totalTimespan * 100

3. **Years Accounted**:
   - Calculate total years covered, accounting for overlaps
   - Round to one decimal place

4. **Year Markers**:
   - Generate markers for each year between earliest and latest dates
   - Calculate position as percentage of total timespan

### Rendering Logic

```jsx
// Pseudocode for rendering
if (entries.length === 0) {
  return null; // Don't render if no entries
}

return (
  <div className="timeline-visualization">
    {/* Time accounted indicator */}
    <div className="time-accounted">
      <div className="progress">
        <div 
          className="progress-bar"
          style={{ width: `${(yearsAccounted / requiredYears) * 100}%` }}
          role="progressbar"
          aria-valuenow={yearsAccounted}
          aria-valuemin="0"
          aria-valuemax={requiredYears}
        />
      </div>
      <div className="time-text">
        {yearsAccounted} / {requiredYears} years accounted for
      </div>
    </div>

    {/* Timeline visualization */}
    <div className="timeline-container">
      <div className="timeline-ruler" />
      
      {/* Segments */}
      <div id="timeline-segments">
        {segments.map((segment, index) => (
          <div
            key={index}
            className={`timeline-segment ${type}`}
            style={{
              left: `${segment.startOffset}%`,
              width: `${segment.width}%`
            }}
            onClick={() => onEntryClick(segment)}
            role="button"
            tabIndex={0}
          >
            <span className="timeline-segment-tooltip">
              {segment.tooltip}
            </span>
          </div>
        ))}
      </div>
      
      {/* Year markers */}
      <div className="timeline-labels">
        {yearMarkers.map(({ year, offset }) => (
          <React.Fragment key={year}>
            <div
              className="year-marker"
              style={{ left: `${offset}%` }}
            />
            <div
              className="year-label"
              style={{ left: `${offset}%` }}
            >
              {year}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);
```

## Accessibility Considerations

### Keyboard Navigation

- **Focus Indicators**: Segments should have visible focus states
- **Keyboard Interaction**: Segments should be focusable and activatable with Enter/Space

### Screen Reader Support

- **ARIA Roles**:
  - Segments use `role="button"`
  - Progress bar uses `role="progressbar"`
  - Appropriate `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` attributes

### Color Contrast

- Year labels should have sufficient contrast against the background
- Tooltip text (white) should have sufficient contrast against the tooltip background (rgba(0, 0, 0, 0.8))

## Responsive Behavior

### Mobile Adjustments (< 768px)

- **Container Height**: Increased to 120px
- **Timeline Labels**: Positioned at top: 90px
- **Touch Targets**: Ensure segments are large enough for touch interaction

### Small Mobile Adjustments (< 480px)

- **Font Sizes**: May need adjustment for very small screens
- **Touch Precision**: Consider increasing the hit area for segments

## Edge Cases

### Empty State

- If no entries exist, the component should not render
- The parent component should handle displaying appropriate messaging

### Single Entry

- With only one entry, the timeline should still render correctly
- The segment should take appropriate width based on the date range

### Current Date Handling

- If an entry has no end date, use the current date as the end date
- This allows for "present" or "current" positions/residences

### Overlapping Entries

- The time accounted calculation should handle overlapping date ranges
- Only count the actual time covered, not double-counting overlaps

## Integration Guidelines

### Parent Component Responsibilities

- Provide sorted and validated entries
- Handle the onEntryClick callback to open the appropriate edit form
- Provide the required years value based on application requirements
- Specify the correct type ('residence' or 'employment')

### CSS Dependencies

The Timeline component relies on these CSS classes:

```css
.timeline-visualization {}
.time-accounted {}
.progress {}
.progress-bar {}
.time-text {}
.timeline-container {}
.timeline-ruler {}
.timeline-segment {}
.timeline-segment-tooltip {}
.year-marker {}
.year-label {}
```

## Usage Example

```jsx
import Timeline from '../components/Timeline';

function ResidenceHistoryStep() {
  const { residences } = useFormContext();
  const requiredYears = 7; // Based on application requirements
  
  const handleEntryClick = (entry) => {
    // Open edit form for this entry
    openEditForm(entry.id);
  };
  
  return (
    <div className="form-section">
      <h2>Residence History</h2>
      
      <Timeline 
        entries={residences}
        type="residence"
        requiredYears={requiredYears}
        onEntryClick={handleEntryClick}
      />
      
      {/* Rest of the form */}
    </div>
  );
}
```

## Performance Considerations

- The timeline calculations are wrapped in `useMemo` to prevent unnecessary recalculations
- Year markers are also memoized to optimize rendering
- For very large datasets, consider pagination or limiting the visible time range