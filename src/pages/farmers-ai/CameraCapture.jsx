import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, AlertCircle, Loader2, Upload, Sprout, ChevronLeft, ChevronRight } from 'lucide-react';
import { runOfflineInference, detectSpecies } from '../../lib/onnxRunner';

const DISEASE_MAPS = {
  rice: ["bacterialblight", "blast", "brownspot", "tungro"],
  potato: ["early_blight", "healthy", "late_blight"],
  tomato: ["bacterial_spot", "early_blight", "healthy", "late_blight", "leaf_mold", "septoria_leaf_spot", "spider_mites_two-spotted_spider_mite", "target_spot", "tomato_mosaic_virus", "tomato_yellow_leaf_curl_virus"],
  maize: ["cercospora_leaf_spot_gray_leaf_spot", "common_rust", "healthy", "northern_leaf_blight"],
  mango: ["anthracnose", "bacterial_canker", "cutting_weevil", "die_back", "gall_midge", "healthy", "powdery_mildew", "sooty_mould"],
  jackfruit: ["Algal_Leaf_Spot_of_Jackfruit", "Black_Spot_of_Jackfruit", "Healthy_Leaf_of_Jackfruit"],
  guava: ["Canker", "Dot", "Healthy", "Mummification", "Rust"],
  citrus: ["Citrus_Canker_Diseases_Leaf_Orange", "Citrus_Nutrient_Deficiency_Yellow_Leaf_Orange", "Healthy_Leaf_Orange", "Multiple_Diseases_Leaf_Orange", "Young_Healthy_Leaf_Orange"]
};

const crops = [
  { id: 'rice', name: 'Rice / ধান', icon: '🌾' },
  { id: 'potato', name: 'Potato / আলু', icon: '🥔' },
  { id: 'tomato', name: 'Tomato / টমেটো', icon: '🍅' },
  { id: 'maize', name: 'Maize / ভুট্টা', icon: '🌽' },
  { id: 'mango', name: 'Mango / আম', icon: '🥭' },
  { id: 'jackfruit', name: 'Jackfruit / কাঁঠাল', icon: '🌳' },
  { id: 'guava', name: 'Guava / পেয়ারা', icon: '🍏' },
  { id: 'citrus', name: 'Citrus / লেবু', icon: '🍋' }
];

// Helper: wait for a specified number of milliseconds
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: attempt a single Gemini API call with retry for 429 errors
const callGeminiWithRetry = async (url, body, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      return response;
    }

    if (response.status === 429 && attempt < maxRetries - 1) {
      // Extract retry delay from error response
      let waitMs = (attempt + 1) * 5000; // default: 5s, 10s, 15s
      try {
        const errBody = await response.json();
        const retryInfo = errBody?.error?.details?.find(d => d["@type"]?.includes("RetryInfo"));
        if (retryInfo?.retryDelay) {
          const seconds = parseInt(retryInfo.retryDelay);
          if (!isNaN(seconds) && seconds > 0) {
            waitMs = (seconds + 2) * 1000; // add 2s buffer
          }
        }
      } catch (_) { /* ignore parse errors */ }

      console.log(`[Gemini] Rate limited (429). Waiting ${waitMs / 1000}s before retry ${attempt + 2}/${maxRetries}...`);
      await delay(waitMs);
      continue;
    }

    // Non-retryable error
    const errorText = await response.text();
    throw new Error(`Status ${response.status}: ${errorText}`);
  }
  throw new Error("Max retries exceeded for rate limiting.");
};

