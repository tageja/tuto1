import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

import { Teacher } from '../types';

interface TeacherCardProps {
  teacher: Teacher;
  onPress: () => void;
}

export const TeacherCard: React.FC<TeacherCardProps> = ({ teacher, onPress }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useLanguage();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    image: {
      width: 80,
      height: 80,
      borderRadius: 8,
    },
    info: {
      flex: 1,
      marginLeft: spacing.md,
      justifyContent: 'center',
    },
    name: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    subjects: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rating: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
      marginLeft: spacing.xs,
    },
    reviews: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      marginLeft: spacing.xs,
    },
    priceContainer: {
      alignItems: 'flex-end',
      justifyContent: 'center',
    },
    price: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.primary,
      marginBottom: 2,
    },
    perHour: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
    },
  });

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Teacher Image */}
      <Image 
        source={{ uri: teacher.avatar }}
        defaultSource={require('../../assets/images/default-teacher.png.png')}
        style={styles.image}
      />

      {/* Teacher Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{teacher.name}</Text>
        
        <Text style={styles.subjects}>
          {teacher.subjects.join(' • ')}
        </Text>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <MaterialIcons 
            name="star" 
            size={16} 
            color={colors.rating.filled}
          />
          <Text style={styles.rating}>
            {teacher.rating.toFixed(1)}
          </Text>
          <Text style={styles.reviews}>
            ({teacher.reviewCount} {t('common.reviews')})
          </Text>
        </View>
      </View>

      {/* Price */}
      <View style={styles.priceContainer}>
        <Text style={styles.price}>
          ${teacher.hourlyRate}
        </Text>
        <Text style={styles.perHour}>
          {t('common.perHour')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};