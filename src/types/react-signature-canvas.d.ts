import SignatureCanvas from 'react-signature-canvas';

declare module 'react-signature-canvas' {
  export interface ReactSignatureCanvasProps {
    onEnd?: () => void;
  }
}

export default SignatureCanvas; 