import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  delta?: number;
  icon: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'error';
}

export function StatsCard({ title, value, delta, icon, tone = 'default' }: StatsCardProps) {
  const toneColors = {
    default: 'from-[#0B5FFF] to-[#6366F1]',
    success: 'from-[#16A34A] to-[#22C55E]',
    warning: 'from-[#F59E0B] to-[#FBBF24]',
    error: 'from-[#DC2626] to-[#F87171]',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${toneColors[tone]} flex items-center justify-center text-white`}>
          {icon}
        </div>
        {delta !== undefined && (
          <div className={`flex items-center gap-1 ${delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {delta >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="text-sm">{Math.abs(delta)}%</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-sm">{title}</p>
        <h2 className="m-0">{value}</h2>
      </div>
    </div>
  );
}
