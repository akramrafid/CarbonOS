import os
import sys
import django
import torch
import shutil

# Setup Django environment to query the DB
sys.path.append(os.path.join(os.path.dirname(__file__), '../'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'farmers_ai_project.settings')
django.setup()

from farmers_ai.models import Diagnosis
from ml_pipeline.model import MultiHeadFarmerAIModel
from ml_pipeline.train import train_species
from ml_pipeline.export import export_to_onnx

def run_retraining_flywheel():
    print("Starting Human-in-the-loop Data Flywheel...")
    
    # Query for diagnoses that were flagged for review, but have since been verified
    # Assuming an Agronomist reviews the entry in Django Admin, corrects the 'disease' label,
    # and unchecks 'needs_agronomist_review'.
    verified_records = Diagnosis.objects.filter(
        confidence__lt=0.55, 
        needs_agronomist_review=False
    )
    
    if not verified_records.exists():
        print("No new verified records found. Exiting.")
        return

    print(f"Found {verified_records.count()} new agronomist-verified records.")
    
    # In a full production system, we would fetch the raw S3 image URLs from the records
    # and drop them into the dataset directory. For this MVP stub, we group by species:
    
    species_to_retrain = set()
    for record in verified_records:
        species_to_retrain.add(record.species.lower())
        # Example: download_from_s3(record.image_key, f"kaggle_datasets/{record.species}/{record.disease}/{record.id}.jpg")
        
    SPECIES_COUNTS = {
        'rice': 5, 'potato': 3, 'tomato': 10, 'maize': 4,
        'mango': 8, 'jackfruit': 3, 'guava': 5, 'citrus': 3
    }
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = MultiHeadFarmerAIModel(SPECIES_COUNTS)
    
    # Load existing weights
    weights_path = os.path.join(os.path.dirname(__file__), 'multi_head_farmer_ai.pth')
    if os.path.exists(weights_path):
        model.load_state_dict(torch.load(weights_path, map_location=device, weights_only=True))
        
    dataset_dir = os.path.join(os.path.dirname(__file__), 'kaggle_datasets')
    output_dir = os.path.join(os.path.dirname(__file__), '../../public/models')
    
    for species in species_to_retrain:
        if species not in SPECIES_COUNTS:
            continue
            
        print(f"\nRetraining species head: {species.upper()} with new verified data...")
        model = train_species(model, species, root_dir=dataset_dir, epochs=5, batch_size=32)
        
        onnx_path = os.path.join(output_dir, f"{species}_head_int8.onnx")
        export_to_onnx(model, species, onnx_path)
        print(f"Updated ONNX model exported for {species}.")
        
    # Save updated master weights
    torch.save(model.state_dict(), weights_path)
    print("\nFlywheel complete! Master weights updated.")

if __name__ == "__main__":
    run_retraining_flywheel()
