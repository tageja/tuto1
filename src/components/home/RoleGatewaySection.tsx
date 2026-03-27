import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../../contexts/UserContext';
import { useSchool } from '../../contexts/SchoolContext';
import { useTheme } from '../../contexts/ThemeContext';

interface QuickAction {
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  iconBg: string;
  iconColor: string;
  screen: string;
}

const ADMIN_ACTIONS: QuickAction[] = [
  { label: 'Dashboard',    icon: 'dashboard',           iconBg: '#EFF6FF', iconColor: '#2563EB', screen: 'SchoolDashboard' },
  { label: 'Attendance',   icon: 'event-available',      iconBg: '#F0FDF4', iconColor: '#16A34A', screen: 'SchoolAttendance' },
  { label: 'Announce',     icon: 'campaign',             iconBg: '#FFF7ED', iconColor: '#EA580C', screen: 'SchoolAnnouncements' },
  { label: 'Homework',     icon: 'menu-book',            iconBg: '#FAF5FF', iconColor: '#9333EA', screen: 'SchoolHomework' },
  { label: 'Students',     icon: 'people',               iconBg: '#ECFDF5', iconColor: '#059669', screen: 'SchoolStudents' },
  { label: 'Teachers',     icon: 'school',               iconBg: '#FFF1F2', iconColor: '#E11D48', screen: 'SchoolTeachers' },
  { label: 'Events',       icon: 'event',                iconBg: '#FFFBEB', iconColor: '#D97706', screen: 'SchoolEvents' },
  { label: 'Classes',      icon: 'class',                iconBg: '#F0F9FF', iconColor: '#0284C7', screen: 'SchoolClasses' },
];

const PARENT_ACTIONS: QuickAction[] = [
  { label: 'Attendance',   icon: 'event-available',      iconBg: '#F0FDF4', iconColor: '#16A34A', screen: 'SchoolAttendance' },
  { label: 'Events',       icon: 'event',                iconBg: '#FFFBEB', iconColor: '#D97706', screen: 'SchoolEvents' },
  { label: 'Homework',     icon: 'menu-book',            iconBg: '#FAF5FF', iconColor: '#9333EA', screen: 'SchoolHomework' },
  { label: 'Photos',       icon: 'photo-album',          iconBg: '#ECFEFF', iconColor: '#0891B2', screen: 'SchoolPhotoAlbums' },
  { label: 'Feed',         icon: 'dynamic-feed',         iconBg: '#F5F3FF', iconColor: '#7C3AED', screen: 'Feed' },
  { label: 'Announce',     icon: 'campaign',             iconBg: '#FFF7ED', iconColor: '#EA580C', screen: 'SchoolAnnouncements' },
];

interface RoleGatewaySectionProps {
  navigation: any;
}

export const RoleGatewaySection: React.FC<RoleGatewaySectionProps> = ({ navigation }) => {
  const { userType } = useUser();
  const { currentSchool } = useSchool();
  const { colors, spacing, typography } = useTheme();

  const actions = userType === 'admin' ? ADMIN_ACTIONS : PARENT_ACTIONS;

  const handlePress = (screen: string) => {
    if ((screen === 'SchoolDashboard' || screen.startsWith('School')) && !currentSchool) {
      navigation.navigate('SchoolInvitation');
      return;
    }
    navigation.navigate(screen);
  };

  const styles = StyleSheet.create({
    container: { paddingTop: spacing.md },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    sectionTitle: { fontSize: 14, fontFamily: typography.fontFamily.bold, color: colors.text.primary },
    scrollContent: { paddingHorizontal: spacing.md, gap: 12, paddingBottom: 4 },
    action: { width: 68, alignItems: 'center', gap: 6 },
    iconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    label: { fontSize: 10, color: colors.text.secondary, fontFamily: typography.fontFamily.semiBold, textAlign: 'center' },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((a) => (
          <TouchableOpacity key={a.label} style={styles.action} onPress={() => handlePress(a.screen)} activeOpacity={0.7}>
            <View style={[styles.iconWrap, { backgroundColor: a.iconBg }]}>
              <MaterialIcons name={a.icon} size={24} color={a.iconColor} />
            </View>
            <Text style={styles.label}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
