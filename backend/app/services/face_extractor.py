import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Any, Tuple
from backend.app.core.config import settings

class FaceExtractor:
    """
    Forensic Face Extractor and Media Quality Analyzer.
    Detects faces, applies forensic margin padding (to include jawline/hair blend artifacts),
    and computes objective media quality metrics (blur, contrast, resolution).
    """
    def __init__(self):
        self.face_cascade = None
        try:
            if hasattr(cv2, 'CascadeClassifier') and hasattr(cv2, 'data'):
                cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                self.face_cascade = cv2.CascadeClassifier(cascade_path)
        except Exception as e:
            print(f"[FaceExtractor] CascadeClassifier initialization warning: {e}")
        
    def assess_quality(self, image_bgr: np.ndarray) -> Dict[str, Any]:
        """Calculates blur variance, contrast, and resolution diagnostics."""
        h, w = image_bgr.shape[:2]
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        
        # Blur score: Variance of Laplacian. Lower value indicates blurred image.
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        is_blurry = laplacian_var < settings.MIN_LAPLACIAN_BLUR_VAR
        
        # Contrast: standard deviation of pixel intensities
        contrast_std = float(np.std(gray))
        is_low_contrast = contrast_std < 20.0
        
        return {
            "width": int(w),
            "height": int(h),
            "laplacian_var": round(float(laplacian_var), 2),
            "is_blurry": bool(is_blurry),
            "contrast_std": round(float(contrast_std), 2),
            "is_low_contrast": bool(is_low_contrast),
            "quality_pass": bool(not is_blurry and not is_low_contrast and (w >= 64 and h >= 64))
        }

    def extract_faces(self, image_bgr: np.ndarray, margin_ratio: float = 0.25) -> List[Dict[str, Any]]:
        """
        Detects faces in BGR image, pads bounding boxes by margin_ratio,
        and returns face crops as PIL Images (RGB) and metadata.
        """
        h_img, w_img = image_bgr.shape[:2]
        gray = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2GRAY)
        
        detected_boxes = []
        if self.face_cascade is not None:
            try:
                # Primary pass: standard sensitivity
                boxes = self.face_cascade.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=4,
                    minSize=(settings.MIN_FACE_RESOLUTION, settings.MIN_FACE_RESOLUTION)
                )
                # Adaptive secondary pass: higher sensitivity for angles, lighting, or smaller faces
                if len(boxes) == 0:
                    boxes = self.face_cascade.detectMultiScale(
                        gray,
                        scaleFactor=1.05,
                        minNeighbors=2,
                        minSize=(28, 28)
                    )
                if len(boxes) > 0:
                    # Apply Non-Maximum Suppression to eliminate overlapping duplicate detections
                    rects = [[int(bx), int(by), int(bw), int(bh)] for (bx, by, bw, bh) in boxes]
                    scores = [float(bw * bh) for (bx, by, bw, bh) in boxes]
                    indices = cv2.dnn.NMSBoxes(rects, scores, score_threshold=0.0, nms_threshold=0.3)
                    if len(indices) > 0:
                        indices = indices.flatten()
                        filtered = [boxes[i] for i in indices]
                        # Filter out tiny noise boxes if larger dominant faces are present
                        max_area = max(bw * bh for (_, _, bw, bh) in filtered)
                        if max_area >= 10000: # Largest face is at least 100x100
                            filtered = [b for b in filtered if (b[2] * b[3]) >= max(2500, max_area * 0.08)]
                        # Sort by area descending so primary subject face is always Face 1
                        filtered.sort(key=lambda b: b[2] * b[3], reverse=True)
                        detected_boxes = filtered
            except Exception as e:
                print(f"[FaceExtractor] detectMultiScale warning: {e}")
        
        faces_data = []
        for idx, (x, y, w, h) in enumerate(detected_boxes):
            # Compute margin padding around face to include boundary seams
            margin_x = int(w * margin_ratio)
            margin_y = int(h * margin_ratio)
            
            x1 = max(0, x - margin_x)
            y1 = max(0, y - margin_y)
            x2 = min(w_img, x + w + margin_x)
            y2 = min(h_img, y + h + margin_y)
            
            face_crop_bgr = image_bgr[y1:y2, x1:x2]
            if face_crop_bgr.size == 0:
                continue
                
            face_crop_rgb = cv2.cvtColor(face_crop_bgr, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(face_crop_rgb)
            
            faces_data.append({
                "face_id": int(idx + 1),
                "bbox": {
                    "x": int(x),
                    "y": int(y),
                    "width": int(w),
                    "height": int(h),
                    "normalized": [float(round(float(x) / float(w_img), 4)), float(round(float(y) / float(h_img), 4)), float(round(float(w) / float(w_img), 4)), float(round(float(h) / float(h_img), 4))]
                },
                "padded_bbox": [int(x1), int(y1), int(x2), int(y2)],
                "crop_pil": pil_image,
                "crop_size": [int(x2 - x1), int(y2 - y1)]
            })
            
        return faces_data

# Singleton instance
face_extractor = FaceExtractor()
