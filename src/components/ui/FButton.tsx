import React from 'react';
import { ActivityIndicator, GestureResponderEvent, Text, TouchableOpacity, View } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface FButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

const baseClasses = 'rounded-xl items-center justify-center flex-row';
const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-surface border border-primary',
  outline: 'bg-transparent border border-onSurface/20',
  ghost: 'bg-transparent',
};
const textVariantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-primary',
  outline: 'text-onSurface',
  ghost: 'text-onSurface',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 min-h-[36px]',
  md: 'px-5 py-3 min-h-[48px]',
  lg: 'px-6 py-4 min-h-[56px]',
};
const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const FButton: React.FC<FButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  className,
  textClassName,
}) => {
  return (
    <TouchableOpacity
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50' : ''} ${className || ''}`}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#0B5FFF'} />
      ) : (
        <Text className={`${textVariantClasses[variant]} font-medium uppercase ${textSizeClasses[size]} ${textClassName || ''}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default FButton;


