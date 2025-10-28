import React from 'react';
import { View, ViewProps } from 'react-native';

export const SurfaceCard: React.FC<ViewProps> = ({ children, style, ...rest }) => {
  return (
    <View className="bg-white rounded-2xl border border-onSurface/10 p-4 shadow-sm" style={style} {...rest}>
      {children}
    </View>
  );
};

export default SurfaceCard;


