import torch
import torch.nn as nn
import torchvision.models as models

class MultiHeadFarmerAIModel(nn.Module):
    """
    Multi-head EfficientNet-B3 backbone.
    A single feature extractor is shared, but a separate linear classification head 
    is used for each of the 8 species (Rice, Potato, Tomato, Maize, Mango, Jackfruit, Guava, Citrus).
    """
    def __init__(self, species_class_counts):
        """
        species_class_counts: dict mapping species_name to number_of_classes
        e.g., {'rice': 5, 'potato': 3, ...}
        """
        super(MultiHeadFarmerAIModel, self).__init__()
        
        # Load pretrained EfficientNet-B3 (using new weights API)
        efficientnet = models.efficientnet_b3(weights=models.EfficientNet_B3_Weights.IMAGENET1K_V1)
        
        # Backbone (Feature Extractor)
        self.features = efficientnet.features
        self.avgpool = efficientnet.avgpool
        
        # Feature dimension for b3 is 1536
        in_features = 1536 
        
        # Create a dictionary of classification heads
        self.heads = nn.ModuleDict()
        for species, num_classes in species_class_counts.items():
            self.heads[species] = nn.Sequential(
                nn.Dropout(p=0.3, inplace=True),
                nn.Linear(in_features, num_classes)
            )

    def forward(self, x, species_name=None):
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        
        # If species is specified, route through that specific head
        if species_name:
            if species_name not in self.heads:
                raise ValueError(f"Species {species_name} not found in model heads.")
            return self.heads[species_name](x)
            
        # If no species specified, return dict of all predictions (used rarely)
        out = {}
        for species, head in self.heads.items():
            out[species] = head(x)
        return out
