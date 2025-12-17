/**
 * KPI Row Component
 * Horizontal scrollable row of KPI cards
 */

import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { KpiCard } from './KpiCard';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export interface KpiItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
  iconColor?: string;
}

interface KpiRowProps {
  kpis: KpiItem[];
}

export const KpiRow: React.FC<KpiRowProps> = ({ kpis }) => {
  const { colors, spacing, typography, borderRadius } = useTheme();

  const styles = StyleSheet.create({
    scrollView: {
      marginVertical: 8,
    },
    scrollContainer: {
      paddingHorizontal: 16,
      gap: 12,
    },
    kpiWrapper: {
      marginRight: 12,
    },
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={styles.scrollView}
    >
      {kpis.map((kpi, index) => (
        <View key={index} style={styles.kpiWrapper}>
          <KpiCard {...kpi} />
        </View>
      ))}
    </ScrollView>
  );
};



export default KpiRow;






