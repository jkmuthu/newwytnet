// WytNet Service Worker for PWA functionality
const CACHE_NAME = 'wytnet-v1.0.0';
const STATIC_CACHE = 'wytnet-static-v1';
const DYNAMIC_CACHE = 'wytnet-dynamic-v1';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/wytnet-logo.png',
  // Add critical CSS and JS files when built
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  '/api/assessments/',
  '/api/realbro/',
  '/api/wytduty/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('WytNet SW: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('WytNet SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('WytNet SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cacheName = DYNAMIC_CACHE;
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for failed API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires an internet connection' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests with cache-first strategy
async function handleNavigationRequest(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // Fallback to cached index for SPA routing
    const cachedResponse = await caches.match('/');
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>WytNet - Offline</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, sans-serif; text-align: center; padding: 2rem; }
            .offline { color: #666; margin-top: 2rem; }
          </style>
        </head>
        <body>
          <h1>WytNet</h1>
          <div class="offline">
            <h2>You're offline</h2>
            <p>Please check your internet connection and try again.</p>
            <button onclick="location.reload()">Retry</button>
          </div>
        </body>
      </html>`,
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

// Handle static asset requests with cache-first strategy
async function handleStaticRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fallback to network
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder for failed static requests
    return new Response('Resource unavailable offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('WytNet SW: Background sync triggered:', event.tag);
  
  if (event.tag === 'assessment-submission') {
    event.waitUntil(syncAssessmentSubmissions());
  }
  
  if (event.tag === 'realbro-data') {
    event.waitUntil(syncRealbroData());
  }
  
  if (event.tag === 'wytduty-updates') {
    event.waitUntil(syncWytdutyUpdates());
  }
});

// Sync assessment submissions when back online
async function syncAssessmentSubmissions() {
  // Implementation for syncing offline assessment data
  console.log('WytNet SW: Syncing assessment submissions...');
}

// Sync RealBro data when back online
async function syncRealbroData() {
  // Implementation for syncing offline RealBro data
  console.log('WytNet SW: Syncing RealBro data...');
}

// Sync WytDuty updates when back online
async function syncWytdutyUpdates() {
  // Implementation for syncing offline WytDuty data
  console.log('WytNet SW: Syncing WytDuty updates...');
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('WytNet SW: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    vibrate: [200, 100, 200],
    tag: 'wytnet-notification',
    actions: [
      {
        action: 'open',
        title: 'Open WytNet'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('WytNet', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});