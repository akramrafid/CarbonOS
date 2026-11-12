import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { PageHeader } from '../../components/ui/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/IconButton';
import { runOfflineInference, detectSpecies } from '../../lib/onnxRunner';
import { DISEASE_MAPS, checkImageBlur } from './camera/cameraData';
import { CropSelector } from './camera/CropSelector';
import { CameraViewport } from './camera/CameraViewport';
import { CameraControls } from './camera/CameraControls';

const CameraCapture = ({ isInline = false, onBack = null, onScanComplete = null }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const [species, setSpecies] = useState('rice');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cropMismatch, setCropMismatch] = useState(null);

  // Geolocation state (defaults to Dhaka center)
  const [deviceCoords, setDeviceCoords] = useState({ lat: '23.8103', lng: '90.4125' });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latStr = position.coords.latitude.toFixed(4);
          const lngStr = position.coords.longitude.toFixed(4);
          setDeviceCoords({ lat: latStr, lng: lngStr });
          if (import.meta.env?.DEV) console.debug(`Device location acquired: Lat ${latStr}, Lng ${lngStr}`);
        },
        (err) => {
          console.warn("Geolocation permission denied or failed. Operating with default location:", err.message);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    let ws = null;
    try {
      const wsUrl = `ws://${window.location.hostname}:8000/ws/inference/`;
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === 'processing') {
          if (import.meta.env?.DEV) console.debug("Cloud Inference processing... (via WebSocket)");
        } else if (data.status === 'done') {
          if (import.meta.env?.DEV) console.debug("Cloud Inference done. (via WebSocket)");
        }
      };
      ws.onerror = () => console.warn('WebSocket connection failed, continuing without real-time updates.');
    } catch (e) {
      console.warn('WebSocket not available:', e);
    }
    return () => { if (ws) ws.close(); };
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

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const processCanvas = useCallback(async (canvas, blob) => {
    setCropMismatch(null);

    // Step 1: Auto-detect species
    let effectiveSpecies = species;
    try {
      const detection = await detectSpecies(canvas);
      if (detection && detection.detectedSpecies) {
        if (detection.detectedSpecies !== species) {
          setCropMismatch({ selected: species, detected: detection.detectedSpecies });
          effectiveSpecies = detection.detectedSpecies;
          if (import.meta.env?.DEV) console.debug(`[CropDetector] Overriding '${species}' → '${detection.detectedSpecies}'`);
        }
      }
    } catch (e) {
      console.warn('Species detection failed, using user selection:', e);
    }

    // Step 2: Offline disease inference
    let offlineRes = null;
    try {
      const raw = await runOfflineInference(effectiveSpecies, canvas);
      if (raw) {
        const diseaseMap = DISEASE_MAPS[effectiveSpecies] || ['healthy'];
        const predictedDisease = diseaseMap[raw.classIndex] || 'unknown';
        offlineRes = {
          species: effectiveSpecies,
          disease: predictedDisease,
          confidence: raw.confidence,
          severity: raw.confidence > 0.8 ? 'moderate' : 'mild',
          needs_agronomist_review: raw.confidence < 0.6,
          heatmap_url: null,
          weather_risk: {
            summary_bn: 'আগামী ২ দিন অতিরিক্ত আর্দ্রতার কারণে ছত্রাকজনিত রোগের ঝুঁকি বেশি। নিয়মিত খেত পর্যবেক্ষণ করুন।'
          },
          isOffline: true
        };
      }
    } catch (e) {
      console.warn('Offline inference skipped:', e);
    }

    // Step 3: Cloud inference
    let cloudResult = null;
    let cloudError = null;
    try {
      const formData = new FormData();
      formData.append('image', blob, 'leaf_scan.jpg');
      formData.append('species', effectiveSpecies);
      formData.append('gps_lat', deviceCoords.lat);
      formData.append('gps_lng', deviceCoords.lng);

      const djangoApiUrl = import.meta.env.VITE_DJANGO_API_URL || 'http://localhost:8001';
      const response = await fetch(`${djangoApiUrl}/api/farmers-ai/diagnose/`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const resData = await response.json();
      cloudResult = {
        diagnosis_id: resData.diagnosis_id,
        species: resData.species,
        disease: resData.disease,
        confidence: resData.confidence,
        severity: resData.severity,
        needs_agronomist_review: resData.needs_agronomist_review,
        heatmap_url: resData.heatmap_url,
        weather_risk: resData.weather_risk,
        treatment_plan: resData.treatment_plan,
        isOffline: false
      };
    } catch (err) {
      cloudError = err;
      console.error('Cloud inference failed:', err.message);
    }

    // Step 4: Finalize
    try {
      const finalResult = cloudResult || offlineRes;
      if (finalResult) {
        stopCamera();
        const imageBlobUrl = finalResult.heatmap_url || URL.createObjectURL(blob);
        if (isInline && onScanComplete) {
          onScanComplete(finalResult, imageBlobUrl);
        } else {
          navigate('/farmers-ai/result', { state: { result: finalResult, imageBlob: imageBlobUrl } });
        }
      } else {
        const isRateLimit = cloudError?.message?.includes('429') || cloudError?.message?.includes('quota');
        if (isRateLimit) {
          setError('API quota exceeded. Please wait a few minutes and try again. / এপিআই কোটা শেষ। কিছুক্ষণ পর আবার চেষ্টা করুন।');
        } else {
          setError('Analysis failed. Please ensure the image is a clear photo of a crop leaf. / বিশ্লেষণ ব্যর্থ। পাতার পরিষ্কার ছবি দিন।');
        }
      }
    } finally {
      setIsProcessing(false);
    }
  }, [species, deviceCoords, isInline, onScanComplete, navigate]);

  const handleFileUpload = (e) => {
    let file = null;
    if (e.target.files instanceof FileList) {
      file = e.target.files[0];
    } else if (e.target.files instanceof File) {
      file = e.target.files;
    }
    if (!file || !(file instanceof File)) return;

    setIsProcessing(true);
    setError('');
    setCropMismatch(null);

    const reader = new FileReader();
    reader.onerror = () => {
      setError('Failed to read the image file. Please try another image.');
      setIsProcessing(false);
    };
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        setError('Invalid image file. Please upload a JPEG or PNG image.');
        setIsProcessing(false);
      };
      img.onload = async () => {
        try {
          const canvas = canvasRef.current;
          if (!canvas) { setIsProcessing(false); return; }
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(async (blob) => {
            if (!blob) { setError('Failed to process uploaded image.'); setIsProcessing(false); return; }
            await processCanvas(canvas, blob);
          }, 'image/jpeg', 0.8);
        } catch (err) {
          console.error('File upload processing error:', err);
          setError('An error occurred while processing the image. Please try again.');
          setIsProcessing(false);
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleFileUpload({ target: { files } });
    }
  }, [handleFileUpload]);

  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    setIsProcessing(true);
    setError('');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const isSharp = checkImageBlur(canvas);
    if (!isSharp) {
      setError("Image is too blurry! Please hold the camera steady and ensure the leaf is in focus.");
      setIsProcessing(false);
      return;
    }
    
    canvas.toBlob(async (blob) => {
      if (!blob) { setError('Failed to capture image.'); setIsProcessing(false); return; }
      await processCanvas(canvas, blob);
    }, 'image/jpeg', 0.8);
  }, [processCanvas]);

  return (
    <div className={`pb-16 px-4 max-w-xl mx-auto flex flex-col ${isInline ? 'pt-4' : 'pt-16 min-h-screen'}`}>
      {isInline && onBack && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="self-start text-white/50 hover:text-lime-400 mb-6 font-semibold"
        >
          &larr; Back to Landing
        </Button>
      )}

      {!isInline ? (
        <div className="mb-8">
          <PageHeader
            title="Farmer's AI Scanner"
            description="Select crop and scan leaf or upload a photo."
            badge={<Badge variant="emerald">AI Scanner / এআই স্ক্যানার</Badge>}
            align="center"
          />
        </div>
      ) : (
        <div className="mb-6 text-center">
          <Badge variant="emerald" className="mb-2">AI Scanner / এআই স্ক্যানার</Badge>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Farmer's AI Scanner</h2>
          <p className="text-sm text-white/60 mt-1">Select crop and scan leaf or upload a photo.</p>
        </div>
      )}

      {cropMismatch && (
        <div className="mismatch-banner mb-5 flex items-start gap-3 bg-amber-500/10 border border-amber-400/30 px-4 py-3.5 rounded-2xl backdrop-blur-sm shadow-lg">
          <AlertCircle size={18} className="shrink-0 text-amber-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-300 text-sm font-bold leading-tight">
              ⚠️ Crop Auto-Corrected by AI
            </p>
            <p className="text-amber-200/80 text-xs mt-1 leading-relaxed">
              You selected{' '}
              <span className="font-bold capitalize text-white">{cropMismatch.selected}</span>, but our AI detected this image as{' '}
              <span className="font-bold capitalize text-lime-400">{cropMismatch.detected}</span>.
              {' '}Analyzing as <span className="font-bold capitalize text-lime-400">{cropMismatch.detected}</span> for accurate results.
            </p>
          </div>
          <IconButton
            icon={<span className="text-xl leading-none">&times;</span>}
            aria-label="Dismiss crop mismatch notification"
            onClick={() => setCropMismatch(null)}
            className="shrink-0 text-white/30 hover:text-white/70 min-h-[32px] min-w-[32px] p-1 ml-1"
          />
        </div>
      )}

      <CropSelector species={species} onSelectSpecies={setSpecies} />

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      <CameraViewport
        videoRef={videoRef}
        canvasRef={canvasRef}
        isCameraActive={isCameraActive}
        error={error}
        isDragging={isDragging}
        isProcessing={isProcessing}
        onFileSelectClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />

      <CameraControls
        isCameraActive={isCameraActive}
        error={error}
        isProcessing={isProcessing}
        onCapture={captureAndAnalyze}
        onFileSelectClick={() => fileInputRef.current?.click()}
        onRetryCamera={startCamera}
      />
    </div>
  );
};

export default CameraCapture;
