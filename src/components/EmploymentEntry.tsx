import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDisplayDate } from '../utils/dateUtils';
import { getStatesByCountry } from '../utils/states';
import '../styles/variables.css';
import '../styles/common.css';
import './EmploymentEntry.css';

export interface EmploymentEntryData {
  type: string;
  company: string;
  position: string;
  city: string;
  state_province: string;
  description: string;
  contact_name: string;
  contact_info: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  duration_years?: number;
}

interface EmploymentEntryProps {
  entry: EmploymentEntryData;
  onUpdate: (entry: EmploymentEntryData) => void;
  onRemove?: () => void;  // Optional since onDelete is its alias
  onDelete: () => void;   // Required and replaces onRemove as the primary handler
  employmentTypes?: { value: string; label: string }[];
  isEditing?: boolean;
  isCompanyRequired?: boolean;
  isPositionRequired?: boolean;
  isContactRequired?: boolean;
}

export function EmploymentEntry({ 
  entry, 
  onUpdate, 
  onRemove,
  onDelete,
  employmentTypes = [],
  isEditing = false,
  isCompanyRequired = true,
  isPositionRequired = true,
  isContactRequired = true
}: EmploymentEntryProps) {
  const { t } = useTranslation();
  const [editedEntry, setEditedEntry] = useState<EmploymentEntryData>(entry);
  const [isEditable, setIsEditable] = useState(isEditing);

  // Use onRemove if provided for backward compatibility
  const handleDelete = onRemove || onDelete;

  useEffect(() => {
    setEditedEntry(entry);
  }, [entry]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedEntry(prev => ({
      ...prev,
      state_province: e.target.value,
    }));
  };

  const handleSave = () => {
    console.log('EmploymentEntry - handleSave called with entry:', editedEntry);
    
    // Validate required fields
    if (!editedEntry.company || !editedEntry.position || !editedEntry.start_date) {
      console.error('Required fields missing');
      return;
    }

    // If current job, end date should be null
    const updatedEntry = {
      ...editedEntry,
      end_date: editedEntry.is_current ? null : editedEntry.end_date
    };
    
    console.log('EmploymentEntry - Calling onUpdate with:', updatedEntry);
    onUpdate(updatedEntry);
    setIsEditable(false);
  };

  const availableStates = getStatesByCountry('US'); // Default to US states

  if (!isEditable) {
    return (
      <div className="card employment-entry">
        <div className="entry-content">
          <div className="company-name">{editedEntry.company}</div>
          <div className="job-title">{editedEntry.position}</div>
          <div className="location">
            {editedEntry.city}, {editedEntry.state_province}
          </div>
          <div className="dates">
            {formatDisplayDate(entry.start_date)} - {entry.is_current ? t('common.present') : formatDisplayDate(entry.end_date)}
          </div>
          <div className="responsibilities">{editedEntry.description}</div>
        </div>
        <div className="entry-actions">
          <button onClick={() => setIsEditable(true)} className="btn btn-secondary">{t('common.edit')}</button>
          <button onClick={handleDelete} className="btn btn-danger">{t('common.delete')}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container employment-entry-form">
      <div className="grid">
        <div className="grid grid-cols-2">
          <div className="form-group">
            <label className="form-label" htmlFor="company">{t('employment.company')}</label>
            <input
              type="text"
              id="company"
              value={editedEntry.company}
              onChange={(e) => setEditedEntry({ ...editedEntry, company: e.target.value })}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="position">{t('employment.position')}</label>
            <input
              type="text"
              id="position"
              value={editedEntry.position}
              onChange={(e) => setEditedEntry({ ...editedEntry, position: e.target.value })}
              className="form-control"
            />
          </div>
        </div>

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
          <label className="form-label" htmlFor="description">{t('employment.description')}</label>
          <textarea
            id="description"
            value={editedEntry.description}
            onChange={(e) => setEditedEntry({ ...editedEntry, description: e.target.value })}
            className="form-control responsibilities-input"
          />
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
                onChange={(e) => {
                  console.log('Current checkbox changed:', e.target.checked);
                  setEditedEntry({
                    ...editedEntry,
                    is_current: e.target.checked,
                    end_date: e.target.checked ? null : editedEntry.end_date,
                  });
                }}
                className="checkbox-control"
              />
              {t('common.current')}
            </label>
          </div>

          <div className="form-group" style={{ display: editedEntry.is_current ? 'none' : 'block' }}>
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
          <label className="form-label" htmlFor="contact_name">{t('employment.contact_name')}</label>
          <input
            type="text"
            id="contact_name"
            value={editedEntry.contact_name}
            onChange={(e) => setEditedEntry({ ...editedEntry, contact_name: e.target.value })}
            className="form-control"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="contact_info">{t('employment.contact_info')}</label>
          <input
            type="text"
            id="contact_info"
            value={editedEntry.contact_info}
            onChange={(e) => setEditedEntry({ ...editedEntry, contact_info: e.target.value })}
            className="form-control"
          />
        </div>
      </div>

      <div className="form-actions">
        <button
          onClick={handleSave}
          disabled={
            !editedEntry.company ||
            !editedEntry.position ||
            !editedEntry.city ||
            !editedEntry.state_province ||
            !editedEntry.start_date ||
            (!editedEntry.is_current && !editedEntry.end_date)
            // Removed validation for description, contact_name, and contact_info
            // as they might not be required
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