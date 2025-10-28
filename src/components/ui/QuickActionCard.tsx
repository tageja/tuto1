import React from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface QuickActionCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  color: string;
  onPress: () => void;
  style?: ViewStyle;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({ icon, title, color, onPress, style }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[{ backgroundColor: color }, style]}
      className="w-[100px] h-[80px] rounded-xl p-2 items-center justify-center mr-1 shadow-sm"
    >
      <MaterialIcons name={icon} size={20} color="white" />
      <Text className="text-white text-xs font-medium text-center mt-1">{title}</Text>
    </TouchableOpacity>
  );
};

export default QuickActionCard;


