import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Modal, Pressable, Animated, PanResponder } from 'react-native';
import { PinchGestureHandler, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography } from '../../theme';
import { Post } from '../../screens/FeedScreen';

const { width } = Dimensions.get('window');

interface PostCardProps {
  post: Post;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onSave: () => void;
  onReport?: () => void;
}

const getRoleBadge = (role: string) => {
  switch (role) {
    case 'teacher':
      return { icon: '👩‍🏫', label: 'Teacher', color: '#4CAF50' };
    case 'parent':
      return { icon: '👨‍👧', label: 'Parent', color: '#2196F3' };
    case 'student':
      return { icon: '👦', label: 'Student', color: '#FF9800' };
    default:
      return { icon: '👤', label: 'User', color: colors.text.secondary };
  }
};

const formatTimestamp = (timestamp: Date) => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return timestamp.toLocaleDateString();
};

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onReport,
}) => {
  const { t } = useLanguage();
  const roleBadge = getRoleBadge(post.author.role);
  const [showImage, setShowImage] = useState(false);
  const translateY = React.useRef(new Animated.Value(0)).current;
  const translateX = React.useRef(new Animated.Value(0)).current;
  const scale = React.useRef(new Animated.Value(1)).current;
  const [isZoomed, setIsZoomed] = useState(false);
  const [thumbErrored, setThumbErrored] = useState(false);
  const [fullErrored, setFullErrored] = useState(false);
  const placeholderImage = require('../../../assets/images/react-logo.png');
  // Pan state tracking
  const [panState, setPanState] = useState({ x: 0, y: 0 });

  const combinedPanResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => {
        const shouldPan = isZoomed ? (Math.abs(g.dx) > 5 || Math.abs(g.dy) > 5) : Math.abs(g.dy) > 15;
        return shouldPan;
      },
      onPanResponderGrant: () => {
        if (isZoomed) {
          translateX.setOffset(panState.x);
          translateY.setOffset(panState.y);
          translateX.setValue(0);
          translateY.setValue(0);
        }
      },
      onPanResponderMove: (_, g) => {
        if (isZoomed) {
          translateX.setValue(g.dx);
          translateY.setValue(g.dy);
        } else if (!isZoomed && g.dy > 0) {
          translateY.setValue(g.dy);
        }
      },
      onPanResponderRelease: (_, g) => {
        if (isZoomed) {
          translateX.flattenOffset();
          translateY.flattenOffset();
          setPanState({ x: panState.x + g.dx, y: panState.y + g.dy });
        } else {
          if (g.dy > 100) {
            Animated.timing(translateY, { toValue: 600, duration: 200, useNativeDriver: false }).start(() => {
              closeModal();
            });
          } else {
            Animated.spring(translateY, { toValue: 0, useNativeDriver: false }).start();
          }
        }
      },
    })
  ).current;

  const onPinchEvent = Animated.event(
    [{ nativeEvent: { scale } }],
    { useNativeDriver: false }
  );

  const onPinchStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const finalScale = event.nativeEvent.scale;
      if (finalScale < 0.8) {
        closeModal();
      } else if (finalScale < 1) {
        Animated.spring(scale, { toValue: 1, useNativeDriver: false }).start(() => setIsZoomed(false));
      } else {
        setIsZoomed(finalScale > 1.2);
      }
    }
  };

  const closeModal = () => {
    translateY.setValue(0);
    translateX.setValue(0);
    translateY.setOffset(0);
    translateX.setOffset(0);
    scale.setValue(1);
    setIsZoomed(false);
    setPanState({ x: 0, y: 0 });
    setShowImage(false);
  };

  const renderMedia = () => {
    if (!post.content.media) return null;

    if (post.content.media.type === 'image') {
      const imageUrl = post.content.media.url;
      const isFileUri = imageUrl?.startsWith('file://');

      return (
        <>
          <Pressable onPress={() => setShowImage(true)}>
            {thumbErrored || !imageUrl ? (
              <Image source={placeholderImage} style={styles.mediaImage} resizeMode="cover" />
            ) : (
              <Image
                source={{ uri: imageUrl }}
                style={styles.mediaImage}
                resizeMode="cover"
                onError={() => setThumbErrored(true)}
              />
            )}
          </Pressable>
          {showImage && (
            <Modal visible={showImage} transparent onRequestClose={closeModal} animationType="fade">
              <View style={styles.lightboxBackdrop}>
                <View style={styles.lightboxHeader}>
                  <Text style={styles.lightboxInstructions}>
                    {isZoomed ? 'Pan to move • Pinch to zoom' : 'Pinch to zoom • Drag down to close'}
                  </Text>
                  <Pressable style={styles.closeButton} onPress={closeModal}>
                    <MaterialIcons name="close" size={24} color="white" />
                  </Pressable>
                </View>
                {!isZoomed && <Pressable style={{ flex: 1 }} onPress={closeModal} />}
                <View style={styles.lightboxImageContainer}>
                  <PinchGestureHandler onGestureEvent={onPinchEvent} onHandlerStateChange={onPinchStateChange}>
                    <Animated.View style={{ transform: [{ translateX }, { translateY }, { scale }] }} {...combinedPanResponder.panHandlers}>
                      {fullErrored || !imageUrl ? (
                        <Image source={placeholderImage} style={styles.lightboxImage} resizeMode="contain" />
                      ) : (
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.lightboxImage}
                          resizeMode="contain"
                          onError={() => setFullErrored(true)}
                        />
                      )}
                    </Animated.View>
                  </PinchGestureHandler>
                </View>
                {!isZoomed && <Pressable style={{ flex: 1 }} onPress={closeModal} />}
              </View>
            </Modal>
          )}
        </>
      );
    }

    if (post.content.media.type === 'video') {
      return (
        <View style={styles.videoContainer}>
          <Image
            source={{ uri: post.content.media.thumbnail || post.content.media.url }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
          <View style={styles.playButton}>
            <MaterialIcons name="play-arrow" size={32} color={colors.background.primary} />
          </View>
        </View>
      );
    }

    return null;
  };

  const renderSubjects = () => {
    if (!post.subjects || post.subjects.length === 0) return null;
    return (
      <View style={styles.subjectsContainer}>
        {post.subjects.map((subject, index) => (
          <View key={index} style={styles.subjectTag}>
            <Text style={styles.subjectText}>#{subject}</Text>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Image
            source={{ uri: post.author.avatar }}
            style={styles.avatar}
            defaultSource={require('../../../assets/images/default-teacher.png.png')}
          />
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            <View style={styles.roleContainer}>
              <Text style={styles.roleIcon}>{roleBadge.icon}</Text>
              <Text style={[styles.roleLabel, { color: roleBadge.color }]}>
                {roleBadge.label}
              </Text>
            </View>
          </View>
        </View>
        <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text
          style={[
            styles.postText,
            {
              fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
              color: '#1A1A1A',
              fontSize: 16,
            },
          ]}
          allowFontScaling={false}
          selectable={false}
          textBreakStrategy="highQuality"
        >
          {post.content.text}
        </Text>
        {renderMedia()}
        {renderSubjects()}
      </View>

      {/* Interactions */}
      <View style={styles.interactions}>
        <TouchableOpacity style={styles.interactionButton} onPress={onLike}>
          <MaterialIcons
            name={post.isLiked ? 'favorite' : 'favorite-border'}
            size={20}
            color={post.isLiked ? colors.status.error : colors.text.secondary}
          />
          <Text style={styles.interactionCount}>{post.interactions.likes}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionButton} onPress={onComment}>
          <MaterialIcons name="chat-bubble-outline" size={20} color={colors.text.secondary} />
          <Text style={styles.interactionCount}>{post.interactions.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionButton} onPress={onShare}>
          <MaterialIcons name="share" size={20} color={colors.text.secondary} />
          <Text style={styles.interactionCount}>{post.interactions.shares}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionButton} onPress={onSave}>
          <MaterialIcons
            name={post.isSaved ? 'bookmark' : 'bookmark-border'}
            size={20}
            color={post.isSaved ? colors.primary : colors.text.secondary}
          />
          <Text style={styles.interactionCount}>{post.interactions.saves}</Text>
        </TouchableOpacity>

        {onReport && (
          <TouchableOpacity style={styles.interactionButton} onPress={onReport}>
            <MaterialIcons name="flag" size={20} color={colors.text.secondary} />
            <Text style={styles.interactionCount}>Report</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  authorInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: spacing.sm },
  authorDetails: { flex: 1 },
  authorName: { fontSize: typography.fontSize.md, fontFamily: typography.fontFamily.semiBold, color: colors.text.primary, marginBottom: spacing.xs },
  roleContainer: { flexDirection: 'row', alignItems: 'center' },
  roleIcon: { fontSize: 16, marginRight: spacing.xs },
  roleLabel: { fontSize: typography.fontSize.xs, fontFamily: typography.fontFamily.medium },
  timestamp: { fontSize: typography.fontSize.xs, color: colors.text.light },
  content: { marginBottom: spacing.md },
  postText: { fontSize: 16, color: '#1A1A1A', lineHeight: 22, marginBottom: spacing.sm },
  mediaImage: { width: '100%', height: 200, borderRadius: 8, marginBottom: spacing.sm },
  lightboxBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' },
  lightboxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md },
  lightboxInstructions: { color: 'white', fontSize: typography.fontSize.sm, opacity: 0.8 },
  closeButton: { padding: spacing.sm, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)' },
  lightboxImageContainer: { position: 'absolute', top: 60, left: 0, right: 0, bottom: 60, justifyContent: 'center', alignItems: 'center' },
  lightboxImage: { width: width - 40, height: '80%', maxWidth: width - 40, maxHeight: '80%' },
  videoContainer: { position: 'relative', marginBottom: spacing.sm },
  playButton: { position: 'absolute', top: '50%', left: '50%', transform: [{ translateX: -20 }, { translateY: -20 }], backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  subjectsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm },
  subjectTag: { backgroundColor: colors.background.secondary, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 12, marginRight: spacing.xs, marginBottom: spacing.xs },
  subjectText: { fontSize: typography.fontSize.xs, color: colors.primary, fontFamily: typography.fontFamily.medium },
  interactions: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.light },
  interactionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, paddingHorizontal: spacing.sm },
  interactionCount: { fontSize: typography.fontSize.xs, color: colors.text.secondary, marginLeft: spacing.xs },
}); 