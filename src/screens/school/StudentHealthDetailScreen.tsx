import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  fetchStudentHealthDetail,
  updateEmergencyContacts,
  type StudentHealthDetail,
} from '../../services/supabase-health';

const StudentHealthDetailScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useLanguage();
  const studentId = route.params?.studentId;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StudentHealthDetail | null>(null);
  const [showEditContacts, setShowEditContacts] = useState(false);
  const [editingContacts, setEditingContacts] = useState({
    primaryName: '',
    primaryPhone: '',
    altName: '',
    altPhone: '',
  });

  useEffect(() => {
    if (studentId) {
      loadData();
    }
  }, [studentId]);

  const loadData = async () => {
    if (!studentId) return;
    try {
      setLoading(true);
      const healthData = await fetchStudentHealthDetail(studentId);
      setData(healthData);
      setEditingContacts({
        primaryName: healthData.emergencyContacts.primaryName || '',
        primaryPhone: healthData.emergencyContacts.primaryPhone || '',
        altName: healthData.emergencyContacts.altName || '',
        altPhone: healthData.emergencyContacts.altPhone || '',
      });
    } catch (error: any) {
      console.error('Error loading student health detail:', error);
      Alert.alert(
        t('common.error') || 'Error',
        error.message || 'Failed to load health data'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = () => {
    navigation.navigate('AddHealthRecord', { studentId });
  };

  const handleSaveContacts = async () => {
    if (!studentId) return;
    try {
      await updateEmergencyContacts(studentId, editingContacts);
      setShowEditContacts(false);
      loadData();
      Alert.alert(
        t('common.success') || 'Success',
        t('dashboard.health.toasts.contactsUpdated') || 'Emergency contacts updated'
      );
    } catch (error: any) {
      console.error('Error updating contacts:', error);
      Alert.alert(
        t('common.error') || 'Error',
        error.message || 'Failed to update contacts'
      );
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return colors.text.secondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
        return '#10B981';
      case 'scheduled':
        return '#0B5FFF';
      case 'pending':
        return '#F59E0B';
      default:
        return colors.text.secondary;
    }
  };

  if (loading) {

    // Styles with dynamic theme

    const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  addButton: {
    padding: spacing.xs,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: '600',
  },
  list: {
    gap: spacing.sm,
  },
  allergyCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  allergyContent: {
    flex: 1,
  },
  allergyName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  allergyNotes: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  severityBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  severityText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  medicationCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  medicationName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  medicationDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  medicationDetail: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  scheduleBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  scheduleText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  contactsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  contactRow: {
    marginBottom: spacing.md,
  },
  contactLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  contactName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  vaccineCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vaccineContent: {
    flex: 1,
  },
  vaccineName: {
    fontSize: typography.fontSize.md,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  vaccineDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '600',
  },
  vitalsTable: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  vitalsHeader: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  vitalsHeaderText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  vitalsHeaderRight: {
    textAlign: 'right',
  },
  vitalsRow: {
    flexDirection: 'row',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  vitalsCell: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  vitalsCellRight: {
    textAlign: 'right',
  },
  emptySection: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalBody: {
    padding: spacing.md,
  },
  modalField: {
    marginBottom: spacing.md,
  },
  modalLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  modalInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  modalCancelText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: '600',
  },
  modalSaveButton: {
    backgroundColor: colors.primary,
  },
  modalSaveText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    fontWeight: '600',
  },
});

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading') || 'Loading...'}</Text>
        </View>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Health Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No health data found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{data.student.fullName}</Text>
          <Text style={styles.headerSubtitle}>{data.student.className}</Text>
        </View>
        <TouchableOpacity onPress={handleAddRecord} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Medical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.health.sections.medicalInfo') || 'Medical Information'}
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Student Name</Text>
              <Text style={styles.infoValue}>{data.student.fullName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Class</Text>
              <Text style={styles.infoValue}>{data.student.className}</Text>
            </View>
            {data.student.dateOfBirth && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date of Birth</Text>
                <Text style={styles.infoValue}>
                  {new Date(data.student.dateOfBirth).toLocaleDateString()}
                </Text>
              </View>
            )}
            {data.notes.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>General Notes</Text>
                <Text style={styles.infoValue}>
                  {data.notes[0]?.details?.notes || data.notes[0]?.title || 'No notes'}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Allergies & Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.health.sections.allergies') || 'Allergies & Conditions'}
          </Text>
          {data.allergies.length > 0 ? (
            <View style={styles.list}>
              {data.allergies.map((allergy) => (
                <View key={allergy.id} style={styles.allergyCard}>
                  <View style={styles.allergyContent}>
                    <Text style={styles.allergyName}>{allergy.name}</Text>
                    {allergy.notes && (
                      <Text style={styles.allergyNotes}>{allergy.notes}</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.severityBadge,
                      { backgroundColor: `${getSeverityColor(allergy.severity)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        { color: getSeverityColor(allergy.severity) },
                      ]}
                    >
                      {allergy.severity.charAt(0).toUpperCase() + allergy.severity.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>
                {t('dashboard.health.empty.noAllergies') || 'No allergies recorded'}
              </Text>
            </View>
          )}
        </View>

        {/* Medications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.health.sections.medications') || 'Medications'}
          </Text>
          {data.medications.length > 0 ? (
            <View style={styles.list}>
              {data.medications.map((med) => (
                <View key={med.id} style={styles.medicationCard}>
                  <Text style={styles.medicationName}>{med.name}</Text>
                  <View style={styles.medicationDetails}>
                    {med.dose && (
                      <Text style={styles.medicationDetail}>Dose: {med.dose}</Text>
                    )}
                    {med.schedule && (
                      <View
                        style={[
                          styles.scheduleBadge,
                          { backgroundColor: `${colors.primary}20` },
                        ]}
                      >
                        <Text style={[styles.scheduleText, { color: colors.primary }]}>
                          {med.schedule}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>
                {t('dashboard.health.empty.noMedications') || 'No medications recorded'}
              </Text>
            </View>
          )}
        </View>

        {/* Emergency Contacts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('dashboard.health.sections.emergencyContacts') || 'Emergency Contacts'}
            </Text>
            <TouchableOpacity
              onPress={() => setShowEditContacts(true)}
              style={styles.editButton}
            >
              <MaterialIcons name="edit" size={20} color={colors.primary} />
              <Text style={styles.editButtonText}>
                {t('dashboard.health.buttons.editContacts') || 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.contactsCard}>
            {data.emergencyContacts.primaryName ? (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Primary Contact</Text>
                <Text style={styles.contactName}>{data.emergencyContacts.primaryName}</Text>
                <Text style={styles.contactPhone}>{data.emergencyContacts.primaryPhone}</Text>
              </View>
            ) : null}
            {data.emergencyContacts.altName ? (
              <View style={styles.contactRow}>
                <Text style={styles.contactLabel}>Secondary Contact</Text>
                <Text style={styles.contactName}>{data.emergencyContacts.altName}</Text>
                <Text style={styles.contactPhone}>{data.emergencyContacts.altPhone}</Text>
              </View>
            ) : null}
            {!data.emergencyContacts.primaryName && !data.emergencyContacts.altName && (
              <Text style={styles.emptyText}>No emergency contacts on file</Text>
            )}
          </View>
        </View>

        {/* Vaccination Records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.health.sections.vaccinations') || 'Vaccination Records'}
          </Text>
          {data.vaccinations.length > 0 ? (
            <View style={styles.list}>
              {data.vaccinations.map((vaccine) => (
                <View key={vaccine.id} style={styles.vaccineCard}>
                  <View style={styles.vaccineContent}>
                    <Text style={styles.vaccineName}>{vaccine.vaccine}</Text>
                    <Text style={styles.vaccineDate}>
                      {new Date(vaccine.date).toLocaleDateString()} • {vaccine.status}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: `${getStatusColor(vaccine.status)}20` },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: getStatusColor(vaccine.status) }]}
                    >
                      {vaccine.status.charAt(0).toUpperCase() + vaccine.status.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>
                {t('dashboard.health.empty.noVaccinations') || 'No vaccinations recorded'}
              </Text>
            </View>
          )}
        </View>

        {/* Vitals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('dashboard.health.sections.vitals') || 'Vitals Log'} (Last 12 entries)
          </Text>
          {data.vitals.length > 0 ? (
            <View style={styles.vitalsTable}>
              <View style={styles.vitalsHeader}>
                <Text style={styles.vitalsHeaderText}>Date</Text>
                <Text style={[styles.vitalsHeaderText, styles.vitalsHeaderRight]}>
                  Height (cm)
                </Text>
                <Text style={[styles.vitalsHeaderText, styles.vitalsHeaderRight]}>
                  Weight (kg)
                </Text>
              </View>
              {data.vitals.map((vital) => (
                <View key={vital.id} style={styles.vitalsRow}>
                  <Text style={styles.vitalsCell}>
                    {new Date(vital.recordedAt).toLocaleDateString()}
                  </Text>
                  <Text style={[styles.vitalsCell, styles.vitalsCellRight]}>
                    {vital.heightCm || '—'}
                  </Text>
                  <Text style={[styles.vitalsCell, styles.vitalsCellRight]}>
                    {vital.weightKg || '—'}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>
                {t('dashboard.health.empty.noVitals') || 'No vitals recorded'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit Contacts Modal */}
      <Modal
        visible={showEditContacts}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditContacts(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Emergency Contacts</Text>
              <TouchableOpacity onPress={() => setShowEditContacts(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Primary Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editingContacts.primaryName}
                  onChangeText={(text) =>
                    setEditingContacts({ ...editingContacts, primaryName: text })
                  }
                  placeholder="Enter primary contact name"
                />
              </View>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Primary Phone</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editingContacts.primaryPhone}
                  onChangeText={(text) =>
                    setEditingContacts({ ...editingContacts, primaryPhone: text })
                  }
                  placeholder="Enter primary contact phone"
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Alternate Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editingContacts.altName}
                  onChangeText={(text) =>
                    setEditingContacts({ ...editingContacts, altName: text })
                  }
                  placeholder="Enter alternate contact name"
                />
              </View>
              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Alternate Phone</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editingContacts.altPhone}
                  onChangeText={(text) =>
                    setEditingContacts({ ...editingContacts, altPhone: text })
                  }
                  placeholder="Enter alternate contact phone"
                  keyboardType="phone-pad"
                />
              </View>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowEditContacts(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveContacts}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StudentHealthDetailScreen;

