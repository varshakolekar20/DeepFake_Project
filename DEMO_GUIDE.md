# DeepGuard — Demonstration & Technical Interview Guide

This guide is designed for **college project evaluations, viva examinations, and technical engineering interviews**. It explains the architecture, design choices, forensic pipeline, and provides an exact demonstration walkthrough.

---

## 1. Quick Project Elevator Pitch (30 Seconds)

> *"DeepGuard is an explainable deepfake and synthetic media forensic system. Unlike generic binary detectors that output arbitrary percentages, DeepGuard couples a dual-stream Convolutional Neural Network (EfficientNet-B0 with 5.3 million parameters) with pre-inference quality diagnostics (blur, contrast, face sizing) and post-inference visual explainability via Grad-CAM activation mapping. It supports static images, videos with a 1-FPS frame analysis timeline, and a live camera capture studio with real-time stream cleanup and front/rear sensor switching."*

---

## 2. Key Architecture & Forensic Pipeline

```
[Media Input: Image / Video / Live Camera]
           │
           ▼
[Pre-Inference Quality Assessment]
  ├─ Laplacian Variance (Blur Check: threshold = 50.0)
  ├─ Intensity Standard Deviation (Contrast Check: threshold = 20.0)
  └─ Face Detection & Margins (Haar Cascade + NMS + 25% boundary expansion)
           │
           ▼
[Neural Inference: EfficientNet-B0 (PyTorch)]
  ├─ Mode 1: Facial Manipulation (Deepfakes, Face-swap, Face2Face)
  └─ Mode 2: AI-Generated Synthetic (Diffusion, GANs)
           │
           ▼
[Calibrated Dual-Threshold Decision Engine]
  ├─ Raw Score < 0.35  ──► "Likely Real"
  ├─ 0.35 ≤ Score ≤ 0.55 ──► "Inconclusive" (Uncertainty zone)
  └─ Raw Score > 0.55  ──► "Likely Fake / Manipulated"
           │
           ▼
[Explainability & Reporting]
  ├─ Grad-CAM (Target layer: features[8])
  ├─ 5-Anatomical Zone Breakdown (Forehead, Eyes, Nose, Mouth, Jawline)
  └─ Exportable PDF & Cryptographic JSON Audit Reports
```

---

## 3. Step-by-Step Live Demonstration Script

### Step 1: Launch Application
- Double-click `start_deepguard.bat` (or run `uvicorn` and `npm run dev`).
- The application automatically starts on `http://localhost:5173`.
- Notice the **Three.js 3D Wireframe Visualizer** on the hero page demonstrating neural scanning.

### Step 2: Live Camera Capture Demonstration
1. Click **"Go to Forensic Workspace"** or navigate to the **Analyze** tab.
2. Under the input bar, click **"📷 Use Live Camera"**.
3. Point out:
   - The browser securely requests camera permission (`navigator.mediaDevices.getUserMedia`).
   - The mirror preview aligns with user perspective.
   - The front/rear flip button allows switching sensors on mobile/supported hardware.
   - The stream cleanly stops upon unmount or closing to prevent Windows hardware lock.
4. Click **"Take Snapshot"**.
5. Emphasize:
   - *"The user can preview, retake, or submit the photo."*
   - *"Pointing a camera at a monitor or paper photo will be explained by the forensic advisory note: the model examines genuine pixel arrays, not input origin."*
6. Click **"Submit for Forensic Inspection"** and observe the live analysis outcome.

### Step 3: Pre-Inference Quality Checks
1. Show the **"Pre-Inference Quality & Forensic Eligibility"** card.
2. Explain the metrics:
   - **Resolution:** Checks if input meets the 224×224 px neural receptive field.
   - **Sharpness (Laplacian):** Computes $\nabla^2 I$ variance. Low variance signals motion blur.
   - **Contrast:** Ensures adequate dynamic range to identify blending seams.
   - **Face Count:** Shows single-face isolation or triggers multi-face selector.

