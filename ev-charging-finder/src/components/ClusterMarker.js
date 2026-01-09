import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { PIN_COLORS } from '../constants';

// Speed priority: DC Fast > DC Slow > AC
const SPEED_PRIORITY = {
  'DC Fast': 3,
  'DC Slow': 2,
  'AC': 1,
};

const ClusterMarker = ({ cluster, onPress }) => {
  const { coordinate, stations, count } = cluster;

  // Find the fastest charging speed in the cluster
  const fastestSpeed = stations.reduce((fastest, station) => {
    const currentPriority = SPEED_PRIORITY[station.chargingSpeed] || 0;
    const fastestPriority = SPEED_PRIORITY[fastest] || 0;
    return currentPriority > fastestPriority ? station.chargingSpeed : fastest;
  }, 'AC');

  const pinColor = PIN_COLORS[fastestSpeed] || PIN_COLORS['AC'];
  const isCluster = count > 1;

  return (
    <Marker
      coordinate={coordinate}
      onPress={() => onPress(cluster)}
      tracksViewChanges={Platform.OS === 'ios'}
      zIndex={2}
      anchor={{ x: 0.5, y: 1 }}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.markerCircle, { backgroundColor: pinColor }]}>
          {isCluster ? (
            <Text style={styles.countText}>{count}</Text>
          ) : (
            <Ionicons name="flash" size={16} color="#FFFFFF" />
          )}
        </View>
        <View style={[styles.markerTail, { borderTopColor: pinColor }]} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
    width: 40,
    height: 50,
  },
  markerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#3B82F6',
    marginTop: -2,
  },
});

// Only re-render if cluster ID changes (which includes station composition and count)
export default React.memo(ClusterMarker, (prevProps, nextProps) => {
  return prevProps.cluster.id === nextProps.cluster.id;
});
