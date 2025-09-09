import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAirtable } from '../../hooks/useAirtable';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SchoolHeader from '../../components/common/SchoolHeader';
import { subjects as SUBJECTS } from '../../data/subjects';
import { colors, spacing, typography } from '../../theme';

type ProgressRecord = {
  id: string;
  studentName: string;
  subject: string;
  grade: string;
  percentage?: number;
  term?: string;
  reportDate?: string;
};

const TABLE = 'TutoSchoolProgressReports';

const SubjectCard = ({
  name,
  current,
  previous,
}: {
  name: string;
  current?: number;
  previous?: number;
}) => {
  const diff = current !== undefined && previous !== undefined ? current - previous : undefined;
  const trend: 'up' | 'down' | 'flat' | undefined = diff !== undefined ? (diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat') : undefined;
  const trendColor = trend === 'up' ? '#16A34A' : trend === 'down' ? '#DC2626' : '#888888';
  return (
    <View style={styles.subjectCard}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.title} numberOfLines={1}>{name}</Text>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreBadgeText}>{current !== undefined ? `${current}%` : '—'}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{previous !== undefined ? `Prev ${previous}%` : 'No previous'}</Text>
        </View>
        {trend && (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
            <MaterialIcons name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'trending-flat'} size={16} color={trendColor} />
            {diff !== undefined && <Text style={[styles.meta, { color: trendColor, marginLeft: 4 }]}>{diff > 0 ? '+' : ''}{diff}%</Text>}
          </View>
        )}
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { width: `${Math.max(0, Math.min(100, current || 0))}%` }]} />
      </View>
    </View>
  );
};

