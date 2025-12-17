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
import { useTheme } from "../../contexts/ThemeContext";
import SchoolHeader from "../../components/common/SchoolHeader";
import { FeedbackCard } from "../../components/school/feedback/FeedbackCard";
import { FeedbackFilters } from "../../components/school/feedback/FeedbackFilters";
import { fetchSchoolFeedback } from "../../services/school/feedback";
import {
  FeedbackItem,
  FeedbackFilters as FeedbackFiltersType,
} from "../../types/school/feedback";

export default function AdminFeedbackListScreen() {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<
    "request" | "complaint" | "information" | "all"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "open" | "overdue" | "closed" | "all"
  >("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "deadline">(
    "newest",
  );

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const loadData = useCallback(async () => {
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
        marginBottom: 2,
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

    if (!currentSchool) return;

    try {
      setLoading(true);
      const schoolId = currentSchool.id || currentSchool.name;

      const filters: FeedbackFiltersType = {
        category: categoryFilter === "all" ? undefined : categoryFilter,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: debouncedSearch.trim() || undefined,
        sortBy,
      };

      const data = await fetchSchoolFeedback(schoolId, filters);
      setFeedbacks(data);
    } catch (error) {
      console.error("Error loading feedback:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool, categoryFilter, statusFilter, debouncedSearch, sortBy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleFeedbackPress = (feedbackId: string) => {
    navigation.navigate("FeedbackDetails" as never, { feedbackId } as never);
  };

  return (
    <View style={styles.container}>
      <SchoolHeader />

      <View style={styles.subHeader}>
        <View>
          <Text style={styles.headerTitle}>Feedback</Text>
          <Text style={styles.headerSubtitle}>
            View and respond to feedback from parents
          </Text>
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
          <MaterialIcons name="search" size={20} color={colors.text.light} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search feedback..."
            placeholderTextColor={colors.text.light}
            value={searchInput}
            onChangeText={setSearchInput}
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={() => setSearchInput("")}>
              <MaterialIcons name="close" size={20} color={colors.text.light} />
            </TouchableOpacity>
          )}
        </View>

        <FeedbackFilters
          categoryFilter={categoryFilter}
          statusFilter={statusFilter}
          onCategoryChange={setCategoryFilter}
          onStatusChange={setStatusFilter}
          showSort={true}
          sortBy={sortBy}
          onSortChange={setSortBy}
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
                {searchInput
                  ? "Try adjusting your search"
                  : "No feedback submissions yet"}
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
