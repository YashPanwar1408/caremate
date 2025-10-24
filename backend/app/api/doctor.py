from __future__ import annotations
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from ..utils.state import save_consult
from datetime import datetime

router = APIRouter()

DISCLAIMER = (
    "This service does not provide medical diagnosis. Use patient data responsibly. "
    "Ensure consent and privacy compliance when sharing or consulting on reports."
)

@router.get("/doctors")
def list_doctors() -> Dict[str, Any]:
    """Return a mock list of verified doctor profiles."""
    doctors = [
        {
            "id": "d1",
            "name": "Dr. Aisha Rahman",
            "specialty": "Internal Medicine",
            "rating": 4.8,
            "experience_years": 12,
            "languages": ["English", "Hindi"],
            "teleconsult": True,
        },
        {
            "id": "d2",
            "name": "Dr. Luis Fernandez",
            "specialty": "Cardiology",
            "rating": 4.7,
            "experience_years": 15,
            "languages": ["English", "Spanish"],
            "teleconsult": True,
        },
        {
            "id": "d3",
            "name": "Dr. Mei Lin",
            "specialty": "Endocrinology",
            "rating": 4.9,
            "experience_years": 10,
            "languages": ["English", "Mandarin"],
            "teleconsult": True,
        },
    ]
    return {"doctors": doctors, "disclaimer": DISCLAIMER}

@router.post("/consult")
def schedule_consult(
    user_id: Optional[str] = None,
    doctor_id: Optional[str] = None,
    prediction_id: Optional[str] = None,
    mode: str = "teleconsult",  # or "send_report"
    when_iso: Optional[str] = None,
) -> Dict[str, Any]:
    """Mock scheduling of teleconsult or sending a report to a doctor. Saves to local log.
    In a real system, this would trigger notifications/integrations.
    """
    if not doctor_id or not mode:
        raise HTTPException(status_code=400, detail="doctor_id and mode are required")
    if mode not in ("teleconsult", "send_report"):
        raise HTTPException(status_code=400, detail="invalid mode")

    record = {
        "user_id": user_id,
        "doctor_id": doctor_id,
        "prediction_id": prediction_id,
        "mode": mode,
        "when": when_iso or datetime.utcnow().isoformat(),
        "status": "scheduled" if mode == "teleconsult" else "sent",
    }
    cid = save_consult(record)
    return {"consult_id": cid, "status": record["status"], "disclaimer": DISCLAIMER}
