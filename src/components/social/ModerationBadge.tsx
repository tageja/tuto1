import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ModerationStatus } from '../../types/social';

const CONFIG: Record<ModerationStatus, { bg: string; icon: React.ComponentProps<typeof MaterialIcons>['name']; color: string }> = {
  ai_reviewed:     { bg: '#EFF6FF', icon: 'verified',      color: '#0B5FFF' },
  pending:         { bg: '#FFFBEB', icon: 'hourglass-top', color: '#D97706' },
  parent_approved: { bg: '#F0FDF4', icon: 'shield',        color: '#059669' },
};

const LABEL_KEY: Record<ModerationStatus, string> = {
  ai_reviewed:     'community.moderation.aiReviewed',
  pending:         'community.moderation.pending',
  parent_approved: 'community.moderation.parentApproved',
};

interface Props {
  status: ModerationStatus;
}

export default function ModerationBadge({ status }: Props) {
  const { t } = useLanguage();
  const cfg = CONFIG[status] ?? CONFIG.pending;

  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <MaterialIcons name={cfg.icon} size={11} color={cfg.color} />
      <Text style={[styles.text, { color: cfg.color }]}>
        {t(LABEL_KEY[status] as never) as string}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection:     'row',
    alignItems:        'center',
    gap:               3,
    borderRadius:      999,
    paddingHorizontal: 7,
    paddingVertical:   3,
    alignSelf:         'flex-start',
  },
  text: {
    fontSize:   10,
    fontWeight: '600',
  },
});
