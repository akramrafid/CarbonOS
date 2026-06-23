"""
Final dataset organization script.
Fixes the remaining nested folder structures for Jackfruit and Guava.
"""
import os
import shutil

base_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "kaggle_datasets")

def fix_nested_split(species):
    """
    Some Kaggle datasets unzip as:
        species/train/train/<class_folders>  (actual data here)
        species/train/test/<class_folders>   (this is the 'val' data)
        species/val/val/<class_folders>
        species/val/test/<class_folders>
    
    We need:
        species/train/<class_folders>
        species/val/<class_folders>
    """
    species_dir = os.path.join(base_path, species)
    
    for split in ['train', 'val']:
        split_dir = os.path.join(species_dir, split)
        if not os.path.exists(split_dir):
            continue
        
        children = os.listdir(split_dir)
        
        # Check if any child is itself a train/test/val folder (i.e. nested)
        nested_dirs = [c for c in children if c in ('train', 'test', 'val') and os.path.isdir(os.path.join(split_dir, c))]
        
        if not nested_dirs:
            # Check if there are actual class folders with images
            has_images = False
            for c in children:
                child_path = os.path.join(split_dir, c)
                if os.path.isdir(child_path):
                    # Check if this folder contains images
                    for f in os.listdir(child_path):
                        if f.lower().endswith(('.jpg', '.png', '.jpeg')):
                            has_images = True
                            break
                if has_images:
                    break
            if has_images:
                print(f"  {species}/{split} is already correct.")
                continue
        
        if nested_dirs:
            print(f"  Fixing {species}/{split} - found nested: {nested_dirs}")
            
            # Determine which nested folder has the actual data we want
            if split == 'train':
                # Use the 'train' subfolder for training data
                source = os.path.join(split_dir, 'train') if os.path.exists(os.path.join(split_dir, 'train')) else os.path.join(split_dir, nested_dirs[0])
            else:
                # Use the 'test' or 'val' subfolder for validation data
                if os.path.exists(os.path.join(split_dir, 'val')):
                    source = os.path.join(split_dir, 'val')
                elif os.path.exists(os.path.join(split_dir, 'test')):
                    source = os.path.join(split_dir, 'test')
                else:
                    source = os.path.join(split_dir, nested_dirs[0])
            
            # Move class folders from source up to split_dir
            for item in os.listdir(source):
                item_source = os.path.join(source, item)
                item_target = os.path.join(split_dir, item)
                if os.path.isdir(item_source) and not os.path.exists(item_target):
                    shutil.move(item_source, item_target)
                    print(f"    Moved {item}")
            
            # Clean up the empty nested dirs
            for nd in nested_dirs:
                nd_path = os.path.join(split_dir, nd)
                if os.path.exists(nd_path):
                    shutil.rmtree(nd_path)
                    print(f"    Removed empty {nd}")


if __name__ == '__main__':
    print("Fixing Jackfruit...")
    fix_nested_split('jackfruit')
    
    print("Fixing Guava...")
    fix_nested_split('guava')
    
    # Verify final structure
    print("\n--- Final Structure Verification ---")
    for species in ['rice', 'potato', 'tomato', 'maize', 'mango', 'jackfruit', 'guava', 'citrus']:
        for split in ['train', 'val']:
            split_dir = os.path.join(base_path, species, split)
            if os.path.exists(split_dir):
                classes = [d for d in os.listdir(split_dir) if os.path.isdir(os.path.join(split_dir, d))]
                print(f"  {species}/{split}: {len(classes)} classes -> {classes}")
            else:
                print(f"  {species}/{split}: MISSING!")
    
    print("\nDone!")
