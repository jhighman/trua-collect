import React, { useState, useEffect, useCallback } from 'react';
import { useForm, FormStepId, TimelineEntry } from '../context/FormContext';
import type { FormValue } from '../utils/FormStateManager';
import { useTranslation } from '../context/TranslationContext';
import { EmploymentEntry } from './EmploymentEntry';
import type { EmploymentEntryData } from './EmploymentEntry';
import { Timeline } from './Timeline';
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
    moveToPreviousStep,
    canMovePrevious,
    formState
  } = useForm();
  
  const { t, language } = useTranslation();

  const [entries, setEntries] = useState<EmploymentEntryData[]>(() => {
    return getValue('employment-history', 'entries') as unknown as EmploymentEntryData[] || [];
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
    setValue('employment-history', 'entries', entries as unknown as TimelineEntry[]);
    const total = entries.reduce((sum, entry) => sum + (entry.duration_years || 0), 0);
    setTotalYears(total);
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

  const handleSaveEntry = () => {
    const startDate = new Date(newEntry.start_date);
    const endDate = newEntry.is_current ? new Date() : new Date(newEntry.end_date || '');
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationYears = durationMs / (1000 * 60 * 60 * 24 * 365.25);
    
    const entryWithDuration = {
      ...newEntry,
      duration_years: parseFloat(durationYears.toFixed(2))
    };
    
    const newEntries = [...entries, entryWithDuration];
    setEntries(newEntries);
    setValue('employment-history', 'entries', newEntries as unknown as TimelineEntry[]);
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
    const newEntries = entries.filter((_, i) => i !== index);
    setEntries(newEntries);
    setValue('employment-history', 'entries', newEntries as unknown as TimelineEntry[]);
  };

  const handleUpdateEntry = (index: number, entry: EmploymentEntryData) => {
    const newEntries = [...entries];
    newEntries[index] = entry;
    setEntries(newEntries);
    setValue('employment-history', 'entries', newEntries as unknown as TimelineEntry[]);
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
            endDate: entry.end_date
          }))}
          type="employment"
          requiredYears={requiredYears}
          onEntryClick={(entry) => {
            const index = entries.findIndex(e =>
              e.start_date === entry.start_date &&
              e.end_date === entry.end_date
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
        <h3>{t('employment.entries_title')}</h3>
        {entries.map((entry, index) => (
          <div key={index} className="entry-item">
            <div className="entry-content">
              <EmploymentEntry
                entry={entry}
                onUpdate={(updatedEntry) => handleUpdateEntry(index, updatedEntry)}
                onRemove={() => handleRemoveEntry(index)}
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
        {!showAddForm && (
          <button
            className="add-button"
            onClick={() => setShowAddForm(true)}
            aria-label={t('employment.add_entry')}
          >
            {t('employment.add_entry')}
          </button>
        )}

        {showAddForm && (
          <div className="add-entry-form">
            <h3>{t('employment.new_entry')}</h3>
            <EmploymentEntry
              entry={newEntry}
              onUpdate={handleSaveEntry}
              onRemove={() => {}}
              onCancel={handleCancelAdd}
              employmentTypes={employmentTypes}
              isCompanyRequired={isCompanyRequired}
              isPositionRequired={isPositionRequired}
              isContactRequired={isContactRequired}
              isNew
            />
          </div>
        )}
      </div>

      <div className="form-navigation">
        <button
          className="button secondary"
          onClick={moveToPreviousStep}
          disabled={!canMovePrevious}
        >
          {t('common.previous')}
        </button>
        <button
          className="button primary"
          onClick={moveToNextStep}
          disabled={!canMoveNext}
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  );
};