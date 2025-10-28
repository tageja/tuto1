import React from 'react';
import { Image, ImageSourcePropType, Text, View } from 'react-native';

export interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  illustration?: ImageSourcePropType;
}

export const AuthHeader: React.FC<AuthHeaderProps> = ({ title, subtitle, illustration }) => {
  return (
    <View className="items-center mb-8 mt-8">
      {illustration ? (
        <Image source={illustration} className="w-40 h-40 mb-4" resizeMode="contain" />
      ) : null}
      <Text className="text-3xl font-bold text-onSurface text-center mb-1">{title}</Text>
      {!!subtitle && <Text className="text-base text-onSurface/70 text-center leading-6 px-6">{subtitle}</Text>}
    </View>
  );
};

export default AuthHeader;


