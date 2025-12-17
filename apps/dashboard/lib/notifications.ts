import { NotificationPriority, NotificationType } from '@tuto/shared';

export function defaultPriority(type: NotificationType): NotificationPriority {
  switch (type) {
    case 'attendance_marked':
    case 'payment':
    case 'medicine':
    case 'progress_report':
    case 'message':
    case 'feedback':
      return 'urgent';
    default:
      return 'normal';
  }
}









