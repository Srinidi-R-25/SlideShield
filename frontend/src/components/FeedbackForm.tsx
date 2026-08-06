'use client';

import React, { useState } from 'react';
import { Star, Send, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { fetchApi } from '../lib/api';

export const FeedbackForm: React.FC = () => {
  const [form, setForm] = useState({ subject: '', message: '', rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await fetchApi('/feedback', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setSubmitted(true);
      setForm({ subject: '', message: '', rating: 5 });
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col items-center justify-center gap-3 min-h-[180px] text-center">
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        <h3 className="font-bold text-slate-100">Thank you for your feedback!</h3>
        <p className="text-xs text-slate-400">Your response helps us improve SlideShield for the community.</p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-2 text-xs text-emerald-400 hover:underline"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
          <MessageSquarePlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-slate-100">Platform Feedback</h3>
          <p className="text-[10px] text-slate-400">Help us improve — rate your experience</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">Your Rating</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setForm((p) => ({ ...p, rating: star }))}
                className="transition-transform hover:scale-125"
              >
                <Star
                  className={`w-6 h-6 transition-colors ${
                    star <= form.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Subject *</label>
          <input
            type="text"
            required
            value={form.subject}
            onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
            placeholder="e.g. Map loading issue, Feature suggestion..."
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5">Message *</label>
          <textarea
            required
            rows={3}
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            className="w-full glass-input rounded-xl px-4 py-2.5 text-xs resize-none"
            placeholder="Describe your experience or suggestion in detail..."
          />
        </div>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || !form.subject.trim() || !form.message.trim()}
          className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
        >
          {submitting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
        </button>
      </form>
    </div>
  );
};
