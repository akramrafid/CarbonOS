import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-carbon text-registry font-sans">
      <Loader2 size={32} className="animate-spin text-emerald mb-4" />
      <span className="font-mono text-sm text-mist tracking-widest uppercase">Initializing Module...</span>
    </div>
  );
};

export default LoadingSpinner;
