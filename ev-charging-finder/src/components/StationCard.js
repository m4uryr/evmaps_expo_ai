import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PIN_COLORS } from '../constants';

const StationCard = ({ station, onNavigate, onClose }) => {
  if (!station) return null;

  const speedColor = PIN_COLORS[station.chargingSpeed] || PIN_COLORS['AC'];
  
  // Sort operators by price (best first)
  const sortedOperators = [...(station.operators || [])].sort(
    (a, b) => a.pricePerKwh - b.pricePerKwh
  );

  const openWebsite = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };

  return (
    <View style={styles.container}>
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

      <Text style={styles.operatorsTitle}>Operators (sorted by price)</Text>
      <ScrollView style={styles.operatorsList} nestedScrollEnabled>
        {sortedOperators.map((operator, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.operatorCard,
              index === 0 && styles.bestPriceCard,
            ]}
            onPress={() => openWebsite(operator.website)}
          >
            <View style={styles.operatorHeader}>
              <Text style={styles.operatorName}>{operator.name}</Text>
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
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
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    marginBottom: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  operatorsList: {
    maxHeight: 180,
  },
  operatorCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
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
  operatorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
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
