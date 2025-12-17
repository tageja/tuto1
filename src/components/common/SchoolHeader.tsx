import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export const SchoolHeader: React.FC = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    logo: {
      height: 20,
      width: 59,
      tintColor: colors.text.primary, // Make logo visible in dark mode if it's black transparent
    },
  });

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/images/tuto-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

export default SchoolHeader;


