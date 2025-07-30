import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { Subject } from '../../data/subjects';
import { colors, spacing, borderRadius, typography } from '../../theme';

interface SubjectCardProps {
  subject: Subject;
  onPress: (subject: Subject) => void;
  variant?: 'default' | 'compact' | 'large';
  selected?: boolean;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  onPress,
  variant = 'default',
  selected = false,
}) => {
  const { language } = useLanguage();
  const isVietnamese = language === 'vi';

  const getCardStyle = () => {
    switch (variant) {
      case 'compact':
        return styles.compactCard;
      case 'large':
        return styles.largeCard;
      default:
        return styles.defaultCard;
    }
  };

  const getIconSize = () => {
    switch (variant) {
      case 'compact':
        return 32;
      case 'large':
        return 64;
      default:
        return 48;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'compact':
        return styles.compactText;
      case 'large':
        return styles.largeText;
      default:
        return styles.defaultText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getCardStyle(),
        selected && styles.selectedCard,
        { borderColor: selected ? subject.color : colors.border.light },
      ]}
      onPress={() => onPress(subject)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Image
          source={subject.icon}
          style={[
            styles.icon,
            { width: getIconSize(), height: getIconSize() },
          ]}
          resizeMode="contain"
        />
      </View>
      
      <Text style={[getTextStyle(), { color: colors.text.primary }]}>
        {isVietnamese ? subject.nameVi : subject.name}
      </Text>
      
      {variant === 'large' && (
        <Text style={styles.description}>
          {isVietnamese ? subject.descriptionVi : subject.description}
        </Text>
      )}
      
      {variant === 'large' && (
        <View style={[styles.categoryBadge, { backgroundColor: subject.color + '20' }]}>
          <Text style={[styles.categoryText, { color: subject.color }]}>
            {subject.category === 'academic' 
              ? (isVietnamese ? 'Học thuật' : 'Academic')
              : (isVietnamese ? 'Ngoại khóa' : 'Extracurricular')
            }
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  defaultCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  largeCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  selectedCard: {
    borderWidth: 2,
    backgroundColor: colors.background.secondary,
  },
  iconContainer: {
    marginBottom: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    tintColor: colors.text.primary,
  },
  defaultText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
    lineHeight: 18,
  },
  compactText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
    lineHeight: 16,
  },
  largeText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
}); 