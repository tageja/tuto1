import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  Alert,
  Share,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { colors, spacing, typography } from '../theme';
import { PostCard } from '../components/feed/PostCard';
import { PostCardErrorBoundary } from '../components/common/PostCardErrorBoundary';
import { FilterBar } from '../components/feed/FilterBar';
import { CreatePostModal } from '../components/feed/CreatePostModal';
import { useAirtable } from '../hooks/useAirtable';
import { uploadImageAuto } from '../services/upload';
import { logDebug, logError } from '../services/logger';
import { Backend } from '../services/backend';

const { width } = Dimensions.get('window');

interface FeedScreenProps {
  navigation: any;
}

export type PostType = 'text' | 'image' | 'video' | 'poll' | 'resource';
export type UserRole = 'teacher' | 'parent' | 'student';
export type FilterType = 'all' | 'teachers' | 'parents' | 'students';
export type SubjectFilter = 'all' | 'math' | 'english' | 'science' | 'music' | 'sports';

export interface Post {
  id: string;
  author: {
    id: string;
    name: string;
    role: UserRole;
    avatar: string;
  };
  content: {
    text: string;
    media?: {
      type: 'image' | 'video';
      url: string;
      thumbnail?: string;
    };
  };
  type: PostType;
  subjects: string[];
  timestamp: Date;
  interactions: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  isLiked: boolean;
  isSaved: boolean;
  privacy: 'public' | 'center-only' | 'network-only';
}

