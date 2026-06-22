import * as ort from 'onnxruntime-web';

// Initialize ONNX runtime environment
// WebGL or WASM execution providers
ort.env.wasm.numThreads = 4;

const modelsCache = {};

/**
 * Loads a quantized ONNX model for a specific species
 */
export async function loadModel(species) {
    if (modelsCache[species]) {
        return modelsCache[species];
    }

    try {
        // In a real scenario, these .onnx files would be served from public/models/
        // e.g., `/models/${species}_head_int8.onnx`
        const modelPath = `/models/${species}_head_int8.onnx`;
        const session = await ort.InferenceSession.create(modelPath, {
            executionProviders: ['wasm', 'webgl']
        });
        
        modelsCache[species] = session;
        return session;
    } catch (e) {
        console.error(`Failed to load offline model for ${species}:`, e);
        throw e;
    }
}

/**
 * Preprocess image data to tensor (1, 3, 224, 224)
 * Expected input: HTMLImageElement or Canvas
 */
export function preprocessImage(canvas) {
    // Basic implementation: resize to 224x224, extract RGB, normalize
    const ctx = canvas.getContext('2d');
    
    // We would resize here, but assuming canvas is already correct size or we draw scaled
    const imgData = ctx.getImageData(0, 0, 224, 224).data;
    
    const Float32Data = new Float32Array(3 * 224 * 224);
    
    // CHW format (Channels, Height, Width)
    for (let i = 0; i < 224 * 224; i++) {
        Float32Data[i] = (imgData[i * 4] / 255.0 - 0.485) / 0.229;           // R
        Float32Data[i + 224 * 224] = (imgData[i * 4 + 1] / 255.0 - 0.456) / 0.224; // G
        Float32Data[i + 2 * 224 * 224] = (imgData[i * 4 + 2] / 255.0 - 0.406) / 0.225; // B
    }

    return new ort.Tensor('float32', Float32Data, [1, 3, 224, 224]);
}

/**
 * Run offline inference
 */
export async function runOfflineInference(species, canvas) {
    try {
        const session = await loadModel(species);
        const tensor = preprocessImage(canvas);
        
        const feeds = {};
        feeds[session.inputNames[0]] = tensor;
        
        const results = await session.run(feeds);
        const output = results[session.outputNames[0]].data;
        
        // Output is raw logits. Calculate softmax for probabilities.
        const exps = Array.from(output).map(Math.exp);
        const sumExps = exps.reduce((a, b) => a + b, 0);
        const probabilities = exps.map(exp => exp / sumExps);
        
        // Find max
        let maxIndex = 0;
        let maxProb = probabilities[0];
        for(let i=1; i<probabilities.length; i++) {
            if(probabilities[i] > maxProb) {
                maxProb = probabilities[i];
                maxIndex = i;
            }
        }
        
        // Return class index and confidence
        // Calling components will map index to string name based on species
        return {
            classIndex: maxIndex,
            confidence: maxProb,
            isOffline: true
        };
    } catch (err) {
        console.warn("Offline inference failed or model not available. Falling back to cloud.", err);
        return null;
    }
}
