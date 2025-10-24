from __future__ import annotations
import os
from typing import Dict, Optional

try:
    import joblib  # type: ignore
except Exception:  # pragma: no cover
    joblib = None

_MODEL_CACHE: Dict[str, object] = {}


def get_model(model_dir: str, name: str) -> Optional[object]:
    """Load and cache a disease model by name (e.g., 'diabetes', 'heart', 'kidney').
    Looks for files like '<name>.pkl' or '<name>.joblib' in model_dir.
    Returns None if not found or joblib unavailable.
    """
    key = name.lower()
    if key in _MODEL_CACHE:
        return _MODEL_CACHE[key]

    if not joblib:
        return None

    candidates = [
        os.path.join(model_dir, f"{key}.pkl"),
        os.path.join(model_dir, f"{key}.joblib"),
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                model = joblib.load(path)
                _MODEL_CACHE[key] = model
                return model
            except Exception:
                return None
    return None
