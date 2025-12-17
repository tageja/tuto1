import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { Marker } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Teacher } from '../types';

interface MapMarkerProps {
  teacher: Teacher;
  onPress: (teacher: Teacher) => void;
  isCluster?: boolean;
  clusterCount?: number;
}

export const MapMarker: React.FC<MapMarkerProps> = ({
  teacher,
  onPress,
  isCluster = false,
  clusterCount = 1,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  if (isCluster) {
    return (
      <Marker
        coordinate={{
          latitude: teacher.location.latitude,
          longitude: teacher.location.longitude,
        }}
        onPress={() => onPress(teacher)}
      >
        <View style={styles.clusterContainer}>
          <View style={styles.clusterBackground}>
            <Text style={styles.clusterText}>{clusterCount}</Text>
          </View>
        </View>
      </Marker>
    );
  }

  return (
    <Marker
      coordinate={{
        latitude: teacher.location.latitude,
        longitude: teacher.location.longitude,
      }}
      onPress={() => onPress(teacher)}
    >
      <View style={styles.markerContainer}>
        <View style={styles.markerBackground}>
          <MaterialIcons name="person" size={16} color={colors.primary} />
        </View>
        <View style={styles.markerPointer} />
      </View>
    </Marker>
  );
};

interface TeacherCalloutProps {
  teacher: Teacher;
  onPress: (teacher: Teacher) => void;
  onClose: () => void;
}

export const TeacherCallout: React.FC<TeacherCalloutProps> = ({
  teacher,
  onPress,
  onClose,
}) => {
  const { colors, spacing, typography } = useTheme();

  const styles = StyleSheet.create({
    markerContainer: {
      alignItems: 'center',
    },
    markerBackground: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background.primary,
      borderWidth: 2,
      borderColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    markerPointer: {
      width: 0,
      height: 0,
      borderLeftWidth: 6,
      borderRightWidth: 6,
      borderTopWidth: 8,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: colors.primary,
      marginTop: -1,
    },
    clusterContainer: {
      alignItems: 'center',
    },
    clusterBackground: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 3,
      borderColor: colors.background.primary,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    clusterText: {
      color: colors.background.primary,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.bold,
    },
    calloutContainer: {
      width: 280,
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },
    calloutContent: {
      padding: spacing.md,
    },
    calloutHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    teacherName: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      flex: 1,
    },
    closeButton: {
      padding: spacing.xs,
    },
    teacherInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    ratingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ratingText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
      marginLeft: spacing.xs,
    },
    reviewCount: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginLeft: spacing.xs,
    },
    hourlyRate: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.primary,
    },
    subjectsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: spacing.sm,
    },
    subjectTag: {
      backgroundColor: colors.surface,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 8,
      marginRight: spacing.xs,
      marginBottom: spacing.xs,
    },
    subjectText: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
    },
    moreSubjects: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontStyle: 'italic',
      alignSelf: 'center',
    },
    viewProfileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      paddingVertical: spacing.sm,
      borderRadius: 8,
    },
    viewProfileText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.primary,
      marginRight: spacing.xs,
    },
  });
  return (
    <View style={styles.calloutContainer}>
      <TouchableOpacity style={styles.calloutContent} onPress={() => onPress(teacher)}>
        <View style={styles.calloutHeader}>
          <Text style={styles.teacherName} numberOfLines={1}>
            {teacher.name}
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.teacherInfo}>
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={14} color={colors.warning} />
            <Text style={styles.ratingText}>{teacher.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({teacher.reviewCount})</Text>
          </View>
          
          <Text style={styles.hourlyRate}>
            {teacher.hourlyRate.toLocaleString()} VND/hour
          </Text>
        </View>
        
        <View style={styles.subjectsContainer}>
          {teacher.subjects.slice(0, 2).map((subject, index) => (
            <View key={index} style={styles.subjectTag}>
              <Text style={styles.subjectText}>{subject}</Text>
            </View>
          ))}
          {teacher.subjects.length > 2 && (
            <Text style={styles.moreSubjects}>+{teacher.subjects.length - 2} more</Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.viewProfileButton}>
          <Text style={styles.viewProfileText}>View Profile</Text>
          <MaterialIcons name="arrow-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

