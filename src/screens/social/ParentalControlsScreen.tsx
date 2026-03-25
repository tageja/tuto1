import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { ensureSocialProfile } from '../../services/social/auth.service';
import { getChildActivity, setParentalControls } from '../../services/social/parental.service';
import type { ChildActivity } from '../../services/social/parental.service';

export default function ParentalControlsScreen() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState<ChildActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const profile = await ensureSocialProfile();
      if (!profile || profile.role !== 'parent') {
        setChildren([]);
        return;
      }
      // For MVP: show placeholder — child list would come from linked children
      setChildren([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B5FFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && <Text style={styles.error}>{error}</Text>}
      {children.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Parental controls let you view your child's activity and set screen time limits.
          </Text>
          <Text style={styles.emptySubtext}>
            Link a child profile to get started. Coming soon.
          </Text>
        </View>
      ) : (
        children.map((c) => (
          <View key={c.profile.id} style={styles.card}>
            <Text style={styles.name}>{c.profile.display_name}</Text>
            <Text style={styles.stats}>
              Posts: {c.postsCreated} · Likes: {c.likesGiven} · Comments: {c.commentsMade}
            </Text>
            <Text style={styles.period}>Last {c.period}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFC' },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  error: { color: '#DC2626', marginBottom: 16 },
  empty: { paddingTop: 40, gap: 8 },
  emptyText: { fontSize: 16, color: '#374151', lineHeight: 24 },
  emptySubtext: { fontSize: 14, color: '#6B7280' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  name: { fontSize: 16, fontWeight: '600', color: '#111' },
  stats: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  period: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
});
