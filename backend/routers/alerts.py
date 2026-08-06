from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Alert, User, UserRole, AuditLog, Notification
from backend.schemas import AlertCreate, AlertResponse
from backend.auth import get_current_user, require_role

router = APIRouter(prefix="/alerts", tags=["Early Warning Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    alerts = db.query(Alert).filter(Alert.is_active == True).order_by(Alert.created_at.desc()).all()
    return alerts

@router.post("", response_model=AlertResponse, status_code=status.HTTP_201_CREATED)
def create_alert(
    alert_in: AlertCreate,
    current_user: User = Depends(require_role([UserRole.GOVERNMENT.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    alert = Alert(
        title=alert_in.title,
        description=alert_in.description,
        severity=alert_in.severity,
        affected_area=alert_in.affected_area,
        latitude=alert_in.latitude or 11.6854,
        longitude=alert_in.longitude or 76.1320,
        radius_km=alert_in.radius_km or 10.0,
        expiry_date=alert_in.expiry_date,
        is_active=True,
        created_by_id=current_user.id
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Broadcast notification to all active users
    users = db.query(User).filter(User.is_active == True).all()
    for u in users:
        notif = Notification(
            user_id=u.id,
            title=f"🚨 {alert.severity.upper()}: {alert.title}",
            message=f"{alert.affected_area}: {alert.description}",
            notification_type="Critical" if alert.severity == "Critical" else "Alert"
        )
        db.add(notif)

    # Audit log
    log = AuditLog(
        user_email=current_user.email,
        user_role=current_user.role,
        action="BROADCAST_ALERT",
        details=f"Alert #{alert.id} [{alert.severity}]: {alert.title} in {alert.affected_area}"
    )
    db.add(log)
    db.commit()

    return alert

@router.delete("/{alert_id}")
def deactivate_alert(
    alert_id: int,
    current_user: User = Depends(require_role([UserRole.GOVERNMENT.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_active = False
    db.commit()
    return {"message": "Alert deactivated"}
