import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSchool } from '../../contexts/SchoolContext';
import { DashboardMenu } from '../school/DashboardMenu';
import { useSchoolBranding } from '../../hooks/settings/useSchoolBranding';

export const SchoolHeader: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { leaveSchool, currentSchool } = useSchool();
  const [menuVisible, setMenuVisible] = useState(false);
  const { branding } = useSchoolBranding(currentSchool?.id ?? null, null);

  const handleLeaveSchool = () => {
    Alert.alert(
      'Leave School',
      'Are you sure you want to leave this school? You can rejoin later with a new invitation code.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            await leaveSchool();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Home' as never }],
            });
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: insets.top + 12,
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    menuButton: {
      padding: 4,
    },
    tutoLogo: {
      height: 18,
      width: 53,
      tintColor: colors.text.primary,
    },
    divider: {
      width: 1,
      height: 20,
      backgroundColor: colors.border.light,
    },
    schoolLogo: {
      height: 32,
      width: 32,
      borderRadius: 6,
    },
  });

  return (
    <>
      <View style={styles.container}>
        {/* Left: hamburger + tuto logo */}
        <View style={styles.left}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
            accessibilityLabel="Open menu"
          >
            <MaterialIcons name="menu" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Image
            source={require('../../../assets/images/tuto-logo.png')}
            style={styles.tutoLogo}
            resizeMode="contain"
          />
        </View>

        {/* Right: school logo — prefer branding hook result, fall back to context logo_url */}
        {(branding?.logo_url || currentSchool?.logo_url) ? (
          <>
            <View style={styles.divider} />
            <Image
              source={{ uri: branding?.logo_url ?? currentSchool!.logo_url! }}
              style={styles.schoolLogo}
              resizeMode="contain"
            />
          </>
        ) : null}
      </View>
      <DashboardMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLeaveSchool={handleLeaveSchool}
      />
    </>
  );
};

export default SchoolHeader;


