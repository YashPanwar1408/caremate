from typing import List, Optional
from pydantic import BaseModel

class PredictionItem(BaseModel):
    disease: str
    probability: float  # 0..1
    risk_band: str      # low|medium|high
    top_features: List[str] = []
    recommendations: List[str] = []
    explanation: Optional[str] = None  # Patient-friendly summary from Gemini (optional)

class PredictionResponse(BaseModel):
    prediction_id: str
    predictions: List[PredictionItem]
