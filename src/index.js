import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import DeveloperStudioLayout from './DeveloperStudioLayout';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DeveloperStudioLayout />
  </React.StrictMode>
);

reportWebVitals();
