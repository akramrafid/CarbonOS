import os
from torch.utils.data import Dataset, DataLoader
from PIL import Image
import torchvision.transforms as transforms
import torchvision.transforms.functional as TF
import random

# Simulating Field Realism Augmentations
class FieldRealismAugmentation:
    def __init__(self):
        # Base geometric transforms
        self.geometric = transforms.Compose([
            transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomRotation(15),
        ])
        
        # Color and lighting simulating field variance (shadows, bright sun)
        self.color_jitter = transforms.ColorJitter(
            brightness=0.4, 
            contrast=0.4, 
            saturation=0.4, 
            hue=0.1
        )
        
    def __call__(self, img):
        img = self.geometric(img)
        img = self.color_jitter(img)
        
        # Simulate motion blur or defocus blur occasionally (30% chance)
        if random.random() < 0.3:
            img = TF.gaussian_blur(img, kernel_size=[5, 5], sigma=(0.1, 2.0))
            
        return img

class FarmerAIDataset(Dataset):
    """
    Dataset loader for Kaggle plant disease datasets.
    Assumes standard folder structure: species/class_name/images.jpg
    """
    def __init__(self, root_dir, species, split='train', is_field_test=False):
        self.root_dir = os.path.join(root_dir, species, split)
        self.classes = sorted(os.listdir(self.root_dir))
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        self.images = []
        for cls_name in self.classes:
            cls_dir = os.path.join(self.root_dir, cls_name)
            if os.path.isdir(cls_dir):
                for img_name in os.listdir(cls_dir):
                    if img_name.endswith(('.jpg', '.png', '.jpeg')):
                        self.images.append((os.path.join(cls_dir, img_name), self.class_to_idx[cls_name]))

        # Clean lab validation uses standard transforms. Field realistic uses heavy augmentations.
        if split == 'train' or is_field_test:
            self.transform = transforms.Compose([
                FieldRealismAugmentation(),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])
        else:
            self.transform = transforms.Compose([
                transforms.Resize(256),
                transforms.CenterCrop(224),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
            ])

    def __len__(self):
        return len(self.images)

    def __getitem__(self, idx):
        img_path, label = self.images[idx]
        image = Image.open(img_path).convert('RGB')
        
        if self.transform:
            image = self.transform(image)
            
        return image, label

def get_dataloaders(root_dir, species, batch_size=32):
    train_ds = FarmerAIDataset(root_dir, species, split='train')
    val_ds = FarmerAIDataset(root_dir, species, split='val')
    # Note: Requires a separate self-collected set for real field testing
    # field_test_ds = FarmerAIDataset(root_dir, species, split='field_test', is_field_test=True)

    train_loader = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=4)
    val_loader = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=4)
    
    return train_loader, val_loader
