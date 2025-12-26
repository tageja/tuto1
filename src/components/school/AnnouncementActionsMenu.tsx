import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Announcement } from '../../types/school/announcements';

interface AnnouncementActionsMenuProps {
  announcement: Announcement;
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onPublish?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
  onDelete: () => void;
}

export const AnnouncementActionsMenu: React.FC<AnnouncementActionsMenuProps> = ({
  announcement,
  visible,
  onClose,
  onEdit,
  onPublish,
  onArchive,
  onRestore,
  onDelete,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuContainer: {
      width: '80%',
      maxWidth: 300,
    },
    menu: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      ...shadows.lg,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.white,
    },
    menuText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      marginLeft: spacing.md,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border.light,
    },
  });

  const handleAction = (action: () => void) => {
    onClose();
    // Delay action slightly to allow modal to close
    setTimeout(action, 100);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <View style={styles.menu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction(onEdit)}
            >
              <MaterialIcons name="edit" size={20} color={colors.text.primary} />
              <Text style={styles.menuText}>Edit</Text>
            </TouchableOpacity>

            {announcement.status === 'Draft' && onPublish && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleAction(onPublish)}
              >
                <MaterialIcons name="publish" size={20} color={colors.status.success} />
                <Text style={[styles.menuText, { color: colors.status.success }]}>Publish</Text>
              </TouchableOpacity>
            )}

            {announcement.status === 'Published' && onArchive && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleAction(onArchive)}
              >
                <MaterialIcons name="archive" size={20} color={colors.status.warning} />
                <Text style={[styles.menuText, { color: colors.status.warning }]}>Archive</Text>
              </TouchableOpacity>
            )}

            {announcement.status === 'Archived' && onRestore && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleAction(onRestore)}
              >
                <MaterialIcons name="restore" size={20} color={colors.status.info} />
                <Text style={[styles.menuText, { color: colors.status.info }]}>Restore</Text>
              </TouchableOpacity>
            )}

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleAction(onDelete)}
            >
              <MaterialIcons name="delete" size={20} color={colors.status.error} />
              <Text style={[styles.menuText, { color: colors.status.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};











