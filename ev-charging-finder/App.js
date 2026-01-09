import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';

import CustomMarker from './src/components/CustomMarker';
import ClusterMarker from './src/components/ClusterMarker';
import StationCard from './src/components/StationCard';
import LocationCard from './src/components/LocationCard';
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
import { clusterStations } from './src/utils/clustering';
import { DEFAULT_LOCATION, ROUTE_FETCH_INTERVAL_KM } from './src/constants';

export default function App() {
  const mapRef = useRef(null);
  const [region, setRegion] = useState(DEFAULT_LOCATION);
  const [userLocation, setUserLocation] = useState(null);
  const [stations, setStations] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
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

  // Re-cluster when stations or region changes
  useEffect(() => {
    const clustered = clusterStations(stations, region, 45);
    setClusters(clustered);
  }, [stations, region]);

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

  // Handle region change (for re-clustering)
  const handleRegionChangeComplete = useCallback((newRegion) => {
    setRegion(newRegion);
  }, []);

  // Handle radius change
  const handleRadiusChange = useCallback(
    (newRadius) => {
      setRadius(newRadius);
      if (isNavigating && routeCoordinates.length > 0) {
        // Re-fetch stations along route with new radius
        fetchStationsAlongRoute(routeCoordinates, newRadius, selectedConnectors, selectedSpeeds);
      } else {
        const centerLocation = selectedLocation || userLocation;
        if (centerLocation) {
          loadStations(centerLocation.latitude, centerLocation.longitude, newRadius);
        }
      }
    },
    [userLocation, selectedLocation, isNavigating, routeCoordinates, selectedConnectors, selectedSpeeds, loadStations]
  );

  // Handle connector toggle
  const handleConnectorToggle = useCallback(
    (connectorId) => {
      const newConnectors = selectedConnectors.includes(connectorId)
        ? selectedConnectors.filter((c) => c !== connectorId)
        : [...selectedConnectors, connectorId];
      setSelectedConnectors(newConnectors);
      if (isNavigating && routeCoordinates.length > 0) {
        // Re-fetch stations along route with new connectors
        fetchStationsAlongRoute(routeCoordinates, radius, newConnectors, selectedSpeeds);
      } else {
        const centerLocation = selectedLocation || userLocation;
        if (centerLocation) {
          loadStations(centerLocation.latitude, centerLocation.longitude, radius, newConnectors);
        }
      }
    },
    [selectedConnectors, userLocation, selectedLocation, isNavigating, routeCoordinates, radius, selectedSpeeds, loadStations]
  );

  // Handle speed toggle
  const handleSpeedToggle = useCallback(
    (speedId) => {
      const newSpeeds = selectedSpeeds.includes(speedId)
        ? selectedSpeeds.filter((s) => s !== speedId)
        : [...selectedSpeeds, speedId];
      setSelectedSpeeds(newSpeeds);
      if (isNavigating && routeCoordinates.length > 0) {
        // Re-fetch stations along route with new speeds
        fetchStationsAlongRoute(routeCoordinates, radius, selectedConnectors, newSpeeds);
      } else {
        const centerLocation = selectedLocation || userLocation;
        if (centerLocation) {
          loadStations(
            centerLocation.latitude,
            centerLocation.longitude,
            radius,
            selectedConnectors,
            newSpeeds
          );
        }
      }
    },
    [selectedSpeeds, userLocation, selectedLocation, isNavigating, routeCoordinates, radius, selectedConnectors, loadStations]
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

  // Handle direct search (enter key) - show location popup instead of navigating directly
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
          
          // Set selected location to show LocationCard with navigate button
          setSelectedStation(null);
          setIsPanelExpanded(false);
          setSelectedLocation({
            latitude: destCoord.latitude,
            longitude: destCoord.longitude,
            name: result.results[0].formatted_address?.split(',')[0] || query,
            address: result.results[0].formatted_address,
          });

          // Load stations centered on the selected location
          loadStations(destCoord.latitude, destCoord.longitude, radius);

          // Animate map to the location
          mapRef.current?.animateToRegion({
            ...destCoord,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
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
    [radius, loadStations]
  );

  // Handle place selection from autocomplete - show location popup instead of navigating directly
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
          
          // Set selected location to show LocationCard with navigate button
          setSelectedStation(null);
          setIsPanelExpanded(false);
          setSelectedLocation({
            latitude: destCoord.latitude,
            longitude: destCoord.longitude,
            name: details.result.name || place.structured_formatting?.main_text || place.description?.split(',')[0],
            address: details.result.formatted_address || place.description,
          });

          // Load stations centered on the selected location
          loadStations(destCoord.latitude, destCoord.longitude, radius);

          // Animate map to the location
          mapRef.current?.animateToRegion({
            ...destCoord,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });

          setSessionToken(Date.now().toString());
        }
      } catch (error) {
        console.error('Place details error:', error);
        Alert.alert('Error', 'Failed to get location details.');
      } finally {
        setIsSearching(false);
      }
    },
    [sessionToken, radius, loadStations]
  );

  // Handle map press - select location and show card
  const handleMapPress = useCallback(
    async (event) => {
      if (isNavigating) return;

      const { coordinate } = event.nativeEvent;
      if (coordinate) {
        // Clear any selected station
        setSelectedStation(null);
        setIsPanelExpanded(false);

        // Set the selected location immediately with coordinates
        const newLocation = {
          latitude: coordinate.latitude,
          longitude: coordinate.longitude,
          name: 'Loading...',
          address: null,
        };
        setSelectedLocation(newLocation);

        // Load stations centered on the selected location
        loadStations(coordinate.latitude, coordinate.longitude, radius);

        // Reverse geocode to get address
        try {
          const response = await geocodeAddress(`${coordinate.latitude},${coordinate.longitude}`);
          if (response.results && response.results.length > 0) {
            const result = response.results[0];
            setSelectedLocation({
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
              name: result.formatted_address?.split(',')[0] || 'Selected Location',
              address: result.formatted_address,
            });
          } else {
            setSelectedLocation({
              ...newLocation,
              name: 'Selected Location',
            });
          }
        } catch (error) {
          console.error('Reverse geocode error:', error);
          setSelectedLocation({
            ...newLocation,
            name: 'Selected Location',
          });
        }

        // Animate map to center on the selected location
        mapRef.current?.animateToRegion({
          ...coordinate,
          latitudeDelta: region.latitudeDelta,
          longitudeDelta: region.longitudeDelta,
        });
      }
    },
    [isNavigating, radius, region, loadStations]
  );

  // Start navigation to a destination
  const startNavigation = useCallback(
    async (destCoord, destName) => {
      if (!userLocation) {
        Alert.alert('Error', 'Could not determine your current location.');
        return;
      }

      setIsLoading(true);
      setSelectedLocation(null);
      setSelectedStation(null);

      try {
        const directionsResult = await getDirections(userLocation, destCoord);

        if (directionsResult.routes && directionsResult.routes.length > 0) {
          const route = directionsResult.routes[0];
          const leg = route.legs[0];

          const routePoints = decodePolyline(route.overview_polyline.points);
          setRouteCoordinates(routePoints);

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
          setIsPanelExpanded(true);

          mapRef.current?.fitToCoordinates(routePoints, {
            edgePadding: { top: 150, right: 50, bottom: 200, left: 50 },
            animated: true,
          });

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
    async (routePoints, searchRadius = radius, connectors = selectedConnectors, speeds = selectedSpeeds) => {
      const queryPoints = getPointsAlongRoute(routePoints, ROUTE_FETCH_INTERVAL_KM);
      const allStations = [];
      const seenIds = new Set();

      for (const point of queryPoints) {
        try {
          const stationsAtPoint = await fetchChargingStations(
            point.latitude,
            point.longitude,
            searchRadius,
            connectors,
            speeds
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

  // Navigate to selected location from card
  const handleNavigateToLocation = useCallback(() => {
    if (selectedLocation) {
      startNavigation(
        { latitude: selectedLocation.latitude, longitude: selectedLocation.longitude },
        selectedLocation.name || 'Selected Location'
      );
    }
  }, [selectedLocation, startNavigation]);

  // Cancel navigation
  const handleCancelNavigation = useCallback(() => {
    setIsNavigating(false);
    setRouteCoordinates([]);
    setNavigationInfo(null);
    setDestination(null);
    setCurrentStep(0);
    setSearchQuery('');
    setSelectedLocation(null);

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
      setSelectedLocation(null);

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
    setSelectedLocation(null);
    setSelectedStation(station);
    setIsPanelExpanded(false);
  }, []);

  // Handle cluster press - zoom in or show first station if single
  const handleClusterPress = useCallback((cluster) => {
    if (cluster.count === 1) {
      handleStationPress(cluster.stations[0]);
    } else {
      // Zoom in to show individual markers
      const latitudes = cluster.stations.map(s => s.lat);
      const longitudes = cluster.stations.map(s => s.lng);
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);

      mapRef.current?.animateToRegion({
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
        longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.01),
      });
    }
  }, [handleStationPress]);

  // Close any card
  const handleCloseCard = useCallback(() => {
    setSelectedStation(null);
    setSelectedLocation(null);
  }, []);

  // Determine which card to show - station card takes priority and should show station info
  const showStationCard = selectedStation !== null;
  const showLocationCard = selectedLocation && !selectedStation && !isNavigating;

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
        onRegionChangeComplete={handleRegionChangeComplete}
      >
        {/* Clustered charging station markers */}
        {clusters.map((cluster) => (
          <ClusterMarker
            key={cluster.id}
            cluster={cluster}
            onPress={handleClusterPress}
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

        {/* Selected location marker (when not navigating) */}
        {selectedLocation && !isNavigating && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            pinColor="#EF4444"
          />
        )}
      </MapView>

      {/* Filter Panel - only show when no card is visible or when navigating */}
      {(!showStationCard && !showLocationCard) || isNavigating ? (
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
      ) : null}

      {/* Station Card - anchored to bottom, shows full station info */}
      {showStationCard && (
        <View style={styles.bottomCardContainer}>
          <StationCard
            station={selectedStation}
            onNavigate={() => handleNavigateToStation(selectedStation)}
            onClose={handleCloseCard}
          />
        </View>
      )}

      {/* Location Card - anchored to bottom */}
      {showLocationCard && (
        <View style={styles.bottomCardContainer}>
          <LocationCard
            location={selectedLocation}
            onNavigate={handleNavigateToLocation}
            onClose={handleCloseCard}
            isLoading={isLoading}
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
  bottomCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    elevation: 100,
  },
});
