import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register Service Worker for PWA functionality (PRODUCTION ONLY)
// In development, service worker caching causes blank screens and stale content
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('WytNet SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('WytNet SW registration failed: ', registrationError);
      });
  });
}

// Clear service worker caches in development to prevent blank screen issues
if ('serviceWorker' in navigator && !import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    // Unregister any existing service workers
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
      console.log('Dev mode: Unregistered service worker');
    }
    
    // Clear all caches
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      await caches.delete(cacheName);
      console.log('Dev mode: Cleared cache:', cacheName);
    }
  });
}

// Install PWA prompt
let deferredPrompt: any;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  // Show install button or banner
  const installBanner = document.createElement('div');
  installBanner.innerHTML = `
    <div style="position: fixed; bottom: 20px; right: 20px; background: #3b82f6; color: white; padding: 12px 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000; font-family: -apple-system, sans-serif;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span>📱 Install WytNet App</span>
        <button id="install-btn" style="background: white; color: #3b82f6; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: 500;">Install</button>
        <button id="dismiss-btn" style="background: transparent; color: white; border: none; padding: 6px; cursor: pointer;">✕</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(installBanner);
  
  document.getElementById('install-btn')?.addEventListener('click', () => {
    installBanner.remove();
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      deferredPrompt = null;
    });
  });
  
  document.getElementById('dismiss-btn')?.addEventListener('click', () => {
    installBanner.remove();
  });
});

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
