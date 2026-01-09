# EV Charging Station Finder

A React Native mobile app built with Expo 54 that helps users find EV charging stations and navigate to them using Google Maps.

## Features

- **Google Maps Integration**: Full-featured map display with custom markers for charging stations
- **Location-based Search**: Find charging stations near your current location
- **Filters**:
  - Radius slider (1-50 km)
  - Connector types (Type 2, CCS, CHAdeMO, Tesla)
  - Charging speeds (AC, DC Slow, DC Fast)
- **Navigation**:
  - Route tracing from current location to destination
  - Time and distance display
  - Step-by-step route guidance
  - Navigate by typing address, selecting from autocomplete, or tapping on map
- **Station Cards**: Display station details including:
  - Charging speed and power
  - Availability (available/total chargers)
  - Connector types
  - Multiple operators sorted by price (best first)
  - Operator pricing details (per kWh, per minute, connection fees)
- **Custom Markers**: 
  - Blue for AC charging
  - Dark purple for DC Slow
  - Light purple for DC Fast
- **Route Station Discovery**: When navigating, finds charging stations every 10 km along the route

## Setup

1. Install dependencies:
```bash
cd ev-charging-finder
npm install
```

2. Start the development server:
```bash
npx expo start
```

3. Run on device:
   - Scan QR code with Expo Go app (Android/iOS)
   - Press `a` for Android emulator
   - Press `i` for iOS simulator (macOS only)

## Project Structure

```
ev-charging-finder/
├── App.js                          # Main application component
├── app.json                        # Expo configuration
├── src/
│   ├── components/
│   │   ├── CustomMarker.js         # Custom map marker component
│   │   ├── FilterPanel.js          # Filters and navigation panel
│   │   └── StationCard.js          # Station detail card
│   ├── constants/
│   │   └── index.js                # App constants and configuration
│   └── services/
│       └── api.js                  # API services and utilities
```

## API Integration

The app connects to a backend API at `https://8c99cab9643b.ngrok-free.app/api` for charging station data. The API accepts the following parameters:

- `lat`: Latitude
- `lng`: Longitude  
- `radius`: Search radius in km
- `connectorTypes`: Comma-separated list (Type 2, CCS, CHAdeMO, Tesla)
- `chargingSpeeds`: Comma-separated list (AC, DC Slow, DC Fast)

## Google Maps API

The app uses the following Google Maps APIs:
- Maps SDK for Android/iOS
- Directions API
- Places API (Autocomplete)
- Geocoding API

API Key is configured in `app.json` for both iOS and Android platforms.

## Requirements

- Node.js 16+
- Expo CLI
- Expo Go app on mobile device (for testing)
- Google Maps API key with enabled APIs

## Lombardy Region

The app is pre-configured to work with charging stations in the Lombardy region of Italy. The default location is set to Milan (45.4642, 9.1900).
