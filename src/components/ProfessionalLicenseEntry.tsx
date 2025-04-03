import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { TimelineEntry } from '../utils/FormStateManager';
import { formatDisplayDate } from '../utils/dateUtils';
import { countries, getCountryByCode, type Country } from '../utils/countries';
import { getStatesByCountry, getStateByCode, type State } from '../utils/states';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import './ProfessionalLicenseEntry.css';

export interface ProfessionalLicenseEntryData extends TimelineEntry {
  id: string;
  licenseType: string;
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expirationDate: string;
  isActive: boolean;
  state: string;
  country: string;
  description: string;
}

interface ProfessionalLicenseEntryProps {
  entry: ProfessionalLicenseEntryData;
  onSave: (entry: ProfessionalLicenseEntryData) => void;
  onCancel: () => void;
  errors?: Record<string, string>;
}

export const ProfessionalLicenseEntry: React.FC<ProfessionalLicenseEntryProps> = ({
  entry,
  onSave,
  onCancel,
  errors = {}
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ProfessionalLicenseEntryData>(entry);
  
  // Get available states based on selected country
  const availableStates = formData.country ? getStatesByCountry(formData.country) : [];
  
  useEffect(() => {
    // Initialize with entry data
    setFormData(entry);
  }, [entry]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCountryChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      country: value,
      state: '', // Reset state when country changes
    }));
  };
  
  const handleStateChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      state: value,
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // If active license, set expiration date to empty
    if (name === 'isActive' && checked) {
      setFormData(prev => ({ ...prev, expirationDate: '' }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Sync TimelineEntry fields with license fields
    const updatedFormData = {
      ...formData,
      startDate: formData.issueDate,
      endDate: formData.expirationDate,
      isCurrent: formData.isActive
    };
    onSave(updatedFormData);
  };
  
  return (
    <div className="license-entry">
      <h3>{formData.id ? t('licenses.edit_title') || 'Edit Professional License' : t('licenses.add_title') || 'Add Professional License'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="licenseType">
            {t('licenses.license_type') || 'License Type'}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="licenseType"
            name="licenseType"
            value={formData.licenseType}
            onChange={handleChange}
            className={errors.licenseType ? 'has-error' : ''}
            aria-invalid={!!errors.licenseType}
            aria-describedby={errors.licenseType ? 'licenseType-error' : undefined}
          />
          {errors.licenseType && (
            <div className="error-message" id="licenseType-error">
              {errors.licenseType}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="licenseNumber">
            {t('licenses.license_number') || 'License Number'}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleChange}
            className={errors.licenseNumber ? 'has-error' : ''}
            aria-invalid={!!errors.licenseNumber}
            aria-describedby={errors.licenseNumber ? 'licenseNumber-error' : undefined}
          />
          {errors.licenseNumber && (
            <div className="error-message" id="licenseNumber-error">
              {errors.licenseNumber}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="issuingAuthority">
            {t('licenses.issuing_authority') || 'Issuing Authority'}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="issuingAuthority"
            name="issuingAuthority"
            value={formData.issuingAuthority}
            onChange={handleChange}
            className={errors.issuingAuthority ? 'has-error' : ''}
            aria-invalid={!!errors.issuingAuthority}
            aria-describedby={errors.issuingAuthority ? 'issuingAuthority-error' : undefined}
          />
          {errors.issuingAuthority && (
            <div className="error-message" id="issuingAuthority-error">
              {errors.issuingAuthority}
            </div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="country">
              {t('licenses.country') || 'Country'}
              <span className="required">*</span>
            </label>
            <div className={`select-container ${errors.country ? 'has-error' : ''}`}>
              <Select
                value={formData.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className={`select-trigger ${errors.country ? 'has-error' : ''}`}>
                  <SelectValue placeholder={t('licenses.select_country') || 'Select Country'} />
                </SelectTrigger>
                <SelectContent className="select-content">
                  {countries.map(country => (
                    <SelectItem key={country.code} value={country.code} className="select-item">
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.country && (
              <div className="error-message" id="country-error">
                {errors.country}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="state">
              {t('licenses.state') || 'State/Province'}
              <span className="required">*</span>
            </label>
            <div className={`select-container ${errors.state ? 'has-error' : ''}`}>
              <Select
                value={formData.state}
                onValueChange={handleStateChange}
                disabled={!formData.country}
              >
                <SelectTrigger className={`select-trigger ${errors.state ? 'has-error' : ''}`}>
                  <SelectValue placeholder={t('licenses.select_state') || 'Select State/Province'} />
                </SelectTrigger>
                <SelectContent className="select-content">
                  {availableStates.map(state => (
                    <SelectItem key={state.code} value={state.code} className="select-item">
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.state && (
              <div className="error-message" id="state-error">
                {errors.state}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="issueDate">
              {t('licenses.issue_date') || 'Issue Date'}
              <span className="required">*</span>
            </label>
            <input
              type="month"
              id="issueDate"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className={errors.issueDate ? 'has-error' : ''}
              aria-invalid={!!errors.issueDate}
              aria-describedby={errors.issueDate ? 'issueDate-error' : undefined}
            />
            <p className="input-help-text">
              {t('licenses.issue_date_help') || 'Month and year when the license was issued'}
            </p>
            {errors.issueDate && (
              <div className="error-message" id="issueDate-error">
                {errors.issueDate}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="expirationDate">
              {t('licenses.expiration_date') || 'Expiration Date'}
              {!formData.isActive && <span className="required">*</span>}
            </label>
            {!formData.isActive ? (
              <>
                <input
                  type="month"
                  id="expirationDate"
                  name="expirationDate"
                  value={formData.expirationDate}
                  onChange={handleChange}
                  className={errors.expirationDate ? 'has-error' : ''}
                  aria-invalid={!!errors.expirationDate}
                  aria-describedby={errors.expirationDate ? 'expirationDate-error' : undefined}
                />
                <p className="input-help-text">
                  {t('licenses.expiration_date_help') || 'Month and year when the license expires'}
                </p>
              </>
            ) : (
              <div className="current-indicator">
                <span>{t('common.present') || 'Present'}</span>
              </div>
            )}
            {errors.expirationDate && (
              <div className="error-message" id="expirationDate-error">
                {errors.expirationDate}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="isActive">
            {t('licenses.is_active') || 'This license is currently active'}
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">
            {t('licenses.description') || 'Description'}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={t('licenses.description_placeholder') || 'Additional information about this license'}
            className={errors.description ? 'has-error' : ''}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <div className="error-message" id="description-error">
              {errors.description}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            {t('common.cancel') || 'Cancel'}
          </button>
          <button type="submit" className="save-button">
            {t('licenses.save_button') || 'Save License'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalLicenseEntry;