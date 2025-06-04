# Route Optimizer

Route Optimizer is a web application that helps users plan the most efficient travel route across multiple Indian cities. It leverages real road distances from the OSRM API and visualizes the optimized route on an interactive map using OpenLayers. The app is ideal for travelers and logistics planners who want to minimize travel distance and time.

---

## Features

- **Add Destinations:** Input a starting city and multiple destination cities within India.
- **Map Visualization:** See your optimized route and stops on an interactive OpenStreetMap.
- **Route Optimization:** Uses a nearest-neighbor algorithm to find a short path covering all cities.
- **Real Road Distances:** Fetches actual driving distances between cities using the OSRM API.
- **Responsive UI:** Built with React and Material-UI for a modern, user-friendly experience.
- **Instant Feedback:** Get notifications for errors, progress, and successful route optimization.

---

## Tech Stack

- **Frontend:** React, Material-UI, Framer Motion, OpenLayers, React Toastify
- **APIs:** 
  - [Nominatim](https://nominatim.openstreetmap.org/) for geocoding city names to coordinates
  - [OSRM](https://project-osrm.org/) for real road distance calculations
- **Map:** OpenStreetMap via OpenLayers

---

## How It Works

1. **User Input:** Enter a starting city and add destination cities.
2. **Geocoding:** The app uses Nominatim to convert city names to latitude/longitude.
3. **Distance Matrix:** It fetches pairwise driving distances between all cities from the OSRM API.
4. **Route Optimization:** Applies a nearest-neighbor heuristic to visit all cities efficiently.
5. **Visualization:** Displays the optimized route and stops on an interactive map.

---


![Screenshot 2025-06-04 123252](https://github.com/user-attachments/assets/1813dc1d-640c-4290-8fd1-348854847317)

![Screenshot 2025-06-04 123408](https://github.com/user-attachments/assets/b7110303-a881-41bf-9e90-d5552bdc99f8)


![Screenshot 2025-06-04 123528](https://github.com/user-attachments/assets/13fca9de-07ae-446d-a9fd-6a23d5ac34a5)

![Screenshot 2025-06-04 123554](https://github.com/user-attachments/assets/2fc9f531-b902-42d9-98aa-8e70fac68a3a)


## Getting Started
### Prerequisites

- Node.js and npm installed

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/route-optimizer.git
    cd route-optimizer/client
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm start
    ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
client/
  ├── public/
  ├── src/
  │   ├── components/
  │   │   └── TripPlanner.js
  │   ├── utils/
  │   │   ├── distanceMatrix.js
  │   │   └── dijkstra.js
  │   └── App.js
  └── package.json
```

---

## Key Files

- **TripPlanner.js:** Main React component for UI, state, and map logic.
- **distanceMatrix.js:** Utility for fetching and caching distances between cities.
- **dijkstra.js:** Implements the nearest-neighbor algorithm for route optimization.

---

## Example Usage

1. Enter your starting city (e.g., "Delhi").
2. Add destination cities (e.g., "Ahmedabad", "Surat", "Goa", "Ajmer", "Udaipur").
3. Click **Find Best Route**.
4. View the optimized route and step-by-step itinerary on the map.

---

## Limitations & Future Improvements

- The nearest-neighbor algorithm is fast but not always globally optimal for large numbers of cities.
- Currently supports only Indian cities.
- Future: Add user authentication, trip history, export options, and advanced TSP algorithms (2-opt, 3-opt).

---

## Interview/Technical Notes

- **Distance Calculation:** Uses OSRM API for real driving distances, not straight-line (Haversine) distances.
- **Geocoding:** Uses Nominatim API, filtered to India.
- **Optimization:** Nearest-neighbor heuristic, O(n²) time complexity.
- **API Efficiency:** Fetches distances in parallel and caches results.

---

## License

This project is for educational and demonstration purposes.

---

## Acknowledgements

- [OpenStreetMap](https://www.openstreetmap.org/)
- [OSRM Project](https://project-osrm.org/)
- [Nominatim](https://nominatim.openstreetmap.org/)
- [Material-UI](https://mui.com/)
- [OpenLayers](https://openlayers.org/)

---

**Made with ❤️ for efficient travel planning!**
