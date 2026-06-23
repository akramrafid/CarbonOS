import os
import numpy as np
from PIL import Image

SPECIES_CLASSES = {
    'rice': ['bacterial_blight', 'blast', 'brown_spot', 'tungro', 'healthy'],
    'potato': ['early_blight', 'late_blight', 'healthy'],
    'tomato': ['bacterial_spot', 'early_blight', 'late_blight', 'leaf_mold', 'septoria_leaf_spot', 'spider_mite', 'target_spot', 'mosaic_virus', 'yellow_leaf_curl_virus', 'healthy'],
    'maize': ['common_rust', 'gray_leaf_spot', 'northern_leaf_blight', 'healthy'],
    'mango': ['anthracnose', 'bacterial_canker', 'cutting_weevil', 'die_back', 'gall_midge', 'powdery_mildew', 'sooty_mould', 'healthy'],
    'jackfruit': ['algal_leaf_spot', 'black_spot', 'healthy'],
    'guava': ['canker', 'dot', 'mummification', 'rust', 'healthy'],
    'citrus': ['citrus_canker', 'black_spot', 'healthy']
}

def generate_dummy_data(base_path='dummy_datasets', samples_per_class=5):
    """
    Generates dummy colored noise images for all species and classes
    to test the training pipeline without Kaggle downloads.
    """
    print(f"Generating dummy datasets in {base_path}...")
    
    for split in ['train', 'val']:
        for species, classes in SPECIES_CLASSES.items():
            for cls in classes:
                cls_dir = os.path.join(base_path, species, split, cls)
                os.makedirs(cls_dir, exist_ok=True)
                
                for i in range(samples_per_class):
                    # Generate random noise image (simulating a leaf photo)
                    # 224x224 RGB
                    img_array = np.random.randint(0, 256, (224, 224, 3), dtype=np.uint8)
                    img = Image.fromarray(img_array)
                    img.save(os.path.join(cls_dir, f'dummy_{split}_{i}.jpg'))
                    
    print(f"Successfully generated {samples_per_class} images per class for {len(SPECIES_CLASSES)} species.")

if __name__ == '__main__':
    # Using a small number of samples just to dry-run the loop
    generate_dummy_data(samples_per_class=2)
