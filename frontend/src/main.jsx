// main.jsx - Punto de entrada de la aplicación
import React from 'react';
import ReactDOM from 'react-dom/client';
import './principal.css';
import Principal from './Principal.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Principal />
  </React.StrictMode>
);