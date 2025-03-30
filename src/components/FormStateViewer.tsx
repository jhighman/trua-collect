import React, { useState, useEffect } from 'react';
import { FormLogger } from '../utils/FormLogger';
import { parseCollectionKey, getRequirements, getTimelineYears, getEmployerCount } from '../utils/collectionKeyParser';
import './FormStateViewer.css';

// Icons for collapse/expand
const ChevronDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
  </svg>
);

/**
 * Interpret a collection key and return a readable description
 */
function interpretCollectionKey(key: string): string {
  try {
    const { language, facets } = parseCollectionKey(key);
    const [personal, consents, residence, employment, education, proLicense, signature] = facets;
    
    // Log the facets for debugging
    console.log('Interpreting key:', key);
    console.log('Facets:', facets);
    
    // Parse consents
    const consentsList = [];
    if (consents.includes('D')) consentsList.push('Driver License');
    if (consents.includes('T')) consentsList.push('Drug Test');
    if (consents.includes('B')) consentsList.push('Biometric');
    const consentsText = consentsList.length > 0
      ? `Consents: ${consentsList.join(', ')}`
      : 'No consents required';
    
    // Parse verification steps
    const steps = [];
    if (education === 'E') steps.push('Education');
    if (proLicense === 'P') steps.push('Professional Licenses');
    
    // Residence history
    if (residence !== 'N') {
      const residenceYears = getTimelineYears(residence);
      steps.push(`Residence History (${residenceYears} years)`);
    }
    
    // Employment history
    if (employment !== 'N') {
      if (employment.startsWith('EN')) {
        const employerCount = getEmployerCount(employment);
        steps.push(`Employment History (${employerCount} employers)`);
      } else {
        const employmentYears = getTimelineYears(employment);
        steps.push(`Employment History (${employmentYears} years)`);
      }
    }
    
    const stepsText = steps.length > 0
      ? `Steps: ${steps.join(', ')}`
      : 'No verification steps required';
    
    return `Language: ${language.toUpperCase()} | ${consentsText} | ${stepsText}`;
  } catch (error) {
    return `Invalid collection key: ${key}`;
  }
}

/**
 * Component to view form state logs
 */
export const FormStateViewer: React.FC = () => {
  const [logs, setLogs] = useState<ReturnType<typeof FormLogger.readFormState>>(null);
  const [selectedLogIndex, setSelectedLogIndex] = useState<number | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    formData: false,
    steps: false,
    keyInterpretation: false
  });

  // Load logs on mount
  useEffect(() => {
    const formLogs = FormLogger.readFormState();
    setLogs(formLogs);
  }, []);

  // Toggle section collapse state
  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Clear logs
  const handleClearLogs = () => {
    FormLogger.clearLogs();
    setLogs(null);
    setSelectedLogIndex(null);
  };

  // Refresh logs
  const handleRefreshLogs = () => {
    const formLogs = FormLogger.readFormState();
    setLogs(formLogs);
  };

  // Get selected log
  const selectedLog = selectedLogIndex !== null && logs ? logs[selectedLogIndex] : null;

  return (
    <div className="form-state-viewer">
      <div className="form-state-viewer-header">
        <h2>Form State Logs</h2>
        <div className="form-state-viewer-actions">
          <button onClick={handleRefreshLogs}>Refresh</button>
          <button onClick={handleClearLogs}>Clear Logs</button>
        </div>
      </div>

      <div className="form-state-viewer-content">
        {!logs || logs.length === 0 ? (
          <div className="form-state-viewer-empty">
            No form state logs available
          </div>
        ) : (
          <div className="form-state-viewer-logs">
            <div className="form-state-viewer-log-list">
              <h3>Log Entries</h3>
              <ul>
                {logs.map((log, index) => (
                  <li
                    key={index}
                    className={selectedLogIndex === index ? 'selected' : ''}
                    onClick={() => setSelectedLogIndex(index)}
                  >
                    <div className="log-entry-summary">
                      <span className="log-entry-timestamp">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <span className="log-entry-step">
                        Step: {log.currentStep}
                      </span>
                      <span className="log-entry-key">
                        Key: {log.collectionKey}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {selectedLog && (
              <div className="form-state-viewer-log-details">
                <h3>Log Details</h3>
                <div className="log-detail-item">
                  <strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}
                </div>
                <div className="log-detail-item">
                  <strong>Collection Key:</strong> {selectedLog.collectionKey}
                </div>
                {/* Key Interpretation Section */}
                <div className="log-detail-item collapsible">
                  <div
                    className="section-header"
                    onClick={() => toggleSection('keyInterpretation')}
                  >
                    <strong>Key Interpretation:</strong>
                    <span className="toggle-icon">
                      {collapsedSections.keyInterpretation ? <ChevronRight /> : <ChevronDown />}
                    </span>
                  </div>
                  {!collapsedSections.keyInterpretation && (
                    <div className="section-content">
                      <div className="key-interpretation">{interpretCollectionKey(selectedLog.collectionKey)}</div>
                    </div>
                  )}
                </div>
                
                <div className="log-detail-item">
                  <strong>Current Step:</strong> {selectedLog.currentStep}
                </div>
                
                {/* Form Data Section */}
                <div className="log-detail-item collapsible">
                  <div
                    className="section-header"
                    onClick={() => toggleSection('formData')}
                  >
                    <strong>Form Data:</strong>
                    <span className="toggle-icon">
                      {collapsedSections.formData ? <ChevronRight /> : <ChevronDown />}
                    </span>
                  </div>
                  {!collapsedSections.formData && (
                    <div className="section-content">
                      <pre>{JSON.stringify(selectedLog.formData, null, 2)}</pre>
                    </div>
                  )}
                </div>
                
                {/* Steps Section */}
                <div className="log-detail-item collapsible">
                  <div
                    className="section-header"
                    onClick={() => toggleSection('steps')}
                  >
                    <strong>Steps:</strong>
                    <span className="toggle-icon">
                      {collapsedSections.steps ? <ChevronRight /> : <ChevronDown />}
                    </span>
                  </div>
                  {!collapsedSections.steps && (
                    <div className="section-content">
                      <pre>{JSON.stringify(selectedLog.steps, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormStateViewer;