import React, { useState, useEffect } from 'react';
import { useForm } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import { EducationEntry, EducationEntryData } from './EducationEntry';
import StepNavigation from './StepNavigation';
import StepHeader from './StepHeader';
import { PlusCircle } from 'lucide-react';
import { PushButton } from './ui/push-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { FormError, FormField } from './ui/form-error';
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
  const [showLevelError, setShowLevelError] = useState(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [hasAttemptedNext, setHasAttemptedNext] = useState<boolean>(false);
  
  // Function to get the translated education level text
  const getEducationLevelText = (level: string): string => {
    switch (level) {
      case EducationLevel.LessThanHighSchool:
        return t('education.level_less_than_high_school');
      case EducationLevel.HighSchool:
        return t('education.level_high_school');
      case EducationLevel.SomeCollege:
        return t('education.level_some_college');
      case EducationLevel.Associates:
        return t('education.level_associates');
      case EducationLevel.Bachelors:
        return t('education.level_bachelors');
      case EducationLevel.Masters:
        return t('education.level_masters');
      case EducationLevel.Doctorate:
        return t('education.level_doctorate');
      case EducationLevel.Professional:
        return t('education.level_professional');
      default:
        return '';
    }
  };
  
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
      setValue('education', 'forceUpdate', Date.now());
    }
  }, [getValue, setValue, highestEducationLevel]);
  
  useEffect(() => {
    setErrors({} as Record<string, Record<string, string>>);
  }, [getStepErrors]);
  
  // Update showDropdown state when component mounts
  useEffect(() => {
    setShowDropdown(!highestEducationLevel || highestEducationLevel === '');
  }, []);
  
  useEffect(() => {
    if (highestEducationLevel) {
      setValue('education', 'highestLevel', highestEducationLevel);
      
      if (entries.length > 0) {
        setValue('education', 'timelineEntries', entries);
      } else {
        setValue('education', 'timelineEntries', []);
      }
      
      setValue('education', 'touchedHighestLevel', true);
      setValue('education', 'touchedTimelineEntries', true);
      setValue('education', 'forceUpdate', Date.now());
    }
  }, [entries, formState.currentStepId, highestEducationLevel, setValue]);
  
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
      
      setValue('education', 'touchedHighestLevel', true);
      setValue('education', 'touchedTimelineEntries', true);
      setValue('education', 'forceUpdate', Date.now());
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
    
    setValue('education', 'touchedHighestLevel', true);
    setValue('education', 'touchedTimelineEntries', true);
    
    setEditingEntry(null);
    setShowAddForm(false);
    setValue('education', 'forceUpdate', Date.now());
  };
  
  // Handle canceling entry edit/add
  const handleCancelEntry = () => {
    setEditingEntry(null);
    setShowAddForm(false);
  };
  
  // Handle education level change
  const handleEducationLevelChange = (value: string) => {
    setHighestEducationLevel(value);
    setShowDropdown(false);
    // Don't show error when user selects a value
    
    const newEntries = !isCollegeOrHigher(value) && entries.length > 0 ? [] : entries;
    if (!isCollegeOrHigher(value) && entries.length > 0) {
      setEntries([]);
    }
    
    setValue('education', 'highestLevel', value);
    setValue('education', 'timelineEntries', newEntries);
    setValue('education', 'touchedHighestLevel', true);
    setValue('education', 'touchedTimelineEntries', true);
    setValue('education', 'forceUpdate', Date.now());
  };
  
  return (
    <div className="education-step">
      <StepHeader
        title={t('education.title')}
        description={t('education.intro')}
      />
      
      {/* Education Level Selection - Only show if no selection has been made or if dropdown is open */}
      {(!highestEducationLevel || showDropdown) && (
        <div className="education-level-selection">
          <h3>{t('education.level_title')}</h3>
          <div className="space-y-3">
            <Label htmlFor="education-level" className="flex items-center gap-1 text-base font-medium">
              {t('education.level_label')}
              <span className="text-destructive">*</span>
            </Label>
            <FormField error={showLevelError ? t('validation.required') : ''}>
              <Select
                value={highestEducationLevel}
                onValueChange={handleEducationLevelChange}
              >
                <SelectTrigger className={`w-full h-11 text-base select-trigger ${showLevelError ? 'border-destructive ring-destructive' : ''}`}>
                  <SelectValue placeholder={t('education.select_level')} />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  sideOffset={5}
                  align="start"
                  className="select-content-dropdown"
                >
                  <SelectItem value={EducationLevel.LessThanHighSchool} className="select-item">
                    {t('education.level_less_than_high_school')}
                  </SelectItem>
                  <SelectItem value={EducationLevel.HighSchool} className="select-item">
                    {t('education.level_high_school')}
                  </SelectItem>
                  <SelectItem value={EducationLevel.SomeCollege} className="select-item">
                    {t('education.level_some_college')}
                  </SelectItem>
                  <SelectItem value={EducationLevel.Associates} className="select-item">
                    {t('education.level_associates')}
                  </SelectItem>
                  <SelectItem value={EducationLevel.Bachelors} className="select-item">
                    {t('education.level_bachelors')}
                  </SelectItem>
                  <SelectItem value={EducationLevel.Masters} className="select-item">
                    {t('education.level_masters')}
                  </SelectItem>
                  <SelectItem value={EducationLevel.Doctorate} className="select-item">
                    {t('education.level_doctorate')}
                  </SelectItem>
                  <SelectItem value={EducationLevel.Professional} className="select-item">
                    {t('education.level_professional')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>
        </div>
      )}
      
      {/* Education level selected section */}
      {highestEducationLevel && !showDropdown && (
        <>
          {isCollegeOrHigher(highestEducationLevel) ? (
            <>
              <div className="college-education-section">
                <div className="flex items-center justify-between">
                  <h3>{t('education.college_title')}</h3>
                  <button
                    type="button"
                    onClick={() => setShowDropdown(true)}
                    className="text-sm text-primary hover:underline"
                  >
                    Change Education Level
                  </button>
                </div>
                <p className="section-description">
                  {t('education.college_intro')}
                </p>
              </div>
              
              {/* List of existing entries */}
              {entries.length > 0 && (
                <div className="entries-list">
                  <h3>{t('education.entries_title')}</h3>
                  
                  {entries.map(entry => (
                    <EducationEntry
                      key={entry.id}
                      entry={entry}
                      onSave={handleSaveEntry}
                      onCancel={() => handleRemoveEntry(entry.id)}
                      errors={errors[entry.id] || {}}
                      isEditing={false}
                    />
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
                  isEditing={true}
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
                  {t('education.add_button')}
                </PushButton>
              )}
            </>
          ) : (
            <div className="non-college-education-section">
              <div className="flex items-center justify-between">
                <h3>Education Level: {getEducationLevelText(highestEducationLevel)}</h3>
                <button
                  type="button"
                  onClick={() => setShowDropdown(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Change Education Level
                </button>
              </div>
              <p className="section-description mt-2">
                No additional education details required.
              </p>
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
                {t('education.valid')}
              </div>
            ) : (
              hasAttemptedNext && (
                <div className="invalid-status">
                  {t('education.college_required')}
                </div>
              )
            )
          ) : (
            // For non-college, just having the level is enough
            <div className="valid-status">
              {t('education.valid')}
            </div>
          )
        ) : null}
      </div>
      
      {/* Navigation buttons */}
      <StepNavigation
        onPrevious={moveToPreviousStep}
        onNext={() => {
          const isEducationComplete = highestEducationLevel &&
            (!isCollegeOrHigher(highestEducationLevel) || entries.length > 0);
          
          setHasAttemptedNext(true);
          
          if (isEducationComplete) {
            setValue('education', 'highestLevel', highestEducationLevel);
            setValue('education', 'timelineEntries', entries.length > 0 ? entries : []);
            
            setValue('education', 'touchedHighestLevel', true);
            setValue('education', 'touchedTimelineEntries', true);
            setValue('education', 'forceUpdate', Date.now());
            
            setTimeout(() => {
              moveToNextStep();
            }, 50);
          } else {
            // Show error if user tries to navigate without selecting education level
            setShowLevelError(true);
          }
        }}
        canMovePrevious={canMovePrevious}
        canMoveNext={!!highestEducationLevel && (!isCollegeOrHigher(highestEducationLevel) || entries.length > 0)}
      />
    </div>
  );
};

export default EducationStep;