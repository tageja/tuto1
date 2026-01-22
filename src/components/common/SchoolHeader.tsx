import React, { useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useSchool } from '../../contexts/SchoolContext';
import { DashboardMenu } from '../school/DashboardMenu';

export const SchoolHeader: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { leaveSchool } = useSchool();
  const [menuVisible, setMenuVisible] = useState(false);

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
      justifyContent: 'flex-start',
      paddingTop: insets.top + 12,
      paddingBottom: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    menuButton: {
      marginRight: 12,
      padding: 4,
    },
    logo: {
      height: 20,
      width: 59,
      tintColor: colors.text.primary,
    },
  });

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
          accessibilityLabel="Open menu"
        >
          <MaterialIcons name="menu" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Image
          source={require('../../../assets/images/tuto-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
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


