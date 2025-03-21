import React, { useEffect } from 'react';
import { useForm } from '../context/FormContext';
import { EducationLevel } from '../types/EducationLevel';

/**
 * Test component to directly set education values in the form state
 */
export const EducationStepTest: React.FC = () => {
  const { setValue, formState, moveToNextStep } = useForm();

  // Set education values directly on mount
  useEffect(() => {
    console.log('EducationStepTest mounted');
    console.log('Initial form state:', formState);
    
    // Create a test entry
    const testEntry = {
      id: 'test-entry-1',
      institution: 'Test University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2010-09-01',
      endDate: '2014-05-31',
      isCurrent: false,
      description: 'Test description',
      location: 'Test Location'
    };
    
    // Set each field individually with a delay between them
    setTimeout(() => {
      console.log('Setting highestLevel');
      setValue('education', 'highestLevel', EducationLevel.Bachelors);
      
      setTimeout(() => {
        console.log('Setting entries');
        setValue('education', 'entries', [testEntry]);
        
        // Force validation update
        setTimeout(() => {
          console.log('Forcing validation update');
          setValue('education', '_forceUpdate', Date.now());
          
          // Log the form state after a short delay to allow for updates
          setTimeout(() => {
            console.log('Form state after direct update:', formState);
            
            // Check if the education step is in the form state
            if (formState.steps.education) {
              console.log('Education step values after direct update:', formState.steps.education.values);
              console.log('Education step touched after direct update:', formState.steps.education.touched);
              console.log('Education step isValid:', formState.steps.education.isValid);
              console.log('Education step isComplete:', formState.steps.education.isComplete);
            } else {
              console.log('Education step not found in form state');
            }
          }, 100);
        }, 100);
      }, 100);
    }, 100);
  }, [setValue, formState]);

  return (
    <div className="education-step-test">
      <h2>Education Step Test</h2>
      <p>This component directly sets education values in the form state.</p>
      
      <div className="form-state-debug">
        <h3>Form State Debug</h3>
        <pre>{JSON.stringify(formState, null, 2)}</pre>
      </div>
      
      <button
        onClick={() => {
          console.log('Moving to next step');
          
          // Set education values again right before navigation
          const testEntry = {
            id: 'test-entry-1',
            institution: 'Test University',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science',
            startDate: '2010-09-01',
            endDate: '2014-05-31',
            isCurrent: false,
            description: 'Test description',
            location: 'Test Location'
          };
          
          setValue('education', 'highestLevel', EducationLevel.Bachelors);
          setValue('education', 'entries', [testEntry]);
          setValue('education', '_forceUpdate', Date.now());
          
          // Log form state before navigation
          console.log('Form state before navigation:', formState);
          
          // Try to move to the next step
          moveToNextStep();
        }}
      >
        Move to Next Step
      </button>
    </div>
  );
};

export default EducationStepTest;