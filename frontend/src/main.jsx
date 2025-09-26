// index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Principal from '../Principal.jsx';  // Cambia esta línea

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Principal />  {/* Cambia App por Principal */}
  </React.StrictMode>
);