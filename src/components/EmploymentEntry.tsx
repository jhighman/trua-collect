import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDisplayDate } from '../utils/dateUtils';
import { countries, getCountryByCode } from '../utils/countries';
import { getStatesByCountry } from '../utils/states';
import '../styles/variables.css';
import '../styles/common.css';
import './EmploymentEntry.css';

export interface EmploymentEntryData {
  company_name: string;
  job_title: string;
  country: string;
  address: string;
  city: string;
  state_province: string;
  zip_postal: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  responsibilities: string;
  supervisor_name: string;
  supervisor_title: string;
  supervisor_phone: string;
  supervisor_email: string;
  can_contact: boolean;
}

interface EmploymentEntryProps {
  entry: EmploymentEntryData;
  onUpdate: (entry: EmploymentEntryData) => void;
  onDelete: () => void;
  isEditing?: boolean;
}

export function EmploymentEntry({ entry, onUpdate, onDelete, isEditing = false }: EmploymentEntryProps) {
  const { t } = useTranslation();
  const [editedEntry, setEditedEntry] = useState<EmploymentEntryData>(entry);
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
      <div className="card employment-entry">
        <div className="entry-content">
          <div className="company-name">{editedEntry.company_name}</div>
          <div className="job-title">{editedEntry.job_title}</div>
          <div className="location">
            {editedEntry.city}, {editedEntry.state_province} {editedEntry.zip_postal}
          </div>
          <div className="dates">
            {formatDisplayDate(entry.start_date)} - {entry.is_current ? t('common.present') : formatDisplayDate(entry.end_date)}
          </div>
          <div className="responsibilities">{editedEntry.responsibilities}</div>
        </div>
        <div className="entry-actions">
          <button onClick={() => setIsEditable(true)} className="btn btn-secondary">{t('common.edit')}</button>
          <button onClick={onDelete} className="btn btn-danger">{t('common.delete')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container employment-entry-form">
      <div className="grid">
        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label" htmlFor="company_name">{t('employment.company_name')}</label>
            <input
              type="text"
              id="company_name"
              value={editedEntry.company_name}
              onChange={(e) => setEditedEntry({ ...editedEntry, company_name: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="job_title">{t('employment.job_title')}</label>
            <input
              type="text"
              id="job_title"
              value={editedEntry.job_title}
              onChange={(e) => setEditedEntry({ ...editedEntry, job_title: e.target.value })}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="country">{t('employment.country')}</label>
          <select
            id="country"
            value={editedEntry.country}
            onChange={handleCountryChange}
            className="select-control"
          >
            <option value="">{t('employment.select_country')}</option>
            {countries.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="address">{t('employment.address')}</label>
          <input
            type="text"
            id="address"
            value={editedEntry.address}
            onChange={(e) => setEditedEntry({ ...editedEntry, address: e.target.value })}
            className="form-control"
          />
        </div>

        <div className="grid grid-cols-1-2-1">
          <div className="form-group">
            <label className="form-label" htmlFor="city">{t('employment.city')}</label>
            <input
              type="text"
              id="city"
              value={editedEntry.city}
              onChange={(e) => setEditedEntry({ ...editedEntry, city: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="state_province">{t('employment.state_province')}</label>
            <select
              id="state_province"
              value={editedEntry.state_province}
              onChange={handleStateChange}
              disabled={!editedEntry.country}
              className="select-control"
            >
              <option value="">{t('employment.select_state')}</option>
              {availableStates.map(state => (
                <option key={state.code} value={state.code}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="zip_postal">{t('employment.zip_postal')}</label>
            <input
              type="text"
              id="zip_postal"
              value={editedEntry.zip_postal}
              onChange={(e) => setEditedEntry({ ...editedEntry, zip_postal: e.target.value })}
              className="form-control"
            />
          </div>
        </div>

        <div className="grid grid-cols-1-2-1">
          <div className="form-group">
            <label className="form-label" htmlFor="start_date">{t('common.start_date')}</label>
            <input
              type="month"
              id="start_date"
              value={editedEntry.start_date}
              onChange={(e) => setEditedEntry({ ...editedEntry, start_date: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <input
                type="checkbox"
                checked={editedEntry.is_current}
                onChange={(e) => setEditedEntry({
                  ...editedEntry,
                  is_current: e.target.checked,
                  end_date: e.target.checked ? null : editedEntry.end_date,
                })}
                className="checkbox-control"
              />
              {t('common.current')}
            </label>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="end_date">{t('common.end_date')}</label>
            <input
              type="month"
              id="end_date"
              value={editedEntry.end_date || ''}
              onChange={(e) => setEditedEntry({ ...editedEntry, end_date: e.target.value })}
              disabled={editedEntry.is_current}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="responsibilities">{t('employment.responsibilities')}</label>
          <textarea
            id="responsibilities"
            value={editedEntry.responsibilities}
            onChange={(e) => setEditedEntry({ ...editedEntry, responsibilities: e.target.value })}
            className="form-control responsibilities-input"
          />
        </div>

        <div className="supervisor-section">
          <h4 className="supervisor-section-title">{t('employment.supervisor_info')}</h4>
          <div className="grid grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="supervisor_name">{t('employment.supervisor_name')}</label>
              <input
                type="text"
                id="supervisor_name"
                value={editedEntry.supervisor_name}
                onChange={(e) => setEditedEntry({ ...editedEntry, supervisor_name: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="supervisor_title">{t('employment.supervisor_title')}</label>
              <input
                type="text"
                id="supervisor_title"
                value={editedEntry.supervisor_title}
                onChange={(e) => setEditedEntry({ ...editedEntry, supervisor_title: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="supervisor_phone">{t('employment.supervisor_phone')}</label>
              <input
                type="tel"
                id="supervisor_phone"
                value={editedEntry.supervisor_phone}
                onChange={(e) => setEditedEntry({ ...editedEntry, supervisor_phone: e.target.value })}
                className="form-control"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="supervisor_email">{t('employment.supervisor_email')}</label>
              <input
                type="email"
                id="supervisor_email"
                value={editedEntry.supervisor_email}
                onChange={(e) => setEditedEntry({ ...editedEntry, supervisor_email: e.target.value })}
                className="form-control"
              />
            </div>
          </div>

          <div className="contact-permission">
            <label className="contact-permission-label">
              <input
                type="checkbox"
                checked={editedEntry.can_contact}
                onChange={(e) => setEditedEntry({ ...editedEntry, can_contact: e.target.checked })}
                className="checkbox-control"
              />
              {t('employment.can_contact_supervisor')}
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={handleSave}
          disabled={
            !editedEntry.company_name ||
            !editedEntry.job_title ||
            !editedEntry.country ||
            !editedEntry.address ||
            !editedEntry.city ||
            !editedEntry.state_province ||
            !editedEntry.zip_postal ||
            !editedEntry.start_date ||
            (!editedEntry.is_current && !editedEntry.end_date) ||
            !editedEntry.responsibilities ||
            !editedEntry.supervisor_name ||
            !editedEntry.supervisor_title ||
            !editedEntry.supervisor_phone ||
            !editedEntry.supervisor_email
          }
          className="btn btn-primary"
        >
          {t('common.save')}
        </button>
        <button onClick={() => setIsEditable(false)} className="btn btn-secondary">
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
}