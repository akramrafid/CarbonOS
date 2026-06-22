import torch
import torch.nn as nn
import torch.optim as optim
from .dataset import get_dataloaders
from .model import MultiHeadFarmerAIModel

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

def train_species(model, species_name, root_dir, epochs=10, batch_size=32):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    
    train_loader, val_loader = get_dataloaders(root_dir, species_name, batch_size)
    
    criterion = FocalLoss(gamma=2.0)
    # Only optimize the specific head and the backbone
    optimizer = optim.Adam([
        {'params': model.features.parameters(), 'lr': 1e-4},
        {'params': model.heads[species_name].parameters(), 'lr': 1e-3}
    ])
    
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images, species_name=species_name)
            
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            
        print(f"Epoch {epoch+1}/{epochs} - Loss: {running_loss/len(train_loader):.4f}")
        
        # Validation loop here...
        
    return model

if __name__ == "__main__":
    # Example config
    SPECIES_COUNTS = {
        'rice': 5, 'potato': 3, 'tomato': 10, 'maize': 4,
        'mango': 8, 'jackfruit': 3, 'guava': 5, 'citrus': 3
    }
    
    model = MultiHeadFarmerAIModel(SPECIES_COUNTS)
    
    # In a real run, loop through species or train jointly
    # train_species(model, 'rice', '/data/kaggle_datasets/', epochs=20)
    
    torch.save(model.state_dict(), "multi_head_farmer_ai.pth")
    print("Training script stub executed successfully.")
