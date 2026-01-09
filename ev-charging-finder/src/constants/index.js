// API Configuration
export const API_BASE_URL = 'https://8c99cab9643b.ngrok-free.app/api';
export const GOOGLE_MAPS_API_KEY = 'AIzaSyCQt4cOfDNzShGdTMqZmR4HBZya00Fu_Hs';

// Default location (Milan, Italy - center of Lombardy)
export const DEFAULT_LOCATION = {
  latitude: 45.4642,
  longitude: 9.1900,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Lombardy region bounds
export const LOMBARDY_BOUNDS = {
  north: 46.6350,
  south: 44.6800,
  east: 11.4300,
  west: 8.4900,
};

// Filter options
export const CONNECTOR_TYPES = [
  { id: 'Type 2', label: 'Type 2', icon: 'plug' },
  { id: 'CCS', label: 'CCS', icon: 'flash' },
  { id: 'CHAdeMO', label: 'CHAdeMO', icon: 'flash-outline' },
  { id: 'Tesla', label: 'Tesla', icon: 'car-electric' },
];

export const CHARGING_SPEEDS = [
  { id: 'AC', label: 'AC', color: '#3B82F6', description: 'Standard charging' },
  { id: 'DC Slow', label: 'DC Slow', color: '#7C3AED', description: 'Medium speed' },
  { id: 'DC Fast', label: 'DC Fast', color: '#A855F7', description: 'Fast charging' },
];

// Pin colors based on charging speed
export const PIN_COLORS = {
  'AC': '#3B82F6',        // Blue
  'DC Slow': '#5B21B6',   // Dark purple
  'DC Fast': '#A855F7',   // Light purple
};

// Navigation constants
export const ROUTE_FETCH_INTERVAL_KM = 10; // Fetch stations every 10 km along route
