import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface ChatBubbleProps {
  message: string;
  timestamp: string;
  sender?: string;
  isOutgoing: boolean;
  showSender?: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  timestamp,
  sender,
  isOutgoing,
  showSender = false,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginBottom: 12,
      maxWidth: '75%',
      alignSelf: 'flex-start',
    },
    outgoingContainer: {
      alignSelf: 'flex-end',
      alignItems: 'flex-end',
    },
    incomingContainer: {
      alignSelf: 'flex-start',
      alignItems: 'flex-start',
    },
    senderName: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginBottom: 4,
      paddingHorizontal: 4,
      fontFamily: typography.fontFamily.regular,
    },
    bubble: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 16,
    },
    outgoingBubble: {
      backgroundColor: colors.primary,
      borderBottomRightRadius: 4,
    },
    incomingBubble: {
      backgroundColor: colors.background.tertiary,
      borderBottomLeftRadius: 4,
    },
    messageText: {
      fontSize: typography.fontSize.sm,
      lineHeight: 20,
      fontFamily: typography.fontFamily.regular,
    },
    outgoingText: {
      color: colors.white,
    },
    incomingText: {
      color: colors.text.primary,
    },
    timestamp: {
      fontSize: typography.fontSize.xs,
      color: colors.text.light,
      marginTop: 4,
      paddingHorizontal: 4,
      fontFamily: typography.fontFamily.regular,
    },
    outgoingTimestamp: {
      textAlign: 'right',
    },
    incomingTimestamp: {
      textAlign: 'left',
    },
  });

  return (
    <View
      style={[
        styles.container,
        isOutgoing ? styles.outgoingContainer : styles.incomingContainer,
      ]}
    >
      {showSender && sender && !isOutgoing && (
        <Text style={styles.senderName}>{sender}</Text>
      )}
      <View
        style={[
          styles.bubble,
          isOutgoing ? styles.outgoingBubble : styles.incomingBubble,
        ]}
      >
        <Text
          style={[
            styles.messageText,
            isOutgoing ? styles.outgoingText : styles.incomingText,
          ]}
        >
          {message}
        </Text>
      </View>
      <Text
        style={[
          styles.timestamp,
          isOutgoing ? styles.outgoingTimestamp : styles.incomingTimestamp,
        ]}
      >
        {timestamp}
      </Text>
    </View>
  );
};







