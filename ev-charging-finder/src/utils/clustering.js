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

// Cluster stations that are too close together
export const clusterStations = (stations, region, minPixelDistance = 40) => {
  if (!stations || stations.length === 0) return [];
  if (!region) return stations.map(s => ({
    id: `cluster-${s.id}-1`,
    coordinate: { latitude: s.lat, longitude: s.lng },
    stations: [s],
    count: 1,
  }));

  const clusters = [];
  const processed = new Set();

  for (let i = 0; i < stations.length; i++) {
    if (processed.has(stations[i].id)) continue;

    const station = stations[i];
    const clusterStations = [station];

    processed.add(station.id);

    // Find nearby stations to add to this cluster
    for (let j = i + 1; j < stations.length; j++) {
      if (processed.has(stations[j].id)) continue;

      const otherStation = stations[j];
      const coord1 = { latitude: station.lat, longitude: station.lng };
      const coord2 = { latitude: otherStation.lat, longitude: otherStation.lng };

      const pixelDistance = getPixelDistance(coord1, coord2, region);

      if (pixelDistance < minPixelDistance) {
        clusterStations.push(otherStation);
        processed.add(otherStation.id);
      }
    }

    // Calculate cluster center as average of all stations
    const totalLat = clusterStations.reduce((sum, s) => sum + s.lat, 0);
    const totalLng = clusterStations.reduce((sum, s) => sum + s.lng, 0);
    const coordinate = {
      latitude: totalLat / clusterStations.length,
      longitude: totalLng / clusterStations.length,
    };

    // Generate unique ID that includes count and all station IDs to force re-render when cluster changes
    const stationIds = clusterStations.map(s => s.id).sort().join('-');
    const clusterId = `cluster-${stationIds}-${clusterStations.length}`;

    clusters.push({
      id: clusterId,
      coordinate,
      stations: clusterStations,
      count: clusterStations.length,
    });
  }

  return clusters;
};
