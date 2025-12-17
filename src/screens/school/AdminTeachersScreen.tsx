import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  RefreshControl,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import SchoolHeader from "../../components/common/SchoolHeader";
import { useLanguage } from "../../contexts/LanguageContext";
import { useSchool } from "../../contexts/SchoolContext";
import { useUser } from "../../contexts/UserContext";
import { KpiRow } from "../../components/kpi/KpiRow";
import { FilterChips } from "../../components/filters/FilterChips";
import { TeacherListItem } from "../../components/school/TeacherListItem";
import { useTheme } from "../../contexts/ThemeContext";
import {
  getTeacherKPIs,
  getTeacherSubjects,
  getTeachers,
  SchoolTeacher,
} from "../../services/supabase-teachers";

const STATUS_OPTIONS = [
  { id: "all", label: "All" },
  { id: "Active", label: "Active" },
  { id: "On Leave", label: "On Leave" },
];

const AdminTeachersScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    section: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.text.primary,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 14,
      color: colors.text.secondary,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 10,
      backgroundColor: colors.background.primary,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 16,
      color: colors.text.primary,
    },
    filtersRow: {
      paddingHorizontal: 16,
      marginBottom: 6,
    },
    loadingWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      marginTop: 8,
      fontSize: 13,
      color: colors.text.secondary,
    },
    listContent: {
      paddingHorizontal: 12,
      paddingBottom: 24,
    },
    emptyWrap: {
      alignItems: "center",
      marginTop: 48,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text.primary,
      marginTop: 12,
    },
    emptySubtitle: {
      fontSize: 13,
      color: colors.text.secondary,
      textAlign: "center",
      marginTop: 4,
    },
  });
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const { userData } = useUser();
  const navigation = useNavigation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<SchoolTeacher[]>([]);
  const [kpis, setKpis] = useState({
    total: 0,
    active: 0,
    onLeave: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!currentSchool?.id) return;
    setLoading(true);
    try {
      const [kpiData, subjectData, teacherData] = await Promise.all([
        getTeacherKPIs(currentSchool.id),
        getTeacherSubjects(currentSchool.id),
        getTeachers(currentSchool.id, {
          search: searchQuery,
          status: selectedStatus,
          subject: selectedSubject,
          limit: 100,
        }),
      ]);
      setKpis(kpiData);
      setSubjects(subjectData);
      setTeachers(teacherData.teachers);
    } catch (error) {
      console.error("AdminTeachersScreen load error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool?.id, searchQuery, selectedStatus, selectedSubject]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const kpiItems = useMemo(
    () => [
      {
        icon: "people",
        label: t("school.teachers.kpis.total"),
        value: kpis.total,
        color: "#0B5FFF",
        iconColor: "#0B5FFF",
      },
      {
        icon: "check-circle",
        label: t("school.teachers.kpis.active"),
        value: kpis.active,
        color: "#10B981",
        iconColor: "#10B981",
      },
      {
        icon: "event-busy",
        label: t("school.teachers.kpis.onLeave"),
        value: kpis.onLeave,
        color: "#F59E0B",
        iconColor: "#F59E0B",
      },
      {
        icon: "star",
        label: t("school.teachers.kpis.avgRating"),
        value: kpis.avgRating || "N/A",
        color: "#8B5CF6",
        iconColor: "#8B5CF6",
      },
    ],
    [kpis, t],
  );

  const subjectOptions = useMemo(
    () => [
      { id: "all", label: t("school.teachers.filters.allSubjects") },
      ...subjects.map((s) => ({ id: s, label: s })),
    ],
    [subjects, t],
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const renderTeacher = ({ item }: { item: SchoolTeacher }) => (
    <TeacherListItem
      teacher={item}
      onPress={() =>
        navigation.navigate(
          "AdminTeacherDetail" as never,
          { teacherId: item.id } as never,
        )
      }
    />
  );

  return (
    <View style={styles.container}>
      <SchoolHeader />

      <View style={styles.section}>
        <Text style={styles.title}>{t("school.teachers.title")}</Text>
        <Text style={styles.subtitle}>{t("school.teachers.subtitle")}</Text>
      </View>

      <KpiRow kpis={kpiItems} />

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color="#A0AEC0" />
        <TextInput
          style={styles.searchInput}
          placeholder={t("school.teachers.searchPlaceholder")}
          placeholderTextColor="#A0AEC0"
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
      </View>

      <View style={styles.filtersRow}>
        <FilterChips
          options={STATUS_OPTIONS}
          selected={selectedStatus}
          onSelect={setSelectedStatus}
        />
        <FilterChips
          options={subjectOptions}
          selected={selectedSubject}
          onSelect={setSelectedSubject}
        />
      </View>

      {loading && teachers.length === 0 ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color="#0B5FFF" size="large" />
          <Text style={styles.loadingText}>{t("school.common.loading")}</Text>
        </View>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item.id}
          renderItem={renderTeacher}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <MaterialIcons name="group" size={48} color="#D0D4DA" />
              <Text style={styles.emptyTitle}>
                {t("school.teachers.noTeachers")}
              </Text>
              <Text style={styles.emptySubtitle}>
                {t("school.teachers.noTeachersSubtitle")}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0B5FFF"
              colors={["#0B5FFF"]}
            />
          }
        />
      )}
    </View>
  );
};

export default AdminTeachersScreen;
