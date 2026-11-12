import React from 'react';
import { Upload, AlertCircle, Sprout } from 'lucide-react';

export function CameraViewport({
  videoRef,
  canvasRef,
  isCameraActive,
  error,
  isDragging,
  isProcessing,
  onFileSelectClick,
  onDragOver,
  onDragLeave,
  onDrop
}) {
  return (
    <div className="relative aspect-video w-full bg-black/40 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex items-center justify-center min-h-[340px]">
      {/* Corner framing targets */}
      <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-[#CCFF00]/40 pointer-events-none z-10" />
      <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-[#CCFF00]/40 pointer-events-none z-10" />
      <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-[#CCFF00]/40 pointer-events-none z-10" />
      <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-[#CCFF00]/40 pointer-events-none z-10" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Slow laser scanner sweep overlay */}
      <div 
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent shadow-[0_0_12px_#CCFF00] opacity-30 pointer-events-none z-10" 
        style={{ animation: 'scan-line 4s linear infinite' }}
      />

      {!isCameraActive || error ? (
        /* Dropzone Upload View */
        <div 
          onClick={onFileSelectClick}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`cursor-pointer w-full h-full p-8 text-center flex flex-col items-center justify-center transition-all duration-300 rounded-[32px] border-2 border-dashed
            ${isDragging 
              ? 'border-[#CCFF00] bg-[#CCFF00]/5 scale-[1.01] shadow-[0_0_30px_rgba(204,255,0,0.1)]' 
              : 'border-white/10 bg-transparent hover:border-[#CCFF00]/40 hover:bg-white/5'
            }`}
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#CCFF00]/20 to-transparent border border-[#CCFF00]/30 flex items-center justify-center mb-5 text-[#CCFF00] transition-all duration-300 shadow-[0_0_20px_rgba(204,255,0,0.1)] group-hover:scale-105">
            <Upload className="w-7 h-7" />
          </div>
          
          <h3 className="text-xl font-extrabold text-white mb-2 tracking-tight">Upload Picture / ছবি আপলোড করুন</h3>
          <p className="text-white/60 text-sm max-w-xs mx-auto mb-3 leading-relaxed">Open gallery on phones or file explorer on PC. Support drag &amp; drop.</p>
          <p className="text-[#CCFF00]/90 font-semibold text-xs mb-3 px-3.5 py-1.5 rounded-full bg-[#CCFF00]/5 border border-[#CCFF00]/10">মোবাইলে গ্যালারি এবং পিসিতে ফাইল সিলেক্ট করতে এখানে ক্লিক করুন</p>

          {error && (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-2xl text-amber-400 text-xs mt-3 max-w-xs shadow-md backdrop-blur-md">
              <AlertCircle size={14} className="shrink-0 text-amber-500" />
              <span className="font-semibold">Camera unavailable. Upload mode active.</span>
            </div>
          )}
        </div>
      ) : (
        /* Live Camera View */
        <div className="absolute inset-0 w-full h-full">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Target Reticle framing guide */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-56 h-56 rounded-full border-2 border-dashed border-[#CCFF00]/60 flex items-center justify-center shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]">
              <span className="text-[#CCFF00] text-[10px] font-bold uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full border border-[#CCFF00]/30 backdrop-blur-md">
                Align leaf / পাতা এখানে মেলান
              </span>
            </div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />

      {/* Processing State Loader Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-[#CCFF00] animate-spin" />
            <div className="absolute inset-3 rounded-full bg-[#CCFF00]/10 border border-[#CCFF00]/30 flex items-center justify-center text-[#CCFF00]" style={{ animation: 'pulse-ring 1.5s infinite' }}>
              <Sprout className="w-7 h-7" />
            </div>
          </div>
          <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">Running AI Diagnostics...</h3>
          <p className="text-white/60 text-sm mb-1">Detecting crop &amp; analyzing leaf diseases</p>
          <p className="text-[#CCFF00] text-xs font-semibold">কৃত্রিম বুদ্ধিমত্তা ফসল ও রোগ শনাক্ত করছে...</p>
        </div>
      )}
    </div>
  );
}

export default CameraViewport;
