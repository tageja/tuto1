import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, actionLabel, onActionPress }) => {
  return (
    <View className="flex-row items-center justify-between px-4 mb-1">
      <Text className="text-lg font-bold text-onSurface mb-4">{title}</Text>
      {actionLabel ? (
        <TouchableOpacity onPress={onActionPress}>
          <Text className="text-sm font-medium text-primary">{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default SectionHeader;


