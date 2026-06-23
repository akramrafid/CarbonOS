import sys
import os
import io
import base64
import torch
import torch.nn.functional as F
import numpy as np
import cv2
from PIL import Image
import torchvision.transforms as transforms
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware

# Add backend directory to sys.path to import model
sys.path.append(os.path.join(os.path.dirname(__file__), '../backend'))
from ml_pipeline.model import MultiHeadFarmerAIModel

app = FastAPI(title="Farmer's AI Inference Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
SPECIES_COUNTS = {
    'rice': 4, 'potato': 3, 'tomato': 10, 'maize': 4,
    'mango': 8, 'jackfruit': 3, 'guava': 5, 'citrus': 5
}
device = torch.device('cpu')
model = MultiHeadFarmerAIModel(SPECIES_COUNTS)
model_path = os.path.join(os.path.dirname(__file__), '../backend/multi_head_farmer_ai.pth')
if os.path.exists(model_path):
    model.load_state_dict(torch.load(model_path, map_location=device, weights_only=True))
model.eval()

# Grad-CAM Hooks
cam_gradients = None
cam_activations = None

def save_gradient(grad):
    global cam_gradients
    cam_gradients = grad

def forward_hook(module, input, output):
    global cam_activations
    cam_activations = output
    output.register_hook(save_gradient)

# Register hook on the last conv layer of the backbone
# For EfficientNet-B3, it's typically features[-1]
target_layer = model.features[-1]
target_layer.register_forward_hook(forward_hook)

transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

DISEASE_MAPS = {
    'rice': ["bacterialblight", "blast", "brownspot", "tungro"],
    'potato': ["early_blight", "healthy", "late_blight"],
    'tomato': ["bacterial_spot", "early_blight", "healthy", "late_blight", "leaf_mold", "septoria_leaf_spot", "spider_mites_two-spotted_spider_mite", "target_spot", "tomato_mosaic_virus", "tomato_yellow_leaf_curl_virus"],
    'maize': ["cercospora_leaf_spot_gray_leaf_spot", "common_rust", "healthy", "northern_leaf_blight"],
    'mango': ["anthracnose", "bacterial_canker", "cutting_weevil", "die_back", "gall_midge", "healthy", "powdery_mildew", "sooty_mould"],
    'jackfruit': ["Algal_Leaf_Spot_of_Jackfruit", "Black_Spot_of_Jackfruit", "Healthy_Leaf_of_Jackfruit"],
    'guava': ["Canker", "Dot", "Healthy", "Mummification", "Rust"],
    'citrus': ["Citrus_Canker_Diseases_Leaf_Orange", "Citrus_Nutrient_Deficiency_Yellow_Leaf_Orange", "Healthy_Leaf_Orange", "Multiple_Diseases_Leaf_Orange", "Young_Healthy_Leaf_Orange"]
}

@app.post("/predict")
async def predict(
    image: UploadFile = File(...),
    species: str = Form(...)
):
    species = species.lower()
    if species not in SPECIES_COUNTS:
        return {"error": f"Species '{species}' not supported."}
        
    contents = await image.read()
    pil_img = Image.open(io.BytesIO(contents)).convert('RGB')
    input_tensor = transform(pil_img).unsqueeze(0).to(device)
    
    # Auto-detect the species among 8 products by running all heads!
    best_species = species
    max_conf = -1.0
    best_idx = 0
    
    with torch.no_grad():
        for sp in SPECIES_COUNTS.keys():
            outputs = model(input_tensor, species_name=sp)
            probs = F.softmax(outputs, dim=1)[0]
            conf, idx = torch.max(probs, 0)
            conf_val = conf.item()
            
            # Boost the user's selected species slightly (e.g. by 1.15) to prevent accidental mismatches
            # for crops that look similar, but allow clear overrides (e.g. Tomato leaf on Rice selector)
            weight = 1.15 if sp == species else 1.0
            weighted_conf = conf_val * weight
            if weighted_conf > max_conf:
                max_conf = weighted_conf
                best_species = sp
                best_idx = idx.item()

    # Now run forward pass with gradients enabled on the auto-detected species for Grad-CAM
    model.zero_grad()
    outputs = model(input_tensor, species_name=best_species)
    probabilities = F.softmax(outputs, dim=1)[0]
    confidence, predicted_idx = torch.max(probabilities, 0)
    
    # Backward pass for Grad-CAM on the auto-detected species
    outputs[0, predicted_idx].backward()
    
    # Compute CAM
    global cam_gradients, cam_activations
    if cam_gradients is not None and cam_activations is not None:
        pooled_gradients = torch.mean(cam_gradients, dim=[0, 2, 3])
        for i in range(cam_activations.shape[1]):
            cam_activations[:, i, :, :] *= pooled_gradients[i]
            
        heatmap = torch.mean(cam_activations, dim=1).squeeze().detach().numpy()
        heatmap = np.maximum(heatmap, 0) # ReLU
        heatmap /= (np.max(heatmap) + 1e-8) # Normalize
        
        heatmap = cv2.resize(heatmap, (pil_img.width, pil_img.height))
        heatmap = np.uint8(255 * heatmap)
        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
        
        original_img = np.array(pil_img)[:, :, ::-1] # RGB to BGR
        superimposed_img = heatmap * 0.4 + original_img * 0.6
        
        _, buffer = cv2.imencode('.jpg', superimposed_img)
        dummy_heatmap_b64 = base64.b64encode(buffer).decode('utf-8')
        heatmap_url = f"data:image/jpeg;base64,{dummy_heatmap_b64}"
    else:
        heatmap_url = None
        
    predicted_class = DISEASE_MAPS[best_species][predicted_idx.item()]
    conf_val = confidence.item()
    
    severity = "mild"
    if conf_val > 0.8: severity = "moderate"
    if conf_val > 0.9: severity = "severe"
    if "healthy" in predicted_class.lower(): severity = "none"

    return {
        "species": best_species,
        "disease": predicted_class,
        "confidence": conf_val,
        "severity": severity,
        "needs_agronomist_review": conf_val < 0.55,
        "heatmap_url": heatmap_url
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
