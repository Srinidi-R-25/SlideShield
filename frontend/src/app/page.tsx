'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Sparkles, 
  AlertTriangle, 
  Activity, 
  Map, 
  Radio, 
  Users, 
  CheckCircle2, 
  ArrowRight, 
  Bot, 
  ChevronDown, 
  ShieldAlert, 
  CloudRain, 
  Zap 
} from 'lucide-react';
import { Footer } from '../components/Footer';

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    {
      icon: Activity,
      title: 'AI Multi-Parameter Risk Prediction',
      desc: 'Predicts landslide probability using 24-hour rainfall (mm), slope angle (°), soil type, historical failures, and weather forecasts.'
    },
    {
      icon: AlertTriangle,
      title: 'Community Hazard Reporting & AI Scan',
      desc: 'Citizens upload slope hazard images analyzed instantly by Google Gemini AI for rockfall, slumping, and ground cracks.'
    },
    {
      icon: ShieldAlert,
      title: 'Real-Time Early Warning System',
      desc: 'Broadcasts instant RED/ORANGE alert notifications to residents living in vulnerable high-range mountain sectors.'
    },
    {
      icon: Map,
      title: 'Tactical Government Live Map',
      desc: 'Interactive Leaflet tactical map overlaying citizen reports, risk heat zones, active rescue units, and evacuation shelters.'
    },
    {
      icon: Radio,
      title: 'Emergency Rescue Coordination',
      desc: 'Dispatch NDRF emergency response teams, track shelter occupancy, and manage emergency transport vehicles.'
    },
    {
      icon: Bot,
      title: '24/7 AI Safety Assistant',
      desc: 'Interactive chatbot providing immediate landslide safety guidelines, emergency helpline contacts, and government relief schemes.'
    }
  ];

  const steps = [
    { num: '01', title: 'Hazard Detection', desc: 'Sensors, rainfall gauges & citizens detect early ground fissures or slope slumping.' },
    { num: '02', title: 'AI Analysis', desc: 'Gemini AI evaluates image context, soil saturation, and slope risk score in milliseconds.' },
    { num: '03', title: 'Officer Verification', desc: 'Government officers inspect reports on tactical live map and assign NDRF rescue teams.' },
    { num: '04', title: 'Early Warning Broadcast', desc: 'Targeted SMS & push alerts notify vulnerable communities to evacuate to designated shelters.' }
  ];

  const faqs = [
    {
      q: 'How does SlideShield predict landslide risk?',
      a: 'SlideShield combines real-time precipitation data, satellite topography slope angles, geotechnical soil composition models (clay, silt, sand), and historical incident databases powered by Google Gemini AI.'
    },
    {
      q: 'Can citizens report slope hazards directly from mobile phones?',
      a: 'Yes! Citizens can capture slope fissures or rockfall photos, select their GPS location, and submit reports. AI instantly scans the photo to determine risk category.'
    },
    {
      q: 'What happens when I click the Emergency SOS button?',
      a: 'Clicking Emergency SOS immediately broadcasts your precise GPS coordinates, phone number, and distress status directly to the District Disaster Control Room and nearby NDRF units.'
    },
    {
      q: 'Is SlideShield compatible with offline emergency mode?',
      a: 'Yes, SlideShield features built-in offline heuristic engines ensuring emergency guidance, shelter maps, and SOS panic triggers remain operational even with intermittent cellular connectivity.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#050b18] text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 px-4 overflow-hidden border-b border-slate-800/60">
        {/* Glowing Background Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-600/20 via-teal-500/10 to-transparent blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-card border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Next-Gen Disaster Protection Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
              AI-Powered Community <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Landslide Early Warning
              </span> <br />
              & Rescue Assistant
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
              SlideShield empowers citizens, disaster response officers, and government authorities with real-time AI risk prediction, automated vision hazard analysis, tactical live maps, and emergency SOS dispatch.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 group"
              >
                <span>Launch SlideShield Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel text-slate-200 hover:text-white font-bold text-sm hover:border-emerald-500/40 transition-colors flex items-center justify-center"
              >
                Register Account
              </Link>
            </div>

            {/* Quick Demo Autofill Notice */}
            <div className="pt-4 flex items-center justify-center lg:justify-start gap-3 text-xs text-slate-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Includes 1-Click Demo Accounts for Citizen, Government & Admin</span>
            </div>
          </div>

          {/* Hero Live Widget Showcase */}
          <div className="lg:col-span-5 relative">
            <div className="glass-panel p-6 rounded-3xl border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.15)] space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></div>
                  <span className="font-bold text-sm text-slate-100">Wayanad Sector 4 Risk Radar</span>
                </div>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold">
                  HIGH RISK 92.4%
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="glass-card p-3 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">24H Rainfall</span>
                  <p className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <CloudRain className="w-4 h-4 text-cyan-400" /> 210.5 mm
                  </p>
                </div>
                <div className="glass-card p-3 rounded-xl">
                  <span className="text-slate-400 block text-[10px]">Terrain Slope</span>
                  <p className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <Zap className="w-4 h-4 text-amber-400" /> 42° Angle
                  </p>
                </div>
              </div>

              <div className="glass-card p-3.5 rounded-xl border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">AI Hazard Vision Analysis</span>
                  <span className="text-emerald-400 font-mono font-bold">95.4% Confidence</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  "Fissure widening & soil slumping detected at Meppadi Hillside. High probability of downhill slope failure."
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
                <span>Safe Shelters Available: <strong className="text-emerald-400">3 Hubs</strong></span>
                <span>NDRF Units: <strong className="text-emerald-400">2 Onsite</strong></span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* STATS SECTION */}
      <section className="py-12 px-4 glass-panel bg-slate-950/60 border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4">
            <h3 className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">168,000+</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">Citizens Protected</p>
          </div>
          <div className="p-4">
            <h3 className="text-3xl sm:text-4xl font-black text-cyan-400 font-mono">24/7</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">AI Risk Monitoring</p>
          </div>
          <div className="p-4">
            <h3 className="text-3xl sm:text-4xl font-black text-amber-400 font-mono">95.4%</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">AI Hazard Accuracy</p>
          </div>
          <div className="p-4">
            <h3 className="text-3xl sm:text-4xl font-black text-rose-400 font-mono">&lt; 3 Sec</h3>
            <p className="text-xs text-slate-400 mt-1 font-medium">SOS Panic Response</p>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 px-4 max-w-7xl mx-auto w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Complete Disaster Platform</span>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Engineered for Rapid Early Warning & Rescue</h2>
          <p className="text-slate-400 text-sm">Everything needed to monitor slope stability, warn citizens, and direct rescue operations.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, idx) => {
            const Icon = f.icon;
            return (
              <div key={idx} className="glass-panel p-6 rounded-2xl border-slate-800 hover:border-emerald-500/40 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-100 mb-2">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 glass-panel bg-slate-950/80 border-y border-slate-800">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">4-Step Workflow</span>
            <h2 className="text-3xl font-black text-white">How SlideShield Saves Lives</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, idx) => (
              <div key={idx} className="glass-card p-6 rounded-2xl border-slate-800 space-y-3 relative">
                <span className="text-4xl font-black text-emerald-500/30 font-mono block">{s.num}</span>
                <h3 className="font-bold text-sm text-slate-100">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section className="py-20 px-4 max-w-4xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Everything you need to know about SlideShield safety operations.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="glass-panel rounded-xl overflow-hidden border-slate-800">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left flex items-center justify-between font-bold text-sm text-slate-200 hover:text-white"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${openFaq === idx ? 'rotate-180 text-emerald-400' : 'text-slate-400'}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
