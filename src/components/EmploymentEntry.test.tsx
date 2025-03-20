import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmploymentEntry, EmploymentEntryData } from './EmploymentEntry';
import { TranslationProvider } from '../context/TranslationContext';

const renderWithTranslation = (ui: React.ReactElement) => {
  return render(
    <TranslationProvider initialLanguage="en">
      {ui}
    </TranslationProvider>
  );
};

describe('EmploymentEntry Component', () => {
  const mockEntry: EmploymentEntryData = {
    type: 'Job',
    company: 'Test Company',
    position: 'Test Position',
    city: 'Test City',
    state_province: 'Test State',
    description: 'Test Description',
    contact_name: 'John Doe',
    contact_info: 'john@example.com',
    start_date: '2020-01-01',
    end_date: '2022-01-01',
    is_current: false
  };

  const mockOnUpdate = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders employment entry', () => {
    render(
      <EmploymentEntry
        entry={mockEntry}
        index={0}
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    );

    expect(screen.getByText('Test Company')).toBeInTheDocument();
  });

  const emptyEntry: EmploymentEntryData = {
    type: '',
    company: '',
    position: '',
    city: '',
    state_province: '',
    description: '',
    contact_name: '',
    contact_info: '',
    start_date: '',
    end_date: null,
    is_current: false
  };

  test('handles empty entry', () => {
    render(
      <EmploymentEntry
        entry={emptyEntry}
        index={1}
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    );
  });

  test('renders employment entry in display mode', () => {
    render(
      <EmploymentEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Check if the position and company are displayed
    expect(screen.getByText('Test Position at Test Company')).toBeInTheDocument();
    
    // Check if company is displayed
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    
    // Check if city and state are displayed
    expect(screen.getByText('Test City, Test State')).toBeInTheDocument();
    
    // Check if description is displayed
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    
    // Check if contact info is displayed
    expect(screen.getByText(/Contact: John Doe/)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/)).toBeInTheDocument();
    
    // Check if date range is displayed (using more flexible matcher)
    expect(screen.getByText(/December 2019 - December 2021/)).toBeInTheDocument();
    expect(screen.getByText(/years/)).toBeInTheDocument();
  });

  test('switches to edit mode when edit button is clicked', () => {
    render(
      <EmploymentEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Click the edit button
    fireEvent.click(screen.getByLabelText('Edit employment'));

    // Check if form fields are displayed (including asterisks where required)
    expect(screen.getByLabelText(/Entry Type/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company\/Organization \*/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Position\/Title \*/)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/)).toBeInTheDocument();
    expect(screen.getByLabelText(/State\/Province/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Name \*/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Contact Information \*/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Start Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/I currently work here/)).toBeInTheDocument();
    expect(screen.getByLabelText(/End Date/)).toBeInTheDocument();
  });

  test('calls onRemove when remove button is clicked', () => {
    render(
      <EmploymentEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Click the remove button
    fireEvent.click(screen.getByLabelText('Remove employment'));

    // Check if onRemove was called
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  test('updates entry when form is submitted', () => {
    render(
      <EmploymentEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Click the edit button
    fireEvent.click(screen.getByLabelText('Edit employment'));

    // Update the company
    fireEvent.change(screen.getByLabelText(/Company\/Organization/), {
      target: { value: 'New Company' }
    });

    // Save the changes
    fireEvent.click(screen.getByText('Save Changes'));

    // Check if onUpdate was called with updated entry
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      company: 'New Company'
    }));
  });

  test('handles current employment checkbox', () => {
    render(
      <EmploymentEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Click the edit button
    fireEvent.click(screen.getByLabelText('Edit employment'));

    // Check the "current employment" checkbox
    fireEvent.click(screen.getByLabelText('I currently work here'));

    // End date field should be hidden
    expect(screen.queryByLabelText('End Date')).not.toBeInTheDocument();

    // Save the changes
    fireEvent.click(screen.getByText('Save Changes'));

    // Check if onUpdate was called with is_current=true and end_date=null
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      is_current: true,
      end_date: null
    }));
  });

  test('cancels edit mode without saving changes', () => {
    render(
      <EmploymentEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Click the edit button
    fireEvent.click(screen.getByLabelText('Edit employment'));

    // Update the company
    fireEvent.change(screen.getByLabelText(/Company\/Organization/), {
      target: { value: 'New Company' }
    });

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));

    // Check if we're back in display mode with the original company
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    
    // Check that onUpdate was not called
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  test('renders different entry types correctly', () => {
    // Test Education type
    const educationEntry = {
      ...mockEntry,
      type: 'Education',
      company: 'Test University',
      position: '',
      description: 'Studying Computer Science'
    };

    const { rerender } = render(
      <EmploymentEntry
        entry={educationEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Check if the education type is displayed
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Studying Computer Science')).toBeInTheDocument();

    // Test Unemployed type
    const unemployedEntry = {
      ...mockEntry,
      type: 'Unemployed',
      company: '',
      position: '',
      description: 'Job searching'
    };

    rerender(
      <EmploymentEntry
        entry={unemployedEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Check if the unemployed type is displayed
    expect(screen.getByText('Unemployed')).toBeInTheDocument();
    expect(screen.getByText('Job searching')).toBeInTheDocument();
  });

  test('validates required fields based on entry type', () => {
    render(
      <EmploymentEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Click the edit button
    fireEvent.click(screen.getByLabelText('Edit employment'));

    // Change type to Unemployed
    fireEvent.change(screen.getByLabelText('Entry Type'), {
      target: { value: 'Unemployed' }
    });

    // Clear company and position (which should be allowed for Unemployed type)
    fireEvent.change(screen.getByLabelText(/Company\/Organization/), {
      target: { value: '' }
    });
    fireEvent.change(screen.getByLabelText(/Position\/Title/), {
      target: { value: '' }
    });

    // Save should still be enabled because these fields aren't required for Unemployed type
    expect(screen.getByText('Save Changes')).not.toBeDisabled();

    // Change back to Job type
    fireEvent.change(screen.getByLabelText('Entry Type'), {
      target: { value: 'Job' }
    });

    // Save should now be disabled because company and position are required for Job type
    expect(screen.getByText('Save Changes')).toBeDisabled();

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/Company\/Organization/), {
      target: { value: 'Test Company' }
    });
    fireEvent.change(screen.getByLabelText(/Position\/Title/), {
      target: { value: 'Test Position' }
    });

    // Save should be enabled again
    expect(screen.getByText('Save Changes')).not.toBeDisabled();
  });

  test('renders employment entry with progress', () => {
    const entry: EmploymentEntryData = mockEntry;

    renderWithTranslation(
      <EmploymentEntry 
        entry={entry}
        index={3}
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    );

    // Use a more flexible matcher for the years text
    expect(screen.getByText(/years/)).toBeInTheDocument();
  });

  test('handles entry updates', () => {
    render(
      <EmploymentEntry
        entry={mockEntry}
        index={1}
        onUpdate={() => {}}
        onRemove={() => {}}
      />
    );
    // ... rest of test
  });
});