import React, { useState } from 'react';

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
  index: number;
  onUpdate: (entry: EmploymentEntryData) => void;
  onRemove: () => void;
}

export const EmploymentEntry: React.FC<EmploymentEntryProps> = ({
  entry,
  index,
  onUpdate,
  onRemove
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState<EmploymentEntryData>(entry);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedEntry({...entry});
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEntry({...entry});
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

  // Employment type options
  const employmentTypes = [
    { value: 'Job', label: 'Job' },
    { value: 'Education', label: 'Education' },
    { value: 'Unemployed', label: 'Unemployed' },
    { value: 'Other', label: 'Other' }
  ];

  // Determine if company and position fields are required based on type
  const isCompanyRequired = editedEntry.type === 'Job';
  const isPositionRequired = editedEntry.type === 'Job';
  const isContactRequired = editedEntry.type === 'Job';

  return (
    <div className="employment-entry">
      {isEditing ? (
        <div className="edit-form">
          <div className="form-group">
            <label htmlFor={`edit-type-${index}`}>Entry Type</label>
            <select
              id={`edit-type-${index}`}
              value={editedEntry.type}
              onChange={(e) => setEditedEntry({...editedEntry, type: e.target.value})}
              required
            >
              <option value="">Select Type</option>
              {employmentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-company-${index}`}>
              Company/Organization
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
              Position/Title
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
            <label htmlFor={`edit-city-${index}`}>City</label>
            <input
              type="text"
              id={`edit-city-${index}`}
              value={editedEntry.city}
              onChange={(e) => setEditedEntry({...editedEntry, city: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-state-${index}`}>State/Province</label>
            <input
              type="text"
              id={`edit-state-${index}`}
              value={editedEntry.state_province}
              onChange={(e) => setEditedEntry({...editedEntry, state_province: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-description-${index}`}>Description</label>
            <textarea
              id={`edit-description-${index}`}
              value={editedEntry.description}
              onChange={(e) => setEditedEntry({...editedEntry, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-contact-name-${index}`}>
              Contact Name
              {isContactRequired && <span aria-hidden="true"> *</span>}
            </label>
            <input
              type="text"
              id={`edit-contact-name-${index}`}
              value={editedEntry.contact_name}
              onChange={(e) => setEditedEntry({...editedEntry, contact_name: e.target.value})}
              required={isContactRequired}
              placeholder={isContactRequired ? "Name and title of reference" : ""}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-contact-info-${index}`}>
              Contact Information
              {isContactRequired && <span aria-hidden="true"> *</span>}
            </label>
            <input
              type="text"
              id={`edit-contact-info-${index}`}
              value={editedEntry.contact_info}
              onChange={(e) => setEditedEntry({...editedEntry, contact_info: e.target.value})}
              required={isContactRequired}
              placeholder={isContactRequired ? "Email or phone number" : ""}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-start-date-${index}`}>Start Date</label>
            <input
              type="date"
              id={`edit-start-date-${index}`}
              value={editedEntry.start_date}
              onChange={(e) => setEditedEntry({...editedEntry, start_date: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="checkbox"
              id={`edit-is-current-${index}`}
              checked={editedEntry.is_current}
              onChange={(e) => setEditedEntry({
                ...editedEntry, 
                is_current: e.target.checked,
                end_date: e.target.checked ? null : editedEntry.end_date
              })}
            />
            <label htmlFor={`edit-is-current-${index}`}>I currently work here</label>
          </div>
          
          {!editedEntry.is_current && (
            <div className="form-group">
              <label htmlFor={`edit-end-date-${index}`}>End Date</label>
              <input
                type="date"
                id={`edit-end-date-${index}`}
                value={editedEntry.end_date || ''}
                onChange={(e) => setEditedEntry({...editedEntry, end_date: e.target.value})}
                required
              />
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="button secondary" 
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="button primary" 
              onClick={handleSave}
              disabled={
                !editedEntry.type || 
                !editedEntry.start_date || 
                (!editedEntry.is_current && !editedEntry.end_date) ||
                (editedEntry.type === 'Job' && (!editedEntry.company || !editedEntry.position || !editedEntry.contact_name || !editedEntry.contact_info))
              }
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="entry-display" role="region" aria-label={entry.type === 'Job' ? `Employment at ${entry.company}` : entry.type}>
          <div className="entry-header">
            <h4 id={`employment-title-${index}`}>{entry.type === 'Job' ? `${entry.position} at ${entry.company}` : entry.type}</h4>
            <div className="entry-actions">
              <button
                type="button"
                className="button icon"
                onClick={handleEdit}
                aria-label="Edit employment"
                title="Edit this employment entry"
              >
                <span aria-hidden="true">✏️</span>
              </button>
              <button
                type="button"
                className="button icon"
                onClick={onRemove}
                aria-label="Remove employment"
                title="Remove this employment entry"
              >
                <span aria-hidden="true">🗑️</span>
              </button>
            </div>
          </div>
          
          <div className="entry-details">
            {entry.type === 'Job' && (
              <>
                <p>{entry.company}</p>
                {(entry.city || entry.state_province) && (
                  <p>{[entry.city, entry.state_province].filter(Boolean).join(', ')}</p>
                )}
                {entry.description && <p className="description">{entry.description}</p>}
                {entry.contact_name && (
                  <p className="contact">
                    Contact: {entry.contact_name} ({entry.contact_info})
                  </p>
                )}
              </>
            )}
            {entry.type === 'Education' && (
              <p>{entry.description || 'Education period'}</p>
            )}
            {entry.type === 'Unemployed' && (
              <p>{entry.description || 'Unemployment period'}</p>
            )}
            {entry.type === 'Other' && (
              <p>{entry.description || 'Other activity'}</p>
            )}
            <p className="date-range">
              {formatDate(entry.start_date)} - {entry.is_current ? 'Present' : formatDate(entry.end_date)}
              <span className="duration">({entry.duration_years?.toFixed(1)} years)</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};