### Step 4: Video Analysis Timeline
1. Switch to the **Real Video** or **Deepfake Video** sample.
2. Run inspection.
3. Observe the **Video Timeline**:
   - Sampled keyframe thumbnails at 1-second intervals.
   - Frame-level manipulation confidence scores.
   - Clickable timestamps that automatically seek the video player to that exact frame.
   - Flagged frames highlighted for closer inspection.

### Step 5: Explainability (Grad-CAM & 5-Zone Breakdown)
1. Toggle the **Grad-CAM Comparison Slider** to reveal high-activation gradients.
2. Explain to examiners:
   - Deepfake face-swaps typically activate around the **jawline blending seam**, **nose bridge**, and **orbital perimeter**.
   - The 5-zone anatomical breakdown quantifies risk per facial quadrant.

### Step 6: Exporting Audit Reports
1. Click **"Export PDF Report"** or **"Export JSON Audit"**.
2. Shows a client-ready, tamper-evident forensic report with timestamp, quality metrics, and model metadata.

---

## 4. Top 10 Technical Viva & Interview Questions

| Question | Model Answer |
|---|---|
| **Q1: Why did you choose EfficientNet-B0 instead of a standard ResNet or VGG?** | *EfficientNet uses compound scaling (balancing depth, width, and resolution simultaneously) via neural architecture search (NAS). B0 offers 5.3M parameters compared to ResNet-50's 25.6M, enabling sub-200ms CPU inference while preserving high representation power for micro-texture artifacts.* |
| **Q2: Why use a dual-threshold calibration ($\tau_{low}=0.35, \tau_{high}=0.55$) instead of a single 0.5 threshold?** | *Real-world forensics cannot assume binary certainty. A single 0.5 cut-off forces borderline noisy or compressed images into false real/fake declarations. The $[0.35, 0.55]$ inconclusive margin explicitly represents forensic uncertainty.* |
| **Q3: How does Grad-CAM work in your model?** | *Grad-CAM computes the gradient of the manipulation class score with respect to feature maps in the final convolutional layer (`features[8]`). Global average pooling of these gradients yields importance weights $\alpha_k^c$, which are linearly combined with feature activation maps and passed through a ReLU.* |
| **Q4: How do you prevent memory leaks and hardware locks with the camera?** | *In `LiveCameraCapture.jsx`, we maintain a reference to the active `MediaStream` and cleanly invoke `track.stop()` in `useEffect` cleanup return functions, during camera flip, snapshot retake, and component unmount.* |
| **Q5: Can someone fool the detector by pointing a camera at a laptop screen?** | *Screens introduce optical moiré fringes, pixel grid structures, and specular screen glare. The application explicitly includes a Forensic Advisory disclosing that pixels are analyzed directly regardless of whether media originated from an upload or live camera.* |
| **Q6: How does the video processing pipeline aggregate frames?** | *The video engine samples keyframes at a bounded 1 FPS rate. It aggregates frame scores using a weighted top-$k$ maximum pooling heuristic ($70\%$ max suspicious frame + $30\%$ mean of all frames), ensuring localized transient manipulations are not washed out by extensive authentic frames.* |
| **Q7: What image quality checks are implemented?** | *We run variance of Laplacian for blur detection ($\sigma^2 < 50$), pixel intensity standard deviation for low contrast ($\sigma < 20$), mean luminance for overexposure ($> 225$), and minimum face dimension ($40 \times 40$ px).* |
| **Q8: How does the model distinguish face-swap deepfakes from full AI diffusion images?** | *DeepGuard offers two dedicated specialized modes: `Facial Manipulation` (which detects facial boundaries and warping seams on cropped faces) and `AI-Generated Synthetic` (which evaluates full-frame frequency domain and latent diffusion noise distributions).* |
| **Q9: What happens if an image has multiple faces?** | *Haar Cascades detect all candidate faces, pad them by a $25\%$ forensic margin, and evaluate each face independently. The UI provides an interactive `FaceSelector` allowing operators to inspect individual face scores and heatmaps.* |
| **Q10: What are the main limitations of this detector?** | *Heavy social media re-compression (e.g. WhatsApp/Twitter) smooths out high-frequency spatial gradients, and extreme dark lighting limits facial boundary isolation. Both scenarios trigger our quality warning system.* |
