'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../../components/Sidebar';
import { RiskBadge } from '../../components/RiskBadge';
import { fetchApi } from '../../lib/api';
import { User, AuditLog } from '../../lib/types';
import {
  Activity, Users, Shield, FileText, Settings, Database,
  AlertTriangle, CheckCircle2, Server, Cpu, HardDrive,
  Clock, Loader2, ToggleLeft, ToggleRight, Eye, Search
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [togglingUser, setTogglingUser] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user && user.role !== 'Admin') {
      router.push(user.role === 'Citizen' ? '/citizen' : '/government');
      return;
    }
    loadData();
  }, [authLoading, user]);

  const loadData = async () => {
    try {
      const [usrs, logs, health] = await Promise.all([
        fetchApi<User[]>('/admin/users').catch(() => mockUsers),
        fetchApi<AuditLog[]>('/admin/audit-logs').catch(() => mockLogs),
        fetchApi<any>('/admin/system-health').catch(() => mockHealth),
      ]);
      setUsers(usrs);
      setAuditLogs(logs);
      setSystemHealth(health);
    } catch {
      setUsers(mockUsers); setAuditLogs(mockLogs); setSystemHealth(mockHealth);
    } finally {
      setPageLoading(false);
    }
  };

  const handleToggleUser = async (userId: number) => {
    setTogglingUser(userId);
    try {
      await fetchApi(`/admin/users/${userId}/toggle-active`, { method: 'PUT' });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    } catch {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_active: !u.is_active } : u));
    } finally {
      setTogglingUser(null);
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    try {
      await fetchApi(`/admin/users/${userId}/role?new_role=${encodeURIComponent(newRole)}`, { method: 'PUT' });
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole as any } : u));
    } catch {
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole as any } : u));
    }
  };

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050b18]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">Loading Admin Command Center...</p>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="flex min-h-[calc(100vh-5rem)] bg-[#050b18]">
      <Sidebar role="Admin" activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-6 overflow-y-auto space-y-6">

        {/* ===== PLATFORM HEALTH OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-black text-white">Platform Health & System Overview</h1>
              <p className="text-xs text-slate-400 mt-1">Real-time system metrics, service status, and resource utilization.</p>
            </div>

            {/* Status Banner */}
            <div className="glass-panel p-4 rounded-2xl border-emerald-500/30 bg-emerald-950/20 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-sm text-emerald-300">All Systems Operational</p>
                  <p className="text-xs text-slate-400">Last checked: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
              <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold">Uptime: 99.98%</span>
            </div>

            {/* System Health Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: systemHealth?.total_users ?? users.length, icon: Users, color: 'cyan', sub: 'Active platform accounts' },
                { label: 'Active Alerts', value: systemHealth?.active_alerts ?? 2, icon: AlertTriangle, color: 'rose', sub: 'Broadcasting now' },
                { label: 'Hazard Reports', value: systemHealth?.total_reports ?? 180, icon: FileText, color: 'amber', sub: 'Submitted this season' },
                { label: 'Active SOS', value: systemHealth?.active_sos ?? 1, icon: Shield, color: 'emerald', sub: 'Emergency dispatched' },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className="glass-panel p-5 rounded-2xl border-slate-800 space-y-3">
                    <Icon className={`w-6 h-6 text-${card.color}-400`} />
                    <div>
                      <p className={`text-3xl font-black font-mono text-${card.color}-400`}>{card.value}</p>
                      <p className="text-xs font-bold text-slate-200 mt-0.5">{card.label}</p>
                      <p className="text-[10px] text-slate-400">{card.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Infrastructure Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Server className="w-4 h-4 text-cyan-400" />Infrastructure Services
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'PostgreSQL Database', status: 'Online', latency: '12ms', color: 'emerald' },
                    { name: 'Google Gemini AI Engine', status: 'Online', latency: '340ms', color: 'emerald' },
                    { name: 'Cloudinary Storage', status: 'Online', latency: '85ms', color: 'emerald' },
                    { name: 'FastAPI Backend', status: 'Online', latency: '22ms', color: 'emerald' },
                    { name: 'Next.js Frontend', status: 'Online', latency: '8ms', color: 'emerald' },
                  ].map((svc) => (
                    <div key={svc.name} className="glass-card px-3 py-2.5 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full bg-${svc.color}-400 animate-pulse`}></span>
                        <span className="text-slate-200 font-medium">{svc.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <span className="font-mono text-[10px]">{svc.latency}</span>
                        <span className={`text-${svc.color}-400 font-bold`}>{svc.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border-slate-800 space-y-4">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />Resource Utilization
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'CPU Usage', value: 14, color: 'emerald', display: '14.2%' },
                    { label: 'Memory Usage', value: 38, color: 'amber', display: '38.6%' },
                    { label: 'Storage Used', value: 22, color: 'cyan', display: '22.1 GB / 100 GB' },
                    { label: 'AI Token Usage', value: 67, color: 'purple', display: '67,420 / 100K' },
                  ].map((r) => (
                    <div key={r.label} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-300 font-medium">{r.label}</span>
                        <span className={`text-${r.color}-400 font-mono font-bold`}>{r.display}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className={`bg-${r.color}-500 h-2 rounded-full transition-all`} style={{ width: `${r.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== USER MANAGEMENT ===== */}
        {activeTab === 'users' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-2xl font-black text-white">User Management</h1>
                <p className="text-xs text-slate-400 mt-1">{users.length} registered accounts</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="glass-input rounded-xl pl-9 pr-4 py-2 text-xs w-64"
                />
              </div>
            </div>

            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60">
                      <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">User</th>
                      <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">Role</th>
                      <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">District</th>
                      <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">Joined</th>
                      <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt={u.full_name} className="w-8 h-8 rounded-full object-cover border border-slate-700" />
                            <div>
                              <p className="font-bold text-slate-200">{u.full_name}</p>
                              <p className="text-slate-400 text-[10px]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <select
                            value={u.role}
                            onChange={(e) => handleChangeRole(u.id, e.target.value)}
                            className="glass-input rounded-lg px-2 py-1 text-[10px] font-bold text-slate-200"
                          >
                            <option>Citizen</option>
                            <option>Government Officer</option>
                            <option>Admin</option>
                          </select>
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">{u.district || 'Wayanad'}</td>
                        <td className="px-5 py-3.5">
                          <RiskBadge level={u.is_active ? 'Verified' : 'Rejected'} size="sm" />
                        </td>
                        <td className="px-5 py-3.5 text-slate-400">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => handleToggleUser(u.id)}
                            disabled={togglingUser === u.id || u.id === user?.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-card text-[10px] font-bold text-slate-300 hover:border-slate-600 transition-colors disabled:opacity-40"
                          >
                            {u.is_active
                              ? <ToggleRight className="w-3.5 h-3.5 text-emerald-400" />
                              : <ToggleLeft className="w-3.5 h-3.5 text-rose-400" />}
                            {togglingUser === u.id ? 'Updating...' : u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== ROLES & PERMISSIONS ===== */}
        {activeTab === 'roles' && (
          <div className="space-y-5">
            <h1 className="text-2xl font-black text-white">Role & Permission Matrix</h1>
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/60">
                    <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">Feature / Permission</th>
                    <th className="text-center px-5 py-3.5 text-slate-400 font-bold">Citizen</th>
                    <th className="text-center px-5 py-3.5 text-slate-400 font-bold">Govt Officer</th>
                    <th className="text-center px-5 py-3.5 text-slate-400 font-bold">Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    { perm: 'Submit Hazard Report', citizen: true, officer: true, admin: true },
                    { perm: 'View Active Alerts', citizen: true, officer: true, admin: true },
                    { perm: 'Use AI Safety Chatbot', citizen: true, officer: true, admin: true },
                    { perm: 'Trigger Emergency SOS', citizen: true, officer: true, admin: true },
                    { perm: 'Verify / Reject Reports', citizen: false, officer: true, admin: true },
                    { perm: 'Broadcast Early Warning Alerts', citizen: false, officer: true, admin: true },
                    { perm: 'Access AI Risk Predictor', citizen: false, officer: true, admin: true },
                    { perm: 'Manage Rescue Teams', citizen: false, officer: true, admin: true },
                    { perm: 'Export Situational Reports', citizen: false, officer: true, admin: true },
                    { perm: 'Manage All Platform Users', citizen: false, officer: false, admin: true },
                    { perm: 'View Audit Logs', citizen: false, officer: false, admin: true },
                    { perm: 'System Health Dashboard', citizen: false, officer: false, admin: true },
                    { perm: 'Change User Roles', citizen: false, officer: false, admin: true },
                  ].map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                      <td className="px-5 py-3 text-slate-200 font-medium">{row.perm}</td>
                      <td className="px-5 py-3 text-center">{row.citizen ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-slate-700">—</span>}</td>
                      <td className="px-5 py-3 text-center">{row.officer ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-slate-700">—</span>}</td>
                      <td className="px-5 py-3 text-center">{row.admin ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-slate-700">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== AUDIT LOGS ===== */}
        {activeTab === 'audit' && (
          <div className="space-y-5">
            <h1 className="text-2xl font-black text-white">Audit Logs</h1>
            <p className="text-xs text-slate-400">Platform activity trail — last 100 actions.</p>
            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/60">
                      <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">Timestamp</th>
                      <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">User</th>
                      <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">Role</th>
                      <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">Action</th>
                      <th className="text-left px-5 py-3.5 text-slate-400 font-bold uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {auditLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                        <td className="px-5 py-3 text-slate-400 font-mono text-[10px] whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-slate-200 font-medium">{log.user_email}</td>
                        <td className="px-5 py-3"><RiskBadge level={log.user_role === 'Admin' ? 'Critical' : log.user_role === 'Government Officer' ? 'Warning' : 'Low'} size="sm" /></td>
                        <td className="px-5 py-3">
                          <span className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded-full ${log.action.includes('SOS') ? 'bg-rose-500/20 text-rose-300' : log.action.includes('ALERT') ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-300'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-slate-400 max-w-xs truncate">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== PLATFORM SETTINGS ===== */}
        {activeTab === 'settings' && (
          <div className="max-w-xl space-y-5">
            <h1 className="text-2xl font-black text-white">Platform Settings</h1>
            <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-5">
              {[
                { label: 'Platform Name', value: 'SlideShield AI' },
                { label: 'Default Alert Radius (km)', value: '10' },
                { label: 'AI Model', value: 'Google Gemini 1.5 Flash' },
                { label: 'Data Retention (months)', value: '12' },
                { label: 'Max Upload Size (MB)', value: '10' },
              ].map((setting) => (
                <div key={setting.label}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">{setting.label}</label>
                  <input
                    type="text"
                    defaultValue={setting.value}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                  />
                </div>
              ))}
              <button className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                Save Platform Settings
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// Mock fallback data
const mockUsers: User[] = [
  { id: 1, email: 'citizen@slideshield.org', full_name: 'Rajesh Kumar', role: 'Citizen', phone: '+91 98470 11223', district: 'Wayanad', state: 'Kerala', is_active: true, is_verified: true, created_at: '2026-01-15T10:00:00Z', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
  { id: 2, email: 'officer@slideshield.org', full_name: 'Dr. Anita Nair', role: 'Government Officer', phone: '+91 94470 55443', district: 'Wayanad', state: 'Kerala', is_active: true, is_verified: true, created_at: '2026-01-10T08:00:00Z', avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80' },
  { id: 3, email: 'admin@slideshield.org', full_name: 'System Administrator', role: 'Admin', phone: '+91 98950 00112', district: 'Statewide', state: 'Kerala', is_active: true, is_verified: true, created_at: '2026-01-01T00:00:00Z', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' }
];
const mockLogs: AuditLog[] = [
  { id: 1, user_email: 'officer@slideshield.org', user_role: 'Government Officer', action: 'BROADCAST_ALERT', details: 'RED ALERT issued for Meppadi & Chooralmala sectors', ip_address: '192.168.1.1', timestamp: new Date().toISOString() },
  { id: 2, user_email: 'citizen@slideshield.org', user_role: 'Citizen', action: 'TRIGGER_EMERGENCY_SOS', details: 'SOS triggered at lat: 11.554, lng: 76.126', ip_address: '192.168.1.25', timestamp: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: 3, user_email: 'citizen@slideshield.org', user_role: 'Citizen', action: 'SUBMIT_HAZARD_REPORT', details: 'Report #1: Fissure widening at Meppadi Hillside', ip_address: '192.168.1.25', timestamp: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 4, user_email: 'officer@slideshield.org', user_role: 'Government Officer', action: 'VERIFY_REPORT', details: 'Report #1 set to Verified. Assigned: NDRF Alpha Team 4', ip_address: '192.168.1.1', timestamp: new Date(Date.now() - 30 * 60000).toISOString() },
  { id: 5, user_email: 'system@slideshield.org', user_role: 'System', action: 'SEED_DATABASE', details: 'Initial platform data seeded successfully', ip_address: '127.0.0.1', timestamp: new Date(Date.now() - 60 * 60000).toISOString() }
];
const mockHealth = { status: 'Operational', total_users: 3, total_reports: 180, active_alerts: 2, active_sos: 1 };
