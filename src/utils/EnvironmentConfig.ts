/**
 * Environment Configuration Utility
 *
 * This utility provides access to configuration values with type safety and default values.
 * For browser environments, it uses hardcoded defaults.
 * For Node.js environments, it can use process.env.
 */

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  defaultCollectionKey: string;
  port: number;
  devMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  apiBaseUrl: string;
  documentStoragePath: string;
}

/**
 * Default environment configuration values
 */
const defaultConfig: EnvironmentConfig = {
  // Default collection key in hyphen-separated format
  // Format: [language]-[personal]-[consents]-[residence]-[employment]-[education]-[proLicense]-[signature]
  // en-N-N-R3-E3-E-P-C = English, Personal Info disabled, No consents, 3-year residence, 3-year employment, Education enabled, Professional licenses enabled, Checkbox signature
  defaultCollectionKey: 'en-N-N-R3-E3-E-P-C',
  port: 3000,
  devMode: true,
  logLevel: 'info',
  apiBaseUrl: 'http://localhost:3001/api',
  documentStoragePath: './storage/documents',
};

/**
 * Get environment configuration
 *
 * @returns Environment configuration
 */
export function getConfig(): EnvironmentConfig {
  // In browser environment, use import.meta.env (Vite) if available
  if (typeof window !== 'undefined') {
    console.log('Browser environment detected, checking for environment variables');
    
    // Check if we're in a Vite environment with import.meta.env
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      console.log('Vite environment detected, loading from import.meta.env');
      console.log('import.meta.env contents:', {
        VITE_DEFAULT_COLLECTION_KEY: import.meta.env.VITE_DEFAULT_COLLECTION_KEY,
        VITE_PORT: import.meta.env.VITE_PORT,
        VITE_DEV_MODE: import.meta.env.VITE_DEV_MODE,
        VITE_LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL,
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        VITE_DOCUMENT_STORAGE_PATH: import.meta.env.VITE_DOCUMENT_STORAGE_PATH,
      });
      
      const devMode = import.meta.env.VITE_DEV_MODE ? import.meta.env.VITE_DEV_MODE.toLowerCase() === 'true' : defaultConfig.devMode;
      console.log('Parsed devMode value:', devMode, 'from raw value:', import.meta.env.VITE_DEV_MODE);
      
      return {
        defaultCollectionKey: import.meta.env.VITE_DEFAULT_COLLECTION_KEY || defaultConfig.defaultCollectionKey,
        port: import.meta.env.VITE_PORT ? Number(import.meta.env.VITE_PORT) : defaultConfig.port,
        devMode: devMode,
        logLevel: (import.meta.env.VITE_LOG_LEVEL || defaultConfig.logLevel) as 'debug' | 'info' | 'warn' | 'error',
        apiBaseUrl: import.meta.env.VITE_API_BASE_URL || defaultConfig.apiBaseUrl,
        documentStoragePath: import.meta.env.VITE_DOCUMENT_STORAGE_PATH || defaultConfig.documentStoragePath,
      };
    }
    
    // Fallback to default config for browser
    console.log('No environment variables found in browser, using default configuration');
    return defaultConfig;
  }
  
  // In Node.js environment, try to load from process.env
  // This is used for tests and server-side code
  try {
    if (typeof process !== 'undefined' && process.env) {
      console.log('Node.js environment detected, loading from process.env');
      
      return {
        defaultCollectionKey: process.env.DEFAULT_COLLECTION_KEY || defaultConfig.defaultCollectionKey,
        port: process.env.PORT ? Number(process.env.PORT) : defaultConfig.port,
        devMode: process.env.DEV_MODE ? process.env.DEV_MODE.toLowerCase() === 'true' : defaultConfig.devMode,
        logLevel: (process.env.LOG_LEVEL || defaultConfig.logLevel) as 'debug' | 'info' | 'warn' | 'error',
        apiBaseUrl: process.env.API_BASE_URL || defaultConfig.apiBaseUrl,
        documentStoragePath: process.env.DOCUMENT_STORAGE_PATH || defaultConfig.documentStoragePath,
      };
    }
  } catch (error) {
    console.error('Error loading environment configuration:', error);
  }
  
  // Fallback to default config
  return defaultConfig;
}

// Export default configuration for testing
export { defaultConfig };