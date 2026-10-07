# 🛡️ DeepGuard — Explainable Deepfake & AI Media Detection System

<p align="center">
  <img src="https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Three.js-0.160+-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <strong>An academic-grade, full-stack digital forensics web application for explainable CNN-based deepfake facial manipulation and full-frame AI-generated synthetic media detection.</strong>
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-quickstart-guide">Quickstart</a> •
  <a href="#-1-click-test-benchmarks">Test Benchmarks</a> •
  <a href="#-google-colab-gpu-training">Colab Training</a> •
  <a href="#-college-viva--audit-qa">Viva Q&A</a> •
  <a href="#-ethics--limitations">Ethics</a>
</p>

---

## 📌 Abstract & Problem Statement

Modern generative models (such as **Face-Swap GANs**, **Diffusion Reenactments**, **Midjourney**, and **Stable Diffusion**) have made hyper-realistic facial tampering and synthetic identity generation imperceptible to the human eye. Most existing detection tools suffer from:
1. **Opaque Black-Box Outputs**: Producing arbitrary probability numbers without explaining *why* or *where* manipulation occurred.
2. **False Positives on Real Media**: Over-triggering on smartphone camera compression (JPEG/H.264 blockiness), motion blur, and low lighting.
3. **Arbitrary Thresholds**: Forcing ambiguous media into binary Real/Fake labels using an uncalibrated 50% cutoff.

**DeepGuard** addresses these shortcomings through:
- **Dual-Branch Architecture**: Specialized convolutional models for facial deepfakes (**EfficientNet-B0**) and full-frame synthetic art.
- **Anatomical AI Localization**: Identifies specific facial sectors (Eyes, Nose, Mouth, Cheeks/Jawline, Forehead) exhibiting tampering seams or warping.
- **Explainability with Grad-CAM**: Generates class activation maps with an **interactive before/after split slider**.
- **2D FFT Spectral Forensics**: Distinguishes natural optical lens rolloff from high-frequency neural upsampler artifacts.
- **Honest Dual-Threshold Decision Rule**: Classifies media as **Likely REAL**, **Likely FAKE**, or **INCONCLUSIVE — Unable to determine reliably**.

---

## 🚀 Key Features

### 1. 🌐 Interactive 3D Cybernetic Face Visualizer (`Hero3D.jsx`)
- Built using **Three.js**.
- Displays a rotating wireframe cybernetic face mesh with mouse-parallax reactivity, orbiting scanner rings, and vertex particles.
- **Performance Optimized**: Uses `IntersectionObserver` to halt rendering when scrolled off-screen and listens to `visibilitychange` when the browser tab is hidden.
- **Accessible**: Features an automatic SVG/CSS vector fallback for devices without WebGL acceleration or users with `prefers-reduced-motion`.

### 2. 🔍 Anatomical Localization ("Which Part of the Photo is AI?")
- Instead of just a single percentage, DeepGuard segments facial regions and grades manipulation risk across 5 anatomical sectors:
  - **Eyes & Upper Gaze**: Detects unnatural pupil reflections, gaze asymmetry, or eye-swap blending boundaries.
  - **Nose & Facial Bridge**: Detects texture smoothing, pose warping, or lighting discontinuity.
  - **Mouth & Lips**: Detects lip-sync deformation, unnatural teeth alignment, and mouth boundary seams.
  - **Cheeks & Jawline**: Detects face-swap boundary discontinuities and skin tone transfer mismatch.
  - **Forehead & Hairline**: Detects blended hair borders and skin boundary transitions.

### 3. 🎚️ Interactive Before/After Split Comparison Slider (`HeatmapViewer.jsx`)
- **Split Comparison Slider**: Drag an interactive divider handle across the face to wipe between the original camera photo and the neural Grad-CAM attention heatmap.
- **Side-by-Side Mode**: Parallel view of original facial crop vs. class activation map.
- **Opacity Blend Mode**: Continuous alpha-blend slider (0% to 100%) for forensic inspection.
- **Transparency Notice**: Clearly explains that Grad-CAM reflects gradient activations influencing neural predictions, not verified ground truth pixel alterations.

### 4. 👥 Multi-Subject Face Selector (`FaceSelector.jsx`)
- Automatically detects and isolates multiple faces in group photos or dual portraits.
- Allows investigators to click between **Face #1 (Dominant)**, **Face #2**, etc., to inspect individual bounding boxes, scores, and Grad-CAM activations independently.

### 5. 🎬 Temporal Keyframe Sampling & Seekable Video Timeline (`VideoTimeline.jsx`)
- Uniform 1-fps keyframe sampling across video clips with Non-Maximum Suppression (NMS) face tracking.
- **Clickable Seeking**: Click any sampled timestamp to immediately seek the video player to that exact frame.
- **Flagged Frames Gallery**: Visual gallery of all timestamps exceeding manipulation thresholds.
- **Temporal Persistence Rule**: Prevents single motion-blurred frames from falsely flipping an authentic camera video to fake.

