/**
 * Data Retention Service
 * 
 * Client-side service for handling data retention, deletion, and export requests.
 */

import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

// Function references
const requestAccountDeletionFn = httpsCallable(functions, 'requestAccountDeletion');
const cancelAccountDeletionFn = httpsCallable(functions, 'cancelAccountDeletion');
const exportUserDataFn = httpsCallable(functions, 'exportUserData');
const getRetentionPolicyFn = httpsCallable(functions, 'getRetentionPolicy');

export interface DeletionRequest {
  success: boolean;
  message: string;
  scheduledFor?: string;
}

export interface ExportRequest {
  success: boolean;
  message: string;
  exportId?: string;
}

export interface RetentionPolicy {
  success: boolean;
  retentionPeriods: {
    USER_DATA: number;
    UGC_CONTENT: number;
    AUDIT_LOGS: number;
    PAYMENT_DATA: number;
    BACKUP_DATA: number;
  };
  policy: {
    userData: string;
    ugcContent: string;
    auditLogs: string;
    paymentData: string;
    backupData: string;
  };
  rights: {
    deletion: string;
    export: string;
    portability: string;
    rectification: string;
  };
}

export class DataRetentionService {
  /**
   * Request account deletion
   */
  static async requestAccountDeletion(
    reason?: string,
    confirmDeletion: boolean = false
  ): Promise<DeletionRequest> {
    try {
      const result = await requestAccountDeletionFn({
        reason,
        confirmDeletion,
      });

      return result.data as DeletionRequest;
    } catch (error: any) {
      console.error('Error requesting account deletion:', error);
      throw new Error(error.message || 'Failed to request account deletion');
    }
  }

  /**
   * Cancel account deletion request
   */
  static async cancelAccountDeletion(): Promise<DeletionRequest> {
    try {
      const result = await cancelAccountDeletionFn({});

      return result.data as DeletionRequest;
    } catch (error: any) {
      console.error('Error cancelling account deletion:', error);
      throw new Error(error.message || 'Failed to cancel account deletion');
    }
  }

  /**
   * Export user data
   */
  static async exportUserData(): Promise<ExportRequest> {
    try {
      const result = await exportUserDataFn({});

      return result.data as ExportRequest;
    } catch (error: any) {
      console.error('Error requesting data export:', error);
      throw new Error(error.message || 'Failed to request data export');
    }
  }

  /**
   * Get retention policy information
   */
  static async getRetentionPolicy(): Promise<RetentionPolicy> {
    try {
      const result = await getRetentionPolicyFn({});

      return result.data as RetentionPolicy;
    } catch (error: any) {
      console.error('Error getting retention policy:', error);
      throw new Error(error.message || 'Failed to get retention policy');
    }
  }

  /**
   * Format retention period for display
   */
  static formatRetentionPeriod(days: number): string {
    if (days >= 365) {
      const years = Math.floor(days / 365);
      return `${years} year${years > 1 ? 's' : ''}`;
    } else if (days >= 30) {
      const months = Math.floor(days / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${days} day${days > 1 ? 's' : ''}`;
    }
  }

  /**
   * Get user rights summary
   */
  static getUserRightsSummary(): string[] {
    return [
      'Right to deletion: You can request deletion of your personal data',
      'Right to export: You can export your personal data in a portable format',
      'Right to portability: You can transfer your data to another service',
      'Right to rectification: You can correct inaccurate personal data',
      'Right to access: You can request information about your personal data',
      'Right to restriction: You can request restriction of data processing',
    ];
  }

  /**
   * Get data types collected
   */
  static getDataTypesCollected(): string[] {
    return [
      'Profile information (name, email, phone)',
      'Booking history and preferences',
      'Payment information and transaction history',
      'User-generated content (posts, comments, reviews)',
      'Location data (if location services enabled)',
      'Usage analytics and app interactions',
      'Communication logs and support tickets',
      'Device information and technical logs',
    ];
  }

  /**
   * Get data sharing information
   */
  static getDataSharingInfo(): string[] {
    return [
      'Data is shared with teachers for booking purposes',
      'Payment data is shared with payment processors (Stripe)',
      'Analytics data is shared with analytics providers',
      'Data may be shared with legal authorities if required by law',
      'Data is not sold to third parties for marketing purposes',
    ];
  }
}




















