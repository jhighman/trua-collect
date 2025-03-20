import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useTranslation } from '../context/TranslationContext';
import { useForm } from '../context/FormContext';
import './Signature.css';

interface SignatureProps {
  onSignatureChange?: (dataUrl: string | null) => void;
}

export const Signature: React.FC<SignatureProps> = ({ onSignatureChange }) => {
  const { t } = useTranslation();
  const { setValue, getValue, getStepErrors } = useForm();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Get errors from form context
  const errors = getStepErrors('signature');
  
  // Check for signature error from form validation
  useEffect(() => {
    if (errors.signature) {
      setError(errors.signature);
    }
  }, [errors]);
  
  // Load existing signature if available
  useEffect(() => {
    const existingSignature = getValue('signature', 'signature');
    if (existingSignature && sigCanvas.current) {
      sigCanvas.current.fromDataURL(existingSignature);
    }
  }, [getValue]);

  // Set up event handlers when the component mounts
  useEffect(() => {
    if (sigCanvas.current) {
      // For react-signature-canvas, we need to use the on method
      // to attach event handlers
      sigCanvas.current.on();
    }
    
    return () => {
      if (sigCanvas.current) {
        sigCanvas.current.off();
      }
    };
  }, []);
  
  const handleClear = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setError(null);
      
      // Update form state
      setValue('signature', 'signature', null);
      
      // Notify parent component
      if (onSignatureChange) {
        onSignatureChange(null);
      }
    }
  };
  
  const handleEnd = () => {
    if (sigCanvas.current) {
      const isEmpty = sigCanvas.current.isEmpty();
      
      if (isEmpty) {
        setError(t('signature.error_empty') || 'Please provide your signature');
        return;
      }
      
      setError(null);
      const signatureData = sigCanvas.current.toDataURL('image/png');
      
      // Update form state
      setValue('signature', 'signature', signatureData);
      
      // Notify parent component
      if (onSignatureChange) {
        onSignatureChange(signatureData);
      }
    }
  };
  
  return (
    <div className="signature-component">
      <div className="signature-title">
        <h3>{t('signature.title') || 'Your Signature'}</h3>
        <p className="signature-instructions">
          {t('signature.instructions') || 'Please sign using your mouse or touch screen below.'}
        </p>
      </div>
      
      <div className={`signature-canvas-container ${error ? 'has-error' : ''}`}>
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'signature-canvas',
            width: 600,
            height: 200,
            'aria-label': t('signature.canvas_label') || 'Signature Canvas',
            role: 'application'
          }}
        />
      </div>
      
      {error && <div className="signature-error">{error}</div>}
      
      <div className="signature-actions">
        <button 
          type="button" 
          className="clear-button"
          onClick={handleClear}
          aria-label={t('signature.clear_button_label') || 'Clear signature'}
        >
          {t('signature.clear') || 'Clear'}
        </button>
      </div>
      
      <div className="signature-attestation">
        <p>
          {t('signature.attestation') || 
            'By signing above, I certify that all information provided is true and accurate to the best of my knowledge.'}
        </p>
        <div className="checkbox-container">
          <input 
            type="checkbox" 
            id="signature-confirm" 
            onChange={(e) => setValue('signature', 'confirmation', e.target.checked)}
            checked={getValue('signature', 'confirmation') || false}
          />
          <label htmlFor="signature-confirm">
            {t('signature.confirm') || 'I confirm that this is my legal signature'}
          </label>
        </div>
      </div>
    </div>
  );
};

export default Signature;