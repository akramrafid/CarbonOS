import React, { useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, AlertCircle, Loader2, WifiOff } from 'lucide-react';
import { runOfflineInference } from '../../lib/onnxRunner';

const CameraCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [offlineResult, setOfflineResult] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Phase 9: Real-time WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws/inference/');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.status === 'processing') {
        console.log("Cloud Inference processing... (via WebSocket)");
      } else if (data.status === 'done') {
        console.log("Cloud Inference done. (via WebSocket)");
      }
    };
    return () => ws.close();
  }, []);

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
    
    // 3. Client-Side Quality Check: Blur Detection via Laplacian Variance
    try {
      // Downsample for speed
      const checkCanvas = document.createElement('canvas');
      const cw = 200;
      const ch = Math.floor(canvas.height * (cw / canvas.width));
      checkCanvas.width = cw;
      checkCanvas.height = ch;
      const checkCtx = checkCanvas.getContext('2d');
      checkCtx.drawImage(canvas, 0, 0, cw, ch);
      
      const imgData = checkCtx.getImageData(0, 0, cw, ch);
      const data = imgData.data;
      const grayscale = new Float32Array(cw * ch);
      
      for (let i = 0; i < data.length; i += 4) {
          grayscale[i / 4] = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      }
      
      let mean = 0;
      let count = 0;
      const laplacians = new Float32Array((cw - 2) * (ch - 2));
      
      for (let y = 1; y < ch - 1; y++) {
          for (let x = 1; x < cw - 1; x++) {
              const idx = y * cw + x;
              const laplacian = grayscale[(y - 1) * cw + x] + grayscale[(y + 1) * cw + x] + grayscale[y * cw + (x - 1)] + grayscale[y * cw + (x + 1)] - 4 * grayscale[idx];
              laplacians[count++] = laplacian;
              mean += laplacian;
          }
      }
      mean /= count;
      let variance = 0;
      for (let i = 0; i < count; i++) {
          variance += Math.pow(laplacians[i] - mean, 2);
      }
      variance /= count;
      
      if (variance < 30) { // Threshold for "too blurry"
          setError("Image is too blurry! Please hold the camera steady and ensure the leaf is in focus.");
          setIsProcessing(false);
          return;
      }
    } catch (e) {
      console.warn("Blur check failed, skipping", e);
    }
    
    
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
                  heatmap_url: null, // Simulated in CSS
                  weather_risk: {
                      summary_bn: "আগামী ২ দিন অতিরিক্ত আর্দ্রতার কারণে ব্লাস্ট বা ছত্রাকজনিত রোগের ঝুঁকি বেশি। নিয়মিত খেত পর্যবেক্ষণ করুন।"
                  },
                  isOffline: true
              };
              
              // Low-bandwidth tolerant: Attempt to fetch live weather risk asynchronously
              // It will update the object reference before the navigate happens if it's fast enough.
              fetch(`http://localhost:8000/api/farmers-ai/api/weather/risk/field-001/`)
                  .then(res => res.json())
                  .then(data => {
                      if (data && !data.error && offlineResult) {
                          offlineResult.weather_risk = {
                              summary_bn: data.summary_bn,
                              risk_index: data.risk_index,
                              disease_risk_type: data.disease_risk_type
                          };
                      }
                  })
                  .catch(e => console.warn("Live weather risk unavailable offline.", e));
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
