import React from 'react';
import { Loader2 } from 'lucide-react';
import BrandLogo from './BrandLogo';

const LoadingSpinner = () => {
  return (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-carbon text-registry font-sans gap-4">
      <BrandLogo variant="auto" heightClass="h-8" showBdBadge={true} />
      <Loader2 size={28} className="animate-spin text-emerald" />
      <span className="font-mono text-xs text-mist tracking-widest uppercase">Initializing Module...</span>
    </div>
  );
};

export default LoadingSpinner;
