# 🏛️ DeepGuard — End-to-End System Architecture & Workflow

This document provides a comprehensive technical breakdown of the **DeepGuard End-to-End System Architecture**, data flow pipelines, component interactions, and mathematical models for final year project reports, synopses, and technical presentations.

---

## 1. High-Level System Architecture Diagram

```mermaid
flowchart TD
    %% Styling Classes
    classDef clientStyle fill:#0f172a,stroke:#0d9488,stroke-width:2px,color:#f8fafc;
    classDef apiStyle fill:#1e293b,stroke:#38bdf8,stroke-width:2px,color:#f8fafc;
    classDef cvStyle fill:#1e1e38,stroke:#818cf8,stroke-width:2px,color:#f8fafc;
    classDef mlStyle fill:#064e3b,stroke:#10b981,stroke-width:2px,color:#f8fafc;
    classDef explainStyle fill:#4c1d95,stroke:#a855f7,stroke-width:2px,color:#f8fafc;
    classDef outStyle fill:#042f2e,stroke:#14b8a6,stroke-width:2px,color:#f8fafc;

    subgraph CLIENT["1. Client Presentation Tier (React 18 + Vite + Three.js)"]
        UI_HERO["Hero 3D Cybernetic Face Mesh<br/>(Three.js + Raycasting)"]
        UI_MODE["Mode Selector<br/>(Facial Manipulation / AI-Generated)"]
        UI_INPUT["Input Methods<br/>(1. File Upload / 2. WebRTC Live Camera / 3. Video)"]
        UI_FEEDBACK["Feedback & Interactive Viewers<br/>(Grad-CAM Split Wipe Slider / Video Timeline)"]
    end
    class CLIENT,UI_HERO,UI_MODE,UI_INPUT,UI_FEEDBACK clientStyle;

    subgraph GATEWAY["2. API Gateway & Orchestration (FastAPI + ASGI Uvicorn)"]
        API_ROUTER{"FastAPI Router<br/>(routes_analyze.py)"}
        SEC_VAL["Input Security & Validation<br/>(MIME Whitelist, 15MB/100MB Caps, Sanitization)"]
        BG_JOBS["Asynchronous Job Worker<br/>(BackgroundTasks + Memory State Queue)"]
    end
    class GATEWAY,API_ROUTER,SEC_VAL,BG_JOBS apiStyle;

    subgraph PREPROC["3. Computer Vision & Pre-Inference Quality Tier (OpenCV)"]
        QC_BLUR["Sharpness Audit<br/>(Laplacian Variance: Var(∇²I) < 50.0)"]
        QC_LIGHT["Lighting & Contrast Audit<br/>(Pixel Std Dev < 20.0, Mean Luminance)"]
        FACE_HAAR["Face Localization<br/>(Haar Feature Cascade Classifier)"]
        FACE_NMS["Redundancy Pruning<br/>(Non-Maximum Suppression IoU > 0.3)"]
        FACE_PAD["Forensic Boundary Expansion<br/>(25% Jawline/Hairline Margin Padding)"]
    end
    class PREPROC,QC_BLUR,QC_LIGHT,FACE_HAAR,FACE_NMS,FACE_PAD cvStyle;

    subgraph INFERENCE["4. Deep Learning Inference Tier (PyTorch)"]
        TENSOR_NORM["Tensor Normalization<br/>(Resize 224x224 RGB, ImageNet Mean/Std)"]
        CNN_FACIAL["Facial Model: EfficientNet-B0<br/>(5.3M Parameters, Swish Activations)"]
        CNN_AIGEN["AI-Gen Model: EfficientNet-B0<br/>(Full-Frame Spectral Anomaly Detection)"]
        THRESH_ENGINE{"Calibrated Dual-Threshold Engine<br/>(τ_low = 0.35, τ_high = 0.55)"}
    end
    class INFERENCE,TENSOR_NORM,CNN_FACIAL,CNN_AIGEN,THRESH_ENGINE mlStyle;

    subgraph EXPLAIN["5. Visual Explainability & Temporal Aggregation"]
        GRAD_CAM["Grad-CAM Attention Mapping<br/>(Target Layer: features[8])"]
        ZONES_5["5-Anatomical Zone Risk Breakdown<br/>(Forehead, Eyes, Nose, Mouth, Jawline)"]
        VIDEO_POOL["Temporal Top-k Frame Pooling<br/>(70% Max Suspicious Frame + 30% Mean)"]
    end
    class EXPLAIN,GRAD_CAM,ZONES_5,VIDEO_POOL explainStyle;

    subgraph OUTPUT["6. Forensic Delivery & Reporting Tier"]
        VERDICT_RES["Verdict Display<br/>(Likely REAL / Likely FAKE / INCONCLUSIVE)"]
        REP_GEN["ReportLab Forensic Certificate<br/>(Cryptographic SHA-256 PDF / JSON Audit)"]
    end
    class OUTPUT,VERDICT_RES,REP_GEN outStyle;

    %% Data Flow Connections
    UI_INPUT -->|Multipart HTTP POST| SEC_VAL
    SEC_VAL --> API_ROUTER
    API_ROUTER -->|Single Image Route| QC_BLUR
    API_ROUTER -->|Video Route| BG_JOBS
    BG_JOBS -->|1-FPS Uniform Frame Sampling| QC_BLUR

    QC_BLUR --> QC_LIGHT
    QC_LIGHT --> FACE_HAAR
    FACE_HAAR --> FACE_NMS
    FACE_NMS --> FACE_PAD
    FACE_PAD --> TENSOR_NORM

    TENSOR_NORM -->|Mode: Facial| CNN_FACIAL
    TENSOR_NORM -->|Mode: AI-Gen| CNN_AIGEN

    CNN_FACIAL --> THRESH_ENGINE
    CNN_AIGEN --> THRESH_ENGINE

    CNN_FACIAL -.->|Feature Maps & Gradients| GRAD_CAM
    GRAD_CAM --> ZONES_5
    BG_JOBS --> VIDEO_POOL

    THRESH_ENGINE --> VERDICT_RES
    ZONES_5 --> VERDICT_RES
    VIDEO_POOL --> VERDICT_RES

    VERDICT_RES --> UI_FEEDBACK
    VERDICT_RES --> REP_GEN
```

