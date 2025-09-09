import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StyleSheet,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useAirtable } from '../../hooks/useAirtable';
import { translations } from '../../translations';
import SchoolHeader from '../../components/common/SchoolHeader';
import { theme } from '../../theme';

interface Message {
  id: string;
  fields: {
    'Message Subject': string;
    'School Name': string;
    'From User': string;
    'From Role': string;
    'To User': string;
    'To Role': string;
    'Message Content': string;
    'Priority': string;
    'Status': string;
    'Sent Date': string;
    'Read Date': string;
    'Created Date': string;
  };
}

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentSchool, isSchoolMode } = useSchool();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'inbox' | 'sent' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { fetchRecords, createRecord, updateRecord } = useAirtable();

  const t = translations.en.school;

  useEffect(() => {
    if (!isSchoolMode || !currentSchool) {
      navigation.goBack();
      return;
    }
    loadMessages();
  }, [isSchoolMode, currentSchool]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const records = await fetchRecords('TutoMessages', {
        filterByFormula: `{School Name} = '${currentSchool?.name}'`,
        sort: [{ field: 'Sent Date', direction: 'desc' }],
      });
      setMessages(records);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  const getFilteredMessages = () => {
    let filtered = messages;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(message =>
        message.fields['Message Subject'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.fields['Message Content'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.fields['From User'].toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.fields['To User'].toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (selectedFilter) {
      case 'inbox':
        filtered = filtered.filter(message => message.fields['To User'] === 'Current User');
        break;
      case 'sent':
        filtered = filtered.filter(message => message.fields['From User'] === 'Current User');
        break;
      case 'unread':
        filtered = filtered.filter(message => message.fields['Status'] === 'Sent');
        break;
      default:
        break;
    }

    return filtered;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return '#F44336';
      case 'High':
        return '#FF9800';
      case 'Normal':
        return theme.colors.primary;
      case 'Low':
        return '#4CAF50';
      default:
        return theme.colors.disabled;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Sent':
        return 'mark-email-unread';
      case 'Delivered':
        return 'mark-email-read';
      case 'Read':
        return 'mark-email-read';
      default:
        return 'email';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const renderMessageCard = (message: Message) => (
    <TouchableOpacity
      key={message.id}
      style={styles.messageCard}
      onPress={() => navigation.navigate('SchoolMessageDetail' as never, { message } as never)}
    >
      <View style={styles.messageHeader}>
        <View style={styles.messageInfo}>
          <Text style={styles.messageSubject} numberOfLines={1}>
            {message.fields['Message Subject']}
          </Text>
          <View style={styles.messageMeta}>
            <Text style={styles.messageFrom}>
              {selectedFilter === 'sent' ? `To: ${message.fields['To User']}` : `From: ${message.fields['From User']}`}
            </Text>
            <Text style={styles.messageDate}>
              {formatDate(message.fields['Sent Date'])}
            </Text>
          </View>
        </View>
        <View style={styles.messageStatus}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(message.fields['Priority']) }]}>
            <Text style={styles.priorityText}>{message.fields['Priority']}</Text>
          </View>
          <MaterialIcons
            name={getStatusIcon(message.fields['Status']) as any}
            size={20}
            color={message.fields['Status'] === 'Read' ? theme.colors.disabled : theme.colors.primary}
            style={styles.statusIcon}
          />
        </View>
      </View>

      <Text style={styles.messageContent} numberOfLines={2}>
        {message.fields['Message Content']}
      </Text>

      <View style={styles.messageFooter}>
        <Text style={styles.messageRole}>
          {selectedFilter === 'sent' ? message.fields['To Role'] : message.fields['From Role']}
        </Text>
        {message.fields['Status'] === 'Sent' && (
          <View style={styles.unreadIndicator} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'all' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('all')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'all' && styles.filterButtonTextActive,
        ]}>
          {t.messages.all}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'inbox' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('inbox')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'inbox' && styles.filterButtonTextActive,
        ]}>
          {t.messages.inbox}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'sent' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('sent')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'sent' && styles.filterButtonTextActive,
        ]}>
          {t.messages.sent}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === 'unread' && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter('unread')}
      >
        <Text style={[
          styles.filterButtonText,
          selectedFilter === 'unread' && styles.filterButtonTextActive,
        ]}>
          {t.messages.unread}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (!isSchoolMode || !currentSchool) {
    return null;
  }

  const filteredMessages = getFilteredMessages();

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.messages.title}</Text>
        <TouchableOpacity
          style={styles.composeButton}
          onPress={() => navigation.navigate('SchoolMessageDetail' as never)}
        >
          <MaterialIcons name="edit" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={theme.colors.disabled} />
        <TextInput
          style={styles.searchInput}
          placeholder={t.messages.searchPlaceholder}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.colors.disabled}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="clear" size={20} color={theme.colors.disabled} />
          </TouchableOpacity>
        )}
      </View>

      {renderFilterButtons()}

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>{t.common.loading}</Text>
          </View>
        ) : filteredMessages.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="email" size={64} color={theme.colors.disabled} />
            <Text style={styles.emptyTitle}>{t.messages.noMessages}</Text>
            <Text style={styles.emptySubtitle}>{t.messages.noMessagesSubtitle}</Text>
            <TouchableOpacity
              style={styles.composeFirstButton}
              onPress={() => navigation.navigate('SchoolComposeMessage' as never)}
            >
              <Text style={styles.composeFirstButtonText}>{t.messages.composeFirst}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.messagesList}>
            {filteredMessages.map(renderMessageCard)}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  composeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginHorizontal: 2,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: 12,
    color: theme.colors.disabled,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.disabled,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.disabled,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  composeFirstButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: theme.colors.primary,
    borderRadius: 24,
  },
  composeFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  messagesList: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  messageInfo: {
    flex: 1,
    marginRight: 12,
  },
  messageSubject: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  messageMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageFrom: {
    fontSize: 14,
    color: theme.colors.disabled,
  },
  messageDate: {
    fontSize: 12,
    color: theme.colors.disabled,
  },
  messageStatus: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  statusIcon: {
    marginTop: 2,
  },
  messageContent: {
    fontSize: 14,
    color: theme.colors.onSurface,
    lineHeight: 20,
    marginBottom: 8,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageRole: {
    fontSize: 12,
    color: theme.colors.disabled,
    fontStyle: 'italic',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
});

export default MessagesScreen;

