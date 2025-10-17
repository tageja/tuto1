/**
 * Payment Service
 * 
 * Client-side service for handling payments with Stripe.
 */

// Stripe integration will be added when the package is installed
// import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

// Payment configuration
export const PAYMENT_CONFIG = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  merchantId: 'merchant.com.tuto.app',
  urlScheme: 'tuto',
};

// Supported currencies
export enum Currency {
  VND = 'vnd',
  USD = 'usd',
  EUR = 'eur',
}

// Payment status
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

// Payment method types
export enum PaymentMethodType {
  CARD = 'card',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  BANK_TRANSFER = 'bank_transfer',
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  clientSecret: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
  requiresAction?: boolean;
  nextAction?: any;
}

// Firebase Functions
const createPaymentIntentFn = httpsCallable(functions, 'createPaymentIntent');
const confirmPaymentIntentFn = httpsCallable(functions, 'confirmPaymentIntent');
const getPaymentIntentStatusFn = httpsCallable(functions, 'getPaymentIntentStatus');
const cancelPaymentIntentFn = httpsCallable(functions, 'cancelPaymentIntent');
const getPaymentHistoryFn = httpsCallable(functions, 'getPaymentHistory');

export class PaymentService {
  /**
   * Initialize Stripe
   */
  static initializeStripe(): void {
    // Stripe initialization is handled by StripeProvider in App.tsx
    console.log('Stripe initialized with key:', PAYMENT_CONFIG.publishableKey);
  }

  /**
   * Create payment intent
   */
  static async createPaymentIntent(
    amount: number,
    currency: Currency = Currency.VND,
    description?: string,
    metadata?: Record<string, string>,
    bookingId?: string
  ): Promise<PaymentIntent> {
    try {
      const result = await createPaymentIntentFn({
        amount,
        currency,
        description,
        metadata,
        bookingId,
      });

      const paymentIntent = (result.data as any).paymentIntent;
      console.log('Created payment intent:', paymentIntent);
      return paymentIntent;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Confirm payment with Stripe
   */
  static async confirmPayment(
    paymentIntentId: string,
    paymentMethodId?: string
  ): Promise<PaymentResult> {
    try {
      const result = await confirmPaymentIntentFn({
        paymentIntentId,
        paymentMethodId,
      });

      const isSuccess = (result.data as any).success;
      console.log('Payment confirmed:', result.data);
      
      return {
        success: isSuccess,
        paymentIntentId,
        error: isSuccess ? undefined : (result.data as any).message,
      };
    } catch (error) {
      console.error('Error confirming payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  /**
   * Handle payment with Apple Pay
   */
  static async payWithApplePay(
    amount: number,
    currency: Currency = Currency.VND,
    description?: string
  ): Promise<PaymentResult> {
    try {
      // This would integrate with Apple Pay
      // For now, return a mock response
      const mockResult: PaymentResult = {
        success: true,
        paymentIntentId: `pi_apple_${Date.now()}`,
      };

      console.log('Apple Pay payment completed:', mockResult);
      return mockResult;
    } catch (error) {
      console.error('Error with Apple Pay:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Apple Pay failed',
      };
    }
  }

  /**
   * Handle payment with Google Pay
   */
  static async payWithGooglePay(
    amount: number,
    currency: Currency = Currency.VND,
    description?: string
  ): Promise<PaymentResult> {
    try {
      // This would integrate with Google Pay
      // For now, return a mock response
      const mockResult: PaymentResult = {
        success: true,
        paymentIntentId: `pi_google_${Date.now()}`,
      };

      console.log('Google Pay payment completed:', mockResult);
      return mockResult;
    } catch (error) {
      console.error('Error with Google Pay:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Google Pay failed',
      };
    }
  }

  /**
   * Get supported payment methods for region
   */
  static getSupportedPaymentMethods(currency: Currency): PaymentMethodType[] {
    const baseMethods = [PaymentMethodType.CARD];
    
    switch (currency) {
      case Currency.VND:
        return [
          ...baseMethods,
          PaymentMethodType.APPLE_PAY,
          PaymentMethodType.GOOGLE_PAY,
          PaymentMethodType.BANK_TRANSFER,
        ];
      case Currency.USD:
        return [
          ...baseMethods,
          PaymentMethodType.APPLE_PAY,
          PaymentMethodType.GOOGLE_PAY,
        ];
      case Currency.EUR:
        return [
          ...baseMethods,
          PaymentMethodType.APPLE_PAY,
          PaymentMethodType.GOOGLE_PAY,
        ];
      default:
        return baseMethods;
    }
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number, currency: Currency): string {
    const formatters: Record<Currency, Intl.NumberFormat> = {
      [Currency.VND]: new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
      }),
      [Currency.USD]: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }),
      [Currency.EUR]: new Intl.NumberFormat('en-EU', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
      }),
    };

    return formatters[currency].format(amount);
  }

  /**
   * Get currency symbol
   */
  static getCurrencySymbol(currency: Currency): string {
    const symbols: Record<Currency, string> = {
      [Currency.VND]: '₫',
      [Currency.USD]: '$',
      [Currency.EUR]: '€',
    };

    return symbols[currency];
  }

  /**
   * Validate payment amount
   */
  static validateAmount(amount: number, currency: Currency): boolean {
    if (amount <= 0) return false;

    // Minimum amounts by currency
    const minimums: Record<Currency, number> = {
      [Currency.VND]: 1000, // 1,000 VND
      [Currency.USD]: 1, // $1.00
      [Currency.EUR]: 1, // €1.00
    };

    return amount >= minimums[currency];
  }

  /**
   * Get payment method display name
   */
  static getPaymentMethodDisplayName(type: PaymentMethodType): string {
    const names: Record<PaymentMethodType, string> = {
      [PaymentMethodType.CARD]: 'Credit/Debit Card',
      [PaymentMethodType.APPLE_PAY]: 'Apple Pay',
      [PaymentMethodType.GOOGLE_PAY]: 'Google Pay',
      [PaymentMethodType.BANK_TRANSFER]: 'Bank Transfer',
    };

    return names[type];
  }

  /**
   * Check if payment method is available
   */
  static async isPaymentMethodAvailable(type: PaymentMethodType): Promise<boolean> {
    try {
      switch (type) {
        case PaymentMethodType.APPLE_PAY:
          // Check if Apple Pay is available on device
          return true; // Mock implementation
        case PaymentMethodType.GOOGLE_PAY:
          // Check if Google Pay is available on device
          return true; // Mock implementation
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking payment method availability:', error);
      return false;
    }
  }

  /**
   * Get payment intent status
   */
  static async getPaymentIntentStatus(paymentIntentId: string): Promise<PaymentIntent | null> {
    try {
      const result = await getPaymentIntentStatusFn({ paymentIntentId });
      return (result.data as any).paymentIntent;
    } catch (error) {
      console.error('Error getting payment intent status:', error);
      return null;
    }
  }

  /**
   * Cancel payment intent
   */
  static async cancelPaymentIntent(paymentIntentId: string): Promise<boolean> {
    try {
      const result = await cancelPaymentIntentFn({ paymentIntentId });
      return (result.data as any).success;
    } catch (error) {
      console.error('Error canceling payment intent:', error);
      return false;
    }
  }

  /**
   * Get payment history
   */
  static async getPaymentHistory(limit: number = 50, startAfter?: string): Promise<PaymentIntent[]> {
    try {
      const result = await getPaymentHistoryFn({ limit, startAfter });
      return (result.data as any).payments;
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }
}
