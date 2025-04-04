import React, { useState, useEffect } from 'react';
import { useForm, TimelineEntry } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import { ProfessionalLicenseEntry, ProfessionalLicenseEntryData } from './ProfessionalLicenseEntry';
import StepNavigation from './StepNavigation';
import StepHeader from './StepHeader';
import { PushButton } from './ui/push-button';
import { PlusCircle } from 'lucide-react';
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
  const [hasAttemptedNext, setHasAttemptedNext] = useState(false);
  
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
      <StepHeader
        title={t('licenses.title')}
        description={t('licenses.intro')}
      />
      
      {/* List of existing entries */}
      {entries.length > 0 && (
        <div className="entries-list">
          <div className="entries-subtitle">
            {t('licenses.entries_title')}
          </div>
          
          {entries.map(entry => (
            <div key={entry.id} className="entry-item">
              <div className="entry-content">
                <strong className="entry-type">{entry.licenseType}</strong>
                <p className="entry-number">{t('licenses.license_number')}: {entry.licenseNumber}</p>
                <p className="entry-authority">{t('licenses.issuing_authority')}: {entry.issuingAuthority}</p>
                <p className="entry-dates">
                  {t('licenses.issue_date')}: {formatDate(entry.issueDate)}
                  {!entry.isActive && entry.expirationDate && (
                    <> | {t('licenses.expiration_date')}: {formatDate(entry.expirationDate)}</>
                  )}
                  {entry.isActive && (
                    <> | <span className="active-badge">{t('licenses.active')}</span></>
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
                  aria-label={t('common.edit')}
                >
                  {t('common.edit')}
                </button>
                <button
                  type="button"
                  className="remove-button"
                  onClick={() => handleRemoveEntry(entry.id)}
                  aria-label={t('common.remove')}
                >
                  {t('common.remove')}
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
        <PushButton
          onClick={handleAddEntry}
          className="w-full max-w-md mx-auto mb-8 py-6 text-lg font-medium bg-primary hover:bg-primary/90"
          size="lg"
          icon={PlusCircle}
        >
          {t('licenses.add_button')}
        </PushButton>
      )}
      
      {/* Form status - only show when validation is needed */}
      <div className="form-status">
        {hasAttemptedNext && !isStepValid('professional-licenses') && (
          <div className="validation-error">
            {t('licenses.validation.required')}
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <StepNavigation
        canMovePrevious={canMovePrevious}
        canMoveNext={canMoveNext}
        onNext={() => {
          setHasAttemptedNext(true);
          if (isStepValid('professional-licenses')) {
            moveToNextStep();
          }
        }}
        onPrevious={moveToPreviousStep}
      />
    </div>
  );
};

export default ProfessionalLicensesStep;