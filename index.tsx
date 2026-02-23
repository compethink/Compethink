import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

/**
 * Robust process.env shim. 
 * We use a sequence of checks to ensure window.process, window.process.env 
 * and window.process.env.API_KEY are all defined before any other module executes.
 */
const win = window as any;
if (!win.process) {
  win.process = { env: {} };
} else if (!win.process.env) {
  win.process.env = {};
}

// Ensure API_KEY exists to avoid potential downstream "Missing initializer" 
// if some build-time replacement logic expects a valid object.
win.process.env.API_KEY = win.process.env.API_KEY || '';

import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);