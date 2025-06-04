import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TripPlanner from './components/TripPlanner';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <header className="app-header">
          <h1>Route Optimizer</h1>
        </header>
        <main>
          <TripPlanner />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
