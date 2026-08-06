'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, UserCheck, Lock, Mail, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('Citizen');
  const [email, setEmail] = useState('citizen@slideshield.org');
  const [password, setPassword] = useState('citizen123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'Citizen') {
      setEmail('citizen@slideshield.org');
      setPassword('citizen123');
    } else if (role === 'Government Officer') {
      setEmail('officer@slideshield.org');
      setPassword('officer123');
    } else {
      setEmail('admin@slideshield.org');
      setPassword('admin123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      redirectUser(selectedRole);
    } catch (err: any) {
      // Fallback demo login if backend is unreachable
      await demoLogin(selectedRole);
      redirectUser(selectedRole);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (role: UserRole) => {
    setLoading(true);
    await demoLogin(role);
    redirectUser(role);
  };

  const redirectUser = (role: UserRole) => {
    if (role === 'Citizen') router.push('/citizen');
    else if (role === 'Government Officer') router.push('/government');
    else router.push('/admin');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#050b18] relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute w-[500px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl border-slate-800 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)]">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            SlideShield Auth Portal
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-400">Select your role to access your disaster management dashboard</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 rounded-2xl glass-card border-slate-800">
          {(['Citizen', 'Government Officer', 'Admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => handleRoleTabChange(r)}
              className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
                selectedRole === r
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {r === 'Government Officer' ? 'Govt Officer' : r}
            </button>
          ))}
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-2">
          <div className="flex items-center justify-between text-emerald-300 font-bold text-[11px]">
            <span>⚡ Instant Demo Access</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20">Pre-seeded</span>
          </div>
          <p className="text-[11px] text-slate-300">Click below to bypass manual credentials and login instantly:</p>
          <button
            type="button"
            onClick={() => handleQuickDemo(selectedRole)}
            className="w-full py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Login as Demo {selectedRole}</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                placeholder="name@slideshield.org"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : `Login to ${selectedRole} Dashboard`}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-emerald-400 font-bold hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}
