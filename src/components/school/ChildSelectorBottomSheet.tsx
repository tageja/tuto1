import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Pressable,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { Child } from '../../types/school/attendance';

interface ChildSelectorBottomSheetProps {
  children: Child[];
  selectedId: string | null;
  visible: boolean;
  onSelect: (childId: string) => void;
  onClose: () => void;
}

export const ChildSelectorBottomSheet: React.FC<
  ChildSelectorBottomSheetProps
> = ({ children, selectedId, visible, onSelect, onClose }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.white,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      maxHeight: '80%',
      paddingBottom: spacing.xl,
    },
    handle: {
      width: 40,
      height: 4,
      backgroundColor: colors.border.medium,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    closeButton: {
      padding: spacing.xs,
    },
    listContent: {
      padding: spacing.md,
    },
    childItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
      backgroundColor: colors.background.secondary,
    },
    childItemSelected: {
      backgroundColor: `${colors.primary}15`,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    childItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: `${colors.primary}20`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    childInfo: {
      flex: 1,
    },
    childName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
      marginBottom: 2,
    },
    childClass: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
  });

  const renderChildItem = ({ item }: { item: Child }) => {
    const isSelected = item.id === selectedId;

    return (
      <TouchableOpacity
        style={[styles.childItem, isSelected && styles.childItemSelected]}
        onPress={() => {
          onSelect(item.id);
          onClose();
        }}
        activeOpacity={0.7}
      >
        <View style={styles.childItemContent}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={24} color={colors.primary} />
          </View>
          <View style={styles.childInfo}>
            <Text style={styles.childName}>
              {item.firstName} {item.lastName}
            </Text>
            {item.className && (
              <Text style={styles.childClass}>{item.className}</Text>
            )}
          </View>
        </View>
        {isSelected && (
          <MaterialIcons
            name="check-circle"
            size={24}
            color={colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Child</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <FlatList
            data={children}
            renderItem={renderChildItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
};







