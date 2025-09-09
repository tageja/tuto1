import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, spacing, typography } from '../theme';
import { subjects, Subject } from '../data/subjects';

const { width } = Dimensions.get('window');

interface PaymentsScreenProps {
  navigation: any;
}

interface Payment {
  id: string;
  subject: Subject;
  teacher: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  type: 'enrollment' | 'session' | 'material';
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '3m' | '6m' | '12m'>('3m');
  
  // Get academic subjects from the subjects data
  const academicSubjects = subjects.filter((subject: Subject) => subject.category === 'academic');

  const [recentPayments] = useState<Payment[]>([
    {
      id: '1',
      subject: academicSubjects.find((s: Subject) => s.key === 'math')!,
      teacher: 'Ms. Sarah Johnson',
      amount: 500000,
      date: '2024-01-15',
      status: 'completed',
      type: 'enrollment',
    },
    {
      id: '2',
      subject: academicSubjects.find((s: Subject) => s.key === 'english')!,
      teacher: 'Mr. David Chen',
      amount: 300000,
      date: '2024-01-12',
      status: 'completed',
      type: 'session',
    },
    {
      id: '3',
      subject: academicSubjects.find((s: Subject) => s.key === 'physics')!,
      teacher: 'Dr. Emily Rodriguez',
      amount: 400000,
      date: '2024-01-10',
      status: 'completed',
      type: 'enrollment',
    },
  ]);

  const [upcomingPayments] = useState<Payment[]>([
    {
      id: '4',
      subject: academicSubjects.find((s: Subject) => s.key === 'math')!,
      teacher: 'Ms. Sarah Johnson',
      amount: 500000,
      date: '2024-01-25',
      status: 'pending',
      type: 'enrollment',
    },
    {
      id: '5',
      subject: academicSubjects.find((s: Subject) => s.key === 'english')!,
      teacher: 'Mr. David Chen',
      amount: 300000,
      date: '2024-01-28',
      status: 'pending',
      type: 'session',
    },
    {
      id: '6',
      subject: academicSubjects.find((s: Subject) => s.key === 'physics')!,
      teacher: 'Dr. Emily Rodriguez',
      amount: 400000,
      date: '2024-01-30',
      status: 'pending',
      type: 'enrollment',
    },
  ]);

  const [monthlySpending] = useState<Payment[]>([
    {
      id: '7',
      subject: academicSubjects.find((s: Subject) => s.key === 'math')!,
      teacher: 'Ms. Sarah Johnson',
      amount: 500000,
      date: '2024-01-05',
      status: 'completed',
      type: 'enrollment',
    },
    {
      id: '8',
      subject: academicSubjects.find((s: Subject) => s.key === 'english')!,
      teacher: 'Mr. David Chen',
      amount: 300000,
      date: '2024-01-08',
      status: 'completed',
      type: 'session',
    },
    {
      id: '9',
      subject: academicSubjects.find((s: Subject) => s.key === 'physics')!,
      teacher: 'Dr. Emily Rodriguez',
      amount: 400000,
      date: '2024-01-12',
      status: 'completed',
      type: 'enrollment',
    },
  ]);

