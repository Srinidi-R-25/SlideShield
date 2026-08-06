export type UserRole = 'Citizen' | 'Government Officer' | 'Admin';
export type ReportStatus = 'Pending' | 'Verified' | 'Rejected' | 'Resolved';
export type AlertSeverity = 'Critical' | 'Warning' | 'Information';
export type SOSStatus = 'Active' | 'Responded' | 'Resolved' | 'Cancelled';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  district?: string;
  state?: string;
  avatar_url?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface HazardReport {
  id: number;
  title: string;
  description: string;
  category: string;
  location_name: string;
  latitude: number;
  longitude: number;
  image_url?: string;
  video_url?: string;
  status: ReportStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  ai_detected_hazard?: string;
  confidence_score?: number;
  ai_summary?: string;
  government_remarks?: string;
  assigned_team?: string;
  reporter_id: number;
  reporter_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: number;
  title: string;
  description: string;
  severity: AlertSeverity;
  affected_area: string;
  latitude?: number;
  longitude?: number;
  radius_km: number;
  expiry_date?: string;
  is_active: boolean;
  created_by_id: number;
  created_at: string;
}

export interface RiskPrediction {
  district_name: string;
  rainfall_mm: number;
  slope_deg: number;
  soil_type: string;
  risk_level: 'Low' | 'Medium' | 'High' | 'Very High';
  risk_score: number;
  reasons: string[];
  recommendations: string[];
}

export interface SOSRequest {
  id: number;
  user_id: number;
  user_name?: string;
  user_phone?: string;
  latitude: number;
  longitude: number;
  location_address?: string;
  emergency_type: string;
  status: SOSStatus;
  responder_notes?: string;
  created_at: string;
}

export interface Shelter {
  id: number;
  name: string;
  address: string;
  district: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  contact_phone: string;
  medical_support: boolean;
  supplies_status: string;
  is_open: boolean;
}

export interface AuditLog {
  id: number;
  user_email: string;
  user_role: string;
  action: string;
  details?: string;
  ip_address: string;
  timestamp: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  notification_type: 'Critical' | 'Alert' | 'Info' | 'SOS';
  is_read: boolean;
  created_at: string;
}

export interface Feedback {
  id: number;
  user_email: string;
  subject: string;
  message: string;
  rating: number;
  status: string;
  created_at: string;
}
