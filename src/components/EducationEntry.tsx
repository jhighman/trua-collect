import React, { useState } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { FormError, FormErrorSummary, FormField } from './ui/form-error';
import { Pencil, Trash2 } from 'lucide-react';
import '../styles/variables.css';
import '../styles/common.css';
import './EducationEntry.css';

export interface EducationEntryData {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  location: string;
  [key: string]: string | boolean | number | null | undefined; // Add index signature for TimelineEntry compatibility
}

interface EducationEntryProps {
  entry: EducationEntryData;
  onSave: (entry: EducationEntryData) => void;
  onCancel: () => void;
  errors?: Record<string, string>;
  isEditing?: boolean;
}

export const EducationEntry: React.FC<EducationEntryProps> = ({
  entry,
  onSave,
  onCancel,
  errors = {},
  isEditing = true
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EducationEntryData>(entry);
  const [showErrors, setShowErrors] = useState(false);
  
  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isCurrent: checked,
      endDate: checked ? '' : prev.endDate
    }));
  };
  
  const handleSave = () => {
    const validationErrors = getValidationErrors();
    if (validationErrors.length > 0) {
      setShowErrors(true);
      return;
    }
    onSave(formData);
  };

  const getValidationErrors = () => {
    const errors = [];
    if (!formData.institution) {
      errors.push({ id: 'institution-error', message: t('education.institution_required') });
    }
    if (!formData.degree) {
      errors.push({ id: 'degree-error', message: t('education.degree_required') });
    }
    if (!formData.startDate) {
      errors.push({ id: 'start-date-error', message: t('common.start_date_required') });
    }
    if (!formData.isCurrent && !formData.endDate) {
      errors.push({ id: 'end-date-error', message: t('common.end_date_required') });
    }
    return errors;
  };

  if (!isEditing) {
    return (
      <Card className="education-entry-card mb-6">
        <CardContent className="pt-4">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="font-medium text-lg">
                {formData.institution} - {formData.degree}
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                {formData.location}
              </div>
              <div className="text-sm mt-2">
                {formData.startDate} - {formData.isCurrent ? t('common.present') : formData.endDate}
              </div>
              {formData.description && (
                <div className="text-sm mt-2">{formData.description}</div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFormData(formData)}
                className="h-9 w-9 text-muted-foreground hover:text-primary"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">{t('common.edit')}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCancel}
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
    <Card className="education-entry-form mb-6">
      <CardHeader>
        <CardTitle>{entry.id ? t('education.edit_title') : t('education.add_title')}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-8">
          <div className="space-y-6">
            {/* Institution */}
            <div className="space-y-3">
              <Label htmlFor="institution" className="flex items-center gap-1 text-base font-medium">
                {t('education.institution')}
                <span className="text-destructive">*</span>
              </Label>
              <FormField error={showErrors && !formData.institution ? t('education.institution_required') : ''}>
                <Input
                  id="institution"
                  className={`h-11 text-base ${!formData.institution && showErrors ? 'border-destructive ring-destructive' : ''}`}
                  value={formData.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  aria-invalid={!formData.institution && showErrors}
                />
              </FormField>
            </div>

            {/* Degree and Field of Study */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="degree" className="flex items-center gap-1 text-base font-medium">
                  {t('education.degree')}
                  <span className="text-destructive">*</span>
                </Label>
                <FormField error={showErrors && !formData.degree ? t('education.degree_required') : ''}>
                  <Input
                    id="degree"
                    className={`h-11 text-base ${!formData.degree && showErrors ? 'border-destructive ring-destructive' : ''}`}
                    value={formData.degree}
                    onChange={(e) => handleChange('degree', e.target.value)}
                    aria-invalid={!formData.degree && showErrors}
                  />
                </FormField>
              </div>

              <div className="space-y-3">
                <Label htmlFor="fieldOfStudy" className="flex items-center gap-1 text-base font-medium">
                  {t('education.field_of_study')}
                </Label>
                <FormField error="">
                  <Input
                    id="fieldOfStudy"
                    className="h-11 text-base"
                    value={formData.fieldOfStudy}
                    onChange={(e) => handleChange('fieldOfStudy', e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
              <Label htmlFor="location" className="flex items-center gap-1 text-base font-medium">
                {t('education.location')}
              </Label>
              <FormField error="">
                <Input
                  id="location"
                  className="h-11 text-base"
                  value={formData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
              </FormField>
            </div>

            {/* Dates */}
            <div className="space-y-6 mt-6">
              <div className="employment-current-checkbox-container p-4 rounded-md bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] transition-colors duration-200">
                <Checkbox
                  id="isCurrent"
                  checked={formData.isCurrent}
                  onCheckedChange={(checked) => handleCheckboxChange(checked === true)}
                  className="employment-checkbox-visible transition-all duration-200"
                />
                <label
                  htmlFor="isCurrent"
                  className="ml-3 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {t('education.is_current')}
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="startDate" className="flex items-center gap-1 text-base font-medium">
                    {t('education.from_date')}
                    <span className="text-destructive">*</span>
                  </Label>
                  <FormField error={showErrors && !formData.startDate ? t('common.start_date_required') : ''}>
                    <Input
                      type="month"
                      id="startDate"
                      className={`h-11 text-base ${!formData.startDate && showErrors ? 'border-destructive ring-destructive' : ''}`}
                      value={formData.startDate}
                      onChange={(e) => handleChange('startDate', e.target.value)}
                      aria-invalid={!formData.startDate && showErrors}
                    />
                    <p className="text-muted-foreground text-sm">
                      {t('education.from_date_help')}
                    </p>
                  </FormField>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="endDate" className="flex items-center gap-1 text-base font-medium">
                    {t('education.to_date')}
                    {!formData.isCurrent && <span className="text-destructive">*</span>}
                  </Label>
                  <FormField error={showErrors && !formData.isCurrent && !formData.endDate ? t('common.end_date_required') : ''}>
                    {!formData.isCurrent ? (
                      <>
                        <Input
                          type="month"
                          id="endDate"
                          className={`h-11 text-base ${!formData.endDate && !formData.isCurrent && showErrors ? 'border-destructive ring-destructive' : ''}`}
                          value={formData.endDate || ''}
                          onChange={(e) => handleChange('endDate', e.target.value)}
                          aria-invalid={!formData.endDate && showErrors}
                        />
                        <p className="text-muted-foreground text-sm">
                          {t('education.to_date_help')}
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
            
            {/* Description */}
            <div className="space-y-3 mt-6">
              <Label htmlFor="description" className="flex items-center gap-1 text-base font-medium">
                {t('education.description')}
              </Label>
              <FormField error="">
                <textarea
                  id="description"
                  className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={t('education.description_placeholder')}
                />
              </FormField>
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
          onClick={onCancel}
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
};

export default EducationEntry;