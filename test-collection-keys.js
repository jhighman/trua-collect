// Test script to verify collection key parsing and form configuration generation
import { parseCollectionKey, getRequirements } from './src/utils/collectionKeyParser.ts';
import { FormConfigGenerator } from './src/utils/FormConfigGenerator.ts';

// Test different collection keys
const testKeys = [
  {
    key: 'en-EP-N-R3-E3-E-P-C',
    description: 'Default Collection Key (All Steps Enabled)'
  },
  {
    key: 'en-EP-N-R3-E3-E-N-C',
    description: 'Professional Licenses Disabled'
  },
  {
    key: 'en-EP-N-N-E3-E-P-C',
    description: 'Residence History Disabled'
  },
  {
    key: 'en-EP-N-R3-E3-N-P-C',
    description: 'Education Disabled'
  },
  {
    key: 'en-EP-N-R3-E3-N-N-C',
    description: 'Education & Professional Licenses Disabled'
  },
  {
    key: 'en-N-N-R3-E3-E-P-C',
    description: 'Personal Info Disabled'
  }
];

// Test each collection key
testKeys.forEach(test => {
  console.log('\n=== Testing Collection Key ===');
  console.log(`Key: ${test.key}`);
  console.log(`Description: ${test.description}`);
  
  try {
    // Parse the collection key
    const collectionKey = parseCollectionKey(test.key);
    console.log('Parsed Collection Key:', collectionKey);
    
    // Get requirements from the collection key
    const requirements = getRequirements(test.key);
    console.log('Requirements:', JSON.stringify(requirements, null, 2));
    
    // Generate form configuration from collection key
    const formConfig = FormConfigGenerator.generateFormConfig(test.key);
    
    // Log the enabled steps
    console.log('Enabled Steps:');
    formConfig.steps.forEach(step => {
      console.log(`- ${step.id}: ${step.enabled ? 'Enabled' : 'Disabled'}`);
    });
    
    // Check if professional-licenses is enabled
    const professionalLicensesStep = formConfig.steps.find(step => step.id === 'professional-licenses');
    console.log('Professional Licenses Step:', professionalLicensesStep ? 'Found' : 'Not Found');
    if (professionalLicensesStep) {
      console.log('Professional Licenses Enabled:', professionalLicensesStep.enabled);
    }
    
    // Log the step order
    console.log('Step Order:');
    formConfig.steps.forEach(step => {
      console.log(`- ${step.order}: ${step.id}`);
    });
    
    // Log the required steps
    console.log('Required Steps:', formConfig.navigation.requiredSteps);
    
  } catch (error) {
    console.error('Error testing collection key:', error);
  }
});