import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  onTypingChange?: (isTyping: boolean) => void;
}

const TYPING_DEBOUNCE_MS = 400;
const TYPING_TIMEOUT_MS = 2000;

export default function MessageInput({ onSend, disabled, onTypingChange }: Props) {
  const { t } = useLanguage();
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingRef = useRef<boolean>(false);

  const notifyTyping = useCallback(
    (isTyping: boolean) => {
      if (onTypingChange && lastTypingRef.current !== isTyping) {
        lastTypingRef.current = isTyping;
        onTypingChange(isTyping);
      }
    },
    [onTypingChange],
  );

  useEffect(() => {
    if (!onTypingChange) return;
    const trimmed = text.trim();
    if (trimmed.length === 0) {
      notifyTyping(false);
      return;
    }
    const debounceId = setTimeout(() => {
      notifyTyping(true);
      typingTimeoutRef.current = setTimeout(() => notifyTyping(false), TYPING_TIMEOUT_MS);
    }, TYPING_DEBOUNCE_MS);
    return () => {
      clearTimeout(debounceId);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    };
  }, [text, onTypingChange, notifyTyping]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    notifyTyping(false);
    onSend(trimmed);
    setText('');
  }, [text, onSend, disabled, notifyTyping]);

  const canSend = text.trim().length > 0 && !disabled;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={(t('community.messages.placeholder') as string) ?? 'Nhắn tin...'}
          placeholderTextColor="#888"
          multiline
          maxLength={2000}
          editable={!disabled}
        />
        <Pressable
          style={[styles.sendBtn, canSend && styles.sendBtnActive]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <MaterialIcons
            name="send"
            size={22}
            color={canSend ? '#fff' : '#888'}
          />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    marginRight: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: '#0B5FFF',
  },
});
