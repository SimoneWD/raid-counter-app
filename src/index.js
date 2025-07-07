import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importa i tuoi stili globali, inclusi quelli di Tailwind
import App from './App'; // Importa il componente principale dell'applicazione

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App /> {/* Renderizza il componente App */}
  </React.StrictMode>
);
