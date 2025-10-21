# Progressive Web App (PWA) Support

## Overview

WytNet includes full **Progressive Web App (PWA)** support, enabling users to install the platform as a native-like application on their devices. PWAs work offline, can send push notifications, sync data in the background, and provide a fast, app-like experience across all platforms.

**Key Benefits**:
- 📱 Install on home screen (iOS, Android, Desktop)
- ⚡ Lightning-fast loading with service worker caching
- 🔌 Offline functionality for critical features
- 🔔 Push notifications for real-time updates
- 🔄 Background sync for data persistence
- 🚀 App-like experience without app store

---

## What is a PWA?

A Progressive Web App is a website that uses modern web capabilities to deliver an app-like experience:

**Progressive**: Works for every user, regardless of browser
**Responsive**: Fits any form factor (desktop, mobile, tablet)
**Connectivity-independent**: Works offline or on low-quality networks
**App-like**: Feels like a native app with app-style interactions
**Fresh**: Always up-to-date thanks to service worker updates
**Safe**: Served via HTTPS to prevent snooping
**Discoverable**: Identifiable as an "application" via manifest
**Re-engageable**: Push notifications bring users back
**Installable**: Add to home screen without app store
**Linkable**: Share via URL, no install required

---

## Implementation

### Web App Manifest

The manifest file (`public/manifest.json`) defines how the app appears when installed:

```json
{
  "name": "WytNet - Get In. Get Done.",
  "short_name": "WytNet",
  "description": "All-in-one digital platform for better lifestyle and best workstyle",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["productivity", "business", "lifestyle"],
  "shortcuts": [
    {
      "name": "Engine Admin",
      "url": "/engine",
      "description": "Super Admin Dashboard"
    },
    {
      "name": "WytAI Agent",
      "url": "/engine?ai=open",
      "description": "AI Assistant"
    },
    {
      "name": "WytWall",
      "url": "/wytwall",
      "description": "Social Feed"
    }
  ]
}
```

### Service Worker

The service worker (`public/sw.js`) handles caching, offline functionality, and background sync:

