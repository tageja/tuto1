import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../contexts/SchoolContext';
import { useLanguage } from '../contexts/LanguageContext';
import { colors } from '../theme';
import SchoolHeader from '../components/common/SchoolHeader';

const SchoolInvitationScreen: React.FC = () => {
  const [invitationCode, setInvitationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const { joinSchool } = useSchool();
  const { language, t } = useLanguage();

  const handleJoinSchool = async () => {
    if (!invitationCode.trim()) {
      Alert.alert(
        t('school.invitation.error.title'),
        t('school.invitation.error.emptyCode'),
        [{ text: t('common.ok') }]
      );
      return;
    }

    setIsLoading(true);
    try {
      const success = await joinSchool(invitationCode.trim());
      
      if (success) {
        Alert.alert(
          t('school.invitation.success.title'),
          t('school.invitation.success.message'),
          [
            {
              text: t('common.ok'),
              onPress: () => navigation.navigate('SchoolDashboard' as never),
            },
          ]
        );
      } else {
        Alert.alert(
          t('school.invitation.error.title'),
          t('school.invitation.error.invalidCode'),
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      Alert.alert(
        t('school.invitation.error.title'),
        t('school.invitation.error.networkError'),
        [{ text: t('common.ok') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('Home' as never);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SchoolHeader />
        <View style={styles.header}>
          <MaterialIcons name="school" size={80} color={colors.primary} />
          <Text style={styles.title}>{t('school.invitation.title')}</Text>
          <Text style={styles.subtitle}>{t('school.invitation.subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialIcons name="vpn-key" size={24} color={colors.text.secondary} />
            <TextInput
              style={styles.input}
              placeholder={t('school.invitation.placeholder')}
              value={invitationCode}
              onChangeText={setInvitationCode}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[styles.joinButton, isLoading && styles.disabledButton]}
            onPress={handleJoinSchool}
            disabled={isLoading}
          >
            {isLoading ? (
              <Text style={styles.buttonText}>{t('common.loading')}</Text>
            ) : (
              <Text style={styles.buttonText}>{t('school.invitation.joinButton')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>{t('school.invitation.skipButton')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.info}>
          <MaterialIcons name="info" size={20} color={colors.text.secondary} />
          <Text style={styles.infoText}>{t('school.invitation.subtitle')}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    marginLeft: 12,
  },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginLeft: 8,
  },
});

export default SchoolInvitationScreen;
