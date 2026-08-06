'use client';

import React from 'react';
import { 
  Home, 
  AlertTriangle, 
  Map, 
  Bell, 
  Bot, 
  Radio, 
  FileText, 
  User, 
  LayoutDashboard, 
  CheckCircle2, 
  Activity, 
  ShieldAlert, 
  Users, 
  Shield, 
  Settings, 
  FileSpreadsheet
} from 'lucide-react';
import { UserRole } from '../lib/types';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role, activeTab, setActiveTab }) => {
  const citizenItems = [
    { id: 'home', label: 'Home Overview', icon: Home },
    { id: 'report', label: 'Report Hazard (AI)', icon: AlertTriangle },
    { id: 'risk-map', label: 'Interactive Risk Map', icon: Map },
    { id: 'alerts', label: 'Active Alerts', icon: Bell },
    { id: 'ai-chat', label: 'AI Safety Assistant', icon: Bot },
    { id: 'my-reports', label: 'My Submissions', icon: FileText },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const governmentItems = [
    { id: 'dashboard', label: 'Control Center Overview', icon: LayoutDashboard },
    { id: 'live-map', label: 'Tactical Live Map', icon: Map },
    { id: 'verify', label: 'Report Verification', icon: CheckCircle2 },
    { id: 'risk-predictor', label: 'AI Risk Predictor', icon: Activity },
    { id: 'alert-broadcast', label: 'Broadcast Alerts', icon: ShieldAlert },
    { id: 'rescue', label: 'Rescue & Shelters', icon: Radio },
    { id: 'analytics', label: 'Analytics & Trends', icon: FileSpreadsheet },
  ];

  const adminItems = [
    { id: 'overview', label: 'Platform Health', icon: Activity },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'roles', label: 'Role & Permissions', icon: Shield },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'Platform Settings', icon: Settings },
  ];

  const items = role === 'Citizen' ? citizenItems : role === 'Government Officer' ? governmentItems : adminItems;

  return (
    <aside className="w-64 glass-panel border-r border-slate-800/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {role} Workspace
        </div>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl glass-card border border-emerald-500/20 bg-emerald-950/20 text-xs">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px] mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          AI Monitoring Active
        </div>
        <p className="text-[11px] text-slate-400">Gemini Vision & Rainfall Heuristics connected 24/7.</p>
      </div>
    </aside>
  );
};