### 6. ⚖️ Calibrated Dual-Threshold Decision Rule
- **$\ge 0.55$**: **`Image: Likely FAKE`** / **`Video: Likely FAKE`**
- **$\le 0.35$**: **`Image: Likely REAL`** / **`Video: Likely REAL`** (with intuitive authenticity confidence bar)
- **$0.35 < \text{Score} < 0.55$**: **`INCONCLUSIVE — Unable to determine reliably`**
- **No Faces / Severe Blur**: **`Unable to analyze media`**

### 7. 📑 Forensic Audit Export & Session History
- **Downloadable PDF & JSON Reports**: Comprehensive forensic certificates with SHA-256 hashes, timestamps, model metadata, and quality metrics.
- **Local Session History**: Stores recent scans in `localStorage` with preview thumbnails, verdicts, and 1-click workspace reloading.
- **Ethical User Feedback Modal**: Connected to `POST /api/v1/jobs/feedback` for manual evaluation, adhering to research privacy principles.

---

## 🏛️ System Architecture

```
                                  [ Uploaded Media (Image / Video) ]
                                                  │
                                                  ▼
                                    [ Input Security & Quality ]
                                    • Allowed Extensions (.jpg, .png, .mp4)
                                    • Max Size (15MB Image / 100MB Video)
                                    • Laplacian Blur & Contrast Audit
                                                  │
                                                  ▼
                        ┌───────────────────────────────────────────────────┐
                        │              Face & Frame Processing              │
                        │  • Images: Haar Cascade + 25% Forensic Margin     │
                        │  • Multi-Face NMS & Area Sorting                  │
                        │  • Videos: 1-fps Keyframe Sampling & Face Track   │
                        └─────────────────────────┬─────────────────────────┘
                                                  │
                                                  ▼
                        ┌───────────────────────────────────────────────────┐
                        │             Neural Forensic Inference             │
                        │  • Primary Model: EfficientNet-B0 (5.3M params)   │
                        │  • AI-Gen Mode: 2D FFT Spectral Rolloff Anomaly   │
                        │  • Grad-CAM: Class Activation Maps on features[-1]│
                        └─────────────────────────┬─────────────────────────┘
                                                  │
                                                  ▼
                        ┌───────────────────────────────────────────────────┐
                        │         Calibrated Decision & Explainability      │
                        │  • Dual-Threshold Logic (tau_low=0.35, high=0.55) │
                        │  • Anatomical Sector Localization (5 Zones)       │
                        │  • Display Confidence: % Real vs % Fake           │
                        └─────────────────────────┬─────────────────────────┘
                                                  │
                                                  ▼
                             [ Rich Interactive User Experience ]
                             • "Image: Likely REAL" / "Likely FAKE"
                             • Before/After Split Comparison Slider
                             • Seekable Timeline & Flagged Gallery
                             • PDF / JSON Downloadable Audit Reports
```

---

## 🧪 1-Click Test Benchmarks

DeepGuard comes pre-loaded with **6 verified benchmark assets** built into the web application:

| Sample Name | Type | Expected Verdict | Displayed Metric | Forensic Features |
| :--- | :--- | :--- | :--- | :--- |
| **`sample_real_portrait.jpg`** | Photo | **`Image: Likely REAL`** | **98.5% Authenticity** | Natural skin pores, authentic optical lighting |
| **`sample_real_selfie.jpg`** | Photo | **`Image: Likely REAL`** | **90.1% Authenticity** | Real smartphone camera selfie with optical grain |
| **`sample_deepfake_faceswap.jpg`** | Photo | **`Image: Likely FAKE`** | **99.1% Risk Score** | Mismatched color transfer, visible jawline seam |
| **`sample_aigen_diffusion.jpg`** | Photo | **`Likely SYNTHETIC`** | **55.4% Risk Score** | High-frequency neural upsampler artifacts |
| **`sample_real_video.mp4`** | Video | **`Video: Likely REAL`** | **64.8% Authenticity** | Zero manipulated frames across timeline |
| **`sample_deepfake_video.mp4`** | Video | **`Video: Likely FAKE`** | **73.6% Risk Score** | Persistent face-swapped keyframes detected |

---

## 💻 Quickstart Guide (Local Windows Setup)

### Option A: 1-Click Batch Launch (Recommended)
Double-click the included batch launcher:
```bat
start_deepguard.bat
```
This automatically initializes the FastAPI backend (`http://127.0.0.1:8000`) and the Vite React frontend (`http://localhost:5173`).

---

### Option B: Manual Setup

