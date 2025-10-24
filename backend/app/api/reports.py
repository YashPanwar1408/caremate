from __future__ import annotations
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from ..utils.state import get_prediction
from ..reports.pdf_generator import generate_pdf
import os

router = APIRouter()

@router.post("/generate_report", response_class=Response)
def generate_report(user_id: Optional[str] = None, prediction_id: str = ""):
    """Generate a consultation PDF for a prior prediction and return it as application/pdf bytes.
    Body params are accepted as form/query-like for simplicity; can be upgraded to a Pydantic model if needed.
    """
    if not prediction_id:
        raise HTTPException(status_code=400, detail="prediction_id is required")
    rec = get_prediction(prediction_id)
    if not rec:
        raise HTTPException(status_code=404, detail="prediction not found")

    # Generate PDF (and optionally save to REPORTS_DIR)
    reports_dir = os.getenv("REPORTS_DIR", "./app/reports")
    pdf_bytes = generate_pdf(rec, output_dir=reports_dir)

    headers = {
        "Content-Disposition": f"attachment; filename=report_{prediction_id}.pdf"
    }
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)


@router.get("/report/{prediction_id}", response_class=Response)
def get_report(prediction_id: str):
    """Convenience GET endpoint to retrieve a report PDF by prediction id.
    Useful for opening directly in a browser/webview.
    """
    if not prediction_id:
        raise HTTPException(status_code=400, detail="prediction_id is required")
    rec = get_prediction(prediction_id)
    if not rec:
        raise HTTPException(status_code=404, detail="prediction not found")

    reports_dir = os.getenv("REPORTS_DIR", "./app/reports")
    pdf_bytes = generate_pdf(rec, output_dir=reports_dir)
    headers = {
        "Content-Disposition": f"inline; filename=report_{prediction_id}.pdf"
    }
    return Response(content=pdf_bytes, media_type="application/pdf", headers=headers)
