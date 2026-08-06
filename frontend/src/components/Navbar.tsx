'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Radio, User as UserIcon, LogOut, Sparkles, Bell, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SOSButton } from './SOSButton';
import { NotificationBell } from './NotificationBell';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      {/* Live Danger Ticker */}
      <div className="bg-rose-950/70 text-rose-300 border-b border-rose-900/60 px-4 py-1 text-xs font-semibold flex items-center justify-between overflow-hidden">
        <div className="flex items-center gap-2 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span className="font-bold uppercase tracking-wider text-[11px]">LIVE EARLY WARNING:</span>
          <span>Red Alert active in Wayanad & Idukki hill slopes. 210mm torrential rain recorded.</span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-[11px] text-rose-400">
          <span>State Control Room: 1077</span>
          <span>•</span>
          <span>NDRF Hotline: 112</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1">
              Slide<span className="text-emerald-400">Shield</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1 font-medium">AI Disaster Early Warning</span>
          </div>
        </Link>

        {/* Action Items */}
        <div className="flex items-center gap-3">
          <SOSButton />

          {user && <NotificationBell />}

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <Link
                href={
                  user.role === 'Citizen'
                    ? '/citizen'
                    : user.role === 'Government Officer'
                    ? '/government'
                    : '/admin'
                }
                className="flex items-center gap-2 px-3 py-2 rounded-xl glass-card text-xs font-semibold text-slate-200 hover:border-emerald-500/40 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={user.full_name}
                  className="w-7 h-7 rounded-full object-cover border border-emerald-500/40"
                />
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-200 line-clamp-1">{user.full_name}</p>
                  <p className="text-[10px] text-emerald-400 font-medium">{user.role}</p>
                </div>
              </div>

              <button
                onClick={logout}
                title="Logout"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white glass-card hover:border-emerald-500/40 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
