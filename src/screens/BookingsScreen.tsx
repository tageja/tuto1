import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { subjects, Subject } from '../data/subjects';
import { useAirtable } from '../hooks/useAirtable';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface BookingsScreenProps {
  navigation: any;
}

interface Booking {
  id: string;
  subject: Subject;
  teacher: string;
  date: string;
  time: string;
  duration: number;
  status: 'completed' | 'upcoming' | 'cancelled';
  type: 'online' | 'offline';
}

interface TeacherSuggestion {
  id: string;
  name: string;
  subject: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  imageUrl: string;
  availability: string;
}

export const BookingsScreen: React.FC<BookingsScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();


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
    },
    backButton: {
      padding: spacing.sm,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    addButton: {
      padding: spacing.sm,
    },
    content: {
      flex: 1,
    },
    summaryContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      padding: spacing.md,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    summaryValue: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginTop: spacing.xs,
    },
    summaryLabel: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    section: {
      padding: spacing.lg,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    bookingCard: {
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    bookingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    bookingInfo: {
      flex: 1,
    },
    bookingTeacher: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    bookingSubject: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    bookingStatus: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      gap: spacing.xs,
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.bold,
      color: colors.background.primary,
      textTransform: 'capitalize',
    },
    typeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
      gap: spacing.xs,
    },
    typeText: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.bold,
      color: colors.background.primary,
      textTransform: 'capitalize',
    },
    bookingDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    detailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    detailText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    teacherCard: {
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    teacherHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    teacherInfo: {
      flex: 1,
    },
    teacherName: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    teacherSubject: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    teacherRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    ratingText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    reviewsText: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    teacherDetails: {
      gap: spacing.xs,
    },
  }); 

  const { t, language } = useLanguage();
  const { userType } = useUser();
  const { getBookings, getTeachers, loading, error } = useAirtable();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  
  // Get academic subjects from the subjects data
  const academicSubjects = subjects.filter((subject: Subject) => subject.category === 'academic');

  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [suggestedTeachers, setSuggestedTeachers] = useState<TeacherSuggestion[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch bookings for current user
        const bookingsData = await getBookings('current-user-id', userType as 'parent' | 'teacher');
        
        const upcoming = bookingsData.filter((booking: any) => booking.status === 'Pending' || booking.status === 'Confirmed');
        const past = bookingsData.filter((booking: any) => booking.status === 'Completed' || booking.status === 'Cancelled');
        
        setUpcomingBookings(upcoming.map((booking: any) => ({
          id: booking.id,
          subject: academicSubjects.find((s: Subject) => s.key === booking.subject) || academicSubjects[0],
          teacher: booking.teacherName || 'Unknown Teacher',
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
          status: booking.status.toLowerCase(),
          type: 'online', // Default to online
        })));

        setPastBookings(past.map((booking: any) => ({
          id: booking.id,
          subject: academicSubjects.find((s: Subject) => s.key === booking.subject) || academicSubjects[0],
          teacher: booking.teacherName || 'Unknown Teacher',
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
          status: booking.status.toLowerCase(),
          type: 'online', // Default to online
        })));

        // Fetch suggested teachers
        const teachersData = await getTeachers({ maxRecords: 10 });
        setSuggestedTeachers(teachersData.slice(0, 3).map((teacher: any) => ({
          id: teacher.id,
          name: teacher.name,
          subject: teacher.subjects[0] || 'General',
          rating: teacher.rating,
          reviews: teacher.reviewCount,
          hourlyRate: teacher.hourlyRate,
          imageUrl: teacher.avatar,
          availability: 'Available this week',
        })));
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [getBookings, getTeachers, userType]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.status.success;
      case 'upcoming':
        return colors.status.warning;
      case 'cancelled':
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return 'check-circle';
      case 'upcoming':
        return 'schedule';
      case 'cancelled':
        return 'cancel';
      default:
        return 'info';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'online' ? colors.status.success : colors.status.warning;
  };

  const getTypeIcon = (type: string) => {
    return type === 'online' ? 'videocam' : 'location-on';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderBookingCard = (booking: Booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingTeacher}>{booking.teacher}</Text>
          <Text style={styles.bookingSubject}>
            {language === 'en' ? booking.subject.nameEn : booking.subject.nameVi}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <MaterialIcons 
            name={getStatusIcon(booking.status) as any} 
            size={12} 
            color={colors.background.primary} 
          />
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>
      <View style={styles.bookingDetails}>
        <View style={styles.detailItem}>
          <MaterialIcons name="event" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{booking.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="schedule" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{booking.time}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="timer" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{booking.duration} min</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name={getTypeIcon(booking.type) as any} size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{booking.type}</Text>
        </View>
      </View>
    </View>
  );

  const renderTeacherSuggestion = (teacher: TeacherSuggestion) => (
    <TouchableOpacity
      key={teacher.id}
      style={styles.teacherCard}
      onPress={() => navigation.navigate('TeacherProfile', {
        teacherId: teacher.id,
        teacherName: teacher.name,
        subject: teacher.subject,
        imageUrl: teacher.imageUrl,
        rating: teacher.rating,
        reviews: teacher.reviews,
        experience: 5,
        hourlyRate: teacher.hourlyRate,
      })}
      activeOpacity={0.8}
    >
      <View style={styles.teacherHeader}>
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{teacher.name}</Text>
          <Text style={styles.teacherSubject}>{teacher.subject}</Text>
        </View>
        <View style={styles.teacherRating}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{teacher.rating}</Text>
          <Text style={styles.reviewsText}>({teacher.reviews})</Text>
        </View>
      </View>
      <View style={styles.teacherDetails}>
        <View style={styles.detailItem}>
          <MaterialIcons name="payment" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{formatCurrency(teacher.hourlyRate)}/hour</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="schedule" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{teacher.availability}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('bookings.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AllSubjects')}
        >
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <MaterialIcons name="schedule" size={24} color={colors.primary} />
            <Text style={styles.summaryValue}>{pastBookings.length + upcomingBookings.length}</Text>
            <Text style={styles.summaryLabel}>{t('bookings.totalBookings')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="check-circle" size={24} color={colors.status.success} />
            <Text style={styles.summaryValue}>{pastBookings.length}</Text>
            <Text style={styles.summaryLabel}>{t('bookings.completed')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="schedule" size={24} color={colors.status.warning} />
            <Text style={styles.summaryValue}>{upcomingBookings.length}</Text>
            <Text style={styles.summaryLabel}>{t('bookings.upcoming')}</Text>
          </View>
        </View>

        {/* Upcoming Bookings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('bookings.upcomingBookings')}</Text>
          {upcomingBookings.map(renderBookingCard)}
        </View>

        {/* Past Bookings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('bookings.pastBookings')}</Text>
          {pastBookings.map(renderBookingCard)}
        </View>

        {/* Suggested Teachers */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('bookings.suggestedTeachers')}</Text>
          {suggestedTeachers.map(renderTeacherSuggestion)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
