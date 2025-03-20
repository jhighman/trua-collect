import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Timeline from './Timeline';
import { TranslationProvider } from '../context/TranslationContext';

// Mock the translation context
jest.mock('../context/TranslationContext', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string>) => {
      if (key === 'timeline.progress' && params) {
        return `${params.current} / ${params.required} years`;
      }
      if (key === 'common.present') return 'Present';
      return key;
    },
    language: 'en'
  }),
  TranslationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

describe('Timeline Component', () => {
  const mockEntries = [
    {
      startDate: '2020-01-01',
      endDate: '2021-06-30',
      id: '1',
      address: '123 Main St'
    },
    {
      startDate: '2021-07-01',
      endDate: null,
      id: '2',
      address: '456 Oak Ave'
    }
  ];

  const mockOnEntryClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders timeline with correct number of segments', () => {
    render(
      <Timeline
        entries={mockEntries}
        type="residence"
        requiredYears={7}
        onEntryClick={mockOnEntryClick}
      />
    );

    // Should have 2 segments (one for each entry)
    const segments = document.querySelectorAll('.timeline-segment.residence');
    expect(segments.length).toBe(2);
  });

  test('renders year markers', () => {
    render(
      <Timeline
        entries={mockEntries}
        type="residence"
        requiredYears={7}
        onEntryClick={mockOnEntryClick}
      />
    );

    // Should have year markers
    const yearMarkers = document.querySelectorAll('.year-marker');
    expect(yearMarkers.length).toBeGreaterThan(0);
  });

  test('calls onEntryClick when segment is clicked', () => {
    render(
      <Timeline
        entries={mockEntries}
        type="residence"
        requiredYears={7}
        onEntryClick={mockOnEntryClick}
      />
    );

    const segments = document.querySelectorAll('.timeline-segment.residence');
    fireEvent.click(segments[0]);

    expect(mockOnEntryClick).toHaveBeenCalledTimes(1);
    expect(mockOnEntryClick).toHaveBeenCalledWith(expect.objectContaining({
      id: '1',
      startDate: '2020-01-01',
      endDate: '2021-06-30'
    }));
  });

  test('renders progress indicator with correct percentage', () => {
    render(
      <Timeline
        entries={mockEntries}
        type="residence"
        requiredYears={7}
        onEntryClick={mockOnEntryClick}
      />
    );

    const progressBar = document.querySelector('.progress-bar');
    expect(progressBar).toBeInTheDocument();
  });

  test('does not render when entries array is empty', () => {
    const { container } = render(
      <Timeline
        entries={[]}
        type="residence"
        requiredYears={7}
        onEntryClick={mockOnEntryClick}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  test('renders employment type segments with correct class', () => {
    render(
      <Timeline
        entries={mockEntries}
        type="employment"
        requiredYears={7}
        onEntryClick={mockOnEntryClick}
      />
    );

    const segments = document.querySelectorAll('.timeline-segment.employment');
    expect(segments.length).toBe(2);
  });

  test('handles keyboard navigation', () => {
    render(
      <Timeline
        entries={mockEntries}
        type="residence"
        requiredYears={7}
        onEntryClick={mockOnEntryClick}
      />
    );

    const segments = document.querySelectorAll('.timeline-segment.residence');
    const firstSegment = segments[0] as HTMLElement;
    
    // Test Enter key
    fireEvent.keyDown(firstSegment, { key: 'Enter' });
    expect(mockOnEntryClick).toHaveBeenCalledTimes(1);
    
    // Test Space key
    fireEvent.keyDown(firstSegment, { key: ' ' });
    expect(mockOnEntryClick).toHaveBeenCalledTimes(2);
  });
});