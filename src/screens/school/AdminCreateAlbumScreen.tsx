import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { DashboardHeader } from "../../components/school/DashboardHeader";
import { useSchool } from "../../contexts/SchoolContext";
import { useLanguage } from "../../contexts/LanguageContext";
import * as ImagePicker from "expo-image-picker";
import {
  createAlbum,
  getCurrentUserId,
  type AlbumCategory,
  type AlbumStatus,
} from "../../services/school/albums";
import { fetchClassesForSchool } from "../../services/school/attendance";
import { useTheme } from "../../contexts/ThemeContext";

const CATEGORIES: AlbumCategory[] = [
  "school",
  "class",
  "competition",
  "workshop",
  "outing",
  "practice",
  "celebration",
];

const AdminCreateAlbumScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>(
    [],
  );
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<AlbumCategory>("school");
  const [eventDate, setEventDate] = useState("");
  const [classId, setClassId] = useState<string>("");
  const [visibility, setVisibility] = useState<"all_parents" | "class_only">(
    "all_parents",
  );
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<AlbumStatus>("active");
  const [selectedPhotos, setSelectedPhotos] = useState<
    ImagePicker.ImagePickerAsset[]
  >([]);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (currentSchool) {
        const id = await getCurrentUserId();
        setUserId(id);
        loadClasses();
      }
    };
    loadData();
  }, [currentSchool]);

  const loadClasses = async () => {
    if (!currentSchool) return;
    try {
      const schoolId = currentSchool.id || currentSchool.name;
      const classesData = await fetchClassesForSchool(schoolId);
      setClasses(classesData);
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const handlePickImages = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Please allow photo library access to upload images.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        setSelectedPhotos((prev) => [...prev, ...result.assets]);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Could not open image library.");
    }
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!currentSchool || !userId) {
      Alert.alert(t("common.error"), t("school.common.noSchool"));
      return;
    }

    if (!title.trim()) {
      Alert.alert(t("common.error"), t("school.photoAlbums.titleRequired"));
      return;
    }

    if (!category) {
      Alert.alert(t("common.error"), t("school.photoAlbums.categoryRequired"));
      return;
    }

    if (selectedPhotos.length === 0) {
      Alert.alert(t("common.error"), t("school.photoAlbums.photosRequired"));
      return;
    }

    setLoading(true);
    try {
      await createAlbum(
        {
          school_id: currentSchool.id || currentSchool.name,
          title: title.trim(),
          category,
          event_date: eventDate || null,
          class_id: classId || null,
          visibility,
          description: description.trim() || null,
          status,
          created_by: userId,
        },
        selectedPhotos,
        (current, total) => {
          console.log(`Uploading ${current}/${total}`);
        },
      );

      Alert.alert(t("common.success"), t("school.photoAlbums.createSuccess"), [
        {
          text: t("common.ok"),
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error creating album:", error);
      Alert.alert(
        t("common.error"),
        error.message || t("school.photoAlbums.createError"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  const getCategoryLabel = (cat: AlbumCategory): string => {
    return (
      t(`school.events.${cat}`) || cat.charAt(0).toUpperCase() + cat.slice(1)
    );
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
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: spacing.md,
    },
    field: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    required: {
      color: colors.error,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
      backgroundColor: colors.background.primary,
    },
    textArea: {
      minHeight: 100,
      textAlignVertical: "top",
    },
    picker: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      backgroundColor: colors.background.primary,
    },
    pickerText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
      flex: 1,
    },
    pickerOptions: {
      marginTop: spacing.xs,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background.primary,
      ...shadows.md,
    },
    pickerOption: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    pickerOptionText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
      flex: 1,
    },
    visibilityRow: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    visibilityButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
    },
    visibilityButtonActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + "10",
    },
    visibilityButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    visibilityButtonTextActive: {
      color: colors.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    uploadArea: {
      borderWidth: 2,
      borderColor: colors.border.light,
      borderStyle: "dashed",
      borderRadius: borderRadius.md,
      padding: spacing.xl,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background.secondary,
    },
    uploadText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
      marginTop: spacing.sm,
    },
    uploadHelper: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      textAlign: "center",
    },
    photosGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    photoItem: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.md,
      overflow: "hidden",
      position: "relative",
    },
    photoThumbnail: {
      width: "100%",
      height: "100%",
    },
    removePhotoButton: {
      position: "absolute",
      top: 4,
      right: 4,
      backgroundColor: colors.error,
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    buttons: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.lg,
      marginBottom: spacing.xl,
    },
    cancelButton: {
      flex: 1,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      alignItems: "center",
    },
    cancelButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
    },
    submitButton: {
      flex: 1,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
      alignItems: "center",
    },
    submitButtonDisabled: {
      opacity: 0.5,
    },
    submitButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.white,
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
          <Text style={styles.headerBackText}>
            {t("school.photoAlbums.title")}
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t("school.photoAlbums.createTitle")}
        </Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <MaterialIcons name="close" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {t("school.photoAlbums.titleLabel")}{" "}
            <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder={t("school.photoAlbums.titlePlaceholder")}
            value={title}
            onChangeText={setTitle}
            editable={!loading}
          />
        </View>

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {t("school.photoAlbums.categoryLabel")}{" "}
            <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            disabled={loading}
          >
            <Text style={styles.pickerText}>
              {category
                ? getCategoryLabel(category)
                : t("school.photoAlbums.categoryPlaceholder")}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
          {showCategoryPicker && (
            <View style={styles.pickerOptions}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={styles.pickerOption}
                  onPress={() => {
                    setCategory(cat);
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>
                    {getCategoryLabel(cat)}
                  </Text>
                  {category === cat && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Event Date */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {t("school.photoAlbums.eventDateLabel")}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={eventDate}
            onChangeText={setEventDate}
            editable={!loading}
          />
        </View>

        {/* Visibility */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {t("school.photoAlbums.visibilityLabel")}
          </Text>
          <View style={styles.visibilityRow}>
            <TouchableOpacity
              style={[
                styles.visibilityButton,
                visibility === "all_parents" && styles.visibilityButtonActive,
              ]}
              onPress={() => {
                setVisibility("all_parents");
                setClassId("");
              }}
              disabled={loading}
            >
              <MaterialIcons
                name="visibility"
                size={20}
                color={
                  visibility === "all_parents"
                    ? colors.primary
                    : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.visibilityButtonText,
                  visibility === "all_parents" &&
                    styles.visibilityButtonTextActive,
                ]}
              >
                {t("school.photoAlbums.visibleToAll")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.visibilityButton,
                visibility === "class_only" && styles.visibilityButtonActive,
              ]}
              onPress={() => {
                setVisibility("class_only");
                if (!classId && classes.length > 0) {
                  setClassId(classes[0].id);
                }
              }}
              disabled={loading}
            >
              <MaterialIcons
                name="visibility-off"
                size={20}
                color={
                  visibility === "class_only"
                    ? colors.primary
                    : colors.text.secondary
                }
              />
              <Text
                style={[
                  styles.visibilityButtonText,
                  visibility === "class_only" &&
                    styles.visibilityButtonTextActive,
                ]}
              >
                {t("school.photoAlbums.restrictedToClass")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Class Selector - Only show when visibility is 'class_only' */}
        {visibility === "class_only" && (
          <View style={styles.field}>
            <Text style={styles.label}>
              {t("school.photoAlbums.restrictClassLabel")}{" "}
              <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowClassPicker(!showClassPicker)}
              disabled={loading}
            >
              <Text style={styles.pickerText}>
                {classId
                  ? classes.find((c) => c.id === classId)?.name
                  : t("school.photoAlbums.selectClass")}
              </Text>
              <MaterialIcons
                name="arrow-drop-down"
                size={24}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
            {showClassPicker && (
              <View style={styles.pickerOptions}>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={styles.pickerOption}
                    onPress={() => {
                      setClassId(cls.id);
                      setShowClassPicker(false);
                    }}
                  >
                    <Text style={styles.pickerOptionText}>{cls.name}</Text>
                    {classId === cls.id && (
                      <MaterialIcons
                        name="check"
                        size={20}
                        color={colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {t("school.photoAlbums.descriptionLabel")}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t("school.photoAlbums.descriptionPlaceholder")}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            editable={!loading}
          />
        </View>

        {/* Status */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {t("school.photoAlbums.statusLabel")}
          </Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowStatusPicker(!showStatusPicker)}
            disabled={loading}
          >
            <Text style={styles.pickerText}>
              {status === "active"
                ? t("school.photoAlbums.active")
                : t("school.photoAlbums.archived")}
            </Text>
            <MaterialIcons
              name="arrow-drop-down"
              size={24}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
          {showStatusPicker && (
            <View style={styles.pickerOptions}>
              {(["active", "archived"] as AlbumStatus[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.pickerOption}
                  onPress={() => {
                    setStatus(s);
                    setShowStatusPicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>
                    {s === "active"
                      ? t("school.photoAlbums.active")
                      : t("school.photoAlbums.archived")}
                  </Text>
                  {status === s && (
                    <MaterialIcons
                      name="check"
                      size={20}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Photos */}
        <View style={styles.field}>
          <Text style={styles.label}>
            {t("school.photoAlbums.photosLabel")}{" "}
            <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.uploadArea}
            onPress={handlePickImages}
            disabled={loading}
          >
            <MaterialIcons
              name="cloud-upload"
              size={48}
              color={colors.primary}
            />
            <Text style={styles.uploadText}>
              {t("school.photoAlbums.uploadText")}
            </Text>
            <Text style={styles.uploadHelper}>
              {t("school.photoAlbums.photosHelper")}
            </Text>
          </TouchableOpacity>

          {/* Selected Photos Grid */}
          {selectedPhotos.length > 0 && (
            <View style={styles.photosGrid}>
              {selectedPhotos.map((photo, index) => (
                <View key={index} style={styles.photoItem}>
                  <Image
                    source={{ uri: photo.uri }}
                    style={styles.photoThumbnail}
                  />
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => handleRemovePhoto(index)}
                  >
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={colors.white}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>
              {t("school.photoAlbums.cancel")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {t("school.photoAlbums.createTitle")}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AdminCreateAlbumScreen;
