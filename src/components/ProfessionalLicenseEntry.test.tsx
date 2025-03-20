import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfessionalLicenseEntry, ProfessionalLicenseEntryData } from './ProfessionalLicenseEntry';
import { TranslationProvider } from '../context/TranslationContext';

describe('ProfessionalLicenseEntry Component', () => {
  const mockEntry: ProfessionalLicenseEntryData = {
    id: 'test-id',
    licenseType: 'Certified Public Accountant',
    licenseNumber: 'CPA-12345',
    issuingAuthority: 'State Board of Accountancy',
    issueDate: '2020-01-15',
    expirationDate: '2025-01-14',
    isActive: true,
    state: 'California',
    country: 'USA',
    description: 'Licensed to practice public accounting in California'
  };
  
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();
  
  const renderComponent = (
    entry = mockEntry,
    errors = {}
  ) => {
    return render(
      <TranslationProvider initialLanguage="en">
        <ProfessionalLicenseEntry
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
  
  it('renders the license entry form with provided data', () => {
    renderComponent();
    
    // Check if form fields are populated with the provided data
    expect(screen.getByLabelText(/license type/i)).toHaveValue('Certified Public Accountant');
    expect(screen.getByLabelText(/license number/i)).toHaveValue('CPA-12345');
    expect(screen.getByLabelText(/issuing authority/i)).toHaveValue('State Board of Accountancy');
    expect(screen.getByLabelText(/issue date/i)).toHaveValue('2020-01-15');
    expect(screen.getByLabelText(/state\/province/i)).toHaveValue('California');
    expect(screen.getByLabelText(/country/i)).toHaveValue('USA');
    expect(screen.getByLabelText(/description/i)).toHaveValue('Licensed to practice public accounting in California');
    expect(screen.getByLabelText(/this license is currently active/i)).toBeChecked();
  });
  
  it('renders the form with empty data for new entry', () => {
    const emptyEntry: ProfessionalLicenseEntryData = {
      id: '',
      licenseType: '',
      licenseNumber: '',
      issuingAuthority: '',
      issueDate: '',
      expirationDate: '',
      isActive: false,
      state: '',
      country: '',
      description: ''
    };
    
    renderComponent(emptyEntry);
    
    // Check if form title indicates adding a new entry
    expect(screen.getByRole('heading', { name: /add professional license/i })).toBeInTheDocument();
    
    // Check if form fields are empty
    expect(screen.getByLabelText(/license type/i)).toHaveValue('');
    expect(screen.getByLabelText(/license number/i)).toHaveValue('');
  });
  
  it('handles input changes correctly', () => {
    renderComponent();
    
    // Change license type
    const licenseTypeInput = screen.getByLabelText(/license type/i);
    fireEvent.change(licenseTypeInput, { target: { value: 'Registered Nurse' } });
    
    // Change license number
    const licenseNumberInput = screen.getByLabelText(/license number/i);
    fireEvent.change(licenseNumberInput, { target: { value: 'RN-54321' } });
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save license/i });
    fireEvent.click(saveButton);
    
    // Check if onSave was called with updated data
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      licenseType: 'Registered Nurse',
      licenseNumber: 'RN-54321'
    }));
  });
  
  it('handles checkbox for active license correctly', () => {
    const inactiveEntry = {
      ...mockEntry,
      isActive: false,
      expirationDate: '2022-01-14'
    };
    
    renderComponent(inactiveEntry);
    
    // Check the "active license" checkbox
    const activeCheckbox = screen.getByLabelText(/this license is currently active/i);
    fireEvent.click(activeCheckbox);
    
    // Expiration date should be disabled
    const expirationDateInput = screen.getByLabelText(/expiration date/i);
    expect(expirationDateInput).toBeDisabled();
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save license/i });
    fireEvent.click(saveButton);
    
    // Check if onSave was called with updated data
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith(expect.objectContaining({
      isActive: true,
      expirationDate: '' // Expiration date should be cleared when isActive is true
    }));
  });
  
  it('displays validation errors', () => {
    const errors = {
      licenseType: 'License type is required',
      licenseNumber: 'License number is required',
      issuingAuthority: 'Issuing authority is required'
    };
    
    renderComponent(mockEntry, errors);
    
    // Check if error messages are displayed
    expect(screen.getByText('License type is required')).toBeInTheDocument();
    expect(screen.getByText('License number is required')).toBeInTheDocument();
    expect(screen.getByText('Issuing authority is required')).toBeInTheDocument();
    
    // Check if inputs have error class
    expect(screen.getByLabelText(/license type/i)).toHaveClass('has-error');
    expect(screen.getByLabelText(/license number/i)).toHaveClass('has-error');
    expect(screen.getByLabelText(/issuing authority/i)).toHaveClass('has-error');
  });
  
  it('calls onCancel when cancel button is clicked', () => {
    renderComponent();
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});