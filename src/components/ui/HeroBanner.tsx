import React from 'react';
import { Image, ImageSourcePropType, Text, TouchableOpacity, View } from 'react-native';

export interface HeroBannerProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  onPress?: () => void;
  image?: ImageSourcePropType;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ title, subtitle, ctaLabel, onPress, image }) => {
  return (
    <View className="w-full h-[200px] mb-3">
      {image ? (
        <Image source={image} className="w-full h-full" resizeMode="cover" />
      ) : (
        <View className="flex-1 rounded-2xl mx-4 bg-primary/10" />
      )}
      {/* Overlay content (optional) */}
      {!!(subtitle || ctaLabel) && (
        <View className="absolute left-6 right-6 bottom-6">
          <Text className="text-white text-xl font-bold mb-1">{title}</Text>
          {!!subtitle && <Text className="text-white/90 mb-2">{subtitle}</Text>}
          {!!ctaLabel && (
            <TouchableOpacity onPress={onPress} className="bg-white px-4 py-2 rounded-lg self-start">
              <Text className="text-primary text-sm font-semibold">{ctaLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default HeroBanner;


