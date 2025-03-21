import { FormState } from '../context/FormContext';

/**
 * Utility to log form state and collection key
 * This is useful for debugging and testing
 */
export class FormLogger {
  private static readonly LOCAL_STORAGE_KEY = 'trua_form_state_log';
  private static readonly MAX_LOG_ENTRIES = 10;

  /**
   * Log form state and collection key
   * @param formState The current form state
   * @param collectionKey The collection key used to generate the form
   * @param formData Any additional form data to log
   */
  public static logFormState(
    formState: FormState,
    collectionKey: string,
    formData?: Record<string, unknown>
  ): void {
    try {
      // Create log data
      const logData = {
        timestamp: new Date().toISOString(),
        collectionKey,
        currentStep: formState.currentStep,
        steps: formState.steps,
        formData
      };
      
      // Debug log
      console.log('Logging form state:', logData);

      // In browser environment, use localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        // Get existing logs
        const existingLogsJson = localStorage.getItem(FormLogger.LOCAL_STORAGE_KEY) || '[]';
        const existingLogs = JSON.parse(existingLogsJson);
        
        // Add new log entry
        existingLogs.push(logData);
        
        // Keep only the most recent logs
        const recentLogs = existingLogs.slice(-FormLogger.MAX_LOG_ENTRIES);
        
        // Save back to localStorage
        localStorage.setItem(FormLogger.LOCAL_STORAGE_KEY, JSON.stringify(recentLogs));
        
        console.log('Form state logged to localStorage');
      } else {
        // In Node.js environment, just log to console
        console.log('Form state log:', JSON.stringify(logData, null, 2));
      }
    } catch (error) {
      console.error('Error logging form state:', error);
    }
  }

  /**
   * Read the logged form state
   * @returns The logged form state or null if no logs exist
   */
  public static readFormState(): {
    timestamp: string;
    collectionKey: string;
    currentStep: string;
    steps: Record<string, unknown>;
    formData?: Record<string, unknown>;
  }[] | null {
    try {
      // In browser environment, use localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        const logsJson = localStorage.getItem(FormLogger.LOCAL_STORAGE_KEY);
        if (!logsJson) {
          return null;
        }
        return JSON.parse(logsJson);
      } else {
        // In Node.js environment, we can't retrieve logs
        console.log('Reading form state logs is only available in browser environment');
        return null;
      }
    } catch (error) {
      console.error('Error reading form state:', error);
      return null;
    }
  }

  /**
   * Clear all logged form states
   */
  public static clearLogs(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(FormLogger.LOCAL_STORAGE_KEY);
        console.log('Form state logs cleared');
      }
    } catch (error) {
      console.error('Error clearing form state logs:', error);
    }
  }
}