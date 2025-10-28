import React from 'react';
import { View, ViewProps } from 'react-native';

export interface FCardProps extends ViewProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const padClasses: Record<NonNullable<FCardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const FCard: React.FC<FCardProps> = ({ children, style, padding = 'md', ...rest }) => {
  return (
    <View className={`bg-white rounded-xl border border-onSurface/10 ${padClasses[padding]}`} style={style} {...rest}>
      {children}
    </View>
  );
};

export default FCard;


