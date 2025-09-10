/**
 * Payment Screen
 * 
 * Handles payment processing for bookings and other transactions.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '../contexts/LanguageContext';
import { PaymentService, Currency, PaymentMethodType, PaymentResult } from '../services/payments';

// Theme constants
const colors = {
  primary: '#0B5FFF',
  background: {
    primary: '#FFFFFF',
  },
  surface: '#F9FAFC',
  text: {
    primary: '#333333',
    secondary: '#666666',
  },
  border: {
    light: '#E5E5E5',
  },
  success: '#34C759',
  error: '#FF3B30',
};

const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
  },
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

interface PaymentScreenProps {
  navigation: any;
  route: {
    params: {
      amount: number;
      currency?: Currency;
      description?: string;
      bookingId?: string;
    };
  };
}

export const PaymentScreen: React.FC<PaymentScreenProps> = ({ navigation, route }) => {
  const { t } = useLanguage();
  const { amount, currency = Currency.VND, description, bookingId } = route.params;
  
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [loading, setLoading] = useState(false);
  const [availableMethods, setAvailableMethods] = useState<PaymentMethodType[]>([]);

  useEffect(() => {
    loadAvailablePaymentMethods();
  }, [currency]);

  const loadAvailablePaymentMethods = async () => {
    try {
      const methods = PaymentService.getSupportedPaymentMethods(currency);
      const availableMethods = [];
      
      for (const method of methods) {
        const isAvailable = await PaymentService.isPaymentMethodAvailable(method);
        if (isAvailable) {
          availableMethods.push(method);
        }
      }
      
      setAvailableMethods(availableMethods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    if (!PaymentService.validateAmount(amount, currency)) {
      Alert.alert('Error', 'Invalid payment amount');
      return;
    }

    setLoading(true);

    try {
      let result: PaymentResult;

      switch (selectedMethod) {
        case PaymentMethodType.APPLE_PAY:
          result = await PaymentService.payWithApplePay(amount, currency, description);
          break;
        case PaymentMethodType.GOOGLE_PAY:
          result = await PaymentService.payWithGooglePay(amount, currency, description);
          break;
        default:
          // For card payments, we would typically show a card input form
          result = await PaymentService.confirmPayment('mock_client_secret');
          break;
      }

      if (result.success) {
        Alert.alert(
          'Payment Successful',
          'Your payment has been processed successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', result.error || 'Payment could not be processed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'An error occurred during payment processing');
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentMethod = (method: PaymentMethodType) => {
    const isSelected = selectedMethod === method;
    const iconName = getPaymentMethodIcon(method);

    return (
      <TouchableOpacity
        key={method}
        style={[styles.paymentMethodCard, isSelected && styles.paymentMethodCardSelected]}
        onPress={() => setSelectedMethod(method)}
      >
        <View style={styles.paymentMethodContent}>
          <MaterialIcons
            name={iconName}
            size={24}
            color={isSelected ? colors.primary : colors.text.secondary}
          />
          <Text style={[styles.paymentMethodText, isSelected && styles.paymentMethodTextSelected]}>
            {PaymentService.getPaymentMethodDisplayName(method)}
          </Text>
        </View>
        {isSelected && (
          <MaterialIcons name="check-circle" size={24} color={colors.primary} />
        )}
      </TouchableOpacity>
    );
  };

  const getPaymentMethodIcon = (method: PaymentMethodType): any => {
    const icons: Record<PaymentMethodType, any> = {
      [PaymentMethodType.CARD]: 'credit-card',
      [PaymentMethodType.APPLE_PAY]: 'phone-iphone',
      [PaymentMethodType.GOOGLE_PAY]: 'android',
      [PaymentMethodType.BANK_TRANSFER]: 'account-balance',
    };
    return icons[method];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Payment Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Payment Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Amount</Text>
            <Text style={styles.summaryValue}>
              {PaymentService.formatAmount(amount, currency)}
            </Text>
          </View>
          {description && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Description</Text>
              <Text style={styles.summaryValue}>{description}</Text>
            </View>
          )}
          {bookingId && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Booking ID</Text>
              <Text style={styles.summaryValue}>{bookingId}</Text>
            </View>
          )}
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Payment Method</Text>
          {availableMethods.map(renderPaymentMethod)}
        </View>

        {/* Security Notice */}
        <View style={styles.securityNotice}>
          <MaterialIcons name="security" size={20} color={colors.success} />
          <Text style={styles.securityText}>
            Your payment information is secure and encrypted.
          </Text>
        </View>
      </ScrollView>

      {/* Payment Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, (!selectedMethod || loading) && styles.payButtonDisabled]}
          onPress={handlePayment}
          disabled={!selectedMethod || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background.primary} />
          ) : (
            <Text style={styles.payButtonText}>
              Pay {PaymentService.formatAmount(amount, currency)}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  summaryTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.sm,
  },
  paymentMethodCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  paymentMethodContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginLeft: spacing.md,
  },
  paymentMethodTextSelected: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  securityText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  payButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  payButtonDisabled: {
    backgroundColor: colors.text.secondary,
  },
  payButtonText: {
    color: colors.background.primary,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
});
