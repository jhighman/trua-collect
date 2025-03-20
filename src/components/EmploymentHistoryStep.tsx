import React, { useState, useEffect, useCallback } from 'react';
import { useForm, FormStepId } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import { EmploymentEntry } from './EmploymentEntry';
import type { EmploymentEntryData } from './EmploymentEntry';

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
    // Initialize state with existing entries
    return getValue('employment-history', 'entries') || [];
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

  // Default to 7 years if not specified
  const requiredYears = 7;
  
  // Move the getValue call outside useEffect and memoize it
  const getExistingEntries = useCallback(() => {
    return getValue('employment-history', 'entries') || [];
  }, [getValue]);

  useEffect(() => {
    const existingEntries = getExistingEntries();
    setEntries(existingEntries);
    
    // Calculate total years
    if (existingEntries.length > 0) {
      const total = existingEntries.reduce((sum: number, entry: EmploymentEntryData) => 
        sum + (entry.duration_years || 0), 0);
      setTotalYears(total);
    }
  }, [getExistingEntries]); // Only depend on the memoized getter

  // Update form state when entries change
  useEffect(() => {
    setValue('employment-history', 'entries', entries);
    
    // Calculate total years
    const total = entries.reduce((sum, entry) => sum + (entry.duration_years || 0), 0);
    setTotalYears(total);
    setValue('employment-history', 'total_years', total);
  }, [entries, setValue]);

  const handleAddEntry = (entry: EmploymentEntryData) => {
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    setValue('employment-history', 'entries', newEntries);
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
    // Calculate duration
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
    setValue('employment-history', 'entries', newEntries);
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
    setValue('employment-history', 'entries', newEntries);
  };

  const handleUpdateEntry = (index: number, entry: EmploymentEntryData) => {
    const newEntries = [...entries];
    newEntries[index] = entry;
    setEntries(newEntries);
    setValue('employment-history', 'entries', newEntries);
  };

  // Employment type options
  const employmentTypes = [
    { value: 'Job', label: t('employment.type_job') },
    { value: 'Education', label: t('employment.type_education') },
    { value: 'Unemployed', label: t('employment.type_unemployed') },
    { value: 'Other', label: t('employment.type_other') }
  ];

  // Determine if company and position fields are required based on type
  const isCompanyRequired = newEntry.type === 'Job';
  const isPositionRequired = newEntry.type === 'Job';
  const isContactRequired = newEntry.type === 'Job';

  const errors = getStepErrors('employment-history');

  return (
    <div className="employment-history-step">
      <h2>{t('employment.title')}</h2>
      <p>{t('employment.intro', { years: requiredYears.toString() })}</p>
      
      {/* Progress indicator */}
      <div className="timeline-progress" role="region" aria-label={t('employment.progress_label', { required: requiredYears.toString() })}>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, (totalYears / requiredYears) * 100)}%` }}
            role="progressbar"
            aria-valuenow={parseFloat(totalYears.toFixed(1))}
            aria-valuemin={0}
            aria-valuemax={requiredYears}
          ></div>
        </div>
        <div className="progress-text">
          {t('employment.progress', {
            current: totalYears.toFixed(1),
            required: requiredYears.toString()
          })}
        </div>
      </div>
      
      {errors._timeline && (
        <div className="error-message" role="alert" aria-live="assertive">{errors._timeline}</div>
      )}
      
      {/* List of existing entries */}
      {entries.length > 0 && (
        <div className="entries-list">
          <h3>{t('employment.entries_title')}</h3>
          {entries.map((entry, index) => (
            <EmploymentEntry
              key={index}
              entry={entry}
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
          <h3>{t('employment.add_title')}</h3>
          
          <div className="form-group">
            <label htmlFor="type" id="type-label">
              {t('employment.type')}
              <span className="required-indicator" aria-hidden="true"> *</span>
            </label>
            <select
              id="type"
              value={newEntry.type}
              onChange={(e) => setNewEntry({...newEntry, type: e.target.value})}
              required
              aria-required="true"
              aria-labelledby="type-label"
              aria-describedby="type-error"
            >
              <option value="">{t('employment.select_type')}</option>
              {employmentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            {!newEntry.type && (
              <div id="type-error" className="error-message" aria-live="polite">
                {t('validation.required')}
              </div>
            )}
          </div>
          
          {newEntry.type && (
            <>
              {/* Conditional fields based on type */}
              {newEntry.type === 'Job' && (
                <>
                  <div className="form-group">
                    <label htmlFor="company">{t('employment.company')}</label>
                    <input
                      type="text"
                      id="company"
                      value={newEntry.company}
                      onChange={(e) => setNewEntry({...newEntry, company: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="position">{t('employment.position')}</label>
                    <input
                      type="text"
                      id="position"
                      value={newEntry.position}
                      onChange={(e) => setNewEntry({...newEntry, position: e.target.value})}
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
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state_province">State/Province</label>
                    <input
                      type="text"
                      id="state_province"
                      value={newEntry.state_province}
                      onChange={(e) => setNewEntry({...newEntry, state_province: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="contact_name">Contact Name</label>
                    <input
                      type="text"
                      id="contact_name"
                      value={newEntry.contact_name}
                      onChange={(e) => setNewEntry({...newEntry, contact_name: e.target.value})}
                      required
                      placeholder="Name and title of reference"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="contact_info">Contact Information</label>
                    <input
                      type="text"
                      id="contact_info"
                      value={newEntry.contact_info}
                      onChange={(e) => setNewEntry({...newEntry, contact_info: e.target.value})}
                      required
                      placeholder="Email or phone number"
                    />
                  </div>
                </>
              )}
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={newEntry.description}
                  onChange={(e) => setNewEntry({...newEntry, description: e.target.value})}
                  rows={3}
                  placeholder={
                    newEntry.type === 'Job' ? "Describe your responsibilities and achievements" :
                    newEntry.type === 'Education' ? "Describe your education during this period" :
                    newEntry.type === 'Unemployed' ? "Explain your activities during this period" :
                    "Describe this period"
                  }
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
                <label htmlFor="is_current">
                  {newEntry.type === 'Job' ? "I currently work here" : 
                   newEntry.type === 'Education' ? "I am currently studying here" :
                   "This is my current status"}
                </label>
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
            </>
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
                !newEntry.type || 
                !newEntry.start_date || 
                (!newEntry.is_current && !newEntry.end_date) ||
                (newEntry.type === 'Job' && (!newEntry.company || !newEntry.position || !newEntry.contact_name || !newEntry.contact_info))
              }
            >
              Save Entry
            </button>
          </div>
        </div>
      ) : (
        <button 
          type="button" 
          className="button secondary" 
          onClick={() => handleAddEntry({
            type: '',
            company: '',
            position: '',
            city: '',
            state_province: '',
            description: '',
            contact_name: '',
            contact_info: '',
            start_date: '',
            end_date: null,
            is_current: false
          })}
        >
          Add Employment Entry
        </button>
      )}
      
      {/* Navigation buttons */}
      <nav className="form-navigation" aria-label={t('navigation.form_controls')}>
        <button
          type="button"
          className="button secondary"
          onClick={moveToPreviousStep}
          disabled={!canMovePrevious}
          aria-label={t('navigation.previous_step')}
        >
          {t('common.previous')}
        </button>
        <button
          type="button"
          className="button primary"
          onClick={moveToNextStep}
          disabled={!canMoveNext}
          aria-label={t('navigation.next_step')}
        >
          {t('common.next')}
        </button>
      </nav>
    </div>
  );
};