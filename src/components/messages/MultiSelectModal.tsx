import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

export interface SelectOption {
  id: string;
  label: string;
  subtitle?: string;
}

interface MultiSelectModalProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  searchPlaceholder?: string;
}

export const MultiSelectModal: React.FC<MultiSelectModalProps> = ({
  visible,
  title,
  options,
  selectedIds,
  onClose,
  onConfirm,
  searchPlaceholder = 'Search...',
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.white,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    closeButton: {
      padding: spacing.xs,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    searchInput: {
      flex: 1,
      marginLeft: spacing.sm,
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
      fontFamily: typography.fontFamily.regular,
    },
    selectedCount: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    selectedCountText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
    clearAllText: {
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    listContent: {
      paddingBottom: spacing.lg,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.white,
      marginHorizontal: spacing.md,
      marginTop: spacing.xs,
      padding: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    optionContent: {
      flex: 1,
      marginRight: spacing.sm,
    },
    optionLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.medium,
    },
    optionSubtitle: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
      marginTop: 2,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border.default,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xl * 2,
    },
    emptyText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.md,
      fontFamily: typography.fontFamily.regular,
    },
    footer: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background.tertiary,
      borderWidth: 1,
      borderColor: colors.border.light,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    confirmButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    confirmButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.white,
      fontFamily: typography.fontFamily.semiBold,
    },
  });

  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSelection = (id: string) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    onConfirm(localSelectedIds);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedIds(selectedIds); // Reset to original
    setSearchQuery('');
    onClose();
  };

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      option.subtitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }: { item: SelectOption }) => {
    const isSelected = localSelectedIds.includes(item.id);

    return (
      <TouchableOpacity
        style={styles.optionItem}
        onPress={() => toggleSelection(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <Text style={styles.optionLabel}>{item.label}</Text>
          {item.subtitle && <Text style={styles.optionSubtitle}>{item.subtitle}</Text>}
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <MaterialIcons name="check" size={16} color={colors.white} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCancel}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            placeholderTextColor={colors.text.light}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="clear" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.selectedCount}>
          <Text style={styles.selectedCountText}>
            {localSelectedIds.length} selected
          </Text>
          {localSelectedIds.length > 0 && (
            <TouchableOpacity onPress={() => setLocalSelectedIds([])}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredOptions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={48} color={colors.text.light} />
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
        />

        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};







