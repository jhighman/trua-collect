import React, { useState, useEffect } from 'react';
import { useTranslation } from '../context/TranslationContext';
import { useForm } from '../context/FormContext';
import './PersonalInfoStep.css';

export const PersonalInfoStep: React.FC = () => {
  const { t } = useTranslation();
  const { setValue, getValue, getStepErrors, isStepValid, moveToNextStep } = useForm();
  
  // Initialize form data from form context
  const [formData, setFormData] = useState({
    fullName: getValue('personal-info', 'fullName') as string || '',
    email: getValue('personal-info', 'email') as string || ''
  });
  
  // Get errors from form context
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const formErrors = getStepErrors('personal-info');
    setErrors(formErrors);
  }, [getStepErrors]);
  
  // Validate email format
  const validateEmail = (email: string): string | null => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    return null;
  };
  
  // Validate full name
  const validateFullName = (name: string): string | null => {
    if (!name) {
      return 'Full name is required';
    }
    if (name.length < 2) {
      return 'Name must be at least 2 characters';
    }
    return null;
  };
  
  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Validate and update form context
    const newErrors = { ...errors };
    
    if (field === 'fullName') {
      const nameError = validateFullName(value);
      if (nameError) {
        newErrors.fullName = nameError;
      } else {
        delete newErrors.fullName;
      }
    } else if (field === 'email') {
      const emailError = validateEmail(value);
      if (emailError) {
        newErrors.email = emailError;
      } else {
        delete newErrors.email;
      }
    }
    
    setErrors(newErrors);
    setValue('personal-info', field, value);
  };
  
  const isValid = !errors.fullName && !errors.email && formData.fullName && formData.email;
  
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
            value={formData.fullName}
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
            value={formData.email}
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
        
        <div className="form-status">
          {isValid ? (
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
        <div className="form-navigation">
          <button
            type="button"
            onClick={() => {
              if (isValid) {
                moveToNextStep();
              }
            }}
            disabled={!isValid}
            className="btn btn-primary"
            aria-label="Next step"
          >
            {t('common.next') || 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoStep;