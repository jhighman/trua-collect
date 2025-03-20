import React, { useMemo } from 'react';
import { useTranslation } from '../context/TranslationContext';

interface TimelineEntry {
  startDate: string; // ISO date string
  endDate: string | null; // ISO date string or null for current
  id?: string | number; // Optional identifier for the entry
  [key: string]: any; // Additional entry properties
}

interface TimelineProps {
  entries: TimelineEntry[];
  type: 'residence' | 'employment';
  requiredYears: number;
  onEntryClick: (entry: TimelineEntry) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  entries,
  type,
  requiredYears,
  onEntryClick
}) => {
  const { t, language } = useTranslation();

  // Don't render if no entries
  if (entries.length === 0) {
    return null;
  }

  // Calculate timeline span and positioning
  const timelineData = useMemo(() => {
    // Sort entries by start date
    const sortedEntries = [...entries].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // Find earliest and latest dates
    let earliestDate = new Date(sortedEntries[0].startDate);
    let latestDate = new Date();

    sortedEntries.forEach(entry => {
      const startDate = new Date(entry.startDate);
      const endDate = entry.endDate ? new Date(entry.endDate) : new Date();
      
      if (startDate < earliestDate) {
        earliestDate = startDate;
      }
      
      if (endDate > latestDate) {
        latestDate = endDate;
      }
    });

    // Ensure we have at least requiredYears of span
    const minEndDate = new Date(earliestDate);
    minEndDate.setFullYear(minEndDate.getFullYear() + requiredYears);
    
    if (minEndDate > latestDate) {
      latestDate = minEndDate;
    }

    // Calculate total timespan in milliseconds
    const totalTimespan = latestDate.getTime() - earliestDate.getTime();

    // Calculate segments
    const segments = sortedEntries.map(entry => {
      const startDate = new Date(entry.startDate);
      const endDate = entry.endDate ? new Date(entry.endDate) : new Date();
      
      const startOffset = ((startDate.getTime() - earliestDate.getTime()) / totalTimespan) * 100;
      const width = ((endDate.getTime() - startDate.getTime()) / totalTimespan) * 100;
      
      // Format dates for tooltip
      const formattedStartDate = startDate.toLocaleDateString(language, { year: 'numeric', month: 'short' });
      const formattedEndDate = entry.endDate
        ? new Date(entry.endDate).toLocaleDateString(language, { year: 'numeric', month: 'short' })
        : t('common.present') || 'Present';
      
      return {
        ...entry,
        startOffset,
        width,
        tooltip: `${formattedStartDate} - ${formattedEndDate}`
      };
    });

    // Generate year markers
    const yearMarkers = [];
    const startYear = earliestDate.getFullYear();
    const endYear = latestDate.getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
      const yearDate = new Date(year, 0, 1); // January 1st of the year
      if (yearDate >= earliestDate && yearDate <= latestDate) {
        const offset = ((yearDate.getTime() - earliestDate.getTime()) / totalTimespan) * 100;
        yearMarkers.push({ year, offset });
      }
    }

    // Calculate years accounted for (handling overlaps)
    let yearsAccounted = 0;
    
    // Create a sorted array of all date events (start or end)
    const dateEvents: Array<{ date: Date; isStart: boolean }> = [];
    
    sortedEntries.forEach(entry => {
      dateEvents.push({ date: new Date(entry.startDate), isStart: true });
      dateEvents.push({ 
        date: entry.endDate ? new Date(entry.endDate) : new Date(), 
        isStart: false 
      });
    });
    
    // Sort date events chronologically
    dateEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    // Process events to calculate covered time
    let activeEntries = 0;
    let lastEventDate: Date | null = null;
    
    dateEvents.forEach(event => {
      if (lastEventDate && activeEntries > 0) {
        // Calculate time between this event and the last one
        const timeDiff = event.date.getTime() - lastEventDate.getTime();
        yearsAccounted += timeDiff / (1000 * 60 * 60 * 24 * 365.25);
      }
      
      // Update active entries count
      activeEntries += event.isStart ? 1 : -1;
      lastEventDate = event.date;
    });

    return {
      segments,
      yearMarkers,
      yearsAccounted: parseFloat(yearsAccounted.toFixed(1)),
      earliestDate,
      latestDate
    };
  }, [entries, requiredYears, language, t]);

  // Find gaps in the timeline
  const gaps = useMemo(() => {
    if (timelineData.segments.length <= 1) return [];
    
    const sortedSegments = [...timelineData.segments].sort((a, b) => a.startOffset - b.startOffset);
    const gapSegments = [];
    
    for (let i = 0; i < sortedSegments.length - 1; i++) {
      const currentSegment = sortedSegments[i];
      const nextSegment = sortedSegments[i + 1];
      
      const currentEnd = currentSegment.startOffset + currentSegment.width;
      const nextStart = nextSegment.startOffset;
      
      if (nextStart > currentEnd + 0.5) { // Add a small threshold to avoid rounding errors
        const gapWidth = nextStart - currentEnd;
        
        gapSegments.push({
          startOffset: currentEnd,
          width: gapWidth,
          isGap: true
        });
      }
    }
    
    return gapSegments;
  }, [timelineData.segments]);

  return (
    <div className="timeline-visualization">
      {/* Time accounted indicator */}
      <div className="time-accounted" role="region" aria-label={t('timeline.progress_label', { required: requiredYears.toString() })}>
        <div className="progress">
          <div 
            className="progress-bar"
            style={{ width: `${Math.min(100, (timelineData.yearsAccounted / requiredYears) * 100)}%` }}
            role="progressbar"
            aria-valuenow={timelineData.yearsAccounted}
            aria-valuemin={0}
            aria-valuemax={requiredYears}
          />
        </div>
        <div className="time-text">
          {t('timeline.progress', {
            current: timelineData.yearsAccounted.toString(),
            required: requiredYears.toString()
          })}
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="timeline-container">
        <div className="timeline-ruler" />
        
        {/* Segments */}
        <div id="timeline-segments">
          {timelineData.segments.map((segment, index) => (
            <div
              key={`segment-${index}`}
              className={`timeline-segment ${type}`}
              style={{
                left: `${segment.startOffset}%`,
                width: `${segment.width}%`
              }}
              onClick={() => onEntryClick(segment)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onEntryClick(segment);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={segment.tooltip}
            >
              <span className="timeline-segment-tooltip">
                {segment.tooltip}
              </span>
            </div>
          ))}
          
          {/* Gap segments */}
          {gaps.map((gap, index) => (
            <div
              key={`gap-${index}`}
              className="timeline-segment gap"
              style={{
                left: `${gap.startOffset}%`,
                width: `${gap.width}%`
              }}
              aria-label={t('timeline.gap_description', {
                percentage: gap.width.toFixed(1)
              }) || `Gap in history (${gap.width.toFixed(1)}% of timeline)`}
            />
          ))}
        </div>
        
        {/* Year markers */}
        <div className="timeline-labels">
          {timelineData.yearMarkers.map(({ year, offset }) => (
            <React.Fragment key={`year-${year}`}>
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
};

export default Timeline;