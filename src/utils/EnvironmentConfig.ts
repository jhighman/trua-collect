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
  // en-EP-N-R3-E3-E-P-C = English, Email+Phone, No consents, 3-year residence, 3-year employment, Education enabled, Professional licenses enabled, Checkbox signature
  defaultCollectionKey: 'en-EP-N-R3-E3-E-P-C',
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
  // In browser environment, just return the default config
  // This avoids issues with accessing process.env in the browser
  if (typeof window !== 'undefined') {
    console.log('Browser environment detected, using default configuration');
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