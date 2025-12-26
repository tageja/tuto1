import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface Option {
  id: string;
  name: string;
}

interface MessageFiltersProps {
  classOptions: Option[];
  gradeOptions: string[];
  selectedClassId: string | null;
  selectedGrade: string | null;
  onClassChange: (classId: string | null) => void;
  onGradeChange: (grade: string | null) => void;
  allClassesLabel?: string;
  allGradesLabel?: string;
}

export const MessageFilters: React.FC<MessageFiltersProps> = ({
  classOptions,
  gradeOptions,
  selectedClassId,
  selectedGrade,
  onClassChange,
  onGradeChange,
  allClassesLabel = 'All classes',
  allGradesLabel = 'All grades',
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    filterItem: {
      flex: 1,
      position: 'relative',
    },
    label: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      color: colors.text.secondary,
      marginBottom: 4,
      fontFamily: typography.fontFamily.semiBold,
    },
    dropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.tertiary,
      borderRadius: borderRadius.md,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    dropdownText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
      fontFamily: typography.fontFamily.regular,
    },
    dropdownMenu: {
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      backgroundColor: colors.white,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      marginTop: 4,
      maxHeight: 200,
      zIndex: 1000,
      ...shadows.md,
    },
    dropdownItem: {
      paddingHorizontal: 12,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    dropdownItemSelected: {
      backgroundColor: colors.primary + '15',
    },
    dropdownItemText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
      fontFamily: typography.fontFamily.regular,
    },
    dropdownItemTextSelected: {
      color: colors.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
  });

  const [showClassDropdown, setShowClassDropdown] = React.useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = React.useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.label}>Class</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setShowClassDropdown(!showClassDropdown);
              setShowGradeDropdown(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText} numberOfLines={1}>
              {selectedClassId
                ? classOptions.find((c) => c.id === selectedClassId)?.name || allClassesLabel
                : allClassesLabel}
            </Text>
            <MaterialIcons
              name={showClassDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
          {showClassDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  !selectedClassId && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  onClassChange(null);
                  setShowClassDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    !selectedClassId && styles.dropdownItemTextSelected,
                  ]}
                >
                  {allClassesLabel}
                </Text>
              </TouchableOpacity>
              {classOptions.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.dropdownItem,
                    selectedClassId === option.id && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    onClassChange(option.id);
                    setShowClassDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedClassId === option.id && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {option.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.label}>Grade</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              setShowGradeDropdown(!showGradeDropdown);
              setShowClassDropdown(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText} numberOfLines={1}>
              {selectedGrade || allGradesLabel}
            </Text>
            <MaterialIcons
              name={showGradeDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={20}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
          {showGradeDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  !selectedGrade && styles.dropdownItemSelected,
                ]}
                onPress={() => {
                  onGradeChange(null);
                  setShowGradeDropdown(false);
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    !selectedGrade && styles.dropdownItemTextSelected,
                  ]}
                >
                  {allGradesLabel}
                </Text>
              </TouchableOpacity>
              {gradeOptions.map((grade) => (
                <TouchableOpacity
                  key={grade}
                  style={[
                    styles.dropdownItem,
                    selectedGrade === grade && styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    onGradeChange(grade);
                    setShowGradeDropdown(false);
                  }}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      selectedGrade === grade && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {grade}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};











