import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  // A production worker can outlive a preview session and cache Vite's changing modules.
  void navigator.serviceWorker.getRegistrations().then(async (registrations) => {
    const scope = new URL(import.meta.env.BASE_URL, window.location.origin).href;
    const appWorkers = registrations.filter((registration) => registration.scope === scope);
    await Promise.all(appWorkers.map((registration) => registration.unregister()));
    if (appWorkers.length && navigator.serviceWorker.controller) window.location.reload();
  }).catch((error) => console.error('Development service worker cleanup failed', error));
} else if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch((error) => {
      console.error('Service worker registration failed', error);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
