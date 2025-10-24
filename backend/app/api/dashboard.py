from __future__ import annotations
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query
from ..utils.state import list_predictions
import os

router = APIRouter()

@router.get("/dashboard")
def get_dashboard(user_id: Optional[str] = Query(default=None)) -> Dict[str, Any]:
    """Return summary of past screenings for a user (or all if user_id not provided).
    Each item includes date, diseases with risk and recommendations, and a PDF link.
    """
    base_url = os.getenv("BASE_URL", "")
    items: List[Dict[str, Any]] = []
    for rec in list_predictions(user_id=user_id):
        preds = rec.get("predictions", [])
        # build per-disease summary
        diseases = []
        for p in preds:
            prob = float(p.get("probability", 0.0))
            diseases.append({
                "disease": p.get("disease"),
                "probability": prob,
                "risk_band": p.get("risk_band"),
                "recommendations": p.get("recommendations") or [],
            })
        # Prefer GET endpoint for opening reports directly
        pdf_link = f"/report/{rec.get('id')}"
        if base_url:
            pdf_link = base_url.rstrip('/') + pdf_link
        items.append({
            "prediction_id": rec.get("id"),
            "date": rec.get("created_at"),
            "diseases": diseases,
            "pdf_link": pdf_link,
        })
    return {"items": items}
