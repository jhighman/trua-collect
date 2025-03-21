import React, { useState, useEffect } from 'react';
import { useForm, FormStepId } from '../context/FormContext';
import { ResidenceEntry } from './ResidenceEntry';
import Timeline from './Timeline';
import './Timeline.css';
import './ResidenceHistoryStep.css';
import { getRequirements } from '../utils/collectionKeyParser';
import { useTranslation } from '../context/TranslationContext';

// Define the base interface for residence entry data
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
    getValue('residence-history', 'entries') || []
  );
  const [totalYears, setTotalYears] = useState<number>(0);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newEntry, setNewEntry] = useState<ResidenceEntryData>({
    address: '',
    city: '',
    state_province: '',
    zip_postal: '',
    country: '',
    start_date: '',
    end_date: null,
    is_current: false
  });

  // Get the required years from the collection key parser
  // First, check if we have a collection key in the URL
  const urlParams = new URLSearchParams(window.location.search);
  const key = urlParams.get('key');
  
  // If we have a key, use it to get the requirements, otherwise use the default key
  const collectionKey = key || 'en000111100100'; // Default key with 7 years for residence history
  const requirements = getRequirements(collectionKey);
  const requiredYears = requirements.verification_steps.residence_history.years;
  
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
    setValue('residence-history', 'entries', entries);
    
    // Calculate total years
    const total = entries.reduce((sum, entry) => sum + (entry.duration_years || 0), 0);
    setTotalYears(total);
    setValue('residence-history', 'total_years', total);
  }, [entries, setValue]);

  const handleAddEntry = () => {
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewEntry({
      address: '',
      city: '',
      state_province: '',
      zip_postal: '',
      country: '',
      start_date: '',
      end_date: null,
      is_current: false
    });
  };

  const handleSaveEntry = () => {
    // Calculate duration
    const startDate = new Date(newEntry.start_date);
    const endDate = newEntry.is_current ? new Date() : new Date(newEntry.end_date || '');
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationYears = durationMs / (1000 * 60 * 60 * 24 * 365.25);
    
    const entryWithDuration: ResidenceEntryState = {
      ...newEntry,
      duration_years: parseFloat(durationYears.toFixed(2)),
      startDate: newEntry.start_date,
      endDate: newEntry.end_date,
      isCurrent: newEntry.is_current
    };
    
    setEntries([...entries, entryWithDuration]);
    setShowAddForm(false);
    setNewEntry({
      address: '',
      city: '',
      state_province: '',
      zip_postal: '',
      country: '',
      start_date: '',
      end_date: null,
      is_current: false
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
          {t('residence.intro') || `Please provide your complete residence history for the past ${requiredYears} years, beginning with your current or most recent address.`}
        </p>
      </div>
      
      {/* Timeline visualization */}
      <Timeline
        entries={entries.map(entry => ({
          ...entry,
          startDate: entry.start_date,
          endDate: entry.end_date
        }))}
        type="residence"
        requiredYears={requiredYears}
        onEntryClick={(entry) => {
          // Find the index of the entry in the entries array
          const index = entries.findIndex(e =>
            e.start_date === entry.start_date &&
            e.end_date === entry.end_date
          );
          if (index !== -1) {
            // Open the edit form for this entry
            const entryElement = document.querySelector(`.residence-entry:nth-child(${index + 1}) .button.icon[aria-label="Edit residence"]`);
            if (entryElement) {
              (entryElement as HTMLElement).click();
            }
          }
        }}
      />
      
      {errors._timeline && (
        <div className="error-message">{errors._timeline}</div>
      )}
      
      {/* List of existing entries */}
      {entries.length > 0 && (
        <div className="entries-list">
          <h3>Your Residences</h3>
          {entries.map((entry: ResidenceEntryState, index: number) => (
            <ResidenceEntry
              key={index}
              entry={{
                address: entry.address,
                city: entry.city,
                state_province: entry.state_province,
                zip_postal: entry.zip_postal,
                country: entry.country,
                start_date: entry.startDate,
                end_date: entry.endDate,
                is_current: entry.isCurrent
              }}
              index={index}
              onUpdate={(updatedEntry) => handleUpdateEntry(index, updatedEntry)}
              onRemove={() => handleRemoveEntry(index)}
            />
          ))}
        </div>
      )}
      
      {/* Add new entry form */}
      {showAddForm ? (
        <div className="add-entry-form">
          <h3>Add Residence</h3>
          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input
              type="text"
              id="address"
              value={newEntry.address}
              onChange={(e) => setNewEntry({...newEntry, address: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              value={newEntry.city}
              onChange={(e) => setNewEntry({...newEntry, city: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="state_province">State/Province</label>
            <input
              type="text"
              id="state_province"
              value={newEntry.state_province}
              onChange={(e) => setNewEntry({...newEntry, state_province: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="zip_postal">ZIP/Postal Code</label>
            <input
              type="text"
              id="zip_postal"
              value={newEntry.zip_postal}
              onChange={(e) => setNewEntry({...newEntry, zip_postal: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <input
              type="text"
              id="country"
              value={newEntry.country}
              onChange={(e) => setNewEntry({...newEntry, country: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="start_date">Start Date</label>
            <input
              type="date"
              id="start_date"
              value={newEntry.start_date}
              onChange={(e) => setNewEntry({...newEntry, start_date: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <input
              type="checkbox"
              id="is_current"
              checked={newEntry.is_current}
              onChange={(e) => setNewEntry({
                ...newEntry, 
                is_current: e.target.checked,
                end_date: e.target.checked ? null : newEntry.end_date
              })}
            />
            <label htmlFor="is_current">I currently live at this address</label>
          </div>
          
          {!newEntry.is_current && (
            <div className="form-group">
              <label htmlFor="end_date">End Date</label>
              <input
                type="date"
                id="end_date"
                value={newEntry.end_date || ''}
                onChange={(e) => setNewEntry({...newEntry, end_date: e.target.value})}
                required
              />
            </div>
          )}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="button secondary" 
              onClick={handleCancelAdd}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="button primary" 
              onClick={handleSaveEntry}
              disabled={
                !newEntry.address || 
                !newEntry.city || 
                !newEntry.state_province || 
                !newEntry.zip_postal || 
                !newEntry.country || 
                !newEntry.start_date || 
                (!newEntry.is_current && !newEntry.end_date)
              }
            >
              Save Residence
            </button>
          </div>
        </div>
      ) : (
        <div className="add-entry-container">
          <button
            type="button"
            className="add-button"
            onClick={handleAddEntry}
          >
            {t('residence.add_button') || 'Add Residence'}
          </button>
        </div>
      )}
      
      {/* Form status */}
      <div className="form-status">
        {isStepValid('residence-history') ? (
          <div className="valid-status">
            {t('residence.valid') || 'Residence history information is complete'}
          </div>
        ) : (
          <div className="invalid-status">
            {t('residence.invalid') || `Please provide a complete residence history for the past ${requiredYears} years`}
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
          onClick={moveToNextStep}
          disabled={!canMoveNext}
        >
          {t('common.next') || 'Next'}
        </button>
      </div>
    </div>
  );
};