import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResidenceEntry } from './ResidenceEntry';

describe('ResidenceEntry Component', () => {
  const mockEntry = {
    address: '123 Test St',
    city: 'Test City',
    state_province: 'Test State',
    zip_postal: '12345',
    country: 'Test Country',
    start_date: '2020-01-01',
    end_date: '2022-01-01',
    is_current: false,
    duration_years: 2
  };

  const mockOnUpdate = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders residence entry in display mode', () => {
    render(
      <ResidenceEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Check if the address is displayed
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    
    // Check if city, state, and zip are displayed
    expect(screen.getByText('Test City, Test State 12345')).toBeInTheDocument();
    
    // Check if country is displayed
    expect(screen.getByText('Test Country')).toBeInTheDocument();
    
    // Check if date range is displayed (format may vary based on locale)
    expect(screen.getByText(/December 2019 - December 2021/)).toBeInTheDocument();
    expect(screen.getByText(/\(2.0 years\)/)).toBeInTheDocument();
  });

  test('switches to edit mode when edit button is clicked', () => {
    render(
      <ResidenceEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Click the edit button
    fireEvent.click(screen.getByLabelText('Edit residence'));

    // Check if form fields are displayed
    expect(screen.getByLabelText('Street Address')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('State/Province')).toBeInTheDocument();
    expect(screen.getByLabelText('ZIP/Postal Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Country')).toBeInTheDocument();
    expect(screen.getByLabelText('Start Date')).toBeInTheDocument();
    expect(screen.getByLabelText('End Date')).toBeInTheDocument();
  });

  test('calls onRemove when remove button is clicked', () => {
    render(
      <ResidenceEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Click the remove button
    fireEvent.click(screen.getByLabelText('Remove residence'));

    // Check if onRemove was called
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  test('updates entry when form is submitted', () => {
    render(
      <ResidenceEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Click the edit button
    fireEvent.click(screen.getByLabelText('Edit residence'));

    // Update the address
    fireEvent.change(screen.getByLabelText('Street Address'), {
      target: { value: '456 New St' }
    });

    // Save the changes
    fireEvent.click(screen.getByText('Save Changes'));

    // Check if onUpdate was called with updated entry
    expect(mockOnUpdate).toHaveBeenCalledTimes(1);
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({
      address: '456 New St'
    }));
  });

  test('handles current residence checkbox', () => {
    render(
      <ResidenceEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Click the edit button
    fireEvent.click(screen.getByLabelText('Edit residence'));

    // Check the "current residence" checkbox
    fireEvent.click(screen.getByLabelText('I currently live at this address'));

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
      <ResidenceEntry
        entry={mockEntry}
        index={0}
        onUpdate={mockOnUpdate}
        onRemove={mockOnRemove}
      />
    );

    // Click the edit button
    fireEvent.click(screen.getByLabelText('Edit residence'));

    // Update the address
    fireEvent.change(screen.getByLabelText('Street Address'), {
      target: { value: '456 New St' }
    });

    // Click cancel
    fireEvent.click(screen.getByText('Cancel'));

    // Check if we're back in display mode with the original address
    expect(screen.getByText('123 Test St')).toBeInTheDocument();
    
    // Check that onUpdate was not called
    expect(mockOnUpdate).not.toHaveBeenCalled();
  });
});