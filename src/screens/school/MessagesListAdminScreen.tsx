import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSchool } from "../../contexts/SchoolContext";
import { getCurrentUser } from "../../config/supabase";
import {
  fetchMessageThreads,
  ThreadSummary,
  ThreadFilters,
} from "../../services/school/messages";
import { MessageThreadCard } from "../../components/messages/MessageThreadCard";
import { MessageFilters } from "../../components/messages/MessageFilters";
import SchoolHeader from "../../components/common/SchoolHeader";
import { useTheme } from "../../contexts/ThemeContext";
import { getClasses, getClassGrades } from "../../services/supabase-classes";

const MessagesListAdminScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSchool, isSchoolMode } = useSchool();
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string | null>(null);
  const [classOptions, setClassOptions] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [gradeOptions, setGradeOptions] = useState<string[]>([]);
  const [userAuthId, setUserAuthId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSchoolMode || !currentSchool) {
      navigation.goBack();
      return;
    }
    initializeData();
  }, [isSchoolMode, currentSchool]);

  const initializeData = async () => {
    try {
      const user = await getCurrentUser();
      if (user) {
        setUserAuthId(user.id);
      }

      if (currentSchool?.id) {
        // Load classes and grades for filters
        const { classes } = await getClasses(currentSchool.id, { limit: 200 });
        setClassOptions(classes.map((c) => ({ id: c.id, name: c.name })));

        const grades = await getClassGrades(currentSchool.id);
        setGradeOptions(grades);
      }
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  };

  const loadThreads = useCallback(async () => {
    if (!currentSchool?.id || !userAuthId) return;

    try {
      setLoading(true);
      const filters: ThreadFilters = {
        classId: selectedClassId,
        grade: selectedGrade,
        search: searchQuery.trim() || undefined,
      };
      const data = await fetchMessageThreads(
        currentSchool.id,
        userAuthId,
        filters,
      );
      setThreads(data);
    } catch (error) {
      console.error("Error loading message threads:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    currentSchool?.id,
    userAuthId,
    selectedClassId,
    selectedGrade,
    searchQuery,
  ]);

  useEffect(() => {
    if (userAuthId && currentSchool?.id) {
      loadThreads();
    }
  }, [loadThreads]);

  // Polling every 5 seconds
  useEffect(() => {
    if (!userAuthId || !currentSchool?.id) return;

    const interval = setInterval(() => {
      loadThreads();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadThreads, userAuthId, currentSchool?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadThreads();
  }, [loadThreads]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: typography.fontSize.xxl,
      fontWeight: "700",
      color: colors.text.primary,
      fontFamily: typography.fontFamily.bold,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
    composeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      ...shadows.sm,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    searchIcon: {
      marginRight: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
      fontFamily: typography.fontFamily.regular,
    },
    listContent: {
      backgroundColor: colors.white,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.white,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: spacing.xxl,
      paddingHorizontal: spacing.lg,
    },
    emptyTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: "600",
      color: colors.text.primary,
      marginTop: spacing.md,
      marginBottom: spacing.xs,
      fontFamily: typography.fontFamily.semiBold,
    },
    emptySubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      textAlign: "center",
      fontFamily: typography.fontFamily.regular,
    },
  });

  const handleThreadPress = (threadId: string) => {
    navigation.navigate("MessagesConversation" as never, { threadId } as never);
  };

  const handleCompose = () => {
    navigation.navigate("MessagesCompose" as never);
  };

  const totalUnread = threads.reduce(
    (sum, thread) => sum + thread.unreadCount,
    0,
  );

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getParticipantName = (thread: ThreadSummary): string => {
    // Extract participant name from thread subject or use a default
    // In a real implementation, we'd fetch participant details
    return thread.thread.subject || "Unknown";
  };

  const getParticipantRole = (thread: ThreadSummary): string => {
    return thread.participantRole || "Participant";
  };

  const renderThreadCard = ({ item }: { item: ThreadSummary }) => {
    const timestamp = item.lastMessage?.sent_at || item.thread.updated_at;
    const formattedTime = timestamp ? formatTimestamp(timestamp) : "";
    const senderName = getParticipantName(item);
    const role = getParticipantRole(item);
    const lastMessage = item.lastMessage?.body || "No message preview yet";

    return (
      <MessageThreadCard
        id={item.thread.id}
        sender={senderName}
        lastMessage={lastMessage}
        timestamp={formattedTime}
        unreadCount={item.unreadCount}
        priority={item.thread.priority}
        role={role}
        onClick={() => handleThreadPress(item.thread.id)}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="message" size={48} color={colors.text.light} />
      <Text style={styles.emptyTitle}>No messages found</Text>
      <Text style={styles.emptySubtitle}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  if (!isSchoolMode || !currentSchool) {
    return null;
  }

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Messages</Text>
          <Text style={styles.subtitle}>
            {totalUnread > 0 ? `${totalUnread} unread` : "All caught up"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={handleCompose}
          activeOpacity={0.7}
        >
          <MaterialIcons name="add" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons
          name="search"
          size={20}
          color={colors.text.light}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages..."
          placeholderTextColor={colors.text.light}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <MaterialIcons name="clear" size={20} color={colors.text.light} />
          </TouchableOpacity>
        )}
      </View>

      <MessageFilters
        classOptions={classOptions}
        gradeOptions={gradeOptions}
        selectedClassId={selectedClassId}
        selectedGrade={selectedGrade}
        onClassChange={setSelectedClassId}
        onGradeChange={setSelectedGrade}
      />

      {loading && threads.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={threads}
          renderItem={renderThreadCard}
          keyExtractor={(item) => item.thread.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

export default MessagesListAdminScreen;
