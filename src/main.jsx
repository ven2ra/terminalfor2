import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import './theme.js'; // applies the saved data-theme attribute before first paint

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
