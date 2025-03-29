import React, { useState, useEffect } from 'react';
import { useForm, FormStepId, TimelineEntry } from '../context/FormContext';
import type { FormValue } from '../utils/FormStateManager';
import { ResidenceEntry, type ResidenceEntryData } from './ResidenceEntry';
import Timeline from './Timeline';
import { DEFAULT_COUNTRY } from '../utils/countries';
import './Timeline.css';
import './ResidenceHistoryStep.css';
import { getRequirements } from '../utils/collectionKeyParser';
import { useTranslation } from '../context/TranslationContext';

// Define the interface for entries in state
interface ResidenceEntryState extends ResidenceEntryData {
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
}

export const ResidenceHistoryStep: React.FC = () => {
  const { t } = useTranslation();
  const {
    currentStep,
    setValue,
    getValue,
    getStepErrors,
    canMoveNext,
    moveToNextStep,
    moveToPreviousStep,
    canMovePrevious,
    formState,
    isStepValid
  } = useForm();

  const [entries, setEntries] = useState<ResidenceEntryState[]>(() =>
    getValue('residence-history', 'entries') as unknown as ResidenceEntryState[] || []
  );
  const [totalYears, setTotalYears] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newEntry, setNewEntry] = useState<ResidenceEntryData>({
    country: DEFAULT_COUNTRY,
    address: '',
    city: '',
    state_province: '',
    zip_postal: '',
    start_date: '',
    end_date: null,
    is_current: false,
    duration_years: 0
  });

  // Get the required years from the collection key parser
  // First, check if we have a collection key in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const key = urlParams.get('key');
  
  // If we have a key, use it to get the requirements, otherwise use the default key
  const collectionKey = key || 'en-EPMA-DTB-R5-E5-E-P-W'; // Default key with proper format
  const requirements = getRequirements(collectionKey);
  const yearsRequired = requirements.verificationSteps.residenceHistory.years;
  
  // Create translation parameters
  const translationParams = {
    years: yearsRequired.toString()
  };
  
  // Store the required years in form state
  useEffect(() => {
    const config = {
      consentsRequired: {
        yearsRequired: yearsRequired.toString()
      }
    };
    setValue('residence-history', '_config', config as unknown as FormValue);
  }, [yearsRequired, setValue]);
  
  // Load existing entries from form state
  useEffect(() => {
    // Calculate total years only
    if (entries.length > 0) {
      const total = entries.reduce((sum: number, entry: ResidenceEntryState) => 
        sum + (entry.duration_years || 0), 0);
      setTotalYears(total);
    }
  }, [entries]);

  // Update form state when entries change
  useEffect(() => {
    setValue('residence-history', 'entries', entries as unknown as TimelineEntry[]);
    
    // Calculate total years
    const total = entries.reduce((sum, entry) => sum + (entry.duration_years || 0), 0);
    setTotalYears(total);
    setValue('residence-history', 'total_years', total.toString() as unknown as FormValue);
  }, [entries, setValue]);

  const handleAddEntry = () => {
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewEntry({
      country: DEFAULT_COUNTRY,
      address: '',
      city: '',
      state_province: '',
      zip_postal: '',
      start_date: '',
      end_date: null,
      is_current: false,
      duration_years: 0
    });
  };

  const handleSaveEntry = (updatedEntry: ResidenceEntryData) => {
    // Calculate duration
    const startDate = new Date(updatedEntry.start_date);
    const endDate = updatedEntry.is_current ? new Date() : new Date(updatedEntry.end_date || '');
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationYears = durationMs / (1000 * 60 * 60 * 24 * 365.25);
    
    const entryWithDuration: ResidenceEntryState = {
      ...updatedEntry,
      duration_years: parseFloat(durationYears.toFixed(2)),
      startDate: updatedEntry.start_date,
      endDate: updatedEntry.end_date,
      isCurrent: updatedEntry.is_current
    };
    
    setEntries([...entries, entryWithDuration]);
    setShowAddForm(false);
    setNewEntry({
      country: DEFAULT_COUNTRY,
      address: '',
      city: '',
      state_province: '',
      zip_postal: '',
      start_date: '',
      end_date: null,
      is_current: false,
      duration_years: 0
    });
  };

  const handleRemoveEntry = (index: number) => {
    const updatedEntries = [...entries];
    updatedEntries.splice(index, 1);
    setEntries(updatedEntries);
  };

  const handleUpdateEntry = (index: number, updatedEntry: ResidenceEntryData) => {
    const duration = calculateDurationYears(
      updatedEntry.start_date,
      updatedEntry.end_date,
      updatedEntry.is_current
    );

    const formattedEntry: ResidenceEntryState = {
      ...updatedEntry,
      duration_years: duration,
      startDate: updatedEntry.start_date,
      endDate: updatedEntry.end_date,
      isCurrent: updatedEntry.is_current
    };

    const updatedEntries = [...entries];
    updatedEntries[index] = formattedEntry;
    setEntries(updatedEntries);
  };

  const calculateDurationYears = (startDate: string, endDate: string | null, isCurrent: boolean): number => {
    const start = new Date(startDate);
    const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : new Date());
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 365.25));
  };

  const errors = getStepErrors('residence-history');

  return (
    <div className="residence-history-step">
      <div className="step-header">
        <h2>{t('residence.title') || 'Residence History'}</h2>
        <p className="step-description">
          {t('residence.intro', translationParams) || `Please provide your complete residence history for the past ${yearsRequired} years, beginning with your current or most recent address.`}
        </p>
      </div>
      
      {/* Timeline visualization */}
      <Timeline
        entries={entries.map(entry => ({
          ...entry,
          startDate: entry.start_date,
          endDate: entry.end_date,
          type: 'residence'
        }))}
        type="residence"
        requiredYears={yearsRequired}
        onEntryClick={(entry) => {
          const index = entries.findIndex(e => 
            e.start_date === entry.startDate && 
            e.end_date === entry.endDate
          );
          if (index !== -1) {
            // Set the entry to edit mode
            const updatedEntries = [...entries];
            setEntries(updatedEntries);
          }
        }}
      />

      <div className="entries-list">
        {entries.map((entry, index) => (
          <ResidenceEntry
            key={index}
            entry={entry}
            onUpdate={(updatedEntry) => handleUpdateEntry(index, updatedEntry)}
            onDelete={() => handleRemoveEntry(index)}
          />
        ))}
      </div>

      {showAddForm ? (
        <ResidenceEntry
          entry={newEntry}
          onUpdate={handleSaveEntry}
          onDelete={handleCancelAdd}
          isEditing={true}
        />
      ) : (
        <button onClick={handleAddEntry} className="add-entry-button">
          {t('residence.add_address') || 'Add Address'}
        </button>
      )}

      <div className="step-navigation">
        <button
          onClick={moveToPreviousStep}
          disabled={!canMovePrevious}
          className="previous-button"
        >
          {t('common.previous') || 'Previous'}
        </button>
        <button
          onClick={moveToNextStep}
          disabled={!canMoveNext || totalYears < yearsRequired}
          className="next-button"
        >
          {t('common.next') || 'Next'}
        </button>
      </div>

      {errors && Array.isArray(errors) && errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error: string, index: number) => (
            <p key={index} className="error">{error}</p>
          ))}
        </div>
      )}
    </div>
  );
};