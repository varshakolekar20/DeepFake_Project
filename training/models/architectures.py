import torch
import torch.nn as nn
from torchvision import models, transforms
from typing import Tuple

def get_inference_transforms(image_size: int = 224):
    """
    Standard evaluation and inference transformations matching ImageNet pretrained statistics.
    Ensures exact consistency between training and live web inference.
    """
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

def get_training_transforms(image_size: int = 224):
    """
    Training augmentations: subtle geometric and photometric variations.
    Deliberately excludes destructive transforms that introduce artificial artifacts.
    """
    return transforms.Compose([
        transforms.Resize((image_size, image_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.ColorJitter(brightness=0.1, contrast=0.1, saturation=0.1),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485, 0.456, 0.406],
            std=[0.229, 0.224, 0.225]
        )
    ])

class DeepfakeEfficientNetB0(nn.Module):
    """
    Primary Deepfake & Synthetic Detector based on EfficientNet-B0.
    Outputs a single logit:
      logit > 0 (sigmoid > 0.5) corresponds to Class 1 (Manipulated / Synthetic).
      logit < 0 (sigmoid < 0.5) corresponds to Class 0 (Authentic / Real).
    """
    def __init__(self, pretrained: bool = True, dropout_rate: float = 0.3):
        super().__init__()
        weights = models.EfficientNet_B0_Weights.DEFAULT if pretrained else None
        base_model = models.efficientnet_b0(weights=weights)
        
        # Backbone feature extractor
        self.features = base_model.features
        self.avgpool = base_model.avgpool
        
        # Classifier head
        in_features = base_model.classifier[1].in_features
        self.classifier = nn.Sequential(
            nn.Dropout(p=dropout_rate, inplace=True),
            nn.Linear(in_features, 1)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.features(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        logits = self.classifier(x)
        return logits
        
    def get_target_layer_for_gradcam(self):
        """Returns the final convolutional block layer for spatial attention calculation."""
        return self.features[-1]

class DeepfakeResNet18(nn.Module):
    """
    Baseline comparison detector based on ResNet-18.
    """
    def __init__(self, pretrained: bool = True, dropout_rate: float = 0.3):
        super().__init__()
        weights = models.ResNet18_Weights.DEFAULT if pretrained else None
        base_model = models.resnet18(weights=weights)
        
        self.conv1 = base_model.conv1
        self.bn1 = base_model.bn1
        self.relu = base_model.relu
        self.maxpool = base_model.maxpool
        
        self.layer1 = base_model.layer1
        self.layer2 = base_model.layer2
        self.layer3 = base_model.layer3
        self.layer4 = base_model.layer4
        
        self.avgpool = base_model.avgpool
        in_features = base_model.fc.in_features
        self.fc = nn.Sequential(
            nn.Dropout(p=dropout_rate),
            nn.Linear(in_features, 1)
        )
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x = self.relu(self.bn1(self.conv1(x)))
        x = self.maxpool(x)
        x = self.layer1(x)
        x = self.layer2(x)
        x = self.layer3(x)
        x = self.layer4(x)
        x = self.avgpool(x)
        x = torch.flatten(x, 1)
        logits = self.fc(x)
        return logits

    def get_target_layer_for_gradcam(self):
        """Returns layer4 (last residual block) for Grad-CAM."""
        return self.layer4[-1]
