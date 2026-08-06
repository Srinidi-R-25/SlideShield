from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.models import Shelter, User, UserRole, AuditLog
from backend.schemas import ShelterCreate, ShelterResponse
from backend.auth import get_current_user, require_role

router = APIRouter(prefix="/shelters", tags=["Safe Shelters"])

@router.get("", response_model=List[ShelterResponse])
def get_shelters(db: Session = Depends(get_db)):
    shelters = db.query(Shelter).filter(Shelter.is_open == True).all()
    return shelters

@router.post("", response_model=ShelterResponse, status_code=status.HTTP_201_CREATED)
def create_shelter(
    shelter_in: ShelterCreate,
    current_user: User = Depends(require_role([UserRole.GOVERNMENT.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    shelter = Shelter(
        name=shelter_in.name,
        address=shelter_in.address,
        district=shelter_in.district,
        latitude=shelter_in.latitude,
        longitude=shelter_in.longitude,
        capacity=shelter_in.capacity,
        current_occupancy=shelter_in.current_occupancy,
        contact_phone=shelter_in.contact_phone,
        medical_support=shelter_in.medical_support,
        supplies_status=shelter_in.supplies_status,
        is_open=True
    )
    db.add(shelter)
    db.commit()
    db.refresh(shelter)
    return shelter

@router.put("/{shelter_id}/occupancy")
def update_shelter_occupancy(
    shelter_id: int,
    new_occupancy: int,
    current_user: User = Depends(require_role([UserRole.GOVERNMENT.value, UserRole.ADMIN.value])),
    db: Session = Depends(get_db)
):
    """Update current occupancy of a shelter."""
    shelter = db.query(Shelter).filter(Shelter.id == shelter_id).first()
    if not shelter:
        raise HTTPException(status_code=404, detail="Shelter not found")
    shelter.current_occupancy = max(0, min(new_occupancy, shelter.capacity))
    db.commit()
    return {"message": f"Occupancy updated to {shelter.current_occupancy}"}
