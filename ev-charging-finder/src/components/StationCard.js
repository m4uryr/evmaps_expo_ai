import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PIN_COLORS } from '../constants';
import { openOperatorApp } from '../utils/deepLinking';

const StationCard = ({ station, onNavigate, onClose }) => {
  if (!station) return null;

  const speedColor = PIN_COLORS[station.chargingSpeed] || PIN_COLORS['AC'];
  
  // Sort operators by price (best first)
  const sortedOperators = [...(station.operators || [])].sort(
    (a, b) => a.pricePerKwh - b.pricePerKwh
  );

  const handleOperatorPress = (operator) => {
    openOperatorApp(operator.name, station.id, station.lat, station.lng);
  };

  return (
    <View style={styles.container}>
      {/* Drag handle indicator */}
      <View style={styles.handleContainer}>
        <View style={styles.handle} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.speedBadge, { backgroundColor: speedColor }]}>
            <Ionicons name="flash" size={14} color="#FFF" />
            <Text style={styles.speedText}>{station.chargingSpeed}</Text>
          </View>
          <Text style={styles.stationName} numberOfLines={1}>
            {station.name}
          </Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Station ID */}
      <View style={styles.stationIdRow}>
        <Text style={styles.stationIdLabel}>Station ID:</Text>
        <Text style={styles.stationIdValue}>{station.id}</Text>
      </View>

      <View style={styles.addressRow}>
        <Ionicons name="location" size={16} color="#666" />
        <Text style={styles.addressText}>{station.address}</Text>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Ionicons name="battery-charging" size={16} color="#666" />
          <Text style={styles.infoText}>{station.power}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="car" size={16} color="#666" />
          <Text style={styles.infoText}>
            {station.available}/{station.total} available
          </Text>
        </View>
        <View style={styles.connectorBadges}>
          {station.connectorTypes?.map((type, idx) => (
            <View key={idx} style={styles.connectorBadge}>
              <Text style={styles.connectorText}>{type}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.operatorsTitle}>Operators (sorted by price) - Tap to open app</Text>
      <ScrollView style={styles.operatorsList} nestedScrollEnabled showsVerticalScrollIndicator>
        {sortedOperators.map((operator, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.operatorCard,
              index === 0 && styles.bestPriceCard,
            ]}
            onPress={() => handleOperatorPress(operator)}
            activeOpacity={0.7}
          >
            <View style={styles.operatorHeader}>
              <View style={styles.operatorNameRow}>
                <Text style={styles.operatorName}>{operator.name}</Text>
                <Ionicons name="open-outline" size={14} color="#666" style={styles.openIcon} />
              </View>
              {index === 0 && (
                <View style={styles.bestPriceBadge}>
                  <Text style={styles.bestPriceText}>Best Price</Text>
                </View>
              )}
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>€{operator.pricePerKwh.toFixed(3)}/kWh</Text>
              {operator.pricePerMinute && (
                <Text style={styles.priceSecondary}>
                  + €{operator.pricePerMinute.toFixed(3)}/min
                </Text>
              )}
              {operator.connectionFee && (
                <Text style={styles.priceSecondary}>
                  + €{operator.connectionFee.toFixed(2)} fee
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.navigateButton} onPress={onNavigate}>
        <Ionicons name="navigate" size={20} color="#FFF" />
        <Text style={styles.navigateText}>Navigate Here</Text>
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
    paddingBottom: 34,
    height: 480,
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
    marginBottom: 4,
  },
  headerLeft: {
    flex: 1,
    marginRight: 8,
  },
  speedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  speedText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  stationName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  closeButton: {
    padding: 4,
  },
  stationIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stationIdLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginRight: 4,
  },
  stationIdValue: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  connectorBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  connectorBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  connectorText: {
    fontSize: 11,
    color: '#374151',
    fontWeight: '500',
  },
  operatorsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  operatorsList: {
    minHeight: 160,
    maxHeight: 220,
    flexGrow: 1,
  },
  operatorCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bestPriceCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  operatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  operatorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
  },
  openIcon: {
    marginLeft: 6,
  },
  bestPriceBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bestPriceText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  priceSecondary: {
    fontSize: 12,
    color: '#666',
  },
  navigateButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  navigateText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default StationCard;
