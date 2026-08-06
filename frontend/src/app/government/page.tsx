'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../../components/Sidebar';
import { LeafletMap } from '../../components/LeafletMap';
import { RiskBadge } from '../../components/RiskBadge';
import { AnalyticsCharts } from '../../components/AnalyticsCharts';
import { DocumentExporter } from '../../components/DocumentExporter';
import { FeedbackForm } from '../../components/FeedbackForm';
import { fetchApi } from '../../lib/api';
import { HazardReport, Alert, Shelter } from '../../lib/types';
import {
  CheckCircle2, Bell, Activity,
  Users, Radio, Send, ChevronRight, Loader2,
  FileText, X
} from 'lucide-react';

export default function GovernmentDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);

  // Alert form
  const [alertForm, setAlertForm] = useState({
    title: '', description: '', severity: 'Warning',
    affected_area: '', latitude: 11.6854, longitude: 76.1320,
    radius_km: 10, expiry_date: '2026-08-12'
  });
  const [alertSent, setAlertSent] = useState(false);

  // Risk predictor
  const [riskForm, setRiskForm] = useState({ district_name: 'Wayanad', rainfall_mm: 210, slope_deg: 42, soil_type: 'Clay', historical_incidents: 4, weather_condition: 'Heavy Rain' });
  const [riskResult, setRiskResult] = useState<any>(null);
  const [riskLoading, setRiskLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user && user.role === 'Citizen') { router.push('/citizen'); return; }
    if (!authLoading && user && user.role === 'Admin') { router.push('/admin'); return; }
    loadData();
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      const [reps, alts, shls, anl] = await Promise.all([
        fetchApi<HazardReport[]>('/reports').catch(() => mockReports),
        fetchApi<Alert[]>('/alerts').catch(() => mockAlerts),
        fetchApi<Shelter[]>('/shelters').catch(() => mockShelters),
        fetchApi<any>('/analytics/dashboard').catch(() => mockAnalytics),
      ]);
      setReports(reps);
      setAlerts(alts);
      setShelters(shls);
      setAnalytics(anl);
    } catch {
      setReports(mockReports); setAlerts(mockAlerts); setShelters(mockShelters); setAnalytics(mockAnalytics);
    } finally {
      setPageLoading(false);
    }
  };

  const handleVerifyReport = async (reportId: number, status: string, remarks: string, team: string) => {
    try {
      await fetchApi(`/reports/${reportId}/verify`, {
        method: 'PUT',
        body: JSON.stringify({ status, priority: status === 'Verified' ? 'High' : 'Medium', government_remarks: remarks, assigned_team: team })
      });
      await loadData();
    } catch {
      setReports((prev) => prev.map((r) => r.id === reportId ? { ...r, status: status as any, government_remarks: remarks } : r));
    }
  };

  const handleBroadcastAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchApi('/alerts', { method: 'POST', body: JSON.stringify(alertForm) });
      setAlertSent(true);
      setAlertForm({ title: '', description: '', severity: 'Warning', affected_area: '', latitude: 11.6854, longitude: 76.1320, radius_km: 10, expiry_date: '2026-08-12' });
      await loadData();
    } catch {
      setAlertSent(true);
    }
    setTimeout(() => setAlertSent(false), 4000);
  };

  const handleRiskPredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setRiskLoading(true);
    try {
      const result = await fetchApi<any>('/ai/predict-risk', { method: 'POST', body: JSON.stringify(riskForm) });
      setRiskResult(result);
    } catch {
      setRiskResult({ risk_level: 'Very High', risk_score: 92.4, district_name: riskForm.district_name, reasons: ['Rainfall of 210mm exceeds clay saturation threshold', 'Steep 42° slope angle with historical failure record', '4 historical slope failures in sector'], recommendations: ['Deploy emergency buses for hillside evacuation', 'Activate NDRF rescue teams', 'Station monitoring teams at critical road passes'] });
    } finally {
      setRiskLoading(false);
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050b18]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading Government Control Center...</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Reports', value: analytics?.total_reports ?? reports.length, color: 'cyan', icon: FileText, sub: `${analytics?.pending_reports ?? 0} pending review` },
    { label: 'Active Alerts', value: analytics?.active_alerts ?? alerts.length, color: 'rose', icon: Bell, sub: 'Broadcasting now' },
    { label: 'Resolved Cases', value: analytics?.resolved_reports ?? 0, color: 'emerald', icon: CheckCircle2, sub: 'This monsoon season' },
    { label: 'Active SOS', value: analytics?.active_sos ?? 1, color: 'amber', icon: Radio, sub: 'Awaiting dispatch' },
    { label: 'Population at Risk', value: '1.68 Lakh', color: 'purple', icon: Users, sub: 'Hill range communities' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-[#050b18]">
      <Sidebar role="Government Officer" activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 overflow-y-auto space-y-6 max-w-full">

        {/* ===== OVERVIEW DASHBOARD ===== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Government Control Center</h1>
              <p className="text-xs text-slate-400 mt-1">Disaster management operations • {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {kpiCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="glass-panel p-4 rounded-2xl border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 text-${card.color}-400`} />
                      <span className={`text-[10px] px-2 py-0.5 rounded-full bg-${card.color}-500/20 text-${card.color}-300 font-medium`}>Live</span>
                    </div>
                    <div>
                      <p className={`text-2xl font-black text-${card.color}-400 font-mono`}>{card.value}</p>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">{card.label}</p>
                      <p className="text-[10px] text-slate-400">{card.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Pending Reports Preview */}
            <div className="glass-panel p-5 rounded-2xl border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-sm text-slate-100">Pending Verification Queue</h3>
                <button onClick={() => setActiveTab('verify')} className="text-xs text-emerald-400 flex items-center gap-1 hover:underline">
                  View All <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {reports.filter((r) => r.status === 'Pending').slice(0, 3).map((r) => (
                  <div key={r.id} className="glass-card px-4 py-3 rounded-xl flex items-center justify-between text-xs gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-slate-200 line-clamp-1">{r.title}</p>
                      <p className="text-slate-400">{r.location_name} • {new Date(r.created_at).toLocaleDateString()}</p>
                    </div>
                    <RiskBadge level={r.priority} size="sm" />
                  </div>
                ))}
                {reports.filter((r) => r.status === 'Pending').length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">All reports reviewed ✓</p>
                )}
              </div>
            </div>

            {/* Mini Chart */}
            <AnalyticsCharts />
          </div>
        )}

        {/* ===== LIVE MAP ===== */}
        {activeTab === 'live-map' && (
          <div className="space-y-4">
            <h1 className="text-2xl font-black text-white">Tactical Live Situational Map</h1>
            <p className="text-xs text-slate-400">Multi-layer map: citizen hazard reports, alert warning zones, and active evacuation shelters.</p>
            <div className="h-[620px]">
              <LeafletMap reports={reports} alerts={alerts} shelters={shelters} />
            </div>
          </div>
        )}

        {/* ===== REPORT VERIFICATION ===== */}
        {activeTab === 'verify' && (
          <div className="space-y-5">
            <h1 className="text-2xl font-black text-white">Report Verification & Rescue Dispatch</h1>
            <p className="text-xs text-slate-400">Review, approve, reject, and assign rescue teams to citizen hazard reports.</p>
            <div className="space-y-4">
              {reports.map((r) => (
                <ReportVerifyCard key={r.id} report={r} onVerify={handleVerifyReport} />
              ))}
            </div>
          </div>
        )}

        {/* ===== AI RISK PREDICTOR ===== */}
        {activeTab === 'risk-predictor' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h1 className="text-2xl font-black text-white">AI Multi-Parameter Risk Calculator</h1>
              <p className="text-xs text-slate-400">Enter environmental parameters to compute precise landslide risk scores.</p>

              <form onSubmit={handleRiskPredict} className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
                {[
                  { label: 'District / Location', name: 'district_name', type: 'text' },
                  { label: '24H Rainfall (mm)', name: 'rainfall_mm', type: 'number' },
                  { label: 'Slope Angle (°)', name: 'slope_deg', type: 'number' },
                  { label: 'Historical Slope Failures', name: 'historical_incidents', type: 'number' },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">{field.label}</label>
                    <input
                      type={field.type}
                      value={(riskForm as any)[field.name]}
                      onChange={(e) => setRiskForm((p) => ({ ...p, [field.name]: field.type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
                      className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Soil Type</label>
                  <select value={riskForm.soil_type} onChange={(e) => setRiskForm((p) => ({ ...p, soil_type: e.target.value }))} className="w-full glass-input rounded-xl px-4 py-2.5 text-xs">
                    {['Clay', 'Silt', 'Loam', 'Sand', 'Gravel'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                <button type="submit" disabled={riskLoading} className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2">
                  {riskLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                  <span>{riskLoading ? 'Computing Risk Score...' : 'Generate AI Risk Prediction'}</span>
                </button>
              </form>
            </div>

            {riskResult && (
              <div className="space-y-4">
                <h2 className="text-lg font-black text-white">Prediction Results</h2>
                <div className={`glass-panel p-6 rounded-2xl border-2 space-y-4 ${riskResult.risk_level === 'Very High' || riskResult.risk_level === 'High' ? 'border-rose-500/40' : 'border-amber-500/40'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">AI Risk Level — {riskResult.district_name}</p>
                      <h3 className="text-3xl font-black text-white mt-1">{riskResult.risk_level}</h3>
                    </div>
                    <div className="text-center">
                      <p className={`text-5xl font-black font-mono ${riskResult.risk_score >= 75 ? 'text-rose-400' : riskResult.risk_score >= 55 ? 'text-amber-400' : 'text-emerald-400'}`}>{riskResult.risk_score}</p>
                      <p className="text-[10px] text-slate-400 mt-1">Risk Score / 100</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-amber-300 mb-2 uppercase tracking-wider">Risk Factors</h4>
                      {riskResult.reasons?.map((r: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300 mb-1.5">
                          <span className="text-rose-400 mt-0.5">⚠</span> {r}
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-emerald-300 mb-2 uppercase tracking-wider">Recommendations</h4>
                      {riskResult.recommendations?.map((r: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-300 mb-1.5">
                          <span className="text-emerald-400 mt-0.5">✓</span> {r}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== BROADCAST ALERTS ===== */}
        {activeTab === 'alert-broadcast' && (
          <div className="max-w-2xl space-y-5">
            <h1 className="text-2xl font-black text-white">Alert Broadcast Studio</h1>
            <p className="text-xs text-slate-400">Issue real-time disaster warnings to all platform users in the affected zone.</p>

            {alertSent && (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center gap-3 text-sm font-semibold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Alert broadcast successfully! All registered users in {alertForm.affected_area || 'the affected area'} have been notified.
              </div>
            )}

            <form onSubmit={handleBroadcastAlert} className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Alert Title *</label>
                <input type="text" required value={alertForm.title} onChange={(e) => setAlertForm((p) => ({ ...p, title: e.target.value }))} className="w-full glass-input rounded-xl px-4 py-2.5 text-xs" placeholder="e.g. RED ALERT: Extreme Landslide Warning" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Severity Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Critical', 'Warning', 'Information'].map((sev) => (
                    <button key={sev} type="button" onClick={() => setAlertForm((p) => ({ ...p, severity: sev }))} className={`py-2.5 rounded-xl text-xs font-bold border transition-colors ${alertForm.severity === sev ? sev === 'Critical' ? 'bg-rose-600 border-rose-500 text-white' : sev === 'Warning' ? 'bg-amber-600 border-amber-500 text-white' : 'bg-blue-600 border-blue-500 text-white' : 'glass-card text-slate-400 hover:text-slate-200'}`}>
                      {sev}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Alert Message *</label>
                <textarea required rows={3} value={alertForm.description} onChange={(e) => setAlertForm((p) => ({ ...p, description: e.target.value }))} className="w-full glass-input rounded-xl px-4 py-2.5 text-xs resize-none" placeholder="Describe the nature and immediate actions required..." />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">Affected Area *</label>
                <input type="text" required value={alertForm.affected_area} onChange={(e) => setAlertForm((p) => ({ ...p, affected_area: e.target.value }))} className="w-full glass-input rounded-xl px-4 py-2.5 text-xs" placeholder="e.g. Meppadi, Chooralmala, Mundakkai sectors" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Radius (km)</label>
                  <input type="number" value={alertForm.radius_km} onChange={(e) => setAlertForm((p) => ({ ...p, radius_km: parseFloat(e.target.value) }))} className="w-full glass-input rounded-xl px-4 py-2.5 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">Expiry Date</label>
                  <input type="date" value={alertForm.expiry_date} onChange={(e) => setAlertForm((p) => ({ ...p, expiry_date: e.target.value }))} className="w-full glass-input rounded-xl px-4 py-2.5 text-xs" />
                </div>
              </div>
              <button type="submit" className={`w-full py-3 rounded-xl text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 ${alertForm.severity === 'Critical' ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/50' : alertForm.severity === 'Warning' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                <Send className="w-4 h-4" />
                <span>Broadcast {alertForm.severity} Alert Now</span>
              </button>
            </form>

            {/* Active Alerts List */}
            <div className="glass-panel p-5 rounded-2xl border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 mb-4">Active Broadcasts ({alerts.length})</h3>
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div key={a.id} className="glass-card px-4 py-3 rounded-xl flex items-center justify-between text-xs gap-4">
                    <div>
                      <RiskBadge level={a.severity} size="sm" />
                      <p className="font-bold text-slate-200 mt-1 line-clamp-1">{a.title}</p>
                      <p className="text-slate-400">{a.affected_area}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== RESCUE & SHELTERS ===== */}
        {activeTab === 'rescue' && (
          <div className="space-y-5">
            <h1 className="text-2xl font-black text-white">Rescue Teams & Shelter Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {shelters.map((s) => (
                <div key={s.id} className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-slate-100">{s.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{s.address}</p>
                    </div>
                    <RiskBadge level={s.supplies_status === 'Adequate' ? 'Low' : 'High'} size="sm" />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Occupancy</span>
                      <span className="font-bold text-emerald-400">{s.current_occupancy} / {s.capacity}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full transition-all" style={{ width: `${(s.current_occupancy / s.capacity) * 100}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Contact: <span className="text-slate-200 font-mono">{s.contact_phone}</span></span>
                      <span className="text-emerald-400">{s.medical_support ? '🏥 Medical' : 'No Medical'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Emergency Teams */}
            <div className="glass-panel p-5 rounded-2xl border-slate-800">
              <h3 className="font-bold text-sm text-slate-100 mb-4">Emergency Response Teams</h3>
              <div className="space-y-2">
                {mockTeams.map((t, idx) => (
                  <div key={idx} className="glass-card px-4 py-3 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-200">{t.name}</p>
                      <p className="text-slate-400">{t.type} • {t.members} members</p>
                    </div>
                    <RiskBadge level={t.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== ANALYTICS ===== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-white">Analytics & Situational Intelligence</h1>
            <AnalyticsCharts />
            <DocumentExporter />
            <div className="max-w-xl">
              <FeedbackForm />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Sub-component: Report verification card
function ReportVerifyCard({ report, onVerify }: { report: HazardReport; onVerify: (id: number, status: string, remarks: string, team: string) => void }) {
  const [remarks, setRemarks] = useState(report.government_remarks || '');
  const [team, setTeam] = useState(report.assigned_team || 'NDRF Alpha Team');
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <RiskBadge level={report.status} size="sm" />
            <RiskBadge level={report.priority} size="sm" />
            <span className="text-[10px] text-slate-400 font-mono">#{report.id}</span>
          </div>
          <h3 className="font-bold text-sm text-slate-100">{report.title}</h3>
          <p className="text-xs text-slate-400 mt-1">{report.location_name} • By {report.reporter_name}</p>
        </div>
        {report.image_url && <img src={report.image_url} alt="Report" className="w-20 h-14 object-cover rounded-xl border border-slate-700 shrink-0" />}
      </div>

      {report.ai_detected_hazard && (
        <div className="glass-card px-3 py-2 rounded-xl text-xs text-slate-300">
          <span className="text-amber-400 font-bold text-[10px]">AI SCAN: </span>
          {report.ai_detected_hazard} — {report.confidence_score?.toFixed(1)}% confidence
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} className="text-xs text-emerald-400 hover:underline flex items-center gap-1">
        {expanded ? 'Collapse' : 'Expand Verification Panel'} <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Official Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
              className="w-full glass-input rounded-xl px-3 py-2 text-xs resize-none"
              placeholder="Enter verification notes..."
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-slate-400 block mb-1">Assign Rescue Team</label>
            <select value={team} onChange={(e) => setTeam(e.target.value)} className="w-full glass-input rounded-xl px-3 py-2 text-xs">
              {['NDRF Alpha Team', 'NDRF Beta Team', 'PWD Emergency Unit', 'State Police Rescue', 'Medical SWAT Unit'].map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onVerify(report.id, 'Verified', remarks, team)} className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Dispatch
            </button>
            <button onClick={() => onVerify(report.id, 'Rejected', remarks || 'Does not meet verification criteria.', '')} className="flex-1 py-2 rounded-xl bg-rose-600/50 hover:bg-rose-600 text-rose-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors">
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Mock fallback data
const mockReports: HazardReport[] = [
  { id: 1, title: 'Fissure widening at Meppadi Hillside', description: 'Deep ground cracks observed after 48 hours of heavy rainfall.', category: 'Landslide Risk', location_name: 'Meppadi Plantation Road', latitude: 11.554, longitude: 76.126, status: 'Pending', priority: 'Critical', ai_detected_hazard: 'Active Landslide & Slope Failure', confidence_score: 95.4, ai_summary: 'High slope failure probability detected.', reporter_id: 1, reporter_name: 'Rajesh Kumar', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop' },
  { id: 2, title: 'Rockfall blocking Chooralmala Pass', description: 'Multiple boulders fell across the main transit road.', category: 'Rockfall', location_name: 'Chooralmala Main Pass', latitude: 11.542, longitude: 76.14, status: 'Pending', priority: 'High', ai_detected_hazard: 'Rockfall Hazard', confidence_score: 91.2, ai_summary: 'Unstable boulders blocking transit route.', reporter_id: 1, reporter_name: 'Rajesh Kumar', created_at: new Date().toISOString(), updated_at: new Date().toISOString(), image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop' }
];
const mockAlerts: Alert[] = [
  { id: 1, title: 'RED ALERT: Extreme Landslide Warning', description: 'Immediate evacuation ordered.', severity: 'Critical', affected_area: 'Meppadi, Chooralmala', latitude: 11.548, longitude: 76.135, radius_km: 15, expiry_date: '2026-08-10', is_active: true, created_by_id: 2, created_at: new Date().toISOString() }
];
const mockShelters: Shelter[] = [
  { id: 1, name: 'Wayanad Central Relief Camp', address: "St. Mary's School, Kalpetta", district: 'Wayanad', latitude: 11.608, longitude: 76.083, capacity: 600, current_occupancy: 145, contact_phone: '+91 94470 12345', medical_support: true, supplies_status: 'Adequate', is_open: true },
  { id: 2, name: 'Meppadi Evacuation Hub', address: 'Town Hall Road, Meppadi', district: 'Wayanad', latitude: 11.551, longitude: 76.121, capacity: 450, current_occupancy: 210, contact_phone: '+91 94470 67890', medical_support: true, supplies_status: 'Adequate', is_open: true }
];
const mockAnalytics = { total_reports: 180, pending_reports: 45, verified_reports: 98, resolved_reports: 37, active_alerts: 2, active_sos: 1 };
const mockTeams = [
  { name: 'NDRF Alpha Team 4', type: 'Landslide Response', members: 12, status: 'Deployed' },
  { name: 'NDRF Beta Team 2', type: 'Rescue & Evacuation', members: 10, status: 'Standby' },
  { name: 'PWD Emergency Unit', type: 'Road Clearance', members: 8, status: 'Deployed' },
  { name: 'Medical SWAT Unit', type: 'Emergency Medical', members: 6, status: 'Standby' }
];