const ProgressScreen: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentSchool, schoolUser } = useSchool();
  const { fetchRecords, loading } = useAirtable();
  const [query, setQuery] = useState('');
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [period, setPeriod] = useState<'3m' | '6m' | '12m'>('3m');
  const [enabledSubjects, setEnabledSubjects] = useState<string[] | null>(null);

  const load = useCallback(async () => {
    if (!currentSchool) return;
    const className = (schoolUser as any)?.className || undefined;
    const studentName = (schoolUser as any)?.studentName || undefined;

    try {
      const subj: string[] = [];
      if (studentName) {
        const overrides = await fetchRecords('TutoStudentSubjectOverrides', {
          filterByFormula: `AND({School Name} = '${currentSchool.name}', {Student Name} = '${studentName}', {Enabled} = 1)`,
          pageSize: 100,
        });
        overrides.forEach((r: any) => r?.fields?.Subject && subj.push(String(r.fields.Subject)));
      }
      if (subj.length === 0 && className) {
        const cls = await fetchRecords('TutoClassSubjects', {
          filterByFormula: `AND({School Name} = '${currentSchool.name}', {Class Name} = '${className}', {Enabled} = 1)`,
          pageSize: 100,
        });
        cls.forEach((r: any) => r?.fields?.Subject && subj.push(String(r.fields.Subject)));
      }
      setEnabledSubjects(subj.length ? subj : null);
    } catch {
      setEnabledSubjects(null);
    }

    const recs = await fetchRecords(TABLE, {
      filterByFormula: `{School Name} = '${currentSchool.name}'`,
      sort: [{ field: 'Report Date', direction: 'desc' }],
      pageSize: 50,
    });
    const mapped = (recs || []).map((r) => {
      const f = r.fields || {};
      return {
        id: r.id,
        studentName: f['Student Name'] || f.studentName || '—',
        subject: f['Subject'] || f.subject || '—',
        grade: f['Grade'] || f.grade || '—',
        percentage: typeof f['Percentage'] === 'number' ? f['Percentage'] : undefined,
        term: f['Term'] || f.term,
        reportDate: f['Report Date'] || f.reportDate,
      } as ProgressRecord;
    });
    setRecords(mapped);
  }, [currentSchool, fetchRecords, schoolUser]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return records;
    return records.filter((it) => [it.studentName, it.subject, it.term, it.grade].filter(Boolean).some((v) => String(v).toLowerCase().includes(q)));
  }, [records, query]);

  const subjectAgg = useMemo(() => {
    const map = new Map<string, ProgressRecord[]>();
    for (const r of filtered) {
      if (!map.has(r.subject)) map.set(r.subject, []);
      map.get(r.subject)!.push(r);
    }
    const cards = Array.from(map.entries()).map(([subject, arr]) => {
      const sorted = arr
        .slice()
        .sort((a, b) => new Date(b.reportDate || 0).getTime() - new Date(a.reportDate || 0).getTime());
      const current = sorted.find((x) => typeof x.percentage === 'number')?.percentage;
      const previous = sorted.find((x, idx) => idx > 0 && typeof x.percentage === 'number')?.percentage;
      return { subject, current, previous };
    });
    const list = enabledSubjects && enabledSubjects.length
      ? cards.filter((c) => enabledSubjects.some((s) => String(s).toLowerCase() === String(c.subject).toLowerCase()))
      : cards;
    return list;
  }, [filtered, enabledSubjects]);

  const monthlySeries = useMemo(() => {
    // Build last N months average percentage
    const now = new Date();
    const monthsBack = period === '3m' ? 3 : period === '6m' ? 6 : 12;
    const points: { label: string; value: number }[] = [];
    for (let i = monthsBack - 1; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const values = filtered
        .filter((r) => (r.reportDate ? r.reportDate.startsWith(ym) : false))
        .map((r) => r.percentage)
        .filter((v): v is number => typeof v === 'number');
      const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      const label = d.toLocaleString(undefined, { month: 'short' });
      points.push({ label, value: Math.round(avg) });
    }
    return points;
  }, [filtered, period]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFC' }}>
      <SchoolHeader />
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#888888" />
        <TextInput
          placeholder={t('school.progress.searchPlaceholder')}
          placeholderTextColor="#888888"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>
      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#0B5FFF" />
          <Text style={styles.loadingText}>{t('school.common.loading')}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 16 }}>
          {/* Period Tabs */}
          <View style={styles.periodTabs}>
            {[
              { key: '3m', label: '3 Months' },
              { key: '6m', label: '6 Months' },
              { key: '12m', label: '12 Months' },
            ].map((p) => (
              <TouchableOpacity key={p.key} style={[styles.periodTab, period === (p.key as any) && styles.activePeriodTab]} onPress={() => setPeriod(p.key as any)}>
                <Text style={[styles.periodTabText, period === (p.key as any) && styles.activePeriodTabText]}>{p.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Overall Progress Bars */}
          <View style={styles.graphArea}>
            <Text style={styles.sectionHeader}>{t('progress.overallProgress')}</Text>
            <View style={styles.graphBarsRow}>
              {monthlySeries.map((pt, idx) => (
                <View key={`${pt.label}-${idx}`} style={styles.barContainer}>
                  <View style={[styles.bar, { height: Math.max(6, (pt.value / 100) * 120) }]} />
                  <Text style={styles.barLabel}>{pt.label}</Text>
                  <Text style={styles.barValue}>{pt.value}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Subject-wise Cards */}
          <Text style={styles.sectionHeader}>{t('progress.subjectPerformance')}</Text>
          {subjectAgg.length === 0 ? (
            <View style={styles.emptyWrap}>
              <MaterialIcons name="trending-up" size={48} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>{t('school.progress.noReports')}</Text>
              <Text style={styles.emptySubtitle}>{t('school.progress.noReportsSubtitle')}</Text>
            </View>
          ) : (
            subjectAgg.map((s) => {
              const match = SUBJECTS.find((x) => (
                x.key.toLowerCase() === String(s.subject).toLowerCase() ||
                x.nameEn.toLowerCase() === String(s.subject).toLowerCase() ||
                x.nameVi.toLowerCase() === String(s.subject).toLowerCase()
              ));
              const display = match ? (language === 'vi' ? match.nameVi : match.nameEn) : s.subject;
              return <SubjectCard key={String(s.subject)} name={String(display)} current={s.current} previous={s.previous} />;
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default ProgressScreen;

const styles = StyleSheet.create({
  periodTabs: {
    flexDirection: 'row',
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: 12,
    padding: spacing.xs,
  },
  periodTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 8,
  },
  activePeriodTab: {
    backgroundColor: colors.background.primary,
  },
  periodTabText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  activePeriodTabText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.semiBold,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  title: { fontSize: 16, fontWeight: '600', color: '#333333' },
  meta: { fontSize: 12, color: '#888888', marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  gradePill: { backgroundColor: '#F0F4FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  gradeText: { color: '#0B5FFF', fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  searchInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, fontSize: 16 },
  loadingText: { fontSize: 12, color: '#888888', marginTop: 8 },
  emptyWrap: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 16, color: '#333333', marginTop: 12 },
  emptySubtitle: { fontSize: 12, color: '#888888', marginTop: 4, textAlign: 'center' },
  // keep existing styles; add/override for graph and headers using theme
  sectionHeader: { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.bold, color: colors.text.primary, marginBottom: spacing.md },
  graphArea: { backgroundColor: colors.background.primary, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: '#EEF2F7' },
  graphBarsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 140 },
  barContainer: { alignItems: 'center', flex: 1 },
  bar: { width: 20, backgroundColor: colors.primary, borderRadius: 10, marginBottom: spacing.xs },
  barLabel: { fontSize: typography.fontSize.xs, color: colors.text.secondary },
  barValue: { fontSize: typography.fontSize.xs, color: colors.text.primary, marginTop: spacing.xs, fontFamily: typography.fontFamily.bold },
  subjectCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EEF2F7' },
  scoreBadge: { backgroundColor: '#E8F2FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  scoreBadgeText: { color: '#0B5FFF', fontWeight: '700' },
  progressBarBg: { height: 8, backgroundColor: '#EEF2F7', borderRadius: 999, marginTop: 10 },
  progressBarFill: { height: 8, backgroundColor: '#0B5FFF', borderRadius: 999 },
});


