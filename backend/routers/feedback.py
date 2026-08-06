from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Feedback, User, UserRole, AuditLog
from backend.schemas import FeedbackCreate, FeedbackResponse
from backend.auth import get_current_user, require_role

router = APIRouter(prefix="/feedback", tags=["Feedback"])

@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(
    fb_in: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Any logged-in user can submit platform feedback/suggestions."""
    feedback = Feedback(
        user_email=current_user.email,
        subject=fb_in.subject,
        message=fb_in.message,
        rating=max(1, min(5, fb_in.rating)),  # clamp 1-5
        status="Open"
    )
    db.add(feedback)

    # Audit log
    log = AuditLog(
        user_email=current_user.email,
        user_role=current_user.role,
        action="SUBMIT_FEEDBACK",
        details=f"Feedback: {fb_in.subject} | Rating: {fb_in.rating}/5"
    )
    db.add(log)
    db.commit()
    db.refresh(feedback)
    return feedback

@router.get("", response_model=List[FeedbackResponse])
def get_all_feedback(
    current_user: User = Depends(require_role([UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    """Admin-only: View all submitted feedback."""
    return db.query(Feedback).order_by(Feedback.created_at.desc()).all()

@router.put("/{fb_id}/close", response_model=FeedbackResponse)
def close_feedback(
    fb_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    """Admin-only: Mark feedback as resolved/closed."""
    fb = db.query(Feedback).filter(Feedback.id == fb_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    fb.status = "Closed"
    
    # Audit log for status change
    log = AuditLog(
        user_email=current_user.email,
        user_role=current_user.role,
        action="CLOSE_FEEDBACK",
        details=f"Closed feedback #{fb.id} ('{fb.subject}') submitted by {fb.user_email}"
    )
    db.add(log)
    db.commit()
    db.refresh(fb)
    return fb

@router.delete("/{fb_id}", status_code=status.HTTP_200_OK)
def delete_feedback(
    fb_id: int,
    current_user: User = Depends(require_role([UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    """Admin-only: Delete a feedback entry."""
    fb = db.query(Feedback).filter(Feedback.id == fb_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    
    db.delete(fb)
    
    log = AuditLog(
        user_email=current_user.email,
        user_role=current_user.role,
        action="DELETE_FEEDBACK",
        details=f"Deleted feedback #{fb_id}"
    )
    db.add(log)
    db.commit()
    return {"message": f"Feedback #{fb_id} deleted successfully"}
