"""
DeepGuard: Training Pipeline for General AI-Generated Image Detection
Supports: EfficientNet-B0 (Global spatial synthetic patterns)
Dataset: GenImage (Diffusion & GAN benchmark)
"""

import os
import argparse
import torch
import torch.nn as nn
from torchvision import transforms
from PIL import Image
from models.architectures import DeepfakeEfficientNetB0, get_training_transforms, get_inference_transforms

def main():
    parser = argparse.ArgumentParser(description="Train DeepGuard AI-Generated Image Detector")
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--output-weights", type=str, default="../backend/weights/aigen_efficientnet_b0.pt")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[DeepGuard AI-Gen Training] Initializing on device: {device}")
    model = DeepfakeEfficientNetB0(pretrained=True).to(device)
    print(f"[DeepGuard AI-Gen Training] Model ready for training on GenImage benchmark.")

if __name__ == "__main__":
    main()
