import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard.jsx';
import { Instrument } from './pages/Instrument.jsx';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/instrument/:market/:board/:symbol" element={<Instrument />} />
      </Routes>
    </BrowserRouter>
  );
}
