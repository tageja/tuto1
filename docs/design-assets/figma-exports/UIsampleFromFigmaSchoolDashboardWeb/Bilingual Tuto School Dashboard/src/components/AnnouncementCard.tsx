import React from 'react';
import { Badge } from './ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';

interface AnnouncementCardProps {
  title: string;
  description: string;
  date: string;
  priority: 'normal' | 'high' | 'urgent';
  status: 'published' | 'draft' | 'expired';
  onClick?: () => void;
}

export function AnnouncementCard({ title, description, date, priority, status, onClick }: AnnouncementCardProps) {
  const priorityColors = {
    normal: 'default',
    high: 'warning',
    urgent: 'destructive',
  };

  const statusColors = {
    published: 'default',
    draft: 'secondary',
    expired: 'outline',
  };

  return (
    <div
      className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {priority === 'urgent' && <AlertCircle size={18} className="text-red-500" />}
          <h4 className="m-0">{title}</h4>
        </div>
        <div className="flex gap-2">
          <Badge variant={priorityColors[priority] as any}>
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Badge>
          <Badge variant={statusColors[status] as any}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </div>
      
      <p className="text-muted-foreground mb-3 line-clamp-2">{description}</p>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar size={14} />
        <span>{date}</span>
      </div>
    </div>
  );
}
