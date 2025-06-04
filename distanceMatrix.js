const distanceCache = new Map();

const getCacheKey = (city1, city2) => {
  // Create consistent cache key regardless of order
  return [city1, city2].sort().join('-');
};

const getDistanceFromAPI = async (city1, city2) => {
  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/` +
      `${city1.lon},${city1.lat};${city2.lon},${city2.lat}`
    );
    const data = await response.json();
    return data.routes[0].distance;
  } catch (error) {
    console.error('Error fetching distance:', error);
    return Infinity;
  }
};

const getDistance = async (city1, city2) => {
  const cacheKey = getCacheKey(city1, city2);
  
  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey);
  }

  const distance = await getDistanceFromAPI(city1, city2);
  distanceCache.set(cacheKey, distance);
  return distance;
};

export async function calculateDistanceMatrix(cities) {
  const n = cities.length;
  const matrix = Array(n).fill().map(() => Array(n).fill(0));
  const promises = [];

  // Generate all distance calculation promises
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      promises.push(
        getDistance(cities[i], cities[j]).then(distance => {
          matrix[i][j] = distance;
          matrix[j][i] = distance; // Distance is symmetric
        })
      );
    }
  }

  // Wait for all distances to be calculated
  await Promise.all(promises);
  return matrix;
}

// Helper function to format distances for display
export function formatDistance(meters) {
  return `${(meters / 1000).toFixed(1)} km`;
}