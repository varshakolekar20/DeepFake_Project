import os
import json
import time
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

class ReportGenerator:
    """Generates standardized forensic audit reports in JSON and PDF format."""
    
    @staticmethod
    def generate_json_report(analysis_result: Dict[str, Any]) -> str:
        """Formats the analysis outcome into structured JSON with metadata and disclaimers."""
        report = {
            "application": "DeepGuard Forensic Verification Engine",
            "version": "1.0.0",
            "report_generated_at": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
            "analysis": analysis_result,
            "forensic_notice": (
                "DeepGuard uses deep convolutional neural networks with Grad-CAM explainability. "
                "Classifications represent statistical likelihood within trained domain distributions. "
                "Grad-CAM heatmaps highlight spatial regions influencing model activations, not legally certified edited pixels. "
                "A 'Likely Authentic' outcome indicates lack of detected synthetic artifacts, but does not verify real-world factual claims."
            )
        }
        return json.dumps(report, indent=2)

    @staticmethod
    def generate_pdf_report(analysis_result: Dict[str, Any], output_path: str):
        """Builds a formatted forensic PDF document with tabular breakdown and explanations."""
        doc = SimpleDocTemplate(output_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        styles = getSampleStyleSheet()
        story = []

        # Custom styles
        title_style = ParagraphStyle(
            'TitleStyle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0f172a'),
            spaceAfter=6
        )
        subtitle_style = ParagraphStyle(
            'SubTitleStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=15
        )
        heading2_style = ParagraphStyle(
            'H2Style',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor('#1e293b'),
            spaceBefore=12,
            spaceAfter=8
        )
        body_style = ParagraphStyle(
            'BodyStyle',
            parent=styles['Normal'],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )
        disclaimer_style = ParagraphStyle(
            'DiscStyle',
            parent=styles['Normal'],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor('#64748b')
        )

        # Header
        story.append(Paragraph("<b>DeepGuard Forensic Analysis Report</b>", title_style))
        story.append(Paragraph(f"Generated on {time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())} • Engine v1.0.0", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#0284c7'), spaceAfter=15))

        # Core Verdict
        verdict = analysis_result.get("verdict", "Unknown")
        score = analysis_result.get("percentage", 0.0)
        mode = analysis_result.get("mode", "Facial Analysis")
        
        verdict_color = colors.HexColor('#dc2626') if "Manipulated" in verdict or "AI-Generated" in verdict else (
            colors.HexColor('#16a34a') if "Authentic" in verdict else colors.HexColor('#d97706')
        )
        
        summary_data = [
            [Paragraph("<b>Analysis Mode</b>", body_style), Paragraph(str(mode).title(), body_style)],
            [Paragraph("<b>Forensic Verdict</b>", body_style), Paragraph(f"<b><font color='{verdict_color.hexval()}'>{verdict}</font></b>", body_style)],
            [Paragraph("<b>Manipulation Likelihood</b>", body_style), Paragraph(f"<b>{score}%</b>", body_style)],
            [Paragraph("<b>Model Architecture</b>", body_style), Paragraph("EfficientNet-B0 (Explainable CNN)", body_style)]
        ]
        
        summary_table = Table(summary_data, colWidths=[150, 350])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 15))

        # Explanation
        story.append(Paragraph("<b>Findings & Explanation</b>", heading2_style))
        story.append(Paragraph(analysis_result.get("explanation", "No detailed explanation provided."), body_style))
        story.append(Spacer(1, 15))

        # Quality & Detection Metrics
        story.append(Paragraph("<b>Quality & Coverage Diagnostics</b>", heading2_style))
        quality = analysis_result.get("quality", {})
        q_data = [
            [Paragraph("<b>Metric</b>", body_style), Paragraph("<b>Value</b>", body_style), Paragraph("<b>Status</b>", body_style)],
            [Paragraph("Resolution", body_style), Paragraph(f"{quality.get('width', 'N/A')} x {quality.get('height', 'N/A')} px", body_style), Paragraph("Checked", body_style)],
            [Paragraph("Blur Metric (Laplacian Var)", body_style), Paragraph(str(quality.get('laplacian_var', 'N/A')), body_style), Paragraph("Flagged (Blur)" if quality.get('is_blurry') else "Pass", body_style)],
            [Paragraph("Contrast Standard Deviation", body_style), Paragraph(str(quality.get('contrast_std', 'N/A')), body_style), Paragraph("Low Contrast" if quality.get('is_low_contrast') else "Pass", body_style)],
            [Paragraph("Faces Detected", body_style), Paragraph(str(analysis_result.get('face_count', 'N/A')), body_style), Paragraph("Analyzed", body_style)]
        ]
        q_table = Table(q_data, colWidths=[160, 180, 160])
        q_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#e2e8f0')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#cbd5e1')),
            ('PADDING', (0,0), (-1,-1), 5),
        ]))
        story.append(q_table)
        story.append(Spacer(1, 20))

        # Limitations & Ethical Notice
        story.append(Paragraph("<b>Forensic Limitations & Methodology Notice</b>", heading2_style))
        notice_text = (
            "1. DeepGuard predictions are evidence-based assessments from convolutional feature patterns. "
            "They do not constitute irreversible legal proof.<br/>"
            "2. Grad-CAM visual heatmaps highlight mathematical regions of interest that drove the neural activations.<br/>"
            "3. Audio manipulation, physical re-staging, and full-synthetic generative video extensions are evaluated separately."
        )
        story.append(Paragraph(notice_text, disclaimer_style))

        doc.build(story)
