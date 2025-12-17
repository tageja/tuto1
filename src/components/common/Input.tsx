import React, { useRef, useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  textContentType?: string;
  autoCorrect?: boolean;
  autoFocus?: boolean;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  rightIcon?: React.ReactNode;
  disableAutofill?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  textContentType,
  autoCorrect,
  error,
  disabled = false,
  multiline = false,
  numberOfLines = 1,
  autoFocus,
  style,
  labelStyle,
  inputStyle,
  rightIcon,
  disableAutofill = false,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background.primary,
      paddingHorizontal: spacing.md,
      minHeight: 48,
    },
    inputContainerFocused: {
      borderColor: colors.primary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    inputContainerError: {
      borderColor: colors.status.error,
    },
    inputContainerDisabled: {
      backgroundColor: colors.background.secondary,
      opacity: 0.6,
    },
    input: {
      flex: 1,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
      paddingVertical: spacing.sm,
    },
    inputMultiline: {
      textAlignVertical: 'top',
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
    },
    rightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rightIcon: {
      marginLeft: spacing.sm,
    },
    passwordToggle: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
    },
    errorText: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.medium,
      color: colors.status.error,
      marginTop: spacing.xs,
    },
  }); 

  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const isPasswordField = secureTextEntry;
  const shouldShowPasswordToggle = isPasswordField && !disabled;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
        onStartShouldSetResponder={() => true}
        onResponderGrant={() => inputRef.current?.focus()}
      >
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.light}
          secureTextEntry={isPasswordField && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={(disableAutofill ? 'off' : (autoComplete as any))}
          textContentType={(disableAutofill ? (Platform.OS === 'ios' ? ('oneTimeCode' as any) : ('none' as any)) : (textContentType as any))}
          importantForAutofill={disableAutofill ? 'no' : undefined}
          autoCorrect={autoCorrect}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          blurOnSubmit={false}
          returnKeyType={multiline ? 'default' : 'next'}
          onPressIn={() => inputRef.current?.focus()}
        />
        
        <View style={styles.rightContainer}>
          {rightIcon && (
            <View style={styles.rightIcon}>
              {rightIcon}
            </View>
          )}
          
          {shouldShowPasswordToggle && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.passwordToggle}
            >
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {error && (
        <Text style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};
