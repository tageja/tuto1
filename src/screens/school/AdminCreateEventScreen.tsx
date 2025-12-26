import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { DashboardHeader } from "../../components/school/DashboardHeader";
import { CreateEventForm } from "../../components/school/CreateEventForm";
import { useSchool } from "../../contexts/SchoolContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { createEvent } from "../../services/school/events";
import { fetchClassesForSchool } from "../../services/school/attendance";
import { useTheme } from "../../contexts/ThemeContext";
import type { EventCategory, EventStatus } from "../../types/school/events";

const AdminCreateEventScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [loadingClasses, setLoadingClasses] = useState(true);

  useEffect(() => {
    if (currentSchool) {
      loadClasses();
    }
  }, [currentSchool]);

  const loadClasses = async () => {
    if (!currentSchool) {
      console.warn("⚠️ No current school available");
      return;
    }
    try {
      setLoadingClasses(true);
      const schoolId = currentSchool.id || currentSchool.name;
      console.log("📚 Loading classes for school:", schoolId);
      const classesData = await fetchClassesForSchool(schoolId);
      console.log("📚 Loaded classes:", classesData.length, classesData);
      setClasses(classesData);
      if (classesData.length === 0) {
        console.warn("⚠️ No classes found for school:", schoolId);
      }
    } catch (error) {
      console.error("❌ Error loading classes:", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleSubmit = async (data: {
    title: string;
    description?: string;
    category: EventCategory;
    class_id?: string | null;
    starts_at: string;
    ends_at: string;
    location?: string;
    status: EventStatus;
    capacity?: number | null;
    parent_note?: string;
  }) => {
    if (!currentSchool) {
      Alert.alert(t("common.error"), t("school.common.noSchool"));
      return;
    }

    setLoading(true);
    try {
      // Use resolved school ID from currentSchool to ensure consistency
      const schoolId = currentSchool.id || currentSchool.name;
      console.log('📝 Creating event for school:', schoolId);
      
      await createEvent({
        ...data,
        school_id: schoolId,
      });

      Alert.alert(t("common.success"), t("school.events.createSuccess"), [
        {
          text: t("common.ok"),
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error creating event:", error);
      Alert.alert(
        t("common.error"),
        error.message || t("school.events.createError"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  // Styles with dynamic theme

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    headerBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    headerButton: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.xs,
    },
    headerBackText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.primary,
      marginLeft: spacing.xs,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <DashboardHeader
        schoolName={currentSchool?.name || ""}
        onNotificationPress={() => {}}
      />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          <Text style={styles.headerBackText}>{t("school.events.title")}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("school.events.createEvent")}</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <MaterialIcons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t("common.loading")}</Text>
        </View>
      ) : (
        <CreateEventForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          classes={classes}
        />
      )}
    </SafeAreaView>
  );
};

export default AdminCreateEventScreen;
