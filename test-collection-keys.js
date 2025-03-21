// Test script to verify collection key parsing and form configuration generation
import { parseCollectionKey, getRequirements } from './src/utils/collectionKeyParser.ts';
import { FormConfigGenerator } from './src/utils/FormConfigGenerator.ts';

// Test different collection keys
const testKeys = [
  {
    key: 'en000111100100',
    description: 'Default Collection Key (All Steps Enabled)'
  },
  {
    key: 'en000101100100',
    description: 'Professional Licenses Disabled (bit 4 set to 0)'
  },
  {
    key: 'en000110100100',
    description: 'Residence History Disabled (bit 5 set to 0)'
  },
  {
    key: 'en000011100100',
    description: 'Education Disabled (bit 3 set to 0)'
  },
  {
    key: 'en000001100100',
    description: 'Education & Professional Licenses Disabled (bits 3 and 4 set to 0)'
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
    
    // Generate form configuration from requirements
    const formConfig = FormConfigGenerator.generateFormConfig(requirements);
    
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