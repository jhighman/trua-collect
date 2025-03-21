import React, { useState, useEffect } from 'react';
import { useForm } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import { EducationEntry, EducationEntryData } from './EducationEntry';
import './EducationStep.css';
import { EducationLevel, isCollegeOrHigher } from '../types/EducationLevel';
import { FormStepId } from '../utils/FormConfigGenerator';

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
    getTimelineEntries,
    canMoveNext,
    moveToNextStep,
    moveToPreviousStep,
    canMovePrevious,
    formState,
    forceNextStep,
    moveToStep
  } = useForm();

  // State for highest education level
  const [highestEducationLevel, setHighestEducationLevel] = useState<EducationLevel | string>(
    getValue('education', 'highestLevel') || ''
  );
  
  const [entries, setEntries] = useState<EducationEntryData[]>([]);
  const [editingEntry, setEditingEntry] = useState<EducationEntryData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  
  // Debug log
  useEffect(() => {
    console.log('Education step form state:', formState);
    console.log('Current step in form state:', formState.currentStep);
    console.log('Can move next:', canMoveNext);
    
    // Check if the current step in the form state doesn't match the component
    if (formState.currentStep !== 'education') {
      console.warn('EducationStep: Current step mismatch! Form state step:', formState.currentStep);
      console.warn('EducationStep: This component should only be rendered when the current step is education');
      
      // Force a move to the education step if needed
      try {
        moveToStep('education');
        console.log('EducationStep: Forced move to education step');
      } catch (error) {
        console.error('EducationStep: Error forcing move to education step:', error);
      }
    }
    
    // Check if the education step is complete
    if (formState.steps.education) {
      const educationStep = formState.steps.education;
      console.log('Education step values:', educationStep.values);
      console.log('Education step is valid:', educationStep.isValid);
      console.log('Education step is complete:', educationStep.isComplete);
      
      // Check if the Next button should be enabled
      if (highestEducationLevel) {
        if (isCollegeOrHigher(highestEducationLevel)) {
          console.log('College or higher education - entries required');
          console.log('Has entries:', entries.length > 0);
          console.log('Next button should be enabled:', entries.length > 0);
        } else {
          console.log('Non-college education - no entries required');
          console.log('Next button should be enabled:', true);
        }
      } else {
        console.log('No education level selected');
        console.log('Next button should be enabled:', false);
      }
    }
  }, [formState, canMoveNext, highestEducationLevel, entries, moveToStep]);
  
  // Get entries from form context
  useEffect(() => {
    const timelineEntries = getTimelineEntries('education') as EducationEntryData[];
    if (timelineEntries && timelineEntries.length > 0) {
      setEntries(timelineEntries);
    }
    
    // Force an update of the education step's values
    if (highestEducationLevel) {
      console.log('Initializing education step with level:', highestEducationLevel);
      setValue('education', 'highestLevel', highestEducationLevel);
      
      if (timelineEntries && timelineEntries.length > 0) {
        console.log('Initializing education step with entries:', timelineEntries);
        setValue('education', 'entries', timelineEntries);
      }
      
      // Force validation update
      setTimeout(() => {
        console.log('Forcing initial validation update');
        setValue('education', '_forceUpdate', Date.now());
      }, 0);
    }
  }, [getTimelineEntries, setValue, highestEducationLevel]);
  
  // Get errors from form context
  useEffect(() => {
    const formErrors = getStepErrors('education');
    setErrors({} as Record<string, Record<string, string>>);
  }, [getStepErrors]);
  
  // Force a validation update when the component mounts
  useEffect(() => {
    console.log('Education step mounted');
    
    // Verify we're on the education step and not reverting to personal-info
    console.log('Current step on mount:', formState.currentStep);
    
    // Force an update of the education step's values
    if (highestEducationLevel) {
      console.log('Setting education level on mount:', highestEducationLevel);
      
      // Set values directly and individually
      setValue('education', 'highestLevel', highestEducationLevel);
      
      if (entries.length > 0) {
        setValue('education', 'entries', entries);
      } else {
        setValue('education', 'entries', []);
      }
      
      // Force all fields to be touched
      setValue('education', '_touched_highestLevel', true);
      setValue('education', '_touched_entries', true);
      
      // Log the updated values
      console.log('Set education values - highestLevel:', highestEducationLevel);
      console.log('Set education values - entries:', entries.length > 0 ? entries : []);
    }
    
    // Force validation update - use a single timeout to avoid state reversion
    const timeoutId = setTimeout(() => {
      console.log('Forcing validation update on mount');
      setValue('education', '_forceUpdate', Date.now());
      
      // Log the form state immediately after the update
      console.log('Form state after validation update:', formState);
      console.log('Current step after validation update:', formState.currentStep);
      
      // Check if the education step is in the form state
      if (formState.steps.education) {
        console.log('Education step values after update:', formState.steps.education.values);
        console.log('Education step touched after update:', formState.steps.education.touched);
        console.log('Education step isValid:', formState.steps.education.isValid);
        console.log('Education step isComplete:', formState.steps.education.isComplete);
      } else {
        console.log('Education step not found in form state');
      }
    }, 50);
    
    // Clean up the timeout if the component unmounts
    return () => clearTimeout(timeoutId);
  }, [formState.currentStep]); // Add formState.currentStep as a dependency to re-run when it changes
  
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
    console.log('Removing education entry with ID:', entryId);
    
    const index = entries.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
      const newEntries = entries.filter(entry => entry.id !== entryId);
      console.log('Entries after removal:', newEntries);
      
      setEntries(newEntries);
      
      // Set values directly and individually
      setValue('education', 'highestLevel', highestEducationLevel);
      setValue('education', 'entries', newEntries);
      
      // Force all fields to be touched
      setValue('education', '_touched_highestLevel', true);
      setValue('education', '_touched_entries', true);
      
      console.log('Set education values - highestLevel:', highestEducationLevel);
      console.log('Set education values - entries:', newEntries);
      
      // Force validation update
      setTimeout(() => {
        console.log('Forcing validation update after entry removal');
        setValue('education', '_forceUpdate', Date.now());
        
        // Log the form state after a short delay to allow for updates
        setTimeout(() => {
          console.log('Form state after entry removal:', formState);
          console.log('Can move next after entry removal:', canMoveNext);
          
          // Check if the education step is in the form state
          if (formState.steps.education) {
            console.log('Education step values after removal:', formState.steps.education.values);
            console.log('Education step touched after removal:', formState.steps.education.touched);
            console.log('Education step isValid after removal:', formState.steps.education.isValid);
            console.log('Education step isComplete after removal:', formState.steps.education.isComplete);
          } else {
            console.log('Education step not found in form state');
          }
        }, 100);
      }, 0);
    }
  };
  
  // Handle saving an entry
  const handleSaveEntry = (entry: EducationEntryData) => {
    console.log('Saving education entry:', entry);
    
    let newEntries: EducationEntryData[];
    
    if (entries.some(e => e.id === entry.id)) {
      // Update existing entry
      const index = entries.findIndex(e => e.id === entry.id);
      newEntries = [...entries];
      newEntries[index] = entry;
      console.log('Updated entry at index:', index);
    } else {
      // Add new entry
      newEntries = [...entries, entry];
      console.log('Added new entry, new count:', newEntries.length);
    }
    
    setEntries(newEntries);
    
    // Set values directly and individually
    setValue('education', 'highestLevel', highestEducationLevel);
    setValue('education', 'entries', newEntries);
    
    // Force all fields to be touched
    setValue('education', '_touched_highestLevel', true);
    setValue('education', '_touched_entries', true);
    
    console.log('Set education values - highestLevel:', highestEducationLevel);
    console.log('Set education values - entries:', newEntries);
    
    setEditingEntry(null);
    setShowAddForm(false);
    
    // Force validation update
    setTimeout(() => {
      console.log('Forcing validation update after entry save');
      setValue('education', '_forceUpdate', Date.now());
      
      // Log the form state after a short delay to allow for updates
      setTimeout(() => {
        console.log('Form state after entry save:', formState);
        console.log('Can move next after entry save:', canMoveNext);
        
        // Check if the education step is in the form state
        if (formState.steps.education) {
          console.log('Education step values after save:', formState.steps.education.values);
          console.log('Education step touched after save:', formState.steps.education.touched);
          console.log('Education step isValid after save:', formState.steps.education.isValid);
          console.log('Education step isComplete after save:', formState.steps.education.isComplete);
        } else {
          console.log('Education step not found in form state');
        }
      }, 100);
    }, 0);
  };
  
  // Handle canceling entry edit/add
  const handleCancelEntry = () => {
    setEditingEntry(null);
    setShowAddForm(false);
  };
  
  // Handle education level change
  const handleEducationLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = e.target.value;
    console.log('Education level changed to:', level);
    console.log('Is college or higher:', isCollegeOrHigher(level));
    
    setHighestEducationLevel(level);
    
    // If the level is not college or higher, clear any existing entries
    const newEntries = !isCollegeOrHigher(level) && entries.length > 0 ? [] : entries;
    if (!isCollegeOrHigher(level) && entries.length > 0) {
      console.log('Clearing entries for non-college education');
      setEntries([]);
    }
    
    // Set values directly and individually
    setValue('education', 'highestLevel', level);
    setValue('education', 'entries', newEntries);
    
    // Force all fields to be touched
    setValue('education', '_touched_highestLevel', true);
    setValue('education', '_touched_entries', true);
    
    console.log('Set education values - highestLevel:', level);
    console.log('Set education values - entries:', newEntries);
    
    // Force validation update
    setTimeout(() => {
      console.log('Forcing validation update after education level change');
      // This will trigger a re-validation of the step
      setValue('education', '_forceUpdate', Date.now());
      
      // Log the form state after a short delay to allow for updates
      setTimeout(() => {
        console.log('Form state after education level change:', formState);
        console.log('Can move next after education level change:', canMoveNext);
        
        // Check if the education step is in the form state
        if (formState.steps.education) {
          console.log('Education step values after level change:', formState.steps.education.values);
          console.log('Education step touched after level change:', formState.steps.education.touched);
          console.log('Education step isValid after level change:', formState.steps.education.isValid);
          console.log('Education step isComplete after level change:', formState.steps.education.isComplete);
        } else {
          console.log('Education step not found in form state');
        }
      }, 100);
    }, 0);
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
      <div className="form-navigation">
        <button
          type="button"
          className="button secondary"
          onClick={moveToPreviousStep}
          disabled={!canMovePrevious}
        >
          {t('common.previous') || 'Previous'}
        </button>
        <button
          type="button"
          className="button primary"
          onClick={() => {
            console.log('Next button clicked');
            console.log('Can move next:', canMoveNext);
            console.log('Education level:', highestEducationLevel);
            console.log('Is college or higher:', isCollegeOrHigher(highestEducationLevel));
            console.log('Has entries:', entries.length > 0);
            
            // Check if the education step is complete according to our own logic
            const isEducationComplete = highestEducationLevel &&
              (!isCollegeOrHigher(highestEducationLevel) || entries.length > 0);
            
            console.log('Is education complete:', isEducationComplete);
            
            if (isEducationComplete) {
              // Set values directly and individually
              setValue('education', 'highestLevel', highestEducationLevel);
              setValue('education', 'entries', entries.length > 0 ? entries : []);
              
              // Force all fields to be touched
              setValue('education', '_touched_highestLevel', true);
              setValue('education', '_touched_entries', true);
              
              console.log('Set education values - highestLevel:', highestEducationLevel);
              console.log('Set education values - entries:', entries.length > 0 ? entries : []);
              
              // Force validation update before moving to next step
              setValue('education', '_forceUpdate', Date.now());
              
              // Use a timeout to ensure the state is updated before navigation
              setTimeout(() => {
                console.log('Moving to next step after validation update');
                moveToNextStep();
              }, 50);
            } else {
              console.log('Education step is not complete, cannot move next');
            }
          }}
          // Disable the button only if the education level is not set or if it's college or higher and there are no entries
          disabled={!highestEducationLevel || (isCollegeOrHigher(highestEducationLevel) && entries.length === 0)}
        >
          {t('common.next') || 'Next'}
        </button>
      </div>
    </div>
  );
};

export default EducationStep;