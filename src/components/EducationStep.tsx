import React, { useState, useEffect } from 'react';
import { useForm } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import { EducationEntry, EducationEntryData } from './EducationEntry';
import './EducationStep.css';

export const EducationStep: React.FC = () => {
  const { t } = useTranslation();
  const {
    setValue,
    getValue,
    getStepErrors,
    isStepValid,
    addTimelineEntry,
    updateTimelineEntry,
    removeTimelineEntry,
    getTimelineEntries
  } = useForm();
  
  const [entries, setEntries] = useState<EducationEntryData[]>([]);
  const [editingEntry, setEditingEntry] = useState<EducationEntryData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  
  // Get entries from form context
  useEffect(() => {
    const timelineEntries = getTimelineEntries('education') as EducationEntryData[];
    if (timelineEntries && timelineEntries.length > 0) {
      setEntries(timelineEntries);
    }
  }, [getTimelineEntries]);
  
  // Get errors from form context
  useEffect(() => {
    const formErrors = getStepErrors('education');
    setErrors({} as Record<string, Record<string, string>>);
  }, [getStepErrors]);
  
  // Create a new empty entry
  const createEmptyEntry = (): EducationEntryData => ({
    id: `education-${Date.now()}`,
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    description: '',
    location: ''
  });
  
  // Handle adding a new entry
  const handleAddEntry = () => {
    setEditingEntry(createEmptyEntry());
    setShowAddForm(true);
  };
  
  // Handle editing an existing entry
  const handleEditEntry = (entry: EducationEntryData) => {
    setEditingEntry(entry);
    setShowAddForm(true);
  };
  
  // Handle removing an entry
  const handleRemoveEntry = (entryId: string) => {
    const index = entries.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
      const newEntries = entries.filter(entry => entry.id !== entryId);
      setEntries(newEntries);
      setValue('education', 'entries', newEntries);
    }
  };
  
  // Handle saving an entry
  const handleSaveEntry = (entry: EducationEntryData) => {
    if (entries.some(e => e.id === entry.id)) {
      // Update existing entry
      const index = entries.findIndex(e => e.id === entry.id);
      const newEntries = [...entries];
      newEntries[index] = entry;
      setEntries(newEntries);
      setValue('education', 'entries', newEntries);
    } else {
      // Add new entry
      const newEntries = [...entries, entry];
      setEntries(newEntries);
      setValue('education', 'entries', newEntries);
    }
    
    setEditingEntry(null);
    setShowAddForm(false);
  };
  
  // Handle canceling entry edit/add
  const handleCancelEntry = () => {
    setEditingEntry(null);
    setShowAddForm(false);
  };
  
  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="education-step">
      <div className="step-header">
        <h2>{t('education.title') || 'Education History'}</h2>
        <p className="step-description">
          {t('education.intro') || 'Please provide your education history, beginning with your most recent education.'}
        </p>
      </div>
      
      {/* List of existing entries */}
      {entries.length > 0 && (
        <div className="entries-list">
          <h3>{t('education.entries_title') || 'Your Education'}</h3>
          
          {entries.map(entry => (
            <div key={entry.id} className="entry-item">
              <div className="entry-content">
                <h4>{entry.institution}</h4>
                <p className="entry-degree">{entry.degree}{entry.fieldOfStudy ? ` - ${entry.fieldOfStudy}` : ''}</p>
                <p className="entry-dates">
                  {formatDate(entry.startDate)} - {entry.isCurrent ? (t('common.present') || 'Present') : formatDate(entry.endDate)}
                </p>
                {entry.location && <p className="entry-location">{entry.location}</p>}
                {entry.description && <p className="entry-description">{entry.description}</p>}
              </div>
              
              <div className="entry-actions">
                <button
                  type="button"
                  className="edit-button"
                  onClick={() => handleEditEntry(entry)}
                  aria-label={t('common.edit') || 'Edit'}
                >
                  {t('common.edit') || 'Edit'}
                </button>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => handleRemoveEntry(entry.id)}
                  aria-label={t('common.remove') || 'Remove'}
                >
                  {t('common.remove') || 'Remove'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add/Edit form */}
      {showAddForm && editingEntry && (
        <EducationEntry
          entry={editingEntry}
          onSave={handleSaveEntry}
          onCancel={handleCancelEntry}
          errors={errors[editingEntry.id] || {}}
        />
      )}
      
      {/* Add button (only show if not currently adding/editing) */}
      {!showAddForm && (
        <div className="add-entry-container">
          <button
            type="button"
            className="add-button"
            onClick={handleAddEntry}
          >
            {t('education.add_button') || 'Add Education'}
          </button>
        </div>
      )}
      
      {/* Form status */}
      <div className="form-status">
        {isStepValid('education') ? (
          <div className="valid-status">
            {t('education.valid') || 'Education information is complete'}
          </div>
        ) : (
          <div className="invalid-status">
            {t('education.invalid') || 'Please complete all required education information'}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationStep;