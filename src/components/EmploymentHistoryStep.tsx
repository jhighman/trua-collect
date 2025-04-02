import React, { useState, useEffect, useCallback } from 'react';
import { useForm, FormStepId, TimelineEntry } from '../context/FormContext';
import type { FormValue } from '../utils/FormStateManager';
import { useTranslation } from '../context/TranslationContext';
import { EmploymentEntry } from './EmploymentEntry';
import type { EmploymentEntryData } from './EmploymentEntry';
import { Timeline } from './Timeline';
import StepNavigation from './StepNavigation';
import './EmploymentHistoryStep.css';
import './Timeline.css';
import { getRequirements } from '../utils/collectionKeyParser';

export const EmploymentHistoryStep: React.FC = () => {
  const {
    currentStep,
    setValue,
    getValue,
    getStepErrors,
    canMoveNext,
    moveToNextStep,
    forceNextStep,
    moveToPreviousStep,
    canMovePrevious,
    formState
  } = useForm();
  
  const { t, language } = useTranslation();

  const [entries, setEntries] = useState<EmploymentEntryData[]>(() => {
    const storedEntries = getValue('employment-history', 'entries');
    console.log('EmploymentHistoryStep - Initial stored entries:', storedEntries);
    
    if (Array.isArray(storedEntries)) {
      // Convert TimelineEntry format to EmploymentEntryData format
      return storedEntries.map(entry => ({
        ...entry,
        start_date: entry.startDate || entry.start_date,
        end_date: entry.endDate || entry.end_date,
        is_current: entry.isCurrent || entry.is_current,
        type: entry.type || '',
        company: entry.company || '',
        position: entry.position || '',
        city: entry.city || '',
        state_province: entry.state_province || '',
        description: entry.description || '',
        contact_name: entry.contact_name || '',
        contact_info: entry.contact_info || '',
        duration_years: entry.duration_years || 0
      })) as unknown as EmploymentEntryData[];
    }
    
    return [] as EmploymentEntryData[];
  });

  const [totalYears, setTotalYears] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newEntry, setNewEntry] = useState<EmploymentEntryData>({
    type: '',
    company: '',
    position: '',
    city: '',
    state_province: '',
    start_date: '',
    end_date: null,
    is_current: false,
    description: '',
    contact_name: '',
    contact_info: ''
  });

  // Get the required years from the collection key parser
  const urlParams = new URLSearchParams(window.location.search);
  const key = urlParams.get('key');
  const collectionKey = key || 'en-EPMA-DTB-R5-E5-E-P-W';
  const requirements = getRequirements(collectionKey);
  const requiredYears = requirements.verificationSteps.employmentHistory.modes.years || 1;
  
  // Move the getValue call outside useEffect and memoize it
  const getExistingEntries = useCallback(() => {
    return getValue('employment-history', 'entries') as unknown as EmploymentEntryData[] || [];
  }, [getValue]);

  useEffect(() => {
    const existingEntries = getExistingEntries();
    setEntries(existingEntries);
    
    if (existingEntries.length > 0) {
      const total = existingEntries.reduce((sum: number, entry: EmploymentEntryData) => 
        sum + (entry.duration_years || 0), 0);
      setTotalYears(total);
    }
  }, [getExistingEntries]);

  useEffect(() => {
    // Ensure entries have the required TimelineEntry properties
    const timelineEntries = entries.map(entry => ({
      ...entry,
      startDate: entry.start_date,
      endDate: entry.end_date,
      isCurrent: entry.is_current
    })) as unknown as TimelineEntry[];
    
    console.log('EmploymentHistoryStep - Setting entries in form state:', timelineEntries);
    setValue('employment-history', 'entries', timelineEntries);
    
    const total = entries.reduce((sum, entry) => sum + (entry.duration_years || 0), 0);
    console.log('EmploymentHistoryStep - Total years:', total, 'Required years:', requiredYears);
    setValue('employment-history', 'total_years', total as unknown as FormValue);
    
    // Update step validation based on total years
    if (total >= requiredYears) {
      setValue('employment-history', 'isValid', true as unknown as FormValue);
      setValue('employment-history', 'isComplete', true as unknown as FormValue);
    } else {
      setValue('employment-history', 'isValid', false as unknown as FormValue);
      setValue('employment-history', 'isComplete', false as unknown as FormValue);
    }
  }, [entries, setValue, requiredYears]);

  const handleAddEntry = (entry: EmploymentEntryData) => {
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    setValue('employment-history', 'entries', newEntries as unknown as TimelineEntry[]);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewEntry({
      type: '',
      company: '',
      position: '',
      city: '',
      state_province: '',
      start_date: '',
      end_date: null,
      is_current: false,
      description: '',
      contact_name: '',
      contact_info: ''
    });
  };

  const handleSaveEntry = (entry: EmploymentEntryData) => {
    console.log('handleSaveEntry called with entry:', entry);
    
    const startDate = new Date(entry.start_date);
    const endDate = entry.is_current ? new Date() : new Date(entry.end_date || '');
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationYears = durationMs / (1000 * 60 * 60 * 24 * 365.25);
    
    console.log('Calculated duration:', durationYears);
    
    const entryWithDuration = {
      ...entry,
      duration_years: parseFloat(durationYears.toFixed(2))
    };
    
    console.log('Entry with duration:', entryWithDuration);
    
    const newEntries = [...entries, entryWithDuration];
    console.log('New entries array:', newEntries);
    
    setEntries(newEntries);
    
    // Ensure entries have the required TimelineEntry properties
    const timelineEntries = newEntries.map(entry => ({
      ...entry,
      startDate: entry.start_date,
      endDate: entry.end_date,
      isCurrent: entry.is_current
    })) as unknown as TimelineEntry[];
    
    console.log('EmploymentHistoryStep - Setting entries in handleSaveEntry:', timelineEntries);
    setValue('employment-history', 'entries', timelineEntries);
    
    // Calculate total years and update form state
    const total = newEntries.reduce((sum, entry) => sum + (entry.duration_years || 0), 0);
    console.log('EmploymentHistoryStep - Total years in handleSaveEntry:', total, 'Required years:', requiredYears);
    
    setValue('employment-history', 'total_years', total as unknown as FormValue);
    
    // Update step validation based on total years
    const isComplete = total >= requiredYears;
    setValue('employment-history', 'isValid', isComplete as unknown as FormValue);
    setValue('employment-history', 'isComplete', isComplete as unknown as FormValue);
    
    // If we have enough years, move to the next step
    if (isComplete) {
      forceNextStep();
    }
    
    setShowAddForm(false);
    setNewEntry({
      type: '',
      company: '',
      position: '',
      city: '',
      state_province: '',
      start_date: '',
      end_date: null,
      is_current: false,
      description: '',
      contact_name: '',
      contact_info: ''
    });
  };

  const handleRemoveEntry = (index: number) => {
    console.log('EmploymentHistoryStep - Removing entry at index:', index);
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    
    // Ensure entries have the required TimelineEntry properties
    const timelineEntries = newEntries.map(entry => ({
      ...entry,
      startDate: entry.start_date,
      endDate: entry.end_date,
      isCurrent: entry.is_current
    })) as unknown as TimelineEntry[];
    
    console.log('EmploymentHistoryStep - Setting entries in handleRemoveEntry:', timelineEntries);
    setValue('employment-history', 'entries', timelineEntries);
    
    // Calculate total years and update form state
    const total = newEntries.reduce((sum, e) => sum + (e.duration_years || 0), 0);
    console.log('EmploymentHistoryStep - Total years in handleRemoveEntry:', total);
    setValue('employment-history', 'total_years', total as unknown as FormValue);
    
    // Update step validation based on total years
    const isComplete = total >= requiredYears;
    setValue('employment-history', 'isValid', isComplete as unknown as FormValue);
    setValue('employment-history', 'isComplete', isComplete as unknown as FormValue);
  };

  const handleUpdateEntry = (index: number, entry: EmploymentEntryData) => {
    // Calculate duration
    const startDate = new Date(entry.start_date);
    const endDate = entry.is_current ? new Date() : new Date(entry.end_date || '');
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationYears = durationMs / (1000 * 60 * 60 * 24 * 365.25);
    
    const entryWithDuration = {
      ...entry,
      duration_years: parseFloat(durationYears.toFixed(2))
    };
    const newEntries = [...entries];
    newEntries[index] = entryWithDuration;
    setEntries(newEntries);
    
    // Ensure entries have the required TimelineEntry properties
    const timelineEntries = newEntries.map(entry => ({
      ...entry,
      startDate: entry.start_date,
      endDate: entry.end_date,
      isCurrent: entry.is_current
    })) as unknown as TimelineEntry[];
    
    console.log('EmploymentHistoryStep - Setting entries in handleUpdateEntry:', timelineEntries);
    setValue('employment-history', 'entries', timelineEntries);
    
    // Calculate total years and update form state
    const total = newEntries.reduce((sum, e) => sum + (e.duration_years || 0), 0);
    console.log('EmploymentHistoryStep - Total years in handleUpdateEntry:', total, 'Required years:', requiredYears);
    setValue('employment-history', 'total_years', total as unknown as FormValue);
    
    // Update step validation based on total years
    const isComplete = total >= requiredYears;
    setValue('employment-history', 'isValid', isComplete as unknown as FormValue);
    setValue('employment-history', 'isComplete', isComplete as unknown as FormValue);
    
    
    // If we have enough years, move to the next step
    if (isComplete) {
      forceNextStep();
    }
  };

  const employmentTypes = [
    { value: 'Job', label: t('employment.type_job') },
    { value: 'Education', label: t('employment.type_education') },
    { value: 'Unemployed', label: t('employment.type_unemployed') },
    { value: 'Other', label: t('employment.type_other') }
  ];

  const isCompanyRequired = newEntry.type === 'Job';
  const isPositionRequired = newEntry.type === 'Job';
  const isContactRequired = newEntry.type === 'Job';

  const errors = getStepErrors('employment-history');

  return (
    <div className="employment-history-step">
      <div className="step-header">
      <h2>{t('employment.title')}</h2>
        <p className="step-description">{t('employment.intro', { years: requiredYears.toString() })}</p>
      </div>
      
      <div className="timeline-container">
      <Timeline
        entries={entries.map(entry => ({
          ...entry,
          startDate: entry.start_date,
            endDate: entry.end_date,
            duration_years: entry.duration_years
        }))}
        type="employment"
        requiredYears={requiredYears}
        onEntryClick={(entry) => {
          const index = entries.findIndex(e =>
              e.start_date === entry.startDate &&
              e.end_date === entry.endDate
          );
          if (index !== -1) {
            const entryElement = document.querySelector(`.employment-entry:nth-child(${index + 1}) .button.icon[aria-label="Edit employment"]`);
            if (entryElement) {
              (entryElement as HTMLElement).click();
            }
          }
        }}
      />
      
      {errors._timeline && (
        <div className="error-message" role="alert" aria-live="assertive">{errors._timeline}</div>
      )}
      </div>
      
        <div className="entries-list">
          <h3>Your Employment History</h3>
          {entries.map((entry, index) => (
          <div key={index} className="entry-item">
            <div className="entry-content">
            <EmploymentEntry
              entry={entry}
              onUpdate={(updatedEntry) => handleUpdateEntry(index, updatedEntry)}
              onDelete={() => handleRemoveEntry(index)}
              employmentTypes={employmentTypes}
              isCompanyRequired={isCompanyRequired}
              isPositionRequired={isPositionRequired}
              isContactRequired={isContactRequired}
            />
            </div>
          </div>
        ))}
                  </div>
                  
      <div className="add-entry-container">
        {showAddForm ? (
          <EmploymentEntry
            entry={newEntry}
            onUpdate={(updatedEntry) => {
              console.log('EmploymentHistoryStep - onUpdate called with entry:', updatedEntry);
              // Call handleSaveEntry with the updated entry
              handleSaveEntry(updatedEntry);
            }}
            onDelete={handleCancelAdd}
            isEditing={true}
            employmentTypes={employmentTypes}
            isCompanyRequired={isCompanyRequired}
            isPositionRequired={isPositionRequired}
            isContactRequired={isContactRequired}
          />
        ) : (
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary btn-lg btn-block">
            Add Employment
          </button>
        )}
      </div>

      <StepNavigation
        onNext={forceNextStep}
        onPrevious={moveToPreviousStep}
        canMoveNext={totalYears >= requiredYears}
        canMovePrevious={canMovePrevious}
      />
    </div>
  );
};