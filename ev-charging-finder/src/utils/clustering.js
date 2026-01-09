// Clustering utility for map markers

// Calculate pixel distance between two coordinates at a given zoom level
export const getPixelDistance = (coord1, coord2, region) => {
  // Approximate pixel calculation based on region delta
  const latDelta = region.latitudeDelta;
  const lngDelta = region.longitudeDelta;
  
  // Assume a typical screen width of ~400 points
  const screenWidth = 400;
  const screenHeight = 800;
  
  const latPixelsPerDegree = screenHeight / latDelta;
  const lngPixelsPerDegree = screenWidth / lngDelta;
  
  const latDiff = Math.abs(coord1.latitude - coord2.latitude);
  const lngDiff = Math.abs(coord1.longitude - coord2.longitude);
  
  const pixelDistLat = latDiff * latPixelsPerDegree;
  const pixelDistLng = lngDiff * lngPixelsPerDegree;
  
  return Math.sqrt(pixelDistLat * pixelDistLat + pixelDistLng * pixelDistLng);
};

// Generate a stable hash for cluster identification
const generateClusterHash = (stationIds, count) => {
  const sortedIds = [...stationIds].sort();
  return `c_${sortedIds.join('_')}_n${count}`;
};

// Cluster stations that are too close together
export const clusterStations = (stations, region, minPixelDistance = 40) => {
  if (!stations || stations.length === 0) return [];
  
  // If no region, return individual stations as single-item clusters
  if (!region) {
    return stations.map(s => ({
      id: `single_${s.id}`,
      coordinate: { latitude: s.lat, longitude: s.lng },
      stations: [s],
      count: 1,
    }));
  }

  const clusters = [];
  const processed = new Set();

  // Sort stations by ID for consistent ordering
  const sortedStations = [...stations].sort((a, b) => String(a.id).localeCompare(String(b.id)));

  for (let i = 0; i < sortedStations.length; i++) {
    const station = sortedStations[i];
    
    if (processed.has(station.id)) continue;

    const clusterStationsList = [station];
    const clusterStationIds = [station.id];
    processed.add(station.id);

    // Find nearby stations to add to this cluster
    for (let j = i + 1; j < sortedStations.length; j++) {
      const otherStation = sortedStations[j];
      
      if (processed.has(otherStation.id)) continue;

      // Check distance from cluster center (first station for simplicity)
      const coord1 = { latitude: station.lat, longitude: station.lng };
      const coord2 = { latitude: otherStation.lat, longitude: otherStation.lng };

      const pixelDistance = getPixelDistance(coord1, coord2, region);

      if (pixelDistance < minPixelDistance) {
        clusterStationsList.push(otherStation);
        clusterStationIds.push(otherStation.id);
        processed.add(otherStation.id);
      }
    }

    // Calculate cluster center as average of all stations
    const totalLat = clusterStationsList.reduce((sum, s) => sum + s.lat, 0);
    const totalLng = clusterStationsList.reduce((sum, s) => sum + s.lng, 0);
    const coordinate = {
      latitude: totalLat / clusterStationsList.length,
      longitude: totalLng / clusterStationsList.length,
    };

    // Generate stable cluster ID based on contained stations
    const clusterId = generateClusterHash(clusterStationIds, clusterStationsList.length);

    clusters.push({
      id: clusterId,
      coordinate,
      stations: clusterStationsList,
      count: clusterStationsList.length,
    });
  }

  return clusters;
};
