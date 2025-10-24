from __future__ import annotations
from typing import List
from fastapi import APIRouter, Query
from ..schemas.intake import HealthIntake
from ..schemas.prediction import PredictionItem, PredictionResponse
from ..gemini.gemini_client import get_doctor_explanation
from ..utils.state import save_prediction
from ..utils.model_loader import get_model
import numpy as np
import os

# Optional SHAP; guarded import
try:  # pragma: no cover
    import shap  # type: ignore
except Exception:  # pragma: no cover
    shap = None

router = APIRouter()


def _band_from_prob(p: float) -> str:
    pct = round(max(0.0, min(1.0, p)) * 100)
    if pct >= 67:
        return "high"
    if pct >= 34:
        return "medium"
    return "low"


def _build_feature_vector(x: HealthIntake):
    # Basic engineered features based on intake fields
    sex_vals = [
        1.0 if (x.sex or "").lower() == "male" else 0.0,
        1.0 if (x.sex or "").lower() == "female" else 0.0,
        1.0 if (x.sex or "").lower() == "other" else 0.0,
    ]
    feats = [
        float(x.age or 0),
        *sex_vals,
        float(x.height or 0),
        float(x.weight or 0),
        float(x.systolic or 0),
        float(x.diastolic or 0),
        float(x.glucose or 0),
        float(len(x.symptoms or [])),
    ]
    names = [
        "age",
        "sex_male",
        "sex_female",
        "sex_other",
        "height",
        "weight",
        "systolic",
        "diastolic",
        "glucose",
        "symptom_count",
    ]
    return np.array(feats, dtype=float).reshape(1, -1), names


def _heuristic_probabilities(x: HealthIntake):
    age = float(x.age or 0)
    sys = float(x.systolic or 0)
    dia = float(x.diastolic or 0)
    glu = float(x.glucose or 0)

    clamp01 = lambda v: max(0.0, min(1.0, v))
    diabetes = clamp01((glu - 90) / 120)
    heart = clamp01(((sys - 110) / 70) * 0.7 + ((dia - 70) / 40) * 0.3)
    kidney = clamp01(((age - 40) / 40) * 0.4 + ((dia - 70) / 50) * 0.6)

    return {
        "diabetes": float(diabetes),
        "heart": float(heart),
        "kidney": float(kidney),
    }


def _shap_top_features(model, x_np, feature_names: List[str], top_k: int = 5) -> List[str]:
    if shap is None or model is None:
        return []
    try:
        explainer = shap.Explainer(model)
        sv = explainer(x_np)
        vals = np.abs(sv.values[0]) if hasattr(sv, "values") else np.abs(sv[0].values)
        idx = np.argsort(vals)[::-1][:top_k]
        return [feature_names[i] for i in idx]
    except Exception:
        return []


@router.post("/predict", response_model=PredictionResponse)
def predict(intake: HealthIntake, user_id: str | None = Query(default=None)) -> PredictionResponse:
    model_dir = os.getenv("MODEL_DIR", "./app/models")

    x_np, feature_names = _build_feature_vector(intake)

    # Attempt to load models; fall back to heuristics if unavailable
    models = {
        "diabetes": get_model(model_dir, "diabetes"),
        "heart": get_model(model_dir, "heart"),
        "kidney": get_model(model_dir, "kidney"),
    }

    if any(m is None for m in models.values()):
        probs = _heuristic_probabilities(intake)
    else:
        probs = {}
        for name, mdl in models.items():
            try:
                # Try scikit-like predict_proba; otherwise decision_function scaled
                if hasattr(mdl, "predict_proba"):
                    p = float(mdl.predict_proba(x_np)[0, 1])
                elif hasattr(mdl, "predict"):
                    # naive scaling of decision score
                    score = float(mdl.predict(x_np)[0])
                    p = 1.0 / (1.0 + np.exp(-score))
                else:
                    p = 0.0
                probs[name] = max(0.0, min(1.0, p))
            except Exception:
                probs[name] = 0.0

    results: List[PredictionItem] = []
    disease_labels = {
        "diabetes": "Diabetes",
        "heart": "Heart",
        "kidney": "Kidney",
    }

    # Build a compact user context string from intake
    user_ctx_parts: List[str] = []
    if intake.symptoms:
        user_ctx_parts.append("Symptoms: " + ", ".join(intake.symptoms))
    if intake.pastDiseases:
        user_ctx_parts.append(f"Past: {intake.pastDiseases}")
    if intake.medications:
        user_ctx_parts.append(f"Meds: {intake.medications}")
    user_ctx = "; ".join(user_ctx_parts)

    for key in ["diabetes", "heart", "kidney"]:
        prob = float(probs.get(key, 0.0))
        band = _band_from_prob(prob)
        top_feats = _shap_top_features(models.get(key), x_np, feature_names)
        # Fetch a patient-friendly explanation (Gemini-backed or mock)
        explanation = get_doctor_explanation(disease_labels[key], prob, top_feats, user_ctx)

        recs: List[str] = []
        if key == "diabetes":
            recs = [
                "Monitor fasting glucose and consider HbA1c test.",
                "Adopt a balanced diet low in refined sugars.",
                "Increase physical activity to 150 min/week.",
            ]
        elif key == "heart":
            recs = [
                "Track blood pressure at home for 1–2 weeks.",
                "Limit sodium intake and manage stress.",
                "Consult a clinician if BP remains elevated.",
            ]
        elif key == "kidney":
            recs = [
                "Discuss kidney function tests (e.g., eGFR, UACR).",
                "Hydrate adequately; avoid unnecessary NSAIDs.",
                "Blood pressure control is key to kidney health.",
            ]

        results.append(
            PredictionItem(
                disease=disease_labels[key],
                probability=prob,
                risk_band=band,
                top_features=top_feats,
                recommendations=recs,
                explanation=explanation,
            )
        )

    # Save prediction record for report generation
    record = {
        "intake": intake.model_dump() if hasattr(intake, 'model_dump') else intake.dict(),
        "predictions": [r.model_dump() if hasattr(r, 'model_dump') else r.dict() for r in results],
    }
    if user_id:
        record["user_id"] = user_id
    pid = save_prediction(record)

    return PredictionResponse(prediction_id=pid, predictions=results)


"""
Sample payload for testing in Swagger UI (/docs) or curl:

curl -X POST "http://localhost:8000/predict" -H "Content-Type: application/json" -d @- << EOF
{
  "age": 45,
  "sex": "male",
  "height": 175,
  "weight": 82,
  "systolic": 140,
  "diastolic": 90,
  "glucose": 160,
  "symptoms": ["Headache", "Fatigue"],
  "labsUploaded": true,
  "wearableImported": false
}
EOF
"""
