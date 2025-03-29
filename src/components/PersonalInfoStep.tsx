import React, { useState, useEffect } from 'react';
import { useForm } from '../context/FormContext';
import { useTranslation } from '../context/TranslationContext';
import './PersonalInfoStep.css';

export const PersonalInfoStep: React.FC = () => {
  const { t } = useTranslation();
  const {
    setValue,
    getValue,
    getStepErrors,
    isStepValid,
    moveToNextStep,
    canMoveNext  } = useForm();
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Get form values with proper type assertions
  const fullName = (getValue('personal-info', 'fullName') as string) || '';
  const email = (getValue('personal-info', 'email') as string) || '';
  
  // Get errors from form context
  useEffect(() => {
    const formErrors = getStepErrors('personal-info');
    setErrors(formErrors);
  }, [getStepErrors]);
  
  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setValue('personal-info', field, value);
  };
  
  return (
    <div className="personal-info-step">
      <div className="step-header">
        <h2>{t('personal_info.title') || 'Personal Information'}</h2>
        <p className="step-description">
          {t('personal_info.description') || 'Please provide your personal information below.'}
        </p>
      </div>
      
      <div className="form-container">
        <div className="form-group">
          <label htmlFor="fullName">
            {t('personal_info.full_name') || 'Full Name'}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            value={fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
            className={errors.fullName ? 'has-error' : ''}
            aria-invalid={!!errors.fullName}
            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
          />
          {errors.fullName && (
            <div className="error-message" id="fullName-error">
              {errors.fullName}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="email">
            {t('personal_info.email') || 'Email Address'}
            <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={errors.email ? 'has-error' : ''}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <div className="error-message" id="email-error">
              {errors.email}
            </div>
          )}
        </div>
        
        {/* Additional fields can be added here based on requirements */}
        
        <div className="form-status">
          {isStepValid('personal-info') ? (
            <div className="valid-status">
              {t('personal_info.valid') || 'All information is valid'}
            </div>
          ) : (
            <div className="invalid-status">
              {t('personal_info.invalid') || 'Please complete all required fields'}
            </div>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="navigation-buttons mt-6 flex justify-end">
          <button
            type="button"
            onClick={moveToNextStep}
            disabled={!canMoveNext || !isStepValid('personal-info')}
            className={`px-4 py-2 rounded ${
              canMoveNext && isStepValid('personal-info')
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Next step"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;