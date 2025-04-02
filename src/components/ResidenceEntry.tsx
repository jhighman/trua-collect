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
import './ResidenceEntry.css';

export interface ResidenceEntryData {
  country: string;
  address: string;
  city: string;
  state_province: string;
  zip_postal: string;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  duration_years: number;
}

interface ResidenceEntryProps {
  entry: ResidenceEntryData;
  onUpdate: (entry: ResidenceEntryData) => void;
  onDelete: () => void;
  onRemove?: () => void;  // Alias for onDelete for compatibility
  isEditing?: boolean;
}

export function ResidenceEntry({ entry, onUpdate, onDelete, onRemove = onDelete, isEditing = false }: ResidenceEntryProps) {
  const { t } = useTranslation();
  const [editedEntry, setEditedEntry] = useState<ResidenceEntryData>(entry);
  const [isEditable, setIsEditable] = useState(isEditing);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    setEditedEntry(entry);
  }, [entry]);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    setEditedEntry(prev => ({
      ...prev,
      country: countryCode,
      state_province: '', // Reset state when country changes
    }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditedEntry(prev => ({
      ...prev,
      state_province: e.target.value,
    }));
  };

  const handleSave = () => {
    console.log('ResidenceEntry - handleSave called with entry:', editedEntry);
    
    const errors = getValidationErrors();
    if (errors.length > 0) {
      console.error('Validation errors:', errors);
      setShowErrors(true);
      return;
    }
    
    // Ensure end_date is null when is_current is true
    const updatedEntry = {
      ...editedEntry,
      end_date: editedEntry.is_current ? null : editedEntry.end_date
    };
    
    console.log('ResidenceEntry - Calling onUpdate with:', updatedEntry);
    onUpdate(updatedEntry);
    setIsEditable(false);
  };

  const availableStates = editedEntry.country ? getStatesByCountry(editedEntry.country) : [];

  // Collect all validation errors
  const getValidationErrors = () => {
    const errors = [];
    if (!editedEntry.country) {
      errors.push({ id: 'country-error', message: t('residence.country_required') });
    }
    if (!editedEntry.address) {
      errors.push({ id: 'address-error', message: t('residence.address_required') });
    }
    if (!editedEntry.city) {
      errors.push({ id: 'city-error', message: t('residence.city_required') });
    }
    if (!editedEntry.state_province) {
      errors.push({ id: 'state-error', message: t('residence.state_required') });
    }
    if (!editedEntry.zip_postal) {
      errors.push({ id: 'zip-error', message: t('residence.zip_required') });
    }
    if (!editedEntry.start_date) {
      errors.push({ id: 'start-date-error', message: t('common.start_date_required') });
    }
    if (!editedEntry.is_current && !editedEntry.end_date) {
      errors.push({ id: 'end-date-error', message: t('common.end_date_required') });
    }
    return errors;
  };

  if (!isEditable) {
    return (
      <Card className="residence-entry-card mb-6">
        <CardContent className="pt-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="font-medium text-lg">
                {editedEntry.country && t(`countries.${editedEntry.country}`)}
              </div>
              <div className="text-base">{editedEntry.address}</div>
              <div className="text-sm text-muted-foreground">
                {editedEntry.city}, {editedEntry.state_province} {editedEntry.zip_postal}
              </div>
              <div className="text-sm mt-2">
                {formatDisplayDate(entry.start_date)} - {entry.is_current ? t('common.present') : formatDisplayDate(entry.end_date)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditable(true)}
              >
                {t('common.edit')}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={onDelete}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const validationErrors = getValidationErrors();
return (
  <Card className="residence-entry-form mb-6">
    <CardHeader>
      <CardTitle>{isEditing ? t('residence.add_title') : t('residence.edit_title')}</CardTitle>
    </CardHeader>
    <CardContent className="p-6">
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="country" className="flex items-center gap-1 text-base font-medium">
              {t('residence.country')}
              <span className="text-destructive">*</span>
            </Label>
            <FormField error={showErrors && !editedEntry.country ? t('residence.country_required') : ''}>
              <Select
                value={editedEntry.country}
                onValueChange={(value) => {
                  setEditedEntry(prev => ({
                    ...prev,
                    country: value,
                    state_province: '', // Reset state when country changes
                  }));
                }}
              >
                <SelectTrigger className={`w-full h-11 text-base ${!editedEntry.country && showErrors ? 'border-destructive ring-destructive' : ''}`}>
                  <SelectValue placeholder={t('residence.select_country')} />
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

          <div className="space-y-3">
            <Label htmlFor="address" className="flex items-center gap-1 text-base font-medium">
              {t('residence.address')}
              <span className="text-destructive">*</span>
            </Label>
            <FormField error={showErrors && !editedEntry.address ? t('residence.address_required') : ''}>
              <Input
                id="address"
                className={`h-11 text-base ${!editedEntry.address && showErrors ? 'border-destructive ring-destructive' : ''}`}
                value={editedEntry.address}
                onChange={(e) => setEditedEntry({ ...editedEntry, address: e.target.value })}
                aria-invalid={!editedEntry.address && showErrors}
              />
            </FormField>
          </div>

          <div className="space-y-3">
            <Label htmlFor="city" className="flex items-center gap-1 text-base font-medium">
              {t('residence.city')}
              <span className="text-destructive">*</span>
            </Label>
            <FormField error={showErrors && !editedEntry.city ? t('residence.city_required') : ''}>
              <Input
                id="city"
                className={`h-11 text-base ${!editedEntry.city && showErrors ? 'border-destructive ring-destructive' : ''}`}
                value={editedEntry.city}
                onChange={(e) => setEditedEntry({ ...editedEntry, city: e.target.value })}
                aria-invalid={!editedEntry.city && showErrors}
              />
            </FormField>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <Label htmlFor="state_province" className="flex items-center gap-1 text-base font-medium">
                {t('residence.state_province')}
                <span className="text-destructive">*</span>
              </Label>
              <FormField error={showErrors && !editedEntry.state_province ? t('residence.state_required') : ''}>
                <Select
                  value={editedEntry.state_province}
                  onValueChange={(value) => {
                    setEditedEntry(prev => ({
                      ...prev,
                      state_province: value,
                    }));
                  }}
                  disabled={!editedEntry.country}
                >
                  <SelectTrigger className={`w-full h-11 text-base ${!editedEntry.state_province && showErrors ? 'border-destructive ring-destructive' : ''}`}>
                    <SelectValue placeholder={t('residence.select_state')} />
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

            <div className="w-full md:w-1/3 space-y-3">
              <Label htmlFor="zip_postal" className="flex items-center gap-1 text-base font-medium">
                {t('residence.zip_postal')}
                <span className="text-destructive">*</span>
              </Label>
              <FormField error={showErrors && !editedEntry.zip_postal ? t('residence.zip_required') : ''}>
                <Input
                  id="zip_postal"
                  className={`h-11 text-base ${!editedEntry.zip_postal && showErrors ? 'border-destructive ring-destructive' : ''}`}
                  value={editedEntry.zip_postal}
                  onChange={(e) => setEditedEntry({ ...editedEntry, zip_postal: e.target.value })}
                  pattern="[0-9]{5}(-[0-9]{4})?"
                  aria-invalid={!editedEntry.zip_postal && showErrors}
                />
              </FormField>
            </div>
          </div>

          <div className="space-y-6 mt-6">
            <div className="residence-current-checkbox-container p-4 rounded-md bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] transition-colors duration-200">
              <Checkbox
                id="is_current"
                checked={editedEntry.is_current}
                onCheckedChange={(checked) => setEditedEntry({
                  ...editedEntry,
                  is_current: checked === true,
                  end_date: checked === true ? null : editedEntry.end_date
                })}
                className="residence-checkbox-visible transition-all duration-200"
              />
              <label
                htmlFor="is_current"
                className="ml-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {t('residence.is_current')}
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="start_date" className="flex items-center gap-1 text-base font-medium">
                  {t('residence.from_date')}
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
                    {t('residence.from_date_help')}
                  </p>
                </FormField>
              </div>

              <div className="space-y-3">
                <Label htmlFor="end_date" className="flex items-center gap-1 text-base font-medium">
                  {t('residence.to_date')}
                  {!editedEntry.is_current && <span className="text-destructive">*</span>}
                </Label>
                <FormField error={showErrors && !editedEntry.is_current && !editedEntry.end_date ? t('common.end_date_required') : ''}>
                  {!editedEntry.is_current ? (
                    <Input
                      type="month"
                      id="end_date"
                      className={`h-11 text-base ${!editedEntry.end_date && !editedEntry.is_current && showErrors ? 'border-destructive ring-destructive' : ''}`}
                      value={editedEntry.end_date || ''}
                      onChange={(e) => setEditedEntry({ ...editedEntry, end_date: e.target.value })}
                      aria-invalid={!editedEntry.end_date && showErrors}
                    />
                  ) : (
                    <div className="h-11 flex items-center px-3 bg-gray-50 border border-gray-200 rounded-md">
                      <span className="text-base font-medium text-primary">
                        {t('common.present')}
                      </span>
                    </div>
                  )}
                  {!editedEntry.is_current && (
                    <p className="text-muted-foreground text-sm">
                      {t('residence.to_date_help')}
                    </p>
                  )}
                </FormField>
              </div>
            </div>
          </div>

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