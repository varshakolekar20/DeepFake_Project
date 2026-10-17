import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Image
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748b"))
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(40, 36, letter[0] - 40, 36)
        
        # Header (on pages after cover)
        if self._pageNumber > 1:
            self.drawString(40, letter[1] - 30, "DeepGuard — End-to-End System Architecture & Workflow")
            self.drawRightString(letter[0] - 40, letter[1] - 30, "Technical Architecture Specification")
            self.line(40, letter[1] - 34, letter[0] - 40, letter[1] - 34)

        # Footer
        self.drawString(40, 22, "DeepGuard Forensic Research Group (Varsha, Poonam, Anushree, Krushi, Sushti)")
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(letter[0] - 40, 22, page_text)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=46,
        bottomMargin=46
    )

    styles = getSampleStyleSheet()
    
    primary_color = colors.HexColor("#0f172a") # Navy
    teal_color = colors.HexColor("#0d9488")    # Teal
    blue_color = colors.HexColor("#0284c7")    # Sky Blue
    body_gray = colors.HexColor("#334155")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        alignment=1, # Center
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=teal_color,
        alignment=1,
        spaceAfter=14
    )

    h1_style = ParagraphStyle(
        'Header1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Header2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=teal_color,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=body_gray,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=body_gray,
        leftIndent=14,
        spaceAfter=3
    )

    caption_style = ParagraphStyle(
        'CaptionStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor("#64748b"),
        alignment=1,
        spaceBefore=4,
        spaceAfter=10
    )

    story = []

    # Title Banner
    story.append(Paragraph("🛡️ DeepGuard — End-to-End System Architecture", title_style))
    story.append(Paragraph("Comprehensive Technical Workflow, Six-Tier Design & Mathematical Pipeline", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=teal_color, spaceAfter=12))

    # Abstract / Overview
    story.append(Paragraph("1. System Purpose & Architectural Overview", h1_style))
    story.append(Paragraph(
        "<b>DeepGuard</b> is an academic-grade, full-stack digital forensics web application for explainable CNN-based deepfake facial manipulation and full-frame AI-generated synthetic media detection. "
        "Unlike black-box detectors that produce arbitrary uncalibrated percentages, DeepGuard couples pre-inference media quality diagnostics (blur, contrast, face sizing) "
        "with an EfficientNet-B0 CNN (5.3M parameters), an honest dual-threshold decision engine, visual Grad-CAM explainability, and a live WebRTC camera studio.",
        body_style
    ))

    # Figure 1: Architecture Flowchart
    img1_path = "docs/images/architecture_flowchart.png"
    if os.path.exists(img1_path):
        story.append(Spacer(1, 4))
        story.append(Image(img1_path, width=530, height=303))
        story.append(Paragraph("<b>Figure 1:</b> DeepGuard Six-Tier High-Throughput Forensic Detection & Explainability Architecture.", caption_style))

    story.append(Spacer(1, 6))

    # Section 2: Six Architectural Tiers
    story.append(Paragraph("2. Deep Dive: Six Architectural Tiers", h1_style))

    tiers_info = [
        ("Tier 1: Client Presentation Tier (Frontend)",
         "Built with React 18, Vite 5, and Tailwind CSS. Features an interactive Three.js 3D Cybernetic Face Mesh (Hero3D.jsx) with mouse-raycasting reactivity that automatically pauses rendering when scrolled off-screen or when switching tabs. Includes a WebRTC Live Camera Studio (LiveCameraCapture.jsx) with front/rear sensor switching and clean track release, and an interactive Split Wipe Slider (HeatmapViewer.jsx) powered by dynamic CSS clip-path polygon masks."),

        ("Tier 2: API Gateway & Orchestration Tier (Backend)",
         "Powered by FastAPI and Uvicorn (ASGI). Implements single-origin SPA mounting where FastAPI serves the compiled React build (frontend/dist) directly at / while handling API endpoints at /api/v1/..., completely eliminating Cross-Origin Resource Sharing (CORS) friction. Handles asynchronous background video processing via BackgroundTasks, providing real-time progress polling without blocking worker threads."),

        ("Tier 3: Computer Vision & Media Quality Diagnostics Tier",
         "Utilizes OpenCV to perform objective pre-inference diagnostics: computes Laplacian Blur Variance (threshold = 50.0), pixel intensity contrast standard deviation (threshold = 20.0), and isolates faces using Haar Cascades + Non-Maximum Suppression (IoU = 0.3). Automatically applies 25% Forensic Margin Padding to capture jawline, chin, and hair borders where face-swapping seam artifacts occur."),

        ("Tier 4: Deep Learning Inference Tier (PyTorch)",
         "Executes in torch.no_grad() mode using EfficientNet-B0 (5.3M parameters). EfficientNet balances network depth, width, and resolution using compound scaling, achieving high forensic sensitivity with under 50ms inference latency on CPU. Dual checkpoints support Facial Manipulation (face swaps) and full-frame AI-Generated Diffusion imagery."),

        ("Tier 5: Visual Explainability & Temporal Aggregation Tier",
         "Implements Grad-CAM on layer features[8] to highlight pixels that positively influenced the manipulation verdict. Breaks down risk across 5 Anatomical Zones (Forehead, Eyes, Nose, Mouth, Jawline). For video, samples frames uniformly at 1 FPS and applies weighted top-k pooling (70% max frame + 30% mean) to prevent brief manipulations from being washed out."),

        ("Tier 6: Forensic Delivery & Reporting Tier",
         "Displays calibrated verdicts (Likely Real, Likely Fake, Inconclusive). Generates downloadable cryptographic forensic audit certificates in PDF format via ReportLab (including SHA-256 hashes, timestamps, and model limitations) and JSON audit payloads.")
    ]

    for title, desc in tiers_info:
        story.append(Paragraph(title, h2_style))
        story.append(Paragraph(desc, body_style))

    story.append(PageBreak())

    # Figure 2: Forensic Pipeline Stages Demonstration
    story.append(Paragraph("3. Forensic Pipeline Stages & Explainability Workflow", h1_style))
    story.append(Paragraph(
        "The diagram below demonstrates an actual forensic inspection pass on a test portrait: from initial quality audit and 25% boundary expansion, to Grad-CAM feature[8] activation mapping, to anatomical 5-zone quadrant scoring.",
        body_style
    ))

    img2_path = "docs/images/forensic_pipeline_stages.png"
    if os.path.exists(img2_path):
        story.append(Spacer(1, 4))
        story.append(Image(img2_path, width=530, height=139))
        story.append(Paragraph("<b>Figure 2:</b> Four-Stage Forensic Pipeline from Quality Audit and 25% Margin Padding to Grad-CAM & 5-Zone Localization.", caption_style))

    story.append(Spacer(1, 6))

    # Figure 3: Dual-Threshold Decision Rule
    story.append(Paragraph("4. Honest Dual-Threshold Decision Calibration", h1_style))
    story.append(Paragraph(
        "Standard binary classifiers apply an arbitrary 0.5 threshold, forcing ambiguous inputs into false certainties. DeepGuard enforces a calibrated dual-threshold rule that explicitly declares forensic caution when scores fall in the middle zone:",
        body_style
    ))

    img3_path = "docs/images/decision_threshold_spectrum.png"
    if os.path.exists(img3_path):
        story.append(Spacer(1, 4))
        story.append(Image(img3_path, width=520, height=138))
        story.append(Paragraph("<b>Figure 3:</b> DeepGuard Calibrated Dual-Threshold Spectrum separating Likely Real, Inconclusive, and Likely Fake zones.", caption_style))

    story.append(Spacer(1, 6))

    # Section 5: Mathematical Formulations
    story.append(Paragraph("5. Key Mathematical Formulations Implemented in Code", h1_style))

    math_points = [
        "<b>1. Laplacian Blur Variance:</b> &sigma;<sup>2</sup> = Var(&nabla;<sup>2</sup> I). High variance indicates sharp optical edges; &sigma;<sup>2</sup> &lt; 50.0 triggers a motion blur advisory.",
        "<b>2. 25% Forensic Margin Padding:</b> x<sub>1</sub> = max(0, x - 0.25w), y<sub>1</sub> = max(0, y - 0.25h), x<sub>2</sub> = min(W, x + 1.25w), y<sub>2</sub> = min(H, y + 1.25h). Captures facial transition boundaries.",
        "<b>3. EfficientNet Compound Scaling:</b> Depth d = &alpha;<sup>&phi;</sup>, Width w = &beta;<sup>&phi;</sup>, Resolution r = &gamma;<sup>&phi;</sup>, s.t. &alpha; &middot; &beta;<sup>2</sup> &middot; &gamma;<sup>2</sup> &approx; 2. Balances capacity uniformly.",
        "<b>4. Grad-CAM Neuron Importance Weights:</b> &alpha;<sub>k</sub><sup>c</sup> = (1/Z) &sum;<sub>i</sub> &sum;<sub>j</sub> (&part; y<sup>c</sup> / &part; A<sub>i,j</sub><sup>k</sup>). Global average pooling of gradients over convolutional feature map A<sup>k</sup>.",
        "<b>5. Grad-CAM Class Activation Map:</b> L<sub>Grad-CAM</sub><sup>c</sup> = ReLU(&sum;<sub>k</sub> &alpha;<sub>k</sub><sup>c</sup> A<sup>k</sup>). Applies ReLU to isolate positive evidence supporting manipulation.",
        "<b>6. Video Temporal Top-k Pooling:</b> S<sub>video</sub> = 0.70 &middot; max(S<sub>t</sub>) + 0.30 &middot; (1/N &sum; S<sub>t</sub>). Protects against dilution of transient 2-second deepfakes across 30-second clips."
    ]
    for m in math_points:
        story.append(Paragraph(m, bullet_style))

    story.append(Spacer(1, 10))

    # Section 6: Technology Summary Matrix Table
    story.append(Paragraph("6. Technology Stack Summary Matrix", h1_style))
    matrix_data = [
        ["Subsystem", "Technology Used", "Version", "Role in DeepGuard System"],
        ["Frontend UI", "React + Vite + Tailwind CSS", "React 18.3 / Vite 5.4", "Single-Page Application, responsive cards, theme toggle"],
        ["3D Graphics", "Three.js", "0.160+", "Cybernetic face hero visualizer with viewport-based pause"],
        ["Camera Studio", "HTML5 WebRTC API", "getUserMedia", "Live camera capture, front/rear flip, hardware track release"],
        ["Backend API", "FastAPI + Uvicorn", "FastAPI 0.100+", "Async routes, background video worker, single-port hosting"],
        ["Computer Vision", "OpenCV", "4.8+", "Haar Cascades, NMS, Laplacian blur check, 25% margin padding"],
        ["Neural Network", "PyTorch (EfficientNet-B0)", "Torch 2.0+", "5.3M parameter compound-scaled CNN, sub-50ms CPU inference"],
        ["Explainability", "Grad-CAM (torch.autograd)", "Custom Engine", "Feature[8] class activation heatmaps, 5-zone anatomical risk"],
        ["PDF Reporting", "ReportLab", "5.0.1", "Cryptographic PDF forensic audit certificate generation"]
    ]
    m_table = Table(matrix_data, colWidths=[80, 130, 80, 240])
    m_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), primary_color),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.HexColor("#f1f5f9")]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
    ]))
    story.append(m_table)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated Architecture PDF: {filename}")

if __name__ == '__main__':
    target_pdf = sys.argv[1] if len(sys.argv) > 1 else "DeepGuard_System_Architecture_and_Workflow.pdf"
    build_pdf(target_pdf)
