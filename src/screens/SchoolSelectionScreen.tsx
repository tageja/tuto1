import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../contexts/SchoolContext';
import { useLanguage } from '../contexts/LanguageContext';
import { colors } from '../theme';
import SchoolHeader from '../components/common/SchoolHeader';

const SchoolSelectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { joinedSchools, switchToSchool, removeSchool } = useSchool();
  const { language, t } = useLanguage();

  const handleSchoolSelect = (school: any) => {
    switchToSchool(school);
    navigation.navigate('SchoolDashboard' as never);
  };

  const handleRemoveSchool = (school: any) => {
    Alert.alert(
      'Remove School',
      `Are you sure you want to remove ${school.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeSchool(school.id),
        },
      ]
    );
  };

  const handleJoinNewSchool = () => {
    navigation.navigate('SchoolInvitation' as never);
  };

  return (
    <ScrollView style={styles.container}>
      <SchoolHeader />
      <View style={styles.header}>
        <Text style={styles.subtitle}>School Selection</Text>
      </View>

      {/* Joined Schools */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Schools</Text>
        {joinedSchools.length > 0 ? (
          joinedSchools.map((joinedSchool) => (
            <TouchableOpacity
              key={joinedSchool.school.id}
              style={styles.schoolCard}
              onPress={() => handleSchoolSelect(joinedSchool.school)}
            >
              <View style={styles.schoolInfo}>
                <MaterialIcons name="school" size={32} color={colors.primary} />
                <View style={styles.schoolDetails}>
                  <Text style={styles.schoolName}>{joinedSchool.school.name}</Text>
                  <Text style={styles.schoolType}>{joinedSchool.school.schoolType}</Text>
                  <Text style={styles.joinDate}>
                    Joined: {new Date(joinedSchool.joinedDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View style={styles.schoolActions}>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => handleSchoolSelect(joinedSchool.school)}
                >
                  <Text style={styles.selectButtonText}>Select</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveSchool(joinedSchool.school)}
                >
                  <MaterialIcons name="delete" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="school" size={64} color={colors.text.secondary} />
            <Text style={styles.emptyTitle}>No Schools Joined</Text>
            <Text style={styles.emptySubtitle}>
              Join a school to access school-specific features
            </Text>
          </View>
        )}
      </View>

      {/* Join New School */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.joinNewButton} onPress={handleJoinNewSchool}>
          <MaterialIcons name="add" size={24} color={colors.white} />
          <Text style={styles.joinNewButtonText}>Join Another School</Text>
        </TouchableOpacity>
      </View>

      {/* Back to Home */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.backToHomeButton}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text style={styles.backToHomeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    padding: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 4,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  schoolCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  schoolDetails: {
    marginLeft: 12,
    flex: 1,
  },
  schoolName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  schoolType: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  joinDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  schoolActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  joinNewButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  joinNewButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  backToHomeButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backToHomeButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SchoolSelectionScreen;
