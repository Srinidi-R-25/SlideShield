import React from 'react';

interface RiskBadgeProps {
  level: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md' }) => {
  const normalized = level.toLowerCase();
  
  let bgClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  if (normalized.includes('critical') || normalized.includes('very high')) {
    bgClass = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
  } else if (normalized.includes('high')) {
    bgClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (normalized.includes('medium') || normalized.includes('moderate') || normalized.includes('warning')) {
    bgClass = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  } else if (normalized.includes('verified') || normalized.includes('low') || normalized.includes('info')) {
    bgClass = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-3 py-1 text-xs font-semibold',
    lg: 'px-4 py-1.5 text-sm font-bold',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md ${bgClass} ${sizeClasses[size]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {level}
    </span>
  );
};
