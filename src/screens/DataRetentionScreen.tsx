import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { DataRetentionService, RetentionPolicy } from '../services/dataRetention';

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
    warning: '#F6AD55',
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

const DataRetentionScreen: React.FC = () => {
  const { language } = useLanguage();
  const [retentionPolicy, setRetentionPolicy] = useState<RetentionPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [confirmDeletion, setConfirmDeletion] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadRetentionPolicy();
  }, []);

  const loadRetentionPolicy = async () => {
    try {
      setLoading(true);
      const policy = await DataRetentionService.getRetentionPolicy();
      setRetentionPolicy(policy);
    } catch (error) {
      console.error('Error loading retention policy:', error);
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        language === 'vi' ? 'Không thể tải chính sách dữ liệu' : 'Failed to load data policy'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeletion = async () => {
    if (!confirmDeletion) {
      Alert.alert(
        language === 'vi' ? 'Xác nhận' : 'Confirmation Required',
        language === 'vi' ? 'Vui lòng xác nhận việc xóa tài khoản' : 'Please confirm account deletion'
      );
      return;
    }

    try {
      setProcessing(true);
      const result = await DataRetentionService.requestAccountDeletion(
        deletionReason,
        confirmDeletion
      );

      Alert.alert(
        language === 'vi' ? 'Thành công' : 'Success',
        result.message
      );

      setShowDeletionModal(false);
      setDeletionReason('');
      setConfirmDeletion(false);
    } catch (error) {
      console.error('Error requesting deletion:', error);
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        error instanceof Error ? error.message : 'Failed to request deletion'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestExport = async () => {
    try {
      setProcessing(true);
      const result = await DataRetentionService.exportUserData();

      Alert.alert(
        language === 'vi' ? 'Thành công' : 'Success',
        result.message
      );

      setShowExportModal(false);
    } catch (error) {
      console.error('Error requesting export:', error);
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        error instanceof Error ? error.message : 'Failed to request data export'
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelDeletion = async () => {
    try {
      setProcessing(true);
      const result = await DataRetentionService.cancelAccountDeletion();

      Alert.alert(
        language === 'vi' ? 'Thành công' : 'Success',
        result.message
      );
    } catch (error) {
      console.error('Error cancelling deletion:', error);
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        error instanceof Error ? error.message : 'Failed to cancel deletion'
      );
    } finally {
      setProcessing(false);
    }
  };

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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === 'vi' ? 'Quyền riêng tư & Dữ liệu' : 'Privacy & Data Rights'}
        </Text>
      </View>

      <View style={styles.content}>
        {/* Data Types Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'vi' ? 'Dữ liệu chúng tôi thu thập' : 'Data We Collect'}
          </Text>
          {DataRetentionService.getDataTypesCollected().map((dataType, index) => (
            <Text key={index} style={styles.listItem}>
              • {dataType}
            </Text>
          ))}
        </View>

        {/* Data Sharing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'vi' ? 'Chia sẻ dữ liệu' : 'Data Sharing'}
          </Text>
          {DataRetentionService.getDataSharingInfo().map((info, index) => (
            <Text key={index} style={styles.listItem}>
              • {info}
            </Text>
          ))}
        </View>

        {/* Retention Periods Section */}
        {retentionPolicy && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'vi' ? 'Thời gian lưu trữ dữ liệu' : 'Data Retention Periods'}
            </Text>
            <View style={styles.retentionItem}>
              <Text style={styles.retentionLabel}>
                {language === 'vi' ? 'Dữ liệu người dùng:' : 'User Data:'}
              </Text>
              <Text style={styles.retentionValue}>
                {DataRetentionService.formatRetentionPeriod(retentionPolicy.retentionPeriods.USER_DATA)}
              </Text>
            </View>
            <View style={styles.retentionItem}>
              <Text style={styles.retentionLabel}>
                {language === 'vi' ? 'Nội dung người dùng:' : 'User Content:'}
              </Text>
              <Text style={styles.retentionValue}>
                {DataRetentionService.formatRetentionPeriod(retentionPolicy.retentionPeriods.UGC_CONTENT)}
              </Text>
            </View>
            <View style={styles.retentionItem}>
              <Text style={styles.retentionLabel}>
                {language === 'vi' ? 'Nhật ký kiểm toán:' : 'Audit Logs:'}
              </Text>
              <Text style={styles.retentionValue}>
                {DataRetentionService.formatRetentionPeriod(retentionPolicy.retentionPeriods.AUDIT_LOGS)}
              </Text>
            </View>
            <View style={styles.retentionItem}>
              <Text style={styles.retentionLabel}>
                {language === 'vi' ? 'Dữ liệu thanh toán:' : 'Payment Data:'}
              </Text>
              <Text style={styles.retentionValue}>
                {DataRetentionService.formatRetentionPeriod(retentionPolicy.retentionPeriods.PAYMENT_DATA)}
              </Text>
            </View>
          </View>
        )}

        {/* User Rights Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'vi' ? 'Quyền của bạn' : 'Your Rights'}
          </Text>
          {DataRetentionService.getUserRightsSummary().map((right, index) => (
            <Text key={index} style={styles.listItem}>
              • {right}
            </Text>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => setShowExportModal(true)}
          >
            <MaterialIcons name="download" size={24} color={colors.primary} />
            <Text style={styles.exportButtonText}>
              {language === 'vi' ? 'Xuất dữ liệu' : 'Export Data'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deletionButton}
            onPress={() => setShowDeletionModal(true)}
          >
            <MaterialIcons name="delete" size={24} color={colors.text.error} />
            <Text style={styles.deletionButtonText}>
              {language === 'vi' ? 'Xóa tài khoản' : 'Delete Account'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Export Modal */}
      <Modal
        visible={showExportModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {language === 'vi' ? 'Xuất dữ liệu' : 'Export Data'}
            </Text>
            <TouchableOpacity onPress={() => setShowExportModal(false)}>
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.modalDescription}>
              {language === 'vi' 
                ? 'Bạn sẽ nhận được email với liên kết tải xuống dữ liệu của mình trong vòng 24 giờ.'
                : 'You will receive an email with a download link for your data within 24 hours.'
              }
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, processing && styles.modalButtonDisabled]}
              onPress={handleRequestExport}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color={colors.background.primary} />
              ) : (
                <Text style={styles.modalButtonText}>
                  {language === 'vi' ? 'Yêu cầu xuất dữ liệu' : 'Request Data Export'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Deletion Modal */}
      <Modal
        visible={showDeletionModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {language === 'vi' ? 'Xóa tài khoản' : 'Delete Account'}
            </Text>
            <TouchableOpacity onPress={() => setShowDeletionModal(false)}>
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <Text style={styles.warningText}>
              {language === 'vi' 
                ? '⚠️ Cảnh báo: Việc xóa tài khoản là không thể hoàn tác. Tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn.'
                : '⚠️ Warning: Account deletion is irreversible. All your data will be permanently deleted.'
              }
            </Text>

            <Text style={styles.modalDescription}>
              {language === 'vi' 
                ? 'Tài khoản của bạn sẽ bị xóa sau 7 ngày. Bạn có thể hủy yêu cầu này bất cứ lúc nào trước khi tài khoản bị xóa.'
                : 'Your account will be deleted after 7 days. You can cancel this request at any time before the account is deleted.'
              }
            </Text>

            <Text style={styles.inputLabel}>
              {language === 'vi' ? 'Lý do xóa tài khoản (tùy chọn)' : 'Reason for deletion (optional)'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={deletionReason}
              onChangeText={setDeletionReason}
              placeholder={language === 'vi' ? 'Nhập lý do...' : 'Enter reason...'}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setConfirmDeletion(!confirmDeletion)}
            >
              <MaterialIcons
                name={confirmDeletion ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={confirmDeletion ? colors.primary : colors.text.secondary}
              />
              <Text style={styles.checkboxText}>
                {language === 'vi' 
                  ? 'Tôi hiểu rằng việc xóa tài khoản là không thể hoàn tác'
                  : 'I understand that account deletion is irreversible'
                }
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton, processing && styles.modalButtonDisabled]}
              onPress={handleRequestDeletion}
              disabled={processing}
            >
              {processing ? (
                <ActivityIndicator color={colors.background.primary} />
              ) : (
                <Text style={styles.modalButtonText}>
                  {language === 'vi' ? 'Xác nhận xóa tài khoản' : 'Confirm Account Deletion'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
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
  content: {
    padding: spacing.lg,
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
  listItem: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  retentionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  retentionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    flex: 1,
  },
  retentionValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  actionsSection: {
    marginTop: spacing.xl,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.md,
  },
  exportButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
    marginLeft: spacing.sm,
  },
  deletionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.text.error,
  },
  deletionButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.error,
    marginLeft: spacing.sm,
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
  modalDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.warning,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
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
    marginBottom: spacing.md,
    textAlignVertical: 'top',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  checkboxText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: colors.text.error,
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
  modalButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.background.primary,
  },
});

export default DataRetentionScreen;


















