import React from 'react';
import { Badge } from './ui/badge';
import { Sparkles } from 'lucide-react';

interface AIInsightPanelProps {
  title: string;
  body: string;
  metric?: {
    label: string;
    value: string;
    trend?: 'up' | 'down';
  };
  comingSoon?: boolean;
}

export function AIInsightPanel({ title, body, metric, comingSoon = false }: AIInsightPanelProps) {
  return (
    <div className="bg-gradient-to-br from-[#0B5FFF]/10 to-[#6366F1]/10 rounded-xl border border-[#0B5FFF]/20 p-6 relative overflow-hidden">
      {comingSoon && (
        <div className="absolute top-4 right-4">
          <Badge variant="secondary">Coming Soon</Badge>
        </div>
      )}
      
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0B5FFF] to-[#6366F1] flex items-center justify-center">
          <Sparkles size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h3 className="m-0 mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm m-0">{body}</p>
        </div>
      </div>
      
      {metric && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{metric.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-lg">{metric.value}</span>
              {metric.trend && (
                <span className={metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                  {metric.trend === 'up' ? '↑' : '↓'}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
