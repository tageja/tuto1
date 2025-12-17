import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSchool } from "../../contexts/SchoolContext";
import { useTheme } from "../../contexts/ThemeContext";
import SchoolHeader from "../../components/common/SchoolHeader";
import {
  createFeedback,
  fetchParentStudents,
} from "../../services/school/feedback";
import { CreateFeedback } from "../../types/school/feedback";

type CategoryType = "request" | "complaint" | "information";

const ParentCreateFeedbackScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();

  const [formData, setFormData] = useState<CreateFeedback>({
    schoolId: currentSchool?.id || currentSchool?.name || "",
    studentId: "",
    category: "request",
    title: "",
    description: "",
  });

  const [students, setStudents] = useState<
    Array<{
      id: string;
      full_name: string;
    }>
  >([]);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryType>("request");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    backButton: {
      marginRight: spacing.sm,
    },
    headerContent: {
      flex: 1,
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: "700",
      color: colors.text.primary,
    },
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: 2,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.md,
    },
    section: {
      marginBottom: spacing.lg,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    labelRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    required: {
      color: colors.status.error,
    },
    charCount: {
      fontSize: typography.fontSize.xs,
      color: colors.text.light,
    },
    dropdown: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.background.tertiary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    dropdownText: {
      flex: 1,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    dropdownPlaceholder: {
      color: colors.text.light,
    },
    categoryContainer: {
      gap: spacing.sm,
    },
    categoryCard: {
      backgroundColor: colors.background.tertiary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 2,
      borderColor: "transparent",
    },
    categoryCardSelected: {
      backgroundColor: `${colors.primary}15`,
      borderColor: colors.primary,
    },
    categoryTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: "600",
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    categoryTitleSelected: {
      color: colors.primary,
    },
    categoryDescription: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    categoryDescriptionSelected: {
      color: colors.text.primary,
    },
    input: {
      backgroundColor: colors.background.tertiary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    textArea: {
      backgroundColor: colors.background.tertiary,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      minHeight: 120,
    },
    inputError: {
      borderColor: colors.status.error,
    },
    errorText: {
      fontSize: typography.fontSize.xs,
      color: colors.status.error,
      marginTop: spacing.xs,
    },
    buttonContainer: {
      flexDirection: "row",
      gap: spacing.md,
      marginTop: spacing.lg,
      marginBottom: spacing.xl,
    },
    button: {
      flex: 1,
      paddingVertical: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelButton: {
      backgroundColor: colors.white,
      borderWidth: 1,
      borderColor: colors.border.medium,
    },
    cancelButtonText: {
      fontSize: typography.fontSize.md,
      fontWeight: "600",
      color: colors.text.secondary,
    },
    submitButton: {
      backgroundColor: colors.primary,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      fontSize: typography.fontSize.md,
      fontWeight: "600",
      color: colors.white,
    },
  });

  useEffect(() => {
    loadStudents();
  }, [currentSchool]);

  const loadStudents = async () => {
    if (!currentSchool) return;

    try {
      setLoading(true);
      const schoolId = currentSchool.id || currentSchool.name;
      const data = await fetchParentStudents(schoolId);
      setStudents(data.map((s) => ({ id: s.id, full_name: s.full_name })));

      // Auto-select first student if available
      if (data.length > 0 && !formData.studentId) {
        setFormData((prev) => ({ ...prev, studentId: data[0].id }));
      }
    } catch (error) {
      console.error("Error loading students:", error);
      Alert.alert("Error", "Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.studentId) {
      newErrors.studentId = "Please select a student";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!currentSchool) {
      Alert.alert("Error", "School not found");
      return;
    }

    try {
      setSubmitting(true);

      const data: CreateFeedback = {
        schoolId: currentSchool.id || currentSchool.name,
        studentId: formData.studentId,
        category: selectedCategory,
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      const feedback = await createFeedback(data);

      if (feedback) {
        Alert.alert("Success", "Feedback submitted successfully", [
          {
            text: "OK",
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to submit feedback. Please try again.");
      }
    } catch (error: any) {
      console.error("Error creating feedback:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to submit feedback. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryDescription = (category: CategoryType): string => {
    switch (category) {
      case "request":
        return "For requests and suggestions";
      case "complaint":
        return "For issues and concerns";
      case "information":
        return "For general information sharing";
      default:
        return "";
    }
  };

  const getCategoryLabel = (category: CategoryType): string => {
    switch (category) {
      case "request":
        return "Request";
      case "complaint":
        return "Complaint";
      case "information":
        return "Information";
      default:
        return category;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.select({ ios: 0, android: 100 })}
    >
      <SchoolHeader />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons
            name="arrow-back"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Create Feedback</Text>
          <Text style={styles.headerSubtitle}>
            Share your request or concern
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Student Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Student <Text style={styles.required}>*</Text>
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <TouchableOpacity
              style={[styles.dropdown, errors.studentId && styles.inputError]}
              onPress={() => {
                // Simple selection - in a real app, you might want a modal
                if (students.length > 0) {
                  Alert.alert(
                    "Select Student",
                    "",
                    students.map((student) => ({
                      text: student.full_name,
                      onPress: () => {
                        setFormData((prev) => ({
                          ...prev,
                          studentId: student.id,
                        }));
                        setErrors((prev) => ({ ...prev, studentId: "" }));
                      },
                    })),
                  );
                }
              }}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !formData.studentId && styles.dropdownPlaceholder,
                ]}
              >
                {formData.studentId
                  ? students.find((s) => s.id === formData.studentId)
                      ?.full_name || "Select student"
                  : "Select student"}
              </Text>
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          )}
          {errors.studentId && (
            <Text style={styles.errorText}>{errors.studentId}</Text>
          )}
        </View>

        {/* Category Selection */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Category <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.categoryContainer}>
            {(["request", "complaint", "information"] as CategoryType[]).map(
              (category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category &&
                      styles.categoryCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedCategory(category);
                    setFormData((prev) => ({ ...prev, category }));
                  }}
                >
                  <Text
                    style={[
                      styles.categoryTitle,
                      selectedCategory === category &&
                        styles.categoryTitleSelected,
                    ]}
                  >
                    {getCategoryLabel(category)}
                  </Text>
                  <Text
                    style={[
                      styles.categoryDescription,
                      selectedCategory === category &&
                        styles.categoryDescriptionSelected,
                    ]}
                  >
                    {getCategoryDescription(category)}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              Title <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.charCount}>{formData.title.length}/100</Text>
          </View>
          <TextInput
            style={[styles.input, errors.title && styles.inputError]}
            placeholder="Enter feedback title"
            placeholderTextColor={colors.text.light}
            value={formData.title}
            onChangeText={(text) => {
              if (text.length <= 100) {
                setFormData((prev) => ({ ...prev, title: text }));
                setErrors((prev) => ({ ...prev, title: "" }));
              }
            }}
            maxLength={100}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* Description Input */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              Description <Text style={styles.required}>*</Text>
            </Text>
            <Text style={styles.charCount}>
              {formData.description.length}/500
            </Text>
          </View>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            placeholder="Describe your feedback in detail..."
            placeholderTextColor={colors.text.light}
            value={formData.description}
            onChangeText={(text) => {
              if (text.length <= 500) {
                setFormData((prev) => ({ ...prev, description: text }));
                setErrors((prev) => ({ ...prev, description: "" }));
              }
            }}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              submitting && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <MaterialIcons name="send" size={18} color={colors.white} />
                <Text style={styles.submitButtonText}>Send Feedback</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ParentCreateFeedbackScreen;
