import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface ChatInputBarProps {
  onSend: (message: string) => void;
  placeholder?: string;
  showAttachment?: boolean;
}

export const ChatInputBar: React.FC<ChatInputBarProps> = ({
  onSend,
  placeholder = 'Type a message...',
  showAttachment = true,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
      padding: 12,
      ...shadows.md,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 8,
    },
    attachmentButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    input: {
      flex: 1,
      backgroundColor: colors.background.tertiary,
      borderRadius: borderRadius.full,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 10 : 8,
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
      fontFamily: typography.fontFamily.regular,
      maxHeight: 120,
      minHeight: 40,
    },
    sendButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      backgroundColor: colors.background.tertiary,
    },
  });

  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {showAttachment && (
          <TouchableOpacity style={styles.attachmentButton} activeOpacity={0.7}>
            <MaterialIcons
              name="attach-file"
              size={20}
              color={colors.text.light}
            />
          </TouchableOpacity>
        )}
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor={colors.text.light}
          multiline
          maxLength={2000}
          textAlignVertical="center"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !message.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!message.trim()}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name="send"
            size={20}
            color={message.trim() ? colors.white : colors.text.light}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};







