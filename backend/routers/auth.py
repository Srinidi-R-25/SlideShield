from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import User, UserRole, AuditLog
from backend.schemas import UserRegister, UserLogin, Token, UserProfile, UserUpdate, PasswordChange
from backend.auth import get_password_hash, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    
    hashed_pwd = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        role=user_in.role,
        phone=user_in.phone,
        address=user_in.address,
        emergency_contact_name=user_in.emergency_contact_name,
        emergency_contact_phone=user_in.emergency_contact_phone,
        district=user_in.district or "Wayanad",
        state=user_in.state or "Kerala",
        avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_in.full_name.replace(' ', '')}"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log audit
    log = AuditLog(user_email=user.email, user_role=user.role, action="USER_REGISTER", details=f"Registered account as {user.role}")
    db.add(log)
    db.commit()

    return user

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is deactivated")

    access_token = create_access_token(data={"sub": user.email, "role": user.role, "user_id": user.id})

    # Audit log
    log = AuditLog(user_email=user.email, user_role=user.role, action="USER_LOGIN", details="Logged in successfully")
    db.add(log)
    db.commit()

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "full_name": user.full_name,
        "email": user.email
    }

@router.get("/me", response_model=UserProfile)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/profile", response_model=UserProfile)
def update_profile(profile_in: UserUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.phone is not None:
        current_user.phone = profile_in.phone
    if profile_in.address is not None:
        current_user.address = profile_in.address
    if profile_in.emergency_contact_name is not None:
        current_user.emergency_contact_name = profile_in.emergency_contact_name
    if profile_in.emergency_contact_phone is not None:
        current_user.emergency_contact_phone = profile_in.emergency_contact_phone
    if profile_in.district is not None:
        current_user.district = profile_in.district
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.put("/change-password")
def change_password(
    pwd_in: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change password after verifying the current password."""
    if not verify_password(pwd_in.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    current_user.hashed_password = get_password_hash(pwd_in.new_password)
    db.commit()

    log = AuditLog(
        user_email=current_user.email,
        user_role=current_user.role,
        action="CHANGE_PASSWORD",
        details="Password changed successfully"
    )
    db.add(log)
    db.commit()
    return {"message": "Password changed successfully"}
