import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { ensureSocialProfile } from '../../services/social/auth.service';
import { EditProfileModal } from '../../components/social';
import type { SocialProfile } from '../../types/social';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = React.useState<SocialProfile | null>(null);

  useEffect(() => {
    ensureSocialProfile().then(setProfile).catch(console.warn);
  }, []);

  const handleSuccess = (updated: SocialProfile) => {
    setProfile(updated);
    navigation.goBack();
  };

  if (!profile) return null;

  return (
    <EditProfileModal
      visible
      profile={profile}
      onClose={() => navigation.goBack()}
      onSuccess={handleSuccess}
    />
  );
}
