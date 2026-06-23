// Lazy-loaded ONNX runtime - only loads when actually needed for offline inference
let ort = null;
const modelsCache = {};

// All supported species - must match model files in /public/models/
const ALL_SPECIES = ['rice', 'potato', 'tomato', 'maize', 'mango', 'jackfruit', 'guava', 'citrus'];

async function getOrt() {
    if (!ort) {
        ort = await import('onnxruntime-web');
        ort.env.wasm.numThreads = 4;
        ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web/dist/';
    }
    return ort;
}

/**
 * Loads a quantized ONNX model for a specific species
 */
export async function loadModel(species) {
    if (modelsCache[species]) {
        return modelsCache[species];
    }

    try {
        const ortLib = await getOrt();
        const modelPath = `/models/${species}_head_int8.onnx`;
        const session = await ortLib.InferenceSession.create(modelPath, {
            executionProviders: ['wasm']
        });
        
        modelsCache[species] = session;
        return session;
    } catch (e) {
        console.warn(`Offline model for ${species} not available:`, e.message);
        return null;
    }
}

/**
 * Preprocess image data to tensor (1, 3, 224, 224)
 * Returns the tensor AND the resized canvas (so we can reuse it)
 */
export async function preprocessImage(canvas) {
    const ortLib = await getOrt();
    
    // Resize canvas to 224x224
    const resizeCanvas = document.createElement('canvas');
    resizeCanvas.width = 224;
    resizeCanvas.height = 224;
    const resizeCtx = resizeCanvas.getContext('2d');
    resizeCtx.drawImage(canvas, 0, 0, 224, 224);
    
    const imgData = resizeCtx.getImageData(0, 0, 224, 224).data;
    const Float32Data = new Float32Array(3 * 224 * 224);
    
    // CHW format with ImageNet normalization
    for (let i = 0; i < 224 * 224; i++) {
        Float32Data[i] = (imgData[i * 4] / 255.0 - 0.485) / 0.229;
        Float32Data[i + 224 * 224] = (imgData[i * 4 + 1] / 255.0 - 0.456) / 0.224;
        Float32Data[i + 2 * 224 * 224] = (imgData[i * 4 + 2] / 255.0 - 0.406) / 0.225;
    }

    return new ortLib.Tensor('float32', Float32Data, [1, 3, 224, 224]);
}

/**
 * Get the max-class softmax probability for a single species model.
 * Returns { species, maxProb, classIndex } or null if model unavailable.
 */
async function runSingleSpeciesProbe(species, tensor) {
    try {
        const session = await loadModel(species);
        if (!session) return null;

        const feeds = {};
        feeds[session.inputNames[0]] = tensor;

        const results = await session.run(feeds);
        const output = results[session.outputNames[0]].data;

        // Softmax
        const exps = Array.from(output).map(Math.exp);
        const sumExps = exps.reduce((a, b) => a + b, 0);
        const probabilities = exps.map(exp => exp / sumExps);

        let maxIndex = 0;
        let maxProb = probabilities[0];
        for (let i = 1; i < probabilities.length; i++) {
            if (probabilities[i] > maxProb) {
                maxProb = probabilities[i];
                maxIndex = i;
            }
        }

        return { species, maxProb, classIndex: maxIndex };
    } catch (err) {
        console.warn(`Probe failed for ${species}:`, err.message);
        return null;
    }
}

/**
 * AUTO-DETECT CROP SPECIES from image by running ALL 8 models in parallel.
 * The model that produces the highest max-class confidence wins.
 * This is valid because each model is trained on a *disjoint* crop domain:
 * a tomato image will activate the tomato model much more strongly than rice.
 *
 * Returns: { detectedSpecies, confidence, allScores }
 */
export async function detectSpecies(canvas) {
    const tensor = await preprocessImage(canvas);
    
    // Run all models in parallel for speed
    const probeResults = await Promise.all(
        ALL_SPECIES.map(sp => runSingleSpeciesProbe(sp, tensor))
    );

    const validResults = probeResults.filter(r => r !== null);
    if (validResults.length === 0) return null;

    // The species whose model gives the highest top-1 probability
    validResults.sort((a, b) => b.maxProb - a.maxProb);
    const best = validResults[0];

    console.log('[CropDetector] Species confidence scores:');
    validResults.forEach(r => {
        console.log(`  ${r.species}: ${(r.maxProb * 100).toFixed(1)}%`);
    });
    console.log(`[CropDetector] Detected: ${best.species} (${(best.maxProb * 100).toFixed(1)}%)`);

    return {
        detectedSpecies: best.species,
        confidence: best.maxProb,
        classIndex: best.classIndex,
        allScores: validResults
    };
}

/**
 * Run offline inference for a SPECIFIC species (after detection).
 * Returns null if model not available (falls back to cloud).
 */
export async function runOfflineInference(species, canvas) {
    try {
        const session = await loadModel(species);
        if (!session) return null;
        
        const tensor = await preprocessImage(canvas);
        
        const feeds = {};
        feeds[session.inputNames[0]] = tensor;
        
        const results = await session.run(feeds);
        const output = results[session.outputNames[0]].data;
        
        // Softmax
        const exps = Array.from(output).map(Math.exp);
        const sumExps = exps.reduce((a, b) => a + b, 0);
        const probabilities = exps.map(exp => exp / sumExps);
        
        let maxIndex = 0;
        let maxProb = probabilities[0];
        for (let i = 1; i < probabilities.length; i++) {
            if (probabilities[i] > maxProb) {
                maxProb = probabilities[i];
                maxIndex = i;
            }
        }
        
        return {
            classIndex: maxIndex,
            confidence: maxProb,
            isOffline: true
        };
    } catch (err) {
        console.warn("Offline inference unavailable, using cloud.", err.message);
        return null;
    }
}
