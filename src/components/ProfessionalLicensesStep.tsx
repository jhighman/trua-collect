import React, { useState, useEffect } from 'react';
import { useForm, TimelineEntry } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import { ProfessionalLicenseEntry, ProfessionalLicenseEntryData } from './ProfessionalLicenseEntry';
import StepNavigation from './StepNavigation';
import './ProfessionalLicensesStep.css';

export const ProfessionalLicensesStep: React.FC = () => {
  const { t } = useTranslation();
  const {
    setValue,
    getValue,
    getStepErrors,
    isStepValid,
    canMoveNext,
    moveToNextStep,
    moveToPreviousStep,
    canMovePrevious
  } = useForm();
  
  const [entries, setEntries] = useState<ProfessionalLicenseEntryData[]>([]);
  const [editingEntry, setEditingEntry] = useState<ProfessionalLicenseEntryData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});
  
  // Add proper type assertions for license entries
  const licenseEntries = (getValue('professional-licenses', 'entries') || []) as unknown as ProfessionalLicenseEntryData[];

  useEffect(() => {
    const entries = (getValue('professional-licenses', 'entries') || []) as unknown as ProfessionalLicenseEntryData[];
    if (entries && entries.length > 0) {
      setEntries(entries);
    }
  }, [getValue]);
  
  // Get errors from form context
  useEffect(() => {
    const formErrors = getStepErrors('professional-licenses');
    setErrors({} as Record<string, Record<string, string>>);
  }, [getStepErrors]);
  
  // Create a new empty entry
  const createEmptyEntry = (): ProfessionalLicenseEntryData => ({
    id: `license-${Date.now()}`,
    licenseType: '',
    licenseNumber: '',
    issuingAuthority: '',
    issueDate: '',
    expirationDate: '',
    isActive: false,
    state: '',
    country: '',
    description: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  });
  
  // Handle adding a new entry
  const handleAddEntry = () => {
    setEditingEntry(createEmptyEntry());
    setShowAddForm(true);
  };
  
  // Handle editing an existing entry
  const handleEditEntry = (entry: ProfessionalLicenseEntryData) => {
    setEditingEntry(entry);
    setShowAddForm(true);
  };
  
  // Handle removing an entry
  const handleRemoveEntry = (entryId: string) => {
    const index = entries.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
      const newEntries = entries.filter(entry => entry.id !== entryId);
      setEntries(newEntries);
      setValue('professional-licenses', 'entries', newEntries as unknown as TimelineEntry[]);
    }
  };
  
  // Handle saving an entry
  const handleSaveEntry = (entry: ProfessionalLicenseEntryData) => {
    let newEntries: ProfessionalLicenseEntryData[];
    
    if (entries.some(e => e.id === entry.id)) {
      // Update existing entry
      newEntries = entries.map(e => e.id === entry.id ? entry : e);
    } else {
      // Add new entry
      newEntries = [...entries, entry];
    }
    
    setEntries(newEntries);
    setValue('professional-licenses', 'entries', newEntries as unknown as TimelineEntry[]);
    
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
    <div className="licenses-step">
      <div className="step-header">
        <h2>{t('licenses.title') || 'Professional Licenses'}</h2>
        <p className="step-description">
          {t('licenses.intro') || 'Please provide information about your professional licenses and certifications.'}
        </p>
      </div>
      
      {/* List of existing entries */}
      {entries.length > 0 && (
        <div className="entries-list">
          <div className="entries-subtitle">
            {t('licenses.entries_title') || 'Your Professional Licenses'}
          </div>
          
          {entries.map(entry => (
            <div key={entry.id} className="entry-item">
              <div className="entry-content">
                <strong className="entry-type">{entry.licenseType}</strong>
                <p className="entry-number">{t('licenses.license_number') || 'License Number'}: {entry.licenseNumber}</p>
                <p className="entry-authority">{t('licenses.issuing_authority') || 'Issuing Authority'}: {entry.issuingAuthority}</p>
                <p className="entry-dates">
                  {t('licenses.issue_date') || 'Issue Date'}: {formatDate(entry.issueDate)}
                  {!entry.isActive && entry.expirationDate && (
                    <> | {t('licenses.expiration_date') || 'Expiration Date'}: {formatDate(entry.expirationDate)}</>
                  )}
                  {entry.isActive && (
                    <> | <span className="active-badge">{t('licenses.active') || 'Active'}</span></>
                  )}
                </p>
                {(entry.state || entry.country) && (
                  <p className="entry-location">
                    {entry.state && entry.country ? `${entry.state}, ${entry.country}` : entry.state || entry.country}
                  </p>
                )}
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
        <ProfessionalLicenseEntry
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
            className="btn btn-primary btn-lg btn-block"
            onClick={handleAddEntry}
          >
            {t('licenses.add_button') || 'Add Professional License'}
          </button>
        </div>
      )}
      
      {/* Form status */}
      <div className="form-status">
        {isStepValid('professional-licenses') ? (
          <div className="valid-status">
            {t('licenses.valid') || 'Professional license information is complete'}
          </div>
        ) : (
          <div className="invalid-status">
            {t('licenses.invalid') || 'Please complete all required professional license information'}
          </div>
        )}
      </div>
      
      {/* Navigation buttons */}
      <StepNavigation
        onPrevious={moveToPreviousStep}
        onNext={() => {
          console.log('Next button clicked');
          console.log('Can move next:', canMoveNext);
          
          // Check if the professional-licenses step is complete
          const isComplete = entries.length > 0;
          console.log('Is professional-licenses complete:', isComplete);
          
          if (isComplete) {
            console.log('Moving to next step');
            moveToNextStep();
          } else {
            console.log('Professional-licenses step is not complete, cannot move next');
          }
        }}
        canMovePrevious={canMovePrevious}
        canMoveNext={canMoveNext}
      />
    </div>
  );
};

export default ProfessionalLicensesStep;