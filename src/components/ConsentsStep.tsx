import React from 'react';
import { useForm } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import type { ConsentsStepValues } from '../utils/FormStateManager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import StepNavigation from './StepNavigation';
import './ConsentsStep.css';

// Define the ConsentItem interface
interface ConsentItem {
  field: string;
  title: string;
  text: string;
  label: string;
  checked: boolean;
  error: string;
}

export const ConsentsStep: React.FC = () => {
  const { t, language } = useTranslation();
  
  // Log current language for debugging
  console.log('ConsentsStep - Current language:', language);
  
  const {
    setValue,
    getValue,
    getStepErrors,
    moveToNextStep,
    moveToPreviousStep,
    canMoveNext,
    canMovePrevious,
  } = useForm();

  // Type-safe boolean getter
  const getBooleanValue = (field: string) => {
    const value = getValue('consents', field);
    return typeof value === 'boolean' ? value : false;
  };

  const driverLicenseConsent = getBooleanValue('driverLicenseConsent');
  const drugTestConsent = getBooleanValue('drugTestConsent');
  const biometricConsent = getBooleanValue('biometricConsent');

  // Use errors directly from context
  const errors = getStepErrors('consents');

  // Handle checkbox changes
  const handleConsentChange = (field: string, checked: boolean) => {
    console.log('Setting consent value:', field, checked);
    setValue('consents', field, checked);
  };

  // Type-safe consents config
  const consentsConfig = getValue('consents', '_config') as ConsentsStepValues['_config'] | undefined;
  const requiredConsents = consentsConfig?.consentsRequired || {
    driverLicense: false,
    drugTest: false,
    biometric: false,
  };

  console.log('Required consents:', requiredConsents);
  console.log('Current consent values:', { driverLicenseConsent, drugTestConsent, biometricConsent });

  // Create an array of consents to render, using null for non-required consents
  const consentsToRender = [
    requiredConsents.driverLicense
      ? {
          field: 'driverLicenseConsent',
          title: t('consents.driver_license.title'),
          text: t('consents.driver_license.text'),
          label: t('consents.driver_license.checkbox'),
          checked: driverLicenseConsent,
          error: errors.driverLicenseConsent || '',
        }
      : null,
    requiredConsents.drugTest
      ? {
          field: 'drugTestConsent',
          title: t('consents.drug_test.title'),
          text: t('consents.drug_test.text'),
          label: t('consents.drug_test.checkbox'),
          checked: drugTestConsent,
          error: errors.drugTestConsent || '',
        }
      : null,
    requiredConsents.biometric
      ? {
          field: 'biometricConsent',
          title: t('consents.biometric.title'),
          text: t('consents.biometric.text'),
          label: t('consents.biometric.checkbox'),
          checked: biometricConsent,
          error: errors.biometricConsent || '',
        }
      : null,
  ].filter((item): item is ConsentItem => item !== null); // Type predicate to narrow to ConsentItem

  return (
    <div className="consents-step">
      <div className="step-header">
        <h2>{t('consents.title')}</h2>
        <p className="step-description">
          {t('consents.description')}
        </p>
      </div>

      {consentsToRender.length === 0 ? (
        <div className="no-consents-message">
          {t('consents.none_required')}
        </div>
      ) : (
        <div className="space-y-6">
          {consentsToRender.map((consent) => (
            <Card key={consent.field} className="form-container hover:shadow-md transition-all duration-200">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-[var(--primary-color)]">
                  {consent.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-5 text-base leading-relaxed">
                  {consent.text}
                </CardDescription>
                <div className="mt-5">
                  <div className="flex items-center consent-checkbox-container p-4 rounded-md bg-[var(--color-gray-50)] hover:bg-[var(--color-gray-100)] transition-colors duration-200">
                    <Checkbox
                      id={consent.field}
                      checked={consent.checked}
                      onCheckedChange={(checked) => handleConsentChange(consent.field, checked as boolean)}
                      className="checkbox-visible transition-all duration-200"
                      aria-invalid={!!consent.error}
                      aria-describedby={consent.error ? `${consent.field}-error` : undefined}
                    />
                    <Label htmlFor={consent.field} className="consent-label text-base ml-3">
                      {consent.label}
                    </Label>
                  </div>
                </div>
                {consent.error && (
                  <div
                    className="text-[var(--error-color)] text-base mt-4 p-4 bg-[var(--error-color-light)] rounded-md flex items-start"
                    id={`${consent.field}-error`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 mt-0.5">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="12"></line>
                      <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {consent.error}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <StepNavigation
            onNext={moveToNextStep}
            onPrevious={moveToPreviousStep}
            canMoveNext={canMoveNext}
            canMovePrevious={canMovePrevious}
          />
        </div>
      )}
    </div>
  );
};

export default ConsentsStep;