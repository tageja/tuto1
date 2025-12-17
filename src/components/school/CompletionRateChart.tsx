import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CompletionRateChartProps {
  completed: number;
  pending: number;
  total: number;
  showEmptyMessage?: boolean;
  emptyMessage?: string;
}

export const CompletionRateChart: React.FC<CompletionRateChartProps> = ({
  completed,
  pending,
  total,
  showEmptyMessage = false,
  emptyMessage = 'No completion data for this selection',
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const completedPercent = total > 0 ? (completed / total) * 100 : 0;
  const pendingPercent = total > 0 ? (pending / total) * 100 : 0;

  if (showEmptyMessage || total === 0) {

    // Styles with dynamic theme

    const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.md,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  circleContainer: {
    width: 120,
    height: 120,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 12,
    transform: [{ rotate: '-90deg' }],
  },
  percentText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    color: colors.text.primary,
    fontFamily: typography.fontFamily.bold,
  },
  completeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  legendText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
  },
});

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <View style={styles.circleContainer}>
          <View style={styles.circleOuter}>
            <View style={styles.circleInner}>
              <Text style={styles.percentText}>{Math.round(completedPercent)}%</Text>
              <Text style={styles.completeText}>Complete</Text>
            </View>
          </View>
          {/* Progress ring - simplified visual representation using border */}
          <View
            style={[
              styles.progressRing,
              {
                borderTopColor: completedPercent > 0 ? '#4CAF50' : 'transparent',
                borderRightColor: completedPercent > 50 ? '#4CAF50' : completedPercent > 0 ? '#4CAF50' : 'transparent',
                borderBottomColor: completedPercent > 50 ? (pendingPercent > 0 ? '#FF9800' : '#4CAF50') : 'transparent',
                borderLeftColor: pendingPercent > 0 ? '#FF9800' : 'transparent',
              },
            ]}
          />
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9800' }]} />
          <Text style={styles.legendText}>Pending</Text>
        </View>
      </View>
    </View>
  );
};

