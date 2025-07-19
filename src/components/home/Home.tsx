"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const handleRiderClick = () => {
    navigate('/riders');
  };

  const handleDriverClick = () => {
    navigate('/drivers');
  };

  return (
    <div>
      <h1>MCC Carpools Website</h1>
      <button onClick={handleRiderClick}>I am a Rider</button>
      <button onClick={handleDriverClick} style={{ marginLeft: '10px' }}>I am a Driver</button>
    </div>
  );
};

export default Home; 