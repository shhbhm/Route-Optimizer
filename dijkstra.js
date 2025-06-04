export function findShortestPath(graph, startNode) {
  const vertices = Object.keys(graph);
  const path = [];
  const visited = new Set();
  let totalDistance = 0;
  let current = startNode;

  // Start with the given city
  path.push(current);
  visited.add(current);

  // Find path through remaining cities using nearest neighbor approach
  while (visited.size < vertices.length) {
    let nearestCity = null;
    let shortestDistance = Infinity;

    // Find the nearest unvisited city from current position
    vertices.forEach(vertex => {
      if (!visited.has(vertex)) {
        const distance = graph[current][vertex];
        if (distance < shortestDistance) {
          shortestDistance = graph[current][vertex];
          nearestCity = vertex;
        }
      }
    });

    if (nearestCity === null) break;

    // Add the nearest city to our path
    path.push(nearestCity);
    visited.add(nearestCity);
    totalDistance += shortestDistance;
    current = nearestCity;
  }

  return {
    path: path,
    distance: totalDistance
  };
}

// Helper function to verify the path (for debugging)
function verifyPath(path, graph) {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const distance = graph[path[i]][path[i + 1]];
    console.log(`Distance from ${path[i]} to ${path[i + 1]}: ${distance}`);
    totalDistance += distance;
  }
  console.log(`Total distance: ${totalDistance}`);
  return totalDistance;
}