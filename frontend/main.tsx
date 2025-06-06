// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './index.css';  // your global CSS including tailwind or other styles

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
