import React, { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { useTranslation } from '../context/TranslationContext';
import { useForm } from '../context/FormContext';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import StepHeader from './StepHeader';
import './Signature.css';

// Define the extended props type
type ExtendedSignatureCanvasProps = {
  onEnd?: () => void;
  ref: React.RefObject<SignatureCanvas>;
  canvasProps: {
    className: string;
    width: number;
    height: number;
    'aria-label': string;
    role: string;
  };
};

interface SignatureProps {
  onSignatureChange?: (dataUrl: string | null) => void;
}

export const Signature: React.FC<SignatureProps> = ({ onSignatureChange }) => {
  const { t } = useTranslation();
  const { setValue, getValue, getStepErrors, submitForm } = useForm();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Get errors from form context
  const errors = getStepErrors('signature');
  
  // Check for signature error from form validation
  useEffect(() => {
    if (errors.signature) {
      setError(errors.signature);
    }
  }, [errors]);
  
  
  useEffect(() => {
    // Store ref in a variable inside the effect
    const canvas = sigCanvas.current;
    
    // Use the stored ref value
    if (canvas) {
      const existingSignature = getValue('signature', 'signature') as string || '';
      canvas.fromDataURL(existingSignature);
    }

    // Use the stored ref in cleanup
    return () => {
      if (canvas) {
        // cleanup code using canvas instead of sigCanvas.current
      }
    };
  }, [getValue]); // Add other dependencies as needed
  
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
      setValue('signature', 'signature', '');
      
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
  
  const handleSubmit = async () => {
    // Validate signature
    if (sigCanvas.current && sigCanvas.current.isEmpty()) {
      setError(t('signature.error_empty') || 'Please provide your signature');
      return;
    }
    
    // Validate confirmation checkbox
    if (!getValue('signature', 'confirmation')) {
      setError(t('signature.error_confirmation') || 'Please confirm your signature');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Generate a tracking ID
      const trackingId = uuidv4();
      setValue('signature', 'trackingId', trackingId);
      
      // Submit the form
      await submitForm();
      
      // Navigate to confirmation page with tracking ID
      navigate(`/confirmation?trackingId=${trackingId}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(t('signature.error_submit') || 'An error occurred while submitting the form. Please try again.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="signature-component">
      <StepHeader
        title={t('signature.title') || 'Your Signature'}
        description={t('signature.instructions') || 'Please sign using your mouse or touch screen below.'}
      />
      
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
          onEnd={handleEnd}
        />
      </div>
      
      {error && <div className="signature-error">{error}</div>}
      
      <div className="signature-actions">
        <button
          type="button"
          className="btn btn-secondary"
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
            checked={(getValue('signature', 'confirmation') as boolean) || false}
          />
          <label htmlFor="signature-confirm">
            {t('signature.confirm') || 'I confirm that this is my legal signature'}
          </label>
        </div>
      </div>
      
      <div className="submit-section">
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={handleSubmit}
          disabled={isSubmitting}
          aria-label={t('signature.submit_button_label') || 'Submit verification'}
        >
          {isSubmitting
            ? (t('signature.submitting') || 'Submitting...')
            : (t('signature.submit') || 'Submit Verification')}
        </button>
        <p className="submit-note">
          {t('signature.submit_note') ||
            'After submitting, you will be able to download a PDF copy of your verification.'}
        </p>
      </div>
    </div>
  );
};

export default Signature;