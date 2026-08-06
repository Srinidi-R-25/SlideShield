'use client';

import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export const AnalyticsCharts: React.FC = () => {
  const monthlyData = [
    { month: 'Jan', reports: 12, resolved: 10, risk: 35 },
    { month: 'Feb', reports: 18, resolved: 16, risk: 42 },
    { month: 'Mar', reports: 25, resolved: 22, risk: 48 },
    { month: 'Apr', reports: 42, resolved: 38, risk: 62 },
    { month: 'May', reports: 68, resolved: 60, risk: 78 },
    { month: 'Jun', reports: 110, resolved: 95, risk: 88 },
    { month: 'Jul', reports: 145, resolved: 130, risk: 94 },
    { month: 'Aug', reports: 180, resolved: 162, risk: 91 },
  ];

  const districtData = [
    { district: 'Wayanad', highRisk: 14, incidents: 68 },
    { district: 'Idukki', highRisk: 18, incidents: 84 },
    { district: 'Malappuram', highRisk: 8, incidents: 32 },
    { district: 'Kozhikode', highRisk: 6, incidents: 24 },
    { district: 'Palakkad', highRisk: 5, incidents: 18 },
  ];

  const categoryData = [
    { name: 'Landslide Risk', value: 45, color: '#ef4444' },
    { name: 'Rockfall', value: 25, color: '#f59e0b' },
    { name: 'Soil Erosion', value: 20, color: '#10b981' },
    { name: 'Flash Flood', value: 10, color: '#3b82f6' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      {/* Monthly Trend Area Chart */}
      <div className="glass-panel p-5 rounded-2xl border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-100">Monthly Incident & Resolution Trends</h3>
            <p className="text-xs text-slate-400">Hazard reports submitted vs verified resolutions</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Monsoon Peak 2026
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="reportsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} 
              />
              <Area type="monotone" dataKey="reports" stroke="#ef4444" fillOpacity={1} fill="url(#reportsGrad)" name="Submitted Reports" />
              <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#resolvedGrad)" name="Resolved Cases" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* District Comparison Bar Chart */}
      <div className="glass-panel p-5 rounded-2xl border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-100">High-Risk Zones by District</h3>
            <p className="text-xs text-slate-400">Identified critical slopes & total reported incidents</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            5 Districts Tracked
          </span>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtData}>
              <XAxis dataKey="district" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }} 
              />
              <Bar dataKey="highRisk" fill="#f59e0b" name="Critical Risk Sectors" radius={[6, 6, 0, 0]} />
              <Bar dataKey="incidents" fill="#10b981" name="Active Incidents" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
