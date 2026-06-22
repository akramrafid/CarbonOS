from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import random
import base64
import time

app = FastAPI(title="Farmer's AI Inference Service")

# Allow requests from the Django backend (or frontend directly if needed)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RICE_DISEASES = ["bacterial_blight", "blast", "brown_spot", "tungro", "healthy"]

@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    species: str = Form(...)
):
    # Read the image (we won't actually process it for the MVP stub)
    contents = await image.read()
    
    # Simulate processing delay
    time.sleep(1)
    
    # For MVP: We only officially support rice in the stub.
    if species.lower() != "rice":
        return {"error": "Only 'rice' is supported in the current MVP."}
    
    # Generate random predictions
    predicted_class = random.choice(RICE_DISEASES)
    confidence = round(random.uniform(0.60, 0.98), 2)
    
    severity = "mild"
    if confidence > 0.8:
         severity = "moderate"
    if confidence > 0.9:
         severity = "severe"
    if predicted_class == "healthy":
         severity = "none"

    # Create a dummy 1x1 transparent red pixel as Grad-CAM heatmap base64
    dummy_heatmap_b64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    heatmap_url = f"data:image/png;base64,{dummy_heatmap_b64}"

    return {
        "species": species,
        "disease": predicted_class,
        "confidence": confidence,
        "severity": severity,
        "needs_agronomist_review": confidence < 0.70,
        "heatmap_url": heatmap_url
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
