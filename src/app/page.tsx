import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Home from '../components/home';
import Riders from '../components/riders';
import Drivers from '../components/drivers';

const App: React.FC = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/riders" element={<Riders />} />
          <Route path="/drivers" element={<Drivers />} />
        </Routes>
      </Router>
    </LocalizationProvider>
  );
};

export default App;
