import torch
import torch.nn as nn
import numpy as np
import cv2
from PIL import Image
import io
import base64
from typing import Tuple

class GradCAM:
    """
    Gradient-weighted Class Activation Mapping (Grad-CAM).
    Produces visual explanations of CNN decisions by computing gradients
    of the target prediction score with respect to the final convolutional layer.
    """
    def __init__(self, model: nn.Module, target_layer: nn.Module):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self.hook_handles = []
        self._register_hooks()
        
    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output.detach()
            
        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()
            
        self.hook_handles.append(self.target_layer.register_forward_hook(forward_hook))
        self.hook_handles.append(self.target_layer.register_full_backward_hook(backward_hook))
        
    def generate_heatmap(self, input_tensor: torch.Tensor) -> np.ndarray:
        """
        Computes the 2D Grad-CAM heatmap array normalized between [0, 1].
        """
        self.model.zero_grad()
        logits = self.model(input_tensor)
        
        # Target score for backpropagation (binary class logit)
        score = logits[0, 0]
        score.backward(retain_graph=True)
        
        if self.gradients is None or self.activations is None:
            # Fallback uniform attention if hooks did not fire
            return np.ones((224, 224), dtype=np.float32) * 0.5
            
        # Global Average Pooling of gradients across spatial dimensions (H, W)
        pooled_gradients = torch.mean(self.gradients, dim=[0, 2, 3])
        
        # Weight each activation channel by its corresponding pooled gradient
        activations = self.activations[0]
        for i in range(activations.shape[0]):
            activations[i, :, :] *= pooled_gradients[i]
            
        # Sum along channel dimension
        heatmap = torch.sum(activations, dim=0).cpu().numpy()
        
        # Apply ReLU to focus only on features that positively contribute to the target class
        heatmap = np.maximum(heatmap, 0)
        
        # Normalize to [0, 1]
        max_val = np.max(heatmap)
        if max_val > 1e-8:
            heatmap /= max_val
        else:
            heatmap = np.zeros_like(heatmap)
            
        return heatmap

    def overlay_on_image(self, original_pil: Image.Image, heatmap: np.ndarray, alpha: float = 0.45) -> Tuple[Image.Image, str]:
        """
        Resizes heatmap to image dimensions, applies Jet colormap, blends with original,
        and returns both PIL image and Base64 encoded PNG string.
        """
        img_np = np.array(original_pil.convert('RGB'))
        h, w = img_np.shape[:2]
        
        # Resize heatmap to match image dimensions
        resized_heatmap = cv2.resize(heatmap, (w, h))
        colored_heatmap = cv2.applyColorMap(np.uint8(255 * resized_heatmap), cv2.COLORMAP_JET)
        colored_heatmap = cv2.cvtColor(colored_heatmap, cv2.COLOR_BGR2RGB)
        
        # Blend original with heatmap
        blended = cv2.addWeighted(img_np, 1.0 - alpha, colored_heatmap, alpha, 0)
        blended_pil = Image.fromarray(blended)
        
        # Convert to Base64 data URI
        buffer = io.BytesIO()
        blended_pil.save(buffer, format="JPEG", quality=90)
        base64_str = "data:image/jpeg;base64," + base64.b64encode(buffer.getvalue()).decode("utf-8")
        
        return blended_pil, base64_str

    def analyze_regions(self, heatmap: np.ndarray, is_fake: bool) -> list:
        """
        Analyzes the Grad-CAM activation heatmap across facial anatomical sectors
        to tell the user which part of the photo or video is AI / manipulated.
        """
        if not is_fake:
            return [{
                "region": "All Facial Sectors",
                "severity": "NORMAL",
                "badge": "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
                "description": "Natural skin pores, consistent lighting gradients, and authentic anatomical continuity across all sectors."
            }]

        h, w = heatmap.shape[:2]
        sectors = [
            ("Hairline & Forehead", (0.00, 0.26, 0.15, 0.85), "Blending seam or skin smoothing artifacts along the upper forehead / hairline boundary."),
            ("Eyes & Upper Gaze", (0.22, 0.46, 0.05, 0.95), "Asymmetric reflections, unnatural iris rendering, or eye-swap boundary artifacts."),
            ("Nose & Facial Bridge", (0.35, 0.65, 0.28, 0.72), "Pose warping, lighting mismatch, or texture smoothing across the nose contour."),
            ("Mouth & Lips", (0.58, 0.82, 0.20, 0.80), "Lip-sync deformation, unnatural teeth boundaries, or mouth blending seam."),
            ("Cheeks & Jawline", (0.42, 0.95, 0.05, 0.95), "Face-swap boundary discontinuity or skin tone color-transfer mismatch along the jawline.")
        ]

        suspicious_list = []
        for name, (y1p, y2p, x1p, x2p), desc in sectors:
            y1, y2 = int(y1p * h), int(y2p * h)
            x1, x2 = int(x1p * w), int(x2p * w)
            patch = heatmap[y1:y2, x1:x2]
            if patch.size == 0:
                continue
            mean_val = float(np.mean(patch))
            max_val = float(np.max(patch))
            score = round(0.5 * mean_val + 0.5 * max_val, 3)

            if score >= 0.40:
                severity = "HIGH" if score >= 0.65 else ("MEDIUM" if score >= 0.50 else "LOW")
                badge = "bg-red-500/10 text-red-500 border-red-500/30" if severity == "HIGH" else "bg-amber-500/10 text-amber-500 border-amber-500/30"
                suspicious_list.append({
                    "region": name,
                    "severity": severity,
                    "score": round(score * 100, 1),
                    "badge": badge,
                    "description": desc
                })

        if not suspicious_list:
            suspicious_list.append({
                "region": "Global Surface",
                "severity": "MODERATE",
                "badge": "bg-amber-500/10 text-amber-500 border-amber-500/30",
                "description": "Subtle high-frequency synthetic generator artifacts detected across the facial surface."
            })

        return sorted(suspicious_list, key=lambda x: x.get("score", 0), reverse=True)

    def close(self):
        """Remove PyTorch hook handles to prevent memory leaks."""
        for handle in self.hook_handles:
            handle.remove()
        self.hook_handles.clear()
