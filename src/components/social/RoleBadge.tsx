import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import type { UserRole } from '../../types/social';

const ROLE_BG: Record<UserRole, string> = {
  student:    '#0B5FFF',
  parent:     '#10B981',
  teacher:    '#8B5CF6',
  coach:      '#06B6D4',
  schoolAdmin:'#F97316',
  institute:  '#EC4899',
  guest:      '#9CA3AF',
};

interface Props {
  role:       UserRole;
  isVerified?: boolean;
  compact?:   boolean;
}

export default function RoleBadge({ role, isVerified, compact }: Props) {
  const { t } = useLanguage();
  const bg = ROLE_BG[role] ?? '#9CA3AF';
  const label = t(`community.role.${role}` as never) as string;

  return (
    <View style={[styles.pill, { backgroundColor: bg }, compact && styles.compact]}>
      <Text style={[styles.text, compact && styles.textCompact]}>{label}</Text>
      {isVerified && !compact && (
        <MaterialIcons name="verified" size={11} color="#fff" style={styles.icon} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection:  'row',
    alignItems:     'center',
    borderRadius:   999,
    paddingHorizontal: 8,
    paddingVertical:   3,
    alignSelf:      'flex-start',
  },
  compact: {
    paddingHorizontal: 6,
    paddingVertical:   2,
  },
  text: {
    color:      '#fff',
    fontSize:   11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  textCompact: {
    fontSize: 10,
  },
  icon: {
    marginLeft: 3,
  },
});
