import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface Props {
  label:    string;
  onPress?: () => void;
  active?:  boolean;
}

export default function SubjectChip({ label, onPress, active }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.active]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, active && styles.activeText]}>#{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius:      999,
    paddingHorizontal: 10,
    paddingVertical:   4,
    backgroundColor:   '#EFF6FF',
    marginRight:       6,
  },
  active: {
    backgroundColor: '#0B5FFF',
  },
  text: {
    fontSize:   13,
    fontWeight: '500',
    color:      '#0B5FFF',
  },
  activeText: {
    color: '#fff',
  },
});
