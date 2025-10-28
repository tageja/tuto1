import React from 'react';
import { Badge } from './ui/badge';
import { Mail, MailOpen } from 'lucide-react';

interface MessageCardProps {
  from: string;
  subject: string;
  preview: string;
  date: string;
  priority: 'low' | 'normal' | 'high';
  read: boolean;
  onClick?: () => void;
}

export function MessageCard({ from, subject, preview, date, priority, read, onClick }: MessageCardProps) {
  const priorityColors = {
    low: 'secondary',
    normal: 'default',
    high: 'warning',
  };

  return (
    <div
      className={`bg-card rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
        !read ? 'border-l-4 border-l-primary' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {read ? <MailOpen size={16} className="text-muted-foreground" /> : <Mail size={16} className="text-primary" />}
          <span className={!read ? '' : 'text-muted-foreground'}>{from}</span>
        </div>
        <div className="flex items-center gap-2">
          {priority !== 'normal' && (
            <Badge variant={priorityColors[priority] as any} className="text-xs">
              {priority}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
      </div>
      
      <h4 className={`mb-1 ${!read ? '' : 'text-muted-foreground'}`}>{subject}</h4>
      <p className="text-muted-foreground text-sm line-clamp-1">{preview}</p>
    </div>
  );
}
