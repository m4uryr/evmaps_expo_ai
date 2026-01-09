import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  
  // Track view changes temporarily when count changes to force marker re-render
  const [shouldTrackChanges, setShouldTrackChanges] = useState(true);
  
  useEffect(() => {
    // Enable tracking when cluster changes
    setShouldTrackChanges(true);
    // Disable after a short delay to improve performance
    const timer = setTimeout(() => {
      setShouldTrackChanges(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [count, cluster.id]);

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
      tracksViewChanges={shouldTrackChanges}
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
  },
  markerCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
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
    marginTop: -1,
  },
});

// Custom comparison to force re-render when cluster content changes
const areEqual = (prevProps, nextProps) => {
  return (
    prevProps.cluster.id === nextProps.cluster.id &&
    prevProps.cluster.count === nextProps.cluster.count &&
    prevProps.cluster.coordinate.latitude === nextProps.cluster.coordinate.latitude &&
    prevProps.cluster.coordinate.longitude === nextProps.cluster.coordinate.longitude
  );
};

export default React.memo(ClusterMarker, areEqual);
