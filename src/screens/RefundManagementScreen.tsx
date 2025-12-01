import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';

// Inline theme constants (since src/config/theme.ts doesn't exist)
const colors = {
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFC',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    error: '#E53E3E',
    success: '#38A169',
  },
  border: {
    light: '#E2E8F0',
  },
  surface: '#F7FAFC',
  primary: '#0B5FFF',
};

const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
  },
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};

interface Refund {
  id: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  reason: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled';
  createdBy: string;
  createdAt: string;
  processedAt?: string;
  canceledAt?: string;
  canceledBy?: string;
  cancelReason?: string;
}

interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  userId: string;
  bookingId?: string;
  createdAt: string;
}

const RefundManagementScreen: React.FC = () => {
  const { language } = useLanguage();
  const { userData } = useUser();
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPaymentIntent, setSelectedPaymentIntent] = useState<PaymentIntent | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [creatingRefund, setCreatingRefund] = useState(false);

  // Check admin access
  if (userData?.type !== 'admin') {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="block" size={48} color={colors.text.error} />
          <Text style={styles.errorText}>
            {language === 'vi' ? 'Không có quyền truy cập' : 'Access Denied'}
          </Text>
          <Text style={styles.errorSubtext}>
            {language === 'vi' 
              ? 'Chỉ quản trị viên mới có thể truy cập trang này.'
              : 'Only administrators can access this page.'
            }
          </Text>
        </View>
      </View>
    );
  }

  useEffect(() => {
    loadRefunds();
  }, []);

  const loadRefunds = async () => {
    try {
      setLoading(true);
      // In a real implementation, you would call the backend function here
      // const result = await Backend.getRefundHistory({ limit: 100 });
      // setRefunds(result.refunds);
      
      // Mock data for now
      setRefunds([
        {
          id: 'ref_1',
          paymentIntentId: 'pi_123',
          amount: 50000,
          currency: 'vnd',
          reason: 'Customer requested refund',
          status: 'succeeded',
          createdBy: 'admin_1',
          createdAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        },
        {
          id: 'ref_2',
          paymentIntentId: 'pi_124',
          amount: 25000,
          currency: 'vnd',
          reason: 'Service not provided',
          status: 'pending',
          createdBy: 'admin_1',
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error loading refunds:', error);
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        language === 'vi' ? 'Không thể tải danh sách hoàn tiền' : 'Failed to load refunds'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRefunds();
    setRefreshing(false);
  };

  const handleCreateRefund = async () => {
    if (!selectedPaymentIntent || !refundAmount || !refundReason.trim()) {
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        language === 'vi' ? 'Vui lòng điền đầy đủ thông tin' : 'Please fill in all required fields'
      );
      return;
    }

    const amount = parseFloat(refundAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedPaymentIntent.amount) {
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        language === 'vi' ? 'Số tiền hoàn không hợp lệ' : 'Invalid refund amount'
      );
      return;
    }

    try {
      setCreatingRefund(true);
      // In a real implementation, you would call the backend function here
      // await Backend.createRefund({
      //   paymentIntentId: selectedPaymentIntent.id,
      //   amount: amount,
      //   reason: refundReason,
      //   notifyUser: true,
      // });
      
      Alert.alert(
        language === 'vi' ? 'Thành công' : 'Success',
        language === 'vi' ? 'Hoàn tiền đã được tạo thành công' : 'Refund created successfully'
      );
      
      setShowCreateModal(false);
      setSelectedPaymentIntent(null);
      setRefundAmount('');
      setRefundReason('');
      await loadRefunds();
    } catch (error) {
      console.error('Error creating refund:', error);
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        language === 'vi' ? 'Không thể tạo hoàn tiền' : 'Failed to create refund'
      );
    } finally {
      setCreatingRefund(false);
    }
  };

  const handleCancelRefund = async (refundId: string) => {
    Alert.alert(
      language === 'vi' ? 'Xác nhận hủy' : 'Confirm Cancel',
      language === 'vi' ? 'Bạn có chắc chắn muốn hủy hoàn tiền này?' : 'Are you sure you want to cancel this refund?',
      [
        { text: language === 'vi' ? 'Hủy' : 'Cancel', style: 'cancel' },
        {
          text: language === 'vi' ? 'Xác nhận' : 'Confirm',
          style: 'destructive',
          onPress: async () => {
            try {
              // In a real implementation, you would call the backend function here
              // await Backend.cancelRefund({ refundId, reason: 'Admin canceled' });
              
              Alert.alert(
                language === 'vi' ? 'Thành công' : 'Success',
                language === 'vi' ? 'Hoàn tiền đã được hủy' : 'Refund canceled successfully'
              );
              await loadRefunds();
            } catch (error) {
              console.error('Error canceling refund:', error);
              Alert.alert(
                language === 'vi' ? 'Lỗi' : 'Error',
                language === 'vi' ? 'Không thể hủy hoàn tiền' : 'Failed to cancel refund'
              );
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return colors.text.success;
      case 'failed': return colors.text.error;
      case 'pending': return '#F6AD55';
      case 'canceled': return colors.text.secondary;
      default: return colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'succeeded': return language === 'vi' ? 'Thành công' : 'Succeeded';
      case 'failed': return language === 'vi' ? 'Thất bại' : 'Failed';
      case 'pending': return language === 'vi' ? 'Đang xử lý' : 'Pending';
      case 'canceled': return language === 'vi' ? 'Đã hủy' : 'Canceled';
      default: return status;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'vnd') {
      return `${amount.toLocaleString('vi-VN')} VND`;
    }
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  };

  const renderRefundItem = ({ item }: { item: Refund }) => (
    <View style={styles.refundItem}>
      <View style={styles.refundHeader}>
        <Text style={styles.refundId}>#{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.refundDetails}>
        <Text style={styles.refundAmount}>
          {formatAmount(item.amount, item.currency)}
        </Text>
        <Text style={styles.refundReason}>{item.reason}</Text>
        <Text style={styles.refundDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {item.status === 'pending' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelRefund(item.id)}
        >
          <MaterialIcons name="cancel" size={20} color={colors.text.error} />
          <Text style={styles.cancelButtonText}>
            {language === 'vi' ? 'Hủy' : 'Cancel'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {language === 'vi' ? 'Đang tải...' : 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === 'vi' ? 'Quản lý hoàn tiền' : 'Refund Management'}
        </Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <MaterialIcons name="add" size={24} color={colors.background.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={refunds}
        renderItem={renderRefundItem}
        keyExtractor={(item) => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="receipt" size={48} color={colors.text.secondary} />
            <Text style={styles.emptyText}>
              {language === 'vi' ? 'Không có hoàn tiền nào' : 'No refunds found'}
            </Text>
          </View>
        }
      />

      {/* Create Refund Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {language === 'vi' ? 'Tạo hoàn tiền' : 'Create Refund'}
            </Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>
              {language === 'vi' ? 'Số tiền hoàn' : 'Refund Amount'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={refundAmount}
              onChangeText={setRefundAmount}
              placeholder={language === 'vi' ? 'Nhập số tiền' : 'Enter amount'}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>
              {language === 'vi' ? 'Lý do hoàn tiền' : 'Refund Reason'}
            </Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={refundReason}
              onChangeText={setRefundReason}
              placeholder={language === 'vi' ? 'Nhập lý do hoàn tiền' : 'Enter refund reason'}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitButton, creatingRefund && styles.submitButtonDisabled]}
              onPress={handleCreateRefund}
              disabled={creatingRefund}
            >
              {creatingRefund ? (
                <ActivityIndicator color={colors.background.primary} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {language === 'vi' ? 'Tạo hoàn tiền' : 'Create Refund'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
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
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: spacing.md,
  },
  refundItem: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  refundId: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  refundDetails: {
    marginBottom: spacing.sm,
  },
  refundAmount: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  refundReason: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  refundDate: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.text.error,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.error,
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  modalContent: {
    flex: 1,
    padding: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    backgroundColor: colors.background.primary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.background.primary,
  },
});

export default RefundManagementScreen;


































