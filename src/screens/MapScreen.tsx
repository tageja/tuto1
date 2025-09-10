import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import MapView, { Region, Marker, Callout } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { colors, spacing, typography } from '../theme';
import { Teacher } from '../types';
import { MapMarker, TeacherCallout } from '../components/MapMarker';
import { clusterTeachers, getClusterRadius, Cluster } from '../utils/clustering';
import { Backend } from '../services/backend';
import { useLocation } from '../hooks/useLocation';

interface MapScreenProps {
  navigation?: any;
}

export const MapScreen: React.FC<MapScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { userData } = useUser();
  const { location, requestPermission } = useLocation();
  const mapRef = useRef<MapView>(null);
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [region, setRegion] = useState<Region>({
    latitude: 10.8231, // Ho Chi Minh City default
    longitude: 106.6297,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeMap();
  }, []);

  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      fetchNearbyTeachers(location.latitude, location.longitude);
    }
  }, [location]);

  useEffect(() => {
    updateClusters();
  }, [teachers, region]);

  const initializeMap = async () => {
    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        Alert.alert(
          t('maps.permissionDenied'),
          t('maps.permissionRationale'),
          [
            { text: t('maps.goToSettings'), onPress: () => {} },
            { text: t('maps.enterLocationManually'), onPress: () => {} },
          ]
        );
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const fetchNearbyTeachers = async (latitude: number, longitude: number) => {
    try {
      setLoading(true);
      const response = await Backend.listNearbyTeachers({
        lat: latitude,
        lng: longitude,
        radiusKm: 10,
        max: 100,
      });

      if (response.ok && response.teachers) {
        const teacherData: Teacher[] = response.teachers.map((t: any) => ({
          id: t.id,
          name: t.name,
          avatar: '',
          subjects: [],
          qualifications: [],
          experience: 0,
          hourlyRate: t.hourlyRate || 0,
          rating: t.rating || 0,
          reviewCount: t.reviewCount || 0,
          location: {
            address: '',
            latitude: t.latitude,
            longitude: t.longitude,
          },
          availability: { days: [], timeSlots: [] },
          description: '',
          languages: [],
        }));
        setTeachers(teacherData);
      }
    } catch (error) {
      console.error('Error fetching nearby teachers:', error);
      Alert.alert(t('maps.locationError'), t('maps.locationError'));
    } finally {
      setLoading(false);
    }
  };

  const updateClusters = () => {
    const clusterRadius = getClusterRadius(region.latitudeDelta);
    const newClusters = clusterTeachers(teachers, region, clusterRadius);
    setClusters(newClusters);
  };

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
  };

  const handleMarkerPress = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
  };

  const handleCalloutPress = (teacher: Teacher) => {
    if (navigation) {
      navigation.navigate('TeacherProfile', {
        teacherId: teacher.id,
        teacherName: teacher.name,
        subject: teacher.subjects[0] || 'General',
        imageUrl: teacher.avatar,
        rating: teacher.rating,
        reviews: teacher.reviewCount,
        experience: teacher.experience,
        hourlyRate: teacher.hourlyRate,
      });
    }
    setSelectedTeacher(null);
  };

  const handleClusterPress = (cluster: Cluster) => {
    // Zoom in on cluster
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: cluster.latitude,
        longitude: cluster.longitude,
        latitudeDelta: region.latitudeDelta * 0.5,
        longitudeDelta: region.longitudeDelta * 0.5,
      });
    }
  };

  const renderMarkers = () => {
    return clusters.map((cluster) => {
      if (cluster.count === 1) {
        // Single teacher marker
        const teacher = cluster.teachers[0];
        return (
          <Marker
            key={teacher.id}
            coordinate={{
              latitude: teacher.location.latitude,
              longitude: teacher.location.longitude,
            }}
            onPress={() => handleMarkerPress(teacher)}
          >
            <MapMarker
              teacher={teacher}
              onPress={handleMarkerPress}
              isCluster={false}
            />
            <Callout onPress={() => handleCalloutPress(teacher)}>
              <TeacherCallout
                teacher={teacher}
                onPress={handleCalloutPress}
                onClose={() => setSelectedTeacher(null)}
              />
            </Callout>
          </Marker>
        );
      } else {
        // Cluster marker
        return (
          <Marker
            key={cluster.id}
            coordinate={{
              latitude: cluster.latitude,
              longitude: cluster.longitude,
            }}
            onPress={() => handleClusterPress(cluster)}
          >
            <MapMarker
              teacher={cluster.teachers[0]}
              onPress={() => handleClusterPress(cluster)}
              isCluster={true}
              clusterCount={cluster.count}
            />
          </Marker>
        );
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('navigation.map')}</Text>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => {
            if (location) {
              mapRef.current?.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
            }
          }}
        >
          <MaterialIcons name="my-location" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {renderMarkers()}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      )}

      <View style={styles.mapInfo}>
        <Text style={styles.mapInfoText}>
          {teachers.length} teachers found
        </Text>
        <Text style={styles.mapInfoSubtext}>
          Tap markers to view details
        </Text>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  locationButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  map: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  mapInfo: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.background.primary,
    padding: spacing.md,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mapInfoText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  mapInfoSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
}); 