export const FeedScreen: React.FC<FeedScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { userType, userData } = useUser();
  const { getPosts, createPost, setPostLike, setPostSave, addComment, loading, error } = useAirtable();
  
  const [roleFilter, setRoleFilter] = useState<FilterType>('all');
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await Backend.getFeedPosts(1, 50) as any;
      const postsData = response.records?.map((record: any) => ({
        id: record.id,
        author: {
          id: record.fields['Author ID'] || '',
          name: record.fields['Author Name'] || 'Unknown User',
          role: record.fields['Author Role'] || 'parent',
          avatar: record.fields['Author Avatar'] || '',
        },
        content: {
          text: record.fields['Content Text'] || '',
          media: record.fields['Content Media Type'] ? {
            type: record.fields['Content Media Type'] as 'image' | 'video',
            url: record.fields['Content Media URL'] || '',
            thumbnail: record.fields['Content Media Thumbnail'] || '',
          } : undefined,
        },
        type: record.fields['Post Type'] || 'text',
        subjects: record.fields['Subjects'] || [],
        timestamp: new Date(record.fields['Timestamp'] || new Date()),
        interactions: {
          likes: record.fields['Likes Count'] || 0,
          comments: record.fields['Comments Count'] || 0,
          shares: record.fields['Shares Count'] || 0,
          saves: record.fields['Saves Count'] || 0,
        },
        isLiked: false, // Will be determined by user state
        isSaved: false, // Will be determined by user state
        privacy: record.fields['Privacy'] || 'public',
      })) || [];
      setPosts(postsData);
    } catch (err) {
      console.error('Error fetching posts:', err);
    }
  };

  // Filter posts based on selected filters
  const filteredPosts = useMemo(() => {
    let filtered = posts;

    // Filter by role
    if (roleFilter !== 'all') {
      const roleMap = {
        'teachers': 'teacher',
        'parents': 'parent', 
        'students': 'student'
      };
      const targetRole = roleMap[roleFilter];
      filtered = filtered.filter(post => post.author.role === targetRole);
    }

    // Filter by subject
    if (subjectFilter !== 'all') {
      filtered = filtered.filter(post => 
        post.subjects.some(subject => 
          subject.toLowerCase().includes(subjectFilter)
        )
      );
    }

    return filtered;
  }, [posts, roleFilter, subjectFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts().finally(() => setRefreshing(false));
  };

  const handleCreatePost = () => {
    setShowCreatePostModal(true);
  };

  const handleCloseCreatePostModal = () => {
    setShowCreatePostModal(false);
  };

  const handleReportPost = async (postId: string, reason: string) => {
    try {
      await Backend.reportFeedPost(postId, reason);
      Alert.alert(
        t('feed.reportSubmitted'),
        t('feed.reportThankYou'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      console.error('Error reporting post:', error);
      Alert.alert(
        t('feed.reportError'),
        t('feed.reportFailed'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const handleSubmitPost = async (postData: {
    text: string;
    subjects: string[];
    media?: {
      type: 'image' | 'video';
      url: string;
    };
  }) => {
    try {
      let mediaUrl: string | undefined = postData.media?.url;
      let mediaType: 'image' | 'video' | undefined = postData.media?.type;
      // If local file URI, upload to Cloudinary first
      logDebug('Feed submit: initial media', { mediaUrl, mediaType });
      if (mediaUrl && mediaType === 'image') {
        if (/^(file|content|asset):\/\//.test(mediaUrl)) {
          mediaUrl = await uploadImageAuto(mediaUrl, userData?.id || 'guest-user');
          logDebug('Feed submit: uploaded mediaUrl', mediaUrl);
        }
      }
      
      const payload = {
        contentText: postData.text,
        contentMediaType: mediaType,
        contentMediaUrl: mediaUrl,
        subjects: postData.subjects,
        privacy: 'public',
      };
      logDebug('Feed submit: creating post payload', payload);
      const created = await Backend.createFeedPost(payload);
      logDebug('Feed submit: create result', created);

      // Refresh posts after creating new one
      await fetchPosts();
      setShowCreatePostModal(false);
      
      Alert.alert(
        t('feed.postSuccess'),
        t('feed.postCreated'),
        [{ text: t('common.ok') }]
      );
    } catch (error) {
      logError('Feed submit: error', error);
      Alert.alert(
        t('feed.postError'),
        t('feed.postFailed'),
        [{ text: t('common.ok') }]
      );
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Text style={styles.headerTitle}>{t('feed.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('feed.subtitle')}</Text>
      </View>
      <TouchableOpacity 
        style={styles.createPostButton}
        onPress={handleCreatePost}
      >
        <MaterialIcons name="add" size={24} color={colors.background.primary} />
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="forum" size={64} color={colors.text.light} />
      <Text style={styles.emptyStateTitle}>{t('feed.noPosts')}</Text>
      <Text style={styles.emptyStateSubtitle}>{t('feed.noPostsSubtitle')}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      
      <FilterBar
        roleFilter={roleFilter}
        subjectFilter={subjectFilter}
        onRoleFilterChange={setRoleFilter}
        onSubjectFilterChange={setSubjectFilter}
      />

      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // Get current user's like state from client storage
          const userLikes = (globalThis as any).__userLikes || new Map();
          const postUserLikes = userLikes.get(item.id) || new Set();
          const currentUserLiked = postUserLikes.has(userData?.id || 'guest-user');
          
          // Override the item's isLiked with user-specific state
          const itemWithUserState = {
            ...item,
            isLiked: currentUserLiked
          };
          
          return (
            <PostCardErrorBoundary postId={item.id}>
              <PostCard
                post={itemWithUserState}
                onLike={async () => {
                  const currentUserLiked = itemWithUserState.isLiked;
                  const newLikeState = !currentUserLiked;
                  
                  console.log(`[FEED] Like pressed for post ${item.id}, currentUserLiked: ${currentUserLiked}`);
                  console.log(`[FEED] Toggling like to: ${newLikeState}`);
                  
                  // IMMEDIATE optimistic update - update UI instantly
                  setPosts(prev => prev.map(p => {
                    if (p.id === item.id) {
                      const likeDelta = newLikeState ? 1 : -1;
                      return {
                        ...p,
                        isLiked: newLikeState,
                        interactions: {
                          ...p.interactions,
                          likes: Math.max(0, p.interactions.likes + likeDelta)
                        }
                      };
                    }
                    return p;
                  }));
                  
                  // Background API call - don't await
                  Backend.likeFeedPost(item.id, newLikeState)
                    .then((response: any) => {
                      console.log(`[FEED] likeFeedPost result:`, response);
                      if (!response.success) {
                        console.error(`[FEED] likeFeedPost failed, reverting optimistic update`);
                        // Revert optimistic update on failure
                        setPosts(prev => prev.map(p => {
                          if (p.id === item.id) {
                            const likeDelta = newLikeState ? -1 : 1;
                            return {
                              ...p,
                              isLiked: !newLikeState,
                              interactions: {
                                ...p.interactions,
                                likes: Math.max(0, p.interactions.likes + likeDelta)
                              }
                            };
                          }
                          return p;
                        }));
                      }
                    })
                    .catch(error => {
                      console.error(`[FEED] Error in onLike:`, error);
                      // Revert optimistic update on error
                      setPosts(prev => prev.map(p => {
                        if (p.id === item.id) {
                          const likeDelta = newLikeState ? -1 : 1;
                          return {
                            ...p,
                            isLiked: !newLikeState,
                            interactions: {
                              ...p.interactions,
                              likes: Math.max(0, p.interactions.likes + likeDelta)
                            }
                          };
                        }
                        return p;
                      }));
                    });
                }}
                onComment={async () => {
                  // Navigate to comment sheet screen (modal) with post id
                  navigation.navigate('Comments', { postId: item.id });
                }}
                onShare={async () => {
                  try {
                    await Share.share({ message: `${item.author.name}: ${item.content.text}${item.content.media ? `\n${item.content.media.url}` : ''}` });
                  } catch {}
                }}
                onSave={async () => {
              const newSaveState = !item.isSaved;
              console.log(`[FEED] Save pressed for post ${item.id}, toggling to: ${newSaveState}`);
              
              // Optimistic update - update UI immediately
              setPosts(prev => prev.map(p => {
                if (p.id === item.id) {
                  const saveDelta = newSaveState ? 1 : -1;
                  return {
                    ...p,
                    isSaved: newSaveState,
                    interactions: {
                      ...p.interactions,
                      saves: Math.max(0, p.interactions.saves + saveDelta)
                    }
                  };
                }
                return p;
              }));
              
              try {
                const success = await setPostSave(item.id, newSaveState);
                if (!success) {
                  console.error(`[FEED] setPostSave failed, reverting optimistic update`);
                  // Revert optimistic update on failure
                  setPosts(prev => prev.map(p => {
                    if (p.id === item.id) {
                      const saveDelta = newSaveState ? -1 : 1;
                      return {
                        ...p,
                        isSaved: !newSaveState,
                        interactions: {
                          ...p.interactions,
                          saves: Math.max(0, p.interactions.saves + saveDelta)
                        }
                      };
                    }
                    return p;
                  }));
                }
              } catch (error) {
                console.error(`[FEED] Error in onSave:`, error);
                // Revert optimistic update on error
                setPosts(prev => prev.map(p => {
                  if (p.id === item.id) {
                    const saveDelta = newSaveState ? -1 : 1;
                    return {
                      ...p,
                      isSaved: !newSaveState,
                      interactions: {
                        ...p.interactions,
                        saves: Math.max(0, p.interactions.saves + saveDelta)
                      }
                    };
                  }
                  return p;
                }));
              }
                }}
                onReport={async () => {
                  Alert.alert(
                    t('feed.reportPost'),
                    t('feed.reportReason'),
                    [
                      { text: t('common.cancel'), style: 'cancel' },
                      { 
                        text: t('feed.spam'), 
                        onPress: () => handleReportPost(item.id, 'spam')
                      },
                      { 
                        text: t('feed.inappropriate'), 
                        onPress: () => handleReportPost(item.id, 'inappropriate')
                      },
                      { 
                        text: t('feed.harassment'), 
                        onPress: () => handleReportPost(item.id, 'harassment')
                      },
                      { 
                        text: t('feed.other'), 
                        onPress: () => handleReportPost(item.id, 'other')
                      },
                    ]
                  );
                }}
              />
            </PostCardErrorBoundary>
          );
        }}
        contentContainerStyle={styles.postList}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListEmptyComponent={renderEmptyState}
        ItemSeparatorComponent={() => <View style={styles.postSeparator} />}
      />

      <CreatePostModal
        visible={showCreatePostModal}
        onClose={handleCloseCreatePostModal}
        onSubmit={handleSubmitPost}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  createPostButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postList: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  postSeparator: {
    height: spacing.md,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptyStateSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
}); 