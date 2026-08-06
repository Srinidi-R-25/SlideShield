'use client';

import React, { useState } from 'react';
import { Download, FileText, Printer, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { fetchApi } from '../lib/api';

export const DocumentExporter: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      window.open('/api/analytics/export-csv', '_blank');
      setExported(true);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100">Disaster Situational Report Generator</h3>
            <p className="text-xs text-slate-400">Export official government disaster situational reports & Excel data sheets</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{exporting ? 'Generating CSV...' : 'Export Excel / CSV'}</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-slate-200 hover:border-slate-600 font-bold text-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF Report</span>
          </button>
        </div>
      </div>

      {exported && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Situational Data Sheet exported successfully. Check your browser downloads folder.</span>
        </div>
      )}
    </div>
  );
};
