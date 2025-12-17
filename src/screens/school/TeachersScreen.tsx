/**
 * Parent Teachers Screen
 * Shows active teachers for parents
 * Mirrors web parent/teachers page with mobile-optimized UI
 */

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TextInput, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import SchoolHeader from '../../components/common/SchoolHeader';
import { TeacherListItem } from '../../components/school/TeacherListItem';
import { getParentTeachers, getActiveTeachers, SchoolTeacher } from '../../services/supabase-teachers';
import { useTheme } from '../../contexts/ThemeContext';


const TeachersScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    headerSection: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
    },
    screenTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
    },
    screenSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginVertical: 12,
      backgroundColor: colors.background.primary,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    searchInput: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 4,
      fontSize: 16,
      color: colors.text.primary,
    },
    resultsHeader: {
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    resultsText: {
      fontSize: 14,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    loadingWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 64,
    },
    loadingText: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 12,
    },
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: 64,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      color: colors.text.primary,
      marginTop: 16,
      fontWeight: '600',
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 8,
      textAlign: 'center',
      lineHeight: 20,
    },
    emptyListContent: {
      flexGrow: 1,
    },
  });
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const { userData } = useUser();
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [teachers, setTeachers] = useState<SchoolTeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!currentSchool?.id) return;
    
    try {
      setLoading(true);
      // Try to fetch teachers for parent's children first
      let data: SchoolTeacher[] = [];
      
      if (userData?.email) {
        data = await getParentTeachers(currentSchool.id, userData.email);
      }
      
      // Fallback: if no parent-specific teachers or no email, show all active teachers
      if (data.length === 0) {
        data = await getActiveTeachers(currentSchool.id, query);
      }
      
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool, userData?.email, query]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const handleTeacherPress = useCallback((teacherId: string) => {
    // @ts-ignore - Navigation types to be added
    navigation.navigate('TeacherDetail', { teacherId });
  }, [navigation]);

  // Filter teachers by search query (client-side for parent view)
  const filteredTeachers = teachers.filter((teacher) => {
    if (!query.trim()) return true;
    const searchLower = query.toLowerCase();
    return (
      teacher.name?.toLowerCase().includes(searchLower) ||
      teacher.email?.toLowerCase().includes(searchLower) ||
      teacher.subjects?.some(s => s.toLowerCase().includes(searchLower))
    );
  });

  return (
    <View style={styles.container}>
      <SchoolHeader />
      
      <FlatList
        data={filteredTeachers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.screenTitle}>{t('school.teachers.title')}</Text>
              <Text style={styles.screenSubtitle}>{t('school.teachers.parentSubtitle')}</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchBar}>
              <MaterialIcons name="search" size={20} color={colors.text.secondary} />
              <TextInput
                placeholder={t('school.teachers.searchPlaceholder')}
                placeholderTextColor={colors.text.secondary}
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
              />
            </View>

            {/* Results Count */}
            {!loading && (
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsText}>
                  {filteredTeachers.length} {filteredTeachers.length === 1 ? t('school.teachers.teacher') : t('school.teachers.teachers')}
                </Text>
              </View>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TeacherListItem
            teacher={item}
            onPress={() => handleTeacherPress(item.id)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color="#0B5FFF" size="large" />
              <Text style={styles.loadingText}>{t('school.common.loading')}</Text>
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <MaterialIcons name="school" size={64} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>{t('school.teachers.noTeachers')}</Text>
              <Text style={styles.emptySubtitle}>{t('school.teachers.noTeachersSubtitle')}</Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#0B5FFF"
            colors={['#0B5FFF']}
          />
        }
        contentContainerStyle={filteredTeachers.length === 0 ? styles.emptyListContent : undefined}
      />
    </View>
  );
};

export default TeachersScreen;



