import React from 'react';
import { useForm } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import type { ConsentsStepValues } from '../utils/FormStateManager';
import './ConsentsStep.css';

export const ConsentsStep: React.FC = () => {
  const { t } = useTranslation();
  const {
    setValue,
    getValue,
    getStepErrors,
    isStepValid,
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

  return (
    <div className="consents-step">
      <div className="step-header">
        <h2>{t('consents.title') || 'Required Consents'}</h2>
        <p className="step-description">
          {t('consents.description') || 'Please review and provide the following required consents to proceed.'}
        </p>
      </div>

      <div className="form-container">
        {requiredConsents.driverLicense && (
          <div className="consent-group">
            <h3>{t('consents.driver_license.title') || 'Driver License Verification Consent'}</h3>
            <p className="consent-text">
              {t('consents.driver_license.text') ||
                'I consent to the verification of my driver license information as part of this background check process.'}
            </p>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="driverLicenseConsent"
                checked={driverLicenseConsent}
                onChange={(e) => handleConsentChange('driverLicenseConsent', e.target.checked)}
                aria-invalid={!!errors.driverLicenseConsent}
                aria-describedby={errors.driverLicenseConsent ? 'driverLicenseConsent-error' : undefined}
              />
              <label htmlFor="driverLicenseConsent">
                {t('consents.driver_license.checkbox') || 'I consent to driver license verification'}
              </label>
            </div>
            {errors.driverLicenseConsent && (
              <div className="error-message" id="driverLicenseConsent-error">
                {errors.driverLicenseConsent}
              </div>
            )}
          </div>
        )}

        {requiredConsents.drugTest && (
          <div className="consent-group">
            <h3>{t('consents.drug_test.title') || 'Drug Test Consent'}</h3>
            <p className="consent-text">
              {t('consents.drug_test.text') ||
                'I consent to undergo drug testing as part of this employment screening process.'}
            </p>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="drugTestConsent"
                checked={drugTestConsent}
                onChange={(e) => handleConsentChange('drugTestConsent', e.target.checked)}
                aria-invalid={!!errors.drugTestConsent}
                aria-describedby={errors.drugTestConsent ? 'drugTestConsent-error' : undefined}
              />
              <label htmlFor="drugTestConsent">
                {t('consents.drug_test.checkbox') || 'I consent to drug testing'}
              </label>
            </div>
            {errors.drugTestConsent && (
              <div className="error-message" id="drugTestConsent-error">
                {errors.drugTestConsent}
              </div>
            )}
          </div>
        )}

        {requiredConsents.biometric && (
          <div className="consent-group">
            <h3>{t('consents.biometric.title') || 'Biometric Data Consent'}</h3>
            <p className="consent-text">
              {t('consents.biometric.text') ||
                'I consent to the collection, storage, and use of my biometric data for identity verification purposes.'}
            </p>
            <div className="checkbox-container">
              <input
                type="checkbox"
                id="biometricConsent"
                checked={biometricConsent}
                onChange={(e) => handleConsentChange('biometricConsent', e.target.checked)}
                aria-invalid={!!errors.biometricConsent}
                aria-describedby={errors.biometricConsent ? 'biometricConsent-error' : undefined}
              />
              <label htmlFor="biometricConsent">
                {t('consents.biometric.checkbox') || 'I consent to biometric data collection and use'}
              </label>
            </div>
            {errors.biometricConsent && (
              <div className="error-message" id="biometricConsent-error">
                {errors.biometricConsent}
              </div>
            )}
          </div>
        )}

        {!requiredConsents.driverLicense && !requiredConsents.drugTest && !requiredConsents.biometric && (
          <div className="no-consents-message">
            {t('consents.none_required') || 'No consents are required for this verification process.'}
          </div>
        )}

        <div className="form-status">
          {isStepValid('consents') ? (
            <div className="valid-status">
              {t('consents.valid') || 'All required consents have been provided'}
            </div>
          ) : (
            <div className="invalid-status">
              {t('consents.invalid') || 'Please provide all required consents to proceed'}
            </div>
          )}
        </div>

        <div className="navigation-buttons">
          {canMovePrevious && (
            <button type="button" onClick={moveToPreviousStep} className="btn btn-secondary">
              {t('common.previous') || 'Previous'}
            </button>
          )}
          {canMoveNext && (
            <button
              type="button"
              onClick={moveToNextStep}
              className="btn btn-primary"
              disabled={!isStepValid('consents')}
            >
              {t('common.next') || 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConsentsStep;