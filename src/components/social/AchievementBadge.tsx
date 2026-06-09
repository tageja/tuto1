import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LEVEL_THRESHOLDS = [0, 100, 300, 700, 1500];

export function getLevelFromXp(xp: number): number {
  if (xp >= LEVEL_THRESHOLDS[4]) return 5;
  if (xp >= LEVEL_THRESHOLDS[3]) return 4;
  if (xp >= LEVEL_THRESHOLDS[2]) return 3;
  if (xp >= LEVEL_THRESHOLDS[1]) return 2;
  return 1;
}

export function getXpProgressForLevel(xp: number): { current: number; needed: number; level: number } {
  const level = getLevelFromXp(xp);
  const idx = level - 1;
  const current = level >= 5 ? xp : xp - LEVEL_THRESHOLDS[idx];
  const needed = level >= 5 ? 0 : LEVEL_THRESHOLDS[idx + 1] - LEVEL_THRESHOLDS[idx];
  return { current, needed, level };
}

interface Props {
  xp: number;
  level: number;
  streakCount?: number;
  size?: 'compact' | 'normal';
}

export default function AchievementBadge({ xp, level, streakCount = 0, size = 'compact' }: Props) {
  const { current, needed, level: displayLevel } = getXpProgressForLevel(xp);
  const progress = needed > 0 ? current / needed : 1;
  const showStreak = streakCount >= 3;

  if (size === 'compact') {
    return (
      <View style={styles.compactRow}>
        <View style={styles.levelPill}>
          <MaterialIcons name="star" size={14} color="#F59E0B" />
          <Text style={styles.levelText}>Lv {displayLevel}</Text>
        </View>
        {showStreak && (
          <View style={styles.streakPill}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{streakCount}</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F59E0B', '#F97316']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <MaterialIcons name="emoji-events" size={32} color="#fff" />
          <View style={styles.textWrap}>
            <Text style={styles.levelLabel}>Level {displayLevel}</Text>
            <Text style={styles.xpText}>{xp} XP</Text>
            {needed > 0 && (
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            )}
          </View>
        </View>
        {showStreak && (
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakLabel}>{streakCount} day streak</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  streakEmoji: {
    fontSize: 12,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9A3412',
  },
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  gradient: {
    padding: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textWrap: {
    flex: 1,
  },
  levelLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  xpText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  streakLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
