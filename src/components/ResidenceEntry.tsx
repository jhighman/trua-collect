import React, { useState } from 'react';

interface ResidenceEntryData {
  address: string;
  city: string;
  state_province: string;
  zip_postal: string;
  country: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  duration_years?: number;
}

interface ResidenceEntryProps {
  entry: ResidenceEntryData;
  index: number;
  onUpdate: (updatedEntry: ResidenceEntryData) => void;
  onRemove: () => void;
}

export const ResidenceEntry: React.FC<ResidenceEntryProps> = ({
  entry,
  index,
  onUpdate,
  onRemove
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState<ResidenceEntryData>(entry);

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

  return (
    <div className="residence-entry">
      {isEditing ? (
        <div className="edit-form">
          <div className="form-group">
            <label htmlFor={`edit-address-${index}`}>Street Address</label>
            <input
              type="text"
              id={`edit-address-${index}`}
              value={editedEntry.address}
              onChange={(e) => setEditedEntry({...editedEntry, address: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-city-${index}`}>City</label>
            <input
              type="text"
              id={`edit-city-${index}`}
              value={editedEntry.city}
              onChange={(e) => setEditedEntry({...editedEntry, city: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-state-${index}`}>State/Province</label>
            <input
              type="text"
              id={`edit-state-${index}`}
              value={editedEntry.state_province}
              onChange={(e) => setEditedEntry({...editedEntry, state_province: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-zip-${index}`}>ZIP/Postal Code</label>
            <input
              type="text"
              id={`edit-zip-${index}`}
              value={editedEntry.zip_postal}
              onChange={(e) => setEditedEntry({...editedEntry, zip_postal: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor={`edit-country-${index}`}>Country</label>
            <input
              type="text"
              id={`edit-country-${index}`}
              value={editedEntry.country}
              onChange={(e) => setEditedEntry({...editedEntry, country: e.target.value})}
              required
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
            <label htmlFor={`edit-is-current-${index}`}>I currently live at this address</label>
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
                !editedEntry.address || 
                !editedEntry.city || 
                !editedEntry.state_province || 
                !editedEntry.zip_postal || 
                !editedEntry.country || 
                !editedEntry.start_date || 
                (!editedEntry.is_current && !editedEntry.end_date)
              }
            >
              Save Changes
            </button>
          </div>
        </div>
      ) : (
        <div className="entry-display">
          <div className="entry-header">
            <h4>{entry.address}</h4>
            <div className="entry-actions">
              <button 
                type="button" 
                className="button icon" 
                onClick={handleEdit}
                aria-label="Edit residence"
              >
                ✏️
              </button>
              <button 
                type="button" 
                className="button icon" 
                onClick={onRemove}
                aria-label="Remove residence"
              >
                🗑️
              </button>
            </div>
          </div>
          
          <div className="entry-details">
            <p>{entry.city}, {entry.state_province} {entry.zip_postal}</p>
            <p>{entry.country}</p>
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