import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { formatDisplayDate } from '../utils/dateUtils';
import { countries, getCountryByCode, type Country } from '../utils/countries';
import { getStatesByCountry, getStateByCode, type State } from '../utils/states';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { FormError, FormErrorSummary, FormField } from './ui/form-error';
import { Pencil, Trash2 } from 'lucide-react';
import '../styles/variables.css';
import '../styles/common.css';
import './EmploymentEntry.css';

export interface EmploymentEntryData {
  type: string;
  company: string;
  position: string;
  country: string;
  city: string;
  state_province: string;
  description: string;
  contact_name: string;
  contact_type: string;
  contact_email: string;
  contact_phone: string;
  contact_preferred_method: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  duration_years?: number;
}

interface EmploymentEntryProps {
  entry: EmploymentEntryData;
  onUpdate: (entry: EmploymentEntryData) => void;
  onRemove?: () => void;  // Optional since onDelete is its alias
  onDelete: () => void;   // Required and replaces onRemove as the primary handler
  employmentTypes?: { value: string; label: string }[];
  isEditing?: boolean;
  isCompanyRequired?: boolean;
  isPositionRequired?: boolean;
  isContactRequired?: boolean;
}

export function EmploymentEntry({ 
  entry,
  onUpdate,
  onRemove,
  onDelete,
  employmentTypes = [],
  isEditing = false,
  isCompanyRequired = true,
  isPositionRequired = true,
  isContactRequired = true
}: EmploymentEntryProps) {
  const { t } = useTranslation();
  const [editedEntry, setEditedEntry] = useState<EmploymentEntryData>(entry);
  const [isEditable, setIsEditable] = useState(isEditing);
  const [showErrors, setShowErrors] = useState(false);

  // Use onRemove if provided for backward compatibility
  const handleDelete = onRemove || onDelete;

  useEffect(() => {
    setEditedEntry(entry);
  }, [entry]);

  const handleCountryChange = (value: string) => {
    setEditedEntry(prev => ({
      ...prev,
      country: value,
      state_province: '', // Reset state when country changes
    }));
  };

  const handleStateChange = (value: string) => {
    setEditedEntry(prev => ({
      ...prev,
      state_province: value,
    }));
  };

  const handleSave = () => {
    console.log('EmploymentEntry - handleSave called with entry:', editedEntry);
    
    const errors = getValidationErrors();
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      setShowErrors(true);
      return;
    }

    // If current job, end date should be null
    const updatedEntry = {
      ...editedEntry,
      end_date: editedEntry.is_current ? null : editedEntry.end_date
    };
    
    console.log('EmploymentEntry - Calling onUpdate with:', updatedEntry);
    onUpdate(updatedEntry);
    setIsEditable(false);
  };

  const availableStates = editedEntry.country ? getStatesByCountry(editedEntry.country) : [];

  // Contact type options
  const contactTypes = [
    { value: 'manager', label: t('employment.contact_type_manager') },
    { value: 'hr', label: t('employment.contact_type_hr') },
    { value: 'colleague', label: t('employment.contact_type_colleague') },
    { value: 'other', label: t('employment.contact_type_other') }
  ];

  // Preferred contact method options
  const contactMethods = [
    { value: 'email', label: t('employment.contact_method_email') },
    { value: 'phone', label: t('employment.contact_method_phone') }
  ];

  // Collect all validation errors
  const getValidationErrors = () => {
    const errors = [];
    if (isCompanyRequired && !editedEntry.company && editedEntry.type !== 'unemployed') {
      errors.push({ id: 'company-error', message: t('employment.company_required') });
    }
    if (isPositionRequired && !editedEntry.position && editedEntry.type !== 'unemployed') {
      errors.push({ id: 'position-error', message: t('employment.position_required') });
    }
    if (!editedEntry.country) {
      errors.push({ id: 'country-error', message: t('employment.country_required') });
    }
    if (!editedEntry.city) {
      errors.push({ id: 'city-error', message: t('employment.city_required') });
    }
    if (!editedEntry.state_province) {
      errors.push({ id: 'state-error', message: t('employment.state_required') });
    }
    if (!editedEntry.start_date) {
      errors.push({ id: 'start-date-error', message: t('common.start_date_required') });
    }
    if (!editedEntry.is_current && !editedEntry.end_date) {
      errors.push({ id: 'end-date-error', message: t('common.end_date_required') });
    }
    if (isContactRequired && editedEntry.type !== 'unemployed') {
      if (!editedEntry.contact_name) {
        errors.push({ id: 'contact-name-error', message: t('employment.contact_name_required') });
      }
      if (!editedEntry.contact_type) {
        errors.push({ id: 'contact-type-error', message: t('employment.contact_type_required') });
      }
      if (!editedEntry.contact_email && !editedEntry.contact_phone) {
        errors.push({ id: 'contact-info-error', message: t('employment.contact_info_required') });
      }
      if (editedEntry.contact_email || editedEntry.contact_phone) {
        if (!editedEntry.contact_preferred_method) {
          errors.push({ id: 'contact-method-error', message: t('employment.contact_method_required') });
        }
      }
    }
    return errors;
  };

  if (!isEditable) {
    return (
      <Card className="employment-entry-card mb-6">
        <CardContent className="pt-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="font-medium text-lg">
                {editedEntry.company} - {editedEntry.position}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                {editedEntry.city}, {editedEntry.state_province && getStateByCode(editedEntry.state_province, editedEntry.country)?.name}
                {editedEntry.country && `, ${getCountryByCode(editedEntry.country)?.name}`}
              </div>
              <div className="text-sm mt-2">
                {formatDisplayDate(entry.start_date)} - {entry.is_current ? t('common.present') : formatDisplayDate(entry.end_date)}
              </div>
              {editedEntry.description && (
                <div className="text-sm mt-2">{editedEntry.description}</div>
              )}
              {editedEntry.contact_name && (
                <div className="text-sm mt-2">
                  <span className="font-medium">{t('employment.contact')}: </span>
                  {editedEntry.contact_name}
                  {editedEntry.contact_type && ` (${contactTypes.find(t => t.value === editedEntry.contact_type)?.label})`}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditable(true)}
                className="h-9 w-9 text-muted-foreground hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">{t('common.edit')}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="h-9 w-9 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">{t('common.delete')}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const validationErrors = getValidationErrors();
  return (
    <Card className="employment-entry-form mb-6">
      <CardHeader>
        <CardTitle>{isEditing ? t('employment.add_title') : t('employment.edit_title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          <div className="space-y-6">
            {/* Employment Type */}
            {employmentTypes.length > 0 && (
              <div className="space-y-3">
                <Label htmlFor="type" className="flex items-center gap-1 text-base font-medium">
                  {t('employment.type')}
                  <span className="text-destructive">*</span>
                </Label>
                <FormField error={showErrors && !editedEntry.type ? t('employment.type_required') : ''}>
                  <Select
              value={editedEntry.type}
                    onValueChange={(value) => {
                      setEditedEntry(prev => ({
                        ...prev,
                        type: value,
                        // Clear contact information if type is unemployed
                        ...(value === 'unemployed' ? {
                          contact_name: '',
                          contact_type: '',
                          contact_email: '',
                          contact_phone: '',
                          contact_preferred_method: '',
                          company: '',
                          position: ''
                        } : {})
                      }));
                    }}
                  >
                    <SelectTrigger className={`w-full h-11 text-base select-trigger ${!editedEntry.type && showErrors ? 'border-destructive ring-destructive' : ''}`}>
                      <SelectValue placeholder={t('employment.select_type')} />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={5}
                      align="start"
                      className="select-content-dropdown"
                    >
              {employmentTypes.map(type => (
                        <SelectItem 
                          key={type.value} 
                          value={type.value} 
                          className="select-item"
                        >
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
          </div>
            )}

            {/* Company and Position - Hide for unemployed */}
            {editedEntry.type !== 'unemployed' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="company" className="flex items-center gap-1 text-base font-medium">
                    {t('employment.company')}
                    {isCompanyRequired && <span className="text-destructive">*</span>}
                  </Label>
                  <FormField error={showErrors && isCompanyRequired && !editedEntry.company ? t('employment.company_required') : ''}>
                    <Input
                      id="company"
                      className={`h-11 text-base ${isCompanyRequired && !editedEntry.company && showErrors ? 'border-destructive ring-destructive' : ''}`}
              value={editedEntry.company}
                      onChange={(e) => setEditedEntry({ ...editedEntry, company: e.target.value })}
                      aria-invalid={isCompanyRequired && !editedEntry.company && showErrors}
            />
                  </FormField>
          </div>
          
                <div className="space-y-3">
                  <Label htmlFor="position" className="flex items-center gap-1 text-base font-medium">
                    {t('employment.position')}
                    {isPositionRequired && <span className="text-destructive">*</span>}
                  </Label>
                  <FormField error={showErrors && isPositionRequired && !editedEntry.position ? t('employment.position_required') : ''}>
                    <Input
                      id="position"
                      className={`h-11 text-base ${isPositionRequired && !editedEntry.position && showErrors ? 'border-destructive ring-destructive' : ''}`}
              value={editedEntry.position}
                      onChange={(e) => setEditedEntry({ ...editedEntry, position: e.target.value })}
                      aria-invalid={isPositionRequired && !editedEntry.position && showErrors}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* Country */}
            <div className="space-y-3">
              <Label htmlFor="country" className="flex items-center gap-1 text-base font-medium">
                {t('employment.country')}
                <span className="text-destructive">*</span>
              </Label>
              <FormField error={showErrors && !editedEntry.country ? t('employment.country_required') : ''}>
                <Select
                  value={editedEntry.country}
                  onValueChange={handleCountryChange}
                >
                  <SelectTrigger className={`w-full h-11 text-base select-trigger ${!editedEntry.country && showErrors ? 'border-destructive ring-destructive' : ''}`}>
                    <SelectValue placeholder={t('employment.select_country')} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={5}
                    align="start"
                    className="select-content-dropdown"
                  >
                    {countries.map(country => (
                      <SelectItem 
                        key={country.code} 
                        value={country.code} 
                        className="select-item"
                      >
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
          </div>
          
            {/* City and State */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-3">
                <Label htmlFor="city" className="flex items-center gap-1 text-base font-medium">
                  {t('employment.city')}
                  <span className="text-destructive">*</span>
                </Label>
                <FormField error={showErrors && !editedEntry.city ? t('employment.city_required') : ''}>
                  <Input
                    id="city"
                    className={`h-11 text-base ${!editedEntry.city && showErrors ? 'border-destructive ring-destructive' : ''}`}
              value={editedEntry.city}
                    onChange={(e) => setEditedEntry({ ...editedEntry, city: e.target.value })}
                    aria-invalid={!editedEntry.city && showErrors}
            />
                </FormField>
          </div>
          
              <div className="flex-1 space-y-3">
                <Label htmlFor="state_province" className="flex items-center gap-1 text-base font-medium">
                  {t('employment.state_province')}
                  <span className="text-destructive">*</span>
                </Label>
                <FormField error={showErrors && !editedEntry.state_province ? t('employment.state_required') : ''}>
                  <Select
              value={editedEntry.state_province}
                    onValueChange={handleStateChange}
                    disabled={!editedEntry.country}
                  >
                    <SelectTrigger className={`w-full h-11 text-base select-trigger ${!editedEntry.state_province && showErrors ? 'border-destructive ring-destructive' : ''}`}>
                      <SelectValue placeholder={t('employment.select_state')} />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={5}
                      align="start"
                      className="select-content-dropdown"
                    >
                      {availableStates.map(state => (
                        <SelectItem 
                          key={state.code} 
                          value={state.code} 
                          className="select-item"
                        >
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
          </div>
          
            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="flex items-center gap-1 text-base font-medium">
                {t('employment.description')}
              </Label>
              <FormField error="">
            <textarea
                  id="description"
                  className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm"
              value={editedEntry.description}
                  onChange={(e) => setEditedEntry({ ...editedEntry, description: e.target.value })}
                  placeholder={t(
                    editedEntry.type === 'unemployed'
                      ? 'employment.description_unemployed'
                      : editedEntry.type === 'education'
                      ? 'employment.description_education'
                      : editedEntry.type === 'other'
                      ? 'employment.description_other'
                      : 'employment.description_job'
                  )}
                />
              </FormField>
          </div>
          
            {/* Dates */}
            <div className="space-y-6 mt-6">
              <div className="employment-current-checkbox-container p-4 rounded-md bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] transition-colors duration-200">
                <Checkbox
                  id="is_current"
                  checked={editedEntry.is_current}
                  onCheckedChange={(checked) => setEditedEntry({
                    ...editedEntry, 
                    is_current: checked === true,
                    end_date: checked === true ? null : editedEntry.end_date
                  })}
                  className="employment-checkbox-visible transition-all duration-200"
                />
                <label
                  htmlFor="is_current"
                  className="ml-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t(
                    editedEntry.type === 'unemployed'
                      ? 'employment.is_current_unemployed'
                      : editedEntry.type === 'education'
                      ? 'employment.is_current_education'
                      : editedEntry.type === 'other'
                      ? 'employment.is_current_generic'
                      : 'employment.is_current_job'
                  )}
            </label>
          </div>
          
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="start_date" className="flex items-center gap-1 text-base font-medium">
                    {t('employment.from_date')}
                    <span className="text-destructive">*</span>
                  </Label>
                  <FormField error={showErrors && !editedEntry.start_date ? t('common.start_date_required') : ''}>
                    <Input
                      type="month"
                      id="start_date"
                      className={`h-11 text-base ${!editedEntry.start_date && showErrors ? 'border-destructive ring-destructive' : ''}`}
              value={editedEntry.start_date}
                      onChange={(e) => setEditedEntry({ ...editedEntry, start_date: e.target.value })}
                      aria-invalid={!editedEntry.start_date && showErrors}
                    />
                    <p className="text-muted-foreground text-sm">
                      {t(
                        editedEntry.type === 'unemployed'
                          ? 'employment.from_date_help_unemployed'
                          : editedEntry.type === 'education'
                          ? 'employment.from_date_help_education'
                          : editedEntry.type === 'other'
                          ? 'employment.from_date_help_other'
                          : 'employment.from_date_help'
                      )}
                    </p>
                  </FormField>
          </div>
          
                <div className="space-y-3">
                  <Label htmlFor="end_date" className="flex items-center gap-1 text-base font-medium">
                    {t('employment.to_date')}
                    {!editedEntry.is_current && <span className="text-destructive">*</span>}
                  </Label>
                  <FormField error={showErrors && !editedEntry.is_current && !editedEntry.end_date ? t('common.end_date_required') : ''}>
                    {!editedEntry.is_current ? (
                      <>
                        <Input
                          type="month"
                          id="end_date"
                          className={`h-11 text-base ${!editedEntry.end_date && !editedEntry.is_current && showErrors ? 'border-destructive ring-destructive' : ''}`}
                          value={editedEntry.end_date || ''}
                          onChange={(e) => setEditedEntry({ ...editedEntry, end_date: e.target.value })}
                          aria-invalid={!editedEntry.end_date && showErrors}
                        />
                        <p className="text-muted-foreground text-sm">
                          {t(
                            editedEntry.type === 'unemployed'
                              ? 'employment.to_date_help_unemployed'
                              : editedEntry.type === 'education'
                              ? 'employment.to_date_help_education'
                              : editedEntry.type === 'other'
                              ? 'employment.to_date_help_other'
                              : 'employment.to_date_help'
                          )}
                        </p>
                      </>
                    ) : (
                      <div className="h-11 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-md">
                        <span className="text-base font-medium text-primary">
                          {t('common.present')}
                        </span>
                      </div>
                    )}
                  </FormField>
                </div>
              </div>
          </div>
          
            {/* Contact Information */}
            {editedEntry.type && editedEntry.type !== 'unemployed' && (
              <div className="border-t border-border mt-10">
                <div className="pt-10">
                  <CardHeader className="px-0 pb-8">
                    <CardTitle>{t('employment.contact_section')}</CardTitle>
                    <p className="text-muted-foreground mt-1.5">
                      {t('employment.contact_section_description')}
                    </p>
                  </CardHeader>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="contact_name" className="flex items-center gap-1 text-base font-medium">
                        {t('employment.contact_name')}
                        {isContactRequired && <span className="text-destructive">*</span>}
                      </Label>
                      <FormField error={showErrors && isContactRequired && !editedEntry.contact_name ? t('employment.contact_name_required') : ''}>
                        <Input
                          id="contact_name"
                          className={`h-11 text-base ${isContactRequired && !editedEntry.contact_name && showErrors ? 'border-destructive ring-destructive' : ''}`}
                          value={editedEntry.contact_name}
                          onChange={(e) => setEditedEntry({ ...editedEntry, contact_name: e.target.value })}
                          placeholder={t('employment.contact_name_placeholder')}
                          aria-invalid={isContactRequired && !editedEntry.contact_name && showErrors}
                        />
                      </FormField>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="contact_type" className="flex items-center gap-1 text-base font-medium">
                        {t('employment.contact_type')}
                        {isContactRequired && <span className="text-destructive">*</span>}
                      </Label>
                      <FormField error={showErrors && isContactRequired && !editedEntry.contact_type ? t('employment.contact_type_required') : ''}>
                        <Select
                          value={editedEntry.contact_type}
                          onValueChange={(value) => {
                            setEditedEntry(prev => ({
                              ...prev,
                              contact_type: value,
                            }));
                          }}
                        >
                          <SelectTrigger className={`w-full h-11 text-base select-trigger ${isContactRequired && !editedEntry.contact_type && showErrors ? 'border-destructive ring-destructive' : ''}`}>
                            <SelectValue placeholder={t('employment.select_contact_type')} />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            sideOffset={5}
                            align="start"
                            className="select-content-dropdown"
                          >
                            {contactTypes.map(type => (
                              <SelectItem 
                                key={type.value} 
                                value={type.value} 
                                className="select-item"
                              >
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="contact_email" className="flex items-center gap-1 text-base font-medium">
                        {t('employment.contact_email')}
                        {isContactRequired && !editedEntry.contact_phone && <span className="text-destructive">*</span>}
                      </Label>
                      <FormField error={showErrors && isContactRequired && !editedEntry.contact_email && !editedEntry.contact_phone ? t('employment.contact_info_required') : ''}>
                        <Input
                          id="contact_email"
                          type="email"
                          className={`h-11 text-base ${isContactRequired && !editedEntry.contact_email && !editedEntry.contact_phone && showErrors ? 'border-destructive ring-destructive' : ''}`}
                          value={editedEntry.contact_email}
                          onChange={(e) => setEditedEntry({ ...editedEntry, contact_email: e.target.value })}
                          placeholder={t('employment.contact_email_placeholder')}
                          aria-invalid={isContactRequired && !editedEntry.contact_email && !editedEntry.contact_phone && showErrors}
                        />
                      </FormField>
                    </div>
                    
                    <div className="space-y-3">
                      <Label htmlFor="contact_phone" className="flex items-center gap-1 text-base font-medium">
                        {t('employment.contact_phone')}
                        {isContactRequired && !editedEntry.contact_email && <span className="text-destructive">*</span>}
                      </Label>
                      <FormField error={showErrors && isContactRequired && !editedEntry.contact_email && !editedEntry.contact_phone ? t('employment.contact_info_required') : ''}>
                        <Input
                          id="contact_phone"
                          type="tel"
                          className={`h-11 text-base ${isContactRequired && !editedEntry.contact_email && !editedEntry.contact_phone && showErrors ? 'border-destructive ring-destructive' : ''}`}
                          value={editedEntry.contact_phone}
                          onChange={(e) => setEditedEntry({ ...editedEntry, contact_phone: e.target.value })}
                          placeholder={t('employment.contact_phone_placeholder')}
                          aria-invalid={isContactRequired && !editedEntry.contact_email && !editedEntry.contact_phone && showErrors}
                        />
                      </FormField>
                    </div>
                  </div>
                  
                  {(editedEntry.contact_email || editedEntry.contact_phone) && (
                    <div className="space-y-3">
                      <Label htmlFor="contact_preferred_method" className="flex items-center gap-1 text-base font-medium">
                        {t('employment.contact_preferred_method')}
                        {isContactRequired && <span className="text-destructive">*</span>}
                      </Label>
                      <FormField error={showErrors && isContactRequired && !editedEntry.contact_preferred_method ? t('employment.contact_method_required') : ''}>
                        <Select
                          value={editedEntry.contact_preferred_method}
                          onValueChange={(value) => {
                            setEditedEntry(prev => ({
                              ...prev,
                              contact_preferred_method: value,
                            }));
                          }}
                        >
                          <SelectTrigger className={`w-full h-11 text-base select-trigger ${isContactRequired && !editedEntry.contact_preferred_method && showErrors ? 'border-destructive ring-destructive' : ''}`}>
                            <SelectValue placeholder={t('employment.select_contact_method')} />
                          </SelectTrigger>
                          <SelectContent
                            position="popper"
                            sideOffset={5}
                            align="start"
                            className="select-content-dropdown"
                          >
                            {contactMethods.map(method => (
                              <SelectItem 
                                key={method.value} 
                                value={method.value} 
                                className="select-item"
                                disabled={(method.value === 'email' && !editedEntry.contact_email) || 
                                         (method.value === 'phone' && !editedEntry.contact_phone)}
                              >
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {showErrors && validationErrors.length > 0 && (
              <FormErrorSummary errors={validationErrors} />
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4 border-t pt-6 px-6 bg-gray-50">
        <Button
          variant="outline"
          size="lg"
          className="min-w-[120px] h-12 text-base font-medium"
          onClick={() => setIsEditable(false)}
        >
          {t('common.cancel')}
        </Button>
        <Button
          size="lg"
          className="min-w-[120px] h-12 text-base font-medium bg-primary hover:bg-primary/90"
          onClick={handleSave}
        >
          {t('common.save')}
        </Button>
      </CardFooter>
    </Card>
  );
}