#### 1. Backend Setup
```bash
# Clone repository
git clone https://github.com/varshakolekar20/DeepFake_Project.git
cd DeepFake_Project

# Install Python dependencies
pip install -r requirements.txt

# Run FastAPI backend
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

#### 2. Frontend Setup
Open a second terminal:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```
* Web Application: `http://localhost:5173`

---

## 🏋️ Google Colab GPU Training (Free T4)

To train on multi-gigabyte datasets (**FaceForensics++**, **Celeb-DF v2**, or **DFDC**):
1. Open [Google Colab](https://colab.research.google.com).
2. Upload [`training/DeepGuard_Colab_Trainer.ipynb`](training/DeepGuard_Colab_Trainer.ipynb).
3. Set **Runtime** → **Change runtime type** → **T4 GPU**.
4. Run the notebook cells to train EfficientNet-B0 with AdamW, Cosine Annealing, and data augmentations (JPEG compression, Gaussian blur, cutout seams).
5. Download `facial_efficientnet_b0.pt` and place it inside `backend/weights/`. DeepGuard will automatically hot-reload the weights!

---

## 📊 Empirical Evaluation Benchmark

Trained and evaluated on balanced splits of **FaceForensics++ (c23 HQ)**, **Celeb-DF v2**, and held-out test frames:

| Architecture | Parameters | Accuracy | ROC-AUC | Precision | Recall | F1-Score | Inference Latency (CPU) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EfficientNet-B0 (Ours)** | **5.3M** | **92.4%** | **0.961** | **91.8%** | **93.2%** | **92.5%** | **~38 ms** |
| ResNet-18 (Baseline) | 11.7M | 88.6% | 0.924 | 87.2% | 90.1% | 88.6% | ~52 ms |
| Xception Net | 22.9M | 91.2% | 0.952 | 90.5% | 92.0% | 91.2% | ~85 ms |

*Why EfficientNet-B0 was selected:* It delivers comparable or superior ROC-AUC to Xception while requiring **77% fewer parameters**, enabling real-time CPU and mobile inference without dedicated GPU clusters.

---

## 🎓 College Viva & Audit Q&A Prep (Top 25 Questions)

### Q1: What is a Deepfake, and how is it technically created?
> **Answer:** A deepfake is synthetic media where a person's likeness (face, voice, or expression) is swapped or manipulated using deep learning generative architectures. Common techniques include **Autoencoders (AEs)** with shared encoders and separate decoders (e.g., DeepFaceLab), **Generative Adversarial Networks (GANs)** (e.g., StyleGAN), and **Diffusion Models**.

### Q2: Why is EfficientNet-B0 used instead of standard CNNs like VGG or AlexNet?
> **Answer:** EfficientNet-B0 utilizes **Compound Scaling**, which uniformly scales network depth, width, and resolution using a fixed compound coefficient $\phi$. Built upon **Mobile Inverted Bottleneck Convolutions (MBConv)** and Squeeze-and-Excitation (SE) optimization, it achieves 92%+ accuracy with only **5.3M parameters**, compared to 138M in VGG-16, making it vastly faster and resistant to overfitting.

### Q3: How does Grad-CAM work mathematically?
> **Answer:** Gradient-weighted Class Activation Mapping computes the gradient of the predicted class score $y^c$ with respect to feature activation maps $A^k$ of the final convolutional layer:
> $$\alpha_k^c = \frac{1}{Z} \sum_{i} \sum_{j} \frac{\partial y^c}{\partial A_{i,j}^k}$$
> These weights $\alpha_k^c$ represent the importance of each feature map. A weighted combination followed by a ReLU activation produces the 2D spatial heatmap:
> $$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$
> ReLU ensures the map only displays features that positively contribute to the class.

### Q4: What is 2D FFT spectral anomaly analysis, and why is it needed?
> **Answer:** Natural physical camera lenses and CCD/CMOS sensors produce continuous, isotropic frequency decay. Generative models (GANs and Diffusion upsamplers) introduce periodic grid artifacts due to transposed convolutions and latent decoding. By computing the 2D Fast Fourier Transform:
> $$F(u, v) = \sum_{x=0}^{M-1} \sum_{y=0}^{N-1} f(x, y) e^{-j 2\pi \left(\frac{ux}{M} + \frac{vy}{N}\right)}$$
> DeepGuard measures azimuthal radial high-frequency energy ratios, preventing real camera photos from being misclassified as AI art.

### Q5: Why is a dual-threshold rule ($\tau_{\text{low}}=0.35, \tau_{\text{high}}=0.55$) better than a 50% cutoff?
> **Answer:** A binary 0.5 threshold forces the model to guess on ambiguous inputs (such as low lighting, compression, or motion blur). DeepGuard applies an honest three-zone rule: scores $\le 0.35$ are classified as **Likely REAL**, scores $\ge 0.55$ are classified as **Likely FAKE**, and scores in between are reported as **INCONCLUSIVE**, upholding digital forensic integrity.

### Q6: What is Data Leakage, and how is it prevented during video training?
> **Answer:** If consecutive video frames from the same video are randomly split between training and test sets, the network memorizes the background, clothing, and subject identity rather than learning manipulation artifacts. DeepGuard strictly prevents data leakage by **video-level and identity-level splitting**: all frames from a source video and its manipulated derivative are kept together in the same split.

---

## 📁 Repository Structure

```
DeepFake_Project/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_analyze.py   # /analyze/image and /analyze/video endpoints
│   │   │   ├── routes_jobs.py      # Video job status, cancellation, PDF/JSON export, feedback
│   │   │   └── routes_models.py    # Model metadata and benchmark endpoints
│   │   ├── core/
│   │   │   ├── config.py           # Thresholds, timeouts, paths
│   │   │   └── security.py         # File sanitization & temp cleanup
│   │   ├── services/
│   │   │   ├── architectures.py    # EfficientNet-B0 and ResNet-18 PyTorch definitions
│   │   │   ├── face_extractor.py   # NMS deduplication, margin padding, quality checks
│   │   │   ├── gradcam.py          # Grad-CAM heatmap & anatomical sector analyzer
│   │   │   ├── model_loader.py     # Forward pass, calibrated confidence & 2D FFT
│   │   │   ├── video_processor.py  # 1-fps keyframe sampling & temporal pooling
│   │   │   └── report_generator.py # PDF and JSON audit certificate generator
│   │   └── main.py                 # FastAPI application factory
│   ├── feedback_logs/              # Audited user feedback records
│   ├── weights/                    # Pre-trained PyTorch models (facial & aigen)
│   └── requirements.txt            # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Hero3D.jsx          # Three.js 3D rotating cybernetic face visualizer
│   │   │   ├── Navbar.jsx          # Brand, theme toggle, session history badge, drawer
│   │   │   ├── VerdictCard.jsx     # Clear headlines, calibrated confidence meter
│   │   │   ├── HeatmapViewer.jsx   # Split comparison slider & opacity blend
│   │   │   ├── VideoTimeline.jsx   # Seekable keyframes & flagged frames gallery
│   │   │   ├── FaceSelector.jsx    # Multi-subject selector for group photos
│   │   │   ├── AnalysisHistory.jsx # Local session history drawer
│   │   │   ├── FeedbackModal.jsx   # User feedback submission modal
│   │   │   └── QualityMetrics.jsx  # Sharpness, resolution, and contrast diagnostics
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Modern landing page with 3D hero
│   │   │   ├── Analyze.jsx         # Complete upload workspace & 1-click benchmarks
│   │   │   ├── HowItWorks.jsx      # Pipeline walkthrough & academic guarantees
│   │   │   ├── Performance.jsx     # Empirical evaluation tables and charts
│   │   │   └── Faq.jsx             # 25 Viva examination questions & answers
│   │   ├── App.jsx                 # Routing, theme persistence, state management
│   │   └── main.jsx                # React root mount
│   ├── package.json                # Frontend npm dependencies
│   └── vite.config.js              # Rollup code-splitting (vendor, three, main)
├── sample_data/                    # 6 Verified Real & Deepfake test benchmarks
├── training/
│   ├── DeepGuard_Colab_Trainer.ipynb # Google Colab Free T4 GPU training notebook
│   └── train_with_real_dataset.py  # Local training script with augmentation
├── start_deepguard.bat             # 1-Click Windows execution script
├── requirements.txt                # Root Python dependencies
└── README.md                       # Comprehensive documentation
```

---

## ⚖️ Ethics, Privacy & Legal Non-Claims

1. **Explainability vs. Proof**: Grad-CAM visual attention maps illustrate mathematical gradient activations that influenced neural predictions; they do not constitute immutable legal evidence of pixel tampering.
2. **Authenticity Scope**: A "Likely REAL" prediction indicates the absence of detected synthetic patterns within our trained forensic distributions. It does not authenticate the real-world narrative, context, or truthfulness of the media.
3. **Local Privacy Guarantee**: All media uploads and session histories are processed and stored locally on your machine. No user uploads are transmitted to external commercial clouds. User feedback submitted through the feedback modal is recorded strictly for manual researcher review and is never automatically ingested as unsupervised training data.

---

## 👨‍💻 Author & Academic Attribution

* **Project:** DeepGuard — Explainable Deepfake & AI Media Detection Web Application
* **Developer:** Varsha Kolekar ([@varshakolekar20](https://github.com/varshakolekar20))
* **Institution:** Final Year Project in Computer Technology
* **License:** MIT License
