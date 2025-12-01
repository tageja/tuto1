/**
 * Moderation Service
 * 
 * Client-side service for content moderation and user safety features.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

// Report types
export enum ReportType {
  SPAM = 'spam',
  INAPPROPRIATE = 'inappropriate',
  HARASSMENT = 'harassment',
  BULLYING = 'bullying',
  HATE_SPEECH = 'hate_speech',
  VIOLENCE = 'violence',
  SEXUAL_CONTENT = 'sexual_content',
  SCAM = 'scam',
  COPYRIGHT = 'copyright',
  OTHER = 'other'
}

export interface ReportData {
  reportedUserId?: string;
  reportedPostId?: string;
  reportedCommentId?: string;
  reportType: ReportType;
  description: string;
  evidence?: string[];
}

export interface BlockData {
  blockedUserId: string;
  reason: string;
}

export interface ModerationStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  blockedUsers: number;
  activeBlocks: number;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId?: string;
  reportedPostId?: string;
  reportedCommentId?: string;
  reportType: ReportType;
  description: string;
  evidence?: string[];
  timestamp: string;
  status: string;
  adminNotes?: string;
  resolvedBy?: string;
  resolvedAt?: string;
}

// Firebase Functions
const reportContentFn = httpsCallable(functions, 'reportContent');
const blockUserFn = httpsCallable(functions, 'blockUser');
const unblockUserFn = httpsCallable(functions, 'unblockUser');
const getModerationQueueFn = httpsCallable(functions, 'getModerationQueue');
const resolveReportFn = httpsCallable(functions, 'resolveReport');

export class ModerationService {
  /**
   * Report content or user
   */
  static async reportContent(data: ReportData): Promise<{ success: boolean; reportId: string; message: string }> {
    try {
      const result = await reportContentFn(data);
      return result.data as { success: boolean; reportId: string; message: string };
    } catch (error) {
      console.error('Error reporting content:', error);
      throw error;
    }
  }

  /**
   * Block a user
   */
  static async blockUser(data: BlockData): Promise<{ success: boolean; blockId: string; message: string }> {
    try {
      const result = await blockUserFn(data);
      return result.data as { success: boolean; blockId: string; message: string };
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  static async unblockUser(blockedUserId: string): Promise<{ success: boolean; message: string }> {
    try {
      const result = await unblockUserFn({ blockedUserId });
      return result.data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  /**
   * Get moderation queue (admin only)
   */
  static async getModerationQueue(status?: string, limit?: number): Promise<{
    success: boolean;
    reports: Report[];
    stats: ModerationStats;
  }> {
    try {
      const result = await getModerationQueueFn({ status, limit });
      return result.data as { success: boolean; reports: Report[]; stats: ModerationStats };
    } catch (error) {
      console.error('Error getting moderation queue:', error);
      throw error;
    }
  }

  /**
   * Resolve a report (admin only)
   */
  static async resolveReport(
    reportId: string,
    status: string,
    adminNotes?: string,
    action?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await resolveReportFn({
        reportId,
        status,
        adminNotes,
        action
      });
      return result.data as { success: boolean; message: string };
    } catch (error) {
      console.error('Error resolving report:', error);
      throw error;
    }
  }

  /**
   * Get report type display name
   */
  static getReportTypeDisplayName(reportType: ReportType): string {
    const displayNames: Record<ReportType, string> = {
      [ReportType.SPAM]: 'Spam',
      [ReportType.INAPPROPRIATE]: 'Inappropriate Content',
      [ReportType.HARASSMENT]: 'Harassment',
      [ReportType.BULLYING]: 'Bullying',
      [ReportType.HATE_SPEECH]: 'Hate Speech',
      [ReportType.VIOLENCE]: 'Violence',
      [ReportType.SEXUAL_CONTENT]: 'Sexual Content',
      [ReportType.SCAM]: 'Scam',
      [ReportType.COPYRIGHT]: 'Copyright Violation',
      [ReportType.OTHER]: 'Other'
    };
    return displayNames[reportType] || 'Unknown';
  }

  /**
   * Get report type description
   */
  static getReportTypeDescription(reportType: ReportType): string {
    const descriptions: Record<ReportType, string> = {
      [ReportType.SPAM]: 'Repetitive or unwanted content',
      [ReportType.INAPPROPRIATE]: 'Content that violates community standards',
      [ReportType.HARASSMENT]: 'Targeted harassment or intimidation',
      [ReportType.BULLYING]: 'Bullying behavior or content',
      [ReportType.HATE_SPEECH]: 'Hateful or discriminatory language',
      [ReportType.VIOLENCE]: 'Violent or threatening content',
      [ReportType.SEXUAL_CONTENT]: 'Sexual or explicit content',
      [ReportType.SCAM]: 'Fraudulent or misleading content',
      [ReportType.COPYRIGHT]: 'Unauthorized use of copyrighted material',
      [ReportType.OTHER]: 'Other violation not listed above'
    };
    return descriptions[reportType] || 'Please describe the issue';
  }

  /**
   * Check if user is blocked
   */
  static async isUserBlocked(userId: string): Promise<boolean> {
    try {
      // This would typically check against a local cache or make an API call
      // For now, we'll return false as a placeholder
      return false;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }

  /**
   * Get blocked users list
   */
  static async getBlockedUsers(): Promise<string[]> {
    try {
      // This would typically fetch from local storage or make an API call
      // For now, we'll return an empty array as a placeholder
      return [];
    } catch (error) {
      console.error('Error getting blocked users:', error);
      return [];
    }
  }
}


































