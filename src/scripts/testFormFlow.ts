/* eslint-disable no-console */
import { FormTester } from '../utils/FormTester';

/**
 * Test the form flow with different collection keys
 */
function testFormFlow() {
  console.log('=== Testing Form Flow ===');
  
  // Test with no consents required
  console.log('\n=== Test 1: No Consents Required ===');
  const tester1 = new FormTester('en-EP-N-R3-E3-E-P-C');
  tester1.runFormFlow();
  
  // Test with all consents required
  console.log('\n=== Test 2: All Consents Required ===');
  const tester2 = new FormTester('en-EP-DTB-R3-E3-E-P-C');
  tester2.runFormFlow();
  
  // Test with only driver license consent required
  console.log('\n=== Test 3: Only Driver License Consent Required ===');
  const tester3 = new FormTester('en-EP-D-R3-E3-E-P-C');
  tester3.runFormFlow();
  
  // Test with no education step
  console.log('\n=== Test 4: No Education Step ===');
  const tester4 = new FormTester('en-EP-DTB-R3-E3-N-P-C');
  tester4.runFormFlow();
  
  console.log('\n=== Testing Complete ===');
}

// Run the tests
testFormFlow();