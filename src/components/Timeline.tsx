import React, { useMemo } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { AlertTriangle } from 'lucide-react';

interface TimelineEntry {
  startDate: string; // ISO date string
  endDate: string | null; // ISO date string or null for current
  id?: string | number; // Optional identifier for the entry
  type?: string;
  company?: string;
  position?: string;
  city?: string;
  state_province?: string;
  description?: string;
  contact_name?: string;
  contact_info?: string;
  is_current?: boolean;
  duration_years?: number;
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

  // Calculate timeline span and positioning
  const timelineData = useMemo(() => {
    if (entries.length === 0) {
      return {
        segments: [],
        yearMarkers: [],
        yearsAccounted: 0,
        earliestDate: new Date(),
        latestDate: new Date()
      };
    }

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
    const yearsAccounted = sortedEntries.reduce((sum, entry) => {
      return sum + (entry.duration_years || 0);
    }, 0);

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
    if (timelineData.segments.length <= 1) {
      return [];
    }
    
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

  // Render a placeholder if no entries
  if (entries.length === 0) {
    return (
      <div className="timeline-visualization">
        <div className="time-accounted" role="region" aria-label={t('timeline.progress_label', { required: requiredYears.toString() })}>
          <div className="progress">
            <div
              className="progress-bar"
              style={{ width: '0%' }}
              role="progressbar"
              aria-valuenow={0}
              aria-valuemin={0}
              aria-valuemax={requiredYears}
            />
          </div>
          <div className="time-text">
            {t('timeline.progress', {
              current: '0',
              required: requiredYears.toString()
            })}
            <div className="validation-message">
              <AlertTriangle />
              {t('timeline.validation_message', {
                remaining: requiredYears.toString()
              })}
            </div>
          </div>
        </div>
        <div className="timeline-container">
          <div className="timeline-ruler" />
          <div className="timeline-labels">
            <div className="year-label" style={{ left: '50%' }}>
              {new Date().getFullYear()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-visualization">
      {/* Time accounted indicator */}
      <div className="time-accounted" role="region" aria-label={t('timeline.progress_label', { required: requiredYears.toString() })}>
        <div className="progress">
          <div 
            className={`progress-bar ${timelineData.yearsAccounted >= requiredYears ? 'complete' : ''}`}
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
          {timelineData.yearsAccounted < requiredYears && (
            <div className="validation-message">
              <AlertTriangle />
              {t('timeline.validation_message', {
                remaining: (requiredYears - timelineData.yearsAccounted).toFixed(1)
              })}
            </div>
          )}
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