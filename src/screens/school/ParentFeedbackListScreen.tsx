import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSchool } from "../../contexts/SchoolContext";
import { useTheme } from "../../contexts/ThemeContext";
import SchoolHeader from "../../components/common/SchoolHeader";
import { FeedbackCard } from "../../components/school/feedback/FeedbackCard";
import { FeedbackFilters } from "../../components/school/feedback/FeedbackFilters";
import { fetchMyFeedback } from "../../services/school/feedback";
import {
  FeedbackItem,
  FeedbackFilters as FeedbackFiltersType,
} from "../../types/school/feedback";

export default function ParentFeedbackListScreen() {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<
    "request" | "complaint" | "information" | "all"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "open" | "overdue" | "closed" | "all"
  >("all");

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
    headerLeft: {
      flex: 1,
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: "700",
      color: colors.text.primary,
      marginBottom: 2,
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    createButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
    },
    createButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.sm,
      fontWeight: "600",
      marginLeft: 4,
    },
    content: {
      flex: 1,
    },
    resultsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    resultsCount: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
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
      fontWeight: "600",
    },
    emptySubtext: {
      marginTop: spacing.xs,
      fontSize: typography.fontSize.sm,
      color: colors.text.light,
      textAlign: "center",
    },
  });

  const loadData = useCallback(async () => {
    if (!currentSchool) return;

    try {
      setLoading(true);
      const schoolId = currentSchool.id || currentSchool.name;

      const filters: FeedbackFiltersType = {
        category: categoryFilter === "all" ? undefined : categoryFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
      };

      const data = await fetchMyFeedback(schoolId, filters);
      setFeedbacks(data);
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool, categoryFilter, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCreatePress = () => {
    navigation.navigate("FeedbackCreate" as never);
  };

  const handleFeedbackPress = (feedbackId: string) => {
    navigation.navigate("FeedbackDetails" as never, { feedbackId } as never);
  };

  return (
    <View style={styles.container}>
      <SchoolHeader />

      <View style={styles.subHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Feedback</Text>
          <Text style={styles.headerSubtitle}>
            Send requests, complaints, or information and track the status
          </Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={handleCreatePress}
        >
          <MaterialIcons name="add" size={20} color={colors.white} />
          <Text style={styles.createButtonText}>Create</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <FeedbackFilters
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {feedbacks.length} feedback item{feedbacks.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Feedback List */}
        <View style={styles.listContainer}>
          {loading && !refreshing ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : feedbacks.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="feedback"
                size={64}
                color={colors.disabled}
              />
              <Text style={styles.emptyText}>No feedback found</Text>
              <Text style={styles.emptySubtext}>
                Tap "Create" to submit your first feedback
              </Text>
            </View>
          ) : (
            feedbacks.map((feedback) => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                onPress={() => handleFeedbackPress(feedback.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}




