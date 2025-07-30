import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, spacing, typography } from '../theme';
import { useAirtable } from '../hooks/useAirtable';

interface BookingScreenProps {
  navigation: any;
  route: {
    params: {
      teacherId: string;
      teacherName: string;
      subject: string;
    };
  };
}

type TimeSlot = {
  id: string;
  time: string;
  available: boolean;
};

const timeSlots: TimeSlot[] = [
  { id: '1', time: '08:00', available: true },
  { id: '2', time: '09:00', available: true },
  { id: '3', time: '10:00', available: false },
  { id: '4', time: '11:00', available: true },
  { id: '5', time: '14:00', available: true },
  { id: '6', time: '15:00', available: true },
  { id: '7', time: '16:00', available: false },
  { id: '8', time: '17:00', available: true },
];

export const BookingScreen: React.FC<BookingScreenProps> = ({ navigation, route }) => {
  const { teacherId, teacherName, subject } = route.params;
  const { language, t } = useLanguage();
  const { createBooking } = useAirtable();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get next 7 days for date selection
  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
    };
  };

  const handleBooking = async () => {
    if (!selectedTimeSlot) {
      Alert.alert(
        t('booking.error'),
        t('booking.selectTime'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setLoading(true);
    try {
      await createBooking({
        teacherId,
        studentId: 'current-user-id', // This should come from auth context
        parentId: 'parent-id', // This should come from auth context
        subject,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTimeSlot,
        duration: 60, // 1 hour default
        notes: '',
      });

      Alert.alert(
        t('booking.success'),
        t('booking.successMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.navigate('Schedule'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t('booking.error'),
        t('booking.errorMessage'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'en' ? 'Book a Session' : 'Đặt Lịch Học'}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Teacher Info */}
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{teacherName}</Text>
          <Text style={styles.subject}>{subject}</Text>
        </View>

        {/* Date Selection */}
        <Text style={styles.sectionTitle}>
          {language === 'en' ? 'Select Date' : 'Chọn Ngày'}
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
        >
          {getDates().map((date) => {
            const formattedDate = formatDate(date);
            const isSelected = date.toDateString() === selectedDate.toDateString();
            
            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[
                  styles.dateButton,
                  isSelected && styles.selectedDateButton,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dayText,
                  isSelected && styles.selectedDateText,
                ]}>
                  {formattedDate.day}
                </Text>
                <Text style={[
                  styles.dateText,
                  isSelected && styles.selectedDateText,
                ]}>
                  {formattedDate.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Time Selection */}
        <Text style={styles.sectionTitle}>
          {language === 'en' ? 'Select Time' : 'Chọn Giờ'}
        </Text>
        <View style={styles.timeGrid}>
          {timeSlots.map((slot) => (
            <TouchableOpacity
              key={slot.id}
              style={[
                styles.timeSlot,
                !slot.available && styles.unavailableSlot,
                selectedTimeSlot === slot.time && styles.selectedTimeSlot,
              ]}
              disabled={!slot.available}
              onPress={() => setSelectedTimeSlot(slot.time)}
            >
              <Text style={[
                styles.timeText,
                !slot.available && styles.unavailableText,
                selectedTimeSlot === slot.time && styles.selectedTimeText,
              ]}>
                {slot.time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Booking Button */}
        <TouchableOpacity
          style={[
            styles.bookButton,
            loading && styles.disabledButton,
          ]}
          onPress={handleBooking}
          disabled={loading || !selectedTimeSlot}
        >
          <Text style={styles.bookButtonText}>
            {loading 
              ? (language === 'en' ? 'Booking...' : 'Đang đặt...')
              : (language === 'en' ? 'Book Session' : 'Đặt Lịch')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    marginRight: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  teacherInfo: {
    marginBottom: spacing.xl,
  },
  teacherName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subject: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  dateScroll: {
    marginBottom: spacing.xl,
  },
  dateButton: {
    width: 64,
    height: 80,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  selectedDateButton: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  dateText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  selectedDateText: {
    color: colors.secondary,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
    marginBottom: spacing.xl,
  },
  timeSlot: {
    width: '23%',
    aspectRatio: 2,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: '1%',
  },
  selectedTimeSlot: {
    backgroundColor: colors.primary,
  },
  unavailableSlot: {
    backgroundColor: colors.background.tertiary,
    opacity: 0.5,
  },
  timeText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  selectedTimeText: {
    color: colors.secondary,
  },
  unavailableText: {
    color: colors.text.secondary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  bookButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.secondary,
  },
});