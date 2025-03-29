import { getConfig, defaultConfig } from './EnvironmentConfig';

// Mock window and process.env
const originalWindow = global.window;
const originalEnv = process.env;

describe('EnvironmentConfig', () => {
  beforeEach(() => {
    // Reset mocks before each test
    global.window = originalWindow;
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original values after all tests
    global.window = originalWindow;
    process.env = originalEnv;
  });

  it('should use default values in browser environment', () => {
    // Mock browser environment
    global.window = {} as Window & typeof globalThis;
    
    const config = getConfig();

    expect(config.defaultCollectionKey).toBe(defaultConfig.defaultCollectionKey);
    expect(config.port).toBe(defaultConfig.port);
    expect(config.devMode).toBe(defaultConfig.devMode);
    expect(config.logLevel).toBe(defaultConfig.logLevel);
    expect(config.apiBaseUrl).toBe(defaultConfig.apiBaseUrl);
    expect(config.documentStoragePath).toBe(defaultConfig.documentStoragePath);
  });

  it('should use environment variables in Node.js environment when they are set', () => {
    // Mock Node.js environment (window is undefined)
    delete (global as { window?: Window & typeof globalThis }).window;
    
    // Set environment variables
    process.env.DEFAULT_COLLECTION_KEY = 'en-EPMA-DTB-R5-E5-E-P-W';
    process.env.PORT = '4000';
    process.env.DEV_MODE = 'false';
    process.env.LOG_LEVEL = 'debug';
    process.env.API_BASE_URL = 'http://localhost:4001/api';
    process.env.DOCUMENT_STORAGE_PATH = './custom/storage';

    // Add console log to debug
    console.log('Test - process.env.DEFAULT_COLLECTION_KEY:', process.env.DEFAULT_COLLECTION_KEY);
    console.log('Test - typeof window:', typeof window);

    const config = getConfig();
    
    console.log('Test - config.defaultCollectionKey:', config.defaultCollectionKey);

    expect(config.defaultCollectionKey).toBe('en-EPMA-DTB-R5-E5-E-P-W');
    expect(config.port).toBe(4000);
    expect(config.devMode).toBe(false);
    expect(config.logLevel).toBe('debug');
    expect(config.apiBaseUrl).toBe('http://localhost:4001/api');
    expect(config.documentStoragePath).toBe('./custom/storage');
  });

  it('should use default values in Node.js environment when environment variables are not set', () => {
    // Mock Node.js environment (window is undefined)
    global.window = undefined as unknown as (Window & typeof globalThis);
    
    // Clear environment variables
    process.env.DEFAULT_COLLECTION_KEY = undefined;
    process.env.PORT = undefined;
    process.env.DEV_MODE = undefined;
    process.env.LOG_LEVEL = undefined;
    process.env.API_BASE_URL = undefined;
    process.env.DOCUMENT_STORAGE_PATH = undefined;

    const config = getConfig();

    expect(config.defaultCollectionKey).toBe(defaultConfig.defaultCollectionKey);
    expect(config.port).toBe(defaultConfig.port);
    expect(config.devMode).toBe(defaultConfig.devMode);
    expect(config.logLevel).toBe(defaultConfig.logLevel);
    expect(config.apiBaseUrl).toBe(defaultConfig.apiBaseUrl);
    expect(config.documentStoragePath).toBe(defaultConfig.documentStoragePath);
  });
});