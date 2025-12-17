import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';


type BadgeType = 'category' | 'status';
type CategoryValue = 'request' | 'complaint' | 'information';
type StatusValue = 'open' | 'overdue' | 'closed';

interface FeedbackBadgeProps {
  type: BadgeType;
  value: CategoryValue | StatusValue;
}

export const FeedbackBadge: React.FC<FeedbackBadgeProps> = ({ type, value }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

  const getCategoryColor = (category: CategoryValue) => {
    switch (category) {
      case 'request':
        return colors.primary;
      case 'complaint':
        return colors.status.error;
      case 'information':
        return colors.status.info;
      default:
        return colors.disabled;
    }
  };

  const getStatusColor = (status: StatusValue) => {
    switch (status) {
      case 'open':
        return colors.status.success;
      case 'overdue':
        return colors.status.error;
      case 'closed':
        return colors.disabled;
      default:
        return colors.disabled;
    }
  };

  const getCategoryLabel = (category: CategoryValue) => {
    switch (category) {
      case 'request':
        return 'Request';
      case 'complaint':
        return 'Complaint';
      case 'information':
        return 'Information';
      default:
        return category;
    }
  };

  const getStatusLabel = (status: StatusValue) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'overdue':
        return 'Overdue';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
  };

  const color = type === 'category' 
    ? getCategoryColor(value as CategoryValue)
    : getStatusColor(value as StatusValue);
  
  const label = type === 'category'
    ? getCategoryLabel(value as CategoryValue)
    : getStatusLabel(value as StatusValue);

  return (
    <View style={[styles.badge, { backgroundColor: `${color}15` }]}>
      <Text style={[styles.badgeText, { color }]}>
        {label}
      </Text>
    </View>
  );
};






