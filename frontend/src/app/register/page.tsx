'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, Mail, Lock, User, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'Citizen' as UserRole,
    phone: '',
    district: 'Wayanad',
    state: 'Kerala',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Registration failed');
      }
      await login(form.email, form.password);
      if (form.role === 'Citizen') router.push('/citizen');
      else if (form.role === 'Government Officer') router.push('/government');
      else router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#050b18] relative overflow-hidden">
      <div className="absolute w-[500px] h-[300px] bg-teal-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-lg glass-panel p-8 rounded-3xl border-slate-800 shadow-2xl relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-[0_0_25px_rgba(16,185,129,0.4)]">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            Create Your Account
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </h2>
          <p className="text-xs text-slate-400">Join the community disaster management network</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Account Role</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Citizen">Citizen</option>
                <option value="Government Officer">Government Officer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="full_name"
                  required
                  value={form.full_name}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            <div className="col-span-2">
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">District</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  className="w-full glass-input rounded-xl pl-10 pr-4 py-2.5 text-xs"
                  placeholder="Wayanad"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Emergency Contact Name</label>
              <input
                type="text"
                name="emergency_contact_name"
                value={form.emergency_contact_name}
                onChange={handleChange}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                placeholder="Family contact"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">Emergency Contact Phone</label>
              <input
                type="tel"
                name="emergency_contact_phone"
                value={form.emergency_contact_phone}
                onChange={handleChange}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account & Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-emerald-400 font-bold hover:underline">Login Here</Link>
        </div>
      </div>
    </div>
  );
}
