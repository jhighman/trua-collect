import React, { useState, useEffect } from 'react';
import { useForm } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import './ConsentsStep.css';

export const ConsentsStep: React.FC = () => {
  const { t } = useTranslation();
  const { setValue, getValue, getStepErrors, isStepValid } = useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get form values
  const driverLicenseConsent = getValue('consents', 'driverLicenseConsent') || false;
  const drugTestConsent = getValue('consents', 'drugTestConsent') || false;
  const biometricConsent = getValue('consents', 'biometricConsent') || false;
  
  // Get errors from form context
  useEffect(() => {
    const formErrors = getStepErrors('consents');
    setErrors(formErrors);
  }, [getStepErrors]);
  
  // Handle checkbox changes
  const handleConsentChange = (field: string, checked: boolean) => {
    setValue('consents', field, checked);
  };
  
  // Determine which consents are required based on form state
  const requiredConsents = {
    driverLicense: Object.prototype.hasOwnProperty.call(errors, 'driverLicenseConsent'),
    drugTest: Object.prototype.hasOwnProperty.call(errors, 'drugTestConsent'),
    biometric: Object.prototype.hasOwnProperty.call(errors, 'biometricConsent')
  };
  
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
                'I consent to the verification of my driver license information as part of this background check process. I understand that this may include confirming the validity, status, and history of my driver license with relevant authorities.'}
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
                'I consent to undergo drug testing as part of this employment screening process. I understand that test results will be shared with the requesting organization and may affect my eligibility for employment.'}
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
                'I consent to the collection, storage, and use of my biometric data (including but not limited to fingerprints, facial recognition, or other unique physical characteristics) for identity verification purposes.'}
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
      </div>
    </div>
  );
};

export default ConsentsStep;