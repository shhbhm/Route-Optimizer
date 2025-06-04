import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Box,
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  AppBar,
  Toolbar,
  CircularProgress
} from '@mui/material';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import RouteIcon from '@mui/icons-material/Route';
import PlaceIcon from '@mui/icons-material/Place';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Feature } from 'ol';
import { Point, LineString } from 'ol/geom';
import { Style, Stroke, Circle, Fill } from 'ol/style';
import { calculateDistanceMatrix, formatDistance } from '../utils/distanceMatrix';
import { findShortestPath } from '../utils/dijkstra';

const TripPlanner = () => {
  const [cities, setCities] = useState([]);
  const [newCity, setNewCity] = useState('');
  const [startingCity, setStartingCity] = useState('');
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef();
  const mapElement = useRef();
  const vectorLayerRef = useRef();

  useEffect(() => {
    // Initialize map
    const map = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat([78.9629, 20.5937]), // Center of India
        zoom: 5,
        extent: fromLonLat([68.7, 6]).concat(fromLonLat([97.25, 35.5])) // Limit view to India
      })
    });

    // Create vector layer for routes and markers
    const vectorLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        stroke: new Stroke({
          color: '#2196F3',
          width: 3
        }),
        image: new Circle({
          radius: 7,
          fill: new Fill({ color: '#2196F3' })
        })
      })
    });

    map.addLayer(vectorLayer);
    mapRef.current = map;
    vectorLayerRef.current = vectorLayer;

    return () => map.setTarget(undefined);
  }, []);

  // Update the getCoordinates function to include country filtering for India
  const getCoordinates = async (city) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(city)},India` + // Add India to search query
        `&format=json` +
        `&countrycodes=in` + // Limit results to India
        `&limit=1`
      );
      const data = await response.json();
      if (data.length === 0) throw new Error(`City not found: ${city}`);
      
      // Verify the result is within India's bounding box
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      
      // India's approximate bounding box
      if (lat < 6 || lat > 35.5 || lon < 68.7 || lon > 97.25) {
        throw new Error(`Location outside India: ${city}`);
      }
      
      return { lon, lat };
    } catch (error) {
      console.error('Error getting coordinates:', error);
      throw error;
    }
  };

  const calculateDistances = async (coordinates) => {
    const n = coordinates.length;
    const distances = Array(n).fill().map(() => Array(n).fill(Infinity));
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          try {
            const response = await fetch(
              `https://router.project-osrm.org/route/v1/driving/` +
              `${coordinates[i].lon},${coordinates[i].lat};${coordinates[j].lon},${coordinates[j].lat}`
            );
            const data = await response.json();
            if (data.routes && data.routes[0]) {
              distances[i][j] = data.routes[0].distance;
            }
          } catch (error) {
            console.error('Error calculating distance:', error);
          }
          // Add delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    return distances;
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    if (newCity.trim()) {
      try {
        await getCoordinates(newCity.trim());
        setCities([...cities, newCity.trim()]);
        setNewCity('');
        toast.success('City added successfully!');
      } catch (error) {
        toast.error('City not found. Please enter a valid Indian city.');
      }
    }
  };

  // Update the updateMap function to add better validation
  const updateMap = async (route) => {
    if (!vectorLayerRef.current) return;

    const source = vectorLayerRef.current.getSource();
    source.clear();

    const coordinates = [];
    const validCoordinates = [];

    for (const city of route) {
      try {
        const coord = await getCoordinates(city);
        const olCoord = fromLonLat([coord.lon, coord.lat]);
        
        // Validate coordinate transformation
        if (isNaN(olCoord[0]) || isNaN(olCoord[1])) {
          console.error(`Invalid coordinates for city: ${city}`);
          continue;
        }
        
        validCoordinates.push(olCoord);
        
        // Add marker with custom style
        const marker = new Feature({
          geometry: new Point(olCoord),
          name: city
        });
        
        marker.setStyle(new Style({
          image: new Circle({
            radius: 7,
            fill: new Fill({ color: '#e74c3c' }),
            stroke: new Stroke({
              color: '#ffffff',
              width: 2
            })
          })
        }));
        
        source.addFeature(marker);
      } catch (error) {
        console.error(`Error processing city ${city}:`, error);
      }
    }

    // Only create route line if we have valid coordinates
    if (validCoordinates.length > 1) {
      const routeLine = new Feature({
        geometry: new LineString(validCoordinates)
      });
      
      routeLine.setStyle(new Style({
        stroke: new Stroke({
          color: '#3498db',
          width: 3,
          lineDash: [1, 0]
        })
      }));
      
      source.addFeature(routeLine);
    }

    // Fit map to India's bounds if no valid coordinates
    if (validCoordinates.length === 0) {
      const indiaBounds = fromLonLat([78.9629, 20.5937]);
      mapRef.current.getView().setCenter(indiaBounds);
      mapRef.current.getView().setZoom(5);
    } else {
      mapRef.current.getView().fit(source.getExtent(), {
        padding: [50, 50, 50, 50],
        maxZoom: 12
      });
    }
  };

  // Update the handleOptimizeRoute function
  const handleOptimizeRoute = async () => {
    if (!startingCity || cities.length === 0) {
      toast.warning('Please enter starting city and at least one destination');
      return;
    }

    setLoading(true);
    try {
      const allCities = [startingCity, ...cities];
      
      // Show progress toast
      const loadingToast = toast.loading('Getting city coordinates...');

      // Get coordinates for all cities in parallel
      const coordinates = await Promise.all(
        allCities.map(city => getCoordinates(city))
      );

      // Update progress
      toast.update(loadingToast, { 
        render: 'Calculating distances...', 
        type: 'info' 
      });

      // Calculate distance matrix with parallel requests
      const distanceMatrix = await calculateDistanceMatrix(coordinates);

      // Update progress
      toast.update(loadingToast, { 
        render: 'Finding optimal route...', 
        type: 'info' 
      });

      // Use Dijkstra's algorithm to find shortest path
      const { path } = findShortestPath(distanceMatrix, '0');
      const optimizedCities = path.map(index => allCities[parseInt(index)]);

      // Calculate total distance
      let totalDistance = 0;
      for (let i = 0; i < path.length - 1; i++) {
        totalDistance += distanceMatrix[parseInt(path[i])][parseInt(path[i + 1])];
      }

      setOptimizedRoute(optimizedCities);
      await updateMap(optimizedCities);

      toast.update(loadingToast, {
        render: `Route optimized! Total distance: ${formatDistance(totalDistance)}`,
        type: 'success',
        isLoading: false,
        autoClose: 5000
      });

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error calculating route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" sx={{ backgroundColor: '#2c3e50' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Travel Path Optimizer
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚩 Starting Point
              </Typography>
              <TextField
                fullWidth
                value={startingCity}
                onChange={(e) => setStartingCity(e.target.value)}
                placeholder="Enter starting city"
                variant="outlined"
              />
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <div ref={mapElement} style={{ height: '500px' }}></div>
            </CardContent>
          </Card>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  📍 Add Destinations
                </Typography>
                <Box component="form" onSubmit={handleAddCity} sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    placeholder="Enter city name"
                    variant="outlined"
                    sx={{ mb: 2 }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddLocationIcon />}
                    fullWidth
                  >
                    Add City
                  </Button>
                </Box>
                
                {cities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography variant="subtitle1" gutterBottom>
                      Added Cities:
                    </Typography>
                    <List>
                      {cities.map((city, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <ListItem>
                            <ListItemText primary={city} />
                          </ListItem>
                        </motion.div>
                      ))}
                    </List>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                {cities.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Typography variant="h6" gutterBottom>
                      🎯 Optimize Route
                    </Typography>
                    <Button
                      onClick={handleOptimizeRoute}
                      disabled={loading}
                      variant="contained"
                      color="secondary"
                      startIcon={loading ? <CircularProgress size={20} /> : <RouteIcon />}
                      fullWidth
                    >
                      {loading ? 'Calculating...' : 'Find Best Route'}
                    </Button>

                    {optimizedRoute.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                          Best Route:
                        </Typography>
                        <List>
                          {optimizedRoute.map((city, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                            >
                              <ListItem>
                                <PlaceIcon sx={{ mr: 1 }} />
                                <ListItemText primary={`${index + 1}. ${city}`} />
                              </ListItem>
                            </motion.div>
                          ))}
                        </List>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </Box>
        </motion.div>
      </Container>
      <ToastContainer position="bottom-right" />
    </Box>
  );
};

const RouteOptimizer = () => {
  return (
    <div className="main-container">
      <Typography variant="h4" gutterBottom>
        Route Optimizer
      </Typography>
      <TripPlanner />
      <div className="city-input-section">
        <label htmlFor="city-input">Add Destinations</label>
        <input
          id="city-input"
          value={newCity}
          onChange={e => setNewCity(e.target.value)}
          placeholder="Enter city name"
        />
        <button onClick={handleAddCity}>Add City</button>
      </div>
      <div className="added-cities">
        <strong>Added Cities:</strong>
        <ul>
          {cities.map((city, idx) => (
            <li key={idx}>{city}</li>
          ))}
        </ul>
      </div>
      <Button
        variant="contained"
        color="primary"
        onClick={handleOptimizeRoute}
        disabled={loading}
      >
        Optimize Path
      </Button>
      {/* ...rest of your UI, such as map and results... */}
    </div>
  );
};

export default TripPlanner;