/**
 * Admin Classes Screen
 * Full-featured class management for school admins
 * Mirrors web admin/classes page with mobile-optimized UI
 */

import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, ActivityIndicator, StyleSheet, RefreshControl, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import SchoolHeader from '../../components/common/SchoolHeader';
import { ClassListItem } from '../../components/school/ClassListItem';
import { KpiRow, KpiItem } from '../../components/kpi/KpiRow';
import { FilterChips, FilterOption } from '../../components/filters/FilterChips';
import { useTheme } from '../../contexts/ThemeContext';
import {
  getClasses,
  getClassKPIs,
  getClassGrades,
  SchoolClass,
} from '../../services/supabase-classes';


const ClassesScreen: React.FC = () => {
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
    filtersSection: {
      marginTop: 8,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginVertical: 8,
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
      paddingVertical: 12,
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
  const navigation = useNavigation();
  
  const [query, setQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [kpis, setKpis] = useState({
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    capacityUsage: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadKPIs = useCallback(async () => {
    if (!currentSchool?.id) return;
    
    try {
      const kpisData = await getClassKPIs(currentSchool.id);
      setKpis(kpisData);
    } catch (error) {
      console.error('Error loading class KPIs:', error);
    }
  }, [currentSchool]);

  const loadGrades = useCallback(async () => {
    if (!currentSchool?.id) return;
    
    try {
      const gradesData = await getClassGrades(currentSchool.id);
      setGrades(gradesData);
    } catch (error) {
      console.error('Error loading grades:', error);
    }
  }, [currentSchool]);

  const loadClasses = useCallback(async () => {
    if (!currentSchool?.id) return;
    
    try {
      setLoading(true);
      const { classes: classesData } = await getClasses(currentSchool.id, {
        search: query,
        grade: selectedGrade !== 'all' ? selectedGrade : undefined,
        limit: 100,
      });
      setClasses(classesData);
    } catch (error) {
      console.error('Error loading classes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool, query, selectedGrade]);

  useEffect(() => {
    loadKPIs();
    loadGrades();
  }, [loadKPIs, loadGrades]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadKPIs();
    loadGrades();
    loadClasses();
  }, [loadKPIs, loadGrades, loadClasses]);

  const handleClassPress = useCallback((classId: string) => {
    // @ts-ignore - Navigation types to be added
    navigation.navigate('ClassDetail', { classId });
  }, [navigation]);

  // Build KPI items
  const kpiItems: KpiItem[] = [
    {
      icon: 'class',
      label: t('school.classes.kpis.total'),
      value: kpis.totalClasses,
      color: '#0B5FFF',
      iconColor: '#0B5FFF',
    },
    {
      icon: 'check-circle',
      label: t('school.classes.kpis.active'),
      value: kpis.activeClasses,
      color: '#10B981',
      iconColor: '#10B981',
    },
    {
      icon: 'people',
      label: t('school.classes.kpis.students'),
      value: kpis.totalStudents,
      color: '#8B5CF6',
      iconColor: '#8B5CF6',
    },
    {
      icon: 'pie-chart',
      label: t('school.classes.kpis.capacity'),
      value: `${kpis.capacityUsage}%`,
      color: '#F59E0B',
      iconColor: '#F59E0B',
    },
  ];

  // Build grade filter options
  const gradeOptions: FilterOption[] = [
    { id: 'all', label: t('school.classes.filters.allGrades') },
    ...grades.map((grade) => ({ id: grade, label: grade })),
  ];

  return (
    <View style={styles.container}>
      <SchoolHeader />
      
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.screenTitle}>{t('school.classes.title')}</Text>
              <Text style={styles.screenSubtitle}>{t('school.classes.subtitle')}</Text>
            </View>

            {/* KPI Cards */}
            <KpiRow kpis={kpiItems} />

            {/* Search & Filters Section */}
            <View style={styles.filtersSection}>
              {/* Search Bar */}
              <View style={styles.searchBar}>
                <MaterialIcons name="search" size={20} color={colors.text.secondary} />
                <TextInput
                  placeholder={t('school.classes.searchPlaceholder')}
                  placeholderTextColor={colors.text.secondary}
                  value={query}
                  onChangeText={setQuery}
                  style={styles.searchInput}
                />
              </View>

              {/* Grade Filter */}
              {grades.length > 0 && (
                <FilterChips
                  options={gradeOptions}
                  selected={selectedGrade}
                  onSelect={setSelectedGrade}
                />
              )}
            </View>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {t('school.classes.showing')} {classes.length} {classes.length === 1 ? t('school.classes.class') : t('school.classes.classes')}
              </Text>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <ClassListItem
            classData={item}
            onPress={() => handleClassPress(item.id)}
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
              <MaterialIcons name="class" size={64} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>{t('school.classes.noClasses')}</Text>
              <Text style={styles.emptySubtitle}>{t('school.classes.noClassesSubtitle')}</Text>
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
        contentContainerStyle={classes.length === 0 ? styles.emptyListContent : undefined}
      />
    </View>
  );
};

export default ClassesScreen;



