import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

export const SchoolHeader: React.FC = () => {
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F7',
  },
  logo: {
    height: 20,
    width: 59,
  },
});

export default SchoolHeader;


