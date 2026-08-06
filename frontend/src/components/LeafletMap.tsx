'use client';

import React, { useEffect, useState } from 'react';
import { HazardReport, Alert, Shelter } from '../lib/types';

interface LeafletMapProps {
  reports?: HazardReport[];
  alerts?: Alert[];
  shelters?: Shelter[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  reports = [],
  alerts = [],
  shelters = [],
  center = [11.5540, 76.1260], // Wayanad region coordinates
  zoom = 11,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Loading Tactical Risk Map...</span>
        </div>
      </div>
    );
  }

  // Client-side dynamic Leaflet map import
  const { MapContainer, TileLayer, Marker, Popup, Circle } = require('react-leaflet');
  const L = require('leaflet');

  // Custom icons
  const createIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-leaflet-pin',
      html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid #0f172a; box-shadow: 0 0 12px ${color};"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const reportIcon = createIcon('#ef4444'); // Red for hazards
  const alertIcon = createIcon('#f59e0b');  // Amber for warnings
  const shelterIcon = createIcon('#10b981'); // Emerald for shelters

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-slate-800 relative shadow-2xl">
      {/* Live Legend Bar */}
      <div className="absolute bottom-4 left-4 z-[400] glass-panel px-3 py-2 rounded-lg text-xs flex items-center gap-4 text-slate-200">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          <span>Citizen Report</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
          <span>Active Alert Zone</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          <span>Safe Evacuation Shelter</span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hazard Reports */}
        {reports.map((r) => (
          <Marker key={`rep-${r.id}`} position={[r.latitude, r.longitude]} icon={reportIcon}>
            <Popup>
              <div className="p-1 max-w-xs">
                <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">{r.category} • {r.status}</span>
                <h4 className="font-bold text-sm text-slate-100">{r.title}</h4>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2">{r.description}</p>
                <div className="mt-2 pt-2 border-t border-slate-700/60 text-[11px] text-slate-400 flex justify-between">
                  <span>Confidence: {r.confidence_score || 90}%</span>
                  <span>{r.location_name}</span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Warning Circles & Alerts */}
        {alerts.map((a) => (
          <React.Fragment key={`alt-${a.id}`}>
            {a.latitude && a.longitude && (
              <>
                <Circle
                  center={[a.latitude, a.longitude]}
                  radius={(a.radius_km || 10) * 1000}
                  pathOptions={{
                    color: a.severity === 'Critical' ? '#ef4444' : '#f59e0b',
                    fillColor: a.severity === 'Critical' ? '#ef4444' : '#f59e0b',
                    fillOpacity: 0.15,
                    weight: 2,
                    dashArray: '6, 6'
                  }}
                />
                <Marker position={[a.latitude, a.longitude]} icon={alertIcon}>
                  <Popup>
                    <div className="p-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">🚨 {a.severity} ALERT</span>
                      <h4 className="font-bold text-sm">{a.title}</h4>
                      <p className="text-xs text-slate-300 mt-1">{a.description}</p>
                      <p className="text-[10px] text-slate-400 mt-2">Zone: {a.affected_area}</p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}
          </React.Fragment>
        ))}

        {/* Shelters */}
        {shelters.map((s) => (
          <Marker key={`shl-${s.id}`} position={[s.latitude, s.longitude]} icon={shelterIcon}>
            <Popup>
              <div className="p-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">🟢 Evacuation Shelter</span>
                <h4 className="font-bold text-sm text-slate-100">{s.name}</h4>
                <p className="text-xs text-slate-300 mt-1">{s.address}</p>
                <div className="mt-2 text-xs font-semibold text-emerald-300">
                  Occupancy: {s.current_occupancy} / {s.capacity} beds
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Contact: {s.contact_phone}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
