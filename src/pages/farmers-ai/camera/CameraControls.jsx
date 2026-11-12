import React from 'react';
import { Camera, Upload } from 'lucide-react';
import { Button } from '../../../components/ui/Button';

export function CameraControls({
  isCameraActive,
  error,
  isProcessing,
  onCapture,
  onFileSelectClick,
  onRetryCamera
}) {
  const showActiveCamera = isCameraActive && !error;

  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
      <Button
        variant="primary"
        size="lg"
        onClick={showActiveCamera ? onCapture : onFileSelectClick}
        disabled={isProcessing}
        loading={isProcessing}
        className="flex-grow text-base"
        leftIcon={showActiveCamera ? <Camera className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
      >
        {showActiveCamera ? 'Check my crop / রোগ নির্ণয় করুন' : 'Upload Picture / ছবি আপলোড করুন'}
      </Button>
      <Button
        variant="secondary"
        size="lg"
        onClick={showActiveCamera ? onFileSelectClick : onRetryCamera}
        disabled={isProcessing}
        leftIcon={showActiveCamera ? <Upload className="w-5 h-5 text-[#CCFF00]" /> : <Camera className="w-5 h-5 text-[#CCFF00]" />}
      >
        {showActiveCamera ? 'Upload / আপলোড' : 'Retry Camera'}
      </Button>
    </div>
  );
}

export default CameraControls;
