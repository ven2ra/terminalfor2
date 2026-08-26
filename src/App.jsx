import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard.jsx';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* The instrument detail page was folded into the trading workspace —
            redirect any old bookmarked/shared link there instead of 404ing. */}
        <Route path="/instrument/*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
