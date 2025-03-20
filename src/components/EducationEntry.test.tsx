import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EducationEntry, EducationEntryData } from './EducationEntry';
import { TranslationProvider } from '../context/TranslationContext';

describe('EducationEntry Component', () => {
  const mockEntry: EducationEntryData = {
    id: 'test-id',
    institution: 'Test University',
    degree: 'Bachelor of Science',
    fieldOfStudy: 'Computer Science',
    startDate: '2018-09-01',
    endDate: '2022-06-30',
    isCurrent: false,
    description: 'Studied computer science with focus on software engineering',
    location: 'New York, NY'
  };
  
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  
  const renderComponent = (
    entry = mockEntry,
    errors = {}
  ) => {
    return render(
      <TranslationProvider initialLanguage="en">
        <EducationEntry
          entry={entry}
          onSave={mockOnSave}
          onCancel={mockOnCancel}
          errors={errors}
        />
      </TranslationProvider>
    );
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders the education entry form with provided data', () => {
    renderComponent();
    
    // Check if form fields are populated with the provided data
    expect(screen.getByLabelText(/institution name/i)).toHaveValue('Test University');
    expect(screen.getByLabelText(/degree/i)).toHaveValue('Bachelor of Science');
    expect(screen.getByLabelText(/field of study/i)).toHaveValue('Computer Science');
    expect(screen.getByLabelText(/start date/i)).toHaveValue('2018-09-01');
    expect(screen.getByLabelText(/end date/i)).toHaveValue('2022-06-30');
    expect(screen.getByLabelText(/location/i)).toHaveValue('New York, NY');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Studied computer science with focus on software engineering');
    expect(screen.getByLabelText(/i am currently studying here/i)).not.toBeChecked();
  });
  
  it('renders the form with empty data for new entry', () => {
    const emptyEntry: EducationEntryData = {
      id: '',
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      location: ''
    };
    
    renderComponent(emptyEntry);
    
    // Check if form title indicates adding a new entry
    expect(screen.getByRole('heading', { name: /add education/i })).toBeInTheDocument();
    
    // Check if form fields are empty
    expect(screen.getByLabelText(/institution name/i)).toHaveValue('');
    expect(screen.getByLabelText(/degree/i)).toHaveValue('');
  });
  
  it('handles input changes correctly', () => {
    renderComponent();
    
    // Change institution name
    const institutionInput = screen.getByLabelText(/institution name/i);
    fireEvent.change(institutionInput, { target: { value: 'New University' } });
    
    // Change degree
    const degreeInput = screen.getByLabelText(/degree/i);
    fireEvent.change(degreeInput, { target: { value: 'Master of Science' } });
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save education/i });
    fireEvent.click(saveButton);
    
    // Check if onSave was called with updated data
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      institution: 'New University',
      degree: 'Master of Science'
    }));
  });
  
  it('handles checkbox for current education correctly', () => {
    renderComponent();
    
    // Check the "currently studying" checkbox
    const currentCheckbox = screen.getByLabelText(/i am currently studying here/i);
    fireEvent.click(currentCheckbox);
    
    // End date should be disabled
    const endDateInput = screen.getByLabelText(/end date/i);
    expect(endDateInput).toBeDisabled();
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save education/i });
    fireEvent.click(saveButton);
    
    // Check if onSave was called with updated data
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      isCurrent: true,
      endDate: '' // End date should be cleared when isCurrent is true
    }));
  });
  
  it('displays validation errors', () => {
    const errors = {
      institution: 'Institution is required',
      degree: 'Degree is required',
      startDate: 'Start date is required'
    };
    
    renderComponent(mockEntry, errors);
    
    // Check if error messages are displayed
    expect(screen.getByText('Institution is required')).toBeInTheDocument();
    expect(screen.getByText('Degree is required')).toBeInTheDocument();
    expect(screen.getByText('Start date is required')).toBeInTheDocument();
    
    // Check if inputs have error class
    expect(screen.getByLabelText(/institution name/i)).toHaveClass('has-error');
    expect(screen.getByLabelText(/degree/i)).toHaveClass('has-error');
    expect(screen.getByLabelText(/start date/i)).toHaveClass('has-error');
  });
  
  it('calls onCancel when cancel button is clicked', () => {
    renderComponent();
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});