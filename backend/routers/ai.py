import json
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.schemas import ChatMessageInput, ChatMessageResponse, ImageAnalysisResponse, RiskPredictionInput, RiskPredictionResponse
from backend.ai_service import AIService
from backend.database import get_db
from backend.models import RiskPrediction

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/chat", response_model=ChatMessageResponse)
def ai_chat(chat_in: ChatMessageInput):
    res = AIService.emergency_chat_assistant(chat_in.message)
    return res

@router.post("/analyze-image", response_model=ImageAnalysisResponse)
def analyze_image(image_url: str = "", description: str = ""):
    res = AIService.analyze_hazard_image(image_url, description)
    return res

@router.post("/predict-risk", response_model=RiskPredictionResponse)
def predict_risk(input_data: RiskPredictionInput, db: Session = Depends(get_db)):
    res = AIService.predict_landslide_risk(
        rainfall_mm=input_data.rainfall_mm,
        slope_deg=input_data.slope_deg,
        soil_type=input_data.soil_type,
        historical_incidents=input_data.historical_incidents,
        weather=input_data.weather_condition or "Heavy Rain"
    )

    # Persist risk prediction to database
    prediction_record = RiskPrediction(
        district_name=input_data.district_name,
        rainfall_mm=input_data.rainfall_mm,
        slope_deg=input_data.slope_deg,
        soil_type=input_data.soil_type,
        historical_incidents=input_data.historical_incidents,
        risk_level=res["risk_level"],
        risk_score=res["risk_score"],
        reasons=json.dumps(res["reasons"]),
        recommendations=json.dumps(res["recommendations"])
    )
    db.add(prediction_record)
    db.commit()

    return {
        "district_name": input_data.district_name,
        "rainfall_mm": input_data.rainfall_mm,
        "slope_deg": input_data.slope_deg,
        "soil_type": input_data.soil_type,
        "risk_level": res["risk_level"],
        "risk_score": res["risk_score"],
        "reasons": res["reasons"],
        "recommendations": res["recommendations"]
    }

@router.get("/risk-history")
def get_risk_history(limit: int = Query(20, le=100), db: Session = Depends(get_db)):
    """Fetch recent risk prediction history across all districts."""
    records = db.query(RiskPrediction).order_by(RiskPrediction.created_at.desc()).limit(limit).all()
    result = []
    for r in records:
        result.append({
            "id": r.id,
            "district_name": r.district_name,
            "risk_level": r.risk_level,
            "risk_score": r.risk_score,
            "rainfall_mm": r.rainfall_mm,
            "slope_deg": r.slope_deg,
            "soil_type": r.soil_type,
            "reasons": json.loads(r.reasons) if r.reasons else [],
            "recommendations": json.loads(r.recommendations) if r.recommendations else [],
            "created_at": r.created_at.isoformat()
        })
    return result

