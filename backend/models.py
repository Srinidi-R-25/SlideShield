import datetime
from typing import ClassVar, Optional
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from backend.database import Base
import enum

def get_utc_now():
    return datetime.datetime.now(datetime.timezone.utc)

class UserRole(str, enum.Enum):
    CITIZEN = "Citizen"
    GOVERNMENT = "Government Officer"
    ADMIN = "Admin"

class ReportStatus(str, enum.Enum):
    PENDING = "Pending"
    VERIFIED = "Verified"
    REJECTED = "Rejected"
    RESOLVED = "Resolved"

class AlertSeverity(str, enum.Enum):
    CRITICAL = "Critical"
    WARNING = "Warning"
    INFORMATION = "Information"

class SOSStatus(str, enum.Enum):
    ACTIVE = "Active"
    RESPONDED = "Responded"
    RESOLVED = "Resolved"
    CANCELLED = "Cancelled"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default=UserRole.CITIZEN.value, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    district = Column(String, nullable=True, default="Wayanan / Idukki Region")
    state = Column(String, nullable=True, default="Kerala")
    avatar_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    # Relationships
    hazard_reports = relationship("HazardReport", back_populates="reporter")
    sos_requests = relationship("SOSRequest", back_populates="user")
    created_alerts = relationship("Alert", back_populates="creator")
    notifications = relationship("Notification", back_populates="user")

class HazardReport(Base):
    __tablename__ = "hazard_reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False, default="Landslide Risk") # Landslide, Rockfall, Soil Erosion, Flood
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    status = Column(String, default=ReportStatus.PENDING.value, nullable=False)
    priority = Column(String, default="Medium") # Low, Medium, High, Critical
    ai_detected_hazard = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True) # 0-100%
    ai_summary = Column(Text, nullable=True)
    government_remarks = Column(Text, nullable=True)
    assigned_team = Column(String, nullable=True)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)

    reporter = relationship("User", back_populates="hazard_reports")
    reporter_name: ClassVar[Optional[str]] = None

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, default=AlertSeverity.WARNING.value, nullable=False)
    affected_area = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    radius_km = Column(Float, default=10.0)
    expiry_date = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    creator = relationship("User", back_populates="created_alerts")

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    district_name = Column(String, nullable=False)
    rainfall_mm = Column(Float, nullable=False)
    slope_deg = Column(Float, nullable=False)
    soil_type = Column(String, nullable=False)
    historical_incidents = Column(Integer, default=0)
    risk_level = Column(String, nullable=False) # Low, Medium, High, Very High
    risk_score = Column(Float, nullable=False) # 0.0 - 100.0
    reasons = Column(Text, nullable=False)
    recommendations = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

class SOSRequest(Base):
    __tablename__ = "sos_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_address = Column(String, nullable=True)
    emergency_type = Column(String, default="Landslide Trapped", nullable=False)
    status = Column(String, default=SOSStatus.ACTIVE.value, nullable=False)
    responder_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="sos_requests")
    user_name: ClassVar[Optional[str]] = None
    user_phone: ClassVar[Optional[str]] = None

class Shelter(Base):
    __tablename__ = "shelters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    district = Column(String, nullable=False, default="Wayanad")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False, default=500)
    current_occupancy = Column(Integer, nullable=False, default=120)
    contact_phone = Column(String, nullable=False)
    medical_support = Column(Boolean, default=True)
    supplies_status = Column(String, default="Adequate") # Adequate, Critical, Low
    is_open = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String, default="Info") # Critical, Alert, Info, SOS
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

    user = relationship("User", back_populates="notifications")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)
    user_role = Column(String, nullable=False)
    action = Column(String, nullable=False) # e.g. "USER_LOGIN", "BROADCAST_ALERT", "VERIFY_REPORT"
    details = Column(Text, nullable=True)
    ip_address = Column(String, default="127.0.0.1")
    timestamp = Column(DateTime(timezone=True), default=get_utc_now)

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    rating = Column(Integer, default=5)
    status = Column(String, default="Open")
    created_at = Column(DateTime(timezone=True), default=get_utc_now)

class PlatformSettings(Base):
    __tablename__ = "platform_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), default=get_utc_now, onupdate=get_utc_now)
