import React, { useState, useEffect } from 'react';
import { useForm } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import { EducationEntry, EducationEntryData } from './EducationEntry';
import StepNavigation from './StepNavigation';
import './EducationStep.css';
import { EducationLevel, isCollegeOrHigher } from '../types/EducationLevel';

export const EducationStep: React.FC = () => {
  const { t } = useTranslation();
  const {
    setValue,
    getValue,
    getStepErrors,
    moveToPreviousStep,
    moveToNextStep,
    canMovePrevious,
    formState  } = useForm();

  const [highestEducationLevel, setHighestEducationLevel] = useState<EducationLevel | string>(
    (getValue('education', 'highestLevel') as string) || ''
  );
  
  const [entries, setEntries] = useState<EducationEntryData[]>([]);
  const [editingEntry, setEditingEntry] = useState<EducationEntryData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  
  useEffect(() => {
    const timelineEntries = getValue('education', 'timelineEntries') as EducationEntryData[];
    if (timelineEntries && timelineEntries.length > 0) {
      setEntries(timelineEntries);
    }
    
    if (highestEducationLevel) {
      setValue('education', 'highestLevel', highestEducationLevel);
      
      if (timelineEntries && timelineEntries.length > 0) {
        setValue('education', 'timelineEntries', timelineEntries);
      }
      
      setValue('education', '_forceUpdate', Date.now());
    }
  }, [getValue, setValue, highestEducationLevel]);
  
  useEffect(() => {
    setErrors({} as Record<string, Record<string, string>>);
  }, [getStepErrors]);
  
  useEffect(() => {
    if (highestEducationLevel) {
      setValue('education', 'highestLevel', highestEducationLevel);
      
      if (entries.length > 0) {
        setValue('education', 'timelineEntries', entries);
      } else {
        setValue('education', 'timelineEntries', []);
      }
      
      setValue('education', '_touched_highestLevel', true);
      setValue('education', '_touched_timelineEntries', true);
      
      setValue('education', '_forceUpdate', Date.now());
    }
  }, [entries, formState.currentStep, highestEducationLevel, setValue]);
  
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
      
      setValue('education', 'highestLevel', highestEducationLevel);
      setValue('education', 'timelineEntries', newEntries);
      
      setValue('education', '_touched_highestLevel', true);
      setValue('education', '_touched_timelineEntries', true);
      
      setValue('education', '_forceUpdate', Date.now());
    }
  };
  
  // Handle saving an entry
  const handleSaveEntry = (entry: EducationEntryData) => {
    let newEntries: EducationEntryData[];
    
    if (entries.some(e => e.id === entry.id)) {
      // Update existing entry
      const index = entries.findIndex(e => e.id === entry.id);
      newEntries = [...entries];
      newEntries[index] = entry;
    } else {
      // Add new entry
      newEntries = [...entries, entry];
    }
    
    setEntries(newEntries);
    
    setValue('education', 'highestLevel', highestEducationLevel);
    setValue('education', 'timelineEntries', newEntries);
    
    setValue('education', '_touched_highestLevel', true);
    setValue('education', '_touched_timelineEntries', true);
    
    setEditingEntry(null);
    setShowAddForm(false);
    
    setValue('education', '_forceUpdate', Date.now());
  };
  
  // Handle canceling entry edit/add
  const handleCancelEntry = () => {
    setEditingEntry(null);
    setShowAddForm(false);
  };
  
  // Handle education level change
  const handleEducationLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value;
    setHighestEducationLevel(level);
    
    const newEntries = !isCollegeOrHigher(level) && entries.length > 0 ? [] : entries;
    if (!isCollegeOrHigher(level) && entries.length > 0) {
      setEntries([]);
    }
    
    setValue('education', 'highestLevel', level);
    setValue('education', 'timelineEntries', newEntries);
    setValue('education', '_touched_highestLevel', true);
    setValue('education', '_touched_timelineEntries', true);
    setValue('education', '_forceUpdate', Date.now());
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
          {t('education.intro') || 'Please provide your education history, beginning with your highest level of education.'}
        </p>
      </div>
      
      {/* Education Level Selection */}
      <div className="education-level-selection">
        <h3>{t('education.level_title') || 'Highest Level of Education'}</h3>
        <div className="form-group">
          <label htmlFor="education-level">
            {t('education.level_label') || 'Select your highest level of education:'}
            <span className="required">*</span>
          </label>
          <select
            id="education-level"
            value={highestEducationLevel}
            onChange={handleEducationLevelChange}
            className={!highestEducationLevel ? 'has-error' : ''}
            required
          >
            <option value="">{t('education.select_level') || 'Select level...'}</option>
            <option value={EducationLevel.LessThanHighSchool}>
              {t('education.level_less_than_high_school') || 'Less than High School'}
            </option>
            <option value={EducationLevel.HighSchool}>
              {t('education.level_high_school') || 'High School or GED'}
            </option>
            <option value={EducationLevel.SomeCollege}>
              {t('education.level_some_college') || 'Some College (no degree)'}
            </option>
            <option value={EducationLevel.Associates}>
              {t('education.level_associates') || 'Associate\'s Degree'}
            </option>
            <option value={EducationLevel.Bachelors}>
              {t('education.level_bachelors') || 'Bachelor\'s Degree'}
            </option>
            <option value={EducationLevel.Masters}>
              {t('education.level_masters') || 'Master\'s Degree'}
            </option>
            <option value={EducationLevel.Doctorate}>
              {t('education.level_doctorate') || 'Doctorate (PhD, EdD, etc.)'}
            </option>
            <option value={EducationLevel.Professional}>
              {t('education.level_professional') || 'Professional Degree (MD, JD, etc.)'}
            </option>
          </select>
          {!highestEducationLevel && (
            <div className="error-message">
              {t('education.level_required') || 'Please select your highest level of education'}
            </div>
          )}
        </div>
      </div>
      
      {/* Only show degree entry if education level is college or higher */}
      {isCollegeOrHigher(highestEducationLevel) && (
        <>
          <div className="college-education-section">
            <h3>{t('education.college_title') || 'College Education Details'}</h3>
            <p className="section-description">
              {t('education.college_intro') || 'Please provide details about your college education.'}
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
                {t('education.add_button') || 'Add Degree'}
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Form status */}
      <div className="form-status">
        {highestEducationLevel ? (
          isCollegeOrHigher(highestEducationLevel) ? (
            // For college or higher, we need entries
            entries.length > 0 ? (
              <div className="valid-status">
                {t('education.valid') || 'Education information is complete'}
              </div>
            ) : (
              <div className="invalid-status">
                {t('education.college_required') || 'Please add at least one degree'}
              </div>
            )
          ) : (
            // For non-college, just having the level is enough
            <div className="valid-status">
              {t('education.valid') || 'Education information is complete'}
            </div>
          )
        ) : (
          <div className="invalid-status">
            {t('education.level_required') || 'Please select your highest level of education'}
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      <StepNavigation
        onPrevious={moveToPreviousStep}
        onNext={() => {
          const isEducationComplete = highestEducationLevel &&
            (!isCollegeOrHigher(highestEducationLevel) || entries.length > 0);
          
          if (isEducationComplete) {
            setValue('education', 'highestLevel', highestEducationLevel);
            setValue('education', 'timelineEntries', entries.length > 0 ? entries : []);
            
            setValue('education', '_touched_highestLevel', true);
            setValue('education', '_touched_timelineEntries', true);
            
            setValue('education', '_forceUpdate', Date.now());
            
            setTimeout(() => {
              moveToNextStep();
            }, 50);
          }
        }}
        canMovePrevious={canMovePrevious}
        canMoveNext={!!highestEducationLevel && (!isCollegeOrHigher(highestEducationLevel) || entries.length > 0)}
      />
    </div>
  );
};

export default EducationStep;