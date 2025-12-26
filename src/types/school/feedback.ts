// Re-export types from shared schema
export type {
  Feedback,
  FeedbackWithMessages,
  FeedbackMessage,
  CreateFeedback,
  CreateFeedbackMessage,
  UpdateFeedbackStatus,
} from '../../../packages/schemas/src/feedback';

// Local types for mobile app
export type FeedbackItem = Feedback & {
  student_name: string | null;
  student_code: string | null;
  parent_name?: string | null;
};

export type FeedbackFilters = {
  category?: 'request' | 'complaint' | 'information' | 'all';
  status?: 'open' | 'overdue' | 'closed' | 'all';
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'deadline';
};

export type FeedbackMessageWithSender = FeedbackMessage & {
  sender_name?: string | null;
};








