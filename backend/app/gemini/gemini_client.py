from __future__ import annotations
import os
from typing import List, Optional

try:
    import requests  # type: ignore
except Exception:  # pragma: no cover
    requests = None  # type: ignore


def _build_prompt(disease: str, probability: float, features: List[str], user_input: Optional[str]) -> str:
    pct = round(max(0.0, min(1.0, probability)) * 100)
    feat_text = ", ".join(features[:5]) if features else "not specified"
    user_text = user_input or ""
    return (
        "You are a caring clinician. Write a brief, patient-friendly explanation of the AI risk result.\n"
        f"Disease: {disease}\n"
        f"Estimated risk: {pct}%\n"
        f"Top contributing factors: {feat_text}\n"
        f"Patient context: {user_text}\n"
        "Include: what this may mean, what to monitor, and 2–3 next steps. Keep it concise (80–120 words)."
    )


def _call_gemini_api(prompt: str) -> Optional[str]:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or not requests:
        return None
    try:
        # Google Generative Language API (Gemini) - simple text generation call
        endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"
        payload = {"contents": [{"parts": [{"text": prompt}]}]}
        params = {"key": api_key}
        resp = requests.post(endpoint, params=params, json=payload, timeout=20)
        resp.raise_for_status()
        data = resp.json()
        # Parse text response
        candidates = data.get("candidates") or []
        if candidates:
            parts = candidates[0].get("content", {}).get("parts", [])
            texts = [p.get("text", "") for p in parts if isinstance(p, dict)]
            out = "\n".join([t for t in texts if t]).strip()
            return out or None
    except Exception:
        return None
    return None


def get_doctor_explanation(disease: str, probability: float, features: List[str], user_input: Optional[str] = None) -> str:
    """Return a patient-friendly explanation. If GEMINI_API_KEY is set and reachable, use Gemini; otherwise return a concise mock.
    """
    prompt = _build_prompt(disease, probability, features, user_input)
    ai = _call_gemini_api(prompt)
    if ai:
        return ai
    # Fallback mock
    pct = round(max(0.0, min(1.0, probability)) * 100)
    feat_text = ", ".join(features[:3]) if features else "various clinical factors"
    return (
        f"Your current risk for {disease.lower()} is estimated at about {pct}%. "
        f"This estimate is influenced by {feat_text}. "
        "Consider tracking your readings, maintaining healthy habits, and discussing follow-up testing with a clinician if concerns persist."
    )
