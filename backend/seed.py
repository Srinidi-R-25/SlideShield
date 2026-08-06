from backend.database import SessionLocal, engine, Base
from backend.models import User, UserRole, HazardReport, ReportStatus, Alert, AlertSeverity, SOSRequest, SOSStatus, Shelter, RiskPrediction, Notification, AuditLog, PlatformSettings
from backend.auth import get_password_hash

def seed_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already seeded!")
        db.close()
        return

    print("Seeding SlideShield Database...")

    # 1. Users (Citizen, Officer, Admin)
    citizen = User(
        email="citizen@slideshield.org",
        hashed_password=get_password_hash("citizen123"),
        full_name="Rajesh Kumar",
        role=UserRole.CITIZEN.value,
        phone="+91 98470 11223",
        address="House No. 42, Hilltop Estate, Meppadi",
        emergency_contact_name="Sunitha Kumar",
        emergency_contact_phone="+91 98470 99887",
        district="Wayanad",
        state="Kerala",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    )

    officer = User(
        email="officer@slideshield.org",
        hashed_password=get_password_hash("officer123"),
        full_name="Dr. Anita Nair (Disaster Management Collector)",
        role=UserRole.GOVERNMENT.value,
        phone="+91 94470 55443",
        address="District Disaster Command Center, Kalpetta",
        emergency_contact_name="Control Room",
        emergency_contact_phone="+91 4936 204100",
        district="Wayanad",
        state="Kerala",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
    )

    admin = User(
        email="admin@slideshield.org",
        hashed_password=get_password_hash("admin123"),
        full_name="System Administrator",
        role=UserRole.ADMIN.value,
        phone="+91 98950 00112",
        address="State HQ Data Center, Thiruvananthapuram",
        district="Statewide",
        state="Kerala",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
    )

    db.add_all([citizen, officer, admin])
    db.commit()
    db.refresh(citizen)
    db.refresh(officer)
    db.refresh(admin)

    # 2. Hazard Reports
    r1 = HazardReport(
        title="Fissure widening & soil slumping at Meppadi Hillside",
        description="Deep ground cracks (4-6 inches wide) observed along the upper coffee plantation slope after 48 hours of continuous heavy rainfall. Muddy water seepage visible at slope toe.",
        category="Landslide Risk",
        location_name="Meppadi Plantation Road, Sector 3, Wayanad",
        latitude=11.5540,
        longitude=76.1260,
        image_url="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80",
        status=ReportStatus.VERIFIED.value,
        priority="Critical",
        ai_detected_hazard="Active Landslide & Slope Failure",
        confidence_score=95.4,
        ai_summary="• High slope failure probability detected due to severe ground fissures and soil saturation.\n• Immediate evacuation recommended for 50 downhill households.",
        government_remarks="NDRF Unit 4 dispatched for immediate evacuation perimeter establishment.",
        assigned_team="NDRF Alpha Team 4",
        reporter_id=citizen.id
    )

    r2 = HazardReport(
        title="Rockfall and boulder displacement blocking Chooralmala Pass",
        description="Multiple granite boulders (1.5m diameter) fell across the main transit road following overnight thunderstorm. Road completely blocked for heavy vehicles.",
        category="Rockfall",
        location_name="Chooralmala Main Pass, Wayanad",
        latitude=11.5420,
        longitude=76.1400,
        image_url="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop&q=80",
        status=ReportStatus.PENDING.value,
        priority="High",
        ai_detected_hazard="Rockfall Hazard",
        confidence_score=91.2,
        ai_summary="• Unstable granite boulders obstructing primary transit route.\n• High risk of secondary rockfall during ongoing precipitation.",
        reporter_id=citizen.id
    )

    r3 = HazardReport(
        title="Torrential riverbank erosion threatening bridge abutment",
        description="Iruvaizhini river overflow causing aggressive bank scouring near the south bridge foundation pillar.",
        category="Soil Erosion",
        location_name="Mundakkai River Bank, Wayanad",
        latitude=11.5310,
        longitude=76.1550,
        image_url="https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&auto=format&fit=crop&q=80",
        status=ReportStatus.RESOLVED.value,
        priority="Medium",
        ai_detected_hazard="Riverbank Scouring & Erosion",
        confidence_score=87.5,
        ai_summary="• Riverbank structural erosion verified. Riprap gabion reinforcements installed by PWD engineers.",
        government_remarks="PWD team completed sandbag barrier and gabion rock reinforcement.",
        assigned_team="PWD Emergency Response Unit",
        reporter_id=citizen.id
    )

    db.add_all([r1, r2, r3])

    # 3. Alerts
    a1 = Alert(
        title="RED ALERT: Extreme Landslide Warning for Meppadi & Chooralmala",
        description="Torrential rainfall exceeding 240mm in 24 hours. Immediate evacuation ordered for residents residing within 500m of steep hillside slopes.",
        severity=AlertSeverity.CRITICAL.value,
        affected_area="Meppadi, Chooralmala, Mundakkai sectors",
        latitude=11.5480,
        longitude=76.1350,
        radius_km=15.0,
        expiry_date="2026-08-10",
        is_active=True,
        created_by_id=officer.id
    )

    a2 = Alert(
        title="ORANGE ALERT: Heavy Precipitation & Flash Flood Caution",
        description="Continuous heavy rain predicted across Idukki & Wayanad hill passes over the next 48 hours. Avoid non-essential mountain travel.",
        severity=AlertSeverity.WARNING.value,
        affected_area="High Range Districts (Wayanad, Idukki, Munnar)",
        latitude=11.6000,
        longitude=76.2000,
        radius_km=40.0,
        expiry_date="2026-08-12",
        is_active=True,
        created_by_id=officer.id
    )

    db.add_all([a1, a2])

    # 4. Shelters
    s1 = Shelter(
        name="Wayanad Central Disaster Relief Camp",
        address="St. Mary's School Complex, Kalpetta",
        district="Wayanad",
        latitude=11.6080,
        longitude=76.0830,
        capacity=600,
        current_occupancy=145,
        contact_phone="+91 94470 12345",
        medical_support=True,
        supplies_status="Adequate",
        is_open=True
    )

    s2 = Shelter(
        name="Meppadi Community Evacuation Hub",
        address="Town Hall Road, Meppadi",
        district="Wayanad",
        latitude=11.5510,
        longitude=76.1210,
        capacity=450,
        current_occupancy=210,
        contact_phone="+91 94470 67890",
        medical_support=True,
        supplies_status="Adequate",
        is_open=True
    )

    s3 = Shelter(
        name="Vellarmala Higher Secondary Relief Center",
        address="Vellarmala High School, Chooralmala",
        district="Wayanad",
        latitude=11.5380,
        longitude=76.1450,
        capacity=300,
        current_occupancy=85,
        contact_phone="+91 94470 11223",
        medical_support=True,
        supplies_status="Adequate",
        is_open=True
    )

    db.add_all([s1, s2, s3])

    # 5. Risk Predictions
    p1 = RiskPrediction(
        district_name="Wayanad",
        rainfall_mm=210.5,
        slope_deg=42.0,
        soil_type="Clay",
        historical_incidents=4,
        risk_level="Very High",
        risk_score=92.4,
        reasons="Rainfall of 210.5mm exceeds clay saturation threshold. Steep 42° slope angle with historical failure record.",
        recommendations="Deploy emergency buses, activate red alert warning, mobilize NDRF units."
    )

    p2 = RiskPrediction(
        district_name="Idukki",
        rainfall_mm=175.0,
        slope_deg=38.0,
        soil_type="Silt",
        historical_incidents=3,
        risk_level="High",
        risk_score=78.2,
        reasons="Silt soil erosion vulnerability with heavy monsoon runoff.",
        recommendations="Monitor mountain highways, restrict night travel along hill passes."
    )

    db.add_all([p1, p2])

    # 6. SOS Request
    sos1 = SOSRequest(
        user_id=citizen.id,
        latitude=11.5545,
        longitude=76.1265,
        location_address="Near Meppadi Coffee Estate House #42",
        emergency_type="Hillside Soil Failure",
        status=SOSStatus.ACTIVE.value,
        responder_notes="Rescue Team Bravo dispatched with 2 ambulances."
    )

    db.add(sos1)

    # 7. Notifications
    n1 = Notification(
        user_id=citizen.id,
        title="🚨 RED ALERT Warning Issued",
        message="Critical Landslide warning active in your sector. Stay on alert.",
        notification_type="Critical"
    )
    db.add(n1)

    # Audit log
    log = AuditLog(
        user_email="system@slideshield.org",
        user_role="System",
        action="SEED_DATABASE",
        details="Initial platform data seeded successfully."
    )
    db.add(log)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_db()
