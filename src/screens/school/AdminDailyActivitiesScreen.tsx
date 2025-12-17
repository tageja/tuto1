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
import { KPICard } from "../../components/school/KPICard";
import { ActivityCard } from "../../components/school/ActivityCard";
import { FilterChip } from "../../components/school/FilterChip";
import SchoolHeader from "../../components/common/SchoolHeader";
import {
  fetchDailyActivities,
  fetchActivityKPIs,
  fetchClassesForSchool,
} from "../../services/school/activities";
import {
  DailyActivity,
  ActivityKPI,
  ClassOption,
} from "../../types/school/activities";

export default function AdminDailyActivitiesScreen() {
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [kpis, setKpis] = useState<ActivityKPI>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
  });
  const [classes, setClasses] = useState<ClassOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
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
    syncBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#E8F5E9",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    syncDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.status.success,
      marginRight: 4,
    },
    syncText: {
      fontSize: 10,
      color: colors.status.success,
      fontWeight: "600",
    },
    content: {
      flex: 1,
    },
    kpiRow: {
      flexDirection: "row",
      paddingHorizontal: spacing.sm,
      marginBottom: spacing.sm,
    },
    kpiCol: {
      flex: 1,
      paddingHorizontal: spacing.xs,
    },
    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: spacing.sm,
      backgroundColor: colors.background.tertiary,
      marginHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.md,
    },
    dateButton: {
      padding: spacing.sm,
    },
    dateText: {
      fontSize: typography.fontSize.md,
      fontWeight: "600",
      color: colors.text.primary,
      minWidth: 120,
      textAlign: "center",
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
    filtersContainer: {
      marginBottom: spacing.md,
    },
    chipScroll: {
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
      const schoolId = currentSchool.id || currentSchool.name; // Service handles resolution

      const [activitiesData, kpisData, classesData] = await Promise.all([
        fetchDailyActivities(schoolId, {
          date,
          classIds: selectedClassId ? [selectedClassId] : undefined,
          types: selectedType ? [selectedType] : undefined,
          statuses: selectedStatus ? [selectedStatus] : undefined,
          search: debouncedSearch,
        }),
        fetchActivityKPIs(
          schoolId,
          date,
          selectedClassId ? [selectedClassId] : undefined,
        ),
        fetchClassesForSchool(schoolId),
      ]);

      setActivities(activitiesData);
      setKpis(kpisData);
      setClasses(classesData);
    } catch (error) {
      console.error("Error loading daily activities:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    currentSchool,
    date,
    selectedClassId,
    selectedType,
    selectedStatus,
    debouncedSearch,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const changeDate = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
  };

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipScroll}
      >
        <FilterChip
          label={
            selectedClassId
              ? classes.find((c) => c.id === selectedClassId)?.name || "Class"
              : "All Classes"
          }
          selected={!!selectedClassId}
          onPress={() => {
            // In a real app, open a modal/bottom sheet to select class
            // For now, toggle between first class and all for demo if classes exist
            if (selectedClassId) setSelectedClassId(null);
            else if (classes.length > 0) setSelectedClassId(classes[0].id);
          }}
        />
        <FilterChip
          label={selectedType || "All Types"}
          selected={!!selectedType}
          onPress={() => {
            // Simple toggle for demo
            const types = ["Meal", "Learning", "Play", "Rest"];
            const currentIndex = selectedType
              ? types.indexOf(selectedType)
              : -1;
            const nextIndex = (currentIndex + 1) % (types.length + 1);
            setSelectedType(
              nextIndex === types.length ? null : types[nextIndex],
            );
          }}
        />
        <FilterChip
          label={selectedStatus || "All Status"}
          selected={!!selectedStatus}
          onPress={() => {
            // Simple toggle for demo
            const statuses = ["Pending", "In Progress", "Completed"];
            const currentIndex = selectedStatus
              ? statuses.indexOf(selectedStatus)
              : -1;
            const nextIndex = (currentIndex + 1) % (statuses.length + 1);
            setSelectedStatus(
              nextIndex === statuses.length ? null : statuses[nextIndex],
            );
          }}
        />
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <SchoolHeader />

      <View style={styles.subHeader}>
        <View>
          <Text style={styles.headerTitle}>Daily Activities</Text>
          <Text style={styles.headerSubtitle}>Manage school activities</Text>
        </View>
        <View style={styles.syncBadge}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>Synced</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* KPI Cards */}
        <View style={styles.kpiRow}>
          <View style={styles.kpiCol}>
            <KPICard
              label="Total"
              value={kpis.total}
              icon="assignment"
              color={colors.primary}
            />
          </View>
          <View style={styles.kpiCol}>
            <KPICard
              label="Completed"
              value={kpis.completed}
              icon="check-circle"
              color={colors.status.success}
            />
          </View>
        </View>
        <View style={styles.kpiRow}>
          <View style={styles.kpiCol}>
            <KPICard
              label="In Progress"
              value={kpis.inProgress}
              icon="schedule"
              color={colors.status.warning}
            />
          </View>
          <View style={styles.kpiCol}>
            <KPICard
              label="Pending"
              value={kpis.pending}
              icon="pending"
              color={colors.disabled}
            />
          </View>
        </View>

        {/* Date Picker Row */}
        <View style={styles.dateRow}>
          <TouchableOpacity
            onPress={() => changeDate(-1)}
            style={styles.dateButton}
          >
            <MaterialIcons
              name="chevron-left"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
          <Text style={styles.dateText}>
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </Text>
          <TouchableOpacity
            onPress={() => changeDate(1)}
            style={styles.dateButton}
          >
            <MaterialIcons
              name="chevron-right"
              size={24}
              color={colors.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={colors.disabled} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search activities..."
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

        {renderFilters()}

        {/* Activities List */}
        <View style={styles.listContainer}>
          {loading && !refreshing ? (
            <ActivityIndicator
              size="large"
              color={colors.primary}
              style={{ marginTop: 20 }}
            />
          ) : activities.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="event-note"
                size={64}
                color={colors.disabled}
              />
              <Text style={styles.emptyText}>No activities found</Text>
            </View>
          ) : (
            activities.map((activity) => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                onPress={() =>
                  navigation.navigate("SchoolActivityDetail", { activity })
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("SchoolAddActivity")}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}
