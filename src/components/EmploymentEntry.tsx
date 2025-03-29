import React, { useState } from 'react';
import { useTranslation } from '../context/TranslationContext';
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
  onRemove: () => void;
  employmentTypes: { value: string; label: string; }[];
  isCompanyRequired: boolean;
  isPositionRequired: boolean;
  isContactRequired: boolean;
  onCancel?: () => void;
  isNew?: boolean;
  index?: number;
}

export const EmploymentEntry: React.FC<EmploymentEntryProps> = ({
  entry,
  onUpdate,
  onRemove,
  employmentTypes,
  isCompanyRequired,
  isPositionRequired,
  isContactRequired,
  onCancel,
  isNew = false,
  index = 0
}) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(isNew);
  const [editedEntry, setEditedEntry] = useState<EmploymentEntryData>(entry);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedEntry({...entry});
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setIsEditing(false);
      setEditedEntry({...entry});
    }
  };

  const handleSave = () => {
    // Calculate duration
    const startDate = new Date(editedEntry.start_date);
    const endDate = editedEntry.is_current ? new Date() : new Date(editedEntry.end_date || '');
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationYears = durationMs / (1000 * 60 * 60 * 24 * 365.25);
    
    const updatedEntry = {
      ...editedEntry,
      duration_years: parseFloat(durationYears.toFixed(2))
    };
    
    onUpdate(updatedEntry);
    setIsEditing(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  if (isEditing) {
    return (
      <div className="employment-entry">
        <div className="edit-form">
          <div className="form-group">
            <label htmlFor={`edit-type-${index}`}>{t('employment.type')}</label>
            <select
              id={`edit-type-${index}`}
              value={editedEntry.type}
              onChange={(e) => setEditedEntry({...editedEntry, type: e.target.value})}
              required
            >
              <option value="">{t('employment.select_type')}</option>
              {employmentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-company-${index}`}>
              {t('employment.company')}
              {isCompanyRequired && <span aria-hidden="true"> *</span>}
            </label>
            <input
              type="text"
              id={`edit-company-${index}`}
              value={editedEntry.company}
              onChange={(e) => setEditedEntry({...editedEntry, company: e.target.value})}
              required={isCompanyRequired}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-position-${index}`}>
              {t('employment.position')}
              {isPositionRequired && <span aria-hidden="true"> *</span>}
            </label>
            <input
              type="text"
              id={`edit-position-${index}`}
              value={editedEntry.position}
              onChange={(e) => setEditedEntry({...editedEntry, position: e.target.value})}
              required={isPositionRequired}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-city-${index}`}>{t('employment.city')}</label>
            <input
              type="text"
              id={`edit-city-${index}`}
              value={editedEntry.city}
              onChange={(e) => setEditedEntry({...editedEntry, city: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-state-${index}`}>{t('employment.state')}</label>
            <input
              type="text"
              id={`edit-state-${index}`}
              value={editedEntry.state_province}
              onChange={(e) => setEditedEntry({...editedEntry, state_province: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-description-${index}`}>{t('employment.description')}</label>
            <textarea
              id={`edit-description-${index}`}
              value={editedEntry.description}
              onChange={(e) => setEditedEntry({...editedEntry, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-contact-name-${index}`}>
              {t('employment.contact_name')}
              {isContactRequired && <span aria-hidden="true"> *</span>}
            </label>
            <input
              type="text"
              id={`edit-contact-name-${index}`}
              value={editedEntry.contact_name}
              onChange={(e) => setEditedEntry({...editedEntry, contact_name: e.target.value})}
              required={isContactRequired}
              placeholder={isContactRequired ? t('employment.contact_name_placeholder') : ""}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-contact-info-${index}`}>
              {t('employment.contact_info')}
              {isContactRequired && <span aria-hidden="true"> *</span>}
            </label>
            <input
              type="text"
              id={`edit-contact-info-${index}`}
              value={editedEntry.contact_info}
              onChange={(e) => setEditedEntry({...editedEntry, contact_info: e.target.value})}
              required={isContactRequired}
              placeholder={isContactRequired ? t('employment.contact_info_placeholder') : ""}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-start-date-${index}`}>{t('employment.start_date')}</label>
            <input
              type="date"
              id={`edit-start-date-${index}`}
              value={editedEntry.start_date}
              onChange={(e) => setEditedEntry({...editedEntry, start_date: e.target.value})}
              required
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
                  end_date: e.target.checked ? null : editedEntry.end_date
                })}
              />
              {t('employment.is_current')}
            </label>
          </div>
          
          {!editedEntry.is_current && (
            <div className="form-group">
              <label htmlFor={`edit-end-date-${index}`}>{t('employment.end_date')}</label>
              <input
                type="date"
                id={`edit-end-date-${index}`}
                value={editedEntry.end_date || ''}
                onChange={(e) => setEditedEntry({...editedEntry, end_date: e.target.value})}
                required={!editedEntry.is_current}
              />
            </div>
          )}

          <div className="form-actions">
            <button className="cancel" onClick={handleCancel}>
              {t('common.cancel')}
            </button>
            <button className="save" onClick={handleSave}>
              {t('common.save')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="employment-entry">
      <div className="entry-header">
        <div>
          <h3 className="entry-title">
            {entry.position} {entry.company && `at ${entry.company}`}
          </h3>
          <p className="entry-subtitle">
            {entry.city}{entry.state_province && `, ${entry.state_province}`}
          </p>
          <p className="entry-dates">
            {formatDate(entry.start_date)} - {entry.is_current ? t('common.present') : formatDate(entry.end_date)}
          </p>
        </div>
        <div className="entry-actions">
          <button
            className="button icon edit"
            onClick={handleEdit}
            aria-label={t('employment.edit')}
          >
            {t('common.edit')}
          </button>
          <button
            className="button icon remove"
            onClick={onRemove}
            aria-label={t('employment.remove')}
          >
            {t('common.remove')}
          </button>
        </div>
      </div>
    </div>
  );
};