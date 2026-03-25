import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';

export type ProfileTab = 'posts' | 'achievements' | 'reels' | 'saved';

interface Props {
  selectedTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  isOwnProfile: boolean;
}

export default function ProfileTabs({
  selectedTab,
  onTabChange,
  isOwnProfile,
}: Props) {
  const { t } = useLanguage();

  const tabs: { key: ProfileTab; label: string }[] = [
    { key: 'posts', label: t('community.profile.tab_posts') as string },
    { key: 'achievements', label: t('community.profile.tab_achievements') as string },
    { key: 'reels', label: t('community.profile.tab_reels') as string },
  ];
  if (isOwnProfile) {
    tabs.push({ key: 'saved', label: t('community.profile.tab_saved') as string });
  }

  return (
    <View style={styles.container}>
      {tabs.map(({ key, label }) => {
        const isActive = selectedTab === key;
        return (
          <Pressable
            key={key}
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={() => onTabChange(key)}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {label}
            </Text>
            {isActive && <View style={styles.underline} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {},
  tabText: {
    fontSize:   14,
    fontWeight:  '500',
    color:       '#6B7280',
  },
  tabTextActive: {
    color:      '#0B5FFF',
    fontWeight:  '600',
  },
  underline: {
    position: 'absolute',
    bottom:  -1,
    left:    0,
    right:   0,
    height:  2,
    backgroundColor: '#0B5FFF',
  },
});
