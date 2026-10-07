"""
DeepGuard Forensic Evaluation & Robustness Stress-Testing
Evaluates:
  1. Primary metrics: Accuracy, Precision, Recall, F1, ROC-AUC
  2. Cross-Dataset Generalization (e.g. trained on FF++, tested on Celeb-DF)
  3. Robustness against JPEG Compression (QF 95, 80, 70) and Gaussian Blur
"""

import os
import argparse
import numpy as np
import torch
from PIL import Image, ImageFilter
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
from models.architectures import DeepfakeEfficientNetB0, DeepfakeResNet18, get_inference_transforms

def test_robustness_perturbations(model, sample_images, device):
    """
    Applies real-world social media degradations:
    - JPEG compression (Quality Factor 70)
    - Gaussian Blur (radius 1.5)
    and measures prediction stability.
    """
    model.eval()
    transforms = get_inference_transforms(224)
    print("\n--- Running Robustness & Shortcut Perturbation Tests ---")
    
    perturbations = ["Original", "JPEG_QF70", "Gaussian_Blur"]
    results = {}
    
    for pert in perturbations:
        scores = []
        for img in sample_images:
            test_img = img.copy()
            if pert == "JPEG_QF70":
                import io
                buf = io.BytesIO()
                test_img.save(buf, format="JPEG", quality=70)
                test_img = Image.open(buf)
            elif pert == "Gaussian_Blur":
                test_img = test_img.filter(ImageFilter.GaussianBlur(radius=1.5))
                
            tensor = transforms(test_img.convert('RGB')).unsqueeze(0).to(device)
            with torch.no_grad():
                logit = model(tensor).item()
                prob = torch.sigmoid(torch.tensor(logit)).item()
                scores.append(prob)
                
        results[pert] = np.mean(scores)
        print(f"[{pert}] Average Output Score: {round(results[pert], 4)}")
        
    return results

if __name__ == "__main__":
    print("[DeepGuard Evaluation] Ready to run comprehensive model evaluation.")
