/// <reference types="@testing-library/jest-dom" />

import '@testing-library/jest-dom';
import 'jest-canvas-mock';
import { TextDecoder, TextEncoder } from 'util';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toBeDisabled(): R;
    }
  }
}

global.TextDecoder = TextDecoder as typeof global.TextDecoder;
global.TextEncoder = TextEncoder as typeof global.TextEncoder;

// Add any other test setup you need below

// Configure any global test settings
beforeAll(() => {
  // Any global setup before all tests
});

afterAll(() => {
  // Any global cleanup after all tests
}); 