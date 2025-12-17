import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ViewStyle,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { subjects, Subject } from '../data/subjects';
import { useTheme } from '../contexts/ThemeContext';

interface AllSubjectsScreenProps {
  navigation: any;
}

export const AllSubjectsScreen: React.FC<AllSubjectsScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      backgroundColor: colors.background.primary,
    },
    backButton: {
      position: 'absolute',
      left: spacing.lg,
      zIndex: 1,
    },
    logo: {
      height: 40,
      width: 120,
    },
    titleContainer: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.background.primary,
      textAlign: 'center',
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: spacing.lg,
    },
    searchContainer: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    searchPlaceholder: {
      marginLeft: spacing.sm,
      color: colors.text.secondary,
      fontSize: typography.fontSize.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      color: colors.text.primary,
      fontSize: typography.fontSize.md,
      paddingVertical: 0,
    },
    tabs: {
      flexDirection: 'row',
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border.light,
      backgroundColor: colors.background.primary,
    },
    tabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    tabText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.medium,
    },
    tabTextActive: {
      color: colors.background.primary,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    pillGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: -spacing.sm,
    },
    pillWrapper: {
      width: '50%',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
    },
    subjectPill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 12,
      minHeight: 48,
    },
    subjectText: {
      color: colors.background.primary,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      marginLeft: spacing.xs,
      flex: 1,
      flexShrink: 1,
    },
  });

  const { language } = useLanguage();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'extracurricular'>('all');

  const academicSubjects = useMemo(() => subjects.filter(subject => subject.category === 'academic'), []);
  const extracurricularSubjects = useMemo(() => subjects.filter(subject => subject.category === 'extracurricular'), []);
  const filtered = useMemo(() => {
    const list = activeTab === 'academic' ? academicSubjects : activeTab === 'extracurricular' ? extracurricularSubjects : subjects;
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(s => (language === 'en' ? s.nameEn : s.nameVi).toLowerCase().includes(q));
  }, [activeTab, query, language]);

  const SubjectPill = ({ subject }: { subject: Subject }) => (
    <TouchableOpacity
      style={[styles.subjectPill, shadowStyle]}
      onPress={() => navigation.navigate('SubjectResults', { subjectKey: subject.key })}
    >
      <MaterialIcons name={subject.icon} size={24} color={colors.background.primary} />
      <Text style={styles.subjectText}>
        {language === 'en' ? subject.nameEn : subject.nameVi}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/tuto-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Search & Tabs */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={language === 'en' ? 'Search subjects...' : 'Tìm kiếm môn học...'}
            placeholderTextColor={colors.text.secondary}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        <View style={styles.tabs}>
          {(['all','academic','extracurricular'] as const).map((tab) => (
            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'all' ? (language === 'en' ? 'All' : 'Tất cả') : language === 'en' ? (tab === 'academic' ? 'Academic' : 'Extracurricular') : (tab === 'academic' ? 'Học thuật' : 'Ngoại khóa')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Browse Subjects' : 'Khám Phá Môn Học'}
          </Text>
          <View style={styles.pillGrid}>
            {filtered.map((subject) => (
              <View key={subject.key} style={styles.pillWrapper}>
                <SubjectPill subject={subject} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const shadowStyle: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
};
