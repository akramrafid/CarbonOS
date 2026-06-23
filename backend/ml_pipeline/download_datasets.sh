#!/bin/bash
# Kaggle Dataset Downloader for Farmer's AI (Tier A and Tier B)
# Note: Requires Kaggle CLI installed (`pip install kaggle`) and `~/.kaggle/kaggle.json` configured.

DATA_DIR="kaggle_datasets"
mkdir -p $DATA_DIR

echo "Downloading Tier A (Staple Crops)..."
# Rice
kaggle datasets download -d nirmalsankalana/rice-leaf-disease-image -p $DATA_DIR/rice --unzip
# Potato, Tomato, Maize (all in one dataset)
kaggle datasets download -d vipoooool/new-plant-diseases-dataset -p $DATA_DIR/multi_crop --unzip

echo "Downloading Tier B (Fruit Trees)..."
# Mango
kaggle datasets download -d aryashah2k/mango-leaf-disease-dataset -p $DATA_DIR/mango --unzip
# Jackfruit
kaggle datasets download -d shuvokumarbasak4004/jackfruit-leaf-diseases -p $DATA_DIR/jackfruit --unzip
# Guava
kaggle datasets download -d omkarmanohardalvi/guava-disease-dataset-4-types -p $DATA_DIR/guava --unzip
# Citrus (Orange/Lemon)
kaggle datasets download -d shuvokumarbasak4004/orange-leaf-disease-dataset -p $DATA_DIR/citrus --unzip

echo "Organizing datasets into standardized format..."
# Specific commands to move multi_crop into /potato, /tomato, /maize would go here depending on the exact unzipped structure.
echo "Download complete!"
