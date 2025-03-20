import React, { useState } from 'react';
import { useTranslation } from '../context/TranslationContext';
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
}

interface EducationEntryProps {
  entry: EducationEntryData;
  onSave: (entry: EducationEntryData) => void;
  onCancel: () => void;
  errors?: Record<string, string>;
}

export const EducationEntry: React.FC<EducationEntryProps> = ({
  entry,
  onSave,
  onCancel,
  errors = {}
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EducationEntryData>(entry);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // If current education, set end date to empty
    if (name === 'isCurrent' && checked) {
      setFormData(prev => ({ ...prev, endDate: '' }));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div className="education-entry">
      <h3>{formData.id ? t('education.edit_title') || 'Edit Education' : t('education.add_title') || 'Add Education'}</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="institution">
            {t('education.institution') || 'Institution Name'}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="institution"
            name="institution"
            value={formData.institution}
            onChange={handleChange}
            className={errors.institution ? 'has-error' : ''}
            aria-invalid={!!errors.institution}
            aria-describedby={errors.institution ? 'institution-error' : undefined}
          />
          {errors.institution && (
            <div className="error-message" id="institution-error">
              {errors.institution}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="degree">
            {t('education.degree') || 'Degree'}
            <span className="required">*</span>
          </label>
          <input
            type="text"
            id="degree"
            name="degree"
            value={formData.degree}
            onChange={handleChange}
            className={errors.degree ? 'has-error' : ''}
            aria-invalid={!!errors.degree}
            aria-describedby={errors.degree ? 'degree-error' : undefined}
          />
          {errors.degree && (
            <div className="error-message" id="degree-error">
              {errors.degree}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="fieldOfStudy">
            {t('education.field_of_study') || 'Field of Study'}
          </label>
          <input
            type="text"
            id="fieldOfStudy"
            name="fieldOfStudy"
            value={formData.fieldOfStudy}
            onChange={handleChange}
            className={errors.fieldOfStudy ? 'has-error' : ''}
            aria-invalid={!!errors.fieldOfStudy}
            aria-describedby={errors.fieldOfStudy ? 'fieldOfStudy-error' : undefined}
          />
          {errors.fieldOfStudy && (
            <div className="error-message" id="fieldOfStudy-error">
              {errors.fieldOfStudy}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="location">
            {t('education.location') || 'Location'}
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className={errors.location ? 'has-error' : ''}
            aria-invalid={!!errors.location}
            aria-describedby={errors.location ? 'location-error' : undefined}
          />
          {errors.location && (
            <div className="error-message" id="location-error">
              {errors.location}
            </div>
          )}
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="startDate">
              {t('education.start_date') || 'Start Date'}
              <span className="required">*</span>
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className={errors.startDate ? 'has-error' : ''}
              aria-invalid={!!errors.startDate}
              aria-describedby={errors.startDate ? 'startDate-error' : undefined}
            />
            {errors.startDate && (
              <div className="error-message" id="startDate-error">
                {errors.startDate}
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="endDate">
              {t('education.end_date') || 'End Date'}
              {!formData.isCurrent && <span className="required">*</span>}
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              disabled={formData.isCurrent}
              className={errors.endDate ? 'has-error' : ''}
              aria-invalid={!!errors.endDate}
              aria-describedby={errors.endDate ? 'endDate-error' : undefined}
            />
            {errors.endDate && (
              <div className="error-message" id="endDate-error">
                {errors.endDate}
              </div>
            )}
          </div>
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="isCurrent"
            name="isCurrent"
            checked={formData.isCurrent}
            onChange={handleCheckboxChange}
          />
          <label htmlFor="isCurrent">
            {t('education.is_current') || 'I am currently studying here'}
          </label>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">
            {t('education.description') || 'Description'}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder={t('education.description_placeholder') || 'Describe your education, achievements, and activities'}
            className={errors.description ? 'has-error' : ''}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          {errors.description && (
            <div className="error-message" id="description-error">
              {errors.description}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="button" className="cancel-button" onClick={onCancel}>
            {t('common.cancel') || 'Cancel'}
          </button>
          <button type="submit" className="save-button">
            {t('education.save_button') || 'Save Education'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EducationEntry;