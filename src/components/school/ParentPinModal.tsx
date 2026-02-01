/**
 * Parent PIN Modal
 * Modal for parents to enter 6-digit school PIN to join a school
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { validateParentPin } from '../../services/school/parentPin';

export interface ParentPinModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (schoolId: string, schoolName?: string) => void;
  userEmail: string;
}

const PIN_LENGTH = 6;
const PIN_REGEX = /^[0-9]{6}$/;

export const ParentPinModal: React.FC<ParentPinModalProps> = ({
  visible,
  onClose,
  onSuccess,
  userEmail,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useLanguage();

  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePinChange = useCallback(
    (text: string) => {
      const numericOnly = text.replace(/[^0-9]/g, '');
      if (numericOnly.length <= PIN_LENGTH) {
        setPin(numericOnly);
        setError(null);
      }
    },
    []
  );

  const handleSubmit = useCallback(async () => {
    if (!pin.trim()) {
      setError(t('welcome.pinModal.error.invalidFormat') || 'PIN must be exactly 6 digits');
      return;
    }

    if (!PIN_REGEX.test(pin.trim())) {
      setError(t('welcome.pinModal.error.invalidFormat') || 'PIN must be exactly 6 digits');
      return;
    }

    if (!userEmail) {
      setError('Please log in to continue');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await validateParentPin(pin.trim(), userEmail);

      if (result.success && result.schoolId) {
        onSuccess(result.schoolId, result.schoolName);
        setPin('');
        setError(null);
      } else {
        setError(
          result.error ||
            t('welcome.pinModal.error.invalidPin') ||
            'Invalid PIN or school is not active'
        );
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [pin, userEmail, onSuccess, t]);

  const handleClose = useCallback(() => {
    setPin('');
    setError(null);
    setLoading(false);
    onClose();
  }, [onClose]);

  const isValidPin = PIN_REGEX.test(pin.trim());
  const submitDisabled = loading || !isValidPin;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
    },
    closeButton: {
      padding: spacing.xs,
    },
    content: {
      flex: 1,
      padding: spacing.lg,
      justifyContent: 'center',
    },
    iconRow: {
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: error ? colors.status.error : colors.border.light,
    },
    input: {
      flex: 1,
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginLeft: spacing.sm,
      letterSpacing: 4,
      ...(Platform.OS === 'web' ? {} : { paddingVertical: 0 }),
    },
    hint: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.md,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.status.error + '15',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.status.error,
    },
    errorText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: colors.status.error,
      marginLeft: spacing.sm,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacing.md,
      marginTop: spacing.lg,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    cancelButtonText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.secondary,
    },
    submitButton: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      ...shadows.md,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.white,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} disabled={loading} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {t('welcome.pinModal.title') || 'Enter School PIN'}
          </Text>
          <View style={styles.closeButton} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconRow}>
            <MaterialIcons name="vpn-key" size={48} color={colors.primary} />
          </View>
          <Text style={styles.hint}>
            {t('welcome.pinModal.subtitle') || 'Enter the 6-digit code provided by your school'}
          </Text>

          <Text style={[styles.hint, { marginBottom: spacing.xs }]}>
            {t('welcome.pinModal.inputLabel') || 'School PIN Code'}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={pin}
              onChangeText={handlePinChange}
              placeholder="000000"
              placeholderTextColor={colors.text.light}
              keyboardType="number-pad"
              maxLength={PIN_LENGTH}
              editable={!loading}
              autoFocus
            />
          </View>
          <Text style={styles.hint}>
            {t('welcome.pinModal.inputHint') || 'Enter the 6-digit code (numbers only)'}
          </Text>

          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={20} color={colors.status.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>
                {t('welcome.pinModal.cancelButton') || 'Cancel'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, submitDisabled && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitDisabled}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>
                  {t('welcome.pinModal.submitButton') || 'Join School'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
