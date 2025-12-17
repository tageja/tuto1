import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ChatDateSeparatorProps {
  date: string;
}

export const ChatDateSeparator: React.FC<ChatDateSeparatorProps> = ({ date }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 16,
    },
    pill: {
      backgroundColor: colors.background.tertiary,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    dateText: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.pill}>
        <Text style={styles.dateText}>{date}</Text>
      </View>
    </View>
  );
};







