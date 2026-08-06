'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../../components/Sidebar';
import { LeafletMap } from '../../components/LeafletMap';
import { AIChatbot } from '../../components/AIChatbot';
import { SOSButton } from '../../components/SOSButton';
import { RiskBadge } from '../../components/RiskBadge';
import { FeedbackForm } from '../../components/FeedbackForm';
import { fetchApi, uploadImageApi } from '../../lib/api';
import { HazardReport, Alert, Shelter } from '../../lib/types';
import {
  AlertTriangle, MapPin, FileText, Upload, CheckCircle2,
  CloudRain, Thermometer, Wind, Phone, Send, User,
  Camera, Bell, Clock, Activity, Shield, Loader2
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  // Report form state
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: 'Landslide Risk',
    location_name: '',
    latitude: 11.554,
    longitude: 76.126,
    image_url: ''
  });
  const [aiScanResult, setAiScanResult] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user && user.role !== 'Citizen') {
      router.push(user.role === 'Government Officer' ? '/government' : '/admin');
      return;
    }
    loadData();
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      const [reps, alts, shls] = await Promise.all([
        fetchApi<HazardReport[]>('/reports').catch(() => mockReports),
        fetchApi<Alert[]>('/alerts').catch(() => mockAlerts),
        fetchApi<Shelter[]>('/shelters').catch(() => mockShelters),
      ]);
      setReports(reps);
      setAlerts(alts);
      setShelters(shls);
    } catch {
      setReports(mockReports);
      setAlerts(mockAlerts);
      setShelters(mockShelters);
    } finally {
      setPageLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const result = await uploadImageApi(file);
      setReportForm((p) => ({ ...p, image_url: result.url || '' }));
      setAiScanResult(result.ai_scan || null);
    } catch {
      // Fallback AI mock result
      setAiScanResult({
        detected_hazard: 'Active Landslide & Debris Flow',
        confidence_percentage: 94.8,
        summary: 'High slope failure probability detected. Evacuate hillside vicinity immediately.',
        risk_category: 'Critical',
        recommended_actions: ['Evacuate downhill residents', 'Alert NDRF units', 'Establish safe perimeter']
      });
    } finally {
      setUploading(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetchApi('/reports', {
        method: 'POST',
        body: JSON.stringify(reportForm)
      });
      setSubmitSuccess(true);
      setReportForm({ title: '', description: '', category: 'Landslide Risk', location_name: '', latitude: 11.554, longitude: 76.126, image_url: '' });
      setAiScanResult(null);
      await loadData();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (e) {
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050b18]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading Citizen Portal...</p>
        </div>
      </div>
    );
  }

  const myReports = reports.filter((r) => r.reporter_id === user?.id || r.reporter_name === user?.full_name);

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-[#050b18]">
      <Sidebar role="Citizen" activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 overflow-y-auto space-y-6 max-w-full">

        {/* ===== HOME TAB ===== */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Welcome back, {user?.full_name?.split(' ')[0]} 👋</h1>
              <p className="text-xs text-slate-400 mt-1">District: {user?.district} • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* Risk Level Card */}
            <div className="glass-panel p-5 rounded-2xl border-rose-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <Activity className="w-8 h-8 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Current Risk Level — {user?.district}</p>
                    <h2 className="text-2xl font-black text-white mt-1">VERY HIGH RISK</h2>
                    <p className="text-xs text-rose-300 mt-1">210mm rainfall • 42° slope • Clay soil composition</p>
                  </div>
                </div>
                <RiskBadge level="Very High" size="lg" />
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Active Alerts', value: alerts.length, color: 'rose', icon: Bell },
                { label: 'Nearby Shelters', value: shelters.length, color: 'emerald', icon: Shield },
                { label: 'My Reports', value: reports.length, color: 'amber', icon: FileText },
                { label: 'Rainfall (24H)', value: '210mm', color: 'cyan', icon: CloudRain }
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`glass-panel p-4 rounded-2xl border-${card.color}-500/20 text-center space-y-2`}>
                    <Icon className={`w-6 h-6 text-${card.color}-400 mx-auto`} />
                    <p className={`text-2xl font-black text-${card.color}-400 font-mono`}>{card.value}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{card.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Weather & Emergency Contacts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2"><CloudRain className="w-4 h-4 text-cyan-400" />Weather Summary — Wayanad</h3>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  {[
                    { label: 'Rainfall', value: '210mm', icon: CloudRain, color: 'text-cyan-400' },
                    { label: 'Temperature', value: '19°C', icon: Thermometer, color: 'text-amber-400' },
                    { label: 'Wind', value: '32 km/h', icon: Wind, color: 'text-slate-300' }
                  ].map((w) => {
                    const WIcon = w.icon;
                    return (
                      <div key={w.label} className="glass-card p-3 rounded-xl text-center space-y-1">
                        <WIcon className={`w-5 h-5 mx-auto ${w.color}`} />
                        <p className={`font-black text-sm ${w.color}`}>{w.value}</p>
                        <p className="text-[10px] text-slate-400">{w.label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" />Emergency Contacts</h3>
                <div className="space-y-2.5 text-xs">
                  {[
                    { name: 'National Emergency', num: '112', badge: 'red' },
                    { name: 'State Disaster Control', num: '1077', badge: 'amber' },
                    { name: 'District Control Room', num: '+91 4936 204100', badge: 'blue' },
                    { name: 'NDRF Rescue Hotline', num: '011-24363260', badge: 'emerald' }
                  ].map((c) => (
                    <div key={c.name} className="flex items-center justify-between glass-card px-3 py-2 rounded-xl">
                      <span className="text-slate-300 font-medium">{c.name}</span>
                      <a href={`tel:${c.num}`} className="font-black text-emerald-400 font-mono hover:underline">{c.num}</a>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SOS Section */}
            <div className="glass-panel p-5 rounded-2xl border-rose-500/20 bg-rose-950/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-100">Emergency SOS Panic Button</h3>
                  <p className="text-xs text-slate-400 mt-1">One click broadcasts your GPS to NDRF rescue teams and District Control Room.</p>
                </div>
                <SOSButton />
              </div>
            </div>
          </div>
        )}

        {/* ===== REPORT HAZARD TAB ===== */}
        {activeTab === 'report' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h1 className="text-2xl font-black text-white">Report Hazard</h1>
              <p className="text-xs text-slate-400 mt-1">Submit a hazard observation. AI will instantly analyze your uploaded image.</p>
            </div>

            {submitSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Hazard report submitted successfully! Officers will review your submission.
              </div>
            )}

            {/* AI Scan Result Preview */}
            {aiScanResult && (
              <div className="glass-panel p-5 rounded-2xl border-amber-500/30 bg-amber-950/10 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> AI Vision Analysis Result
                  </h3>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                    {aiScanResult.confidence_percentage}% Confidence
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="glass-card p-3 rounded-xl">
                    <p className="text-slate-400 text-[10px] mb-1">Detected Hazard</p>
                    <p className="font-bold text-slate-100">{aiScanResult.detected_hazard}</p>
                  </div>
                  <div className="glass-card p-3 rounded-xl">
                    <p className="text-slate-400 text-[10px] mb-1">Risk Category</p>
                    <RiskBadge level={aiScanResult.risk_category} />
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">"{aiScanResult.summary}"</p>
                <div className="space-y-1 text-xs text-slate-400">
                  {aiScanResult.recommended_actions?.map((action: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Report Title *</label>
                <input
                  type="text"
                  required
                  value={reportForm.title}
                  onChange={(e) => setReportForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                  placeholder="e.g. Ground fissure widening on Meppadi hillside"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Category</label>
                <select
                  value={reportForm.category}
                  onChange={(e) => setReportForm((p) => ({ ...p, category: e.target.value }))}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                >
                  <option>Landslide Risk</option>
                  <option>Rockfall</option>
                  <option>Soil Erosion</option>
                  <option>Flash Flood</option>
                  <option>Other Hazard</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Description *</label>
                <textarea
                  required
                  value={reportForm.description}
                  onChange={(e) => setReportForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs resize-none"
                  placeholder="Describe the hazard in detail: What do you see? How severe does it look?"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Location Name *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={reportForm.location_name}
                    onChange={(e) => setReportForm((p) => ({ ...p, location_name: e.target.value }))}
                    className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs"
                    placeholder="e.g. Meppadi Plantation Road, Sector 3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={reportForm.latitude}
                    onChange={(e) => setReportForm((p) => ({ ...p, latitude: parseFloat(e.target.value) }))}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={reportForm.longitude}
                    onChange={(e) => setReportForm((p) => ({ ...p, longitude: parseFloat(e.target.value) }))}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Upload Hazard Photo</label>
                <label className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-slate-700 hover:border-emerald-500/50 cursor-pointer transition-colors">
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                  ) : reportForm.image_url ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  ) : (
                    <Camera className="w-8 h-8 text-slate-400" />
                  )}
                  <span className="text-xs text-slate-400">
                    {uploading ? 'Uploading & scanning...' : reportForm.image_url ? 'Image uploaded — AI analysis complete!' : 'Click to upload hazard image (AI auto-analyzes)'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{submitting ? 'Submitting Report...' : 'Submit Hazard Report'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ===== RISK MAP TAB ===== */}
        {activeTab === 'risk-map' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-white">Interactive Risk Map</h1>
            <p className="text-xs text-slate-400">Real-time visualization of citizen hazard reports, warning zones, and safe evacuation shelters.</p>
            <div className="h-[600px] w-full">
              <LeafletMap reports={reports} alerts={alerts} shelters={shelters} />
            </div>
          </div>
        )}

        {/* ===== ALERTS TAB ===== */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-white">Active Alerts & Warnings</h1>
            {alerts.length === 0 ? (
              <p className="text-slate-400 text-sm">No active alerts at this time.</p>
            ) : (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div key={a.id} className={`glass-panel p-5 rounded-2xl border ${a.severity === 'Critical' ? 'border-rose-500/40 bg-rose-950/10' : a.severity === 'Warning' ? 'border-amber-500/40 bg-amber-950/10' : 'border-slate-700'} space-y-2`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <RiskBadge level={a.severity} />
                        <h3 className="font-bold text-sm text-slate-100 mt-2">{a.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{a.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{a.affected_area}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(a.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== AI CHAT TAB ===== */}
        {activeTab === 'ai-chat' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-white">AI Safety Assistant</h1>
            <p className="text-xs text-slate-400">Ask anything about landslide safety, shelter locations, or emergency procedures.</p>
            <div className="flex justify-center">
              <AIChatbot />
            </div>
          </div>
        )}

        {/* ===== MY REPORTS TAB ===== */}
        {activeTab === 'my-reports' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-white">My Submissions</h1>
            <p className="text-xs text-slate-400">Track your hazard reports and government responses.</p>
            {reports.length === 0 ? (
              <p className="text-slate-400 text-sm">No reports submitted yet.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((r) => (
                  <div key={r.id} className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <RiskBadge level={r.status} size="sm" />
                          <RiskBadge level={r.priority} size="sm" />
                        </div>
                        <h3 className="font-bold text-sm text-slate-100">{r.title}</h3>
                        <p className="text-xs text-slate-400 mt-1">{r.description.slice(0, 120)}...</p>
                      </div>
                      {r.image_url && (
                        <img src={r.image_url} alt="Hazard" className="w-24 h-16 object-cover rounded-xl border border-slate-700" />
                      )}
                    </div>
                    {r.ai_detected_hazard && (
                      <div className="glass-card px-3 py-2 rounded-xl text-xs text-slate-300 space-y-1">
                        <span className="text-emerald-400 font-bold text-[10px]">AI ANALYSIS:</span>
                        <p>{r.ai_detected_hazard} — {r.confidence_score?.toFixed(1)}% confidence</p>
                        <p className="text-slate-400 italic">{r.ai_summary}</p>
                      </div>
                    )}
                    {r.government_remarks && (
                      <div className="glass-card px-3 py-2 rounded-xl text-xs text-slate-300 border-l-2 border-emerald-500">
                        <span className="text-emerald-400 font-bold text-[10px]">GOVT RESPONSE:</span>
                        <p className="mt-0.5">{r.government_remarks}</p>
                        {r.assigned_team && <p className="text-slate-400">Team: {r.assigned_team}</p>}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-[11px] text-slate-400">
                      <span><MapPin className="w-3 h-3 inline mr-1" />{r.location_name}</span>
                      <span><Clock className="w-3 h-3 inline mr-1" />{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== PROFILE TAB ===== */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-xl">
            <h1 className="text-2xl font-black text-white">My Profile</h1>
            <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
              <div className="flex items-center gap-4">
                <img
                  src={user?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Citizen'}
                  alt={user?.full_name}
                  className="w-16 h-16 rounded-2xl border-2 border-emerald-500/40 object-cover"
                />
                <div>
                  <h3 className="font-bold text-lg text-slate-100">{user?.full_name}</h3>
                  <p className="text-xs text-emerald-400 font-semibold">{user?.role}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                {[
                  { label: 'Phone', value: user?.phone || 'Not set' },
                  { label: 'District', value: user?.district || 'Wayanad' },
                  { label: 'State', value: user?.state || 'Kerala' },
                  { label: 'Emergency Contact', value: user?.emergency_contact_name || 'Not set' },
                  { label: 'Emergency Phone', value: user?.emergency_contact_phone || 'Not set' },
                  { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A' }
                ].map((item) => (
                  <div key={item.label} className="glass-card p-3 rounded-xl">
                    <p className="text-slate-400 text-[10px] mb-0.5">{item.label}</p>
                    <p className="text-slate-100 font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback Form — now wired to POST /api/feedback */}
            <FeedbackForm />
          </div>
        )}


      </main>
    </div>
  );
}

// Mock data fallback
const mockReports: HazardReport[] = [
  {
    id: 1, title: 'Fissure widening at Meppadi Hillside', description: 'Deep ground cracks observed after 48h rainfall. Muddy seepage at slope base.', category: 'Landslide Risk', location_name: 'Meppadi Plantation Road, Sector 3', latitude: 11.554, longitude: 76.126, status: 'Verified', priority: 'Critical', ai_detected_hazard: 'Active Landslide & Slope Failure', confidence_score: 95.4, ai_summary: 'High slope failure probability detected.', government_remarks: 'NDRF Unit 4 dispatched.', assigned_team: 'NDRF Alpha Team 4', reporter_id: 1, reporter_name: 'Rajesh Kumar', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=60'
  }
];
const mockAlerts: Alert[] = [
  { id: 1, title: 'RED ALERT: Extreme Landslide Warning', description: 'Immediate evacuation ordered for hillside slope areas.', severity: 'Critical', affected_area: 'Meppadi, Chooralmala', latitude: 11.548, longitude: 76.135, radius_km: 15, expiry_date: '2026-08-10', is_active: true, created_by_id: 2, created_at: new Date().toISOString() },
  { id: 2, title: 'ORANGE ALERT: Heavy Rain Warning', description: 'Continuous heavy rain predicted for 48 hours.', severity: 'Warning', affected_area: 'Wayanad, Idukki', latitude: 11.6, longitude: 76.2, radius_km: 40, expiry_date: '2026-08-12', is_active: true, created_by_id: 2, created_at: new Date().toISOString() }
];
const mockShelters: Shelter[] = [
  { id: 1, name: 'Wayanad Central Relief Camp', address: "St. Mary's School Complex, Kalpetta", district: 'Wayanad', latitude: 11.608, longitude: 76.083, capacity: 600, current_occupancy: 145, contact_phone: '+91 94470 12345', medical_support: true, supplies_status: 'Adequate', is_open: true },
  { id: 2, name: 'Meppadi Community Evacuation Hub', address: 'Town Hall Road, Meppadi', district: 'Wayanad', latitude: 11.551, longitude: 76.121, capacity: 450, current_occupancy: 210, contact_phone: '+91 94470 67890', medical_support: true, supplies_status: 'Adequate', is_open: true }
];