**Caching Strategy**:
```javascript
// Cache-first for static assets
const CACHE_NAME = 'wytnet-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Background Sync**:
```javascript
// Sync data when connection returns
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  const pendingRequests = await getPendingRequests();
  
  for (const request of pendingRequests) {
    try {
      await fetch(request.url, request.options);
      await markRequestSynced(request.id);
    } catch (error) {
      // Will retry on next sync
    }
  }
}
```

**Push Notifications**:
```javascript
// Handle push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
```

### Service Worker Registration

In the main app (`client/src/main.tsx`):

```typescript
// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered:', registration);
        
        // Check for updates every hour
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000);
      })
      .catch((error) => {
        console.error('SW registration failed:', error);
      });
  });
}
```

---

## Features

### 1. Install Prompt

**Desktop (Chrome/Edge)**:
1. User visits WytNet
2. Browser shows "Install" button in address bar
3. Click to install
4. App opens in standalone window
5. Added to desktop/start menu

**Mobile (iOS)**:
1. Open Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Icon appears on home screen

**Mobile (Android)**:
1. Open Chrome
2. Browser shows "Add to Home Screen" banner
3. Tap to install
4. Icon appears in app drawer

### 2. Offline Functionality

**What Works Offline**:
- Static pages (home, about, features)
- Previously viewed content (cached)
- Form submissions (queued for sync)
- Basic navigation

**What Requires Connection**:
- Live data fetching
- Real-time updates
- Authentication
- File uploads

**Offline Indicator**:
```typescript
// Show offline banner
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
```

### 3. Background Sync

Queue actions for later when offline:

```typescript
// Queue form submission for sync
async function submitForm(data) {
  if (!navigator.onLine) {
    await queueForSync('submit-form', data);
    toast({ title: 'Saved offline. Will sync when online.' });
    return;
  }
  
  // Normal submission
  await fetch('/api/submit', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

// Register sync request
async function queueForSync(tag, data) {
  await saveToPendingQueue(tag, data);
  
  if ('sync' in navigator.serviceWorker) {
    await navigator.serviceWorker.ready;
    await navigator.serviceWorker.sync.register(tag);
  }
}
```

### 4. Push Notifications

**Server-Side** (send notification):
```typescript
import webpush from 'web-push';

// Configure VAPID keys
webpush.setVapidDetails(
  'mailto:admin@wytnet.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Send notification
app.post('/api/notifications/send', async (req, res) => {
  const { userId, title, body, url } = req.body;
  
  // Get user's push subscription
  const subscription = await getUserPushSubscription(userId);
  
  const payload = JSON.stringify({
    title,
    body,
    url,
    timestamp: Date.now()
  });
  
  await webpush.sendNotification(subscription, payload);
  
  res.json({ success: true });
});
```

**Client-Side** (subscribe):
```typescript
// Request notification permission
async function requestNotificationPermission() {
  const permission = await Notification.requestPermission();
  
  if (permission === 'granted') {
    await subscribeToPushNotifications();
  }
}

// Subscribe to push
async function subscribeToPushNotifications() {
  const registration = await navigator.serviceWorker.ready;
  
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  });
  
  // Save subscription to backend
  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription)
  });
}
```

### 5. App Shortcuts

Shortcuts appear when right-clicking the app icon (desktop) or long-pressing (mobile):

**Defined in manifest.json**:
```json
"shortcuts": [
  {
    "name": "Engine Admin",
    "short_name": "Admin",
    "description": "Access Super Admin Dashboard",
    "url": "/engine",
    "icons": [{ "src": "/icons/admin-96x96.png", "sizes": "96x96" }]
  },
  {
    "name": "New Post",
    "short_name": "Post",
    "description": "Create new WytWall post",
    "url": "/wytwall/create",
    "icons": [{ "src": "/icons/post-96x96.png", "sizes": "96x96" }]
  }
]
```

---

## Icon Requirements

PWA icons must meet specific requirements for each platform:

### Sizes Required

- **72x72**: Android legacy
- **96x96**: Android standard
- **128x128**: Chrome Web Store
- **144x144**: Windows tiles
- **152x152**: iOS (non-retina iPad)
- **192x192**: Android main icon
- **384x384**: Android splash screen
- **512x512**: Chrome splash screen, iOS (retina)

### Maskable Icons

Android supports "maskable" icons that adapt to different shapes (circle, square, rounded):

**Design Guidelines**:
- Keep logo within safe zone (80% of canvas)
- Use solid background color
- Test with [Maskable.app](https://maskable.app)

**Icon Purpose**:
```json
{
  "src": "/icons/icon-192x192.png",
  "sizes": "192x192",
  "type": "image/png",
  "purpose": "any maskable"  // Adapts to device mask
}
```

---

## Testing PWA Features

### Desktop (Chrome)

1. **Open DevTools** → Application tab
2. **Manifest**: Check manifest is loaded correctly
3. **Service Workers**: Verify SW is registered and running
4. **Cache Storage**: Inspect cached files
5. **Push Messaging**: Test push subscriptions

### Mobile (Chrome)

1. **Chrome DevTools** → Remote Devices
2. Connect mobile device via USB
3. Inspect app like desktop
4. Test install prompt and offline mode

### Lighthouse Audit

Run PWA audit:
```bash
# Command line
lighthouse https://wytnet.com --view --preset=pwa

