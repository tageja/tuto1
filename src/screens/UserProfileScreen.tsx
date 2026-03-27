import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabase } from '../config/supabase';

interface UserProfileScreenProps {
  navigation: any;
}

interface ProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
}

const EMPTY_PROFILE: ProfileData = { id: '', name: '', email: '', phone: '', avatar: null, role: 'parent' };

function roleBadgeLabel(role: string): string {
  switch (role) {
    case 'admin':
    case 'school_admin': return 'School Admin';
    case 'teacher': return 'Teacher';
    case 'parent': return 'Parent';
    case 'student': return 'Student';
    default: return role;
  }
}

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  const { userType, userData: contextUser } = useUser();

  const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [editedProfile, setEditedProfile] = useState<ProfileData>(EMPTY_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ---------------------------------------------------------------------------
  // Load real profile from Supabase
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, phone, avatar, role')
          .eq('auth_user_id', user.id)
          .single();

        if (!error && data) {
          const loaded: ProfileData = {
            id: data.id,
            name: data.name || contextUser?.name || '',
            email: data.email || contextUser?.email || '',
            phone: data.phone || '',
            avatar: data.avatar || null,
            role: data.role || userType || 'parent',
          };
          setProfile(loaded);
          setEditedProfile(loaded);
        }
      } catch {
        // fallback to context values
        const fallback: ProfileData = {
          id: contextUser?.id || '',
          name: contextUser?.name || '',
          email: contextUser?.email || '',
          phone: '',
          avatar: null,
          role: userType || 'parent',
        };
        setProfile(fallback);
        setEditedProfile(fallback);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ---------------------------------------------------------------------------
  // Save
  // ---------------------------------------------------------------------------
  const handleSave = async () => {
    if (!profile.id) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: editedProfile.name, phone: editedProfile.phone, updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(editedProfile);
      setIsEditing(false);
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  // ---------------------------------------------------------------------------
  // Styles
  // ---------------------------------------------------------------------------
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1, borderBottomColor: colors.border.light,
    },
    headerTitle: { fontSize: typography.fontSize.lg, fontFamily: typography.fontFamily.semiBold, color: colors.text.primary },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    iconBtn: { padding: spacing.xs },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Avatar section
    avatarSection: { alignItems: 'center', paddingVertical: spacing.xl, backgroundColor: colors.background.primary },
    avatarWrap: { position: 'relative' },
    avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.background.tertiary },
    avatarFallback: {
      width: 96, height: 96, borderRadius: 48,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
    },
    avatarFallbackText: { color: '#fff', fontSize: 32, fontFamily: typography.fontFamily.bold },
    cameraBtn: {
      position: 'absolute', bottom: 0, right: 0,
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center', justifyContent: 'center',
      borderWidth: 2, borderColor: colors.background.primary,
    },
    roleBadge: {
      marginTop: spacing.md,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md, paddingVertical: 5,
      borderRadius: 100,
    },
    roleBadgeText: { color: '#fff', fontSize: 11, fontFamily: typography.fontFamily.semiBold, textTransform: 'uppercase', letterSpacing: 0.5 },

    // Sections
    section: { backgroundColor: colors.background.primary, borderRadius: 16, marginHorizontal: spacing.md, marginTop: spacing.md, padding: spacing.lg },
    sectionTitle: { fontSize: 13, fontFamily: typography.fontFamily.bold, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
    field: { marginBottom: spacing.md },
    fieldLabel: { fontSize: 11, fontFamily: typography.fontFamily.medium, color: colors.text.secondary, marginBottom: 4 },
    fieldValue: { fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.text.primary, paddingVertical: 4 },
    fieldInput: {
      fontSize: 15, fontFamily: typography.fontFamily.regular, color: colors.text.primary,
      borderWidth: 1, borderColor: colors.border.medium, borderRadius: 10,
      paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
      backgroundColor: colors.background.secondary,
    },
    emptyValue: { color: colors.text.light, fontStyle: 'italic', fontSize: 14 },

    // Action buttons
    actionRow: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.lg, gap: spacing.md },
    cancelBtn: { flex: 1, backgroundColor: colors.background.secondary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border.light },
    cancelBtnText: { fontSize: 15, fontFamily: typography.fontFamily.semiBold, color: colors.text.primary },
    saveBtn: { flex: 1, backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    saveBtnText: { fontSize: 15, fontFamily: typography.fontFamily.semiBold, color: '#fff' },

    // Settings / logout row
    settingsSection: { backgroundColor: colors.background.primary, borderRadius: 16, marginHorizontal: spacing.md, marginTop: spacing.md, overflow: 'hidden' },
    settingsRow: {
      flexDirection: 'row', alignItems: 'center', padding: spacing.md,
      borderBottomWidth: 1, borderBottomColor: colors.border.light,
    },
    settingsRowLast: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
    settingsLabel: { flex: 1, fontSize: 15, color: colors.text.primary, marginLeft: spacing.md },
    logoutLabel: { flex: 1, fontSize: 15, color: colors.status.error, marginLeft: spacing.md },
  });

  // ---------------------------------------------------------------------------
  // Avatar renderer
  // ---------------------------------------------------------------------------
  const renderAvatar = () => {
    const initials = profile.name
      ? profile.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
      : '?';

    return (
      <View style={styles.avatarWrap}>
        {profile.avatar ? (
          <Image source={{ uri: profile.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.avatarFallbackText}>{initials}</Text>
          </View>
        )}
        {isEditing && (
          <TouchableOpacity style={styles.cameraBtn}>
            <MaterialIcons name="camera-alt" size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // Field renderer
  // ---------------------------------------------------------------------------
  const renderField = (label: string, field: keyof ProfileData, editable = true) => (
    <View style={styles.field} key={field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing && editable ? (
        <TextInput
          style={styles.fieldInput}
          value={String(editedProfile[field] ?? '')}
          onChangeText={(v) => setEditedProfile((p) => ({ ...p, [field]: v }))}
          autoCapitalize="none"
        />
      ) : (
        <Text style={[styles.fieldValue, !profile[field] && styles.emptyValue]}>
          {String(profile[field] || '—')}
        </Text>
      )}
    </View>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('SettingsStack' as never)}>
            <MaterialIcons name="settings" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setIsEditing(!isEditing)}>
            <MaterialIcons name={isEditing ? 'close' : 'edit'} size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {/* Avatar + role badge */}
        <View style={styles.avatarSection}>
          {renderAvatar()}
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{roleBadgeLabel(profile.role)}</Text>
          </View>
        </View>

        {/* Personal info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          {renderField('Full Name', 'name')}
          {renderField('Email', 'email', false)}
          {renderField('Phone', 'phone')}
        </View>

        {/* Account info (read-only) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Role</Text>
            <Text style={styles.fieldValue}>{roleBadgeLabel(profile.role)}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>User ID</Text>
            <Text style={[styles.fieldValue, { fontSize: 12, color: colors.text.secondary }]} numberOfLines={1}>
              {profile.id || '—'}
            </Text>
          </View>
        </View>

        {/* Settings & logout shortcuts (only shown when not editing) */}
        {!isEditing && (
          <View style={styles.settingsSection}>
            <TouchableOpacity style={styles.settingsRow} onPress={() => navigation.navigate('SettingsStack' as never)}>
              <MaterialIcons name="settings" size={20} color={colors.text.secondary} />
              <Text style={styles.settingsLabel}>Settings</Text>
              <MaterialIcons name="chevron-right" size={20} color={colors.text.light} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsRowLast}
              onPress={async () => {
                await supabase.auth.signOut();
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              }}
            >
              <MaterialIcons name="logout" size={20} color={colors.status.error} />
              <Text style={styles.logoutLabel}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Save / cancel row */}
        {isEditing && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};
