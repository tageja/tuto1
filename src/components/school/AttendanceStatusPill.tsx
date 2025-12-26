import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { AttendanceStatus } from '../../types/school/attendance';
import { getAttendanceStatusColor } from '../../services/school/attendance';

interface AttendanceStatusPillProps {
  status: AttendanceStatus;
}

const statusConfig: Record<
  AttendanceStatus,
  { icon: keyof typeof MaterialIcons.glyphMap; label: string }
> = {
  present: { icon: 'check-circle', label: 'Present' },
  absent: { icon: 'cancel', label: 'Absent' },
  late: { icon: 'access-time', label: 'Late' },
  excused: { icon: 'info', label: 'Excused' },
};

export const AttendanceStatusPill: React.FC<AttendanceStatusPillProps> = ({
  status,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      alignSelf: 'flex-start',
    },
    text: {
      marginLeft: 6,
      fontSize: 12,
      fontWeight: '600',
      fontFamily: typography.fontFamily.semiBold,
    },
  });

  const config = statusConfig[status];
  const color = getAttendanceStatusColor(status);
  const bgColor = `${color}15`; // 15% opacity

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <MaterialIcons name={config.icon} size={16} color={color} />
      <Text style={[styles.text, { color }]}>{config.label}</Text>
    </View>
  );
};