const diagnoseWithGeminiDirect = async (canvas, selectedSpecies) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.");
  }

  // Base64 encode — resize to max 1024px to reduce payload and quota usage
  const maxDim = 1024;
  let srcCanvas = canvas;
  if (canvas.width > maxDim || canvas.height > maxDim) {
    const scale = maxDim / Math.max(canvas.width, canvas.height);
    const resized = document.createElement('canvas');
    resized.width = Math.round(canvas.width * scale);
    resized.height = Math.round(canvas.height * scale);
    resized.getContext('2d').drawImage(canvas, 0, 0, resized.width, resized.height);
    srcCanvas = resized;
  }
  const base64Data = srcCanvas.toDataURL('image/jpeg', 0.8);
  const base64Clean = base64Data.split(',')[1];

  // Permitted classes info
  let cropsInfo = "";
  for (const [sp, classes] of Object.entries(DISEASE_MAPS)) {
    cropsInfo += `- Crop: '${sp}', Permitted Classes: ${classes.join(", ")}\n`;
  }

  const prompt = `
You are an expert plant pathologist AI. Analyze this leaf/crop image and diagnose the disease.

The user selected the crop: '${selectedSpecies}'.
However, if the leaf is clearly from a different crop, auto-detect the correct crop from our supported list.

Here are the supported crops and their permitted disease classes:
${cropsInfo}

You MUST choose one of the supported crops and one of its permitted disease classes.
Return your response in JSON format matching this schema:
{
  "species": "<the auto-detected or selected crop species, must be one of: rice, potato, tomato, maize, mango, jackfruit, guava, citrus>",
  "disease": "<the exact disease class string from the permitted list for that crop, case-sensitive match>",
  "confidence": <float confidence score between 0.0 and 1.0>,
  "explanation": "<brief diagnostic explanation>"
}
`;

  // Try models in order — gemini-2.0-flash-lite is cheapest quota, then 2.0-flash, then 2.5-flash
  const models = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"];
  let lastErr = null;

  const requestBody = {
    contents: [{
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Clean
          }
        }
      ]
    }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  };

  for (const modelName of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    try {
      const response = await callGeminiWithRetry(url, requestBody, 3);
      const result = await response.json();

      // Validate response structure
      if (!result.candidates || !result.candidates[0]?.content?.parts?.[0]?.text) {
        lastErr = `Model ${modelName} returned empty or blocked response.`;
        console.warn(`[Gemini] ${lastErr}`, result);
        continue;
      }

      const textContent = result.candidates[0].content.parts[0].text;
      let parsed;
      try {
        parsed = JSON.parse(textContent);
      } catch (parseErr) {
        // Sometimes the model returns JSON wrapped in markdown code fences
        const jsonMatch = textContent.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1].trim());
        } else {
          lastErr = `Model ${modelName} returned unparseable JSON: ${textContent.substring(0, 200)}`;
          console.warn(`[Gemini] ${lastErr}`);
          continue;
        }
      }

      // Normalize species
      let detSpecies = (parsed.species || selectedSpecies).toLowerCase();
      if (!DISEASE_MAPS[detSpecies]) {
        detSpecies = selectedSpecies;
      }

      const permitted = DISEASE_MAPS[detSpecies];
      const predictedDisease = parsed.disease || "";
      let matchedDisease = null;
      for (const item of permitted) {
        if (item.toLowerCase() === predictedDisease.toLowerCase()) {
          matchedDisease = item;
          break;
        }
      }
      if (!matchedDisease) {
        // Try partial match as fallback
        for (const item of permitted) {
          if (item.toLowerCase().includes(predictedDisease.toLowerCase()) ||
              predictedDisease.toLowerCase().includes(item.toLowerCase())) {
            matchedDisease = item;
            break;
          }
        }
      }
      if (!matchedDisease) {
        matchedDisease = permitted[0];
      }

      const confidenceVal = parseFloat(parsed.confidence || 0.8);

      return {
        species: detSpecies,
        disease: matchedDisease,
        confidence: Math.min(Math.max(confidenceVal, 0), 1), // clamp 0-1
        explanation: parsed.explanation || ""
      };
    } catch (e) {
      lastErr = `[${modelName}] ${e.message}`;
      console.warn(`[Gemini] Model ${modelName} failed:`, e.message);
    }
  }

  throw new Error(`All Gemini models failed. ${lastErr}`);
};

