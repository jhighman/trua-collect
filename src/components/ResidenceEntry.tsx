import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDisplayDate } from '../utils/dateUtils';
import { countries, getCountryByCode, type Country } from '../utils/countries';
import { getStatesByCountry, getStateByCode, type State } from '../utils/states';
import '../styles/variables.css';
import '../styles/common.css';
import './ResidenceEntry.css';

export interface ResidenceEntryData {
  country: string;
  address: string;
  city: string;
  state_province: string;
  zip_postal: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  duration_years: number;
}

interface ResidenceEntryProps {
  entry: ResidenceEntryData;
  onUpdate: (entry: ResidenceEntryData) => void;
  onDelete: () => void;
  onRemove?: () => void;  // Alias for onDelete for compatibility
  isEditing?: boolean;
}

export function ResidenceEntry({ entry, onUpdate, onDelete, onRemove = onDelete, isEditing = false }: ResidenceEntryProps) {
  const { t } = useTranslation();
  const [editedEntry, setEditedEntry] = useState<ResidenceEntryData>(entry);
  const [isEditable, setIsEditable] = useState(isEditing);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    setEditedEntry(entry);
  }, [entry]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setEditedEntry(prev => ({
      ...prev,
      country: countryCode,
      state_province: '', // Reset state when country changes
    }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedEntry(prev => ({
      ...prev,
      state_province: e.target.value,
    }));
  };

  const handleSave = () => {
    const errors = getValidationErrors();
    if (errors.length > 0) {
      setShowErrors(true);
      return;
    }
    onUpdate(editedEntry);
    setIsEditable(false);
  };

  const availableStates = editedEntry.country ? getStatesByCountry(editedEntry.country) : [];

  // Collect all validation errors
  const getValidationErrors = () => {
    const errors = [];
    if (!editedEntry.country) {
      errors.push({ id: 'country-error', message: t('residence.country_required') || 'Please select a country' });
    }
    if (!editedEntry.address) {
      errors.push({ id: 'address-error', message: t('residence.address_required') || 'Please enter an address' });
    }
    if (!editedEntry.city) {
      errors.push({ id: 'city-error', message: t('residence.city_required') || 'Please enter a city' });
    }
    if (!editedEntry.state_province) {
      errors.push({ id: 'state-error', message: t('residence.state_required') || 'Please select a state/province' });
    }
    if (!editedEntry.zip_postal) {
      errors.push({ id: 'zip-error', message: t('residence.zip_required') || 'Please enter a ZIP/postal code' });
    }
    if (!editedEntry.start_date) {
      errors.push({ id: 'start-date-error', message: t('common.start_date_required') || 'Please enter a start date' });
    }
    if (!editedEntry.is_current && !editedEntry.end_date) {
      errors.push({ id: 'end-date-error', message: t('common.end_date_required') || 'Please enter an end date' });
    }
    return errors;
  };

  if (!isEditable) {
    return (
      <div className="residence-entry">
        <div className="residence-entry__summary">
          <div className="residence-entry__location">
            {editedEntry.country && <span className="residence-entry__country">{t(`countries.${editedEntry.country}`)}</span>}
            <span className="residence-entry__address-text">{editedEntry.address}</span>
            <span className="residence-entry__city-state">
              {editedEntry.city}, {editedEntry.state_province} {editedEntry.zip_postal}
            </span>
          </div>
          <div className="residence-entry__dates-text">
            {formatDisplayDate(entry.start_date)} - {entry.is_current ? t('common.present') : formatDisplayDate(entry.end_date)}
          </div>
        </div>
        <div className="residence-entry__actions">
          <button onClick={() => setIsEditable(true)} className="btn btn-secondary">{t('common.edit')}</button>
          <button onClick={onDelete} className="btn btn-danger">{t('common.delete')}</button>
        </div>
      </div>
    );
  }

  const validationErrors = getValidationErrors();

  return (
    <div className="form-container">
      <div className="form-content">
        <div className="form-group">
          <label htmlFor="country">
            {t('residence.country')}
            <span className="required">*</span>
          </label>
          <select
            id="country"
            value={editedEntry.country}
            onChange={handleCountryChange}
            className="form-control"
            required
          >
            <option value="">{t('residence.select_country')}</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="address">
            {t('residence.address')}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="address"
            value={editedEntry.address}
            onChange={(e) => setEditedEntry({ ...editedEntry, address: e.target.value })}
            className="form-control"
            required
          />
        </div>

        <div className="address-fields">
          <div className="form-group">
            <label htmlFor="city">
              {t('residence.city')}
              <span className="required">*</span>
            </label>
            <input
              type="text"
              id="city"
              value={editedEntry.city}
              onChange={(e) => setEditedEntry({ ...editedEntry, city: e.target.value })}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="state_province">
              {t('residence.state_province')}
              <span className="required">*</span>
            </label>
            <select
              id="state_province"
              value={editedEntry.state_province}
              onChange={handleStateChange}
              disabled={!editedEntry.country}
              className="form-control"
              required
            >
              <option value="">{t('residence.select_state')}</option>
              {availableStates.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="zip_postal">
              {t('residence.zip_postal')}
              <span className="required">*</span>
            </label>
            <input
              type="text"
              id="zip_postal"
              value={editedEntry.zip_postal}
              onChange={(e) => setEditedEntry({ ...editedEntry, zip_postal: e.target.value })}
              className="form-control"
              required
              pattern="[0-9]{5}(-[0-9]{4})?"
            />
          </div>
        </div>

        <div className="date-fields">
          <div className="form-group">
            <label htmlFor="start_date">
              {t('common.start_date')}
              <span className="required">*</span>
            </label>
            <input
              type="month"
              id="start_date"
              value={editedEntry.start_date}
              onChange={(e) => setEditedEntry({ ...editedEntry, start_date: e.target.value })}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="end_date">
              <span className="date-label">
                {t('common.end_date')}
                {!editedEntry.is_current && <span className="required">*</span>}
              </span>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  id="is_current"
                  checked={editedEntry.is_current}
                  onChange={(e) => setEditedEntry({
                    ...editedEntry,
                    is_current: e.target.checked,
                    end_date: e.target.checked ? null : editedEntry.end_date
                  })}
                  className="checkbox-control"
                />
                {t('common.current')}
              </label>
            </label>
            {!editedEntry.is_current && (
              <input
                type="month"
                id="end_date"
                value={editedEntry.end_date || ''}
                onChange={(e) => setEditedEntry({ ...editedEntry, end_date: e.target.value })}
                className="form-control"
                required
              />
            )}
          </div>
        </div>

        {showErrors && validationErrors.length > 0 && (
          <div className="form-errors" role="alert">
            <div className="error-header">Please fix the following errors:</div>
            <ul>
              {validationErrors.map(error => (
                <li key={error.id}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-navigation">
          <button onClick={() => setIsEditable(false)} className="btn btn-secondary">
            {t('common.cancel')}
          </button>
          <button onClick={handleSave} className="btn btn-primary">
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}