<p align="center">
  <img src="docs/images/architecture_flowchart.png" alt="DeepGuard System Architecture Flowchart" width="100%" />
  <br/>
  <em>Figure 1: DeepGuard Six-Tier High-Throughput Forensic Detection & Explainability Architecture.</em>
</p>

---

## 2. End-to-End Execution Sequence Diagram

This sequence illustrates the exact asynchronous journey of an uploaded media file from the browser through the forensic engine to report generation:

```mermaid
sequenceDiagram
    autonumber
    actor User as Operator / User
    participant Browser as React Frontend (Vite)
    participant API as FastAPI Backend (Uvicorn)
    participant Worker as Background Task Worker
    participant CV as OpenCV / Quality Engine
    participant Model as PyTorch EfficientNet-B0
    participant Explain as Grad-CAM Engine

    User->>Browser: Selects file (Image / Live Camera / Video)
    Browser->>Browser: Validates client constraints (Type, Size < 15MB/100MB)

    alt Image / Live Camera Snapshot Analysis
        Browser->>API: POST /api/v1/analyze/image?mode=facial (Multipart)
        API->>CV: Decode BGR bytes & assess quality (Laplacian, Contrast)
        CV->>CV: Detect faces (Haar Cascade) + NMS + 25% Margin Padding
        CV-->>API: Yields cropped face tensors & Quality Metrics
        API->>Model: Forward pass torch.no_grad() (Normalized 224x224)
        Model-->>API: Raw Logits / Sigmoid Probability
        API->>Explain: Compute Grad-CAM activations on features[8]
        Explain-->>API: Generates Heatmap PNG Data URI & 5-Zone breakdown
        API->>API: Apply Dual-Threshold Logic (<=0.35 Real, >=0.55 Fake)
        API-->>Browser: HTTP 200 OK (JSON Verdict, Heatmap URI, Metrics)
        Browser->>User: Displays VerdictCard, Split Wipe Slider & Quality Alerts

    else Video Media Analysis (Asynchronous Job Flow)
        Browser->>API: POST /api/v1/analyze/video (Multipart Stream)
        API->>API: Generate unique Job ID (UUIDv4)
        API->>Worker: Dispatch asynchronous background video task
        API-->>Browser: HTTP 200 OK { job_id, status: "processing" }

        loop Status Polling (every 1.2 seconds)
            Browser->>API: GET /api/v1/jobs/{job_id}
            API-->>Browser: { status: "processing", progress: 45% }
        end

        Worker->>CV: Open VideoCapture & sample keyframes at 1 FPS
        Worker->>CV: Extract faces & compute blur/contrast per frame
        Worker->>Model: Run batch CNN inference across keyframe tensors
        Worker->>Explain: Flag suspicious frames exceeding threshold
        Worker->>Worker: Apply Top-k Aggregation (70% Max + 30% Mean)
        Worker->>API: Update Job status to "completed" with full timeline payload
        Worker->>Worker: Cleanup temporary video file safely from disk

        Browser->>API: GET /api/v1/jobs/{job_id}
        API-->>Browser: HTTP 200 OK { status: "completed", result: timeline_data }
        Browser->>User: Renders Video Timeline, Seekable Video Player & Keyframe Gallery
    end

    opt Download Forensic Report
        User->>Browser: Clicks "Export PDF Report"
        Browser->>API: POST /api/v1/jobs/export/pdf (Verdict Payload)
        API->>API: ReportLab renders cryptographic PDF with SHA-256
        API-->>Browser: Binary PDF Stream (DeepGuard_Forensic_Report.pdf)
        Browser->>User: Downloads forensic audit certificate
    end
```

