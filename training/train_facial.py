"""
DeepGuard: Reproducible Training Pipeline for Facial Manipulation Detection
Supports: EfficientNet-B0 (Primary) and ResNet-18 (Baseline)
Loss: BCEWithLogitsLoss | Metrics: Loss, Accuracy, F1, ROC-AUC
"""

import os
import argparse
import time
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset
from torchvision import transforms
from PIL import Image
from sklearn.metrics import roc_auc_score, f1_score, precision_score, recall_score, accuracy_score
import numpy as np

from models.architectures import DeepfakeEfficientNetB0, DeepfakeResNet18, get_training_transforms, get_inference_transforms

class FaceForensicsDataset(Dataset):
    """
    Standard FaceForensics++ / Deepfake dataset loader.
    Expects manifest CSV or directory format:
      root/
        train/
          real/
          fake/
        val/
          real/
          fake/
    """
    def __init__(self, file_paths: list, labels: list, transform=None):
        self.file_paths = file_paths
        self.labels = labels
        self.transform = transform

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        path = self.file_paths[idx]
        image = Image.open(path).convert('RGB')
        label = self.labels[idx]
        
        if self.transform:
            image = self.transform(image)
            
        return image, torch.tensor(label, dtype=torch.float32)

def train_one_epoch(model, dataloader, criterion, optimizer, device):
    model.train()
    running_loss = 0.0
    all_preds, all_labels = [], []
    
    for images, labels in dataloader:
        images = images.to(device)
        labels = labels.to(device).unsqueeze(1)
        
        optimizer.zero_grad()
        logits = model(images)
        loss = criterion(logits, labels)
        loss.backward()
        optimizer.step()
        
        running_loss += loss.item() * images.size(0)
        probs = torch.sigmoid(logits).detach().cpu().numpy()
        all_preds.extend(probs)
        all_labels.extend(labels.cpu().numpy())
        
    epoch_loss = running_loss / len(dataloader.dataset)
    all_preds = np.array(all_preds).flatten()
    all_labels = np.array(all_labels).flatten()
    
    acc = accuracy_score(all_labels, (all_preds >= 0.5).astype(int))
    return epoch_loss, acc

def validate(model, dataloader, criterion, device):
    model.eval()
    running_loss = 0.0
    all_preds, all_labels = [], []
    
    with torch.no_grad():
        for images, labels in dataloader:
            images = images.to(device)
            labels = labels.to(device).unsqueeze(1)
            
            logits = model(images)
            loss = criterion(logits, labels)
            running_loss += loss.item() * images.size(0)
            
            probs = torch.sigmoid(logits).cpu().numpy()
            all_preds.extend(probs)
            all_labels.extend(labels.cpu().numpy())
            
    val_loss = running_loss / len(dataloader.dataset)
    all_preds = np.array(all_preds).flatten()
    all_labels = np.array(all_labels).flatten()
    
    binary_preds = (all_preds >= 0.5).astype(int)
    acc = accuracy_score(all_labels, binary_preds)
    f1 = f1_score(all_labels, binary_preds, zero_division=0)
    prec = precision_score(all_labels, binary_preds, zero_division=0)
    rec = recall_score(all_labels, binary_preds, zero_division=0)
    
    try:
        auc = roc_auc_score(all_labels, all_preds)
    except Exception:
        auc = 0.5
        
    return {
        "val_loss": round(val_loss, 4),
        "accuracy": round(acc * 100, 2),
        "f1_score": round(f1 * 100, 2),
        "precision": round(prec * 100, 2),
        "recall": round(rec * 100, 2),
        "roc_auc": round(auc, 4)
    }

def main():
    parser = argparse.ArgumentParser(description="Train DeepGuard Deepfake Detection CNN")
    parser.add_argument("--model", type=str, default="efficientnet", choices=["efficientnet", "resnet"])
    parser.add_argument("--epochs", type=int, default=10)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-4)
    parser.add_argument("--output-weights", type=str, default="../backend/weights/facial_efficientnet_b0.pt")
    args = parser.parse_args()

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[DeepGuard Training] Initializing on device: {device}")
    
    if args.model == "efficientnet":
        model = DeepfakeEfficientNetB0(pretrained=True).to(device)
    else:
        model = DeepfakeResNet18(pretrained=True).to(device)
        
    print(f"[DeepGuard Training] Model Architecture: {args.model.upper()}")
    print("[DeepGuard Training] Ready for training on prepared face crops dataset.")
    print("[DeepGuard Training] If running on Google Colab GPU, refer to training/DeepGuard_Colab_Trainer.ipynb.")

if __name__ == "__main__":
    main()
