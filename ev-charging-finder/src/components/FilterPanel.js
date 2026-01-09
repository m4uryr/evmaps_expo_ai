import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { CONNECTOR_TYPES, CHARGING_SPEEDS, PIN_COLORS } from '../constants';

const FilterPanel = ({
  isExpanded,
  onToggle,
  radius,
  onRadiusChange,
  selectedConnectors,
  onConnectorToggle,
  selectedSpeeds,
  onSpeedToggle,
  searchQuery,
  onSearchChange,
  onSearch,
  autocompleteResults,
  onSelectPlace,
  isSearching,
  onMyLocation,
  isNavigating,
  navigationInfo,
  onCancelNavigation,
  currentStep,
  onNextStep,
  onPrevStep,
}) => {
  const [localRadius, setLocalRadius] = useState(radius);

  const handleSearchSubmit = () => {
    Keyboard.dismiss();
    onSearch(searchQuery);
  };

  if (!isExpanded) {
    return (
      <TouchableOpacity style={styles.collapsedButton} onPress={onToggle}>
        <Ionicons name="options" size={24} color="#FFF" />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isNavigating ? 'Navigation' : 'Find Charging Stations'}
        </Text>
        <TouchableOpacity onPress={onToggle} style={styles.closeButton}>
          <Ionicons name="chevron-down" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {isNavigating ? (
        <View style={styles.navigationContainer}>
          <View style={styles.navInfoRow}>
            <View style={styles.navInfoItem}>
              <Ionicons name="time" size={20} color="#3B82F6" />
              <Text style={styles.navInfoValue}>{navigationInfo?.duration || '--'}</Text>
              <Text style={styles.navInfoLabel}>Duration</Text>
            </View>
            <View style={styles.navInfoItem}>
              <Ionicons name="speedometer" size={20} color="#3B82F6" />
              <Text style={styles.navInfoValue}>{navigationInfo?.distance || '--'}</Text>
              <Text style={styles.navInfoLabel}>Distance</Text>
            </View>
          </View>

          <View style={styles.destinationRow}>
            <Ionicons name="flag" size={18} color="#10B981" />
            <Text style={styles.destinationText} numberOfLines={2}>
              {navigationInfo?.destination || 'Destination'}
            </Text>
          </View>

          {navigationInfo?.steps && navigationInfo.steps.length > 0 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>
                Step {currentStep + 1} of {navigationInfo.steps.length}
              </Text>
              <View style={styles.stepContent}>
                <Ionicons
                  name={getManeuverIcon(navigationInfo.steps[currentStep]?.maneuver)}
                  size={24}
                  color="#3B82F6"
                />
                <Text style={styles.stepInstruction}>
                  {navigationInfo.steps[currentStep]?.instruction?.replace(/<[^>]*>/g, '') || ''}
                </Text>
              </View>
              <Text style={styles.stepDistance}>
                {navigationInfo.steps[currentStep]?.distance}
              </Text>
              <View style={styles.stepNavButtons}>
                <TouchableOpacity
                  style={[styles.stepNavBtn, currentStep === 0 && styles.stepNavBtnDisabled]}
                  onPress={onPrevStep}
                  disabled={currentStep === 0}
                >
                  <Ionicons name="chevron-back" size={20} color={currentStep === 0 ? '#CCC' : '#3B82F6'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.stepNavBtn,
                    currentStep >= navigationInfo.steps.length - 1 && styles.stepNavBtnDisabled,
                  ]}
                  onPress={onNextStep}
                  disabled={currentStep >= navigationInfo.steps.length - 1}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={currentStep >= navigationInfo.steps.length - 1 ? '#CCC' : '#3B82F6'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity style={styles.cancelNavButton} onPress={onCancelNavigation}>
            <Ionicons name="close-circle" size={20} color="#FFF" />
            <Text style={styles.cancelNavText}>End Navigation</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputWrapper}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search destination..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={onSearchChange}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
              />
              {isSearching && <ActivityIndicator size="small" color="#3B82F6" />}
            </View>
            <TouchableOpacity style={styles.myLocationButton} onPress={onMyLocation}>
              <Ionicons name="locate" size={20} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {/* Autocomplete Results */}
          {autocompleteResults.length > 0 && (
            <View style={styles.autocompleteContainer}>
              {autocompleteResults.map((result, index) => (
                <TouchableOpacity
                  key={result.place_id || index}
                  style={styles.autocompleteItem}
                  onPress={() => onSelectPlace(result)}
                >
                  <Ionicons name="location" size={16} color="#666" />
                  <View style={styles.autocompleteTextContainer}>
                    <Text style={styles.autocompleteMain}>
                      {result.structured_formatting?.main_text || result.description}
                    </Text>
                    <Text style={styles.autocompleteSecondary} numberOfLines={1}>
                      {result.structured_formatting?.secondary_text || ''}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Radius Slider */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Search Radius: {localRadius} km</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={localRadius}
              onValueChange={setLocalRadius}
              onSlidingComplete={onRadiusChange}
              minimumTrackTintColor="#3B82F6"
              maximumTrackTintColor="#E5E7EB"
              thumbTintColor="#3B82F6"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabelText}>1 km</Text>
              <Text style={styles.sliderLabelText}>50 km</Text>
            </View>
          </View>

          {/* Connector Types */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Connector Types</Text>
            <View style={styles.filterChips}>
              {CONNECTOR_TYPES.map((connector) => (
                <TouchableOpacity
                  key={connector.id}
                  style={[
                    styles.filterChip,
                    selectedConnectors.includes(connector.id) && styles.filterChipSelected,
                  ]}
                  onPress={() => onConnectorToggle(connector.id)}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedConnectors.includes(connector.id) && styles.filterChipTextSelected,
                    ]}
                  >
                    {connector.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Charging Speed */}
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Charging Speed</Text>
            <View style={styles.filterChips}>
              {CHARGING_SPEEDS.map((speed) => (
                <TouchableOpacity
                  key={speed.id}
                  style={[
                    styles.filterChip,
                    selectedSpeeds.includes(speed.id) && {
                      ...styles.filterChipSelected,
                      backgroundColor: PIN_COLORS[speed.id],
                      borderColor: PIN_COLORS[speed.id],
                    },
                  ]}
                  onPress={() => onSpeedToggle(speed.id)}
                >
                  <Ionicons
                    name="flash"
                    size={14}
                    color={selectedSpeeds.includes(speed.id) ? '#FFF' : PIN_COLORS[speed.id]}
                  />
                  <Text
                    style={[
                      styles.filterChipText,
                      { marginLeft: 4 },
                      selectedSpeeds.includes(speed.id) && styles.filterChipTextSelected,
                    ]}
                  >
                    {speed.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const getManeuverIcon = (maneuver) => {
  if (!maneuver) return 'arrow-forward';
  if (maneuver.includes('left')) return 'arrow-back';
  if (maneuver.includes('right')) return 'arrow-forward';
  if (maneuver.includes('uturn')) return 'return-down-back';
  if (maneuver.includes('roundabout')) return 'sync';
  if (maneuver.includes('merge')) return 'git-merge';
  return 'arrow-up';
};

const styles = StyleSheet.create({
  collapsedButton: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  closeButton: {
    padding: 4,
  },
  scrollContainer: {
    maxHeight: 400,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1a1a2e',
  },
  myLocationButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EBF5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  autocompleteContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  autocompleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  autocompleteTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  autocompleteMain: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  autocompleteSecondary: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterChipSelected: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  filterChipTextSelected: {
    color: '#FFF',
  },
  navigationContainer: {
    paddingTop: 8,
  },
  navInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  navInfoItem: {
    alignItems: 'center',
  },
  navInfoValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a2e',
    marginTop: 4,
  },
  navInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  destinationText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#166534',
    fontWeight: '500',
  },
  stepContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepInstruction: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a2e',
  },
  stepDistance: {
    fontSize: 13,
    color: '#666',
    marginTop: 6,
    marginLeft: 34,
  },
  stepNavButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
  },
  stepNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNavBtnDisabled: {
    opacity: 0.5,
  },
  cancelNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelNavText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default FilterPanel;
