'use client';

import React, { useState } from 'react';
import { Bot, Send, User as UserIcon, Sparkles, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import { fetchApi } from '../lib/api';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  sources?: string[];
}

export const AIChatbot: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hello! I am your SlideShield AI Disaster Assistant. I provide real-time landslide risk alerts, emergency safety protocols, nearby shelter info, and emergency contacts. How can I help you keep safe today?',
      sources: ['NDRF Guidelines', 'SlideShield Safety Knowledgebase']
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response: any = await fetchApi('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message: query }),
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: response.reply,
        sources: response.sources || ['SlideShield Emergency Database']
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: '🚨 Emergency Tip: In case of active slope movement, run perpendicular to the landslide direction toward high ground. Contact National Helpline at 112 or State Control Room at 1077.',
        sources: ['National Emergency Backup Protocol']
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    'Find nearby evacuation shelters',
    'What to do during a landslide?',
    'Emergency helpline numbers',
    'Government compensation schemes'
  ];

  return (
    <div className="flex flex-col h-[520px] w-full max-w-md glass-panel rounded-2xl overflow-hidden border border-slate-700/60 shadow-2xl">
      {/* Chat Header */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
              SlideShield AI Assistant
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </h3>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              24/7 Disaster Safety Guard
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((m) => (
          <div key={m.id} className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-wrap leading-relaxed ${
              m.sender === 'user'
                ? 'bg-emerald-600 text-white rounded-tr-none shadow-lg'
                : 'glass-card text-slate-200 rounded-tl-none border-slate-800'
            }`}>
              {m.text}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-2 pt-1.5 border-t border-slate-700/50 text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified: {m.sources.join(', ')}
                </div>
              )}
            </div>
            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 items-center">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-card px-3.5 py-2.5 rounded-2xl text-xs text-slate-400 flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></div>
              Analyzing safety parameters...
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="px-3 py-2 bg-slate-950/60 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(qp)}
            className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full glass-card hover:border-emerald-500/50 text-slate-300 transition-colors"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI safety tips, shelters, emergency helpline..."
          className="flex-1 glass-input rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 font-semibold transition-colors flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
