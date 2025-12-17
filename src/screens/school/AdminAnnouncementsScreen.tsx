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
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSchool } from "../../contexts/SchoolContext";
import { useTheme } from "../../contexts/ThemeContext";
import { AnnouncementCard } from "../../components/school/AnnouncementCard";
import { FilterChip } from "../../components/school/FilterChip";
import { AnnouncementActionsMenu } from "../../components/school/AnnouncementActionsMenu";
import SchoolHeader from "../../components/common/SchoolHeader";
import { fetchAnnouncements } from "../../services/school/announcements";
import {
  Announcement,
  AnnouncementTab,
} from "../../types/school/announcements";

export default function AdminAnnouncementsScreen() {
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState<AnnouncementTab>("published");
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Actions menu
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

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
    listContainer: {
      paddingHorizontal: spacing.md,
      paddingBottom: 80,
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
    fab: {
      position: "absolute",
      bottom: spacing.lg,
      right: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.lg,
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
    if (!currentSchool) return;

    try {
      setLoading(true);
      const schoolId = currentSchool.id || currentSchool.name;

      const data = await fetchAnnouncements(schoolId, {
        tab: activeTab,
        q: debouncedSearch,
      });

      setAnnouncements(data);
    } catch (error) {
      console.error("Error loading announcements:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool, activeTab, debouncedSearch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleOverflowPress = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsMenuVisible(true);
  };

  const handleEdit = () => {
    if (selectedAnnouncement) {
      navigation.navigate("SchoolAnnouncementDetail", {
        announcement: selectedAnnouncement,
      });
    }
  };

  const handlePublish = async () => {
    if (!selectedAnnouncement) return;
    Alert.alert(
      "Publish Announcement",
      "Are you sure you want to publish this announcement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Publish",
          onPress: async () => {
            // TODO: Implement publish logic when API is ready
            console.log("Publish announcement:", selectedAnnouncement.id);
            Alert.alert("Success", "Announcement published successfully");
            loadData();
          },
        },
      ],
    );
  };

  const handleArchive = async () => {
    if (!selectedAnnouncement) return;
    Alert.alert(
      "Archive Announcement",
      "Are you sure you want to archive this announcement?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          onPress: async () => {
            // TODO: Implement archive logic when API is ready
            console.log("Archive announcement:", selectedAnnouncement.id);
            Alert.alert("Success", "Announcement archived successfully");
            loadData();
          },
        },
      ],
    );
  };

  const handleRestore = async () => {
    if (!selectedAnnouncement) return;
    // TODO: Implement restore logic when API is ready
    console.log("Restore announcement:", selectedAnnouncement.id);
    Alert.alert("Success", "Announcement restored successfully");
    loadData();
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    Alert.alert(
      "Delete Announcement",
      "Are you sure you want to permanently delete this announcement? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // TODO: Implement delete logic when API is ready
            console.log("Delete announcement:", selectedAnnouncement.id);
            Alert.alert("Success", "Announcement deleted successfully");
            loadData();
          },
        },
      ],
    );
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
      >
        <FilterChip
          label="Published"
          selected={activeTab === "published"}
          onPress={() => setActiveTab("published")}
        />
        <FilterChip
          label="Drafts"
          selected={activeTab === "draft"}
          onPress={() => setActiveTab("draft")}
        />
        <FilterChip
          label="Archived"
          selected={activeTab === "archived"}
          onPress={() => setActiveTab("archived")}
        />
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <SchoolHeader />

      <View style={styles.subHeader}>
        <View>
          <Text style={styles.headerTitle}>Announcements</Text>
          <Text style={styles.headerSubtitle}>Manage school announcements</Text>
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
                onPress={() =>
                  navigation.navigate("SchoolAnnouncementDetail", {
                    announcement,
                  })
                }
                onOverflowPress={handleOverflowPress}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("SchoolAddAnnouncement")}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>

      {/* Actions Menu */}
      {selectedAnnouncement && (
        <AnnouncementActionsMenu
          announcement={selectedAnnouncement}
          visible={isMenuVisible}
          onClose={() => setIsMenuVisible(false)}
          onEdit={handleEdit}
          onPublish={handlePublish}
          onArchive={handleArchive}
          onRestore={handleRestore}
          onDelete={handleDelete}
        />
      )}
    </View>
  );
}