  // Calculate totals
  const totalSpent = recentPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const monthlySpendingTotal = monthlySpending.reduce((sum, payment) => sum + payment.amount, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return colors.status.success;
      case 'pending':
        return colors.status.warning;
      case 'overdue':
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'check-circle';
      case 'pending':
        return 'schedule';
      case 'overdue':
        return 'error';
      default:
        return 'info';
    }
  };

  const renderTotalSection = () => (
    <View style={styles.totalSection}>
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>{t('payments.totalSpent')}</Text>
        <Text style={styles.totalAmount}>{formatCurrency(totalSpent)}</Text>
        <Text style={styles.totalSubtext}>{t('payments.allTime')}</Text>
      </View>
      <View style={styles.monthlyCard}>
        <Text style={styles.monthlyLabel}>{t('payments.monthlySpending')}</Text>
        <Text style={styles.monthlyAmount}>{formatCurrency(monthlySpendingTotal)}</Text>
        <Text style={styles.monthlySubtext}>{t('payments.thisMonth')}</Text>
      </View>
    </View>
  );

  const renderRecentPayments = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('payments.lastPayments')}</Text>
      {recentPayments.map((payment) => (
        <View key={payment.id} style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTeacher}>{payment.teacher}</Text>
              <Text style={styles.paymentSubject}>
                {language === 'en' ? payment.subject.nameEn : payment.subject.nameVi}
              </Text>
            </View>
            <View style={styles.paymentAmount}>
              <Text style={styles.amountText}>{formatCurrency(payment.amount)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
                <MaterialIcons 
                  name={getStatusIcon(payment.status) as any} 
                  size={12} 
                  color={colors.background.primary} 
                />
                <Text style={styles.statusText}>{payment.status}</Text>
              </View>
            </View>
          </View>
          <View style={styles.paymentDate}>
            <MaterialIcons name="event" size={14} color={colors.text.secondary} />
            <Text style={styles.dateText}>{payment.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderUpcomingPayments = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('payments.upcomingPayments')}</Text>
      {upcomingPayments.map((payment) => (
        <View key={payment.id} style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTeacher}>{payment.teacher}</Text>
              <Text style={styles.paymentSubject}>
                {language === 'en' ? payment.subject.nameEn : payment.subject.nameVi}
              </Text>
            </View>
            <View style={styles.paymentAmount}>
              <Text style={styles.amountText}>{formatCurrency(payment.amount)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
                <MaterialIcons 
                  name={getStatusIcon(payment.status) as any} 
                  size={12} 
                  color={colors.background.primary} 
                />
                <Text style={styles.statusText}>{payment.status}</Text>
              </View>
            </View>
          </View>
          <View style={styles.paymentDate}>
            <MaterialIcons name="event" size={14} color={colors.text.secondary} />
            <Text style={styles.dateText}>{payment.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderMonthlySpending = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t('payments.monthlySpending')}</Text>
      {monthlySpending.map((payment) => (
        <View key={payment.id} style={styles.paymentCard}>
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTeacher}>{payment.teacher}</Text>
              <Text style={styles.paymentSubject}>
                {language === 'en' ? payment.subject.nameEn : payment.subject.nameVi}
              </Text>
            </View>
            <View style={styles.paymentAmount}>
              <Text style={styles.amountText}>{formatCurrency(payment.amount)}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
                <MaterialIcons 
                  name={getStatusIcon(payment.status) as any} 
                  size={12} 
                  color={colors.background.primary} 
                />
                <Text style={styles.statusText}>{payment.status}</Text>
              </View>
            </View>
          </View>
          <View style={styles.paymentDate}>
            <MaterialIcons name="event" size={14} color={colors.text.secondary} />
            <Text style={styles.dateText}>{payment.date}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('payments.title')}</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <MaterialIcons name="history" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Total Section */}
        {renderTotalSection()}

        {/* Last Payments */}
        {renderRecentPayments()}

        {/* Enrollments */}
        {/* renderEnrollments() */}

        {/* Upcoming Payments */}
        {renderUpcomingPayments()}

        {/* Monthly Spending */}
        {renderMonthlySpending()}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  historyButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
  },
  totalSection: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  totalCard: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.background.primary,
    marginBottom: spacing.xs,
  },
  totalAmount: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.background.primary,
  },
  totalSubtext: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.background.primary,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  monthlyCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  monthlyLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  monthlyAmount: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  monthlySubtext: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  paymentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTeacher: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  paymentSubject: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.background.primary,
    textTransform: 'capitalize',
  },
  paymentDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dateText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  enrollmentCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  enrollmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  enrollmentInfo: {
    flex: 1,
  },
  enrollmentTeacher: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  enrollmentSubject: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  enrollmentDetails: {
    gap: spacing.xs,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  upcomingCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTeacher: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  upcomingSubject: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  upcomingAmount: {
    alignItems: 'flex-end',
  },
  daysLeftBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  daysLeftText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.background.primary,
  },
  upcomingDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
}); 