import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface PostCardErrorBoundaryProps {
  children: React.ReactNode;
  postId?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PostCardErrorBoundary extends React.Component<PostCardErrorBoundaryProps, State> {
  constructor(props: PostCardErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error(`[ERROR_BOUNDARY] PostCard error:`, error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ERROR_BOUNDARY] PostCard error details:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error" size={24} color="#E53E3E" />
          <Text style={styles.errorTitle}>Post Error</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'Something went wrong displaying this post'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

// Class component - can't use hooks, so hardcode colors
const styles = StyleSheet.create({
  errorContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E53E3E',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E53E3E',
    marginTop: 8,
    marginBottom: 4,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#E53E3E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});








































