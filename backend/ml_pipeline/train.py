import torch
import torch.nn as nn
import torch.optim as optim
import argparse
import os
import time
from .dataset import get_dataloaders
from .model import MultiHeadFarmerAIModel
from .export import export_to_onnx

class FocalLoss(nn.Module):
    """
    Focal Loss handles class imbalance (e.g., lots of healthy leaves, few tungro).
    """
    def __init__(self, alpha=1, gamma=2, reduction='mean'):
        super(FocalLoss, self).__init__()
        self.alpha = alpha
        self.gamma = gamma
        self.reduction = reduction

    def forward(self, inputs, targets):
        ce_loss = nn.CrossEntropyLoss(reduction='none')(inputs, targets)
        pt = torch.exp(-ce_loss)
        focal_loss = self.alpha * (1 - pt) ** self.gamma * ce_loss
        
        if self.reduction == 'mean':
            return focal_loss.mean()
        elif self.reduction == 'sum':
            return focal_loss.sum()
        return focal_loss

def train_species(model, species_name, root_dir, epochs=10, batch_size=32, max_samples=None):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"  Device: {device}")
    model = model.to(device)
    
    train_loader, val_loader = get_dataloaders(root_dir, species_name, batch_size, max_samples=max_samples)
    
    print(f"  Train batches: {len(train_loader)}, Val batches: {len(val_loader)}")
    print(f"  Train samples: {len(train_loader.dataset)}, Val samples: {len(val_loader.dataset)}")
    
    criterion = FocalLoss(gamma=2.0)
    # Only optimize the specific head and the backbone
    optimizer = optim.Adam([
        {'params': model.features.parameters(), 'lr': 1e-4},
        {'params': model.heads[species_name].parameters(), 'lr': 1e-3}
    ])
    
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        epoch_start = time.time()
        
        for batch_idx, (images, labels) in enumerate(train_loader):
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images, species_name=species_name)
            
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            
            # Progress every 10 batches
            if (batch_idx + 1) % 10 == 0:
                print(f"    Batch {batch_idx+1}/{len(train_loader)} - Loss: {loss.item():.4f}")
            
        epoch_time = time.time() - epoch_start
        print(f"  Epoch {epoch+1}/{epochs} - Train Loss: {running_loss/len(train_loader):.4f} - Time: {epoch_time:.1f}s")
        
        # Validation and Evaluation Metrics (only on last epoch to save time)
        if epoch == epochs - 1:
            model.eval()
            all_preds = []
            all_labels = []
            val_loss = 0.0
            
            with torch.no_grad():
                for images, labels in val_loader:
                    images, labels = images.to(device), labels.to(device)
                    outputs = model(images, species_name=species_name)
                    loss = criterion(outputs, labels)
                    val_loss += loss.item()
                    
                    _, preds = torch.max(outputs, 1)
                    all_preds.extend(preds.cpu().numpy())
                    all_labels.extend(labels.cpu().numpy())
                    
            from sklearn.metrics import classification_report, confusion_matrix
            print(f"  Validation Loss: {val_loss/len(val_loader):.4f}")
            print("  Confusion Matrix:")
            print(confusion_matrix(all_labels, all_preds))
            print("  Classification Report (Precision/Recall/F1):")
            print(classification_report(all_labels, all_preds, zero_division=0))
        
    return model

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Farmer's AI Model Training Pipeline")
    parser.add_argument('--epochs', type=int, default=3, help='Number of epochs per species (default: 3)')
    parser.add_argument('--batch-size', type=int, default=32, help='Batch size (default: 32)')
    parser.add_argument('--max-samples', type=int, default=200, help='Max samples per class for CPU training (default: 200, use 0 for all)')
    parser.add_argument('--dummy', action='store_true', help='Use the dummy generated dataset')
    args = parser.parse_args()

    SPECIES_COUNTS = {
        'rice': 4, 'potato': 3, 'tomato': 10, 'maize': 4,
        'mango': 8, 'jackfruit': 3, 'guava': 5, 'citrus': 5
    }
    
    model = MultiHeadFarmerAIModel(SPECIES_COUNTS)
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(base_dir, 'dummy_datasets' if args.dummy else 'kaggle_datasets')
    output_dir = os.path.join(base_dir, '../../public/models')
    
    os.makedirs(output_dir, exist_ok=True)
    
    max_samples = None if args.max_samples == 0 else args.max_samples
    batch_size = 2 if args.dummy else args.batch_size
    
    print(f"Starting pipeline on {len(SPECIES_COUNTS)} species.")
    print(f"  Mode: {'DUMMY' if args.dummy else 'REAL'}")
    print(f"  Epochs: {args.epochs}")
    print(f"  Batch size: {batch_size}")
    print(f"  Max samples/class: {max_samples or 'ALL'}")
    print(f"  CUDA available: {torch.cuda.is_available()}")

    total_start = time.time()
    
    for i, species in enumerate(SPECIES_COUNTS.keys()):
        print(f"\n{'='*50}")
        print(f"[{i+1}/8] Training species: {species.upper()}")
        print(f"{'='*50}")
        try:
            species_start = time.time()
            model = train_species(
                model, species, root_dir=dataset_dir, 
                epochs=args.epochs, batch_size=batch_size, 
                max_samples=max_samples
            )
            
            # Export the trained head directly to the frontend's public directory
            onnx_path = os.path.join(output_dir, f"{species}_head_int8.onnx")
            export_to_onnx(model, species, onnx_path)
            
            # Move model back to GPU after export (export moves to CPU)
            device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            model = model.to(device)
            
            species_time = time.time() - species_start
            print(f"  [DONE] {species.upper()} complete in {species_time:.1f}s")
            
        except Exception as e:
            print(f"  [FAIL] Failed to process {species}: {e}")
            import traceback
            traceback.print_exc()
    
    torch.save(model.state_dict(), "multi_head_farmer_ai.pth")
    total_time = time.time() - total_start
    print(f"\n{'='*50}")
    print(f"Pipeline execution complete! Total time: {total_time:.1f}s ({total_time/60:.1f} min)")
    print(f"Model weights saved to: multi_head_farmer_ai.pth")
    print(f"ONNX files saved to: {output_dir}")
