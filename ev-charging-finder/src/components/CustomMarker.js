import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { PIN_COLORS } from '../constants';

const CustomMarker = ({ station, onPress }) => {
  const pinColor = PIN_COLORS[station.chargingSpeed] || PIN_COLORS['AC'];

  return (
    <Marker
      coordinate={{
        latitude: station.lat,
        longitude: station.lng,
      }}
      onPress={() => onPress(station)}
      tracksViewChanges={false}
    >
      <View style={styles.markerContainer}>
        <View style={[styles.markerCircle, { backgroundColor: pinColor }]}>
          <Ionicons name="flash" size={16} color="#FFFFFF" />
        </View>
        <View style={styles.markerTail} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: {
    alignItems: 'center',
  },
  markerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
  markerTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#000000',
    marginTop: -1,
  },
});

export default React.memo(CustomMarker);
