import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../../contexts/UserContext';
import { useSchool } from '../../contexts/SchoolContext';
import { useTheme } from '../../contexts/ThemeContext';
import { fetchAdminHomeStats, type AdminHomeStats } from '../../services/home-dashboard';
import { fetchTeacherStats, type TeacherStats } from '../../services/teacher-dashboard';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(): string {
  const d = new Date();
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function getFirstName(fullName: string | null | undefined): string {
  if (!fullName) return 'there';
  return fullName.split(' ')[0];
}

interface StatTile {
  value: string;
  label: string;
}

export const HeroSection: React.FC = () => {
  const { userType, userData } = useUser();
  const { currentSchool } = useSchool();
  const { colors, spacing, typography } = useTheme();

  const [stats, setStats] = useState<StatTile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentSchool?.id) return;
    setLoading(true);

    const load = async () => {
      try {
        if (userType === 'admin') {
          const s: AdminHomeStats = await fetchAdminHomeStats(currentSchool.id);
          setStats([
            { value: String(s.studentsCount), label: 'Students' },
            { value: s.attendanceRate !== null ? `${s.attendanceRate}%` : '—', label: 'Attendance' },
            { value: String(s.teachersCount), label: 'Teachers' },
          ]);
        } else if (userType === 'teacher') {
          const s: TeacherStats = await fetchTeacherStats(currentSchool.id);
          setStats([
            { value: String(s.classesCount), label: 'Classes' },
            { value: String(s.studentsCount), label: 'Students' },
            { value: s.homeworkPending > 0 ? String(s.homeworkPending) : '0', label: 'HW Due' },
          ]);
        }
      } catch {
        // silently fail — stats just won't show
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentSchool?.id, userType]);

  const rolePillConfig = {
    admin: { label: 'School Admin', icon: 'admin-panel-settings' as const },
    teacher: { label: 'Teacher', icon: 'school' as const },
    parent: { label: 'Parent', icon: 'family-restroom' as const },
    student: { label: 'Student', icon: 'person' as const },
  };

  const pill = rolePillConfig[userType as keyof typeof rolePillConfig] ?? rolePillConfig.parent;
  const firstName = getFirstName(userData?.name);
  const showStats = stats.length > 0;

  const styles = StyleSheet.create({
    wrapper: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs },
    card: { borderRadius: 24, padding: spacing.lg, overflow: 'hidden' },
    rolePill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: 100,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: spacing.sm,
    },
    rolePillText: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontFamily: typography.fontFamily.semiBold, letterSpacing: 0.5, textTransform: 'uppercase' },
    dateText: { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginBottom: 2 },
    greetingText: { color: '#fff', fontSize: 22, fontFamily: typography.fontFamily.bold, marginBottom: spacing.md },
    schoolText: { color: 'rgba(255,255,255,0.65)', fontSize: 11, marginBottom: spacing.md },
    statsRow: { flexDirection: 'row', gap: spacing.sm },
    statTile: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: 14,
      paddingVertical: 10,
      paddingHorizontal: 8,
      alignItems: 'center',
    },
    statValue: { color: '#fff', fontSize: 18, fontFamily: typography.fontFamily.bold },
    statLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 9, marginTop: 2, letterSpacing: 0.3 },
    noSchoolText: { color: 'rgba(255,255,255,0.7)', fontSize: 13, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
  });

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={['#0B1F50', '#0B5FFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Role pill */}
        <View style={styles.rolePill}>
          <MaterialIcons name={pill.icon} size={12} color="rgba(255,255,255,0.85)" />
          <Text style={styles.rolePillText}>{pill.label}</Text>
        </View>

        {/* Date + greeting */}
        <Text style={styles.dateText}>{formatDate()}</Text>
        <Text style={styles.greetingText}>Hello, {firstName} 👋</Text>

        {/* School name if available */}
        {currentSchool?.name && (
          <Text style={styles.schoolText}>🏫 {currentSchool.name}</Text>
        )}

        {/* Stats tiles */}
        {loading ? (
          <ActivityIndicator color="rgba(255,255,255,0.7)" size="small" style={{ marginTop: 4 }} />
        ) : showStats ? (
          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statTile}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        ) : !currentSchool ? (
          <Text style={styles.noSchoolText}>Join a school to see your dashboard</Text>
        ) : null}
      </LinearGradient>
    </View>
  );
};