---

## 3. Detailed Component Tier Breakdown

### Tier 1: Client / Presentation Tier
- **Framework**: React 18.3, Vite 5.4, Tailwind CSS 3.4.
- **3D Hero Mesh (`Hero3D.jsx`)**: Built with Three.js. Renders an interactive cybernetic wireframe face with real-time mouse-raycasting reactivity. Utilizes `IntersectionObserver` to halt the animation loop when scrolled off-screen and pauses on `visibilitychange` when switching browser tabs.
- **Live Camera Studio (`LiveCameraCapture.jsx`)**: HTML5 WebRTC API (`navigator.mediaDevices.getUserMedia`). Provides front/rear camera toggling (`facingMode`), real-time alignment reticle, snapshot capture to canvas, and guaranteed hardware stream cleanup (`track.stop()`) on unmount.
- **Interactive Split Wipe Viewer (`HeatmapViewer.jsx`)**: Renders original imagery side-by-side with Grad-CAM heatmaps, supporting an interactive wipe slider powered by dynamic CSS `clip-path: polygon(...)`.

### Tier 2: API Gateway & Orchestration Tier
- **Framework**: FastAPI 0.100+ running on the Uvicorn ASGI server.
- **Unified Single-Origin SPA Serving**: In production, FastAPI mounts `frontend/dist` at the root `/` and handles API routes at `/api/v1/...` on the exact same host and port, completely eliminating Cross-Origin Resource Sharing (CORS) friction.
- **Asynchronous Task Architecture**: Heavy video workloads are dispatched via `BackgroundTasks`, keeping HTTP worker threads non-blocking. Progress states are tracked in an in-memory job registry.

### Tier 3: Computer Vision & Media Quality Diagnostics Tier
- **Engine**: OpenCV (`opencv-python` / `opencv-python-headless`).
- **Laplacian Blur Variance**: Computes the second spatial derivative:
  $$\sigma^2 = \text{Var}(\nabla^2 I) = \text{Var}\left(\frac{\partial^2 I}{\partial x^2} + \frac{\partial^2 I}{\partial y^2}\right)$$
  If $\sigma^2 < 50.0$, the input is flagged as motion-blurred.
- **Contrast Standard Deviation**: Computes standard deviation of pixel intensities across grayscale channels. Values $< 20.0$ trigger low-lighting advisories.
- **Haar Feature Cascade Classifier**: Detects frontal facial features rapidly across multi-scale pyramids.
- **Non-Maximum Suppression (NMS)**: Eliminates redundant overlapping bounding boxes (IoU threshold = 0.3) and sorts detected subjects by surface area.
- **25% Forensic Margin Padding**: Extends bounding boxes outwards:
  $$x_1 = \max(0, x - 0.25w), \quad y_1 = \max(0, y - 0.25h)$$
  $$x_2 = \min(W, x + 1.25w), \quad y_2 = \min(H, y + 1.25h)$$
  *Crucial scientific rationale*: Face-swap deepfakes leave tell-tale artifacts along the jawline, chin, and hair borders. Standard tight face crops cut these borders off; 25% padding forces the CNN to evaluate the transition boundaries.

<p align="center">
  <img src="docs/images/forensic_pipeline_stages.png" alt="Forensic Pipeline Stages" width="100%" />
  <br/>
  <em>Figure 2: Four-Stage Forensic Pipeline from Quality Audit and 25% Margin Padding to Grad-CAM & 5-Zone Localization.</em>
</p>

