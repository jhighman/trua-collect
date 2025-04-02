import React from 'react';
import { InfoIcon } from 'lucide-react';
import './StepHeader.css';

interface StepHeaderProps {
  title: string;
  description: string;
  translationParams?: Record<string, string>;
  children?: React.ReactNode;
}

/**
 * A common header component for all form steps
 *
 * @param title - The title of the step
 * @param description - The description text for the step
 * @param translationParams - Optional parameters for translation
 * @param children - Optional content to render inside the header
 */
export const StepHeader: React.FC<StepHeaderProps> = ({
  title,
  description,
  translationParams,
  children
}) => {
  return (
    <div className="step-header-container mb-6 w-full">
      <div className="step-header-title">
        <h2>{title}</h2>
      </div>
      <div className="step-header-description">
        <InfoIcon className="info-icon" />
        <p>{description}</p>
      </div>
      {children && <div className="step-header-content">{children}</div>}
    </div>
  );
};

export default StepHeader;