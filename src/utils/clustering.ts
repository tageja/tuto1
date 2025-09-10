import { Teacher } from '../types';

export interface ClusterPoint {
  id: string;
  latitude: number;
  longitude: number;
  data: Teacher;
}

export interface Cluster {
  id: string;
  latitude: number;
  longitude: number;
  count: number;
  teachers: Teacher[];
}

// Simple clustering algorithm based on distance
export const clusterTeachers = (
  teachers: Teacher[],
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  },
  clusterRadius: number = 0.01 // ~1km at equator
): Cluster[] => {
  if (teachers.length === 0) return [];

  const points: ClusterPoint[] = teachers.map(teacher => ({
    id: teacher.id,
    latitude: teacher.location.latitude,
    longitude: teacher.location.longitude,
    data: teacher,
  }));

  const clusters: Cluster[] = [];
  const processed = new Set<string>();

  for (const point of points) {
    if (processed.has(point.id)) continue;

    const cluster: Cluster = {
      id: `cluster_${point.id}`,
      latitude: point.latitude,
      longitude: point.longitude,
      count: 1,
      teachers: [point.data],
    };

    // Find nearby points to cluster
    for (const otherPoint of points) {
      if (processed.has(otherPoint.id) || otherPoint.id === point.id) continue;

      const distance = calculateDistance(
        point.latitude,
        point.longitude,
        otherPoint.latitude,
        otherPoint.longitude
      );

      if (distance <= clusterRadius) {
        cluster.teachers.push(otherPoint.data);
        cluster.count++;
        processed.add(otherPoint.id);
      }
    }

    processed.add(point.id);
    clusters.push(cluster);
  }

  return clusters;
};

// Calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get cluster radius based on zoom level
export const getClusterRadius = (latitudeDelta: number): number => {
  // Adjust cluster radius based on zoom level
  // Higher latitudeDelta = more zoomed out = larger clusters
  if (latitudeDelta > 0.1) return 0.05; // Very zoomed out
  if (latitudeDelta > 0.05) return 0.02; // Zoomed out
  if (latitudeDelta > 0.01) return 0.005; // Medium zoom
  return 0.001; // Zoomed in - smaller clusters
};
