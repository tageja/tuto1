import React, { useRef, useState } from 'react';
import { TextInput, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export interface FFieldProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  disabled?: boolean;
  rightIconName?: keyof typeof MaterialIcons.glyphMap;
}

export const FField: React.FC<FFieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  disabled,
  rightIconName,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const isPassword = !!secureTextEntry;

  return (
    <View className="mb-4">
      {!!label && <Text className="text-sm font-medium text-onSurface mb-1">{label}</Text>}
      <View
        className={`flex-row items-center rounded-xl border px-4 min-h-[48px] bg-background ${
          isFocused ? 'border-primary shadow-sm' : 'border-onSurface/10'
        } ${error ? 'border-red-500' : ''} ${disabled ? 'opacity-60' : ''}`}
      >
        <TextInput
          ref={inputRef}
          className="flex-1 text-base text-onSurface py-2"
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#999999"
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {rightIconName && (
          <MaterialIcons name={rightIconName} size={20} color="#666666" />
        )}
        {isPassword && (
          <TouchableOpacity onPress={() => setShowPassword((p) => !p)} className="ml-2 p-1">
            <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={20} color="#666666" />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
};

export default FField;


