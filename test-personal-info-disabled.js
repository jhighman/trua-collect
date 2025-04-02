// Test script to verify personal info step can be disabled
import { getRequirements } from './src/utils/collectionKeyParser.ts';
import { FormConfigGenerator } from './src/utils/FormConfigGenerator.ts';

// Test collection key with personal info disabled
const testKey = 'en-N-N-R3-E3-E-P-C';

console.log('\n=== Testing Collection Key with Personal Info Disabled ===');
console.log(`Key: ${testKey}`);

try {
  // Get requirements from the collection key
  const requirements = getRequirements(testKey);
  console.log('Personal Info Enabled:', requirements.verificationSteps.personalInfo.enabled);
  
  // Check if isStepEnabled would return false for personal-info
  const isStepEnabled = (stepId, reqs) => {
    if (stepId === 'personal-info') {
      return reqs.verificationSteps.personalInfo?.enabled || false;
    }
    return true;
  };
  
  console.log('isStepEnabled for personal-info:', isStepEnabled('personal-info', requirements));
  
  // Generate form configuration from collection key
  const formConfig = FormConfigGenerator.generateFormConfig(testKey);
  
  // Check if personal-info step is in the form config
  const personalInfoStep = formConfig.steps.find(step => step.id === 'personal-info');
  console.log('Personal Info Step in Form Config:', personalInfoStep ? 'Yes' : 'No');
  
  if (personalInfoStep) {
    console.log('Personal Info Step Enabled:', personalInfoStep.enabled);
  }
  
  // Log all enabled steps
  console.log('\nEnabled Steps:');
  formConfig.steps.forEach(step => {
    console.log(`- ${step.id}: ${step.enabled ? 'Enabled' : 'Disabled'}`);
  });
  
} catch (error) {
  console.error('Error testing collection key:', error);
}