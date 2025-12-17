import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSchool } from "../../contexts/SchoolContext";
import { useUser } from "../../contexts/UserContext";
import { useTheme } from "../../contexts/ThemeContext";
import { AnnouncementCard } from "../../components/school/AnnouncementCard";
import { FilterChip } from "../../components/school/FilterChip";
import SchoolHeader from "../../components/common/SchoolHeader";
import {
  fetchAnnouncements,
  fetchAnnouncementReadReceipts,
  markAnnouncementAsRead,
} from "../../services/school/announcements";
import {
  Announcement,
  AnnouncementTab,
} from "../../types/school/announcements";

export default function ParentAnnouncementsScreen() {
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { userData } = useUser();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [readAnnouncementIds, setReadAnnouncementIds] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState<AnnouncementTab>("active");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    subHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: spacing.md,
      backgroundColor: colors.background.primary,
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: "700",
      color: colors.text.primary,
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    content: {
      flex: 1,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background.tertiary,
      marginHorizontal: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: 8,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    tabsContainer: {
      marginBottom: spacing.md,
    },
    tabScroll: {
      paddingHorizontal: spacing.md,
    },
    resultsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    resultsCount: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    markAllReadText: {
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontWeight: "600",
    },
    listContainer: {
      paddingHorizontal: spacing.md,
      paddingBottom: 20,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
    },
    emptyText: {
      marginTop: spacing.md,
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
    },
  });

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadData = useCallback(async () => {
    if (!currentSchool || !userData) return;

    try {
      setLoading(true);
      const schoolId = currentSchool.id || currentSchool.name;

      // Fetch announcements
      const data = await fetchAnnouncements(schoolId, {
        tab: activeTab,
        q: debouncedSearch,
      });

      // Fetch read receipts if user is logged in
      if (data.length > 0 && userData.id) {
        const ids = data.map((a) => a.id);
        const readIds = await fetchAnnouncementReadReceipts(userData.id, ids);
        setReadAnnouncementIds(new Set(readIds));
      }

      setAnnouncements(data);
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool, userData, activeTab, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleMarkAsRead = async (announcement: Announcement) => {
    if (!userData?.id) return;

    // Optimistic update
    setReadAnnouncementIds((prev) => new Set(prev).add(announcement.id));

    const success = await markAnnouncementAsRead(announcement.id, userData.id);
    if (!success) {
      // Revert if failed
      setReadAnnouncementIds((prev) => {
        const next = new Set(prev);
        next.delete(announcement.id);
        return next;
      });
    }
  };

  const markAllAsRead = async () => {
    if (!userData?.id) return;

    const unread = announcements.filter((a) => !readAnnouncementIds.has(a.id));
    if (unread.length === 0) return;

    // Optimistic update
    setReadAnnouncementIds((prev) => {
      const next = new Set(prev);
      unread.forEach((a) => next.add(a.id));
      return next;
    });

    // Process in background
    Promise.all(
      unread.map((a) => markAnnouncementAsRead(a.id, userData.id!)),
    ).catch(console.error);
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
      >
        <FilterChip
          label="Active"
          selected={activeTab === "active"}
          onPress={() => setActiveTab("active")}
        />
        <FilterChip
          label="Urgent"
          selected={activeTab === "urgent"}
          onPress={() => setActiveTab("urgent")}
        />
        <FilterChip
          label="Expired"
          selected={activeTab === "expired"}
          onPress={() => setActiveTab("expired")}
        />
        <FilterChip
          label="All"
          selected={activeTab === "all"}
          onPress={() => setActiveTab("all")}
        />
      </ScrollView>
    </View>
  );

  const unreadCount = announcements.filter(
    (a) => !readAnnouncementIds.has(a.id),
  ).length;

  return (
    <View style={styles.container}>
      <SchoolHeader />

      <View style={styles.subHeader}>
        <View>
          <Text style={styles.headerTitle}>Announcements</Text>
          <Text style={styles.headerSubtitle}>Latest news & updates</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={colors.disabled} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search announcements..."
            value={searchInput}
            onChangeText={setSearchInput}
            placeholderTextColor={colors.disabled}
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => setSearchInput("")}>
              <MaterialIcons name="close" size={20} color={colors.disabled} />
            </TouchableOpacity>
          )}
        </View>

        {renderTabs()}

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {announcements.length} announcement
            {announcements.length !== 1 ? "s" : ""}
          </Text>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markAllReadText}>Mark All as Read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Announcements List */}
        <View style={styles.listContainer}>
          {loading && !refreshing ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : announcements.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="campaign"
                size={64}
                color={colors.disabled}
              />
              <Text style={styles.emptyText}>No announcements found</Text>
            </View>
          ) : (
            announcements.map((announcement) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                isRead={readAnnouncementIds.has(announcement.id)}
                onPress={() => {
                  handleMarkAsRead(announcement);
                  navigation.navigate("SchoolAnnouncementDetail", {
                    announcement,
                  });
                }}
                onMarkAsRead={() => handleMarkAsRead(announcement)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
