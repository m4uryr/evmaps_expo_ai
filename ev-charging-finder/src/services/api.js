import axios from 'axios';
import { API_BASE_URL, GOOGLE_MAPS_API_KEY } from '../constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// Fetch charging stations from the API
export const fetchChargingStations = async (lat, lng, radius, connectorTypes = [], chargingSpeeds = []) => {
  try {
    const params = {
      lat,
      lng,
      radius,
    };

    if (connectorTypes.length > 0) {
      params.connectorTypes = connectorTypes.join(',');
    }

    if (chargingSpeeds.length > 0) {
      params.chargingSpeeds = chargingSpeeds.join(',');
    }

    const response = await apiClient.get('/charging-stations', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching charging stations:', error);
    throw error;
  }
};

// Google Maps Directions API
export const getDirections = async (origin, destination) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/directions/json`,
      {
        params: {
          origin: `${origin.latitude},${origin.longitude}`,
          destination: `${destination.latitude},${destination.longitude}`,
          key: GOOGLE_MAPS_API_KEY,
          mode: 'driving',
          alternatives: false,
          language: 'en',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching directions:', error);
    throw error;
  }
};

// Google Places Autocomplete
export const getPlaceAutocomplete = async (input, sessionToken) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json`,
      {
        params: {
          input,
          key: GOOGLE_MAPS_API_KEY,
          sessiontoken: sessionToken,
          types: 'geocode|establishment',
          components: 'country:it',
          language: 'en',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching autocomplete:', error);
    throw error;
  }
};

// Google Places Details (to get lat/lng from place_id)
export const getPlaceDetails = async (placeId, sessionToken) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json`,
      {
        params: {
          place_id: placeId,
          key: GOOGLE_MAPS_API_KEY,
          sessiontoken: sessionToken,
          fields: 'geometry,formatted_address,name',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching place details:', error);
    throw error;
  }
};

// Geocode address to coordinates
export const geocodeAddress = async (address) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json`,
      {
        params: {
          address,
          key: GOOGLE_MAPS_API_KEY,
          region: 'it',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error geocoding address:', error);
    throw error;
  }
};

// Decode polyline from directions response
export const decodePolyline = (encoded) => {
  const points = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
};

// Calculate distance between two points (Haversine formula)
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Get points along route for charging station queries
export const getPointsAlongRoute = (routePoints, intervalKm) => {
  const points = [];
  let accumulatedDistance = 0;
  let lastPoint = routePoints[0];

  points.push(lastPoint);

  for (let i = 1; i < routePoints.length; i++) {
    const currentPoint = routePoints[i];
    const segmentDistance = calculateDistance(
      lastPoint.latitude,
      lastPoint.longitude,
      currentPoint.latitude,
      currentPoint.longitude
    );

    accumulatedDistance += segmentDistance;

    if (accumulatedDistance >= intervalKm) {
      points.push(currentPoint);
      accumulatedDistance = 0;
    }

    lastPoint = currentPoint;
  }

  // Always include the destination
  const lastRoutePoint = routePoints[routePoints.length - 1];
  if (points[points.length - 1] !== lastRoutePoint) {
    points.push(lastRoutePoint);
  }

  return points;
};
