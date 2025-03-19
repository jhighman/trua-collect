import React from 'react';
import { useForm } from '../context/FormContext';

export const FormStep: React.FC = () => {
  const { 
    currentStep,
    setValue,
    getValue,
    getStepErrors,
    canMoveNext,
    moveToNextStep
  } = useForm();

  const handleInputChange = (fieldId: string, value: any) => {
    setValue(currentStep, fieldId, value);
  };

  const errors = getStepErrors(currentStep);

  return (
    <div>
      {/* Form fields */}
      <button 
        disabled={!canMoveNext}
        onClick={moveToNextStep}
      >
        Next
      </button>
    </div>
  );
}; 