# Or use Chrome DevTools → Lighthouse → Progressive Web App
```

**PWA Checklist**:
- ✅ Registers a service worker
- ✅ Responds with 200 when offline
- ✅ Has a web app manifest
- ✅ Uses HTTPS
- ✅ Redirects HTTP to HTTPS
- ✅ Configured for custom splash screen
- ✅ Sets an address bar theme color
- ✅ Content sized correctly for viewport
- ✅ Has a `<meta name="viewport">` tag
- ✅ Provides fallback content when JS unavailable

---

## Browser Support

### Full PWA Support

- ✅ Chrome (Desktop & Android)
- ✅ Edge (Desktop & Android)
- ✅ Samsung Internet
- ✅ Firefox (Desktop & Android)
- ✅ Safari (iOS 11.3+, macOS 14+)

### Partial Support

- ⚠️ Safari (iOS): No push notifications, limited background sync
- ⚠️ Firefox (Desktop): No install prompt (manual "Add to Home Screen")

### Graceful Degradation

The app works in all browsers, with enhanced features in PWA-capable browsers:

```typescript
// Check for PWA features
const hasPWA = {
  serviceWorker: 'serviceWorker' in navigator,
  pushNotifications: 'PushManager' in window,
  backgroundSync: 'sync' in navigator.serviceWorker || false,
  installPrompt: 'BeforeInstallPromptEvent' in window
};

// Conditionally enable features
if (hasPWA.pushNotifications) {
  showNotificationSettings();
}
```

---

## Performance Benefits

PWAs load **2-3x faster** than traditional web apps:

**First Load** (without cache):
- Traditional: 3-5 seconds
- PWA: 3-5 seconds (same)

**Repeat Visits** (with cache):
- Traditional: 2-3 seconds
- PWA: 0.5-1 second (instant!)

**Offline Load**:
- Traditional: Fails ❌
- PWA: Works ✅

---

## Security

### HTTPS Required

PWAs only work over HTTPS (or localhost for development):

**Why HTTPS**:
- Service Workers can intercept network requests (security risk without encryption)
- Push notifications require secure connection
- Prevents man-in-the-middle attacks

**Getting HTTPS**:
- Development: Use Replit (HTTPS by default)
- Production: Use Let's Encrypt (free SSL certificates)

### Content Security Policy

Restrict what the PWA can load:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self' data:;
  connect-src 'self' https://api.wytnet.com;
">
```

---

## Related Documentation

- [Frontend Architecture](/en/architecture/frontend)
- [Performance Optimization](/en/architecture/performance)
- [Deployment Guide](/en/deployment)

---

## Best Practices

### Icon Design

1. **Simple Logo**: Complex icons don't scale well to small sizes
2. **High Contrast**: Ensure visibility on light and dark backgrounds
3. **No Text**: Icons should be recognizable without text
4. **Square Canvas**: Use square icons, system will mask as needed

### Caching Strategy

1. **Cache Static**: CSS, JS, fonts (cache-first)
2. **Network First**: API calls, user data (network-first with cache fallback)
3. **Cache Then Update**: News feeds (cache-first, update in background)

### Offline UX

1. **Show Status**: Clearly indicate when offline
2. **Queue Actions**: Don't lose user work
3. **Sync Indicator**: Show when syncing happens
4. **Graceful Failures**: Explain what needs connection

---

## Troubleshooting

**Problem**: Install prompt doesn't appear

**Solution**: 
- Check HTTPS is enabled
- Ensure manifest is valid
- Service worker must be registered
- User hasn't dismissed prompt 3+ times

---

**Problem**: Service worker not updating

**Solution**: 
- Hard refresh (Ctrl+Shift+R)
- Unregister old SW in DevTools
- Increment CACHE_NAME version

---

**Problem**: Push notifications not working

**Solution**:
- Request notification permission first
- Check VAPID keys are correct
- Test in Chrome (best support)
- iOS Safari doesn't support push (yet)

---

## Environment Variables

```bash
# Push Notifications (VAPID keys)
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_CONTACT_EMAIL=admin@wytnet.com

# Service Worker
SW_CACHE_VERSION=v1
SW_CACHE_STRATEGY=cache-first  # or network-first
```

Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

---

## Future Enhancements

- **File System Access**: Save files directly to user's device
- **Periodic Background Sync**: Auto-sync even when app closed
- **Share Target**: Receive shared content from other apps
- **App Badging**: Show notification count on app icon
- **Screen Wake Lock**: Keep screen on during important tasks
