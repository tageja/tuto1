import React from 'react';
import { View, ViewProps } from 'react-native';

export const AuthContainer: React.FC<ViewProps> = ({ children, style, ...rest }) => {
  return (
    <View className="mx-4 bg-white rounded-2xl border border-onSurface/10 p-5 shadow-md" style={style} {...rest}>
      {children}
    </View>
  );
};

export default AuthContainer;