### Tier 4: Deep Learning Inference Tier
- **Framework**: PyTorch 2.0+ executed in `torch.no_grad()` inference mode.
- **Backbone Network**: **EfficientNet-B0** (5.3M parameters).
  - Uses compound scaling to uniformly scale network depth, width, and resolution with fixed scaling coefficients:
    $$\text{Depth}: d = \alpha^\phi, \quad \text{Width}: w = \beta^\phi, \quad \text{Resolution}: r = \gamma^\phi$$
    $$\text{s.t.} \quad \alpha \cdot \beta^2 \cdot \gamma^2 \approx 2, \quad \alpha \ge 1, \beta \ge 1, \gamma \ge 1$$
- **Pre-trained Checkpoints**:
  - `weights/facial_efficientnet_b0.pt`: Fine-tuned on facial manipulation datasets (FaceForensics++, Celeb-DF v2).
  - `weights/aigen_efficientnet_b0.pt`: Fine-tuned on full-frame synthetic diffusion datasets (DiffusionDB).
- **Calibrated Dual-Threshold Logic**:
  $$\text{Verdict}(S) = \begin{cases} 
  \textbf{Likely REAL} & \text{if } S \le 0.35 \\
  \textbf{INCONCLUSIVE} & \text{if } 0.35 < S < 0.55 \\
  \textbf{Likely FAKE} & \text{if } S \ge 0.55 
  \end{cases}$$

<p align="center">
  <img src="docs/images/decision_threshold_spectrum.png" alt="Calibrated Dual-Threshold Spectrum" width="95%" />
  <br/>
  <em>Figure 3: DeepGuard Calibrated Dual-Threshold Spectrum separating Likely Real, Inconclusive, and Likely Fake zones.</em>
</p>

### Tier 5: Explainability & Temporal Aggregation Tier
- **Grad-CAM (Gradient-Weighted Class Activation Mapping)**:
  Computes the gradient of the predicted deepfake score $y^c$ with respect to feature activation maps $A^k$ of the final convolutional layer `features[8]`:
  $$\alpha_k^c = \frac{1}{Z} \sum_{i} \sum_{j} \frac{\partial y^c}{\partial A_{i,j}^k}$$
  $$L_{\text{Grad-CAM}}^c = \text{ReLU}\left(\sum_k \alpha_k^c A^k\right)$$
  Positive gradients identify the precise facial pixels that increased the network's belief that an image is manipulated.
- **5 Anatomical Quadrants**: Bounding boxes are partitioned into Forehead, Eyes, Nose, Mouth, and Jawline/Cheeks. Mean Grad-CAM activation density is calculated per quadrant to provide per-zone risk ratings.
- **Video Temporal Pooling**: Aggregates sampled 1-FPS frame scores using weighted top-$k$ maximum pooling:
  $$S_{\text{video}} = 0.70 \cdot \max_{t}(S_t) + 0.30 \cdot \left(\frac{1}{N} \sum_{t=1}^N S_t\right)$$
  This prevents a brief 2-second face-swap insertion from being diluted by 28 seconds of authentic video footage.

### Tier 6: Forensic Reporting Tier
- **ReportLab PDF Generator**: Dynamically constructs cryptographic forensic certificates including SHA-256 hashes of analyzed inputs, model versioning, quality scores, Grad-CAM findings, and legal disclaimers.

---

## 4. Summary Table of Technologies

| Subsystem | Technology | Purpose in DeepGuard |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite 5, Tailwind CSS | Modular single-page application, dark/light theme, responsive controls |
| **3D Graphics** | Three.js (0.160+) | Cybernetic rotating face hero visualizer with viewport-based rendering pause |
| **Camera Studio** | HTML5 WebRTC (`getUserMedia`) | Live camera photo capture, front/rear switching, stream hardware cleanup |
| **Backend API** | FastAPI, Uvicorn (ASGI) | Async endpoints, background video worker, single-port production routing |
| **Computer Vision** | OpenCV (`cv2`) | Haar Cascades, NMS, Laplacian blur check, 25% boundary expansion |
| **Neural Network** | PyTorch (EfficientNet-B0) | 5.3M parameter compound-scaled CNN, sub-50ms CPU inference |
| **Explainability** | Grad-CAM (`torch.autograd`) | Activation heatmaps on layer `features[8]`, 5-zone anatomical risk |
| **Report Engine** | ReportLab (Python) | Production-grade cryptographic PDF forensic certificates |
| **Containerization** | Docker, Docker Compose | Multi-stage production container build (Node.js build & Python runtime) |
