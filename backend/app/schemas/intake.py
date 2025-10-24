from typing import List, Optional
from pydantic import BaseModel, Field

class HealthIntake(BaseModel):
    age: Optional[float] = Field(default=None, ge=0, le=120)
    sex: Optional[str] = Field(default=None, pattern=r"^(male|female|other)$")
    height: Optional[float] = Field(default=None, ge=30, le=250)
    weight: Optional[float] = Field(default=None, ge=2, le=500)
    systolic: Optional[float] = Field(default=None, ge=60, le=250)
    diastolic: Optional[float] = Field(default=None, ge=30, le=150)
    glucose: Optional[float] = Field(default=None, ge=20, le=600)

    symptoms: List[str] = []
    pastDiseases: Optional[str] = None
    medications: Optional[str] = None

    labsUploaded: Optional[bool] = False
    wearableImported: Optional[bool] = False

    class Config:
        json_schema_extra = {
            "example": {
                "age": 45,
                "sex": "male",
                "height": 175,
                "weight": 82,
                "systolic": 140,
                "diastolic": 90,
                "glucose": 160,
                "symptoms": ["Headache", "Fatigue"],
                "pastDiseases": "hypertension",
                "medications": "lisinopril",
                "labsUploaded": True,
                "wearableImported": False,
            }
        }
