import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useUser } from '../../contexts/UserContext';

interface DashboardMenuProps {
  visible: boolean;
  onClose: () => void;
  onLeaveSchool: () => void;
}

interface MenuItem {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  labelVi: string;
  screen: string;
  roles: ('admin' | 'parent' | 'teacher')[];
}

export const DashboardMenu: React.FC<DashboardMenuProps> = ({
  visible,
  onClose,
  onLeaveSchool,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { language } = useLanguage();
  const navigation = useNavigation();
  const { schoolUser } = useSchool();
  const { userType } = useUser();

  // Get user's role with fallback chain:
  // 1. schoolUser.role (if set in school context)
  // 2. userType from UserContext (from Supabase users table)
  // 3. Default to 'parent'
  const rawRole = schoolUser?.role || userType || 'parent';
  
  // Debug logging
  console.log('🎭 DashboardMenu: schoolUser?.role =', schoolUser?.role);
  console.log('🎭 DashboardMenu: userType =', userType);
  console.log('🎭 DashboardMenu: rawRole =', rawRole);
  
  // Normalize role for filtering
  // schoolUser.role can be: 'school_admin' | 'school_teacher' | 'parent' | 'student'
  // userType can be: 'admin' | 'teacher' | 'parent' | 'student'
  const userRole = rawRole === 'school_admin' ? 'admin' : 
                   rawRole === 'school_teacher' ? 'teacher' : 
                   rawRole;
  
  console.log('🎭 DashboardMenu: Final userRole =', userRole);

  // Menu items with role-based navigation
  const getMenuItems = () => {
    const baseItems: MenuItem[] = [
      { icon: 'dashboard', label: 'Dashboard', labelVi: 'Tổng quan', screen: 'SchoolDashboard', roles: ['admin', 'parent', 'teacher'] },
      { icon: 'class', label: 'Classes', labelVi: 'Lớp học', screen: 'SchoolClasses', roles: ['admin'] },
      { icon: 'people', label: 'Students', labelVi: 'Học sinh', screen: 'SchoolStudents', roles: ['admin'] },
      { icon: 'event-note', label: 'Daily Activities', labelVi: 'Hoạt động hàng ngày', screen: 'SchoolDailyActivities', roles: ['admin', 'parent', 'teacher'] },
      { icon: 'campaign', label: 'Announcements', labelVi: 'Thông báo', screen: 'SchoolAnnouncements', roles: ['admin', 'parent', 'teacher'] },
      { icon: 'message', label: 'Messages', labelVi: 'Tin nhắn', screen: 'SchoolMessages', roles: ['admin', 'parent', 'teacher'] },
      { icon: 'rate-review', label: 'Feedback', labelVi: 'Phản hồi', screen: 'SchoolFeedback', roles: ['admin', 'parent'] },
      { icon: 'event-available', label: 'Attendance', labelVi: 'Điểm danh', screen: 'SchoolAttendance', roles: ['admin', 'parent', 'teacher'] },
      { icon: 'assignment', label: 'Homework', labelVi: 'Bài tập', screen: 'SchoolHomework', roles: ['admin', 'parent', 'teacher'] },
      { icon: 'trending-up', label: 'Progress Reports', labelVi: 'Báo cáo tiến độ', screen: 'SchoolProgress', roles: ['admin', 'parent'] },
      { icon: 'event', label: 'Events', labelVi: 'Sự kiện', screen: 'SchoolEvents', roles: ['admin', 'parent', 'teacher'] },
      { icon: 'photo-library', label: 'Photo Albums', labelVi: 'Album ảnh', screen: 'SchoolPhotoAlbums', roles: ['admin', 'parent'] },
      { icon: 'favorite', label: 'Health Records', labelVi: 'Hồ sơ sức khỏe', screen: 'SchoolHealth', roles: ['admin', 'parent'] },
      { icon: 'medication', label: 'Medicine', labelVi: 'Thuốc men', screen: 'SchoolMedicine', roles: ['admin', 'parent'] },
      { icon: 'emoji-events', label: 'Extracurricular', labelVi: 'Ngoại khóa', screen: 'SchoolActivities', roles: ['admin'] },
      { icon: 'payments', label: 'Payments', labelVi: 'Thanh toán', screen: 'SchoolPayments', roles: ['admin', 'parent'] },
      { icon: 'settings', label: 'Settings', labelVi: 'Cài đặt', screen: 'SettingsStack', roles: ['admin', 'parent'] },
    ];

    // Add role-specific teacher menu item
    if (userRole === 'admin') {
      baseItems.splice(2, 0, { icon: 'school', label: 'Teachers', labelVi: 'Giáo viên', screen: 'AdminTeachers', roles: ['admin'] });
    } else if (userRole === 'parent') {
      baseItems.splice(2, 0, { icon: 'school', label: 'Teachers', labelVi: 'Giáo viên', screen: 'SchoolTeachers', roles: ['parent'] });
    }

    return baseItems;
  };

  const allMenuItems = getMenuItems();

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole as any));

  const handleNavigate = (screen: string) => {
    onClose();
    navigation.navigate(screen as never);
  };

  const handleLeave = () => {
    onClose();
    onLeaveSchool();
  };


  // Styles with dynamic theme colors


  const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
  },
  menuItems: {
    padding: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginLeft: spacing.md,
  },
  leaveText: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginVertical: spacing.md,
  },
});


  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.menu}>
          {/* Menu Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>
                {language === 'vi' ? 'Menu' : 'Menu'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {userRole === 'admin' ? (language === 'vi' ? 'Quản trị viên' : 'Admin') :
                 userRole === 'teacher' ? (language === 'vi' ? 'Giáo viên' : 'Teacher') :
                 (language === 'vi' ? 'Phụ huynh' : 'Parent')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.menuItem}
                onPress={() => handleNavigate(item.screen)}
              >
                <MaterialIcons name={item.icon} size={24} color={colors.primary} />
                <Text style={styles.menuItemText}>
                  {language === 'vi' ? item.labelVi : item.label}
                </Text>
                <MaterialIcons name="chevron-right" size={20} color={colors.text.light} />
              </TouchableOpacity>
            ))}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Leave School */}
            <TouchableOpacity style={styles.menuItem} onPress={handleLeave}>
              <MaterialIcons name="exit-to-app" size={24} color={colors.error} />
              <Text style={[styles.menuItemText, styles.leaveText]}>
                {language === 'vi' ? 'Rời khỏi trường' : 'Leave School'}
              </Text>
            </TouchableOpacity>

            {/* Home */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onClose();
                navigation.navigate('Home' as never);
              }}
            >
              <MaterialIcons name="home" size={24} color={colors.text.secondary} />
              <Text style={styles.menuItemText}>
                {language === 'vi' ? 'Về trang chủ' : 'Go to Home'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

