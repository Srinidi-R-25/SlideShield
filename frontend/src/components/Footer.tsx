'use client';

import React from 'react';
import { Shield, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full glass-panel border-t border-slate-800/80 bg-slate-950/90 py-10 px-4 mt-20 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm text-slate-100 flex items-center gap-1">
              Slide<span className="text-emerald-400">Shield</span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            AI-powered community landslide early warning, hazard image analysis, and emergency rescue response platform.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Emergency Contacts</h4>
          <ul className="space-y-2">
            <li>National Emergency Hotline: <span className="text-slate-200 font-mono font-bold">112</span></li>
            <li>Disaster Management Control: <span className="text-slate-200 font-mono font-bold">1077</span></li>
            <li>NDRF Rescue Control: <span className="text-slate-200 font-mono font-bold">011-24363260</span></li>
            <li>District Control Room: <span className="text-slate-200 font-mono font-bold">+91 4936 204100</span></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Platform Features</h4>
          <ul className="space-y-2 text-slate-400">
            <li>AI Vision Hazard Scanner</li>
            <li>Multi-Parameter Risk Calculator</li>
            <li>Tactical Leaflet Live Map</li>
            <li>1-Click Emergency SOS Broadcast</li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-3">Compliance & Tech</h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Built with Next.js 14, FastAPI, Google Gemini API, PostgreSQL & Leaflet.
          </p>
          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg glass-card border-slate-700 text-[11px] text-slate-300">
            <span>Built for Smart India Hackathon & Public Safety</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p>© 2026 SlideShield AI. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for community resilience & disaster preparedness.
        </p>
      </div>
    </footer>
  );
};
