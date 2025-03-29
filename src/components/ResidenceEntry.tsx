import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDisplayDate } from '../utils/dateUtils';
import { countries, getCountryByCode, type Country } from '../utils/countries';
import { getStatesByCountry, getStateByCode, type State } from '../utils/states';

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
  isEditing?: boolean;
}

export function ResidenceEntry({ entry, onUpdate, onDelete, isEditing = false }: ResidenceEntryProps) {
  const { t } = useTranslation();
  const [editedEntry, setEditedEntry] = useState<ResidenceEntryData>(entry);
  const [isEditable, setIsEditable] = useState(isEditing);

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
    onUpdate(editedEntry);
    setIsEditable(false);
  };

  const availableStates = editedEntry.country ? getStatesByCountry(editedEntry.country) : [];

  if (!isEditable) {
    return (
      <div className="residence-entry">
        <div className="entry-summary">
          <div className="entry-location">
            {editedEntry.country && <span className="country">{t(`countries.${editedEntry.country}`)}</span>}
            <span className="address">{editedEntry.address}</span>
            <span className="city-state">
              {editedEntry.city}, {editedEntry.state_province} {editedEntry.zip_postal}
            </span>
          </div>
          <div className="entry-dates">
            {formatDisplayDate(entry.start_date)} - {entry.is_current ? t('common.present') : formatDisplayDate(entry.end_date)}
          </div>
        </div>
        <div className="entry-actions">
          <button onClick={() => setIsEditable(true)} className="edit-button">{t('common.edit')}</button>
          <button onClick={onDelete} className="delete-button">{t('common.delete')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="residence-entry-form">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="country">{t('residence.country')}</label>
          <select
            id="country"
            value={editedEntry.country}
            onChange={handleCountryChange}
          >
            <option value="">{t('residence.select_country')}</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="address">{t('residence.address')}</label>
          <input
            type="text"
            id="address"
            value={editedEntry.address}
            onChange={(e) => setEditedEntry({ ...editedEntry, address: e.target.value })}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="city">{t('residence.city')}</label>
          <input
            type="text"
            id="city"
            value={editedEntry.city}
            onChange={(e) => setEditedEntry({ ...editedEntry, city: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="state_province">{t('residence.state_province')}</label>
          <select
            id="state_province"
            value={editedEntry.state_province}
            onChange={handleStateChange}
            disabled={!editedEntry.country}
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
          <label htmlFor="zip_postal">{t('residence.zip_postal')}</label>
          <input
            type="text"
            id="zip_postal"
            value={editedEntry.zip_postal}
            onChange={(e) => setEditedEntry({ ...editedEntry, zip_postal: e.target.value })}
          />
        </div>
      </div>

      <div className="form-row dates">
        <div className="form-group">
          <label htmlFor="start_date">{t('common.start_date')}</label>
          <input
            type="month"
            id="start_date"
            value={editedEntry.start_date}
            onChange={(e) => setEditedEntry({ ...editedEntry, start_date: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={editedEntry.is_current}
              onChange={(e) => setEditedEntry({
                ...editedEntry,
                is_current: e.target.checked,
                end_date: e.target.checked ? null : editedEntry.end_date,
              })}
            />
            {t('common.current')}
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="end_date">{t('common.end_date')}</label>
          <input
            type="month"
            id="end_date"
            value={editedEntry.end_date || ''}
            onChange={(e) => setEditedEntry({ ...editedEntry, end_date: e.target.value })}
            disabled={editedEntry.is_current}
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={handleSave}
          disabled={
            !editedEntry.country ||
            !editedEntry.address ||
            !editedEntry.city ||
            !editedEntry.state_province ||
            !editedEntry.zip_postal ||
            !editedEntry.start_date ||
            (!editedEntry.is_current && !editedEntry.end_date)
          }
          className="save-button"
        >
          {t('common.save')}
        </button>
        <button onClick={() => setIsEditable(false)} className="cancel-button">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}