import React, { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, AlertCircle, Loader2, WifiOff } from 'lucide-react';
import { runOfflineInference } from '../../lib/onnxRunner';

const CameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
        setError('');
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      setIsCameraActive(false);
    }
  };

  React.useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    setError('');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Simple mock blur check: in reality, this would calculate image variance
    // For MVP, we pass it.
    
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError("Failed to capture image.");
        setIsProcessing(false);
        return;
      }

      const species = 'rice'; // Hardcoded for MVP
      let offlineResult = null;
      
      // 1. Try Offline Inference First
      try {
          offlineResult = await runOfflineInference(species, canvas);
          if (offlineResult) {
              console.log("Offline Result:", offlineResult);
              // Map index to disease name (mock mapping for Rice)
              const diseaseMap = ["bacterial_blight", "blast", "brown_spot", "healthy", "tungro"];
              const predictedDisease = diseaseMap[offlineResult.classIndex] || "unknown";
              
              offlineResult = {
                  species: species,
                  disease: predictedDisease,
                  confidence: offlineResult.confidence,
                  severity: offlineResult.confidence > 0.8 ? 'moderate' : 'mild',
                  needs_agronomist_review: offlineResult.confidence < 0.6,
                  heatmap_url: null, // No Grad-CAM offline
                  isOffline: true
              };
          }
      } catch (e) {
          console.warn("Skipping offline inference", e);
      }

      // 2. Try Cloud Inference
      const formData = new FormData();
      formData.append('image', blob, 'crop_capture.jpg');
      formData.append('species', species);
      formData.append('field_id', 'field-001');
      formData.append('gps_lat', '23.8103');
      formData.append('gps_lng', '90.4125');

      try {
        const response = await fetch('http://localhost:8000/api/farmers-ai/diagnose/', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Diagnosis failed from server.');

        const data = await response.json();
        stopCamera();
        
        navigate('/farmers-ai/result', { state: { result: data, imageBlob: URL.createObjectURL(blob) } });
      } catch (err) {
        console.error("Cloud failed:", err);
        // 3. Fallback to offline result if network failed
        if (offlineResult) {
            stopCamera();
            navigate('/farmers-ai/result', { state: { result: offlineResult, imageBlob: URL.createObjectURL(blob) } });
        } else {
            setError("Network error while analyzing and offline model not available.");
            setIsProcessing(false);
        }
      }
    }, 'image/jpeg', 0.8);
  }, [navigate]);

  return (
    <div className="pt-24 pb-16 px-4 max-w-lg mx-auto min-h-screen flex flex-col">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-leaf">Farmer's AI</h1>
        <p className="text-gray-400 mt-2 text-sm">Position the leaf inside the frame.</p>
      </div>

      <div className="relative flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 flex items-center justify-center">
        {error ? (
          <div className="text-red-400 p-4 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-80" />
            <p>{error}</p>
            <button 
              onClick={startCamera}
              className="mt-4 px-4 py-2 bg-leaf text-carbon font-semibold rounded-lg"
            >
              Retry Camera
            </button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Framing Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full border-[40px] border-black/50 transition-all"></div>
              <div className="absolute inset-0 m-[40px] border-2 border-dashed border-emerald/70 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
            </div>
          </>
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="mt-8 mb-4">
        <button
          onClick={captureAndAnalyze}
          disabled={!isCameraActive || isProcessing}
          className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-bold transition-all shadow-lg
            ${isProcessing || !isCameraActive 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-emerald text-carbon hover:bg-leaf hover:scale-[1.02] active:scale-[0.98]'}`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Camera className="w-6 h-6" />
              Check my crop
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CameraCapture;
