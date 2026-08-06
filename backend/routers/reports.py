from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
from backend.database import get_db
from backend.models import HazardReport, User, UserRole, ReportStatus, AuditLog, Notification
from backend.schemas import ReportCreate, ReportResponse, ReportVerifyUpdate
from backend.auth import get_current_user, require_role
from backend.ai_service import AIService
from backend.config import settings

router = APIRouter(prefix="/reports", tags=["Hazard Reports"])

@router.get("", response_model=List[ReportResponse])
def get_reports(
    status_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(HazardReport)
    
    # If Citizen, only show public verified/resolved OR user's own submitted reports
    if current_user.role == UserRole.CITIZEN.value:
        query = query.filter(
            (HazardReport.reporter_id == current_user.id) | 
            (HazardReport.status.in_([ReportStatus.VERIFIED.value, ReportStatus.RESOLVED.value]))
        )
    
    if status_filter:
        query = query.filter(HazardReport.status == status_filter)
    if category_filter:
        query = query.filter(HazardReport.category == category_filter)
        
    reports = query.order_by(HazardReport.created_at.desc()).all()
    
    # Attach reporter name
    for r in reports:
        r.reporter_name = r.reporter.full_name if r.reporter else "Anonymous Citizen"
    return reports

@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_in: ReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Run AI Analysis automatically on creation
    ai_result = AIService.analyze_hazard_image(report_in.image_url or "", report_in.description)
    ai_summary = AIService.summarize_report(report_in.title, report_in.description, report_in.location_name)

    report = HazardReport(
        title=report_in.title,
        description=report_in.description,
        category=report_in.category,
        location_name=report_in.location_name,
        latitude=report_in.latitude,
        longitude=report_in.longitude,
        image_url=report_in.image_url or "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60",
        video_url=report_in.video_url,
        status=ReportStatus.PENDING.value,
        priority="High" if ai_result["risk_category"] in ["High", "Critical"] else "Medium",
        ai_detected_hazard=ai_result["detected_hazard"],
        confidence_score=ai_result["confidence_percentage"],
        ai_summary=ai_summary,
        reporter_id=current_user.id
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Log audit
    log = AuditLog(user_email=current_user.email, user_role=current_user.role, action="SUBMIT_HAZARD_REPORT", details=f"Report ID #{report.id}: {report.title}")
    db.add(log)
    db.commit()

    report.reporter_name = current_user.full_name
    return report

@router.post("/upload-image")
def upload_report_image(file: UploadFile = File(...)):
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(file.file.read())
    
    file_url = f"/uploads/{filename}"
    
    # Run instant vision scan on uploaded image description
    ai_result = AIService.analyze_hazard_image(file_url, file.filename)
    return {
        "url": file_url,
        "ai_scan": ai_result
    }

@router.put("/{report_id}/verify", response_model=ReportResponse)
def verify_report(
    report_id: int,
    verify_in: ReportVerifyUpdate,
    current_user: User = Depends(require_role([UserRole.GOVERNMENT.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    report = db.query(HazardReport).filter(HazardReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Hazard report not found")

    report.status = verify_in.status
    if verify_in.priority:
        report.priority = verify_in.priority
    if verify_in.government_remarks:
        report.government_remarks = verify_in.government_remarks
    if verify_in.assigned_team:
        report.assigned_team = verify_in.assigned_team

    db.commit()
    db.refresh(report)

    # Send Notification to Reporter
    notif = Notification(
        user_id=report.reporter_id,
        title=f"Report #{report.id} Update: {report.status}",
        message=f"Government Officer response: {verify_in.government_remarks or 'Status changed to ' + report.status}",
        notification_type="Alert" if report.status == "Verified" else "Info"
    )
    db.add(notif)

    # Log audit
    log = AuditLog(
        user_email=current_user.email,
        user_role=current_user.role,
        action="VERIFY_REPORT",
        details=f"Report #{report.id} set to {report.status}. Assigned Team: {report.assigned_team}"
    )
    db.add(log)
    db.commit()

    report.reporter_name = report.reporter.full_name if report.reporter else "Citizen"
    return report

@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    report = db.query(HazardReport).filter(HazardReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"message": "Report deleted successfully"}
