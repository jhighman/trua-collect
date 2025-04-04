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

  // Get today's date in YYYY-MM-DD format for date input max attribute
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className="license-entry">
      <h3>{formData.id ? t('licenses.edit_title') : t('licenses.add_title')}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="licenseType">
            {t('licenses.license_type')}
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
            required
          />
          {errors.licenseType && (
            <div className="error-message" id="licenseType-error">
              {t('licenses.validation.required')}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="licenseNumber">
            {t('licenses.license_number')}
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
            required
          />
          {errors.licenseNumber && (
            <div className="error-message" id="licenseNumber-error">
              {t('licenses.validation.required')}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="issuingAuthority">
            {t('licenses.issuing_authority')}
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
            required
          />
          {errors.issuingAuthority && (
            <div className="error-message" id="issuingAuthority-error">
              {t('licenses.validation.required')}
            </div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="country">
              {t('licenses.country')}
              <span className="required">*</span>
            </label>
            <div className={`select-container ${errors.country ? 'has-error' : ''}`}>
              <Select
                value={formData.country}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className={`select-trigger ${errors.country ? 'has-error' : ''}`}>
                  <SelectValue placeholder={t('licenses.select_country')} />
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
                {t('licenses.validation.required')}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="state">
              {t('licenses.state')}
              <span className="required">*</span>
            </label>
            <div className={`select-container ${errors.state ? 'has-error' : ''}`}>
              <Select
                value={formData.state}
                onValueChange={handleStateChange}
                disabled={!formData.country}
              >
                <SelectTrigger className={`select-trigger ${errors.state ? 'has-error' : ''}`}>
                  <SelectValue placeholder={t('licenses.select_state')} />
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
                {t('licenses.validation.required')}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="issueDate">
              {t('licenses.issue_date')}
              <span className="required">*</span>
            </label>
            <input
              type="date"
              id="issueDate"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              className={errors.issueDate ? 'has-error' : ''}
              aria-invalid={!!errors.issueDate}
              aria-describedby={errors.issueDate ? 'issueDate-error' : undefined}
              max={today}
              required
            />
            {errors.issueDate && (
              <div className="error-message" id="issueDate-error">
                {errors.issueDate === 'future' 
                  ? t('licenses.validation.future_date')
                  : t('licenses.validation.invalid_date')}
              </div>
            )}
          </div>
          
          {!formData.isActive && (
            <div className="form-group">
              <label htmlFor="expirationDate">
                {t('licenses.expiration_date')}
                <span className="required">*</span>
              </label>
              <input
                type="date"
                id="expirationDate"
                name="expirationDate"
                value={formData.expirationDate}
                onChange={handleChange}
                className={errors.expirationDate ? 'has-error' : ''}
                aria-invalid={!!errors.expirationDate}
                aria-describedby={errors.expirationDate ? 'expirationDate-error' : undefined}
                min={formData.issueDate}
                required={!formData.isActive}
              />
              {errors.expirationDate && (
                <div className="error-message" id="expirationDate-error">
                  {errors.expirationDate === 'before_issue'
                    ? t('licenses.validation.expiration_before_issue')
                    : t('licenses.validation.invalid_date')}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="form-group checkbox-group">
          <label htmlFor="isActive" className="checkbox-label">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleCheckboxChange}
            />
            {formData.isActive ? t('licenses.active') : t('licenses.inactive')}
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">
            {t('licenses.description')}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" className="save-button">
            {t('common.save')}
          </button>
          <button type="button" className="cancel-button" onClick={onCancel}>
            {t('common.cancel')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalLicenseEntry;