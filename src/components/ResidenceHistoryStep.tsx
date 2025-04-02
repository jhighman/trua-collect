import React, { useState, useEffect } from 'react';
import { useForm, FormStepId, TimelineEntry } from '../context/FormContext';
import type { FormValue } from '../utils/FormStateManager';
import { ResidenceEntry, type ResidenceEntryData } from './ResidenceEntry';
import Timeline from './Timeline';
import { DEFAULT_COUNTRY } from '../utils/countries';
import StepNavigation from './StepNavigation';
import { Button } from './ui/button';
import { Card, CardHeader } from './ui/card';
import { InfoIcon } from 'lucide-react';
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
  const { t, language } = useTranslation();
  
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
    isStepValid,
    forceSetCurrentStep,
    forceNextStep
  } = useForm();
const [entries, setEntries] = useState<ResidenceEntryState[]>(() => {
  const storedEntries = getValue('residence-history', 'entries');
  console.log('ResidenceHistoryStep - Initial stored entries:', storedEntries);
  
  if (Array.isArray(storedEntries)) {
    // Convert TimelineEntry format to ResidenceEntryState format
    return storedEntries.map(entry => ({
      ...entry,
      start_date: entry.startDate || entry.start_date,
      end_date: entry.endDate || entry.end_date,
      is_current: entry.isCurrent || entry.is_current,
      country: entry.country || '',
      address: entry.address || '',
      city: entry.city || '',
      state_province: entry.state_province || '',
      zip_postal: entry.zip_postal || '',
      duration_years: entry.duration_years || 0
    })) as unknown as ResidenceEntryState[];
  }
  
  return [] as ResidenceEntryState[];
});
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
  const collectionKey = key || 'en-N-N-R3-E3-E-P-C'; // Use the same default as in EnvironmentConfig.ts
  const requirements = getRequirements(collectionKey);
  const yearsRequired = requirements.verificationSteps.residenceHistory.years;
  
  // Create translation parameters
  const translationParams = {
    years: yearsRequired.toString()
  };
  // Store the required years in form state
  useEffect(() => {
    console.log('ResidenceHistoryStep - useEffect for storing required years triggered with yearsRequired:', yearsRequired);
    
    const config = {
      consentsRequired: {
        yearsRequired: yearsRequired.toString()
      }
    };
    console.log('ResidenceHistoryStep - Setting _config with:', config);
    setValue('residence-history', '_config', config as unknown as FormValue);
  }, [yearsRequired, setValue]);
  
  // Load existing entries from form state
  useEffect(() => {
    console.log('ResidenceHistoryStep - useEffect for calculating total years triggered with entries:', entries);
    
    // Calculate total years only
    if (entries.length > 0) {
      const total = entries.reduce((sum: number, entry: ResidenceEntryState) =>
        sum + (entry.duration_years || 0), 0);
      console.log('ResidenceHistoryStep - Calculated total years in load useEffect:', total);
      setTotalYears(total);
    } else {
      console.log('ResidenceHistoryStep - No entries to calculate total years');
    }
  }, [entries]);

  // Update form state when entries change
  useEffect(() => {
    console.log('ResidenceHistoryStep - useEffect for entries change triggered with entries:', entries);
    
    // Ensure entries have the required TimelineEntry properties
    const timelineEntries = entries.map(entry => ({
      ...entry,
      startDate: entry.start_date,
      endDate: entry.end_date,
      isCurrent: entry.is_current
    })) as unknown as TimelineEntry[];
    
    console.log('ResidenceHistoryStep - Formatted timeline entries:', timelineEntries);
    setValue('residence-history', 'entries', timelineEntries);
    
    // Calculate total years
    const total = entries.reduce((sum, entry) => sum + (entry.duration_years || 0), 0);
    console.log('ResidenceHistoryStep - Calculated total years in useEffect:', total);
    setTotalYears(total);
    setValue('residence-history', 'total_years', total.toString() as unknown as FormValue);
    
    // Mark the step as complete and valid if we have enough years
    const isComplete = total >= yearsRequired;
    console.log('ResidenceHistoryStep - Is complete in useEffect:', isComplete);
    setValue('residence-history', 'isComplete', isComplete);
    setValue('residence-history', '_complete', isComplete);
    setValue('residence-history', 'isValid', isComplete);
    
    // Force a refresh of the form state to update the navigation state
    if (isComplete) {
      // This forces the FormContext to recalculate the navigation state
      console.log('ResidenceHistoryStep - Forcing current step in useEffect:', currentStep);
      forceSetCurrentStep(currentStep);
    }
    
    console.log('ResidenceHistoryStep - Total years:', total, 'Required years:', yearsRequired, 'Is complete:', isComplete, 'Is valid:', isComplete);
  }, [entries, setValue, yearsRequired, forceSetCurrentStep, currentStep]);

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
    console.log('ResidenceHistoryStep - handleSaveEntry called with entry:', updatedEntry);
    
    // Calculate duration
    const startDate = new Date(updatedEntry.start_date);
    const endDate = updatedEntry.is_current ? new Date() : new Date(updatedEntry.end_date || '');
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationYears = durationMs / (1000 * 60 * 60 * 24 * 365.25);
    
    console.log('ResidenceHistoryStep - Calculated duration:', durationYears);
    
    const entryWithDuration: ResidenceEntryState = {
      ...updatedEntry,
      duration_years: parseFloat(durationYears.toFixed(2)),
      startDate: updatedEntry.start_date,
      endDate: updatedEntry.end_date,
      isCurrent: updatedEntry.is_current
    };
    
    console.log('ResidenceHistoryStep - Entry with duration:', entryWithDuration);
    
    // Update the entries state
    const newEntries = [...entries, entryWithDuration];
    console.log('ResidenceHistoryStep - New entries array:', newEntries);
    
    // Calculate total years immediately
    const total = newEntries.reduce((sum, entry) => sum + (entry.duration_years || 0), 0);
    console.log('ResidenceHistoryStep - Total years:', total, 'Required years:', yearsRequired);
    
    // Update local state
    setEntries(newEntries);
    setTotalYears(total);
    
    // Format entries for form state
    const timelineEntries = newEntries.map(entry => ({
      ...entry,
      startDate: entry.start_date,
      endDate: entry.end_date,
      isCurrent: entry.is_current,
      type: 'residence'
    }));
    
    // Update form state
    setValue('residence-history', 'entries', timelineEntries as unknown as FormValue);
    setValue('residence-history', 'total_years', total.toString() as unknown as FormValue);
    setValue('residence-history', 'isComplete', total >= yearsRequired);
    setValue('residence-history', '_complete', total >= yearsRequired);
    setValue('residence-history', 'isValid', total >= yearsRequired);
    
    // Reset the form
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

    // If we have enough years, move to next step
    if (total >= yearsRequired) {
      forceNextStep();
    }
  };

  const handleRemoveEntry = (index: number) => {
    console.log('ResidenceHistoryStep - handleRemoveEntry called with index:', index);
    
    const updatedEntries = [...entries];
    updatedEntries.splice(index, 1);
    console.log('ResidenceHistoryStep - Updated entries array after removal:', updatedEntries);
    setEntries(updatedEntries);
    
    // Calculate total years immediately
    const total = updatedEntries.reduce((sum, entry) => sum + (entry.duration_years || 0), 0);
    console.log('ResidenceHistoryStep - Total years after removal:', total);
    setTotalYears(total);
    const isComplete = total >= yearsRequired;
    
    // Ensure entries have the required TimelineEntry properties
    const timelineEntries = updatedEntries.map(entry => ({
      ...entry,
      startDate: entry.start_date,
      endDate: entry.end_date,
      isCurrent: entry.is_current
    })) as unknown as TimelineEntry[];
    
    // Update form state directly
    console.log('ResidenceHistoryStep - Setting value for residence-history.entries after removal:', timelineEntries);
    setValue('residence-history', 'entries', timelineEntries);
    setValue('residence-history', 'total_years', total.toString() as unknown as FormValue);
    setValue('residence-history', 'isComplete', isComplete);
    setValue('residence-history', '_complete', isComplete);
    setValue('residence-history', 'isValid', isComplete);
    
    // Force refresh
    console.log('ResidenceHistoryStep - Forcing current step after removal:', currentStep);
    forceSetCurrentStep(currentStep);
  };

  const handleUpdateEntry = (index: number, updatedEntry: ResidenceEntryData) => {
    console.log('ResidenceHistoryStep - handleUpdateEntry called with index:', index, 'entry:', updatedEntry);
    
    const duration = calculateDurationYears(
      updatedEntry.start_date,
      updatedEntry.end_date,
      updatedEntry.is_current
    );
    console.log('ResidenceHistoryStep - Calculated duration:', duration);

    const formattedEntry: ResidenceEntryState = {
      ...updatedEntry,
      duration_years: duration,
      startDate: updatedEntry.start_date,
      endDate: updatedEntry.end_date,
      isCurrent: updatedEntry.is_current
    };
    console.log('ResidenceHistoryStep - Formatted entry:', formattedEntry);

    const updatedEntries = [...entries];
    updatedEntries[index] = formattedEntry;
    console.log('ResidenceHistoryStep - Updated entries array:', updatedEntries);
    setEntries(updatedEntries);
    
    // Calculate total years immediately
    const total = updatedEntries.reduce((sum, entry) => sum + (entry.duration_years || 0), 0);
    console.log('ResidenceHistoryStep - Total years:', total, 'Required years:', yearsRequired);
    setTotalYears(total);
    const isComplete = total >= yearsRequired;
    
    // Ensure entries have the required TimelineEntry properties
    const timelineEntries = updatedEntries.map(entry => ({
      ...entry,
      startDate: entry.start_date,
      endDate: entry.end_date,
      isCurrent: entry.is_current
    })) as unknown as TimelineEntry[];
    
    // Update form state directly
    console.log('ResidenceHistoryStep - Setting value for residence-history.entries:', timelineEntries);
    setValue('residence-history', 'entries', timelineEntries);
    console.log('ResidenceHistoryStep - Setting value for residence-history.total_years:', total);
    setValue('residence-history', 'total_years', total.toString() as unknown as FormValue);
    console.log('ResidenceHistoryStep - Setting value for residence-history.isComplete:', isComplete);
    setValue('residence-history', 'isComplete', isComplete);
    setValue('residence-history', '_complete', isComplete);
    setValue('residence-history', 'isValid', isComplete);
    
    // Force refresh
    console.log('ResidenceHistoryStep - Forcing current step to:', currentStep);
    forceSetCurrentStep(currentStep);
    
    // Directly move to the next step if we have enough years
    if (isComplete) {
      console.log('ResidenceHistoryStep - Forcing next step');
      forceNextStep();
    }
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
      <Card className="mb-6 w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold tracking-tight">{t('residence.title')}</h2>
            <InfoIcon className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {t('residence.intro', translationParams)}
          </p>
        </CardHeader>
      </Card>
      
      {entries.length > 0 && (
        <>
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
        </>
      )}

      {showAddForm ? (
        <ResidenceEntry
          entry={newEntry}
          onUpdate={handleSaveEntry}
          onDelete={handleCancelAdd}
          isEditing={true}
        />
      ) : (
        <Button
          onClick={handleAddEntry}
          className="w-full max-w-md mx-auto mb-8 py-6 text-lg font-medium bg-primary hover:bg-primary/90"
          size="lg"
        >
          {t('residence.add_button')}
        </Button>
      )}

      <StepNavigation
        onNext={moveToNextStep}
        onPrevious={moveToPreviousStep}
        canMoveNext={totalYears >= yearsRequired}
        canMovePrevious={canMovePrevious}
      />
      
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