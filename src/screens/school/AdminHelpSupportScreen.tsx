import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useSchool } from '../../contexts/SchoolContext';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../config/supabase';

type Category = 'bug' | 'feature' | 'improvement' | 'question' | 'other';
const CATEGORIES: Category[] = ['bug', 'feature', 'improvement', 'question', 'other'];

interface FeedbackRow {
  id: string;
  category: string;
  body: string;
  status: string;
  admin_response: string | null;
  responded_at: string | null;
  created_at: string;
}

export default function AdminHelpSupportScreen() {
  const navigation = useNavigation();
  const { colors, spacing, typography, borderRadius } = useTheme();
  const { language } = useLanguage();
  const { currentSchool } = useSchool();
  const { userData } = useUser();

  const [list, setList] = useState<FeedbackRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [category, setCategory] = useState<Category>('question');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const schoolId = currentSchool?.id ?? '';

  const loadList = useCallback(async () => {
    if (!schoolId) return;
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from('platform_feedback')
        .select('id, category, body, status, admin_response, responded_at, created_at')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
      if (!error && data) setList(data);
    } catch (e) {
      console.error('Help & Support load error:', e);
    } finally {
      setLoadingList(false);
    }
  }, [schoolId]);

  useEffect(() => { loadList(); }, [loadList]);

  const handleSubmit = async () => {
    const trimmed = body.trim();
    if (trimmed.length < 1) {
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        language === 'vi' ? 'Vui lòng nhập nội dung.' : 'Please enter a message.'
      );
      return;
    }
    if (trimmed.length > 5000) {
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        language === 'vi' ? 'Nội dung tối đa 5000 ký tự.' : 'Message must be under 5000 characters.'
      );
      return;
    }
    if (!userData?.id || !schoolId) {
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        language === 'vi' ? 'Không tìm thấy thông tin trường.' : 'School information not found.'
      );
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('platform_feedback').insert({
        school_id: schoolId,
        submitted_by_user_id: userData.id,
        category,
        body: trimmed,
      });
      if (error) {
        console.error('platform_feedback insert error:', error);
        Alert.alert(
          language === 'vi' ? 'Lỗi' : 'Error',
          language === 'vi' ? 'Gửi thất bại. Vui lòng thử lại.' : 'Submission failed. Please try again.'
        );
        return;
      }
      setBody('');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      await loadList();
    } catch {
      Alert.alert(
        language === 'vi' ? 'Lỗi' : 'Error',
        language === 'vi' ? 'Không thể kết nối. Vui lòng thử lại.' : 'Could not connect. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const categoryLabel = (c: string) => {
    const labels: Record<string, { en: string; vi: string }> = {
      bug:         { en: 'Bug Report',      vi: 'Báo lỗi' },
      feature:     { en: 'Feature Request', vi: 'Yêu cầu tính năng' },
      improvement: { en: 'Improvement',     vi: 'Cải tiến' },
      question:    { en: 'Question',        vi: 'Câu hỏi' },
      other:       { en: 'Other',           vi: 'Khác' },
    };
    return language === 'vi' ? (labels[c]?.vi ?? c) : (labels[c]?.en ?? c);
  };

  const statusLabel = (s: string) => {
    const labels: Record<string, { en: string; vi: string }> = {
      open:        { en: 'Open',        vi: 'Đang mở' },
      in_progress: { en: 'In Progress', vi: 'Đang xử lý' },
      closed:      { en: 'Closed',      vi: 'Đã đóng' },
      rejected:    { en: 'Rejected',    vi: 'Từ chối' },
    };
    return language === 'vi' ? (labels[s]?.vi ?? s) : (labels[s]?.en ?? s);
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
      });
    } catch { return iso; }
  };

  const categoryBgColor: Record<string, string> = {
    bug: '#fee2e2', feature: '#dbeafe', improvement: '#fef3c7', question: '#f3f4f6', other: '#f1f5f9',
  };
  const categoryTextColor: Record<string, string> = {
    bug: '#991b1b', feature: '#1e40af', improvement: '#92400e', question: '#374151', other: '#475569',
  };
  const statusBgColor: Record<string, string> = {
    open: '#dcfce7', in_progress: '#dbeafe', closed: '#f3f4f6', rejected: '#fee2e2',
  };
  const statusTextColor: Record<string, string> = {
    open: '#166534', in_progress: '#1e40af', closed: '#374151', rejected: '#991b1b',
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.primary },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    backButton: { padding: spacing.sm, marginRight: spacing.md },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    content: { padding: spacing.lg },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    card: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
    categoryChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border.medium,
      backgroundColor: colors.background.primary,
    },
    categoryChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    categoryChipText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    categoryChipTextActive: { color: colors.primary },
    textInput: {
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
      backgroundColor: colors.background.primary,
      minHeight: 120,
      textAlignVertical: 'top',
      marginBottom: spacing.xs,
    },
    charCount: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      textAlign: 'right',
      marginBottom: spacing.md,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      paddingVertical: spacing.md,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    submitButtonDisabled: { opacity: 0.6 },
    submitButtonText: {
      color: '#fff',
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semibold,
    },
    successBanner: {
      backgroundColor: '#dcfce7',
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    successText: {
      color: '#166534',
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      flex: 1,
    },
    divider: { height: 1, backgroundColor: colors.border.light, marginVertical: spacing.xl },
    feedbackCard: {
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    feedbackHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    badgeText: { fontSize: typography.fontSize.xs, fontFamily: typography.fontFamily.semibold },
    feedbackBody: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
      marginVertical: spacing.xs,
    },
    feedbackDate: { fontSize: typography.fontSize.xs, color: colors.text.secondary },
    tutoResponseBox: {
      marginTop: spacing.sm,
      backgroundColor: colors.primary + '10',
      borderRadius: borderRadius.sm,
      padding: spacing.md,
    },
    tutoResponseLabel: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.semibold,
      color: colors.primary,
      marginBottom: 4,
    },
    tutoResponseText: { fontSize: typography.fontSize.sm, color: colors.text.primary },
    emptyText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'vi' ? 'Trợ lý & Hỗ trợ' : 'Help & Support'}
        </Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

          <Text style={styles.sectionTitle}>
            {language === 'vi' ? 'Gửi phản hồi tới Tuto' : 'Send Feedback to Tuto'}
          </Text>
          <View style={styles.card}>
            <Text style={styles.label}>
              {language === 'vi' ? 'Loại phản hồi' : 'Category'}
            </Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.categoryChip, category === c && styles.categoryChipActive]}
                  onPress={() => setCategory(c)}
                >
                  <Text style={[styles.categoryChipText, category === c && styles.categoryChipTextActive]}>
                    {categoryLabel(c)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>
              {language === 'vi' ? 'Nội dung' : 'Message'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={body}
              onChangeText={setBody}
              multiline
              maxLength={5000}
              placeholder={
                language === 'vi'
                  ? 'Mô tả vấn đề hoặc yêu cầu của bạn...'
                  : 'Describe your issue or request...'
              }
              placeholderTextColor={colors.text.secondary}
            />
            <Text style={styles.charCount}>{body.trim().length} / 5000</Text>

            {showSuccess && (
              <View style={styles.successBanner}>
                <MaterialIcons name="check-circle" size={18} color="#166534" />
                <Text style={styles.successText}>
                  {language === 'vi'
                    ? 'Gửi thành công! Chúng tôi sẽ phản hồi sớm.'
                    : "Submitted! We'll get back to you soon."}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting && <ActivityIndicator size="small" color="#fff" />}
              <Text style={styles.submitButtonText}>
                {submitting
                  ? (language === 'vi' ? 'Đang gửi...' : 'Submitting...')
                  : (language === 'vi' ? 'Gửi' : 'Submit')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            {language === 'vi' ? 'Phản hồi đã gửi' : 'Your Submissions'}
          </Text>

          {loadingList ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginVertical: spacing.xl }}
            />
          ) : list.length === 0 ? (
            <Text style={styles.emptyText}>
              {language === 'vi' ? 'Chưa có phản hồi nào.' : 'No submissions yet.'}
            </Text>
          ) : (
            list.map((item) => {
              const isOpen = expanded === item.id;
              const excerpt =
                item.body.length > 180 ? `${item.body.slice(0, 180)}…` : item.body;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.feedbackCard}
                  onPress={() => setExpanded(isOpen ? null : item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.feedbackHeader}>
                    <View style={styles.badgeRow}>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: categoryBgColor[item.category] ?? '#f3f4f6' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: categoryTextColor[item.category] ?? '#374151' },
                          ]}
                        >
                          {categoryLabel(item.category)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.badge,
                          { backgroundColor: statusBgColor[item.status] ?? '#f3f4f6' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: statusTextColor[item.status] ?? '#374151' },
                          ]}
                        >
                          {statusLabel(item.status)}
                        </Text>
                      </View>
                    </View>
                    <MaterialIcons
                      name={isOpen ? 'expand-less' : 'expand-more'}
                      size={20}
                      color={colors.text.secondary}
                    />
                  </View>
                  <Text style={styles.feedbackBody}>
                    {isOpen ? item.body : excerpt}
                  </Text>
                  <Text style={styles.feedbackDate}>{formatDate(item.created_at)}</Text>
                  {isOpen && item.admin_response ? (
                    <View style={styles.tutoResponseBox}>
                      <Text style={styles.tutoResponseLabel}>
                        {language === 'vi' ? 'Phản hồi từ Tuto' : 'Response from Tuto'}
                      </Text>
                      <Text style={styles.tutoResponseText}>{item.admin_response}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
