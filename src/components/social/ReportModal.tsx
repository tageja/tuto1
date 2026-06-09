import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ReportReason } from '../../services/social/moderation.service';

interface Props {
  visible: boolean;
  onClose: () => void;
  targetType: 'post' | 'comment' | 'reel' | 'user';
  targetId: string;
  onSuccess?: () => void;
  onReport: (params: { targetType: string; targetId: string; reason: ReportReason; description?: string }) => Promise<void>;
}

const REASONS: ReportReason[] = [
  'spam',
  'harassment',
  'inappropriate',
  'misinformation',
  'impersonation',
  'child_safety',
  'other',
];

export default function ReportModal({
  visible,
  onClose,
  targetType,
  targetId,
  onSuccess,
  onReport,
}: Props) {
  const { t } = useLanguage();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!reason) return;
    setError(null);
    setLoading(true);
    try {
      await onReport({
        targetType: targetType === 'user' ? 'user' : targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      });
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal transparent visible={visible} onRequestClose={onClose} animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('community.report.title')}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialIcons name="close" size={24} color="#6B7280" />
            </Pressable>
          </View>

          <Text style={styles.label}>{t('community.report.reason')}</Text>
          <View style={styles.reasonList}>
            {REASONS.map((r) => (
              <Pressable
                key={r}
                style={[styles.reasonItem, reason === r && styles.reasonItemSelected]}
                onPress={() => setReason(r)}
              >
                <MaterialIcons
                  name={reason === r ? 'radio-button-checked' : 'radio-button-unchecked'}
                  size={20}
                  color={reason === r ? '#0B5FFF' : '#9CA3AF'}
                />
                <Text style={styles.reasonText}>{t(`community.report.reasons.${r}`)}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>{t('community.report.description')}</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder={t('community.report.description')}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={3}
          />

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.submitBtn, (!reason || loading) && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!reason || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>{t('community.report.submit')}</Text>
            )}
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000060',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8,
  },
  reasonList: {
    marginBottom: 20,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  reasonItemSelected: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#0B5FFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