const CameraCapture = ({ isInline = false, onBack = null, onScanComplete = null }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const navigate = useNavigate();
  
  const [species, setSpecies] = useState('rice');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [offlineResult, setOfflineResult] = useState(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  // Crop mismatch: set when the AI detects a different crop than the user selected
  const [cropMismatch, setCropMismatch] = useState(null); // { selected: string, detected: string }

  // Geolocation state (defaults to Dhaka center)
  const [deviceCoords, setDeviceCoords] = useState({ lat: '23.8103', lng: '90.4125' });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latStr = position.coords.latitude.toFixed(4);
          const lngStr = position.coords.longitude.toFixed(4);
          setDeviceCoords({ lat: latStr, lng: lngStr });
          console.log(`Device location acquired: Lat ${latStr}, Lng ${lngStr}`);
        },
        (err) => {
          console.warn("Geolocation permission denied or failed. Operating with default location:", err.message);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    }
  }, []);

  useEffect(() => {
    // Phase 9: Real-time WebSocket connection (best-effort, non-blocking)
    let ws = null;
    try {
      const wsUrl = `ws://${window.location.hostname}:8000/ws/inference/`;
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.status === 'processing') {
          console.log("Cloud Inference processing... (via WebSocket)");
        } else if (data.status === 'done') {
          console.log("Cloud Inference done. (via WebSocket)");
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

  /**
   * Core processing pipeline — called for BOTH file upload and camera capture:
   *
   * Step 1 – AUTO-DETECT SPECIES: Run all 8 ONNX models in parallel. The model
   *   that produces the highest max-class softmax probability wins. This means if
   *   the user selects "Rice" but uploads a tomato leaf, the tomato model will
   *   score much higher and the system auto-corrects to "tomato".
   *
   * Step 2 – DISEASE INFERENCE: Run the winning species model to classify the
   *   exact disease.
   *
   * Step 3 – CLOUD FALLBACK: Try cloud API with the correct species; if it fails,
   *   use the offline result.
   */
  const processCanvas = useCallback(async (canvas, blob) => {
    setCropMismatch(null);

    // ── Step 1: Auto-detect species (best-effort, non-blocking) ──────────────
    let effectiveSpecies = species;
    try {
      const detection = await detectSpecies(canvas);
      if (detection && detection.detectedSpecies) {
        if (detection.detectedSpecies !== species) {
          setCropMismatch({ selected: species, detected: detection.detectedSpecies });
          effectiveSpecies = detection.detectedSpecies;
          console.log(`[CropDetector] Overriding '${species}' → '${detection.detectedSpecies}' (confidence: ${(detection.confidence * 100).toFixed(1)}%)`);
        } else {
          console.log(`[CropDetector] User selection '${species}' confirmed by detector.`);
        }
      }
    } catch (e) {
      console.warn('Species detection failed, using user selection:', e);
    }

    // ── Step 2: Offline disease inference using the CORRECT species ──────────
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
        console.log('[Offline] Disease result:', offlineRes);
      }
    } catch (e) {
      console.warn('Offline inference skipped:', e);
    }

    // ── Step 3: Cloud inference via Gemini API ───────────────────────────────
    let cloudResult = null;
    let cloudError = null;
    try {
      const geminiRes = await diagnoseWithGeminiDirect(canvas, effectiveSpecies);
      const imageBlobUrl = URL.createObjectURL(blob);
      const confidence = geminiRes.confidence;
      const severity = geminiRes.disease.toLowerCase().includes('healthy') 
        ? 'none' 
        : (confidence > 0.9 ? 'severe' : (confidence > 0.8 ? 'moderate' : 'mild'));

      cloudResult = {
        diagnosis_id: Math.random().toString(36).substring(2, 11),
        species: geminiRes.species,
        disease: geminiRes.disease,
        confidence: confidence,
        severity: severity,
        needs_agronomist_review: confidence < 0.55,
        heatmap_url: imageBlobUrl,
        weather_risk: {
          index: 0.3,
          summary_bn: "আবহাওয়া স্বাভাবিক। নিয়মিত রোগ পর্যবেক্ষণ করুন।"
        },
        isOffline: false
      };
    } catch (err) {
      cloudError = err;
      console.error('Cloud inference failed:', err.message);
    }

    // ── Step 4: Navigate to results (cloud > offline > error) ────────────────
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
        // Both cloud and offline failed
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
    // Support both FileList from <input> and single File from drag-drop
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
  }, [species, handleFileUpload]);

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
    
    // Client-Side Quality Check: Blur Detection via Laplacian Variance
    try {
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
      
      if (variance < 30) {
        setError("Image is too blurry! Please hold the camera steady and ensure the leaf is in focus.");
        setIsProcessing(false);
        return;
      }
    } catch (e) {
      console.warn("Blur check failed, skipping", e);
    }
    
    canvas.toBlob(async (blob) => {
      if (!blob) { setError('Failed to capture image.'); setIsProcessing(false); return; }
      await processCanvas(canvas, blob);
    }, 'image/jpeg', 0.8);
  }, [processCanvas]);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 180;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`pb-16 px-4 max-w-xl mx-auto flex flex-col ${isInline ? 'pt-4' : 'pt-24 min-h-screen'}`}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan-line {
          0% { top: 0%; }
          50% { top: 100%; }
          100% { top: 0%; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        @keyframes slide-in-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .crop-scroll-container::-webkit-scrollbar {
          display: none !important;
        }
        .crop-scroll-container {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        .mismatch-banner {
          animation: slide-in-down 0.3s ease-out;
        }
      `}} />

      {isInline && onBack && (
        <button onClick={onBack} className="self-start flex items-center text-white/50 hover:text-[#CCFF00] mb-6 transition-colors text-sm font-semibold group">
          <span className="group-hover:-translate-x-1 transition-transform mr-1.5">&larr;</span> Back to Landing
        </button>
      )}

      <div className="text-center mb-8 flex flex-col items-center">
        <div className="inline-flex items-center space-x-1.5 bg-[#CCFF00]/10 border border-[#CCFF00]/25 px-3 py-1 rounded-full mb-3 shadow-[0_0_15px_rgba(204,255,0,0.05)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse"></span>
          <span className="text-[#CCFF00] text-xs font-semibold uppercase tracking-wider">AI Scanner / এআই স্ক্যানার</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">Farmer's AI Scanner</h1>
        <p className="text-white/60 mt-2 text-sm font-medium max-w-sm">Select crop and scan leaf or upload a photo.</p>
      </div>

      {/* Crop Mismatch Auto-Correction Banner */}
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
              <span className="font-bold capitalize text-[#CCFF00]">{cropMismatch.detected}</span>.
              {' '}Analyzing as <span className="font-bold capitalize text-[#CCFF00]">{cropMismatch.detected}</span> for accurate results.
            </p>
          </div>
          <button
            onClick={() => setCropMismatch(null)}
            className="shrink-0 text-white/30 hover:text-white/70 transition-colors text-xl leading-none ml-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* Crop Selector Bar */}
      <div className="mb-8 bg-white/5 border border-white/10 p-4 rounded-3xl relative overflow-hidden">
        <div className="text-white/50 text-xs font-bold mb-3 uppercase tracking-wider flex items-center justify-between px-1">
          <span>Target Crop / ফসল নির্বাচন করুন</span>
          <span className="text-[#CCFF00] font-extrabold capitalize bg-[#CCFF00]/10 border border-[#CCFF00]/20 px-3 py-0.5 rounded-full text-[11px] tracking-wide">{species}</span>
        </div>
        
        {/* Swipeable List with Fade Gradient Overlays & Scroll Buttons */}
        <div className="relative flex items-center">
          {/* Left Arrow Button */}
          <button 
            onClick={() => scroll('left')}
            className="absolute left-0 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 hover:border-white/20 transition-all active:scale-95 shadow-lg"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Swipeable List Wrapper */}
          <div className="relative w-full overflow-hidden mx-8">
            {/* Left fade gradient */}
            <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-carbon to-transparent pointer-events-none z-10" />
            {/* Right fade gradient */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-carbon to-transparent pointer-events-none z-10" />
            
            <div 
              ref={scrollContainerRef}
              className="crop-scroll-container flex space-x-2.5 overflow-x-auto pb-1 relative w-full scroll-smooth select-none"
            >
              {crops.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSpecies(crop.id)}
                  className={`px-5 py-2.5 rounded-full border text-xs md:text-sm font-bold flex items-center space-x-2 shrink-0 transition-all duration-300 ${
                    species === crop.id
                      ? 'bg-[#CCFF00] text-black border-transparent shadow-[0_4px_15px_rgba(204,255,0,0.25)] scale-[1.02]'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <span className="text-base">{crop.icon}</span>
                  <span>{crop.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Arrow Button */}
          <button 
            onClick={() => scroll('right')}
            className="absolute right-0 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 hover:border-white/20 transition-all active:scale-95 shadow-lg"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Hidden File Input for Image Upload */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Main Viewport Container */}
      <div className="relative aspect-video w-full bg-black/40 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex items-center justify-center min-h-[340px]">
        
        {/* Corner framing targets */}
        <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-[#CCFF00]/40 rounded-tl-lg pointer-events-none z-10" />
        <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-[#CCFF00]/40 rounded-tr-lg pointer-events-none z-10" />
        <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-[#CCFF00]/40 rounded-bl-lg pointer-events-none z-10" />
        <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-[#CCFF00]/40 rounded-br-lg pointer-events-none z-10" />
        
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
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`cursor-pointer w-full h-full p-8 text-center flex flex-col items-center justify-center transition-all duration-300 rounded-[32px] border-2 border-dashed
              ${isDragging 
                ? 'border-[#CCFF00] bg-[#CCFF00]/5 scale-[1.01] shadow-[0_0_30px_rgba(204,255,0,0.1)]' 
                : 'border-white/10 bg-transparent hover:border-[#CCFF00]/40 hover:bg-white/5'
              }`}
          >
            {/* Glowing upload circle indicator */}
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
                <span className="text-[#CCFF00] text-[10px] font-bold uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full border border-[#CCFF00]/30 backdrop-blur-md">Align leaf / পাতা এখানে মেলান</span>
              </div>
            </div>
          </div>
        )}
        <canvas ref={canvasRef} className="hidden" />

        {/* Processing State Loader Overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6">
            <div className="relative w-20 h-20 mb-6">
              {/* Spinning active ring */}
              <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-[#CCFF00] animate-spin" />
              {/* Diagnostic core icon */}
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

      {/* Button Controls */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
        {isCameraActive && !error ? (
          <>
            <button
              onClick={captureAndAnalyze}
              disabled={isProcessing}
              className={`flex-grow py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-extrabold transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]
                ${isProcessing 
                  ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed' 
                  : 'bg-[#CCFF00] text-black hover:bg-[#bce500] hover:shadow-[0_0_25px_rgba(204,255,0,0.35)]'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Leaf...</span>
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5" />
                  <span>Check my crop / রোগ নির্ণয় করুন</span>
                </>
              )}
            </button>
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={isProcessing}
              className="px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#CCFF00]/30 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Upload className="w-5 h-5 text-[#CCFF00]" />
              <span>Upload / আপলোড</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={isProcessing}
              className={`flex-grow py-4 rounded-2xl flex items-center justify-center gap-2 text-base font-extrabold transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]
                ${isProcessing 
                  ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed' 
                  : 'bg-[#CCFF00] text-black hover:bg-[#bce500] hover:shadow-[0_0_25px_rgba(204,255,0,0.35)]'}`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Analyzing Leaf...</span>
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  <span>Upload Picture / ছবি আপলোড করুন</span>
                </>
              )}
            </button>
            <button
              onClick={startCamera}
              className="px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#CCFF00]/30 rounded-2xl text-white font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Camera className="w-5 h-5 text-[#CCFF00]" />
              <span>Retry Camera</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CameraCapture;
