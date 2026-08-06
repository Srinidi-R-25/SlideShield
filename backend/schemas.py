from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user_id: int
    full_name: str
    email: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    role: str = "Citizen" # Citizen, Government Officer, Admin
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    district: Optional[str] = "Wayanad"
    state: Optional[str] = "Kerala"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    avatar_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    district: Optional[str] = None

# --- Report Schemas ---
class ReportCreate(BaseModel):
    title: str
    description: str
    category: str = "Landslide Risk"
    location_name: str
    latitude: float
    longitude: float
    image_url: Optional[str] = None
    video_url: Optional[str] = None

class ReportVerifyUpdate(BaseModel):
    status: str # Verified, Rejected, Resolved
    priority: Optional[str] = "Medium"
    government_remarks: Optional[str] = None
    assigned_team: Optional[str] = None

class ReportResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    location_name: str
    latitude: float
    longitude: float
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    status: str
    priority: str
    ai_detected_hazard: Optional[str] = None
    confidence_score: Optional[float] = None
    ai_summary: Optional[str] = None
    government_remarks: Optional[str] = None
    assigned_team: Optional[str] = None
    reporter_id: int
    reporter_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Alert Schemas ---
class AlertCreate(BaseModel):
    title: str
    description: str
    severity: str = "Warning" # Critical, Warning, Information
    affected_area: str
    latitude: Optional[float] = 11.6854
    longitude: Optional[float] = 76.1320
    radius_km: Optional[float] = 10.0
    expiry_date: Optional[str] = "2026-08-10"

class AlertResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    affected_area: str
    latitude: Optional[float]
    longitude: Optional[float]
    radius_km: float
    expiry_date: Optional[str]
    is_active: bool
    created_by_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Risk Prediction Schemas ---
class RiskPredictionInput(BaseModel):
    district_name: str
    rainfall_mm: float
    slope_deg: float
    soil_type: str # Clay, Sand, Silt, Gravel, Loam
    historical_incidents: int = 0
    weather_condition: Optional[str] = "Heavy Rain"

class RiskPredictionResponse(BaseModel):
    district_name: str
    rainfall_mm: float
    slope_deg: float
    soil_type: str
    risk_level: str
    risk_score: float
    reasons: List[str]
    recommendations: List[str]

# --- SOS Request Schemas ---
class SOSCreate(BaseModel):
    latitude: float
    longitude: float
    location_address: Optional[str] = "Current GPS Location"
    emergency_type: str = "Landslide Trapped"

class SOSResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    latitude: float
    longitude: float
    location_address: Optional[str]
    emergency_type: str
    status: str
    responder_notes: Optional[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Shelter Schemas ---
class ShelterCreate(BaseModel):
    name: str
    address: str
    district: str = "Wayanad"
    latitude: float
    longitude: float
    capacity: int = 500
    current_occupancy: int = 0
    contact_phone: str
    medical_support: bool = True
    supplies_status: str = "Adequate"

class ShelterResponse(BaseModel):
    id: int
    name: str
    address: str
    district: str
    latitude: float
    longitude: float
    capacity: int
    current_occupancy: int
    contact_phone: str
    medical_support: bool
    supplies_status: str
    is_open: bool

    model_config = ConfigDict(from_attributes=True)

# --- AI Chat Schemas ---
class ChatMessageInput(BaseModel):
    message: str

class ChatMessageResponse(BaseModel):
    reply: str
    sources: List[str] = []

# --- AI Vision Scan Schema ---
class ImageAnalysisResponse(BaseModel):
    detected_hazard: str
    confidence_percentage: float
    summary: str
    risk_category: str
    recommended_actions: List[str]

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Feedback Schemas ---
class FeedbackCreate(BaseModel):
    subject: str
    message: str
    rating: int = Field(default=5, ge=1, le=5)

class FeedbackResponse(BaseModel):
    id: int
    user_email: str
    subject: str
    message: str
    rating: int
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Password Change Schema ---
class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)
