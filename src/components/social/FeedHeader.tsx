import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Image,
} from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import type { FeedTab } from '../../services/social/feed.service';

interface Props {
  activeTab:   FeedTab;
  onTabChange: (tab: FeedTab) => void;
  authorAvatarUrl?: string;
  authorInitial?:   string;
  onComposerPress?: () => void;
}

const TABS: { key: FeedTab; labelKey: string }[] = [
  { key: 'school',    labelKey: 'community.feed.schoolTab' },
  { key: 'forYou',   labelKey: 'community.feed.forYouTab' },
  { key: 'following', labelKey: 'community.feed.followingTab' },
];

export default function FeedHeader({
  activeTab,
  onTabChange,
  authorAvatarUrl,
  authorInitial,
  onComposerPress,
}: Props) {
  const { t } = useLanguage();
  const indicatorX = useRef(new Animated.Value(0)).current;
  const tabWidth = useRef(0);

  const handleTabPress = useCallback(
    (tab: FeedTab, index: number) => {
      Animated.spring(indicatorX, {
        toValue:         index * tabWidth.current,
        useNativeDriver: true,
        speed:           25,
        bounciness:      6,
      }).start();
      onTabChange(tab);
    },
    [indicatorX, onTabChange],
  );

  const activeIndex = TABS.findIndex((t) => t.key === activeTab);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View
        style={styles.tabs}
        onLayout={(e) => {
          tabWidth.current = e.nativeEvent.layout.width / TABS.length;
          // Align indicator on mount
          indicatorX.setValue(activeIndex * tabWidth.current);
        }}
      >
        {TABS.map((tab, i) => {
          const isActive = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              style={styles.tab}
              onPress={() => handleTabPress(tab.key, i)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {t(tab.labelKey as never) as string}
              </Text>
            </Pressable>
          );
        })}
        <Animated.View
          style={[
            styles.indicator,
            {
              width:     `${100 / TABS.length}%`,
              transform: [{ translateX: indicatorX }],
            },
          ]}
        />
      </View>

      {/* Composer trigger */}
      {onComposerPress && (
        <Pressable style={styles.composer} onPress={onComposerPress}>
          {authorAvatarUrl ? (
            <Image source={{ uri: authorAvatarUrl }} style={styles.composerAvatar} />
          ) : (
            <View style={styles.composerAvatarFallback}>
              <Text style={styles.composerInitial}>{authorInitial ?? '?'}</Text>
            </View>
          )}
          <View style={styles.composerInput}>
            <Text style={styles.composerPlaceholder}>
              {t('community.composer.placeholder') as string}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 8,
  },
  tabs: {
    flexDirection: 'row',
    position:      'relative',
  },
  tab: {
    flex:            1,
    paddingVertical: 14,
    alignItems:      'center',
  },
  tabText: {
    fontSize:   15,
    fontWeight: '500',
    color:      '#6B7280',
  },
  tabTextActive: {
    color:      '#0B5FFF',
    fontWeight: '700',
  },
  indicator: {
    position:        'absolute',
    bottom:          0,
    height:          3,
    backgroundColor: '#0B5FFF',
    borderRadius:    999,
  },
  composer: {
    flexDirection:  'row',
    alignItems:     'center',
    paddingHorizontal: 16,
    paddingVertical:   12,
    gap:            12,
  },
  composerAvatar: {
    width:        36,
    height:       36,
    borderRadius: 18,
  },
  composerAvatarFallback: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: '#E5E7EB',
    alignItems:      'center',
    justifyContent:  'center',
  },
  composerInitial: {
    fontSize:   14,
    fontWeight: '700',
    color:      '#6B7280',
  },
  composerInput: {
    flex:              1,
    borderRadius:      999,
    borderWidth:       1,
    borderColor:       '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical:   9,
    backgroundColor:   '#F9FAFC',
  },
  composerPlaceholder: {
    fontSize: 14,
    color:    '#9CA3AF',
  },
});
