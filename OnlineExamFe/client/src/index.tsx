/**
 * Entry point for the React application.
 *
 * This file bootstraps the application by rendering the root component
 * (`App`) into the DOM.  It also wraps the app in `StrictMode` to enable
 * additional runtime checks and warnings in development.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './i18n/i18n';   // ✅ khởi tạo i18next

// Import global CSS including Tailwind directives.  This file
// includes `@tailwind base`, `@tailwind components` and
// `@tailwind utilities` to enable Tailwind in the application.
import './index.css';

// Locate the root container in the HTML document
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found. Ensure that the index.html contains a div with id="root".');
}

// Create a root and render the application
const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    {/* BrowserRouter provides routing context to the application. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);