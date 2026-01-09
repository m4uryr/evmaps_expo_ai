import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LocationCard = ({ location, onNavigate, onClose, isLoading }) => {
  if (!location) return null;

  return (
    <View style={styles.container}>
      {/* Drag handle indicator */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.locationBadge}>
            <Ionicons name="location" size={14} color="#FFF" />
            <Text style={styles.badgeText}>Selected Location</Text>
          </View>
          <Text style={styles.locationName} numberOfLines={2}>
            {location.name || 'Map Location'}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {location.address && (
        <View style={styles.addressRow}>
          <Ionicons name="map" size={16} color="#666" />
          <Text style={styles.addressText} numberOfLines={2}>
            {location.address}
          </Text>
        </View>
      )}

      <View style={styles.coordsRow}>
        <View style={styles.coordItem}>
          <Text style={styles.coordLabel}>Latitude</Text>
          <Text style={styles.coordValue}>{location.latitude.toFixed(6)}</Text>
        </View>
        <View style={styles.coordItem}>
          <Text style={styles.coordLabel}>Longitude</Text>
          <Text style={styles.coordValue}>{location.longitude.toFixed(6)}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.navigateButton, isLoading && styles.navigateButtonDisabled]} 
        onPress={onNavigate}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            <Ionicons name="navigate" size={20} color="#FFF" />
            <Text style={styles.navigateText}>Navigate Here</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  handleContainer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  locationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  closeButton: {
    padding: 4,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  coordsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  coordItem: {
    alignItems: 'center',
  },
  coordLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  coordValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  navigateButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  navigateButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  navigateText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default LocationCard;
