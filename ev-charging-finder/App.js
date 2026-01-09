import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';

import CustomMarker from './src/components/CustomMarker';
import StationCard from './src/components/StationCard';
import FilterPanel from './src/components/FilterPanel';
import {
  fetchChargingStations,
  getDirections,
  getPlaceAutocomplete,
  getPlaceDetails,
  geocodeAddress,
  decodePolyline,
  getPointsAlongRoute,
} from './src/services/api';
import { DEFAULT_LOCATION, ROUTE_FETCH_INTERVAL_KM } from './src/constants';

export default function App() {
  const mapRef = useRef(null);
  const [region, setRegion] = useState(DEFAULT_LOCATION);
  const [userLocation, setUserLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter states
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [radius, setRadius] = useState(10);
  const [selectedConnectors, setSelectedConnectors] = useState([]);
  const [selectedSpeeds, setSelectedSpeeds] = useState([]);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [autocompleteResults, setAutocompleteResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sessionToken, setSessionToken] = useState(Date.now().toString());

  // Navigation states
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [navigationInfo, setNavigationInfo] = useState(null);
  const [destination, setDestination] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Get user location on mount
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show nearby charging stations.'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(newLocation);
      setRegion({
        ...newLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      // Fetch initial stations
      loadStations(newLocation.latitude, newLocation.longitude, radius);
    })();
  }, []);

  // Load stations when filters or location change
  const loadStations = useCallback(
    async (lat, lng, searchRadius, connectors = selectedConnectors, speeds = selectedSpeeds) => {
      setIsLoading(true);
      try {
        const data = await fetchChargingStations(lat, lng, searchRadius, connectors, speeds);
        setStations(data);
      } catch (error) {
        console.error('Failed to load stations:', error);
        Alert.alert('Error', 'Failed to load charging stations. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [selectedConnectors, selectedSpeeds]
  );

  // Handle radius change
  const handleRadiusChange = useCallback(
    (newRadius) => {
      setRadius(newRadius);
      if (userLocation && !isNavigating) {
        loadStations(userLocation.latitude, userLocation.longitude, newRadius);
      }
    },
    [userLocation, isNavigating, loadStations]
  );

  // Handle connector toggle
  const handleConnectorToggle = useCallback(
    (connectorId) => {
      const newConnectors = selectedConnectors.includes(connectorId)
        ? selectedConnectors.filter((c) => c !== connectorId)
        : [...selectedConnectors, connectorId];
      setSelectedConnectors(newConnectors);
      if (userLocation && !isNavigating) {
        loadStations(userLocation.latitude, userLocation.longitude, radius, newConnectors);
      }
    },
    [selectedConnectors, userLocation, isNavigating, radius, loadStations]
  );

  // Handle speed toggle
  const handleSpeedToggle = useCallback(
    (speedId) => {
      const newSpeeds = selectedSpeeds.includes(speedId)
        ? selectedSpeeds.filter((s) => s !== speedId)
        : [...selectedSpeeds, speedId];
      setSelectedSpeeds(newSpeeds);
      if (userLocation && !isNavigating) {
        loadStations(
          userLocation.latitude,
          userLocation.longitude,
          radius,
          selectedConnectors,
          newSpeeds
        );
      }
    },
    [selectedSpeeds, userLocation, isNavigating, radius, selectedConnectors, loadStations]
  );

  // Handle search input change
  const handleSearchChange = useCallback(
    async (text) => {
      setSearchQuery(text);
      if (text.length < 2) {
        setAutocompleteResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const result = await getPlaceAutocomplete(text, sessionToken);
        if (result.predictions) {
          setAutocompleteResults(result.predictions);
        }
      } catch (error) {
        console.error('Autocomplete error:', error);
      } finally {
        setIsSearching(false);
      }
    },
    [sessionToken]
  );

  // Handle direct search (enter key)
  const handleSearch = useCallback(
    async (query) => {
      if (!query || query.length < 2) return;

      setIsSearching(true);
      setAutocompleteResults([]);
      try {
        const result = await geocodeAddress(query);
        if (result.results && result.results.length > 0) {
          const location = result.results[0].geometry.location;
          const destCoord = {
            latitude: location.lat,
            longitude: location.lng,
          };
          startNavigation(destCoord, result.results[0].formatted_address);
        } else {
          Alert.alert('Not Found', 'Could not find the specified location.');
        }
      } catch (error) {
        console.error('Search error:', error);
        Alert.alert('Error', 'Failed to search for location.');
      } finally {
        setIsSearching(false);
      }
    },
    [userLocation]
  );

  // Handle place selection from autocomplete
  const handleSelectPlace = useCallback(
    async (place) => {
      setIsSearching(true);
      setAutocompleteResults([]);
      setSearchQuery(place.description || '');

      try {
        const details = await getPlaceDetails(place.place_id, sessionToken);
        if (details.result && details.result.geometry) {
          const location = details.result.geometry.location;
          const destCoord = {
            latitude: location.lat,
            longitude: location.lng,
          };
          startNavigation(destCoord, details.result.formatted_address || place.description);
          // Generate new session token for next search
          setSessionToken(Date.now().toString());
        }
      } catch (error) {
        console.error('Place details error:', error);
        Alert.alert('Error', 'Failed to get location details.');
      } finally {
        setIsSearching(false);
      }
    },
    [sessionToken, userLocation]
  );

  // Handle map press - navigate to that location
  const handleMapPress = useCallback(
    (event) => {
      if (isNavigating) return;

      const { coordinate } = event.nativeEvent;
      if (coordinate) {
        Alert.alert(
          'Navigate Here?',
          'Would you like to navigate to this location?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Navigate',
              onPress: () => startNavigation(coordinate, 'Selected Location'),
            },
          ]
        );
      }
    },
    [isNavigating, userLocation]
  );

  // Start navigation to a destination
  const startNavigation = useCallback(
    async (destCoord, destName) => {
      if (!userLocation) {
        Alert.alert('Error', 'Could not determine your current location.');
        return;
      }

      setIsLoading(true);
      try {
        const directionsResult = await getDirections(userLocation, destCoord);

        if (directionsResult.routes && directionsResult.routes.length > 0) {
          const route = directionsResult.routes[0];
          const leg = route.legs[0];

          // Decode the polyline
          const routePoints = decodePolyline(route.overview_polyline.points);
          setRouteCoordinates(routePoints);

          // Parse steps
          const steps = leg.steps.map((step) => ({
            instruction: step.html_instructions,
            distance: step.distance.text,
            duration: step.duration.text,
            maneuver: step.maneuver || '',
          }));

          setNavigationInfo({
            distance: leg.distance.text,
            duration: leg.duration.text,
            destination: destName,
            steps,
          });

          setDestination(destCoord);
          setIsNavigating(true);
          setCurrentStep(0);
          setSelectedStation(null);
          setIsPanelExpanded(true);

          // Fit map to show entire route
          mapRef.current?.fitToCoordinates(routePoints, {
            edgePadding: { top: 150, right: 50, bottom: 200, left: 50 },
            animated: true,
          });

          // Fetch stations along the route
          await fetchStationsAlongRoute(routePoints);
        } else {
          Alert.alert('Error', 'Could not find a route to the destination.');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        Alert.alert('Error', 'Failed to calculate route.');
      } finally {
        setIsLoading(false);
      }
    },
    [userLocation, radius, selectedConnectors, selectedSpeeds]
  );

  // Fetch stations along the route
  const fetchStationsAlongRoute = useCallback(
    async (routePoints) => {
      const queryPoints = getPointsAlongRoute(routePoints, ROUTE_FETCH_INTERVAL_KM);
      const allStations = [];
      const seenIds = new Set();

      for (const point of queryPoints) {
        try {
          const stationsAtPoint = await fetchChargingStations(
            point.latitude,
            point.longitude,
            radius,
            selectedConnectors,
            selectedSpeeds
          );

          for (const station of stationsAtPoint) {
            if (!seenIds.has(station.id)) {
              seenIds.add(station.id);
              allStations.push(station);
            }
          }
        } catch (error) {
          console.error('Error fetching stations at point:', error);
        }
      }

      setStations(allStations);
    },
    [radius, selectedConnectors, selectedSpeeds]
  );

  // Navigate to station from card
  const handleNavigateToStation = useCallback(
    (station) => {
      const destCoord = {
        latitude: station.lat,
        longitude: station.lng,
      };
      startNavigation(destCoord, station.name);
    },
    [startNavigation]
  );

  // Cancel navigation
  const handleCancelNavigation = useCallback(() => {
    setIsNavigating(false);
    setRouteCoordinates([]);
    setNavigationInfo(null);
    setDestination(null);
    setCurrentStep(0);
    setSearchQuery('');

    // Reload stations at user's location
    if (userLocation) {
      loadStations(userLocation.latitude, userLocation.longitude, radius);
      mapRef.current?.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    }
  }, [userLocation, radius, loadStations]);

  // Go to my location
  const handleMyLocation = useCallback(async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(newLocation);

      mapRef.current?.animateToRegion({
        ...newLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      if (!isNavigating) {
        loadStations(newLocation.latitude, newLocation.longitude, radius);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Could not get your current location.');
    }
  }, [isNavigating, radius, loadStations]);

  // Handle station marker press
  const handleStationPress = useCallback((station) => {
    setSelectedStation(station);
    setIsPanelExpanded(false);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={handleMapPress}
      >
        {/* Charging station markers */}
        {stations.map((station) => (
          <CustomMarker
            key={station.id}
            station={station}
            onPress={handleStationPress}
          />
        ))}

        {/* Route polyline */}
        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor="#3B82F6"
            strokeWidth={5}
            lineDashPattern={[0]}
          />
        )}

        {/* Destination marker */}
        {destination && (
          <Marker
            coordinate={destination}
            pinColor="#10B981"
            title="Destination"
          />
        )}
      </MapView>

      {/* Filter Panel */}
      <FilterPanel
        isExpanded={isPanelExpanded}
        onToggle={() => setIsPanelExpanded(!isPanelExpanded)}
        radius={radius}
        onRadiusChange={handleRadiusChange}
        selectedConnectors={selectedConnectors}
        onConnectorToggle={handleConnectorToggle}
        selectedSpeeds={selectedSpeeds}
        onSpeedToggle={handleSpeedToggle}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSearch={handleSearch}
        autocompleteResults={autocompleteResults}
        onSelectPlace={handleSelectPlace}
        isSearching={isSearching}
        onMyLocation={handleMyLocation}
        isNavigating={isNavigating}
        navigationInfo={navigationInfo}
        onCancelNavigation={handleCancelNavigation}
        currentStep={currentStep}
        onNextStep={() => setCurrentStep((prev) => Math.min(prev + 1, (navigationInfo?.steps?.length || 1) - 1))}
        onPrevStep={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
      />

      {/* Station Card */}
      {selectedStation && !isPanelExpanded && (
        <View style={styles.stationCardContainer}>
          <StationCard
            station={selectedStation}
            onNavigate={() => handleNavigateToStation(selectedStation)}
            onClose={() => setSelectedStation(null)}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  map: {
    flex: 1,
  },
  stationCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
