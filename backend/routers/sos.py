from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import datetime
from backend.database import get_db
from backend.models import SOSRequest, User, UserRole, SOSStatus, AuditLog, Notification, get_utc_now
from backend.schemas import SOSCreate, SOSResponse
from backend.auth import get_current_user, require_role

router = APIRouter(prefix="/sos", tags=["Emergency SOS"])

@router.get("", response_model=List[SOSResponse])
def get_all_sos_requests(
    current_user: User = Depends(require_role([UserRole.GOVERNMENT.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    sos_list = db.query(SOSRequest).order_by(SOSRequest.created_at.desc()).all()
    for s in sos_list:
        s.user_name = s.user.full_name if s.user else "Citizen"
        s.user_phone = s.user.phone if s.user else "+91 98765 43210"
    return sos_list

@router.get("/my", response_model=List[SOSResponse])
def get_my_sos_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sos_list = db.query(SOSRequest).filter(SOSRequest.user_id == current_user.id).order_by(SOSRequest.created_at.desc()).all()
    for s in sos_list:
        s.user_name = current_user.full_name
        s.user_phone = current_user.phone
    return sos_list

@router.post("/trigger", response_model=SOSResponse, status_code=status.HTTP_201_CREATED)
def trigger_sos(
    sos_in: SOSCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sos = SOSRequest(
        user_id=current_user.id,
        latitude=sos_in.latitude,
        longitude=sos_in.longitude,
        location_address=sos_in.location_address or "Wayanad Hilltop Sector 4",
        emergency_type=sos_in.emergency_type,
        status=SOSStatus.ACTIVE.value
    )
    db.add(sos)
    db.commit()
    db.refresh(sos)

    # Notify Government & Admin Officers immediately
    officers = db.query(User).filter(User.role.in_([UserRole.GOVERNMENT.value, UserRole.ADMIN.value])).all()
    for off in officers:
        notif = Notification(
            user_id=off.id,
            title=f"🆘 CRITICAL SOS DISTRESS ALERT #{sos.id}",
            message=f"{current_user.full_name} triggered Emergency SOS ({sos.emergency_type}) at [{sos.latitude}, {sos.longitude}]. Phone: {current_user.phone or 'N/A'}",
            notification_type="SOS"
        )
        db.add(notif)

    # Audit log
    log = AuditLog(
        user_email=current_user.email,
        user_role=current_user.role,
        action="TRIGGER_EMERGENCY_SOS",
        details=f"SOS #{sos.id} triggered at lat: {sos.latitude}, lng: {sos.longitude}"
    )
    db.add(log)
    db.commit()

    sos.user_name = current_user.full_name
    sos.user_phone = current_user.phone
    return sos

@router.put("/{sos_id}/resolve", response_model=SOSResponse)
def resolve_sos(
    sos_id: int,
    notes: str = "Rescue team dispatched and site cleared.",
    current_user: User = Depends(require_role([UserRole.GOVERNMENT.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    sos = db.query(SOSRequest).filter(SOSRequest.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS request not found")

    sos.status = SOSStatus.RESOLVED.value
    sos.responder_notes = notes
    sos.resolved_at = get_utc_now()
    db.commit()
    db.refresh(sos)

    # Notify Victim User
    notif = Notification(
        user_id=sos.user_id,
        title=f"✅ SOS Request #{sos.id} Resolved",
        message=f"Rescue Status: {notes}",
        notification_type="Info"
    )
    db.add(notif)
    db.commit()

    sos.user_name = sos.user.full_name if sos.user else "Citizen"
    sos.user_phone = sos.user.phone if sos.user else ""
    return sos
