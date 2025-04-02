import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { useForm } from '../context/FormContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import StepNavigation from './StepNavigation';
import './PersonalInfoStep.css';

export const PersonalInfoStep: React.FC = () => {
  const { t, language } = useTranslation();
  const { setValue, getValue, getStepErrors, moveToNextStep } = useForm();
  
  // Log current language for debugging
  console.log('PersonalInfoStep - Current language:', language);

  const [formData, setFormData] = useState({
    fullName: (getValue('personal-info', 'fullName') as string) || '',
    email: (getValue('personal-info', 'email') as string) || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const formErrors = getStepErrors('personal-info');
    setErrors(formErrors);
  }, [getStepErrors]);

  const validateEmail = (email: string): string | null => {
    if (!email) return t('validation.required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? null : t('validation.email_format') || 'Invalid email format';
  };

  const validateFullName = (name: string): string | null => {
    if (!name) return t('validation.required');
    return name.length < 2 ? t('validation.name_min_length') || 'Name must be at least 2 characters' : null;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const newErrors = { ...errors };
    if (field === 'fullName') {
      const nameError = validateFullName(value);
      nameError ? (newErrors.fullName = nameError) : delete newErrors.fullName;
    } else if (field === 'email') {
      const emailError = validateEmail(value);
      emailError ? (newErrors.email = emailError) : delete newErrors.email;
    }
    setErrors(newErrors);
    setValue('personal-info', field, value);
  };

  const isValid: boolean = !errors.fullName && !errors.email && !!formData.fullName && !!formData.email;

  return (
    <div className="personal-info-step">
      <div className="step-header">
        <h2>{t('personal_info.title')}</h2>
        <p className="step-description">
          {t('personal_info.description')}
        </p>
      </div>

      <Card className="form-container hover:shadow-md transition-all duration-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-[var(--primary-color)]">
            {t('personal_info.form_title')}
          </CardTitle>
          <CardDescription>
            {t('personal_info.form_description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8">
            <div className="space-y-4">
              <Label htmlFor="fullName" className="flex items-center gap-1 text-base">
                {t('personal_info.full_name')}
                <span className="required">*</span>
              </Label>
              <Input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={errors.fullName ? 'border-[var(--error-color)]' : ''}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              />
              {errors.fullName && (
                <p className="text-[var(--error-color)] text-sm mt-1" id="fullName-error">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <Label htmlFor="email" className="flex items-center gap-1 text-base">
                {t('personal_info.email')}
                <span className="required">*</span>
              </Label>
              <Input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={errors.email ? 'border-[var(--error-color)]' : ''}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p className="text-[var(--error-color)] text-sm mt-1" id="email-error">
                  {errors.email}
                </p>
              )}
            </div>

            <StepNavigation
              onNext={() => isValid && moveToNextStep()}
              canMoveNext={isValid}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalInfoStep;