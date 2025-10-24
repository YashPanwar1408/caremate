from __future__ import annotations
from typing import Dict, Any, List, Optional
import io
import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
from reportlab.lib import colors


def _draw_header(c: canvas.Canvas, title: str):
    c.setFont("Helvetica-Bold", 18)
    c.setFillColor(colors.teal)
    c.drawString(1 * inch, 10.5 * inch, title)
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 10)


def _draw_section_title(c: canvas.Canvas, y: float, text: str) -> float:
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(colors.darkgreen)
    c.drawString(1 * inch, y, text)
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 10)
    return y - 0.2 * inch


def _draw_wrapped_text(c: canvas.Canvas, text: str, x: float, y: float, width: float, leading: float = 12) -> float:
    from reportlab.lib.utils import simpleSplit
    lines = simpleSplit(text, 'Helvetica', 10, width)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading / 72.0 * inch
    return y


def generate_pdf(record: Dict[str, Any], output_dir: Optional[str] = None) -> bytes:
    """Generate a consultation PDF from a prediction record (intake + predictions).
    Returns PDF bytes; optionally writes to output_dir and returns the same bytes.
    """
    intake: Dict[str, Any] = record.get("intake", {}) or {}
    predictions: List[Dict[str, Any]] = record.get("predictions", []) or []

    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=letter)

    # Header
    _draw_header(c, "Consultation Report")

    y = 10.1 * inch
    # Patient info
    y = _draw_section_title(c, y, "Patient & Intake")
    intake_parts = []
    for k in ["age", "sex", "height", "weight", "systolic", "diastolic", "glucose"]:
        v = intake.get(k)
        if v not in (None, ""):
            intake_parts.append(f"{k.capitalize()}: {v}")
    if intake.get("symptoms"):
        intake_parts.append("Symptoms: " + ", ".join(intake.get("symptoms")))
    y = _draw_wrapped_text(c, " • ".join(intake_parts) or "No intake data provided.", 1 * inch, y, 6 * inch)

    # Risk summary
    y = _draw_section_title(c, y, "Risk Summary")
    for p in predictions:
        disease = p.get("disease", "Disease")
        prob = p.get("probability", 0)
        band = (p.get("risk_band") or "").upper()
        pct = round(float(prob) * 100)
        line = f"{disease}: {pct}% ({band})"
        y = _draw_wrapped_text(c, line, 1 * inch, y, 6 * inch)

    # SHAP top features
    y = _draw_section_title(c, y, "Top Contributing Factors")
    for p in predictions:
        disease = p.get("disease", "Disease")
        feats = p.get("top_features") or []
        if not feats:
            continue
        y = _draw_wrapped_text(c, f"{disease}: " + ", ".join(feats[:5]), 1 * inch, y, 6 * inch)

    # Recommendations & Explanation
    y = _draw_section_title(c, y, "Recommendations & Explanation")
    for p in predictions:
        disease = p.get("disease", "Disease")
        recs = p.get("recommendations") or []
        expl = p.get("explanation") or ""
        y = _draw_wrapped_text(c, f"{disease}:", 1 * inch, y, 6 * inch)
        if recs:
            y = _draw_wrapped_text(c, "  - " + "\n  - ".join(recs), 1 * inch, y, 6 * inch)
        if expl:
            y = _draw_wrapped_text(c, "  Explanation: " + expl, 1 * inch, y, 6 * inch)

    # Final notice
    y = _draw_section_title(c, y, "Important")
    y = _draw_wrapped_text(c, "These results are informational and not a diagnosis. If symptoms persist or worsen, please consult a medical professional.", 1 * inch, y, 6 * inch)

    c.showPage()
    c.save()

    pdf_bytes = buf.getvalue()
    buf.close()

    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        out_path = os.path.join(output_dir, f"report_{record.get('id','unknown')}.pdf")
        with open(out_path, 'wb') as f:
            f.write(pdf_bytes)
    
    return pdf_bytes
